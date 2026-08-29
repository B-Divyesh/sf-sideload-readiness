# Handoff — adversarial first-read review 2

## Status: FAIL

No product code was modified. The complete independent review is in
`.factory/review-2.md`.

Fresh mobile and desktop first reads, demo isolation, the CLI demo, all 27 declared claim commands, `npm test`, `npm run build`, Cargo tests, formatting, Clippy, live route metadata/accessibility checks, and link crawling passed.

Three findings remain:

- **F-2-1 (blocking):** browser-demo/device and every-archive-checksum promises are not present in `.factory/claims.json` with matching clean-sandbox tests.
- **F-2-2 (minor):** the sample-report heading is an instruction, not a section name.
- **F-2-3 (minor):** the fleet heading omits the feature name.

## Run the verification

```sh
npm ci
npm test
npm run build
cargo test --all-targets
cargo fmt --check
cargo clippy --all-targets -- -D warnings
node scripts/verify-live.mjs https://sideload-readiness.sociobot.in
```

Run each command in `.factory/claims.json` separately for the release claim gate. Demo entries are `/?demo=1`, `/demo`, and `sideload-readiness demo`.

## Next steps

Repair F-2-1 through F-2-3, then rerun the full clean-clone claims loop and fresh-browser review. No deployment change was made by this review.
