use apk_info_zip::{Signature, ZipEntry};
use clap::{Parser, Subcommand};
use serde::Serialize;
use std::{
    collections::HashSet,
    fs,
    path::PathBuf,
    process::Command,
    time::{SystemTime, UNIX_EPOCH},
};

#[derive(Parser, Debug)]
#[command(
    name = "sideload-readiness",
    version,
    about = "Read-only Android sideload readiness checks"
)]
struct Cli {
    #[command(subcommand)]
    command: Option<Commands>,
    /// Print a machine-readable report to stdout
    #[arg(long, global = true)]
    json: bool,
    /// Write the report to this file (Markdown normally, JSON with --json)
    #[arg(short, long, global = true)]
    output: Option<PathBuf>,
    /// Inspect this installed package when checking signer identity
    #[arg(short, long, global = true)]
    package: Option<String>,
    /// Expected SHA-256 signer certificate digest from the approved APK
    #[arg(long, global = true, requires = "package", value_parser = normalize_sha256)]
    expected_signer: Option<String>,
    /// Authorized adb device serial to check when more than one is connected
    #[arg(long, global = true)]
    device: Option<String>,
    /// Path to adb; defaults to adb on PATH
    #[arg(long, global = true, default_value = "adb")]
    adb: String,
    /// Run the bundled sample without connecting a device
    #[arg(long, global = true)]
    demo: bool,
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
struct Device {
    id: String,
    android: String,
    usb_mode: String,
}

#[derive(Debug)]
struct UserError {
    problem: String,
    next_step: String,
}

impl UserError {
    fn new(problem: impl Into<String>, next_step: impl Into<String>) -> Self {
        Self {
            problem: problem.into(),
            next_step: next_step.into(),
        }
    }
}

fn main() {
    let cli = Cli::parse();
    let run_demo = cli.demo || matches!(cli.command, Some(Commands::Demo));
    let result = if run_demo {
        demo_report()
    } else {
        connected_report(
            &cli.adb,
            cli.package.as_deref(),
            cli.expected_signer.as_deref(),
            cli.device.as_deref(),
        )
    };
    let output = if run_demo && cli.output.is_none() {
        let extension = if cli.json { "json" } else { "md" };
        Some(std::env::temp_dir().join(format!("sideload-readiness-demo-{}.{}", now(), extension)))
    } else {
        cli.output
    };
    if let Err(error) = result.and_then(|report| emit(report, cli.json, output)) {
        eprintln!(
            "Could not make a readiness report: {}\nNext step: {}",
            error.problem, error.next_step
        );
        std::process::exit(2);
    }
}

fn now() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}

fn fnv_redact(input: &str) -> String {
    let mut hash: u64 = 0xcbf29ce484222325;
    for b in input.as_bytes() {
        hash ^= *b as u64;
        hash = hash.wrapping_mul(0x100000001b3);
    }
    format!("device-{:08x}", hash as u32)
}

fn normalize_sha256(value: &str) -> Result<String, String> {
    let normalized: String = value
        .chars()
        .filter(|character| !matches!(character, ':' | '-'))
        .collect::<String>()
        .to_ascii_lowercase();
    if normalized.len() != 64
        || !normalized
            .chars()
            .all(|character| character.is_ascii_hexdigit())
    {
        return Err("use a 64-digit SHA-256 signer digest; colons or dashes are allowed".into());
    }
    Ok(normalized)
}

fn display_sha256(value: &str) -> String {
    value
        .as_bytes()
        .chunks(2)
        .map(|pair| String::from_utf8_lossy(pair).to_ascii_uppercase())
        .collect::<Vec<_>>()
        .join(":")
}

fn signer_certificates(signature: Signature) -> Option<(u8, Vec<String>)> {
    let (priority, certificates) = match signature {
        Signature::V31(certificates) => (4, certificates),
        Signature::V3(certificates) => (3, certificates),
        Signature::V2(certificates) => (2, certificates),
        Signature::V1(certificates) => (1, certificates),
        _ => return None,
    };
    Some((
        priority,
        certificates
            .into_iter()
            .map(|certificate| certificate.sha256_fingerprint.to_ascii_lowercase())
            .collect(),
    ))
}

