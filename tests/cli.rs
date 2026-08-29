use std::{fs, path::PathBuf, process::Command};

const SIGNER_SHA256: &str = "bc5e64eab1c4b5137c0fbc5ed05850b3a148d1c41775cffa4d96eea90bdd0eb8";

fn decode_base64(input: &str) -> Vec<u8> {
    let mut output = Vec::new();
    let mut buffer = 0_u32;
    let mut bits = 0_u8;
    for byte in input.bytes().filter(|byte| !byte.is_ascii_whitespace()) {
        if byte == b'=' {
            break;
        }
        let value = match byte {
            b'A'..=b'Z' => byte - b'A',
            b'a'..=b'z' => byte - b'a' + 26,
            b'0'..=b'9' => byte - b'0' + 52,
            b'+' => 62,
            b'/' => 63,
            _ => panic!("fixture contains invalid base64"),
        };
        buffer = (buffer << 6) | u32::from(value);
        bits += 6;
        if bits >= 8 {
            bits -= 8;
            output.push((buffer >> bits) as u8);
            buffer &= (1 << bits) - 1;
        }
    }
    output
}

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
    run_mock_device_with_args(label, &[])
}

#[cfg(unix)]
fn run_mock_device_with_args(
    label: &str,
    extra_args: &[&str],
) -> (PathBuf, PathBuf, serde_json::Value) {
    run_mock_device_case(label, extra_args, false)
}

#[cfg(unix)]
fn run_mock_device_case(
    label: &str,
    extra_args: &[&str],
    invalid_apk: bool,
) -> (PathBuf, PathBuf, serde_json::Value) {
    run_mock_device_case_with_storage(label, extra_args, invalid_apk, "4000000")
}

#[cfg(unix)]
fn run_mock_device_case_with_storage(
    label: &str,
    extra_args: &[&str],
    invalid_apk: bool,
    free_kb: &str,
) -> (PathBuf, PathBuf, serde_json::Value) {
    use std::os::unix::fs::PermissionsExt;

    let adb_path = temporary_path(label, "sh");
    let log_path = temporary_path(label, "log");
    let apk_path = temporary_path(label, "apk");
    let output_path = temporary_path(label, "json");
    let fixture = include_str!("fixtures/aosp-v2-signed.apk.b64");
    fs::write(
        &apk_path,
        if invalid_apk {
            b"not an apk".to_vec()
        } else {
            decode_base64(fixture)
        },
    )
    .expect("APK fixture is written");
    fs::write(
        &adb_path,
        r#"#!/bin/sh
printf '%s\n' "$*" >> "$SIDELOAD_TEST_ADB_LOG"
case "$*" in
  devices) printf 'List of devices attached\nREAL-SERIAL-123\tdevice\n' ;;
  *ro.build.version.release) printf '15\n' ;;
  *sys.usb.config) printf 'mtp,adb\n' ;;
  *development_settings_enabled) printf '1\n' ;;
  *'df -k /data') printf 'Filesystem 1K-blocks Used Available Use%% Mounted on\n/data 8000000 4000000 %s 50%% /data\n' "$SIDELOAD_TEST_FREE_KB" ;;
  *'pm path com.example.approved') printf 'package:/data/app/~~fixture/com.example.approved/base.apk\n' ;;
  *'exec-out cat /data/app/~~fixture/com.example.approved/base.apk') command cat "$SIDELOAD_TEST_APK" ;;
  *'dumpsys package com.example.approved') command cat "$SIDELOAD_TEST_DUMPSYS" ;;
  *ro.build.ab_update) printf 'true\n' ;;
  *) printf '\n' ;;
