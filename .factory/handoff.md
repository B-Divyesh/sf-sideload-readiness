# Sideload Readiness repair handoff

## Outcome

All four defects in independent verifier report commit
`84d4b25fcd3f382b889e709fb61ce24ce032f5b9` for candidate
`e422e119b65e8f4aa0b41b938843ef1980550a77` are repaired. Version `0.1.1`
is released, the static site is deployed, and the live installer completes
against GitHub's real release response. The researched brief, read-only CLI
behavior, visual system, and `cli-installers` artifact class are unchanged.

## Finding-by-finding repair

- **P0 — one-line installer:** reproduced exit 1 with GitHub's spaced
  `"tag_name": "v0.1.0"` JSON. The parser now allows JSON whitespace. The
  regression executes the real script with realistic API JSON, a tarball, a
  checksum file, and an isolated `HOME`. The deployed script then installed
  the real v0.1.1 Linux release and printed `sideload-readiness 0.1.1`.
- **P1 — `latest.json`:** the release workflow now calls
  `scripts/create-release-manifest.mjs`. The generator refuses incomplete
  platform inputs and emits absolute GitHub download URLs for Linux, macOS
  arm64/x64, and Windows. The published v0.1.1 manifest was parsed and every
  URL was validated.
- **P1 — claim scope:** `.factory/claims.json` now has 14 claim records.
  CLI claims run the public binary against demo, authorized, and unauthorized
  fake-adb sandboxes. Browser claims use the built site and fresh contexts.
  Coverage includes the free path, read-only command allowlist, redaction,
  demo isolation, privacy, fleet queue, and explicit license verification.
- **P3 — cache policy:** production JavaScript and CSS are content-hashed.
  `/assets/*` receives `public, max-age=31536000, immutable`. The stable
  service-worker URL receives `no-cache`, and its cache namespace includes the
  current app/style digest so updates replace old shells.

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

- `npm ci`: 6 packages installed; 0 audit findings.
- Node unit/release suite: 11 passed.
- Production Playwright suite: 31 passed across desktop Chromium and Pixel 5;
  one intentional skip is the duplicate desktop run of the mobile-only target
  size check.
- Axe: zero serious or critical issues on `/`, `/demo`, `/privacy`, `/terms`,
  and the not-found route in both browser projects.
- Rust: 3 unit tests and 8 public-process integration tests passed. Formatting,
  clippy with warnings denied, and the optimized release build passed.
- All 14 commands in `.factory/claims.json` passed independently.
- `cargo package --allow-dirty` packaged and verified 56 files. A fresh
  `cargo install --path . --root <temp>` produced version 0.1.1. Its help and
  redacted demo JSON were checked. Missing-adb and unwritable-output cases
  returned exit 2 with direct recovery text.
- Workflow, nfpm, and v0.1.1 winget YAML passed `yaml-lint`; shell and
  JavaScript syntax checks passed.
- Built JavaScript is 5,608 bytes gzip; CSS is 2,718 bytes gzip; the mobile
  hero is 69,354 bytes.
- Exact local production build passed `verify-url.sh`: HTTP 200, 548 ms load,
  no console errors, correct title/lang, one `h1`, one `main`, complete alt
  text, and labeled buttons.
- Local Lighthouse: performance 100, accessibility 100, best practices 100,
  SEO 100; LCP 1.586 s; CLS 0; transfer 158,593 bytes.

## Release evidence

- GitHub Actions release run `33194140006` completed successfully for tag
  `v0.1.1` (`9e7f0e64c620ea5935e4c473f4310bd7bbca6435`).
- The release contains `latest.json`, `SHA256SUMS`, Linux tar/deb/rpm, macOS
  arm64 and x64 tar/pkg, and the Windows x64 zip.
- All eight package files matched their published SHA-256 values. Key values:
  Linux tar `8ca68826ad662f4cc4b2e6d7f2a235e05a3f2cfb4c9be97a3ca152e5c602bb98`;
  macOS arm64 tar `e999964dbe1f06631c341091ad215bdffb907e98d634d9095783babdf32f2fe8`;
  macOS x64 tar `c9b8e7bcaca39c3e8b0c4877d5872526e18ba98855be24c574ff4fb089730bf2`;
  Windows zip `c01caee6006897c1296d52f44698a8affc8234ad91260eee91c7446ea96769ee`.
- The downloaded Linux binary reported version 0.1.1 and generated a valid
  six-finding `sideload-readiness/v1` demo report with a redacted ID.
- Homebrew, Scoop, and winget metadata now use the v0.1.1 URLs and exact
  published checksums.

## Deployment and live verification

- `npm run build` was deployed with
  `/opt/fleet/lib/deploy-static.sh sideload-readiness dist/site`.
- Azure deployment `90432c9b-b7b8-455e-a72f-3b5dac9dc871` succeeded in
  `centralus`; the canonical URL has managed TLS and returns HTTP 200.
- `/`, `/demo`, `/privacy`, `/terms`, `/missing`, both installer scripts,
  the service worker, robots, sitemap, manifest, and both hashed assets return
  HTTP 200.
- Local/live SHA-256 values match for `index.html`, hashed JS, hashed CSS,
  `service-worker.js`, and `install.sh`.
- Live hashed assets return the one-year immutable cache header. The live
  service worker returns `Cache-Control: no-cache`. CSP, HSTS, nosniff,
  referrer policy, and permissions policy are present.
- `verify-url.sh`: 866 ms load, no console errors, correct title/lang, one
  `h1`, one `main`, complete alt text, and labeled buttons.
- `node scripts/verify-live.mjs https://sideload-readiness.sociobot.in`
  passed all five routes with zero serious/critical axe issues. Desktop
  keyboard focus, 390 px overflow and 44 px targets, same-origin demo traffic,
  service-worker control, and offline reload all passed with no console errors.
- Live Lighthouse: performance 100, accessibility 100, best practices 100,
  SEO 100; LCP 1.262 s; CLS 0; transfer 80,531 bytes.
- Live license verification returned the documented invalid response with
  origin-specific CORS and no console error. No valid token or paid API spend
  was used.

## Known operator actions

- The Sociobot checkout route currently returns `404 enabled factory product`.
  Product registration is billing infrastructure and is outside this repo;
  the operator must enable `sideload-readiness` before accepting purchases.
  License restore and verification remain functional and tested.
- Publish `packaging/homebrew/sideload-readiness.rb` to
  `B-Divyesh/homebrew-sideload-readiness` and submit the v0.1.1 winget
  manifests to `microsoft/winget-pkgs`.
- macOS and Windows artifacts are intentionally unsigned. Signing needs the
  owner's Apple and Windows certificates; no secrets are stored here.
- Android does not expose complete recovery-sideload state while running. The
  CLI marks it `needs-review` and points to device-maker guidance.
