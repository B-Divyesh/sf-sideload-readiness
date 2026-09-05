# Sideload Readiness — repair 9 handoff

## Status

PASS. Sideload Readiness is a read-only Android readiness CLI and local-first
site for Android power users and small IT teams maintaining approved
sideloaded apps.

Implementation SHA: `3d18e68cdadfaa5420c7e50a186de39681a1673a`.
The release preparation and published v0.1.5 binary are
`4e11199d97d2db3ad977b1de0d96890d66add177`. The static site deployment and
installer-manifest documentation are
`c0a551faa418326bde54d0ac2f4d9129df570fb3`. The later public-installer
regression-test commit is `3f140c2678102cdb6e557da568bbbadc6026e840`; it
does not change deployed product assets.

## What a new visitor sees

Job: check whether an Android device is safe to update with an approved
sideloaded app.

Audience: people who maintain approved sideloaded apps while device and
recovery rules change.

First action: **Try it with sample data**. It immediately opens a redacted
sample report and shows the next safe step. Fresh desktop and 390 px mobile
checks confirmed that action and its outcome text are visible before
scrolling.

## Repair completed

- The CLI, shipped sample JSON, and browser demo now use the same
  severity-first recommendation. The sample says
  `Review the marked checks before updating.`; blocked findings stop an
  update, and a fully clear report says it is ready.
- Added outcome tests for ready, needs-review, and blocked recommendations in
  the real CLI and browser demo.
- The Fleet checkout is live again: catalog requests return 200, checkout
  returns a hosted-checkout 303, and invalid-license verification returns 200.
  The page also handles a future checkout 5xx without navigation loss and
  gives the visitor a clear retry step while keeping the free report usable.
- Added the declared `winget-manifest` claim. Its test selects the current
  versioned manifest, downloads the referenced Windows archive and
  `SHA256SUMS`, and compares the actual digest.
- Released v0.1.5 through successful GitHub Actions run `33991071639`.
  It has Linux, macOS arm64/x86_64, and Windows artifacts, `SHA256SUMS`,
  `latest.json`, and Sigstore bundles.
- Updated the public Homebrew feed at
  `1abe02e820d96c3a9b049081115b8b4caab99ba1` and Scoop feed at
  `5f667608bfdd12ded15ad291e79ffebc6e51067c` to v0.1.5. The public-path
  claim now downloads each asset and verifies the checksum pinned by its feed.

## Verification

From a no-hardlink clean clone of `3f140c2`, after the documented
`npm ci`:

- Every one of the 33 commands declared in `.factory/claims.json` passed.
  This includes the new `winget-manifest` and strengthened
  `published-installer-paths` checks.
- `npm test` passed: 29 Node tests and 79 Playwright tests; one expected
  project-specific test was skipped.
- `npm run build` created `dist/site`.
- `cargo fmt --check`, `cargo clippy --all-targets --all-features -- -D
  warnings`, `cargo test --all-targets` (5 unit + 18 CLI integration
  tests), and `cargo package --locked` all passed.
- A clean consumer exercise downloaded the published Linux v0.1.5 archive,
  verified its SHA-256, ran `--version`, and ran
  `demo --json --output`. The output has six findings and the same
  needs-review recommendation as the site.
- `npm run test:billing` passed against the public endpoints: 200 catalog,
  303 hosted checkout, and 200 invalid-license verification.

The final static build was deployed with the product's durable static
configuration. HTTPS verification byte-matched the deployed home document,
fingerprinted assets, service worker, and hero asset to the final deployment
candidate. The live verifier passed Home, Demo, Privacy, Terms, and the
designed HTTP 404; it found zero serious or critical Axe issues and no
unexpected console errors. The intentional missing-page 404 is recorded
separately as expected.

The live demo was entered, reset, and left for real. It preserved a
`real:sentinel` value, discarded only the `demo:sideload-readiness`
namespace, made no WebUSB/Web Serial request, and reloaded offline after the
service worker activated. Mobile checks found no horizontal overflow,
undersized target, or external demo request. Header/footer navigation and
Back/Forward put focus on the destination h1.

Live Lighthouse: performance 100, accessibility 100, LCP 1201.584 ms, CLS 0,
and total blocking time 58 ms. Evidence is in
`.factory/repair-evidence-9/`, including fresh desktop/mobile URL captures
and the Lighthouse report.

## Earlier findings, current disposition

| Findings | Current proof |
| --- | --- |
| F-1-1 through F-1-2 | Current-release Sigstore verification, checksum, diagnostics, example-schema, unsigned-platform, and payment-boundary claims all passed. Every listed public claim has exactly one tagged executable test. |
| F-1-3 through F-1-6 | Clear task headings, route-specific title/description/canonical/Open Graph data, legal routes, and designed 404 passed the browser and live route checks. |
| F-2-1 through F-2-3 | The sample has no device API calls, checksum coverage is current, and the named Sample readiness report and Fleet report review headings remain verified. |
| F-3-1 through F-3-4 | The three operating steps and README usage heading name their Android readiness tasks; the first-read heading test passed. |
| F-4-1 | The no-license, isolated one-device `check` claim passed. The browser also confirms Fleet tools remain locked without a license. |
| F-5-1 | Desktop and mobile route tests, plus final live verification, confirm destination, Back, and Forward focus the h1. |
| F-6-1 | Static and rendered dynamic off-origin links disclose GitHub or Sociobot and say external; the full rendered-link browser guard passed. |
| Verification 11 F-11-1 through F-11-3 | Privacy wording matches actual output behavior; the installers configure PATH/current-session use; and Linux ARM64 is refused before download. The related current claims passed. |
| F-7-1 | CLI, fixture, and browser sample give the same needs-review guidance; ready/needs-review/blocked regression paths passed. |
| F-7-2 | Live billing checks now pass, and an unavailable checkout stays recoverable in page. |
| F-7-3 | The v0.1.5 checksum-pinned Winget manifest is in the claims contract and its download/digest claim passed. |

## Known limits and operator follow-up

- The macOS package and Windows binary are intentionally unsigned; the site
  and README disclose this and provide Sigstore verification guidance.
- Linux ARM64 is not published. The shell installer stops before a download
  and explains why.
- The included Winget manifest is ready for submission to
  `microsoft/winget-pkgs`; upstream publication remains a maintainer
  submission step.

## Run and deploy

```sh
cargo test
npm ci
npm test
npm run build
```

Deploy `dist/site` with the existing static product deployment configuration.
No credential, DNS, billing, or shared-service configuration was changed.
