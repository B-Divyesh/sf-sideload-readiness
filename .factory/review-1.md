# Adversarial first-read review 1

**Product:** Sideload Readiness  
**URL:** <https://sideload-readiness.sociobot.in>  
**Commit:** `f535b678b9074e420f634e3e7459ede12d8bb5ad`  
**Date:** 2026-08-29 UTC  
**Verdict:** **FAIL**

The cold first-read and one-click demo work, but the claims contract, three
headings, and route metadata still have findings. This round cannot pass while
any finding remains.

## First screen

Fresh 390 × 844 and 1440 × 900 contexts answered all three questions before
scrolling:

| Question | Answer from the first screen | Exact text |
| --- | --- | --- |
| What does it do? | Checks Android update safety for an approved sideloaded app. | `Check Android update safety` |
| Who is it for? | People maintaining approved sideloaded apps as rules or recovery paths change. | `For people who maintain approved sideloaded apps when device rules or recovery paths change.` |
| What should I click? | Open the ready-made sample report. | `Try it with sample data` → `See a redacted report and the next safe step.` |

The mobile action was visible at y=442–491 and its outcome text ended at
y=528. The concrete/moss/squared-edge treatment is distinct, matches
`.factory/design.md`, and is not a generic SaaS template.

## Findings

### F-1-1 — BLOCKING — the published Sigstore promise is not proved by its claim test

**Location:** README Install: `Every release asset also has a matching GitHub
OIDC Sigstore bundle.`; claims entry `release-signatures`.

**Evidence:** The declared command
`node --test --test-name-pattern='@claim:release-signatures' tests/*.test.mjs`
passed, but it only inspects the two workflow files. It does not download a
published asset or bundle and does not run Cosign. The repository's separate
`scripts/verify-release-signatures.mjs` does try that required verification,
but is not the claim test and cannot run in this clean checkout because Cosign
is neither declared nor installed (`spawn cosign ENOENT`).

**Why it matters:** Workflow intent is not evidence that every currently
advertised release asset is signed. A maintainer is asked to rely on this
specific supply-chain assertion before installing.

**Fix:** Make the declared claim command install a pinned Cosign, fetch the
current public release, require a `.sigstore.json` bundle for every advertised
asset, and run `cosign verify-blob` on each. Otherwise remove the universal
published-asset assertion.

### F-1-2 — BLOCKING — concrete README behaviour and trust claims are unlisted

**Locations and exact quotes:**

- README lines 77–79: `A matching digest is ready, and a mismatch is blocked.`
  and `If the package or certificate cannot be read, the result is
  needs-review.`
- README lines 101–111: `The report checks:` and all five following bullets;
  `The report labels that check needs-review and tells you to use the device
  maker's approved recovery instructions.`
- README lines 38–40: `The macOS package is not Apple-notarized and the
  Windows zip is not signed with an organization Authenticode certificate.`
- README line 99: `examples/sample-report.json documents the stable schema and
  values.`
- README line 117: `Checkout and license verification use Sociobot; no payment
  provider is embedded here.`

**Why it matters:** These are promises a first-time maintainer can act on. The
existing `signer-continuity` test covers matching/mismatching extraction, and
`demo-report` covers a static six-finding sample, but neither proves the
unreadable state, listed live checks/recovery outcome, release disclosure,
example parity, or no-embedded-provider assertion. No matching claims entries
exist.

**Fix:** Remove these assertions or add one observable public-path claim and
tagged clean-sandbox test for each: unreadable signer input; each named
diagnostic/recovery outcome; example-schema parity; current macOS/Windows
signing status; and absence of direct payment-provider code.

### F-1-3 — MINOR — How it works heading is a mood statement

**Location:** landing `h2`: `Make one cautious maintenance decision`.

**Why it matters:** A heading list does not say this is the three-step operating
method; it states an outcome instead of naming the section.

**Fix:** `How the readiness check works`.

### F-1-4 — MINOR — two subheadings have no out-of-context meaning

**Location:** landing `h3` values: `It does` and `It does not`.

**Why it matters:** Neither identifies its subject when heard alone in a
screen-reader heading list.

**Fix:** `What the CLI checks` and `What the CLI never does`.

### F-1-5 — MINOR — install heading names the wrong thing

**Location:** landing `h2`: `Install one small command`.

**Why it matters:** The visitor installs a command-line tool, not a command;
`small` does not convey a useful fact.

**Fix:** `Install the command-line tool`.

