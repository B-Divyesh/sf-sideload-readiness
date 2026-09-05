# Sideload Readiness

Check Android update safety before you update an approved sideloaded app.

Sideload Readiness is for Android power users and small IT teams. It runs
read-only `adb` checks, writes a redacted report, and gives a recovery
checklist. It never installs an APK, changes Android settings, unlocks a
bootloader, or bypasses a device policy.

The one-click browser demo is at [sideload-readiness.sociobot.in/?demo=1](https://sideload-readiness.sociobot.in/?demo=1).
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

The shell installer writes to `~/.local/bin` and adds that directory to your
startup profile. A `curl | sh` command cannot change its parent terminal, so
run the exact `export PATH=…` line it prints before your first command. New
terminals find `sideload-readiness` automatically. The PowerShell installer
adds the directory to the current session and your user PATH. Every current
release payload and manifest has a valid GitHub OIDC Sigstore bundle. Verify a
downloaded asset with:

The shell installer supports Linux x86_64 and macOS arm64 and x86_64. It stops
before a download on Linux ARM64 because no release asset is published.

```sh
cosign verify-blob --bundle sideload-readiness-linux-x86_64.tar.gz.sigstore.json \
  --certificate-identity-regexp '^https://github.com/B-Divyesh/sf-sideload-readiness/.github/workflows/(release|sign-release)\.yml@' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  sideload-readiness-linux-x86_64.tar.gz
```

The macOS package and Windows app are unsigned. Verify their Sigstore bundles
before installation. On macOS, right-click the package and choose Open.

Install with the published Homebrew tap:

```sh
brew install B-Divyesh/sideload-readiness/sideload-readiness
```

Install with the published Scoop bucket:

```powershell
scoop bucket add sideload-readiness https://github.com/B-Divyesh/scoop-sideload-readiness
scoop install sideload-readiness
```

The `winget/` folder contains a checksum-pinned manifest for the published
Windows archive. The owner must submit it to `microsoft/winget-pkgs` before
advertising a winget command.

## Run a device readiness check

Connect one device and accept Android's USB debugging prompt. If adb lists
several authorized devices, the command stops until you pass `--device SERIAL`.

Get the expected signer SHA-256 from your approved APK:

```sh
apksigner verify --print-certs approved.apk
```

Compare that digest with the installed package:

```sh
sideload-readiness check --package com.example.approved \
  --expected-signer 9A:25:70:5E:39:1F:B9:27:65:55:CA:AD:4F:45:42:8E:F1:BC:8A:C4:AC:65:AA:36:7A:76:FC:64:BB:43:CC:4D \
  --output readiness.md
```

The command reads the installed base APK through adb and parses its signing
certificate locally. A matching digest is `ready`, and a mismatch is `blocked`.
If the package or certificate cannot be read, the result is `needs-review`.

Use JSON in scripts:

```sh
sideload-readiness check --package com.example.approved \
  --expected-signer 9A25705E391FB9276555CAAD4F45428EF1BC8AC4AC65AA367A76FC64BB43CC4D \
  --json --output readiness.json
```

Try the bundled sample without `adb`:

```sh
sideload-readiness demo
# or: sideload-readiness --demo
```

The sample creates one private, unpredictable temporary report file and prints
its path. It never reuses an existing temporary filename. `--output PATH` is
different: it writes the requested path and replaces that file when it already
exists. `examples/sample-report.json` documents the stable schema and values.

The report checks:

- Authorized USB debugging and USB data mode.
- Developer options visibility.
- Free `/data` storage against a 1 GiB safety floor.
- Installed signer SHA-256 comparison when a package and expected signer are supplied.
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

`npm run build:site` creates the deployable static site in `dist/site`. The
factory deploys that directory; this repository does not manage DNS or cloud
infrastructure.

`npm run build` is an alias for the deploy build. Release installers are built
only in GitHub Actions by `.github/workflows/release.yml`.
`npm test` includes desktop and 390 px mobile browser checks for keyboard use,
accessibility, offline reloads, privacy, and release-download behavior.

## Privacy and license

The CLI has no report-upload command. A regular check writes a file only with
`--output PATH`. A demo without `--output` creates a private temporary file
and prints its path. Hardware serials are replaced with a redacted ID in
exported reports. The site has no analytics or third-party runtime scripts.
See [Privacy](https://sideload-readiness.sociobot.in/privacy) and
[Terms](https://sideload-readiness.sociobot.in/terms).

## License

[MIT](LICENSE)
