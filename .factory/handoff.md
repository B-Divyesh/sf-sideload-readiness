# Verification handoff — work order sideload-readiness-verify-9

## Status: PASS

Candidate `6ce78c6b2ab5477c0e60ed81f6189ef73cacba10` is accepted at
<https://sideload-readiness.sociobot.in>. Fresh evidence shows the deployment
byte-matches the candidate's production site build. No release-blocking, high,
medium, or low defect was found. Product code was not changed.

## What was verified

- Mandatory first-read gate passes on desktop and 390 px mobile. The first
  screen explains the job, audience, and first action, and provides the
  one-click isolated sample demo.
- All 29 commands in `.factory/claims.json` passed exactly as declared.
- `npm ci`, `npm test`, `npm run build`, Rust formatting, Clippy with warnings
  denied, all Rust tests, release build, and crate packaging passed.
- A clean consumer install exercised CLI help/version, Markdown and JSON demo
  output, private files, signer validation, missing adb, output failure,
  storage boundary, signer mismatch, unauthorized devices, and multi-device
  selection.
- Release v0.1.4 has the required platform assets, checksums, manifests, and
  Sigstore bundles. The independently downloaded Linux archive matched SHA-256
  `1797f1b5a1ca905b749b495bd2fd3982c0c3b408dc3494aaeaf90507835888a0`
  and ran successfully.
- The live 70-case browser matrix passed 69 tests with one expected
  project-only skip. Axe found no serious/critical issue; console/page errors
  were zero; keyboard, focus, reduced motion, 200% text, touch size, mobile
  overflow, history, route metadata, 404, and link checks passed.
- Browser request logs confirmed the demo is same-origin and isolated. A stale
  service-worker cache was replaced and `/demo` reloaded offline.
- License verification allowed 30 requests from one client; request 31
  returned 429 with `Retry-After: 3`.
- Mobile Lighthouse scored 96 performance, 100 accessibility, 100 best
  practices, and 100 SEO. LCP was 1.31 s and CLS was 0.

The full evidence and defect accounting are in
`.factory/verification-9.md`. Captures, URL verification, and Lighthouse output
are under `.factory/verification-evidence-9/`.

## Reproduce

```sh
npm ci
npm test
npm run build
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test --all-targets
cargo build --release
cargo package --allow-dirty
node scripts/verify-live.mjs https://sideload-readiness.sociobot.in
BASE_URL=https://sideload-readiness.sociobot.in npm run test:browser
```

## Known limitation and operator action

No physical Android handset was available; the full device matrix used the
recording fake adb and a real AOSP-signed APK fixture. The checksum-pinned
winget manifest remains ready for owner submission. macOS and Windows packages
remain unsigned by their platform vendors and are accurately disclosed; their
Sigstore bundles verify provenance.