esac
"#,
    )
    .expect("mock adb is written");
    let mut permissions = fs::metadata(&adb_path)
        .expect("mock adb metadata")
        .permissions();
    permissions.set_mode(0o755);
    fs::set_permissions(&adb_path, permissions).expect("mock adb is executable");
    let mut command = Command::new(env!("CARGO_BIN_EXE_sideload-readiness"));
    command
        .args(["check", "--adb"])
        .arg(&adb_path)
        .args(["--package", "com.example.approved"])
        .args(extra_args)
        .args(["--json", "--output"])
        .arg(&output_path)
        .env("SIDELOAD_TEST_ADB_LOG", &log_path)
        .env("SIDELOAD_TEST_APK", &apk_path)
        .env(
            "SIDELOAD_TEST_DUMPSYS",
            concat!(
                env!("CARGO_MANIFEST_DIR"),
                "/tests/fixtures/stock-package-signatures.txt"
            ),
        )
        .env("SIDELOAD_TEST_FREE_KB", free_kb);
    let result = command.output().expect("check command starts");
    assert!(
        result.status.success(),
        "{}",
        String::from_utf8_lossy(&result.stderr)
    );
    let report = fs::read_to_string(&output_path).expect("live report exists");
    let parsed = serde_json::from_str(&report).expect("live report is JSON");
    fs::remove_file(&output_path).expect("output can be removed");
    fs::remove_file(&apk_path).expect("APK fixture can be removed");
    (adb_path, log_path, parsed)
}

#[cfg(unix)]
#[test]
fn unreadable_installed_apk_is_never_reported_ready() {
    let (adb_path, log_path, report) = run_mock_device_case("signing-info-only", &[], true);
    let signer = report["findings"]
        .as_array()
        .expect("findings")
        .iter()
        .find(|finding| finding["id"] == "signer")
        .expect("signer finding");
    assert_eq!(signer["status"], "needs-review");
    assert!(signer["detail"]
        .as_str()
        .expect("signer detail")
        .contains("installed APK signing certificate could not be read"));
    fs::remove_file(adb_path).expect("mock adb can be removed");
    fs::remove_file(log_path).expect("mock log can be removed");
}

#[cfg(unix)]
#[test]
fn claim_signer_identity_is_extracted_and_compared() {
    let (adb_path, log_path, matched) =
        run_mock_device_with_args("claim-signer-match", &["--expected-signer", SIGNER_SHA256]);
    let signer = matched["findings"]
        .as_array()
        .expect("findings")
        .iter()
        .find(|finding| finding["id"] == "signer")
        .expect("signer finding");
    assert_eq!(signer["status"], "ready");
    assert!(signer["detail"]
        .as_str()
        .expect("signer detail")
        .contains("matches the expected approved signer"));
    assert!(signer["detail"]
        .as_str()
        .expect("signer detail")
        .contains("BC:5E:64:EA"));
    let commands = fs::read_to_string(&log_path).expect("adb calls were logged");
    assert!(commands.contains("shell pm path com.example.approved"));
    assert!(commands.contains("exec-out cat /data/app/~~fixture/com.example.approved/base.apk"));
    assert!(!commands.contains("dumpsys package"));
    fs::remove_file(adb_path).expect("mock adb can be removed");
    fs::remove_file(log_path).expect("mock log can be removed");

    let wrong = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    let (adb_path, log_path, mismatched) =
        run_mock_device_with_args("claim-signer-mismatch", &["--expected-signer", wrong]);
    let signer = mismatched["findings"]
        .as_array()
        .expect("findings")
        .iter()
        .find(|finding| finding["id"] == "signer")
        .expect("signer finding");
    assert_eq!(signer["status"], "blocked");
    assert!(signer["detail"]
        .as_str()
        .expect("signer detail")
        .contains("does not match expected"));
    fs::remove_file(adb_path).expect("mock adb can be removed");
    fs::remove_file(log_path).expect("mock log can be removed");
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
fn storage_below_the_floor_reports_the_exact_shortfall() {
    let (adb_path, log_path, report) =
        run_mock_device_case_with_storage("storage-boundary", &[], false, "1048575");
    let storage = report["findings"]
        .as_array()
        .expect("findings")
        .iter()
        .find(|finding| finding["id"] == "storage")
        .expect("storage finding");
    assert_eq!(storage["status"], "blocked");
    assert!(storage["detail"]
        .as_str()
        .expect("storage detail")
        .contains("1 KiB below the 1 GiB safety floor"));
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
    assert!(commands.contains("shell pm path"));
    assert!(commands.contains("exec-out cat"));
    for forbidden in [
        " install",
        " sideload",
        " reboot",
        " unlock",
        " settings put",
        " push ",
        " pull ",
    ] {
        assert!(
            !commands.contains(forbidden),
            "unexpected adb operation: {forbidden}"
        );
    }
    let help = Command::new(env!("CARGO_BIN_EXE_sideload-readiness"))
        .arg("--help")
        .output()
        .expect("help command starts");
    let help = String::from_utf8(help.stdout).expect("help is utf-8");
    for unavailable in ["  install", "  unlock", "  upload"] {
        assert!(
            !help.contains(unavailable),
            "unexpected public command: {unavailable}"
        );
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
    let mut permissions = fs::metadata(&adb_path)
        .expect("mock adb metadata")
        .permissions();
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

#[cfg(unix)]
#[test]
fn multiple_devices_require_an_explicit_redacted_selection() {
    use std::os::unix::fs::PermissionsExt;

    let adb_path = temporary_path("multiple-devices", "sh");
    let output_path = temporary_path("selected-device", "json");
    fs::write(
        &adb_path,
        r#"#!/bin/sh
case "$*" in
  devices) printf 'List of devices attached\nSERIAL-ONE\tdevice\nSERIAL-TWO\tdevice\n' ;;
  *ro.build.version.release) case "$*" in *SERIAL-TWO*) printf '14\n' ;; *) printf '15\n' ;; esac ;;
  *sys.usb.config) printf 'mtp,adb\n' ;;
  *development_settings_enabled) printf '1\n' ;;
  *'df -k /data') printf 'Filesystem 1K-blocks Used Available Use%% Mounted on\n/data 8000000 4000000 4000000 50%% /data\n' ;;
  *ro.build.ab_update) printf 'true\n' ;;
  *) printf '\n' ;;