### F-1-6 — MINOR — real routes all publish the landing URL as canonical

**Location:** live `/demo`, `/privacy`, and `/terms` retain
`<link rel="canonical" href="https://sideload-readiness.sociobot.in/">`.

**Why it matters:** The pages have different titles and content, but crawlers
are told they are the home page. Their static description and Open Graph fields
are also the landing-page values.

**Fix:** Set canonical, description, and Open Graph values on route change (or
serve route documents), and add per-route browser assertions.

## Demo and sandbox

**Pass; no finding.** From a fresh 390 px context, one click opened `/demo`
to a six-finding, realistic report for `device-6f31a0b2`, including a
needs-review recovery finding and checklist. The persistent banner read
`Demo — sample data, nothing is saved.` and exposed Reset demo and Start for
real.

I pre-seeded `localStorage["real:sentinel"] = "must-survive"`. Demo added
only `demo:sideload-readiness`; Reset recreated only that key; Start for real
removed it and kept the sentinel. A fresh landing → demo Playwright request log
contained only this product origin (HTML, CSS, JS, self-hosted image), with no
third-party runtime request or console error.

The real CLI demo was also run in a fresh temp directory:

```text
TMPDIR=<fresh-dir> cargo run --quiet -- demo --json
Wrote <fresh-dir>/sideload-readiness-demo-vX4eci.json
```

The resulting file was mode 0600 and contained `mode: "demo"`, schema
`sideload-readiness/v1`, six findings, a five-item recovery checklist, and
redacted `device-6f31a0b2`.

## Claims and quality gates

All 22 declared claim commands passed separately from a fresh clone of
`f535b67`:

`demo-report`, `json-report`, `redacted-id`, `read-only-checks`,
`unauthorized-device`, `signer-continuity`, `device-selection`,
`demo-no-adb`, `private-demo-file`, `explicit-output-replacement`,
`single-device-free`, `local-demo`, `privacy`, `fleet-review`,
`license-verification`, `license-retention`, `fleet-checkout`,
`verified-installer`, `platform-packaging`, `release-manifest`,
`release-signatures`, and `published-installer-paths`.

The full fresh-clone quality run passed: `npm test` (18 Node tests; 55
Playwright passed and one expected mobile-only skip), `npm run build`
(created `dist/site`), `cargo test --all-targets` (19), `cargo fmt
--check`, and clippy with warnings denied. F-1-1/F-1-2 mean this is not a
complete claims-contract pass.

## Copy audit

Counts treat hyphenated terms, URLs, and identifiers as one word. Labels and
headings are included because they are part of the first read. No landing or
README sentence is over 22 words. The flagged headings are F-1-3 through
F-1-5; every button is a result-naming verb rather than Submit/Go/Continue.

### Landing page

