# Sideload Readiness repair handoff

## Release decision

Ready for independent verification. Every finding in report commit
`84d4b25fcd3f382b889e709fb61ce24ce032f5b9` against candidate
`e422e119b65e8f4aa0b41b938843ef1980550a77` is repaired. Version `0.1.1`
is released and the static site is deployed. The brief, visual direction,
`cli-installers` class, and previously passing behavior remain unchanged.

## Repairs

- **P0 installer:** the POSIX parser now accepts GitHub's whitespace around
  `"tag_name": "v…"`. A process regression runs the real script against
  realistic GitHub JSON and checksum-protected Linux x64 and macOS arm64
  tarballs in isolated homes. The deployed script installs the real v0.1.1
  release successfully.
- **P1 release manifest:** `scripts/create-release-manifest.mjs` validates its
  required assets and writes absolute GitHub download URLs. The release
  workflow uses it and rejects tags that differ from the Cargo version.
- **P1 claims:** `.factory/claims.json` inventories 14 reliance claims. CLI
  claims invoke the public binary; browser claims use clean contexts. Coverage
  includes redaction, the adb read-only allowlist, unauthorized devices,
  no-adb demo use, free checks, demo privacy, fleet review, license
  verification, installers, platform packaging, and the manifest.
- **P3 caching:** production JavaScript and CSS have SHA-256-derived names and
  `public, max-age=31536000, immutable`. The stable worker uses `no-cache`,
  references the fingerprinted shell, and replaces old caches.
- Browser coverage now runs against built `dist/site` output. It checks
  response headers, reduced motion, 200% text, desktop, 390 px mobile,
  keyboard focus, axe, privacy, offline/update, and release behavior.

## Clean local verification — 2026-08-28

```sh
npm ci
npm test
npm run build
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo test
cargo build --release
cargo package --allow-dirty
npx --yes yaml-lint .github/workflows/release.yml winget/Sociobot.SideloadReadiness/0.1.1/*.yaml packaging/nfpm.yaml
sh -n site/install.sh
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
- Workflow, nfpm, and v0.1.1 winget YAML passed lint. Shell and JavaScript
  syntax checks passed.
- Fresh `cargo package --allow-dirty` and isolated `cargo install` passed.
  Help, JSON schema/redaction, missing-adb exit 2 with a next step, and
  unwritable-output exit 2 were verified.
- JavaScript: 15,746 bytes (5,608 gzip). CSS: 8,153 bytes (2,718 gzip).
  Mobile hero: 69,354 bytes.
- Exact local production build passed `verify-url.sh`: HTTP 200, 548 ms load,
  correct title/lang/main, one h1, complete alt text, labeled buttons, and no
  console errors.
- Local Lighthouse: 100 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1.586 s; CLS 0.

## Release evidence

- Release: <https://github.com/B-Divyesh/sf-sideload-readiness/releases/tag/v0.1.1>.
- GitHub Actions run `33194140006` succeeded for Linux x64, macOS arm64,
  macOS x64, Windows x64, and the release job.
- Assets include Linux tar/deb/rpm, both macOS tar/pkg variants, Windows zip,
  `SHA256SUMS`, and `latest.json`. Every manifest platform entry is an
  absolute v0.1.1 asset URL.
- All eight packages matched `SHA256SUMS`. Key values: Linux tar
  `8ca68826ad662f4cc4b2e6d7f2a235e05a3f2cfb4c9be97a3ca152e5c602bb98`;
  macOS arm64 tar
  `e999964dbe1f06631c341091ad215bdffb907e98d634d9095783babdf32f2fe8`;
  macOS x64 tar
  `c9b8e7bcaca39c3e8b0c4877d5872526e18ba98855be24c574ff4fb089730bf2`;
  Windows zip
  `c01caee6006897c1296d52f44698a8affc8234ad91260eee91c7446ea96769ee`.
- The downloaded Linux binary reports 0.1.1 and emits valid, redacted,
  six-finding JSON. The live one-line installer verified SHA-256 and installed
  that binary in a clean temporary home.
- Homebrew, Scoop, and winget metadata uses the published v0.1.1 URLs and
  exact checksums.

## Deployment and live verification

- `/opt/fleet/lib/deploy-static.sh sideload-readiness dist/site` completed as
  Azure deployment `90432c9b-b7b8-455e-a72f-3b5dac9dc871` in `centralus`.
- <https://sideload-readiness.sociobot.in> returns HTTP 200 with managed TLS.
  `/`, `/demo`, `/privacy`, `/terms`, `/missing`, both installer scripts, the
  worker, robots, sitemap, manifest, and both hashed assets return 200.
- Local/live SHA-256 matches for HTML, both code assets, the worker, and
  `install.sh`. The assets return one-year immutable caching; the worker is
  `no-cache`. CSP, HSTS, nosniff, referrer, and permissions headers are live.
- Live `verify-url.sh`: 866 ms, correct title/lang/main, one h1, complete alt
  text, labeled buttons, and no console errors.
- Live desktop and 390 px checks passed all five routes with zero
  serious/critical axe findings. Keyboard focus, reduced motion, 200% text,
  overflow, 44 px targets, same-origin demo traffic, service-worker control,
  and offline reload passed without console errors.
- Live Lighthouse: 100 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1.262 s; CLS 0; 80,531 bytes transferred.
- Invalid live license verification returned HTTP 200 with the documented
  invalid verdict and origin-specific CORS. No valid key or paid spend was
  used.

## Operator action

- The Sociobot checkout route currently returns `404 enabled factory product`.
  Product registration is billing infrastructure outside this repository;
  enable `sideload-readiness` before accepting purchases. License restore and
  verification remain functional and tested.
- Publish the updated Homebrew formula to
  `B-Divyesh/homebrew-sideload-readiness` and submit the v0.1.1 winget
  manifests to `microsoft/winget-pkgs`.
- macOS and Windows packages remain intentionally unsigned. Signing needs
  owner-provided certificates; no secrets are stored here.
- Android cannot expose complete recovery-sideload state while running. The
  CLI marks it `needs-review` and points to device-maker guidance.