esac
"#,
    )
    .expect("mock adb is written");
    let mut permissions = fs::metadata(&adb_path)
        .expect("mock adb metadata")
        .permissions();
    permissions.set_mode(0o755);
    fs::set_permissions(&adb_path, permissions).expect("mock adb is executable");

    let ambiguous = Command::new(env!("CARGO_BIN_EXE_sideload-readiness"))
        .args(["check", "--adb"])
        .arg(&adb_path)
        .output()
        .expect("ambiguous check starts");
    assert_eq!(ambiguous.status.code(), Some(2));
    let error = String::from_utf8(ambiguous.stderr).expect("error is utf-8");
    assert!(error.contains("2 authorized devices were found"));
    assert!(error.contains("--device SERIAL"));
    assert!(!error.contains("SERIAL-ONE"));
    assert!(!error.contains("SERIAL-TWO"));

    let selected = Command::new(env!("CARGO_BIN_EXE_sideload-readiness"))
        .args(["check", "--adb"])
        .arg(&adb_path)
        .args(["--device", "SERIAL-TWO", "--json", "--output"])
        .arg(&output_path)
        .output()
        .expect("selected check starts");
    assert!(selected.status.success());
    let report: serde_json::Value =
        serde_json::from_str(&fs::read_to_string(&output_path).expect("selected report exists"))
            .expect("selected report is JSON");
    assert_eq!(report["device"]["android"], "14");
    assert!(report["device"]["id"]
        .as_str()
        .expect("redacted id")
        .starts_with("device-"));
    assert!(!serde_json::to_string(&report)
        .expect("report serializes")
        .contains("SERIAL-TWO"));
    fs::remove_file(adb_path).expect("mock adb can be removed");
    fs::remove_file(output_path).expect("selected report can be removed");
}

#[test]
fn output_write_failures_include_a_recovery_action() {
    let missing_parent = temporary_path("missing-output-parent", "dir").join("report.json");
    let result = Command::new(env!("CARGO_BIN_EXE_sideload-readiness"))
        .args(["demo", "--json", "--output"])
        .arg(&missing_parent)
        .output()
        .expect("demo command starts");
    assert_eq!(result.status.code(), Some(2));
    let error = String::from_utf8(result.stderr).expect("error is utf-8");
    assert!(error.contains("Could not make a readiness report"));
    assert!(error.contains("Next step: choose an existing writable folder"));
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
