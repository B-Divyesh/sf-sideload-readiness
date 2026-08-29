# Demo sandbox

- Browser URL: `/?demo=1`; `/demo` is an equivalent direct route.
- CLI command: `sideload-readiness demo`, or `sideload-readiness --demo`.
- Sample: one Android 15-like device with 2.8 GiB of free `/data` storage, a
  matched sample signer, and a recovery check marked `needs-review`. The fixture is
  `examples/sample-report.json`.
- Browser storage: only `demo:sideload-readiness`. Reset demo removes and
  recreates that key. Leaving `/demo` discards the demo key and never reads or
  removes real data. Leaving `/?demo=1` has the same isolation boundary.
- Browser device access: the demo never requests WebUSB or Web Serial access.
  Production response headers also disable both APIs with Permissions Policy.
- CLI storage: the demo atomically creates one private, unpredictable Markdown
  report file in the system temporary directory and prints its exact path. It
  never invokes `adb` or reuses an existing temporary filename.
