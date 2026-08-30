# Sideload Readiness — adversarial review 7 handoff

## Status: FAIL

Review 7 is recorded in `.factory/review-7.md`. No product code was changed.

Three findings remain:

- `F-7-1` BLOCKING: the CLI sample says it is ready for an update while the
  same sample and browser say a recovery check needs review before updating.
- `F-7-2` BLOCKING: the $39 checkout link and public product catalog return
  HTTP 500; the exact `fleet-checkout` claim test fails.
- `F-7-3` MINOR: the README's checksum-pinned winget-manifest statement has no
  `.factory/claims.json` entry or tagged claim test.

## Verification performed

- Cold production contexts at 390 × 844 and 1440 × 900; first-screen captures
  and measurements are in `.factory/review-evidence-7/`.
- All 32 exact claim commands in one clean clone: 31 passed, 1 failed
  (`fleet-checkout`). See `review-evidence-7/claim-results.json`.
- Browser demo entry, Reset, exit, real-data sentinel, WebUSB/Web Serial,
  same-origin request log, and offline reload: passed.
- Real CLI demo in a fresh temporary directory: mode-0600 redacted report,
  six findings, five recovery items, no adb requirement.
- Full local and live browser suites: 75 passed, one intentional skip each.
- `npm test`, `npm run build`, `cargo fmt --check`, Clippy with warnings denied,
  and `cargo test --all-targets`: passed. `dist/site` was produced.
- Live metadata, routes, designed 404, focus/back/forward behavior, mobile
  layout, touch targets, console, and Axe checks: passed.
- Factory URL checks passed Home, Demo, Privacy, and Terms.
- Live link crawl: all checked links resolved except the paid checkout, which
  returned 500.

## Next steps

1. Make report summaries severity-aware and consistent across CLI, fixture,
   and browser; add recommendation tests for ready, needs-review, and blocked.
2. Restore the Sociobot catalog/checkout responses and add a recoverable
   in-page checkout error for upstream failures.
3. Add and tag a `winget-manifest` claim or remove the README statement.
4. Rerun every claim command and the full live checklist; PASS requires zero
   findings.