fn extract_signer_sha256(apk: Vec<u8>) -> Result<String, String> {
    let archive = ZipEntry::new(apk).map_err(|_| "the installed file is not a readable APK")?;
    let mut schemes = archive
        .get_signatures_other()
        .map_err(|_| "the APK signing block could not be read")?
        .into_iter()
        .filter_map(signer_certificates)
        .collect::<Vec<_>>();
    if let Ok(signature) = archive.get_signature_v1() {
        if let Some(scheme) = signer_certificates(signature) {
            schemes.push(scheme);
        }
    }
    let highest = schemes.iter().map(|(priority, _)| *priority).max();
    let digests = schemes
        .into_iter()
        .filter(|(priority, _)| Some(*priority) == highest)
        .flat_map(|(_, digests)| digests)
        .collect::<HashSet<_>>();
    if digests.len() != 1 {
        return Err(if digests.is_empty() {
            "the installed APK has no readable signing certificate".into()
        } else {
            "the installed APK has more than one signing certificate".into()
        });
    }
    Ok(digests
        .into_iter()
        .next()
        .expect("one signer digest exists"))
}

fn finding(
    id: &'static str,
    label: &'static str,
    status: &'static str,
    detail: impl Into<String>,
    next: impl Into<String>,
) -> Finding {
    Finding {
        id,
        label,
        status,
        detail: detail.into(),
        next_step: next.into(),
    }
}

fn base_report(
    mode: &'static str,
    id: String,
    android: String,
    usb_mode: String,
    findings: Vec<Finding>,
) -> Report {
    let passed = findings.iter().filter(|f| f.status == "ready").count() as u8;
    let score = ((passed as f32 / findings.len() as f32) * 100.0).round() as u8;
    let summary = if score >= 80 {
        "Ready for a cautious approved-package update."
    } else if score >= 50 {
        "Fix the marked checks before updating."
    } else {
        "Not ready for an update yet."
    };
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

fn demo_report() -> Result<Report, UserError> {
    let findings = vec![
        finding("connection", "Authorized USB debugging", "ready", "One authorized sample device is visible to adb.", "Keep the authorization prompt accepted while checking."),
        finding("developer-options", "Developer options", "ready", "Developer options are enabled.", "Leave this unchanged for approved maintenance."),
        finding("usb-mode", "USB data mode", "ready", "The sample device exposes adb over USB.", "Use a data-capable cable if this changes."),
        finding("storage", "Free data storage", "ready", "2.8 GiB free on /data. The 1 GiB safety floor is met.", "Keep the floor before copying an update."),
        finding("signer", "Package signer match", "ready", "The installed sample signer SHA-256 matches the expected approved signer.", "Keep the approved APK and signer digest with this report."),
        finding("recovery", "Recovery update visibility", "needs-review", "A/B update support is visible, but Android cannot safely prove recovery sideload status while running.", "Read your device's approved recovery instructions before using recovery."),
    ];
    Ok(base_report(
        "demo",
        "device-6f31a0b2".to_string(),
        "15 (sample)".to_string(),
        "mtp,adb".to_string(),
        findings,
    ))
}

fn adb_bytes(adb: &str, args: &[&str]) -> Result<Vec<u8>, String> {
    let output = Command::new(adb)
        .args(args)
        .output()
        .map_err(|e| format!("adb did not start ({e})"))?;
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).trim().to_string());
    }
    Ok(output.stdout)
}

fn adb(adb: &str, args: &[&str]) -> Result<String, String> {
    adb_bytes(adb, args).map(|output| String::from_utf8_lossy(&output).trim().to_string())
}

fn installed_signer_sha256(adb_bin: &str, serial: &str, package: &str) -> Result<String, String> {
    let paths = adb(adb_bin, &["-s", serial, "shell", "pm", "path", package])?;
    let apk_path = paths
        .lines()
        .filter_map(|line| line.trim().strip_prefix("package:"))
        .find(|path| path.ends_with("/base.apk"))
        .or_else(|| {
            paths
                .lines()
                .filter_map(|line| line.trim().strip_prefix("package:"))
                .next()
        })
        .ok_or_else(|| "Android did not return an installed APK path".to_string())?;
    let apk = adb_bytes(adb_bin, &["-s", serial, "exec-out", "cat", apk_path])?;
    extract_signer_sha256(apk)
}

