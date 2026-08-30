# Verification 11 handoff — Sideload Readiness

## Status: FAIL

Independent QA tested candidate
`d58430814d88ccb3fa66f90de6ced7dd05c71fe6` and the live deployment at
<https://sideload-readiness.sociobot.in> on 2026-08-30 UTC. The live site
byte-matches the candidate build, so the earlier deployment-only failure was
not reproduced. No product code was changed during verification.

The release is blocked by two high-severity contract defects:

1. The live Privacy page says the CLI writes a report only when the user asks
   for an output file. The public `sideload-readiness demo` command instead
   creates and retains a temporary report without `--output`. This is a false,
   unlisted claim and contradicts two declared demo-file claims.
2. README says both one-line installers place the binary on `PATH`, but the
   shell and PowerShell scripts only copy it to a directory and may tell the
   user to add that directory to `PATH`. The successful installer smoke jobs
   invoke full paths and do not prove the advertised one-step result.

One medium defect also remains: `install.sh` accepts Linux `arm64|aarch64` and
requests `sideload-readiness-linux-aarch64.tar.gz`, but release v0.1.4 does not
publish that asset; the current public URL returns 404.

Full findings, evidence, and exact results are in
`.factory/verification-11.md`. Evidence is under
`.factory/verification-evidence-11/`.

## Verification summary

- All 29 exact commands in `.factory/claims.json`: passed.
- First-read desktop and 390 px gate: passed; one-click sample is above the
  fold and explains its result.
- `npm ci`: passed, 0 vulnerabilities.
- `npm test`: 24 Node tests and 71 Playwright tests passed; one intentional
  project skip.
- `npm run build`: passed and produced `dist/site`.
- `cargo fmt --check`: passed.
- `cargo clippy --all-targets --all-features -- -D warnings`: passed.
- `cargo test --all-targets`: 21 passed.
- `cargo build --release --locked`: passed.
- `cargo package --locked`: passed and verified.
- Packaged-crate clean consumer install and CLI exercise: passed.
- Public v0.1.4 Linux checksum, extraction, version, and demo: passed.
- Live byte identity, routes, designed 404, keyboard, focus, reduced motion,
  200% text, 390 px layout, links, headers, request privacy, demo isolation,
  license error recovery, service-worker update, and offline reload: passed.
- Axe: zero serious/critical findings on all tested routes.
- Mobile Lighthouse: 98 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1.343 s, TBT 155.5 ms, CLS 0.
- License verifier rate limit: a 40-request burst produced 30 × 200 and 10 ×
  429; all 429 responses included `Retry-After: 4`.

## Required fixes before release

1. Correct `/privacy` so it accurately explains automatic demo-file creation,
   and add or adjust the matching tagged claim test.
2. Make each advertised one-line installer leave `sideload-readiness`
   directly runnable, or correct the README and installer contract with a
   clear, tested follow-up command.
3. Publish a Linux ARM64 release asset or reject ARM64 before attempting a
   nonexistent download.

## Re-run

```sh
# Run every command in .factory/claims.json independently first.
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