| Text | Words | Audit |
| --- | ---: | --- |
| Android maintenance / read-only checks | 4 | label |
| Check Android update safety | 4 | h1 |
| For people who maintain approved sideloaded apps when device rules or recovery paths change. | 14 | clear |
| Try it with sample data | 5 | action |
| See a redacted report and the next safe step. | 9 | clear |
| Read-only adb checks | 3 | fact |
| Device IDs are redacted | 4 | listed claim |
| Free for one device | 4 | listed claim |
| See the report before you touch a device | 8 | section |
| Readiness report / sample | 3 | label |
| 83% · Fix one item before recovery | 6 | sample status |
| Authorized USB debugging | 3 | finding |
| One authorized sample device is visible to adb. | 8 | sample detail |
| Keep the authorization prompt accepted while checking. | 7 | next step |
| Developer options | 2 | finding |
| Developer options are enabled. | 4 | sample detail |
| Leave this unchanged for approved maintenance. | 6 | next step |
| USB data mode | 3 | finding |
| The sample device exposes adb over USB. | 7 | sample detail |
| Use a data-capable cable if this changes. | 7 | next step |
| Free data storage | 3 | finding |
| 2.8 GiB free on /data. | 6 | sample detail |
| The 1 GiB safety floor is met. | 7 | sample detail |
| Keep the floor before copying an update. | 7 | next step |
| Package signer match | 3 | finding |
| The installed sample signer SHA-256 matches the expected approved signer. | 10 | sample detail |
| Keep the approved APK and signer digest with this report. | 10 | next step |
| Recovery update visibility | 3 | finding |
| A/B update support is visible, but Android cannot safely prove recovery sideload status while running. | 16 | sample detail |
| Read your device’s approved recovery instructions before using recovery. | 9 | next step |
| Recovery checklist | 2 | section |
| Keep the approved APK and its known-good version. | 8 | checklist |
| Record the app package and signer before an update. | 9 | checklist |
| Stop after an error and save the report before retrying. | 10 | checklist |
| Install one small command | 4 | **F-1-5** |
| Signer matched. | 2 | terminal status |
| Review recovery before updating. | 4 | terminal status |
| The command asks adb for status. | 6 | listed claim |
| It does not install apps, unlock devices, or change Android settings. | 11 | listed claim |
| Open release downloads | 3 | action |
| Linux and macOS installer | 4 | link |
| PowerShell installer | 2 | link |
| Checking published downloads. | 3 | status |
| Make one cautious maintenance decision | 5 | **F-1-3** |
| Connect | 1 | step |
| Accept Android’s USB debugging prompt. | 5 | instruction |
| Choose a device when adb lists more than one. | 9 | listed claim |
| Check | 1 | step |
| Compare the installed signer SHA-256 with the approved APK. | 9 | listed claim |
| Read storage, USB state, and recovery clues. | 7 | instruction |
| Act safely | 2 | step |
| Save a redacted report. | 4 | listed claim |
| Follow its next step or stop before an update. | 9 | instruction |
| What this tool does and does not do | 8 | section |
| It does | 2 | **F-1-4** |
| Make a device-specific report from read-only adb queries. | 8 | listed claim |
| It explains what to check next. | 6 | benefit |
| It does not | 3 | **F-1-4** |
| It never bypasses Android controls, unlocks bootloaders, or distributes APKs. | 10 | listed claim |
| Small IT teams | 3 | audience |
| Review several reports together | 4 | section |
| Fleet review is a $39 one-time license. | 8 | listed claim |
| It adds a local report queue and package-status table. | 9 | listed claim |
| Single-device checks stay free. | 4 | listed claim |
| $39 one-time purchase | 3 | price |
| Buy fleet review | 3 | action |
| Have a license? | 3 | prompt |
| Paste it here. | 3 | instruction |
| Verify fleet license | 3 | action |
| Verification happens with Sociobot when you choose this button. | 9 | listed claim |

### README

