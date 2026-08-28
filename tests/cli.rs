use std::{fs, process::Command};

#[test]
fn demo_command_writes_a_redacted_actionable_report() {
    let output = std::env::temp_dir().join(format!(
        "sideload-readiness-integration-{}-{}.json",
        std::process::id(),
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("clock after epoch")
            .as_nanos()
    ));
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
    assert_eq!(parsed["schema"], "sideload-readiness/v1");
    assert_eq!(parsed["mode"], "demo");
    assert!(parsed["device"]["id"]
        .as_str()
        .unwrap()
        .starts_with("device-"));
    assert!(parsed["recovery_checklist"].as_array().unwrap().len() >= 4);
    fs::remove_file(output).expect("temporary report is removable");
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
