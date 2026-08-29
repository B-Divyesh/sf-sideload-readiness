# Demo sandbox

- Browser URL: `/demo` or `/?demo=1`.
- CLI command: `sideload-readiness demo`, or `sideload-readiness --demo`.
- Sample: one Android 15-like device with 2.8 GiB of free `/data` storage, a
  matched sample signer, and a recovery check marked `needs-review`. The fixture is
  `examples/sample-report.json`.
- Browser storage: only `demo:sideload-readiness`. Reset demo removes and
  recreates that key. Leaving `/demo` removes no real data because demo mode
  never reads it.
- CLI storage: the demo writes a Markdown report in a new system temporary
  directory and prints the exact path. It never invokes `adb`.
