# Sideload Readiness repair handoff

## Release decision

Ready for independent verification. This repair resolves every finding in
report commit `84d4b25fcd3f382b889e709fb61ce24ce032f5b9` against candidate
`e422e119b65e8f4aa0b41b938843ef1980550a77`. The researched brief, original
visual direction, `cli-installers` artifact class, and previously passing
behavior are unchanged.

## Repairs

- P0 installer: the POSIX parser now accepts GitHub's whitespace around
  `"tag_name": "v…"`. A process-level regression runs the published shell
  installer against realistic GitHub JSON and real checksum-protected Linux
  x86_64 and macOS arm64 tarballs in isolated homes.
- P1 release manifest: `scripts/create-release-manifest.mjs` validates the
  required release assets and writes absolute per-platform GitHub download
  URLs. The GitHub workflow uses that tested script and rejects a tag that
  differs from the Cargo version.
- P1 claims: `.factory/claims.json` now inventories 13 reliance claims. The
  JSON-report claim and related CLI claims invoke the public binary. Added
  exact process/browser coverage for redaction, the adb read-only allowlist,
  unauthorized devices, no-adb demo use, free single-device checks, isolated
  browser data, privacy, fleet review, license verification, installers, and
  the platform matrix.
- P3 caching: production JavaScript and CSS now have SHA-256-derived names and
  `public, max-age=31536000, immutable`. The service worker remains correctly
  `no-cache`, points at the fingerprinted shell, and uses an asset-derived
  cache version so updates replace old shells.
- Browser tests now run against the built `dist/site`, not source files. They
  also check production response headers, reduced motion, 200% text, desktop,
  390 px mobile, keyboard focus, axe, privacy, offline reload, and release
  behavior.

## Local verification — 2026-08-28

Run from `/work/repo`:

```sh
npm ci
npm test
npm run build
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo test
cargo build --release
cargo package --allow-dirty
```

Evidence:

- `npm ci`: six packages installed; zero audit findings.
- Node unit/release suite: 11 passed.
- Built-site Playwright suite: 31 passed across desktop Chromium and Pixel 5;
  one intentional skip is the desktop run of the mobile-only target test.
- Axe: zero serious or critical findings on `/`, `/demo`, `/privacy`, `/terms`,
  and the not-found route in both browser projects.
- Rust: three unit tests and eight public-CLI integration tests passed.
  Formatting and clippy with warnings denied passed.
- Every command in `.factory/claims.json` passed independently.
- YAML lint passed for the release workflow, nfpm, and all 0.1.1 winget
  manifests. `sh -n site/install.sh` passed.
- A fresh `cargo package --allow-dirty` verified 0.1.1. A fresh isolated
  `cargo install --path . --root <temp>` passed; help, demo JSON schema,
  redaction, missing-adb exit 2 with next step, and unwritable-output exit 2
  were verified.
- `/opt/fleet/lib/verify-url.sh` against the built site: HTTP 200, 561 ms,
  correct title/lang/main, one h1, no missing alt text, no unlabeled buttons,
  and no console errors.
- Built JavaScript is 15,746 bytes (5,608 gzip); CSS is 8,153 bytes (2,718
  gzip); the mobile hero is 69,354 bytes.
- Local Lighthouse: performance 100, accessibility 100, best practices 100,
  SEO 100; LCP 1.58 s; CLS 0.

## Release evidence

- Repair release: `v0.1.1` at
  `https://github.com/B-Divyesh/sf-sideload-readiness/releases/tag/v0.1.1`.
- GitHub Actions run `33194140006` succeeded for Linux x86_64, macOS arm64,
  macOS x64, Windows x64, and the final release job.
- Published assets include Linux tar/deb/rpm, both macOS tar/pkg variants,
  Windows zip, `SHA256SUMS`, and `latest.json`.
- Every `latest.json` platform value begins with the 0.1.1 GitHub release
  download URL. It no longer contains bare filenames.
- Downloaded Linux archive SHA-256
  `8ca68826ad662f4cc4b2e6d7f2a235e05a3f2cfb4c9be97a3ca152e5c602bb98`
  matches `SHA256SUMS`. Its binary reports 0.1.1 and emits valid redacted demo
  JSON.
- The live `curl -fsSL https://sideload-readiness.sociobot.in/install.sh | sh`
  flow completed in a clean temporary home, reported SHA-256 verification,
  and installed a binary reporting 0.1.1.
- Homebrew, Scoop, and winget metadata now contains the published 0.1.1 URLs
  and exact checksums.

## Deployment and live verification

- Static deployment `705d8050-3813-42a4-a75a-d97f58d33f33` succeeded in
  `centralus` via `/opt/fleet/lib/deploy-static.sh sideload-readiness dist/site`.
- Canonical production URL: `https://sideload-readiness.sociobot.in` (HTTP 200,
  managed TLS ready).
- `/`, `/demo`, `/privacy`, `/terms`, `/missing`, `/install.sh`, `/install.ps1`,
  `/service-worker.js`, `/robots.txt`, `/sitemap.xml`, and
  `/manifest.webmanifest` return HTTP 200.
- Live Playwright: the full desktop and 390 px mobile suite passed, including
  keyboard, axe, privacy, offline/update, response-policy, release-selection,
  reduced-motion, and 200% text checks.
- Live `/opt/fleet/lib/verify-url.sh`: HTTP 200, 872 ms, no console errors, and
  all structural accessibility checks passed.
- Local/live SHA-256 identity matched for `index.html`, both fingerprinted code
  assets, `service-worker.js`, `install.sh`, and `install.ps1`. The live app
  asset returns one-year immutable caching; the worker returns `no-cache`.
- Live Lighthouse: performance 100, accessibility 100, best practices 100,
  SEO 100; LCP 1.25 s; CLS 0; total transfer 142,009 bytes.
- The live Sociobot verification endpoint returned HTTP 200 with
  `{valid:false, reason:"invalid"}` for an invalid fixture and `no-store`.

## Operator action

- Publish the updated formula in `packaging/homebrew/sideload-readiness.rb` to
  `B-Divyesh/homebrew-sideload-readiness` and submit the 0.1.1 `winget/`
  manifests to `microsoft/winget-pkgs`.
- macOS and Windows packages remain intentionally unsigned. Signing requires
  owner-provided Apple and Windows certificates; no secrets are stored here.
- Android cannot expose complete recovery-sideload state while running. The
  CLI honestly marks it `needs-review` and points to device-maker guidance.
