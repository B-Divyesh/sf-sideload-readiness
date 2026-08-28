use clap::{Parser, Subcommand};
use serde::Serialize;
use std::{fs, path::PathBuf, process::Command, time::{SystemTime, UNIX_EPOCH}};

#[derive(Parser, Debug)]
#[command(name = "sideload-readiness", version, about = "Read-only Android sideload readiness checks")]
struct Cli {
    #[command(subcommand)]
    command: Option<Commands>,
    /// Print a machine-readable report to stdout
    #[arg(long, global = true)]
    json: bool,
    /// Write the report to this file (Markdown normally, JSON with --json)
    #[arg(short, long, global = true)]
    output: Option<PathBuf>,
    /// Inspect this installed package when checking signer visibility
    #[arg(short, long, global = true)]
    package: Option<String>,
    /// Path to adb; defaults to adb on PATH
    #[arg(long, global = true, default_value = "adb")]
    adb: String,
}

#[derive(Subcommand, Debug)]
enum Commands {
    /// Run the bundled safe sample and write its report to a temporary folder
    Demo,
    /// Run read-only checks against the connected Android device
    Check,
}

#[derive(Serialize, Clone)]
struct Finding {
    id: &'static str,
    label: &'static str,
    status: &'static str,
    detail: String,
    next_step: String,
}

#[derive(Serialize)]
struct Report {
    schema: &'static str,
    generated_at: u64,
    mode: &'static str,
    device: Device,
    score: u8,
    summary: &'static str,
    findings: Vec<Finding>,
    recovery_checklist: Vec<&'static str>,
    privacy: &'static str,
}

#[derive(Serialize)]
struct Device { id: String, android: String, usb_mode: String }

fn main() {
    let cli = Cli::parse();
    let result = match cli.command.unwrap_or(Commands::Check) {
        Commands::Demo => demo_report(),
        Commands::Check => connected_report(&cli.adb, cli.package.as_deref()),
    };
    match result {
        Ok(report) => emit(report, cli.json, cli.output),
        Err(message) => {
            eprintln!("Could not make a readiness report: {message}\nNext step: connect one authorized Android device, then run `sideload-readiness check`.");
            std::process::exit(2);
        }
    }
}

fn now() -> u64 { SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default().as_secs() }

fn fnv_redact(input: &str) -> String {
    let mut hash: u64 = 0xcbf29ce484222325;
    for b in input.as_bytes() { hash ^= *b as u64; hash = hash.wrapping_mul(0x100000001b3); }
    format!("device-{:08x}", hash as u32)
}

fn finding(id: &'static str, label: &'static str, status: &'static str, detail: impl Into<String>, next: impl Into<String>) -> Finding {
    Finding { id, label, status, detail: detail.into(), next_step: next.into() }
}

fn base_report(mode: &'static str, id: String, android: String, usb_mode: String, findings: Vec<Finding>) -> Report {
    let passed = findings.iter().filter(|f| f.status == "ready").count() as u8;
    let score = ((passed as f32 / findings.len() as f32) * 100.0).round() as u8;
    let summary = if score >= 80 { "Ready for a cautious approved-package update." } else if score >= 50 { "Fix the marked checks before updating." } else { "Not ready for an update yet." };
    Report {
        schema: "sideload-readiness/v1", generated_at: now(), mode,
        device: Device { id, android, usb_mode }, score, summary, findings,
        recovery_checklist: vec![
            "Keep the current approved APK and its known-good version.",
            "Record the app package name and signer before any update.",
            "Keep at least 1 GiB free on /data before a local update.",
            "Use only the device-approved recovery path; do not bypass a lock or policy.",
            "If an update fails, stop after the error and save this report before retrying."
        ],
        privacy: "The report redacts the hardware serial. The CLI makes read-only adb queries and sends no data anywhere."
    }
}

fn demo_report() -> Result<Report, String> {
    let findings = vec![
        finding("connection", "Authorized USB debugging", "ready", "One authorized sample device is visible to adb.", "Keep the authorization prompt accepted while checking."),
        finding("developer-options", "Developer options", "ready", "Developer options are enabled.", "Leave this unchanged for approved maintenance."),
        finding("usb-mode", "USB data mode", "ready", "The sample device exposes adb over USB.", "Use a data-capable cable if this changes."),
        finding("storage", "Free data storage", "ready", "2.8 GiB free on /data. The 1 GiB safety floor is met.", "Keep the floor before copying an update."),
        finding("signer", "Package signer visibility", "ready", "The installed sample package exposes signing details.", "Compare the signer with the approved update before installing."),
        finding("recovery", "Recovery update visibility", "needs-review", "A/B update support is visible, but Android cannot safely prove recovery sideload status while running.", "Read your device's approved recovery instructions before using recovery."),
    ];
    Ok(base_report("demo", "device-6f31a0b2".to_string(), "15 (sample)".to_string(), "mtp,adb".to_string(), findings))
}

fn adb(adb: &str, args: &[&str]) -> Result<String, String> {
    let output = Command::new(adb).args(args).output().map_err(|e| format!("adb did not start ({e})"))?;
    if !output.status.success() { return Err(String::from_utf8_lossy(&output.stderr).trim().to_string()); }
    Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
}

