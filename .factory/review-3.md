# Adversarial first-read review 3

**Product:** Sideload Readiness  
**URL:** <https://sideload-readiness.sociobot.in>  
**Reviewed commit:** `420ae60b8f5f22514db575064cb1cae7b6cdbe0e`  
**Date:** 2026-08-29 UTC  
**Verdict:** **FAIL**

No blocking finding remains. The live deployment byte-matches the reviewed
build, all 29 declared claim tests pass from a clean clone, and no untested
claim-like sentence was found. Four contextless headings remain, so the review
cannot pass under the zero-finding rule.

## First screen: cold mobile and desktop

Fresh Chromium contexts at 390 × 844 and 1440 × 900 opened the live root with
no cookies, storage, service worker, or navigation history.

| Question | Answer before scrolling | Exact first-screen text |
| --- | --- | --- |
| What does it do? | Checks Android update safety. | `Check Android update safety` |
| Who is it for? | People maintaining approved sideloaded apps when device rules or recovery paths change. | `For people who maintain approved sideloaded apps when device rules or recovery paths change.` |
| What should I click first? | Open the ready-made sample report. | `Try it with sample data` → `See a redacted report and the next safe step.` |

On mobile, the sample action occupied y=442–491 and the outcome text ended at
y=528. Both were visible without scrolling. The same three answers were clear
on desktop. No first-screen blocking finding exists.

## Findings

There are no blocking findings. Minor findings are ordered by page sequence.

### F-3-1 — MINOR — the first operating step does not name what to connect

**Exact quote/location:** landing page, “How the readiness check works” h3:
`Connect`.

**Why this loses a first-time visitor:** In a screen-reader heading list,
`Connect` has no object. A visitor cannot tell whether the step means connecting
the device, cable, adb session, or account without leaving the heading list.

**Concrete fix:** Rename the h3 to `Connect one Android device`.

### F-3-2 — MINOR — the second operating step does not name what is checked

**Exact quote/location:** landing page, “How the readiness check works” h3:
`Check`.

**Why this loses a first-time visitor:** The generic verb carries no usable
information out of context and does not distinguish this step from the whole
product's readiness check.

**Concrete fix:** Rename the h3 to `Check device and app readiness`.

### F-3-3 — MINOR — the third operating step states a mood instead of the task

**Exact quote/location:** landing page, “How the readiness check works” h3:
`Act safely`.

**Why this loses a first-time visitor:** `Safely` does not say what action the
report enables. In a heading list, the visitor cannot tell that this step means
following or stopping at the report's next step.

**Concrete fix:** Rename the h3 to `Follow the report’s next step`.

### F-3-4 — MINOR — the README usage heading has no out-of-context meaning

**Exact quote/location:** `README.md` h2: `Use`.

**Why this loses a first-time visitor:** `Use` does not identify the CLI task
when headings are scanned alone. It could introduce the demo, installer, fleet
review, or device check.

**Concrete fix:** Rename the h2 to `Run a device readiness check`.

## Copy audit

Counts treat hyphenated terms, URLs, code identifiers, and version numbers as
one word. Headings, actions, facts, statuses, and sentence fragments that carry
meaning are included. Commands are excluded because they are code rather than
sentences. No item exceeds 22 words. No marketing adjective, empty slogan,
inconsistent product term, or non-result-naming button was found. Four heading
flags are findings F-3-1 through F-3-4. Literal uses of “unlock” describe a
prohibited device operation and are not promotional uses of the word.

### Landing page

