# Sideload Readiness repair handoff

## Release decision

Ready for independent verification. This resolves every finding in report
commit `84d4b25fcd3f382b889e709fb61ce24ce032f5b9` against candidate
`e422e119b65e8f4aa0b41b938843ef1980550a77`. The brief, visual direction,
`cli-installers` class, and previously passing behavior remain unchanged.

## Repairs

- P0 installer: the POSIX parser accepts GitHub's whitespace around
  `"tag_name": "v…"`. A process regression runs the real script against
  realistic GitHub JSON and checksum-protected Linux x64 and macOS arm64
  tarballs in isolated homes.
- P1 release manifest: `scripts/create-release-manifest.mjs` validates required
  assets and writes absolute GitHub download URLs. The release workflow uses
  it and rejects a tag that differs from the Cargo version.
- P1 claims: `.factory/claims.json` inventories 14 reliance claims. CLI claims
  invoke the public binary; browser claims use clean contexts. Coverage now
  includes redaction, the adb read-only allowlist, unauthorized devices,
  no-adb demo use, free single-device checks, local demo/privacy, fleet review,
  license verification, installers, platform packaging, and the manifest.
- P3 caching: production JavaScript and CSS have SHA-256-derived names and
  `public, max-age=31536000, immutable`. The stable worker correctly uses
  `no-cache`, references the fingerprinted shell, and replaces old caches.
- Browser tests now use built `dist/site` output. They cover response headers,
  reduced motion, 200% text, desktop, 390 px mobile, keyboard focus, axe,
  privacy, offline reload/update, and release behavior.

## Local verification — 2026-08-28

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

- `npm ci`: six packages; zero audit findings.
- Node unit/release suite: 11 passed.
- Built-site Playwright: 33 passed across desktop Chromium and Pixel 5; one
  intentional skip is the desktop run of the mobile-only target test.
- Axe: zero serious/critical findings on `/`, `/demo`, `/privacy`, `/terms`,
  and the not-found route in both projects.
- Rust: three unit and eight public-CLI integration tests passed. Formatting,
  clippy with warnings denied, and the optimized build passed.
- All 14 `.factory/claims.json` commands passed independently.
- YAML lint passed for the workflow, nfpm, and 0.1.1 winget manifests.
  `sh -n site/install.sh` passed.
- Fresh `cargo package --allow-dirty` and isolated `cargo install` passed.
  Help, JSON schema/redaction, missing-adb exit 2 with a next step, and
  unwritable-output exit 2 were verified.
- Local URL verifier: HTTP 200, 561 ms, correct title/lang/main, one h1, no
  missing alt or unlabeled buttons, and no console errors.
- JavaScript: 15,746 bytes (5,608 gzip). CSS: 8,153 bytes (2,718 gzip).
  Mobile hero: 69,354 bytes.
- Local Lighthouse: 100 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1.58 s; CLS 0.

## Release evidence

- Release `v0.1.1`:
  `https://github.com/B-Divyesh/sf-sideload-readiness/releases/tag/v0.1.1`.
- GitHub Actions run `33194140006` succeeded for Linux x64, macOS arm64,
  macOS x64, Windows x64, and the release job.
- Assets include Linux tar/deb/rpm, both macOS tar/pkg variants, Windows zip,
  `SHA256SUMS`, and `latest.json`.
- Every `latest.json` platform entry is an absolute 0.1.1 asset URL.
- Linux tar SHA-256
  `8ca68826ad662f4cc4b2e6d7f2a235e05a3f2cfb4c9be97a3ca152e5c602bb98`
  matches the manifest. Its binary reports 0.1.1 and emits valid redacted JSON.
- All eight platform packages downloaded and passed `sha256sum --check`; the
  Windows zip and macOS tar contain their expected single binaries.
- The live `curl -fsSL https://sideload-readiness.sociobot.in/install.sh | sh`
  flow succeeded in a clean home, verified SHA-256, and installed 0.1.1.
- Homebrew, Scoop, and winget metadata contains the published 0.1.1 URLs and
  exact checksums.

## Deployment and live verification

- Static deployment `705d8050-3813-42a4-a75a-d97f58d33f33` succeeded in
  `centralus` using the work-order deployment script.
- `https://sideload-readiness.sociobot.in` returns HTTP 200 with managed TLS.
  `/`, `/demo`, `/privacy`, `/terms`, `/missing`, both installer scripts, the
  worker, robots, sitemap, and web manifest all return 200.
- Live Playwright: 33 passed across desktop and 390 px mobile; one intentional
  skip. Keyboard, axe, privacy, offline/update, response policy, release
  selection, reduced motion, and 200% text passed.
- Live URL verifier: HTTP 200, 872 ms, no console errors, and all structural
  accessibility checks passed.
- Local/live SHA-256 matched for HTML, both code assets, worker, and installers.
  The app asset returns one-year immutable caching; the worker is `no-cache`.
- Live Lighthouse: 100 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1.25 s; CLS 0; 142,009 bytes transferred.
- Invalid live license verification returned HTTP 200,
  `{valid:false, reason:"invalid"}`, and `Cache-Control: no-store`.

## Operator action

- Publish the updated Homebrew formula to
  `B-Divyesh/homebrew-sideload-readiness` and submit the 0.1.1 winget manifests
  to `microsoft/winget-pkgs`.
- macOS and Windows packages remain intentionally unsigned. Signing needs
  owner-provided certificates; no secrets are stored here.
- Android cannot expose complete recovery-sideload state while running. The
  CLI marks it `needs-review` and points to device-maker guidance.