| Text | Words | Audit |
| --- | ---: | --- |
| Sideload Readiness | 2 | title |
| Check Android update safety before you update an approved sideloaded app. | 10 | summary |
| Sideload Readiness is for Android power users and small IT teams. | 11 | audience |
| It runs read-only adb checks, writes a redacted report, and gives a recovery checklist. | 14 | listed claims |
| It never installs an APK, changes Android settings, unlocks a bootloader, or bypasses a device policy. | 15 | listed claim |
| The browser demo is at sideload-readiness.sociobot.in/demo. | 6 | link |
| It uses sample data in a separate browser key. | 9 | listed claim |
| Nothing in demo mode touches a connected Android device. | 9 | listed intent |
| Install | 1 | heading |
| Releases support Linux, macOS, and Windows. | 5 | listed claim |
| Each published archive has a SHA-256 line in SHA256SUMS. | 9 | installer fact |
| The installers download the matching release, verify its SHA-256 checksum, then place the binary on your PATH. | 17 | listed claim |
| Every release asset also has a matching GitHub OIDC Sigstore bundle. | 10 | **F-1-1** |
| Verify a downloaded asset with: | 6 | instruction |
| The macOS package is not Apple-notarized and the Windows zip is not signed with an organization Authenticode certificate. | 18 | **F-1-2** |
| Their Sigstore bundles prove the GitHub Actions release provenance before installation. | 11 | **F-1-1** |
| Install with the published Homebrew tap: | 6 | instruction |
| Install with the published Scoop bucket: | 6 | instruction |
| The winget/ folder contains the checksum-pinned v0.1.4 manifest. | 8 | release fact |
| The owner must submit it to microsoft/winget-pkgs before advertising a winget command. | 12 | operator note |
| Use | 1 | heading |
| Connect one device and accept Android's USB debugging prompt. | 9 | instruction |
| If adb lists several authorized devices, the command stops until you pass --device SERIAL. | 13 | listed claim |
| Get the expected signer SHA-256 from your approved APK: | 9 | instruction |
| Compare that digest with the installed package: | 7 | instruction |
| The command reads the installed base APK through adb and parses its signing certificate locally. | 15 | listed intent |
| A matching digest is ready, and a mismatch is blocked. | 10 | **F-1-2** |
| If the package or certificate cannot be read, the result is needs-review. | 13 | **F-1-2** |
| Use JSON in scripts: | 4 | instruction |
| Try the bundled sample without adb: | 6 | instruction |
| The sample creates one private, unpredictable temporary report file and prints its path. | 12 | listed claim |
| It never reuses an existing temporary filename. | 8 | listed claim |
| --output PATH is different: it writes the requested path and replaces that file when it already exists. | 17 | listed claim |
| examples/sample-report.json documents the stable schema and values. | 7 | **F-1-2** |
| The report checks: | 3 | **F-1-2** |
| Authorized USB debugging and USB data mode. | 6 | **F-1-2** |
| Developer options visibility. | 3 | **F-1-2** |
| Free /data storage against a 1 GiB safety floor. | 8 | **F-1-2** |
| Installed signer SHA-256 comparison when a package and expected signer are supplied. | 11 | **F-1-2** |
| A/B update hints and a recovery checklist. | 7 | **F-1-2** |
| Android does not expose a safe, complete recovery-sideload status while it is running. | 12 | **F-1-2** |
| The report labels that check needs-review and tells you to use the device maker's approved recovery instructions. | 17 | **F-1-2** |
| Fleet review | 2 | heading |
| Single-device reports are free. | 5 | listed claim |
| Fleet review is a $39 one-time license. | 8 | listed claim |
| It adds a local report queue and a package-status table on the site. | 12 | listed claim |
| Checkout and license verification use Sociobot; no payment provider is embedded here. | 11 | **F-1-2** |
| Develop and verify | 3 | heading |
| Requirements: current Rust stable, Node 20+, and adb only for a live check. | 11 | requirement |
| npm run build:site creates the deployable static site in dist/site. | 9 | observed |
| The factory deploys that directory; this repository does not manage DNS or cloud infrastructure. | 13 | scope |
| npm run build is an alias for the deploy build. | 10 | observed |
| Release installers are built only in GitHub Actions by .github/workflows/release.yml. | 10 | release fact |
| npm test includes desktop and 390 px mobile browser checks for keyboard use, accessibility, offline reloads, privacy, and release-download behavior. | 19 | observed |
| Privacy and license | 3 | heading |
| The CLI has no report-upload command. | 7 | listed claim |
| It only runs local adb commands and writes an output file when requested. | 13 | listed claim |
| Hardware serials are replaced with a redacted ID in exported reports. | 11 | listed claim |
| The site has no analytics or third-party runtime scripts. | 9 | listed intent |
| See Privacy and Terms. | 4 | links |
| License | 1 | heading |
| MIT | 1 | license link |

No banned marketing adjective was found. The only specialized term, `adb`, is
necessary and is consistently used.

## Structure and navigation

**Pass except F-1-6.** The crawl returned 200 for `/`, `/demo`,
`/privacy`, and `/terms`; the designed missing route returned HTTP 404.
Each had one h1 and route-specific title. All internal links returned expected
200s; checkout deliberately returned its hosted Dodo 303. The header/footer,
skip link, Privacy/Terms links, focus/back navigation, reduced-motion path,
mobile overflow/touch targets, axe checks, security headers, robots, sitemap,
favicon, and console checks passed in the fresh browser suite.

## Earlier history

There are no prior `.factory/review-*.md` or `.factory/polish-*.md` files.
I read the handoff and every `verification*.md` and rechecked their findings:
installer parsing/manifest, fleet checkout, 404, phone-first action, signer
continuity, device selection, Homebrew/Scoop, clone prerequisites, output
recovery, fleet sanitization/expiry, demo discard, storage boundary, Mac
selection, crate packaging, cache policy, predictable temporary files, and
touch targets are fixed by current passing live or clean-clone tests. The
earlier claims-inventory finding is not fully resolved: F-1-1/F-1-2 identify
remaining proof gaps.

## Missed leverage

No AI feature is warranted by the brief: a deterministic read-only diagnostic
must not add uncertain model output. The expected companion functions already
exist: browser and CLI sample paths, JSON output, local redacted reports,
fleet import, and installers.

## What would make this perfect

Close F-1-1 and F-1-2 with observable tests (or remove the promises), then
apply the heading rewrites and route-specific metadata. Re-run this full clean
first-read and claims checklist; only zero findings earns PASS.