| Text | Words | Audit |
| --- | ---: | --- |
| Android maintenance / read-only checks | 4 | clear label |
| Check Android update safety | 4 | clear h1 |
| For people who maintain approved sideloaded apps when device rules or recovery paths change. | 14 | clear audience and change |
| Try it with sample data | 5 | result-naming action |
| See a redacted report and the next safe step. | 9 | clear outcome |
| Read-only adb checks | 3 | listed claim |
| Device IDs are redacted | 4 | listed claim |
| Free for one device | 4 | listed claim |
| Sample readiness report | 3 | clear section heading |
| Readiness report / sample | 3 | clear label |
| 83% · Fix one item before recovery | 6 | clear sample status |
| Authorized USB debugging | 3 | clear finding |
| One authorized sample device is visible to adb. | 8 | clear sample detail |
| Keep the authorization prompt accepted while checking. | 7 | clear next step |
| Developer options | 2 | clear finding |
| Developer options are enabled. | 4 | clear sample detail |
| Leave this unchanged for approved maintenance. | 6 | clear next step |
| USB data mode | 3 | clear finding |
| The sample device exposes adb over USB. | 7 | clear sample detail |
| Use a data-capable cable if this changes. | 7 | clear next step |
| Free data storage | 3 | clear finding |
| 2.8 GiB free on /data. | 5 | clear sample detail |
| The 1 GiB safety floor is met. | 7 | clear sample detail |
| Keep the floor before copying an update. | 7 | clear next step |
| Package signer match | 3 | clear finding |
| The installed sample signer SHA-256 matches the expected approved signer. | 10 | clear sample detail |
| Keep the approved APK and signer digest with this report. | 10 | clear next step |
| Recovery update visibility | 3 | clear finding |
| A/B update support is visible, but Android cannot safely prove recovery sideload status while running. | 15 | clear limitation |
| Read your device’s approved recovery instructions before using recovery. | 9 | clear next step |
| Recovery checklist | 2 | clear subheading |
| Keep the approved APK and its known-good version. | 8 | clear checklist item |
| Record the app package and signer before an update. | 9 | clear checklist item |
| Stop after an error and save the report before retrying. | 10 | clear checklist item |
| Install the command-line tool | 4 | clear section heading |
| Wrote readiness.md | 2 | clear terminal result |
| Signer matched. | 2 | clear terminal status |
| Review recovery before updating. | 4 | clear terminal status |
| The command asks adb for status. | 6 | listed claim |
| It does not install apps, unlock devices, or change Android settings. | 11 | listed literal limitation |
| The macOS package and Windows app are unsigned. | 8 | listed claim |
| Verify the matching Sigstore bundle before installation. | 7 | direct instruction |
| Open release downloads | 3 | result-naming action |
| Linux and macOS installer | 4 | clear link |
| PowerShell installer | 2 | clear link |
| Checking published downloads. | 3 | clear status |
| Opening the checksummed download. | 4 | clear status |
| Choose your Mac type | 4 | clear choice heading/action |
| Apple silicon Mac (.pkg) | 4 | clear choice |
| Intel Mac (.pkg) | 3 | clear choice |
| Choose Apple silicon or Intel before downloading. | 7 | clear instruction |
| This browser does not identify a supported desktop system. | 9 | clear error |
| Open releases to choose a file. | 6 | clear recovery action |
| Downloads are being published. | 4 | clear error |
| Open the release page for the current status. | 8 | clear recovery action |
| How the readiness check works | 5 | clear section heading |
| Connect | 1 | **F-3-1: object missing** |
| Accept Android’s USB debugging prompt. | 5 | direct instruction |
| Choose a device when adb lists more than one. | 9 | listed claim |
| Check | 1 | **F-3-2: subject missing** |
| Compare the installed signer SHA-256 with the approved APK. | 9 | listed claim |
| Read storage, USB state, and recovery clues. | 7 | direct instruction |
| Act safely | 2 | **F-3-3: task not named** |
| Save a redacted report. | 4 | listed claim |
| Follow its next step or stop before an update. | 9 | direct instruction |
| What this tool does and does not do | 8 | clear section heading |
| What the CLI checks | 4 | clear subheading |
| Make a device-specific report from read-only adb queries. | 8 | listed claim |
| It explains what to check next. | 6 | listed outcome |
| What the CLI never does | 5 | clear subheading |
| It never bypasses Android controls, unlocks bootloaders, or distributes APKs. | 10 | listed literal limitation |
| Small IT teams | 3 | clear audience label |
| Fleet report review | 3 | clear section heading |
| Fleet review is a $39 one-time license. | 7 | listed claim |
| It adds a local report queue and package-status table. | 9 | listed claim |
| Single-device checks stay free. | 4 | listed claim |
| $39 one-time purchase | 3 | exact price |
| Buy fleet review | 3 | result-naming action |
| Have a license? | 3 | clear prompt |
| Paste it here. | 3 | direct instruction |
| Verify fleet license | 3 | result-naming action |
| Verification happens with Sociobot when you choose this button. | 9 | listed claim |
| Read-only Android update checks for cautious maintainers. | 7 | informative footer sentence |

