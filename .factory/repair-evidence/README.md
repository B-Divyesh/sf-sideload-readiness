# Repair evidence

## Reproduced against candidate 1cbc9e0

- At 390 × 844, the sample action occupied y=816.31–864.63 and its outcome
  text started at y=879.63. See `before-mobile.png`.
- A fake adb package dump containing signer SHA-256
  `9A:25:70:5E:39:1F:B9:27:65:55:CA:AD:4F:45:42:8E:F1:BC:8A:C4:AC:65:AA:36:7A:76:FC:64:BB:43:CC:4D`
  produced signer status `ready` with detail “Signer details were not visible.”
- Two authorized fake adb devices produced exit 0 and a report for the first
  device.
- Each of the four browser claim commands failed in a fresh clone with
  `ERR_MODULE_NOT_FOUND: @playwright/test`.
- The public Homebrew tap returned GitHub API HTTP 404.

The controller's 404 concern did not reproduce at the supplied candidate:
both the local production server and live unknown route returned HTTP 404.
That behavior remains covered as a required regression.

## Repaired evidence

- At 390 × 844, the full sample action occupies y=442.31–490.63 and its
  outcome text ends at y=527.98. See `after-mobile.png`.
- `claim_signer_identity_is_extracted_and_compared` covers a matching and a
  mismatching digest. `signing_info_without_a_digest_is_never_reported_ready`
  covers the original contradictory result.
- `multiple_devices_require_an_explicit_redacted_selection` covers refusal,
  explicit selection, and serial redaction.
- All 19 claim commands pass from an untouched clone. Browser claim commands
  each begin with locked `npm ci` prerequisite installation.
- The Homebrew tap and Scoop bucket are public. Hosted macOS, Linux, and
  Windows consumer jobs passed for the documented installers.
- Production `/unambiguously-missing-qa-route` returns HTTP 404 with the
  designed one-heading recovery page.

`live/` contains the post-deploy URL verifier output and screenshots.
`lighthouse.json` contains the post-deploy Lighthouse result.
