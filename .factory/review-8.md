# Check Android update safety — review 8

## Verdict: PASS

There are zero findings at every severity and zero untested claims.

- Implementation reviewed: `3d18e68cdadfaa5420c7e50a186de39681a1673a`
- Release commit: `4e11199d97d2db3ad977b1de0d96890d66add177`
- Deployed static candidate: `c0a551faa418326bde54d0ac2f4d9129df570fb3`
- Documentation checkout reviewed: `8dc053b02b83a6673ad5683657309a258791f079`
- Live URL: <https://sideload-readiness.sociobot.in>
- Reviewed: 2026-09-05 UTC

Product code was not changed. The later release, metadata, test, and report
commits do not change the diagnostic logic from the implementation commit. A
clean build at the documentation checkout byte-matched the deployed HTML,
fingerprinted JavaScript and CSS, service worker, and mobile hero image.

## First screen before scrolling

Fresh desktop and 390 × 844 phone contexts showed these answers before any
scrolling:

- Job: **Check Android update safety.**
- Audience: people who maintain approved sideloaded apps when device rules or
  recovery paths change.
- First action: **Try it with sample data.** The adjacent sentence says it
  opens a redacted report and shows the next safe step.

On the phone, the action ended at y=490.63 and its outcome ended at y=527.98,
inside the 844 px viewport. The title names the job. Headings and controls use
plain words without metaphor or mood labels.

## One-click sample and data isolation

**PASS.** One click opened `/?demo=1` with a populated Android 15 sample. It
showed device `device-6f31a0b2`, an 83% score, six findings, five ready states,
one recovery result marked needs review, and a recovery checklist.

The persistent banner read **Demo — sample data, nothing is saved** and kept
**Reset demo** and **Start for real** available. Reset recreated only
`demo:sideload-readiness`. A `real:sentinel` value survived reset and exit;
exit removed the demo key. Instrumented WebUSB and Web Serial methods recorded
zero calls. The complete sample flow made no off-origin request.

The installed CLI sample independently produced the same redacted device,
score, six findings, and five recovery steps. Its recommendation was to review
the marked checks before updating, matching the browser sample.

## Claims gate: PASS (33 / 33)

The documented Node, npm, and Rust prerequisites were installed in a
no-hardlink clean checkout of `8dc053b`. Every exact `test` string in
`.factory/claims.json` then ran separately. Commands that declare `npm ci` ran
that prerequisite again. All 33 passed.

| Claims | Result |
| --- | --- |
| `demo-report`, `json-report`, `redacted-id`, `read-only-checks`, `unauthorized-device`, `signer-continuity`, `signer-unreadable`, `diagnostic-report`, `example-schema`, `device-selection`, `demo-no-adb`, `cli-report-storage`, `private-demo-file`, `explicit-output-replacement`, `single-device-free` | PASS |
| `local-demo`, `browser-demo-no-device`, `privacy`, `fleet-review`, `license-verification`, `license-retention` | PASS |
| `fleet-checkout` | PASS — public catalog and invalid verification succeeded; checkout returned 303 to hosted Dodo without a purchase. |
| `verified-installer`, `installer-path-setup`, `installer-platform-support`, `platform-packaging`, `release-manifest`, `release-signatures`, `release-checksums`, `unsigned-platform-disclosure`, `billing-provider-boundary`, `published-installer-paths`, `winget-manifest` | PASS |

The rendered Home, Demo, Privacy, Terms, installer states, README, and release
documentation were cross-checked against the registry. No public statement was
missing, false, incomplete, or outside a matching observable test.

## Clean checkout and installed artifact

All local quality and packaging gates passed:

```text
npm ci                                      PASS; 0 audit findings
npm test                                    PASS; 29 Node, 79 browser, 1 expected project skip
npm run build                               PASS; created dist/site
cargo fmt --check                          PASS
cargo clippy --all-targets --all-features
  -- -D warnings                           PASS
cargo test --all-targets                   PASS; 5 unit, 18 CLI integration
cargo build --release --locked             PASS
cargo package --locked                     PASS; 16 files, 39.6 KiB compressed
JavaScript and shell syntax                 PASS
```

The initial built JavaScript is 23,396 bytes raw and 7,818 bytes gzip. CSS is
8,278 bytes raw and 2,732 bytes gzip. The phone hero is 69,354 bytes.

A clean consumer directory downloaded the public v0.1.5 Linux archive and
`SHA256SUMS`. The calculated and published archive digest both were
`ab89e345601c4751fadc200c03f22ab96e0283661c76158d8d353e8363ad0d5e`.
The extracted binary reported version 0.1.5, showed useful read-only help, and
produced the expected JSON sample. A malformed signer exited 2 and explained
the required 64-digit SHA-256 digest.

The live `curl | sh` installer was also run with an isolated home. It verified
the checksum, installed into that home, updated its profile, and the bare
`sideload-readiness` command worked after sourcing the profile. No real device
or real user data was used.

Normal, invalid, boundary, and recovery coverage includes one authorized
device, unauthorized and multiple devices, storage one KiB below the floor,
signer match and mismatch, unreadable APK data, missing adb, malformed signer,
and output-write failure. Logged adb operations remained read-only.

## Live browser, accessibility, privacy, and recovery

**PASS.** A fresh production run completed 79 desktop/mobile Playwright cases
with one intentional project skip. It covered keyboard use, history, focus,
touch targets, 200% text, reduced motion, offline reload, sample isolation,
invalid fleet imports, unavailable checkout and download recovery, and release
selection for Linux, Windows, Intel Mac, Apple silicon Mac, Android, and iPhone.

