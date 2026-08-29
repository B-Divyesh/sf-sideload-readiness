# Sideload Readiness repair handoff

## Status

Release-blocking findings from verifier report commit
`3f8f65fa8dbc0cfc663b4c9c9e774942d4935c31` are repaired. The repaired site
is deployed at <https://sideload-readiness.sociobot.in>, and CLI release
`v0.1.2` is public.

The original `cli-installers` artifact and static deployment class are
unchanged.

## Repairs

- The phone layout now puts the task and sample action before the hero art.
  At 390 × 844, the action occupies y=442.31–490.63 and its outcome text ends
  at y=527.98. It previously occupied y=816.31–864.63.
- The CLI extracts a stable 64-digit signer SHA-256 from supported adb package
  output. `--expected-signer` compares it with the approved APK digest. A match
  is `ready`, a mismatch is `blocked`, and missing digest evidence is
  `needs-review`.
- More than one authorized adb device now fails closed unless `--device
  SERIAL` selects one. Exported reports continue to contain only redacted
  device IDs.
- Every browser claim command begins with `npm ci`, so the exact command is
  runnable in an untouched clone.
- Output-write failures now tell the operator to choose an existing writable
  folder.
- `v0.1.2` publishes all platform archives/packages, `SHA256SUMS`, absolute
  URLs in `latest.json`, and a Sigstore bundle for every release asset.
- The previously missing Homebrew tap is public at
  <https://github.com/B-Divyesh/homebrew-sideload-readiness>. The Scoop bucket
  is public at <https://github.com/B-Divyesh/scoop-sideload-readiness>.
- Unknown routes retain the designed 404 page and return a real HTTP 404.

Exact before/after evidence is in `.factory/repair-evidence/README.md`.

## Regression coverage

- `390px first viewport contains the complete sample action and outcome`
- `claim_signer_identity_is_extracted_and_compared`
- `signing_info_without_a_digest_is_never_reported_ready`
- `multiple_devices_require_an_explicit_redacted_selection`
- `output_write_failures_include_a_recovery_action`
- `browser claim commands install their declared clean-clone prerequisites`
- `@claim:published-installer-paths public installer paths match one checksummed release`
- `unknown server paths return the designed 404 document with HTTP 404`

`.factory/claims.json` now has 19 claims. All 19 exact commands passed in
sequence from an untouched clone; no prior `npm ci` was performed.

## Verification evidence

Local clean gates:

```text
npm ci                                      pass; 6 packages, 0 vulnerabilities
npm test                                    pass; 14 Node, 37 Playwright, 1 intentional skip
npm run build                               pass; dist/site produced
cargo fmt --check                           pass
cargo clippy --all-targets -- -D warnings   pass
cargo test                                  pass; 4 unit, 12 integration
cargo build --release                       pass
cargo package --allow-dirty                 pass; 27 files, 182.7 KiB (49.4 KiB compressed)
cargo install --path . --root <temp> --locked pass; help and demo exercised
```

Production browser and policy checks:

- All 38 browser cases ran against production: 37 passed and the
  desktop-only duplicate of the mobile target-size case skipped intentionally.
- `/`, `/demo`, `/privacy`, and `/terms` return 200. The tested unknown route
  returns 404. Each rendered document has one h1 and its route-specific title.
- Desktop and 390 × 844 mobile checks found no horizontal overflow, undersized
  visible controls, page errors, console errors, or serious/critical axe
  findings. Keyboard, focus restoration, reduced motion, and 200% text passed.
- The demo made only same-origin requests, used only
  `demo:sideload-readiness`, and reloaded with its report while offline.
- `verify-url.sh` passed with a 614 ms observed load, title, lang, main, alt,
  button-label, desktop screenshot, mobile screenshot, and console checks.
- The live CSP allows only self plus the declared GitHub and Sociobot API
  connections. HSTS, nosniff, referrer, permissions, immutable hashed-asset,
  and no-cache service-worker policies are present.
- Billing checkout returned 303 to hosted Dodo. Invalid license verification
  returned 200. A fresh rate-limit check returned 200 for requests 1–30 and
  429 for request 31 with `Retry-After: 4`.

Production byte identity:

```text
/                                             ea72c84d56f75d79049051070732e7a41f4b1adbca132a02b7ebf13a062b3701
/assets/style.885182afe6e8.css                 885182afe6e8489814703d382775c3ccd4d66b33a51abbee02d4ffe27b95e5a4
/assets/app.2a460400b840.js                    2a460400b840d3193d1fcf62cc84b84566b1f87d2e1213f10f5b21ec807c304d
/service-worker.js                            06cb0817f3a05e89667974c9440e952cdedb0d338a13d995747effe43e8ddb83
/public/hero-concrete-moss-768.webp            d7593ebdf8f476aff62c0697bc064cdb87b6f8c14f224ee998933de7c0bb7718
```

Performance:

```text
Lighthouse mobile: performance 96, accessibility 100, best practices 100, SEO 100
LCP 1.3 s; CLS 0; TBT 240 ms
JavaScript 15,852 bytes / 5,668 gzip
CSS 8,144 bytes / 2,714 gzip
mobile hero 69,354 bytes
```

Release and consumer evidence:

- Release workflow run `33259098974` passed its clean verification job and all
  Linux, macOS arm64/x64, Windows, packaging, checksum, and signing jobs.
- The independently downloaded Linux tarball SHA-256 is
  `4c23202bf68eab5dbaac6801200e7d8d7cabd3d6373d2ab2cab6ef66aeef2178`,
  exactly matching `SHA256SUMS`.
- Fresh Cosign 3.1.3 verification passed for all ten non-bundle release assets
  against the repository workflow identity and GitHub OIDC issuer.
- Consumer workflow run `33259631978` passed the live shell installer,
  PowerShell installer, documented Homebrew command, and documented Scoop
  command on hosted Linux, macOS, and Windows runners.
- The live detected-platform control resolved to a real v0.1.2 Linux asset
  with no console error.

## Run the verification

```sh
npm ci
npm test
npm run build
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo test
cargo build --release
cargo package --allow-dirty
node scripts/verify-live.mjs https://sideload-readiness.sociobot.in
npm run test:billing
```

To run the claim contract exactly, execute every `.test` value in
`.factory/claims.json` from a fresh clone.

## Deployment and release

- Static site: built with `npm run build` and deployed from `dist/site` using
  `/opt/fleet/lib/deploy-static.sh sideload-readiness dist/site`.
- CLI: `v0.1.2`, built only by GitHub Actions from tag commit
  `5d864c1750e4e384b28b58fdf62c0a8515be0e03`.
- Current `main` has identical `src/`, `Cargo.toml`, and `Cargo.lock` content to
  the release tag. Later commits only publish manifests, tests, and evidence.

## Needs operator action

- Submit `winget/Sociobot.SideloadReadiness/0.1.2/` to
  `microsoft/winget-pkgs`. The checked-in manifest is pinned to the published
  Windows archive and checksum. No winget command is advertised before merge.
- macOS `.pkg` is not notarized and the Windows executable has no organization
  Authenticode certificate. Sigstore bundles provide workflow provenance in
  the meantime.

No product functionality is known to remain broken.
