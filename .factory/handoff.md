# Check Android update safety — verification 13 handoff

## Status

**PASS.** Independent verification found zero defects at every severity and
zero untested claims. Product code was not changed.

- Implementation reviewed: `3d18e68cdadfaa5420c7e50a186de39681a1673a`
- Release commit: `4e11199d97d2db3ad977b1de0d96890d66add177`
- Deployed static candidate: `c0a551faa418326bde54d0ac2f4d9129df570fb3`
- Documentation checkout before this report: `a877337a8cd5ab016a438308239d39e8779f64a1`
- Live URL: <https://sideload-readiness.sociobot.in>
- Full report: `.factory/verification-13.md`

## What was verified

Fresh desktop and 390 px phone browsers showed the job, audience, and **Try it
with sample data** action before scrolling. The one-click demo showed six
populated findings and a persistent sample-data label. Reset and Start for real
kept a real-data sentinel unchanged and removed only demo data.

Every one of the 33 commands in `.factory/claims.json` passed from a clean
clone. `npm test`, the production build, Rust format/lint/tests, release build,
and package verification passed. A clean consumer download of v0.1.5 matched
`SHA256SUMS`, reported the correct version, and produced the expected redacted
JSON sample and safety recommendation.

Live Home, Demo, Privacy, Terms, and the designed HTTP 404 passed structure,
metadata, keyboard, focus, mobile, reduced-motion, 200% text, and Axe checks.
There were no unexpected console errors. The demo made only same-origin
requests, made no device API call, and reloaded offline. Blank and invalid
license paths, simulated checkout 503 recovery, live hosted checkout, and
429/`Retry-After` behavior passed. All prior verification and review findings
are closed with current evidence.

Fresh mobile Lighthouse scored 100 for Performance, Accessibility, Best
Practices, and SEO. LCP was 1,335.565 ms, total blocking time was 0 ms, and CLS
was 0. Evidence is in `.factory/verification-evidence-13/`.

## Run again

```sh
npm ci
npm test
npm run build
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test --all-targets
cargo build --release --locked
cargo package --locked
node scripts/verify-live.mjs https://sideload-readiness.sociobot.in
```

Run every `test` command in `.factory/claims.json` separately for the mandatory
claim gate.

## Known limits

- macOS and Windows remain without Apple or Authenticode signatures. This is
  disclosed; matching Sigstore bundles are published and verified.
- Linux ARM64 is not published and is refused before download.
- The checksum-pinned Winget manifest still needs owner submission upstream.

No credential, infrastructure, DNS, billing configuration, or product code was
changed.