### README

| Sentence or heading | Words | Audit |
| --- | ---: | --- |
| Sideload Readiness | 2 | title |
| Check Android update safety before you update an approved sideloaded app. | 11 | clear summary |
| Sideload Readiness is for Android power users and small IT teams. | 11 | clear audience |
| It runs read-only adb checks, writes a redacted report, and gives a recovery checklist. | 14 | listed claims |
| It never installs an APK, changes Android settings, unlocks a bootloader, or bypasses a device policy. | 16 | listed literal limitation |
| The one-click browser demo is at sideload-readiness.sociobot.in/?demo=1. | 7 | direct path |
| It uses sample data in a separate browser key. | 9 | listed claim |
| Nothing in demo mode touches a connected Android device. | 9 | listed claim |
| Install | 1 | clear heading |
| Releases support Linux, macOS, and Windows. | 6 | listed claim |
| Each published archive has a SHA-256 line in SHA256SUMS. | 9 | listed claim |
| The installers download the matching release, verify its SHA-256 checksum, then place the binary on your PATH. | 17 | listed claim |
| Every current release payload and manifest has a valid GitHub OIDC Sigstore bundle. | 13 | listed claim |
| Verify a downloaded asset with: | 5 | direct instruction |
| The macOS package and Windows app are unsigned. | 8 | listed claim |
| Verify their Sigstore bundles before installation. | 6 | direct instruction |
| On macOS, right-click the package and choose Open. | 8 | direct instruction |
| Install with the published Homebrew tap: | 6 | direct instruction |
| Install with the published Scoop bucket: | 6 | direct instruction |
| The winget/ folder contains the checksum-pinned v0.1.4 manifest. | 8 | repository fact |
| The owner must submit it to microsoft/winget-pkgs before advertising a winget command. | 12 | explicit operator action |
| Use | 1 | **F-3-4: subject missing** |
| Connect one device and accept Android’s USB debugging prompt. | 9 | direct instruction |
| If adb lists several authorized devices, the command stops until you pass --device SERIAL. | 14 | listed claim |
| Get the expected signer SHA-256 from your approved APK: | 9 | direct instruction |
| Compare that digest with the installed package: | 7 | direct instruction |
| The command reads the installed base APK through adb and parses its signing certificate locally. | 15 | listed claim |
| A matching digest is ready, and a mismatch is blocked. | 10 | listed claim |
| If the package or certificate cannot be read, the result is needs-review. | 12 | listed claim |
| Use JSON in scripts: | 4 | direct instruction |
| Try the bundled sample without adb: | 6 | direct instruction |
| The sample creates one private, unpredictable temporary report file and prints its path. | 13 | listed claim |
| It never reuses an existing temporary filename. | 7 | listed claim |
| --output PATH is different: it writes the requested path and replaces that file when it already exists. | 17 | listed claim |
| examples/sample-report.json documents the stable schema and values. | 7 | listed claim |
| The report checks: | 3 | clear lead-in |
| Authorized USB debugging and USB data mode. | 7 | listed claim |
| Developer options visibility. | 3 | listed claim |
| Free /data storage against a 1 GiB safety floor. | 9 | listed claim |
| Installed signer SHA-256 comparison when a package and expected signer are supplied. | 12 | listed claim |
| A/B update hints and a recovery checklist. | 7 | listed claim |
| Android does not expose a safe, complete recovery-sideload status while it is running. | 13 | listed diagnostic limitation |
| The report labels that check needs-review and tells you to use the device maker’s approved recovery instructions. | 17 | listed claim |
| Fleet review | 2 | clear heading |
| Single-device reports are free. | 4 | listed claim |
| Fleet review is a $39 one-time license. | 7 | listed claim |
| It adds a local report queue and a package-status table on the site. | 13 | listed claim |
| Checkout and license verification use Sociobot; no payment provider is embedded here. | 12 | listed claim |
| Develop and verify | 3 | clear heading |
| Requirements: current Rust stable, Node 20+, and adb only for a live check. | 13 | concrete requirement |
| npm run build:site creates the deployable static site in dist/site. | 10 | verified developer instruction |
| The factory deploys that directory; this repository does not manage DNS or cloud infrastructure. | 14 | clear scope statement |
| npm run build is an alias for the deploy build. | 10 | verified developer instruction |
| Release installers are built only in GitHub Actions by .github/workflows/release.yml. | 10 | verified repository fact |
| npm test includes desktop and 390 px mobile browser checks for keyboard use, accessibility, offline reloads, privacy, and release-download behavior. | 20 | verified developer instruction |
| Privacy and license | 3 | clear heading |
| The CLI has no report-upload command. | 6 | listed claim |
| It only runs local adb commands and writes an output file when requested. | 13 | listed claim |
| Hardware serials are replaced with a redacted ID in exported reports. | 11 | listed claim |
| The site has no analytics or third-party runtime scripts. | 9 | listed claim |
| See Privacy and Terms. | 4 | direct navigation |
| License | 1 | clear heading |
| MIT | 1 | clear license link |

