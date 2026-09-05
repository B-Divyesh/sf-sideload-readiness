# Check Android update safety — independent verification 13

## Verdict: PASS

There are zero findings at every severity and zero untested claims.

- Implementation reviewed: `3d18e68cdadfaa5420c7e50a186de39681a1673a`
- Release commit: `4e11199d97d2db3ad977b1de0d96890d66add177`
- Deployed static candidate: `c0a551faa418326bde54d0ac2f4d9129df570fb3`
- Documentation checkout before this report: `a877337a8cd5ab016a438308239d39e8779f64a1`
- Live URL: <https://sideload-readiness.sociobot.in>
- Verified: 2026-09-05 UTC

The repository was clean before verification. Product code was not changed.
The deployed HTML, fingerprinted JavaScript and CSS, service worker, and mobile
hero byte-match the build from the documentation checkout. Later commits after
the implementation are release metadata, tests, and reports, not a different
product implementation.

## First screen before scrolling

Fresh Chromium contexts at 1440 × 900 and 390 × 844 showed:

- Job: **Check Android update safety.**
- Audience: people who maintain approved sideloaded apps when device rules or
  recovery paths change.
- First action: **Try it with sample data.** The next sentence says it opens a
  redacted report and shows the next safe step.

The action and its outcome were fully visible without scrolling on both
viewports. On the phone, the action occupied y=442.31–490.63 and the outcome
ended at y=527.98. The words are direct, contain no metaphor heading, and make
the job and next action clear.

## Claims gate: PASS (33 / 33)

`.factory/claims.json` contains 33 unique IDs and 33 unique commands. Every
declared command was run exactly from a no-hardlink clean clone of `a877337`.
All passed:

| Claims | Result |
| --- | --- |
| 15 CLI claims | PASS — public commands covered the report, JSON, redaction, read-only adb use, authorization, signer checks, diagnostic coverage, device choice, output safety, and the free check. |
| 6 browser claims | PASS — isolated sample storage, no device API access, same-origin demo traffic, fleet review, explicit license verification, and 24-hour verdict expiry. |
| `fleet-checkout` | PASS — catalog and invalid verification returned 200; checkout returned 303 to hosted Dodo without a purchase. |
| 11 release and installer claims | PASS — installer verification and PATH behavior, supported platforms, release matrix and manifest, Sigstore, checksums, signing disclosure, billing boundary, public feeds, and Winget. |

The landing page, reachable states, Privacy, Terms, README, installer text, and
download states were checked against the list. No missing, false, incomplete,
or untested public claim was found.

## Clean checkout and installed artifact: PASS

The documented prerequisites were present: Node 22.23.2, npm 10.9.8, and Rust
1.98.0. The clean checkout produced these results:

```text
npm test                                      PASS (29 Node, 79 browser; 1 expected project skip)
npm run build                                 PASS (created dist/site)
cargo fmt --check                            PASS
cargo clippy --all-targets --all-features
  -- -D warnings                             PASS
cargo test --all-targets                     PASS (5 unit, 18 CLI integration)
cargo build --release --locked               PASS
cargo package --locked                       PASS (16 files, 39.6 KiB compressed)
JavaScript and shell syntax checks            PASS
```

A clean consumer directory downloaded the public v0.1.5 Linux archive and
`SHA256SUMS`. The calculated archive digest was
`ab89e345601c4751fadc200c03f22ab96e0283661c76158d8d353e8363ad0d5e`,
which matched the release. The installed binary reported version 0.1.5 and
useful read-only help. `demo --json --output` produced schema
`sideload-readiness/v1`, the redacted sample ID, six findings, score 83, five
recovery steps, and `Review the marked checks before updating.` A malformed
signer exited 2 and explained the required 64-digit digest.

The integration suite also ran normal, unauthorized, multiple-device,
one-KiB-below-storage-boundary, signer mismatch, unreadable APK, missing adb,
and output failure paths through the public CLI. The fake adb log remained
limited to read-only operations.

## Live demo, accessibility, privacy, and recovery: PASS

One click opened the populated sample. It showed six realistic findings, five
ready states, one recovery check marked needs review, and the same overall
recommendation as the installed CLI. The persistent banner said **Demo — sample
data, nothing is saved** and exposed **Reset demo** and **Start for real**.

Reset recreated only `demo:sideload-readiness`. A `real:sentinel` value
survived reset and leaving the demo; leaving removed the demo key. Instrumented
WebUSB and Web Serial methods recorded zero calls. The complete demo flow made
no off-origin request. The service worker activated, updated, removed an old
cache in the automated regression path, and reloaded the live demo offline.

Keyboard checks reached the skip link first. Enter opened the sample; Space
reset it; route changes, Back, Forward, and reset focused the destination h1.
The primary focus outline was a visible 3 px solid ring. At 390 px there was no
horizontal overflow or target smaller than 44 × 44 CSS pixels. At 200% text,
the h1 and demo controls remained visible without horizontal overflow.
Reduced motion removed the finding animation and reduced the transition to an
effectively instant value.

Fresh Axe checks on Home, Demo, Privacy, Terms, and the designed 404 found zero
serious or critical violations. Each route had `lang=en`, one h1, one main
landmark, a route-specific title, and no unexpected console error. The factory
URL verifier also passed Home, Demo, Privacy, and Terms and saved fresh desktop
and phone captures.

