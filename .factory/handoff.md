# Sideload Readiness repair handoff

## Repair scope

This repair addresses every finding in independent verifier report commit
`84d4b25fcd3f382b889e709fb61ce24ce032f5b9` for candidate
`e422e119b65e8f4aa0b41b938843ef1980550a77`. The researched brief, the
`cli-installers` artifact class, the read-only CLI behavior, and the original
visual system are unchanged.

## Findings repaired

- **P0 installer:** reproduced the live failure with GitHub's spaced
  `"tag_name": "v0.1.0"` response. `install.sh` now accepts JSON whitespace.
  A regression executes the real installer in a temporary home against a
  realistic API fixture, downloads a local archive, verifies its SHA-256, and
  checks the installed binary.
- **P1 release manifest:** `latest.json` is now produced by the tested
  `scripts/release-manifest.mjs` generator. Every Linux, macOS arm64/x64, and
  Windows entry is an absolute GitHub release-asset URL. The workflow checks
  out the generator and supports both `v*` pushes and manual release tags.
- **P1 claims:** `.factory/claims.json` now inventories ten user-facing
  claims. The report, JSON, redaction, read-only adb, and license-free checks
  run through the public CLI. Browser claims run through fresh Playwright
  contexts. The fleet claim verifies the real upload UI with a recorded
  Sociobot response. Every listed command passes independently.
- **P3 caching:** production builds now fingerprint JavaScript and CSS by
  content. `/assets/*` receives a one-year immutable cache policy. The stable
  service-worker URL is intentionally `no-cache, no-store, must-revalidate`
  so browsers receive updates, and its cache name changes with the app hash.

The repair release version is `0.1.1`.

## Exact local verification evidence

Run from `/work/repo` on 2026-08-28:

```sh
npm ci
npm test
npm run test:browser:production
npm run build
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo test
cargo build --release
cargo package --allow-dirty
npx --yes yaml-lint .github/workflows/release.yml winget/Sociobot.SideloadReadiness/0.1.0/*.yaml packaging/nfpm.yaml
sh -n site/install.sh
```

- Clean npm install: 6 packages installed; 0 audit findings.
- Node unit/release suite: 11 passed, including the realistic installer and
  absolute-URL manifest regressions.
- Source browser suite: 27 passed across desktop Chromium and Pixel 5; one
  intentional skip is the duplicate desktop run of the mobile-only size test.
- Exact production browser suite: 27 passed with the same desktop/mobile,
  keyboard, routing, offline/update, privacy, download, and accessibility
  coverage. Axe found zero serious or critical issues on `/`, `/demo`,
  `/privacy`, `/terms`, and the not-found route in both projects.
- Rust: 3 unit tests and 6 public-process integration tests passed. Formatting,
  clippy with warnings denied, and the optimized build passed.
- Every one of the 10 commands in `.factory/claims.json` passed independently.
- `cargo package --allow-dirty` packaged and verified 53 files. A fresh
  `cargo install --path . --root <temp>` produced version `0.1.1`; its help and
  redacted demo JSON were checked. Missing-adb and unwritable-output paths
  both returned exit code 2 with direct recovery text.
- The repaired `site/install.sh` was also run against GitHub's real v0.1.0
  release in an isolated temporary home. It downloaded the Linux archive,
  matched `SHA256SUMS`, installed successfully, and ran version `0.1.0`.
- Production output contains `app.fbb3288b2aaf.js` (5,608 bytes gzip) and
  `style.600bf4b88145.css` (2,718 bytes gzip). The mobile hero is 69,354 bytes.
- `/opt/fleet/lib/verify-url.sh` against the exact production build: HTTP 200,
  548 ms load, zero console errors, correct title and `lang`, one `h1`, one
  `main`, zero images missing alt text, and zero unlabeled buttons.
- Local Lighthouse mobile: performance 100, accessibility 100, best practices
  100, SEO 100; LCP 1.586 s; CLS 0; total transfer 158,593 bytes.
- Workflow and packaging YAML passed `yaml-lint`; installer shell syntax and
  JavaScript syntax checks passed.

## Release and deployment evidence

The v0.1.1 release and static deployment are the remaining execution steps for
this repair. This section will be replaced with published checksums, live
identity hashes, cache headers, browser evidence, and the deployment ID after
the GitHub Actions matrix and factory deployment complete.

## Operator action that remains after release

- Publish the checked Homebrew formula in
  `B-Divyesh/homebrew-sideload-readiness` and submit the checked winget
  manifests to `microsoft/winget-pkgs`.
- macOS and Windows artifacts remain intentionally unsigned. Signing requires
  owner-provided Apple and Windows certificates; no secrets belong here.
- Android does not expose complete recovery-sideload state while running. The
  CLI marks it `needs-review` and points to device-maker guidance.