Terminology is consistent: `report`, `approved APK`, `package`, `signer
SHA-256`, `adb`, `recovery checklist`, and `fleet review` each name one concept.

## Demo and sandbox behaviour

**Pass.** One click from the fresh 390 px landing page opened `/?demo=1`.
The first resulting viewport contained the persistent `Demo — sample data,
nothing is saved.` banner, Reset demo, Start for real, the demo headline, and
the top of a realistic report for `device-6f31a0b2`. The report contained six
findings, including a needs-review recovery result, and a checklist.

A pre-seeded `real:sentinel` value survived entry, Reset, reload, offline
reload, and exit. Demo mode created only `demo:sideload-readiness`; Reset
recreated that key; Start for real removed it. Instrumented WebUSB and Web
Serial APIs recorded zero requests. The request log contained only
`https://sideload-readiness.sociobot.in`, and the console contained no errors.

The CLI demo also ran from a fresh temporary directory. It wrote an
unpredictably named mode-0600 JSON report with schema `sideload-readiness/v1`,
the redacted sample device, six findings, and five recovery checklist items.

## Claims

**Pass: 29 of 29.** A local, no-hardlink clone of reviewed commit `420ae60`
was used. Every exact `test` command in `.factory/claims.json` ran separately
and passed:

| Claim IDs | Result |
| --- | --- |
| `demo-report`, `json-report`, `redacted-id`, `read-only-checks`, `unauthorized-device` | PASS |
| `signer-continuity`, `signer-unreadable`, `diagnostic-report`, `example-schema`, `device-selection` | PASS |
| `demo-no-adb`, `private-demo-file`, `explicit-output-replacement`, `single-device-free`, `local-demo` | PASS |
| `browser-demo-no-device`, `privacy`, `fleet-review`, `license-verification`, `license-retention` | PASS |
| `fleet-checkout`, `verified-installer`, `platform-packaging`, `release-manifest`, `release-signatures` | PASS |
| `release-checksums`, `unsigned-platform-disclosure`, `billing-provider-boundary`, `published-installer-paths` | PASS |

