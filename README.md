# Sideload Readiness

Check Android update safety before you update an approved sideloaded app.

Sideload Readiness is for Android power users and small IT teams. It runs
read-only `adb` checks, writes a redacted report, and gives a recovery
checklist. It never installs an APK, changes Android settings, unlocks a
bootloader, or bypasses a device policy.

The browser demo is at [sideload-readiness.sociobot.in/demo](https://sideload-readiness.sociobot.in/demo).
It uses sample data in a separate browser key. Nothing in demo mode touches a
connected Android device.

## Install

Releases support Linux, macOS, and Windows. Each published archive has a
SHA-256 line in `SHA256SUMS`.

```sh
curl -fsSL https://sideload-readiness.sociobot.in/install.sh | sh
```

```powershell
irm https://sideload-readiness.sociobot.in/install.ps1 | iex
```

The installers download the matching release, verify its SHA-256 checksum,
then place the binary on your PATH. Windows and macOS packages are unsigned
until the operator supplies signing certificates. On macOS, use right-click
then Open if Gatekeeper asks.

The repository includes a Homebrew formula for the operator-managed tap:

```sh
brew install B-Divyesh/sideload-readiness/sideload-readiness
```

The repository also includes a Scoop manifest for the operator-managed bucket:

```powershell
scoop bucket add sideload-readiness https://github.com/B-Divyesh/sf-sideload-readiness
scoop install sideload-readiness
```

The `winget/` folder is ready for submission to `microsoft/winget-pkgs` after
the first release checksums are known.

## Use

Connect one device and accept Android's USB debugging prompt.

```sh
sideload-readiness check --package com.example.approved --output readiness.md
```

The optional package name asks Android for signer visibility. Compare that
signer with your approved update before you install it.

Use JSON in scripts:

```sh
sideload-readiness check --package com.example.approved --json --output readiness.json
```

Try the bundled sample without `adb`:

```sh
sideload-readiness demo
# or: sideload-readiness --demo
```

The sample writes its report to a new system temporary path and prints that
path. `examples/sample-report.json` documents its stable schema and values.

The report checks:

- Authorized USB debugging and USB data mode.
- Developer options visibility.
- Free `/data` storage against a 1 GiB safety floor.
- Package signer visibility when `--package` is supplied.
- A/B update hints and a recovery checklist.

Android does not expose a safe, complete recovery-sideload status while it is
running. The report labels that check `needs-review` and tells you to use the
device maker's approved recovery instructions.

## Fleet review

Single-device reports are free. Fleet review is a $39 one-time license. It
adds a local report queue and a package-status table on the site. Checkout and
license verification use Sociobot; no payment provider is embedded here.

## Develop and verify

Requirements: current Rust stable, Node 20+, and `adb` only for a live check.

```sh
cargo test
npm ci
npm test
npm run build:site   # creates dist/site with index.html at its root
npm run dev          # serves the source site on http://localhost:4173
```

`npm run build` is an alias for the deploy build. Release installers are built
only in GitHub Actions by `.github/workflows/release.yml`.
`npm test` includes desktop and 390 px mobile browser checks for keyboard use,
accessibility, offline reloads, privacy, and release-download behavior.

## Privacy and license

The CLI sends no device report to this project. It only runs local `adb`
commands and writes an output file when requested. Hardware serials are
replaced with a redacted ID in exported reports. The site has no analytics or
third-party runtime scripts. See [Privacy](https://sideload-readiness.sociobot.in/privacy)
and [Terms](https://sideload-readiness.sociobot.in/terms).

## License

[MIT](LICENSE)