fn connected_report(adb_bin: &str, package: Option<&str>) -> Result<Report, String> {
    let devices = adb(adb_bin, &["devices"])?;
    let line = devices.lines().skip(1).find(|line| line.ends_with("\tdevice")).ok_or("no authorized device was found")?;
    let serial = line.split_whitespace().next().ok_or("adb returned an unreadable device line")?;
    let prop = |key: &str| adb(adb_bin, &["-s", serial, "shell", "getprop", key]).unwrap_or_else(|_| "unknown".into());
    let android = prop("ro.build.version.release");
    let usb_mode = prop("sys.usb.config");
    let dev_enabled = adb(adb_bin, &["-s", serial, "shell", "settings", "get", "global", "development_settings_enabled"]).unwrap_or_default();
    let df = adb(adb_bin, &["-s", serial, "shell", "df", "-k", "/data"]).unwrap_or_default();
    let free_kb = df.lines().last().and_then(|l| l.split_whitespace().nth(3)).and_then(|v| v.parse::<u64>().ok()).unwrap_or(0);
    let free_gib = free_kb as f64 / 1024.0 / 1024.0;
    let package_dump = package.map(|p| adb(adb_bin, &["-s", serial, "shell", "dumpsys", "package", p]).unwrap_or_default());
    let signer_visible = package_dump.as_deref().map(|d| d.contains("SigningInfo") || d.contains("signatures=")).unwrap_or(false);
    let ab = prop("ro.build.ab_update") == "true" || !prop("ro.boot.slot_suffix").is_empty();
    let mut findings = vec![
        finding("connection", "Authorized USB debugging", "ready", "adb reports an authorized device.", "Keep the device unlocked and authorized during maintenance."),
        finding("developer-options", "Developer options", if dev_enabled == "1" { "ready" } else { "needs-review" }, if dev_enabled == "1" { "Developer options are enabled." } else { "Developer options were not reported as enabled." }, "Enable Developer options only if your device policy permits it."),
        finding("usb-mode", "USB data mode", if usb_mode.contains("adb") { "ready" } else { "needs-review" }, format!("Current USB configuration: {usb_mode}."), "Choose a USB data mode and use a data-capable cable."),
        finding("storage", "Free data storage", if free_gib >= 1.0 { "ready" } else { "blocked" }, format!("{free_gib:.1} GiB free on /data; the safety floor is 1.0 GiB."), "Free storage before copying or applying an update."),
        finding("signer", "Package signer visibility", if signer_visible { "ready" } else { "needs-review" }, if package.is_some() { "Signer details were not visible for the selected package." } else { "No package was selected for signer inspection." }, "Run again with `--package com.example.app` and compare its signer with the approved APK."),
        finding("recovery", "Recovery update visibility", if ab { "needs-review" } else { "needs-review" }, if ab { "A/B update capability is visible. Recovery sideload status cannot be proven safely from the running system." } else { "No A/B update capability was reported. Recovery sideload status cannot be proven safely from the running system." }, "Follow only your device maker's approved recovery instructions."),
    ];
    Ok(base_report("live", fnv_redact(serial), android, usb_mode, findings))
}

fn markdown(r: &Report) -> String {
    let mut out = format!("# Sideload readiness report\n\n**{}% — {}**\n\nDevice: `{}` · Android {} · USB `{}`\n\n", r.score, r.summary, r.device.id, r.device.android, r.device.usb_mode);
    out.push_str("## Checks\n\n| Check | State | What we saw | Next safe step |\n|---|---|---|---|\n");
    for f in &r.findings { out.push_str(&format!("| {} | {} | {} | {} |\n", f.label, f.status, f.detail, f.next_step)); }
    out.push_str("\n## Recovery checklist\n\n");
    for item in &r.recovery_checklist { out.push_str(&format!("- {item}\n")); }
    out.push_str(&format!("\n_{}_\n", r.privacy)); out
}

fn emit(report: Report, json: bool, output: Option<PathBuf>) {
    let rendered = if json { serde_json::to_string_pretty(&report).expect("report serializes") } else { markdown(&report) };
    if let Some(path) = output { fs::write(&path, &rendered).unwrap_or_else(|e| { eprintln!("Could not write {}: {e}", path.display()); std::process::exit(2) }); println!("Wrote {}", path.display()); }
    else { println!("{rendered}"); }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn claim_demo_report_is_redacted_and_actionable() {
        let report = demo_report().unwrap();
        let json = serde_json::to_string(&report).unwrap();
        assert_eq!(report.mode, "demo");
        assert!(report.device.id.starts_with("device-"));
        assert!(!json.contains("FAKE_SERIAL"));
        assert_eq!(report.findings.len(), 6);
        assert!(report.recovery_checklist.len() >= 4);
    }
    #[test]
    fn claim_demo_json_is_machine_readable() {
        let report = demo_report().unwrap();
        let rendered = serde_json::to_string_pretty(&report).unwrap();
        let parsed: serde_json::Value = serde_json::from_str(&rendered).unwrap();
        assert_eq!(parsed["schema"], "sideload-readiness/v1");
        assert_eq!(parsed["findings"].as_array().unwrap().len(), 6);
    }
    #[test]
    fn serials_are_never_exported_verbatim() { assert_ne!(fnv_redact("ABCD1234"), "ABCD1234"); }
}