- The skip link was first in the tab order. Enter opened the sample and Space
  reset it. Route changes, Back, Forward, and reset focused the destination h1.
- Every visible phone target was at least 44 × 44 CSS pixels. There was no
  horizontal overflow. The primary focus ring was a visible 3 px solid ring.
- Reduced motion removed the finding animation and made transitions immediate.
- Axe found zero serious or critical issues on Home, Demo, Privacy, Terms, and
  the designed 404. Each had `lang=en`, one h1, one main landmark, and its own
  title, description, canonical URL, and social metadata.
- The factory URL verifier passed Home, Demo, Privacy, and Terms with no page or
  console error, missing image alternative, or unnamed button.
- The service worker activated and the populated sample reloaded offline.
- The live page has no analytics or third-party runtime code. It sends CSP,
  HSTS, `nosniff`, strict-origin referrer policy, and a policy disabling USB and
  serial access in the browser.
- Blank license input, an invalid license, an expired cached result, a forged
  fleet report, checkout failure, and release lookup failure each left the free
  path usable and gave a next step.

There is no product backend, tenant store, shared database, or restart state to
test. CLI reports are explicit local files; browser product state is local
storage. The only server-side product integration is the public Sociobot
license endpoint. A fresh 40-request burst returned 30 × 200 and 10 × 429; the
first limited response included `Retry-After: 4`.

## Routes, links, and performance

Home, Demo, Privacy, Terms, installers, service worker, manifest, icons,
robots, and sitemap returned 200. Rendered internal and external links returned
2xx or 3xx. The fleet purchase link returned 303 to the hosted Dodo origin. A
deliberately missing address returned HTTP 404 with the designed page, one h1,
and a working route home. Its skip link resolves within that same 404 document;
the expected 404 response is not a broken link.

Fresh mobile Lighthouse results:

| Metric | Result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| LCP | 1,209.66 ms |
| Total blocking time | 34 ms |
| CLS | 0 |

There were no Lighthouse run warnings.

## Earlier findings: current disposition

Every earlier review, verification, polish record, and handoff was read. The
current proof for each group is below.

| Earlier finding group | Current proof |
| --- | --- |
| Initial verification: broken shell installer, relative release URLs, incomplete claim inventory, short cache | Closed. The live one-line installer worked; manifest URLs are absolute; 33 claims cover public behavior; fingerprinted assets are immutable. |
| Verification 2: dead checkout, distribution signing, fake HTTP 200 for missing routes | Closed. Checkout returns hosted 303; all release payloads and manifests have verified GitHub OIDC Sigstore bundles; Apple/Authenticode limits are disclosed; missing routes return HTTP 404. |
| Verification 3: hidden phone action, signer contradiction, first-device selection, missing Homebrew path, prerequisite failure, unavailable channels, output recovery | Closed. Fresh phone geometry passed; signer and device-choice claims passed; Homebrew/Scoop/public assets resolve; every exact clean-checkout command passed after documented setup; output failures give a next step. |
| Verification 4: unusable stock signer extraction, false retention, unsafe fleet rendering, retained demo data, storage contradiction, Mac choice, polluted package, unclear 404 | Closed. The real AOSP v2 APK fixture, 24-hour expiry, forged import rejection, demo namespace, exact storage boundary, Mac choice, clean crate, and designed 404 all passed. |
| Verification 5: wrong Intel download, predictable demo filename, undersized controls | Closed. Platform selection passed; automatic files are distinct mode-0600 files; no phone target was undersized. |
| Verification 6: missing safety claims | Closed. Safety statements map to the 33-entry claims contract and public-command tests. |
| Reviews F-1-1 through F-1-6 | Closed. Sigstore, diagnostic, schema, signing, billing, headings, and per-route metadata passed current checks. |
| Reviews F-2-1 through F-2-3 | Closed. Browser device calls remain zero; release checksums pass; headings name sample and fleet report sections. |
| Reviews F-3-1 through F-3-4 | Closed. All operating and README headings name their Android readiness tasks. |
| Review F-4-1 | Closed. A no-license public one-device `check` produced a report while fleet tools remained locked. |
| Review F-5-1 | Closed. Header/footer navigation and Back/Forward focus the destination h1. |
| Review F-6-1 | Closed. Every off-origin link names GitHub or Sociobot and says external. |
| Reviews F-7-1 through F-7-3 | Closed. CLI/browser advice agrees, checkout and its failure recovery work, and the Winget checksum claim passes. |
| Verification F-11-1 through F-11-3 | Closed. Privacy distinguishes regular and demo files; one-line PATH behavior works; Linux ARM64 is refused before download. |

No earlier finding is open, partial, or regressed.

## Deliberate limits

- macOS and Windows packages do not have Apple or Authenticode signatures.
  This is disclosed; every release payload has a verified Sigstore bundle.
- Linux ARM64 is not published. The installer refuses it before download and
  gives a next step.
- The checksum-pinned Winget manifest awaits owner submission. No unavailable
  winget command is advertised.

These disclosed limits follow the installer contract and are not findings.
The diagnostic job does not benefit from an AI step: authorization, storage,
signer, and recovery checks need deterministic device evidence. JSON export
and local fleet import already provide the useful operator handoff.

## Evidence

- `.factory/review-evidence-8/live-qa.json`
- `.factory/review-evidence-8/lighthouse-live.json`
- `.factory/review-evidence-8/home/`
- `.factory/review-evidence-8/demo/`
- `.factory/review-evidence-8/privacy/`
- `.factory/review-evidence-8/terms/`