The public-release tests downloaded the current artifacts and passed checksum,
platform-signing disclosure, and pinned Cosign verification. Cross-checking
the live landing page and current README found no unlisted product claim.

## Earlier findings

Every earlier review, polish record, and current handoff was read. Each finding
was rechecked in production and source rather than accepted from its closure
note.

| Earlier ID | Fresh confirmation |
| --- | --- |
| F-1-1 | `release-signatures` downloaded every current payload/manifest and passed pinned Cosign verification. |
| F-1-2 | Signer failure, diagnostic, example-schema, unsigned-platform, and billing-boundary claims remain listed and their tests pass. |
| F-1-3 | Live and source heading is `How the readiness check works`. |
| F-1-4 | Live and source subheadings are `What the CLI checks` and `What the CLI never does`. |
| F-1-5 | Live and source heading is `Install the command-line tool`. |
| F-1-6 | Home, demo, privacy, terms, and 404 expose distinct titles, descriptions, canonicals, and Open Graph metadata. |
| F-2-1 | `browser-demo-no-device` and `release-checksums` remain listed; both exact tests pass, device calls are zero, and Permissions Policy disables USB/Serial. |
| F-2-2 | Live and source heading is `Sample readiness report`. |
| F-2-3 | Live and source heading is `Fleet report review`. |

No earlier finding is unfixed, half-fixed, or regressed. F-3-1 through F-3-4
are newly identified copy findings.

## Structure, accessibility, routing, and links

**Pass except for the heading copy in F-3-1 through F-3-3.**
`node scripts/verify-live.mjs` confirmed byte identity between the build and
deployment. `/`, `/?demo=1`, `/demo`, `/privacy`, and `/terms`
return 200; the designed missing route returns HTTP 404. Every route has the
required title pattern, description, canonical and Open Graph metadata, one
h1, landmarks, consistent header/footer, Privacy and Terms links, favicon,
and product artwork. The sitemap lists every real route.

History navigation restores the route and focuses the h1. Keyboard operation,
the skip link, route announcements, reduced motion, 200% text, 390 px overflow,
44 px targets, and offline demo reload all pass. Axe found zero serious or
critical issue on every route. The complete live browser matrix passed 69 tests
with one intentional project-only skip. The link crawl found working fragments,
200 responses for site/install/GitHub/Sociobot links, and the expected 303 from
the Sociobot checkout endpoint to its hosted checkout. There was no dead link.

The concrete-and-moss field-tag identity, original rugged-device artwork,
squared controls, evidence-strip layout, and monospace evidence type match
`.factory/design.md` and are recognisable rather than a generic SaaS template.
Built JavaScript is 7,384 bytes gzip and CSS is 2,732 bytes gzip.

## Quality gates

From the clean clone:

- `npm test`: 23 Node tests passed; 69 Playwright tests passed and one
  intentional project-specific case was skipped.
- `npm run build`: passed and produced `dist/site`.
- `cargo fmt --check`: passed.
- `cargo clippy --all-targets --all-features -- -D warnings`: passed.
- `cargo test --all-targets`: 21 tests passed.

The same 70-case browser matrix against production passed 69 with the one
expected skip. Production emitted no page or console error.

## Missed leverage

No obvious feature is missing from the brief. A model-generated readiness
decision would reduce confidence in a deterministic safety diagnostic, so an
AI feature is not warranted. The useful adjacent capabilities are present:
one-click sample data, the real CLI demo, JSON export, local fleet import,
platform installers, and isolated local storage. Sync would conflict with the
local-first privacy boundary unless a separate user need is established. No AI
feature, provider key, or decorative AI copy exists.

## What would make this perfect

Apply the four exact heading rewrites in F-3-1 through F-3-4. Then rerun the
heading-list and full checklist; all runtime, claims, demo, routing, and visual
checks are already clean. Only zero findings should change the verdict to PASS.
