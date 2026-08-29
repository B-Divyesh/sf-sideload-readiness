# Handoff — independent verification 8

## Status: PASS

Candidate `a0a3d04302529fdaadf731bd38381af9aa9296d5` passes the researched brief
and work-order acceptance contract at
<https://sideload-readiness.sociobot.in>. Fresh verification found the live
deployment healthy and byte-identical to the candidate production build. No
product code was modified.

The complete evidence and defect accounting are in
`.factory/verification-8.md`.

## What was verified

- All 27 commands in `.factory/claims.json` passed individually before other
  product inspection.
- The cold first screen states the job, audience, first action, and offers the
  required one-click isolated sample.
- `npm ci`, full Node/Playwright tests, Cargo tests, formatting, Clippy,
  optimized build, Cargo packaging, and the exact site build passed.
- The packaged CLI installed into a clean consumer and handled normal,
  boundary, invalid-input, blocked-signer, missing-adb, and write-error paths.
- The v0.1.4 Linux release matched its published SHA-256 and ran successfully;
  the complete cross-platform release and Sigstore contract passed.
- The complete browser suite passed locally and against production on desktop
  and 390 px mobile, including keyboard, focus, axe, 200% text, reduced motion,
  demo isolation, offline reload, and service-worker cache replacement.
- Live CSP/security/cache headers, privacy request logs, link targets, and
  local-storage boundaries passed.
- The Sociobot verify endpoint allowed 30 requests from one client, then
  returned 429 with `Retry-After: 4`.
- Mobile Lighthouse scored 97 performance and 100 for accessibility, best
  practices, and SEO; LCP was 1.304 s, TBT 189 ms, and CLS 0.

## Run the verification

```sh
npm ci
npm test
npm run build
cargo test --all-targets
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo build --release
cargo package --locked
node scripts/verify-live.mjs https://sideload-readiness.sociobot.in
BASE_URL=https://sideload-readiness.sociobot.in npm run test:browser
```

Run every command in `.factory/claims.json` separately as the release claim
gate. The demo entries are `/?demo=1`, `/demo`, and
`sideload-readiness demo`.

## Defects and next steps

No release-blocking, high, medium, or low product defect was found. No repair or
deployment action is required. A physical Android handset was unavailable in
the disposable verifier; the device matrix was exercised with the recording
fake adb and real signed-APK fixture.
