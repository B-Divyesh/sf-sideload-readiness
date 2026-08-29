# Independent verifier handoff

## Status: FAIL

Candidate `1864d360df809cd87b823f1ef31ed44aabd609cf` was verified on
2026-08-29 against <https://sideload-readiness.sociobot.in>. No product code
was changed. Full evidence and reproduction details are in
`.factory/verification-5.md`.

## Release blockers

1. The live detected-download button sends Intel Mac browsers to
   `sideload-readiness-macos-aarch64.pkg`; the required x64 build is never
   selected.
2. `sideload-readiness demo` builds its automatic output filename from Unix
   seconds and calls `fs::write`. A pre-existing symlink was followed in an
   isolated probe and its target was overwritten with the report.

## Additional defect

At 390 px, the landing page's Linux/macOS and PowerShell installer links are
24.3125 px high, and the unlocked fleet file input is 36 px high. All are
below the required 44 px touch target.

## Passing evidence

- Mandatory first read: pass on desktop and 390 px; the visible one-click
  sample opens `/demo` and its persistent sandbox banner.
- `.factory/claims.json`: present; all 20 exact test commands pass.
- Clean gates: `npm ci`, `npm test`, `npm run build`, Rust formatting, clippy
  with warnings denied, all-target tests, release build, and locked package
  all pass.
- Clean consumer: packaged v0.1.3 installs; help, demo JSON, real APK signer
  match/mismatch, redaction, storage boundary, device-selection, and error
  recovery paths pass.
- Production: 43 applicable browser cases pass; local build and live static
  bytes match; URL verifier and all-route axe checks pass; no console errors.
- Privacy/PWA: demo flow is same-origin, isolated demo storage is removed on
  exit, stale caches are replaced, and `/demo` reloads offline.
- Performance: Lighthouse 95/100/100/100; LCP 1.327 s and CLS 0. JS/CSS/image
  budgets pass.
- Release: all required v0.1.3 platform assets exist; Linux checksum/install
  passes; all ten release files pass fresh GitHub OIDC Cosign verification.
- Billing: checkout returns 303 to hosted Dodo. The verification endpoint
  allows 30 rapid requests, then returns 429 with `Retry-After` (2 seconds
  observed).

## How to verify

```sh
npm ci
npm test
npm run build
cargo fmt --all -- --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test --all-targets
cargo build --release
cargo package --locked
BASE_URL=https://sideload-readiness.sociobot.in npm run test:browser
node scripts/verify-live.mjs https://sideload-readiness.sociobot.in
npm run test:billing
```

Run every `.test` value in `.factory/claims.json` independently before the
broader gates. After repairs, add regressions for Intel/arm64 Mac selection,
unknown mobile OS handling, exclusive temporary creation, symlink collision,
and touch targets on every route and the unlocked fleet state.

## Known operator items

- Submit the checked-in winget manifest to `microsoft/winget-pkgs` before
  advertising a winget command.
- macOS and Windows packages lack native platform signing/notarization; the
  README discloses this. Sigstore provenance verifies for every release file.
- No purchase was made during checkout verification.
