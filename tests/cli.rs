use std::{fs, path::PathBuf, process::Command};

fn temporary_path(label: &str, extension: &str) -> PathBuf {
    std::env::temp_dir().join(format!(
        "sideload-readiness-{label}-{}-{}.{}",
        std::process::id(),
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("clock after epoch")
            .as_nanos(),
        extension
    ))
}

fn run_demo_json(label: &str) -> (PathBuf, serde_json::Value) {
    let output = temporary_path(label, "json");
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
    let parsed: serde_json::Value = serde_json::from_str(&report).expect("valid JSON report");
    (output, parsed)
}

#[test]
fn claim_demo_report_is_redacted_and_actionable() {
    let (output, parsed) = run_demo_json("claim-demo-report");
    assert_eq!(parsed["mode"], "demo");
    assert!(parsed["device"]["id"]
        .as_str()
        .unwrap()
        .starts_with("device-"));
    assert_eq!(parsed["findings"].as_array().unwrap().len(), 6);
    assert!(parsed["recovery_checklist"].as_array().unwrap().len() >= 4);
    fs::remove_file(output).expect("temporary report is removable");
}

#[test]
fn claim_demo_json_is_machine_readable() {
    let (output, parsed) = run_demo_json("claim-json-report");
    assert_eq!(parsed["schema"], "sideload-readiness/v1");
    assert!(parsed["score"].is_number());
    assert!(parsed["findings"].is_array());
    fs::remove_file(output).expect("temporary report is removable");
}

#[test]
fn claim_single_device_check_is_free() {
    let (output, parsed) = run_demo_json("claim-free-device");
    assert_eq!(parsed["mode"], "demo");
    assert_eq!(parsed["findings"].as_array().unwrap().len(), 6);
    fs::remove_file(output).expect("temporary report is removable");
}

#[test]
fn claim_demo_uses_no_adb_and_writes_a_temporary_report() {
    let result = Command::new(env!("CARGO_BIN_EXE_sideload-readiness"))
        .args(["demo", "--adb", "/definitely/not/an/adb/binary"])
        .output()
        .expect("demo command starts");
    assert!(result.status.success());
    let stdout = String::from_utf8(result.stdout).expect("demo output is utf-8");
    let path = stdout
        .strip_prefix("Wrote ")
        .expect("demo prints the report path")
        .trim();
    let report = fs::read_to_string(path).expect("temporary demo report exists");
    assert!(report.contains("# Sideload readiness report"));
    assert!(report.contains("Recovery checklist"));
    fs::remove_file(path).expect("temporary demo report is removable");
}

#[cfg(unix)]
fn run_mock_device(label: &str) -> (PathBuf, PathBuf, serde_json::Value) {
    use std::os::unix::fs::PermissionsExt;

    let adb_path = temporary_path(label, "sh");
    let log_path = temporary_path(label, "log");
    let output_path = temporary_path(label, "json");
    fs::write(
        &adb_path,
        r#"#!/bin/sh
printf '%s\n' "$*" >> "$SIDELOAD_TEST_ADB_LOG"
case "$*" in
  devices) printf 'List of devices attached\nREAL-SERIAL-123\tdevice\n' ;;
  *ro.build.version.release) printf '15\n' ;;
  *sys.usb.config) printf 'mtp,adb\n' ;;
  *development_settings_enabled) printf '1\n' ;;
  *'df -k /data') printf 'Filesystem 1K-blocks Used Available Use%% Mounted on\n/data 8000000 4000000 4000000 50%% /data\n' ;;
  *'dumpsys package com.example.approved') printf 'SigningInfo\n' ;;
  *ro.build.ab_update) printf 'true\n' ;;
  *) printf '\n' ;;
esac
"#,
    )
    .expect("mock adb is written");
    let mut permissions = fs::metadata(&adb_path).expect("mock adb metadata").permissions();
    permissions.set_mode(0o755);
    fs::set_permissions(&adb_path, permissions).expect("mock adb is executable");
    let result = Command::new(env!("CARGO_BIN_EXE_sideload-readiness"))
        .args(["check", "--adb"])
        .arg(&adb_path)
        .args(["--package", "com.example.approved", "--json", "--output"])
        .arg(&output_path)
        .env("SIDELOAD_TEST_ADB_LOG", &log_path)
        .output()
        .expect("check command starts");
    assert!(
        result.status.success(),
        "{}",
        String::from_utf8_lossy(&result.stderr)
    );
    let report = fs::read_to_string(&output_path).expect("live report exists");
    let parsed = serde_json::from_str(&report).expect("live report is JSON");
    fs::remove_file(&output_path).expect("output can be removed");
    (adb_path, log_path, parsed)
}

#[cfg(unix)]
#[test]
fn claim_exported_device_id_is_redacted() {
    let (adb_path, log_path, parsed) = run_mock_device("claim-redaction");
    let rendered = serde_json::to_string(&parsed).expect("report serializes");
    assert!(!rendered.contains("REAL-SERIAL-123"));
    assert!(parsed["device"]["id"]
        .as_str()
        .expect("redacted id")
        .starts_with("device-"));
    fs::remove_file(adb_path).expect("mock adb can be removed");
    fs::remove_file(log_path).expect("mock log can be removed");
}

#[cfg(unix)]
#[test]
fn claim_device_checks_are_read_only_and_non_mutating() {
    let (adb_path, log_path, _) = run_mock_device("claim-read-only");
    let commands = fs::read_to_string(&log_path).expect("adb calls were logged");
    assert!(commands.contains("devices"));
    assert!(commands.contains("shell getprop"));
    assert!(commands.contains("shell settings get"));
    assert!(commands.contains("shell df -k /data"));
    assert!(commands.contains("shell dumpsys package"));
    for forbidden in [" install", " sideload", " reboot", " unlock", " settings put", " push "] {
        assert!(!commands.contains(forbidden), "unexpected adb operation: {forbidden}");
    }
    let help = Command::new(env!("CARGO_BIN_EXE_sideload-readiness"))
        .arg("--help")
        .output()
        .expect("help command starts");
    let help = String::from_utf8(help.stdout).expect("help is utf-8");
    for unavailable in ["  install", "  unlock", "  upload"] {
        assert!(!help.contains(unavailable), "unexpected public command: {unavailable}");
    }
    fs::remove_file(adb_path).expect("mock adb can be removed");
    fs::remove_file(log_path).expect("mock log can be removed");
}

#[cfg(unix)]
#[test]
fn claim_unauthorized_devices_are_refused_with_a_next_step() {
    use std::os::unix::fs::PermissionsExt;

    let adb_path = temporary_path("claim-unauthorized", "sh");
    fs::write(
        &adb_path,
        "#!/bin/sh\nprintf 'List of devices attached\\nREAL-SERIAL-123\\tunauthorized\\n'\n",
    )
    .expect("mock adb is written");
    let mut permissions = fs::metadata(&adb_path).expect("mock adb metadata").permissions();
    permissions.set_mode(0o755);
    fs::set_permissions(&adb_path, permissions).expect("mock adb is executable");
    let result = Command::new(env!("CARGO_BIN_EXE_sideload-readiness"))
        .args(["check", "--adb"])
        .arg(&adb_path)
        .output()
        .expect("check command starts");
    assert_eq!(result.status.code(), Some(2));
    let stderr = String::from_utf8(result.stderr).expect("error is utf-8");
    assert!(stderr.contains("no authorized device was found"));
    assert!(stderr.contains("Next step:"));
    fs::remove_file(adb_path).expect("mock adb can be removed");
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