fn connected_report(
    adb_bin: &str,
    package: Option<&str>,
    expected_signer: Option<&str>,
    selected_device: Option<&str>,
) -> Result<Report, UserError> {
    let devices = adb(adb_bin, &["devices"]).map_err(|message| {
        UserError::new(
            message,
            "install Android platform-tools, connect one device, and accept its USB debugging prompt.",
        )
    })?;
    let authorized: Vec<&str> = devices
        .lines()
        .skip(1)
        .filter_map(|line| {
            let mut fields = line.split_whitespace();
            let serial = fields.next()?;
            (fields.next() == Some("device")).then_some(serial)
        })
        .collect();
    let serial = match (selected_device, authorized.as_slice()) {
        (Some(selected), _) if authorized.contains(&selected) => selected,
        (Some(_), _) => {
            return Err(UserError::new(
                "the selected device is not authorized",
                "run `adb devices`, authorize the intended device, then pass its serial with `--device SERIAL`.",
            ))
        }
        (None, [serial]) => *serial,
        (None, []) => {
            return Err(UserError::new(
                "no authorized device was found",
                "connect one Android device, accept its USB debugging prompt, then run the check again.",
            ))
        }
        (None, many) => {
            return Err(UserError::new(
                format!("{} authorized devices were found", many.len()),
                "choose the intended device from `adb devices` and run again with `--device SERIAL`.",
            ))
        }
    };
    let prop = |key: &str| {
        adb(adb_bin, &["-s", serial, "shell", "getprop", key]).unwrap_or_else(|_| "unknown".into())
    };
    let android = prop("ro.build.version.release");
    let usb_mode = prop("sys.usb.config");
    let dev_enabled = adb(
        adb_bin,
        &[
            "-s",
            serial,
            "shell",
            "settings",
            "get",
            "global",
            "development_settings_enabled",
        ],
    )
    .unwrap_or_default();
    let df = adb(adb_bin, &["-s", serial, "shell", "df", "-k", "/data"]).unwrap_or_default();
    let free_kb = df
        .lines()
        .last()
        .and_then(|l| l.split_whitespace().nth(3))
        .and_then(|v| v.parse::<u64>().ok())
        .unwrap_or(0);
    let free_gib = free_kb as f64 / 1024.0 / 1024.0;
    let signer = package.and_then(|name| installed_signer_sha256(adb_bin, serial, name).ok());
    let (signer_status, signer_detail, signer_next_step): (&str, String, String) =
        match (package, signer, expected_signer) {
        (None, _, _) => (
            "needs-review",
            "No package was selected for signer comparison.".into(),
            "Run again with `--package com.example.app --expected-signer SHA256` using the approved APK digest.".into(),
        ),
        (Some(_), None, _) => (
            "needs-review",
            "The installed APK signing certificate could not be read for the selected package.".into(),
            "Confirm the package name, reconnect the authorized device, then run the check again.".into(),
        ),
        (Some(_), Some(actual), None) => (
            "needs-review",
            format!(
                "Installed signer SHA-256: {}. No expected signer was supplied.",
                display_sha256(&actual)
            ),
            "Run again with `--expected-signer SHA256` from the approved APK before updating.".into(),
        ),
        (Some(_), Some(actual), Some(expected)) if actual == expected => (
            "ready",
            format!(
                "Installed signer SHA-256 {} matches the expected approved signer.",
                display_sha256(&actual)
            ),
            "Keep the approved APK and signer digest with this report.".into(),
        ),
        (Some(_), Some(actual), Some(expected)) => (
            "blocked",
            format!(
                "Installed signer SHA-256 {} does not match expected {}.",
                display_sha256(&actual),
                display_sha256(expected)
            ),
            "Stop. Confirm the approved APK and package identity before any update.".into(),
        ),
        };
    let ab = prop("ro.build.ab_update") == "true" || !prop("ro.boot.slot_suffix").is_empty();
    let findings = vec![
        finding(
            "connection",
            "Authorized USB debugging",
            "ready",
            "adb reports an authorized device.",
            "Keep the device unlocked and authorized during maintenance.",
        ),
        finding(
            "developer-options",
            "Developer options",
            if dev_enabled == "1" {
                "ready"
            } else {
                "needs-review"
            },
            if dev_enabled == "1" {
                "Developer options are enabled."
            } else {
                "Developer options were not reported as enabled."
            },
            "Enable Developer options only if your device policy permits it.",
        ),
        finding(
            "usb-mode",
            "USB data mode",
            if usb_mode.contains("adb") {
                "ready"
            } else {
                "needs-review"
            },
            format!("Current USB configuration: {usb_mode}."),
            "Choose a USB data mode and use a data-capable cable.",
        ),
        finding(
            "storage",
            "Free data storage",
            if free_gib >= 1.0 { "ready" } else { "blocked" },
            if free_kb >= 1024 * 1024 {
                format!("{free_gib:.2} GiB free on /data; the 1 GiB safety floor is met.")
            } else {
                format!(
                    "{free_kb} KiB free on /data, {} KiB below the 1 GiB safety floor.",
                    1024 * 1024 - free_kb
                )
            },
            "Free storage before copying or applying an update.",
        ),
        finding(
            "signer",
            "Package signer match",
            signer_status,
            signer_detail,
            signer_next_step,
        ),
        finding(
            "recovery",
            "Recovery update visibility",
            "needs-review",
            if ab {
                "A/B update capability is visible. Recovery sideload status cannot be proven safely from the running system."
            } else {
                "No A/B update capability was reported. Recovery sideload status cannot be proven safely from the running system."
            },
            "Follow only your device maker's approved recovery instructions.",
        ),
    ];
    Ok(base_report(
        "live",
        fnv_redact(serial),
        android,
        usb_mode,
        findings,
    ))
}

