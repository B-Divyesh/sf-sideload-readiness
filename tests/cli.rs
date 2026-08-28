use std::{fs, path::PathBuf, process::Command};

fn temp_path(label: &str) -> PathBuf {
    std::env::temp_dir().join(format!(
        "sideload-readiness-{label}-{}-{}",
        std::process::id(),
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("clock after epoch")
            .as_nanos()
    ))
}

fn run_demo_json(label: &str) -> (PathBuf, serde_json::Value) {
    let output = temp_path(label).with_extension("json");
    let result = Command::new(env!("CARGO_BIN_EXE_sideload-readiness"))
        .args(["demo", "--json", "--output"])
        .arg(&output)
        .output()
        .expect("demo command starts");
    assert!(
        result.status.success(),
        "{}",
        String::from_utf8_lossy(&result.stderr)
    );
    let report = fs::read_to_string(&output).expect("demo report exists");
    let parsed = serde_json::from_str(&report).expect("valid JSON report");
    (output, parsed)
}

#[cfg(unix)]
fn fake_adb() -> (PathBuf, PathBuf, PathBuf) {
    use std::os::unix::fs::PermissionsExt;
    let root = temp_path("fake-adb");
    fs::create_dir(&root).expect("fixture directory created");
    let adb = root.join("adb");
    let log = root.join("commands.log");
    let script = r#"#!/bin/sh
printf '%s\n' "$*" >> "$SIDELOAD_ADB_LOG"
case "$*" in
  "devices") printf 'List of devices attached\nREAL-SERIAL-123\tdevice\n' ;;
  *"getprop ro.build.version.release") printf '15\n' ;;
  *"getprop sys.usb.config") printf 'mtp,adb\n' ;;
  *"settings get global development_settings_enabled") printf '1\n' ;;
  *"df -k /data") printf 'Filesystem 1K-blocks Used Available Use%% Mounted on\n/data 4000000 500000 3500000 13%% /data\n' ;;
  *"dumpsys package com.example.approved") printf 'SigningInfo: fixture\n' ;;
  *"getprop ro.build.ab_update") printf 'true\n' ;;
  *"getprop ro.boot.slot_suffix") printf '_a\n' ;;
  *) printf '\n' ;;
esac
"#;
    fs::write(&adb, script).expect("fixture adb written");
    let mut permissions = fs::metadata(&adb).expect("fixture metadata").permissions();
    permissions.set_mode(0o755);
    fs::set_permissions(&adb, permissions).expect("fixture adb executable");
    (root, adb, log)
}

#[test]
fn claim_json_report_public_demo_command() {
    let (output, parsed) = run_demo_json("claim-json");
    assert_eq!(parsed["schema"], "sideload-readiness/v1");
    assert_eq!(parsed["mode"], "demo");
    assert_eq!(parsed["findings"].as_array().unwrap().len(), 6);
    fs::remove_file(output).expect("temporary report is removable");
}

#[test]
fn claim_demo_report_public_command() {
    let output = temp_path("claim-report").with_extension("md");
    let result = Command::new(env!("CARGO_BIN_EXE_sideload-readiness"))
        .args(["demo", "--output"])
        .arg(&output)
        .output()
        .expect("demo command starts");
    assert!(
        result.status.success(),
        "{}",
        String::from_utf8_lossy(&result.stderr)
    );
    let report = fs::read_to_string(&output).expect("demo report exists");
    assert!(report.contains("# Sideload readiness report"));
    assert!(report.contains("device-6f31a0b2"));
    assert!(report.contains("## Recovery checklist"));
    assert!(report.contains("Recovery update visibility | needs-review"));
    fs::remove_file(output).expect("temporary report is removable");
}

#[cfg(unix)]
#[test]
fn claim_redacted_id_public_check_command() {
    let (root, adb, log) = fake_adb();
    let result = Command::new(env!("CARGO_BIN_EXE_sideload-readiness"))
        .args([
            "check",
            "--json",
            "--package",
            "com.example.approved",
            "--adb",
        ])
        .arg(&adb)
        .env("SIDELOAD_ADB_LOG", &log)
        .output()
        .expect("check command starts");
    assert!(
        result.status.success(),
        "{}",
        String::from_utf8_lossy(&result.stderr)
    );
    let report = String::from_utf8(result.stdout).expect("report is utf-8");
    assert!(!report.contains("REAL-SERIAL-123"));
    let parsed: serde_json::Value = serde_json::from_str(&report).expect("valid JSON report");
    assert!(parsed["device"]["id"]
        .as_str()
        .unwrap()
        .starts_with("device-"));
    fs::remove_dir_all(root).expect("fixture removed");
}

#[cfg(unix)]
#[test]
fn claim_read_only_adb_public_check_command() {
    let (root, adb, log) = fake_adb();
    let result = Command::new(env!("CARGO_BIN_EXE_sideload-readiness"))
        .args(["check", "--package", "com.example.approved", "--adb"])
        .arg(&adb)
        .env("SIDELOAD_ADB_LOG", &log)
        .output()
        .expect("check command starts");
    assert!(
        result.status.success(),
        "{}",
        String::from_utf8_lossy(&result.stderr)
    );
    let calls = fs::read_to_string(&log).expect("adb calls recorded");
    for forbidden in [
        " install",
        " uninstall",
        " push",
        " sideload",
        " reboot",
        "settings put",
        " fastboot",
    ] {
        assert!(
            !calls.contains(forbidden),
            "unexpected mutating call: {calls}"
        );
    }
    assert!(calls.contains("devices"));
    assert!(calls.contains("shell getprop"));
    assert!(calls.contains("shell settings get"));
    assert!(calls.contains("shell df -k /data"));
    assert!(calls.contains("shell dumpsys package com.example.approved"));
    fs::remove_dir_all(root).expect("fixture removed");
}

#[cfg(unix)]
#[test]
fn claim_single_device_check_needs_no_license() {
    let (root, adb, log) = fake_adb();
    let result = Command::new(env!("CARGO_BIN_EXE_sideload-readiness"))
        .args(["check", "--adb"])
        .arg(&adb)
        .env("SIDELOAD_ADB_LOG", &log)
        .env_remove("SIDELOAD_READINESS_LICENSE")
        .output()
        .expect("check command starts");
    assert!(
        result.status.success(),
        "{}",
        String::from_utf8_lossy(&result.stderr)
    );
    assert!(String::from_utf8_lossy(&result.stdout).contains("Sideload readiness report"));
    fs::remove_dir_all(root).expect("fixture removed");
}

#[test]
fn help_names_the_read_only_job() {
    let result = Command::new(env!("CARGO_BIN_EXE_sideload-readiness"))
        .arg("--help")
        .output()
        .expect("help command starts");
    assert!(result.status.success());
    let stdout = String::from_utf8(result.stdout).expect("help is utf-8");
    assert!(stdout.contains("Read-only Android sideload readiness checks"));
    assert!(stdout.contains("--json"));
    assert!(stdout.contains("--demo"));
}