Blank license submission made no request and explained what to enter. A fresh
invalid token made exactly one request to Sociobot, kept fleet tools locked,
and showed a useful message. An intercepted checkout 503 kept the visitor on
the product and said to retry later while the free report remained available.
The live checkout itself returned the expected hosted-checkout 303.

The live page sends CSP, HSTS, `nosniff`, strict-origin referrer policy, and a
Permissions Policy that disables USB and serial access. Initial code and media
are self-hosted. Hashed assets use immutable caching and the service worker is
served with `no-cache`. The site has no analytics. Product state is browser
local; there is no product backend or shared database to test. A 40-request
burst to the product's Sociobot verification endpoint returned 30 × 200 and
10 × 429; the first 429 included `Retry-After: 3`.

## Routes, links, and performance: PASS

Home, Demo, Privacy, Terms, installers, service worker, web manifest, icons,
robots, and sitemap returned 200. All ordinary rendered links returned 2xx or
3xx. The checkout returned 303. A deliberately missing address returned HTTP
404 with the designed page, one h1, and a route back. Its skip link points to
the same 404 document's main landmark; that expected 404 is not a broken link.

The live shell and PowerShell installers byte-match the candidate. Public
Homebrew, Scoop, and Winget metadata reference v0.1.5 release assets with
matching checksums. The release contains the supported Linux x86_64, macOS
arm64/x86_64, and Windows x64 artifacts, plus `SHA256SUMS`, `latest.json`, and
matching GitHub OIDC Sigstore bundles.

Built asset sizes are 23,396 bytes JavaScript (7,818 gzip), 8,278 bytes CSS
(2,732 gzip), and 69,354 bytes for the mobile hero. Fresh mobile Lighthouse:

| Metric | Result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| LCP | 1,335.565 ms |
| Total blocking time | 0 ms |
| CLS | 0 |

There were no Lighthouse run warnings.

## Earlier findings: current disposition

| Earlier finding | Current proof |
| --- | --- |
| Initial verification: broken shell installer, relative `latest.json`, incomplete claims, short cache | Closed. Installer/release claims passed; the live scripts match source; current manifest URLs are absolute; 33 claims cover public behavior; fingerprinted assets are immutable. |
| Verification 2: checkout 404, signed distribution, fake HTTP 200 for missing routes | Closed. Checkout is a hosted 303; every release payload and manifest passes GitHub OIDC Sigstore verification; platform-vendor signing limits are explicit; the designed missing route returns HTTP 404. |
| Verification 3: hidden phone action, signer contradiction, first-device selection, missing Homebrew feed, claim prerequisites, missing channels, output recovery | Closed. Fresh phone geometry passes; signer and severity tests pass; multiple devices require selection; the public Homebrew path and all claim commands pass after their declared prerequisites; output errors give a next step. |
| Verification 4: stock signer extraction, false retention, unsafe fleet rendering, retained demo, storage contradiction, Mac choice, polluted package, unclear 404 | Closed. The AOSP v2 APK signer test, 24-hour expiry test, forged-import rejection, namespace isolation, storage boundary test, Mac choice test, clean package, and designed 404 all passed. |
| Verification 5: wrong Intel download, predictable demo file, small touch targets | Closed. Platform-selection tests pass; automatic reports are distinct mode-0600 files; fresh mobile checks found no undersized target. |
| Verification 6: missing safety claims | Closed. All safety statements map to the 33-entry claims contract and tagged public-command tests. |
| Reviews F-1-1 through F-1-6 | Closed. Sigstore, diagnostic, schema, signing, and billing claims passed; task headings and per-route metadata remain correct. |
| Reviews F-2-1 through F-2-3 | Closed. No-device and release-checksum claims passed; headings are `Sample readiness report` and `Fleet report review`. |
| Reviews F-3-1 through F-3-4 | Closed. The three operating headings and README heading name their Android readiness tasks. |
| Review F-4-1 | Closed. A no-license, one-device public `check` produced a report; paid tools remained locked. |
| Review F-5-1 | Closed. Header/footer navigation and Back/Forward focus the destination h1. |
| Review F-6-1 | Closed. Every off-origin link names GitHub or Sociobot and says external. |
| Reviews F-7-1 through F-7-3 | Closed. CLI/browser advice agrees, live checkout and 503 recovery work, and the v0.1.5 Winget checksum claim passed. |
| Verification F-11-1 through F-11-3 | Closed. Privacy text distinguishes regular and demo output; PATH behavior is tested and the live scripts match; Linux ARM64 is refused before download. |

No earlier finding is open, partial, or regressed.

## Deliberate limits

- macOS and Windows artifacts do not have Apple or Authenticode signatures.
  The site and README say so; every release asset has a verified Sigstore
  bundle.
- Linux ARM64 is not published. The installer refuses it before download and
  gives a next step.
- The Winget manifest is checksum-pinned and ready for its owner to submit
  upstream. The site does not advertise a command that is not yet public.

These disclosed limits match the supplied work order and are not findings.
The product does not benefit from an AI step: signer, storage, authorization,
and recovery checks require deterministic evidence. JSON export and local
fleet import already cover the useful handoff between operators.

## Evidence

- `.factory/verification-evidence-13/live-qa.json`
- `.factory/verification-evidence-13/lighthouse-live.json`
- `.factory/verification-evidence-13/home/`
- `.factory/verification-evidence-13/demo/`
- `.factory/verification-evidence-13/privacy/`
- `.factory/verification-evidence-13/terms/`