fn markdown(r: &Report) -> String {
    let mut out = format!(
        "# Sideload readiness report\n\n**{}% — {}**\n\nDevice: `{}` · Android {} · USB `{}`\n\n",
        r.score, r.summary, r.device.id, r.device.android, r.device.usb_mode
    );
    out.push_str(
        "## Checks\n\n| Check | State | What we saw | Next safe step |\n|---|---|---|---|\n",
    );
    for f in &r.findings {
        out.push_str(&format!(
            "| {} | {} | {} | {} |\n",
            f.label, f.status, f.detail, f.next_step
        ));
    }
    out.push_str("\n## Recovery checklist\n\n");
    for item in &r.recovery_checklist {
        out.push_str(&format!("- {item}\n"));
    }
    out.push_str(&format!("\n_{}_\n", r.privacy));
    out
}

fn emit(report: Report, json: bool, output: Option<PathBuf>) -> Result<(), UserError> {
    let rendered = if json {
        serde_json::to_string_pretty(&report).expect("report serializes")
    } else {
        markdown(&report)
    };
    if let Some(path) = output {
        fs::write(&path, &rendered).map_err(|error| {
            UserError::new(
                format!("could not write {} ({error})", path.display()),
                "choose an existing writable folder with `--output`, then run the command again.",
            )
        })?;
        println!("Wrote {}", path.display());
    } else {
        println!("{rendered}");
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn demo_report_internal_shape_is_stable() {
        let report = demo_report().unwrap();
        let json = serde_json::to_string(&report).unwrap();
        assert_eq!(report.mode, "demo");
        assert!(report.device.id.starts_with("device-"));
        assert!(!json.contains("FAKE_SERIAL"));
        assert_eq!(report.findings.len(), 6);
        assert!(report.recovery_checklist.len() >= 4);
    }
    #[test]
    fn demo_report_internal_json_serializes() {
        let report = demo_report().unwrap();
        let rendered = serde_json::to_string_pretty(&report).unwrap();
        let parsed: serde_json::Value = serde_json::from_str(&rendered).unwrap();
        assert_eq!(parsed["schema"], "sideload-readiness/v1");
        assert_eq!(parsed["findings"].as_array().unwrap().len(), 6);
    }
    #[test]
    fn serial_redactor_changes_the_input() {
        assert_ne!(fnv_redact("ABCD1234"), "ABCD1234");
    }

    #[test]
    fn non_apk_bytes_do_not_produce_a_signer() {
        assert!(extract_signer_sha256(b"signatures=[9a25705e]".to_vec()).is_err());
    }
}
