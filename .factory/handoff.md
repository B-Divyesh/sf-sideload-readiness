# Sideload Readiness verification handoff

## Status: FAIL

Candidate `60d0a00e4b2d9c5c82cf212e4af3d9b0c7a1da86` was independently
verified on 2026-08-29 against
<https://sideload-readiness.sociobot.in>. The deployment byte-matches the
candidate and the release pipeline is healthy, but the candidate is not ready
to release.

The release blocker is functional: the CLI expects a 64-digit certificate
digest in stock `adb shell dumpsys package` output, while AOSP prints only a
short Java signature hash. The test uses invented `apksigner`-style output, so
its passing result does not prove the real signer-continuity job. The privacy
page also contains an unlisted and false one-day license-verdict retention
claim.

Full evidence and severity-ranked defects are in
[verification-4.md](verification-4.md).

## What passed

- Mandatory first-read test on desktop and 390 × 844 mobile; the sample is one
  click away and immediately shows a realistic report.
- All 19 exact `.factory/claims.json` commands.
- `npm ci`, `npm test` (14 Node, 37 Playwright, one intentional project skip),
  and `npm run build`.
- `cargo test --all-targets` (4 unit, 12 integration), formatting, Clippy with
  warnings denied, release build, crate packaging, and isolated installation.
- Live route/title/heading/404 checks; keyboard, visible focus, 200% text,
  reduced motion, touch targets, and zero serious/critical axe findings.
- Same-origin demo request log, privacy headers, offline reload, cache policy,
  and no console/page errors.
- Static budgets: 15,852-byte JS, 8,144-byte CSS, 69,354-byte mobile hero.
- Supporting Lighthouse result: 96 performance, 100 accessibility, 100 best
  practices, 100 SEO, LCP 1.293 s, CLS 0. Chromium crashed only during the
  final full-page screenshot after audit collection.
- Billing checkout 303 to hosted Dodo and verification allowance of 30;
  request 31 returned 429 with `Retry-After: 3`.
- v0.1.2 platform assets, manifest, SHA256SUMS, Linux consumer execution, and
  fresh Cosign verification of all ten non-bundle assets.

## Release-blocking defects

1. **P1 — signer continuity does not work with stock Android package output.**
   Implement actual installed-APK certificate extraction and test captured
   stock Android fixtures.
2. **P1 contract — the one-day license-result retention sentence is unlisted
   and false during verification failure.** Correct the behavior/copy and add
   a claim test.

## Other defects

- **P2:** fleet JSON fields are inserted through `innerHTML`; hostile values
  can forge stored table UI, while invalid JSON is silently ignored.
- **P2:** Start for real leaves the `demo:sideload-readiness` key behind.
- **P2:** a value one KiB below the storage floor is blocked but displayed as
  the same rounded “1.0 GiB” as the floor.
- **P2:** the platform download requires one activation to resolve the asset
  and a second activation to download it.
- **P3:** after `npm ci`, plain `cargo package --list` includes ignored nested
  README/LICENSE files and refuses without `--allow-dirty`.
- **P3:** the server 404 uses metaphorical “concrete edge/report path” copy.

## How to reproduce

```sh
npm ci
npm test
npm run build
cargo test --all-targets
cargo fmt --all -- --check
cargo clippy --all-targets --all-features -- -D warnings
cargo build --release
node scripts/verify-live.mjs https://sideload-readiness.sociobot.in
npm run test:billing
```

Run every `.test` value in `.factory/claims.json` separately from a fresh
checkout. For the central defect, feed the check command an AOSP-shaped
`PackageSignatures{..., signatures:[<short hash>], ...}` response and a valid
`--expected-signer`; the signer finding remains `needs-review`.

## Next steps

Fix the two release blockers first. Then escape and validate fleet imports,
clear demo storage on exit, make boundary evidence precise, and make the first
download activation lead to the detected asset. Repeat the full claim,
consumer, live-browser, release-signature, and rate-limit verification before
changing this status to PASS.

No product code, infrastructure, DNS, billing configuration, or release assets
were changed by this verification.
