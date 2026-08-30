# Adversarial first-read review 4

**Product:** Sideload Readiness

**URL:** <https://sideload-readiness.sociobot.in>

**Reviewed commit:** `e653e7713cdd8bc0668c4de1007b246b2be406bf`

**Date:** 2026-08-30 UTC

**Verdict:** **FAIL**

The deployed product is clear, tryable, visually distinct, and operationally
sound. This round still fails because one visitor-facing pricing claim has a
tagged test that exercises the sample command instead of the claimed real
single-device check. The claim is therefore untested under the required
contract even though its command exits successfully.

## First screen: cold mobile and desktop

Fresh Chromium contexts at 390 × 844 and 1440 × 900 opened production with no
cookies, storage, service worker, or navigation history. Nothing was scrolled
before recording these answers.

| Question | Answer before scrolling | Exact first-screen text |
| --- | --- | --- |
| What does this do? | Checks Android update safety. | `Check Android update safety` |
| Who is it for? | People maintaining approved sideloaded apps when device rules or recovery paths change. | `For people who maintain approved sideloaded apps when device rules or recovery paths change.` |
| What should I click first? | Open the sample report. | `Try it with sample data` and `See a redacted report and the next safe step.` |

At 390 px, the sample action occupied y=442–491 and its outcome ended at y=528.
The three short facts ended at y=628, all before the 844 px fold. Desktop gave
the same three answers before scrolling. No first-screen finding exists.

## Findings

### F-4-1 — BLOCKING — the free real-device check is not tested

**Exact quote/location:** landing first-screen fact `Free for one device`;
landing Fleet section `Single-device checks stay free.`; README Fleet review
`Single-device reports are free.`; `.factory/claims.json` entry
`single-device-free`: `A single-device readiness check works without a fleet
license.`

**Evidence:** The declared command
`cargo test --test cli claim_single_device_check_is_free -- --exact` passes.
Its tagged test calls `run_demo_json("claim-free-device")`, then asserts only
that `mode` is `demo` and the sample contains six findings. It never invokes
`sideload-readiness check`, never supplies a one-device fake-adb fixture, and
never observes whether the real check path is available without license or
account state. The claim sandbox repeats the mismatch by specifying a
`one-device demo command` for a claim about a readiness check.

**Why this misleads a first-time visitor:** The free/paid boundary is a purchase
decision. A free sample does not prove that the real device check advertised as
free can run without the $39 fleet license. Under the claims contract, a green
test that exercises a different path leaves the claim untested.

**Concrete fix:** Change the `single-device-free` sandbox and tagged test to run
the public `check` command against one authorized fake-adb device, with no
license token, cached verdict, account state, or license environment variable.
Assert successful completion and a real readiness report. Keep the browser
Fleet tools locked in the same test or a paired browser assertion so the
single-device/fleet boundary is observable. Do not use `demo` as the proof.

## Copy audit

Counts split on whitespace after standalone separators such as `/` and `·` are
discarded; hyphenated terms, identifiers, URLs, and version numbers count as
one word. Commands are code and are excluded. Repeated status labels are listed
once. Headings, actions, facts, accessible image text, and reachable dynamic
states are included. No copy unit exceeds 22 words. No
banned marketing adjective, unexplained slogan, metaphor heading, inconsistent
product term, or non-result-naming button was found. Literal uses of `unlock`
describe prohibited device operations.

### Landing page

| Copy unit | Words | Audit |
| --- | ---: | --- |
| SR/01 | 1 | wordmark |
| Demo | 1 | navigation |
| Install | 1 | navigation |
| Fleet | 1 | navigation |
| Privacy | 1 | navigation |
| Android maintenance / read-only checks | 4 | clear label |
| Check Android update safety | 4 | clear h1 |
| For people who maintain approved sideloaded apps when device rules or recovery paths change. | 14 | clear audience and situation |
| Try it with sample data | 5 | result-naming action |
| See a redacted report and the next safe step. | 9 | clear outcome |
| Read-only adb checks | 3 | listed claim |
| Device IDs are redacted | 4 | listed claim |
| Free for one device | 4 | **F-4-1: inadequately tested claim** |
| A rugged handheld device and USB cable rest on concrete beside small patches of moss. | 15 | useful image alternative |
| Sample readiness report | 3 | clear h2 |
| Readiness report / sample | 3 | clear report label |
| device-6f31a0b2 · Android 15 (sample) | 4 | concrete sample identity |
| 83% · Fix one item before recovery | 6 | concrete sample status |
| Authorized USB debugging | 3 | clear finding |
| ready | 1 | clear state; repeated |
| One authorized sample device is visible to adb. | 8 | sample detail |
| Keep the authorization prompt accepted while checking. | 7 | direct next step |
| Developer options | 2 | clear finding |
| Developer options are enabled. | 4 | sample detail |
| Leave this unchanged for approved maintenance. | 6 | direct next step |
| USB data mode | 3 | clear finding |
| The sample device exposes adb over USB. | 7 | sample detail |
| Use a data-capable cable if this changes. | 7 | direct next step |
| Free data storage | 3 | clear finding |
| 2.8 GiB free on /data. | 5 | concrete sample detail |
| The 1 GiB safety floor is met. | 7 | concrete sample detail |
| Keep the floor before copying an update. | 7 | direct next step |
| Package signer match | 3 | clear finding |
| The installed sample signer SHA-256 matches the expected approved signer. | 10 | sample detail |
| Keep the approved APK and signer digest with this report. | 10 | direct next step |
| Recovery update visibility | 3 | clear finding |
| needs review | 2 | clear state |
| A/B update support is visible, but Android cannot safely prove recovery sideload status while running. | 15 | clear limitation |
| Read your device’s approved recovery instructions before using recovery. | 9 | direct next step |
| Recovery checklist | 2 | clear h3 |
| Keep the approved APK and its known-good version. | 8 | checklist item |
| Record the app package and signer before an update. | 9 | checklist item |
| Stop after an error and save the report before retrying. | 10 | checklist item |
| Install the command-line tool | 4 | clear h2 |
| A sample terminal session that runs the demo and writes a report. | 12 | useful accessible label |
| Wrote readiness.md | 2 | concrete result |
| Signer matched. | 2 | concrete result |
| Review recovery before updating. | 4 | direct next step |
| The command asks adb for status. | 6 | listed claim |
| It does not install apps, unlock devices, or change Android settings. | 11 | listed limitation |
| The macOS package and Windows app are unsigned. | 8 | listed claim |
| Verify the matching Sigstore bundle before installation. | 7 | direct instruction |
| Open release downloads | 3 | result-naming action |
| Linux and macOS installer | 4 | descriptive link |
| PowerShell installer | 2 | descriptive link |
| Checking published downloads. | 3 | clear status |
| Opening the checksummed download. | 4 | clear status |
| Choose your Mac type | 4 | result-naming action |
| Apple silicon Mac (.pkg) | 4 | clear choice |
| Intel Mac (.pkg) | 3 | clear choice |
| Choose Apple silicon or Intel before downloading. | 7 | direct instruction |
| This browser does not identify a supported desktop system. | 9 | clear error |
| Open releases to choose a file. | 6 | recovery action |
| Downloads are being published. | 4 | clear error |
| Open the release page for the current status. | 8 | recovery action |
| How the readiness check works | 5 | clear h2 |
| Connect one Android device | 4 | clear h3 |
| Accept Android’s USB debugging prompt. | 5 | direct instruction |
| Choose a device when adb lists more than one. | 9 | listed behavior |
| Check device and app readiness | 5 | clear h3 |
| Compare the installed signer SHA-256 with the approved APK. | 9 | direct instruction |
| Read storage, USB state, and recovery clues. | 7 | direct instruction |
| Follow the report’s next step | 5 | clear h3 |
| Save a redacted report. | 4 | direct instruction |
| Follow its next step or stop before an update. | 9 | direct instruction |
| What this tool does and does not do | 8 | clear h2 |
| What the CLI checks | 4 | clear h3 |
| Make a device-specific report from read-only adb queries. | 8 | direct description |
| It explains what to check next. | 6 | concrete outcome |
| What the CLI never does | 5 | clear h3 |
| It never bypasses Android controls, unlocks bootloaders, or distributes APKs. | 10 | listed limitation |
| Small IT teams | 3 | clear audience label |
| Fleet report review | 3 | clear h2 |
| Fleet review is a $39 one-time license. | 7 | exact price |
| It adds a local report queue and package-status table. | 9 | listed claim |
| Single-device checks stay free. | 4 | **F-4-1: inadequately tested claim** |
| $39 one-time purchase | 3 | exact price |
| Buy fleet review | 3 | result-naming action |
| Have a license? | 3 | clear prompt |
| Paste it here. | 3 | direct instruction |
| Verify fleet license | 3 | result-naming action |
| Verification happens with Sociobot when you choose this button. | 9 | clear disclosure |
| Paste a license token, then verify it. | 7 | recoverable validation error |
| Checking your license… | 3 | clear status |
| Fleet review is active on this browser. | 7 | clear status |
| That license is not active. | 5 | clear error |
| You can buy a new fleet review license. | 8 | recovery action |
| The license could not be checked. | 6 | clear error |
| Your free single-device report still works. | 6 | clear fallback; same F-4-1 proof gap |
| Add redacted JSON reports | 4 | result-naming file action |
| No reports are queued. | 4 | clear empty state |
| Choose redacted JSON reports to begin. | 6 | direct empty-state action |
| local report queued. | 3 | clear count status |
| No reports added. | 3 | clear error |
| is not a valid redacted Sideload Readiness report. | 8 | clear file-specific error template |
| Choose a JSON report exported by the CLI. | 8 | recovery action |
| Read-only Android update checks for cautious maintainers. | 7 | informative footer sentence |
| Terms | 1 | footer link |
| Built by Param Factory | 4 | footer link |
| v0.1.4 | 1 | build identifier |

### README

| Sentence or heading | Words | Audit |
| --- | ---: | --- |
| Sideload Readiness | 2 | document title |
| Check Android update safety before you update an approved sideloaded app. | 11 | clear summary |
| Sideload Readiness is for Android power users and small IT teams. | 11 | clear audience |
| It runs read-only adb checks, writes a redacted report, and gives a recovery checklist. | 14 | listed claims |
| It never installs an APK, changes Android settings, unlocks a bootloader, or bypasses a device policy. | 16 | listed limitation |
| The one-click browser demo is at sideload-readiness.sociobot.in/?demo=1. | 7 | direct path |
| It uses sample data in a separate browser key. | 9 | listed claim |
| Nothing in demo mode touches a connected Android device. | 9 | listed claim |
| Install | 1 | clear h2 |
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
| Run a device readiness check | 5 | clear h2 |
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
| Fleet review | 2 | clear h2 |
| Single-device reports are free. | 4 | **F-4-1: inadequately tested claim** |
| Fleet review is a $39 one-time license. | 7 | exact price |
| It adds a local report queue and a package-status table on the site. | 13 | listed claim |
| Checkout and license verification use Sociobot; no payment provider is embedded here. | 12 | listed claim |
| Develop and verify | 3 | clear h2 |
| Requirements: current Rust stable, Node 20+, and adb only for a live check. | 13 | concrete requirement |
| npm run build:site creates the deployable static site in dist/site. | 10 | verified developer instruction |
| The factory deploys that directory; this repository does not manage DNS or cloud infrastructure. | 14 | clear scope |
| npm run build is an alias for the deploy build. | 10 | verified developer instruction |
| Release installers are built only in GitHub Actions by .github/workflows/release.yml. | 10 | verified repository fact |
| npm test includes desktop and 390 px mobile browser checks for keyboard use, accessibility, offline reloads, privacy, and release-download behavior. | 20 | verified developer instruction |
| Privacy and license | 3 | clear h2 |
| The CLI has no report-upload command. | 6 | listed claim |
| It only runs local adb commands and writes an output file when requested. | 13 | listed claim |
| Hardware serials are replaced with a redacted ID in exported reports. | 11 | listed claim |
| The site has no analytics or third-party runtime scripts. | 9 | listed claim |
| See Privacy and Terms. | 4 | direct navigation |
| License | 1 | clear h2 |
| MIT | 1 | license link |

Terminology is consistent:

| Concept | Term used |
| --- | --- |
| Android maintenance result | report |
| Permitted app file | approved APK |
| Installed application identifier | package |
| Signing certificate identifier | signer SHA-256 |
| System connection command | adb |
| Restore instructions | recovery checklist |
| Multi-device paid feature | fleet review |

## Demo and sandbox behavior

The required browser demo passes. One click from the cold 390 px first screen
opened `/?demo=1`. Its first viewport already showed the persistent `Demo —
sample data, nothing is saved.` banner, Reset demo, Start for real, a realistic
sample-device headline, report score, device ID, and the first report finding.
The full sample contains six findings, one needs-review recovery result, and a
recovery checklist.

A seeded `real:sentinel` survived demo entry, Reset, reload, offline reload, and
Start for real. Demo mode created only `demo:sideload-readiness`; reset recreated
that key; exit removed it. Instrumented WebUSB and Web Serial APIs recorded zero
requests. The full fresh flow requested only the product origin and loaded no
third-party runtime code.

The real CLI demo also passed in `/tmp/sr-review4-cli.yjPCTt`. It wrote
`sideload-readiness-demo-YMceme.json` with mode 0600, schema
`sideload-readiness/v1`, the redacted sample device, six findings, and five
recovery items. It printed the unpredictable output path and required no adb.

## Claims verification

A no-hardlink clean clone at
`/tmp/sideload-readiness-review4.KmnFPI/repo` was created from the reviewed
commit. Every exact `test` command in `.factory/claims.json` ran separately.

| Claim | Command result | Observable review result |
| --- | --- | --- |
| `demo-report` | PASS | Six-finding redacted sample and checklist produced |
| `json-report` | PASS | Demo JSON parsed |
| `redacted-id` | PASS | Known adb serial absent from exported report |
| `read-only-checks` | PASS | adb operations and public commands remain non-mutating |
| `unauthorized-device` | PASS | Unauthorized device refused with next step |
| `signer-continuity` | PASS | Installed signer extracted and matched/mismatched |
| `signer-unreadable` | PASS | Invalid APK produced needs-review |
| `diagnostic-report` | PASS | Live fake-device report covered every documented check |
| `example-schema` | PASS | Committed example matched public demo output |
| `device-selection` | PASS | Multiple devices required explicit selection |
| `demo-no-adb` | PASS | Demo used no adb and wrote a temporary report |
| `private-demo-file` | PASS | Distinct mode-0600 files resisted collisions |
| `explicit-output-replacement` | PASS | Requested output was replaced |
| `single-device-free` | PASS command | **UNTESTED claim: F-4-1; only demo ran** |
| `local-demo` | PASS | Separate demo namespace preserved real sentinel |
| `browser-demo-no-device` | PASS | Zero WebUSB/Web Serial requests |
| `privacy` | PASS | Same-origin-only browser flow |
| `fleet-review` | PASS | Valid fixture verdict enabled local queue/table |
| `license-verification` | PASS | Token sent to Sociobot only after submit |
| `license-retention` | PASS | Expired verdict removed after 24 hours |
| `fleet-checkout` | PASS | Sociobot returned hosted Dodo checkout redirect |
| `verified-installer` | PASS | Linux/macOS fixture installers verified checksums |
| `platform-packaging` | PASS | Required release matrix retained |
| `release-manifest` | PASS | Absolute URL for every supported platform |
| `release-signatures` | PASS | Current payloads/manifests passed pinned Cosign verification |
| `release-checksums` | PASS | Current release archives matched SHA256SUMS |
| `unsigned-platform-disclosure` | PASS | Current macOS/Windows signing state confirmed |
| `billing-provider-boundary` | PASS | Runtime billing endpoints are Sociobot-only |
| `published-installer-paths` | PASS | Public shell, PowerShell, Homebrew, and Scoop paths verified |

No other claim-like landing or README sentence lacks a claims entry. F-4-1
means the suite contains one untested claim despite 29 successful commands, so
the claims gate is not accepted.

## Earlier finding verification

Every earlier review, polish record, and the incoming handoff was read. Each
finding was checked against both current source and production rather than
accepted from its closure note.

| Earlier ID | Current confirmation |
| --- | --- |
| F-1-1 | `release-signatures` downloaded the current release and passed pinned Cosign verification. |
| F-1-2 | Signer-failure, diagnostic, example, unsigned-platform, and billing-boundary entries remain listed; their exact tests pass. |
| F-1-3 | Live and source h2 is `How the readiness check works`. |
| F-1-4 | Live and source h3s are `What the CLI checks` and `What the CLI never does`. |
| F-1-5 | Live and source h2 is `Install the command-line tool`. |
| F-1-6 | Home, demo, privacy, terms, and 404 have distinct title, description, canonical, Open Graph title/URL, and Twitter metadata. |
| F-2-1 | Browser device calls remain zero; Permissions Policy disables USB/Serial; current release checksums pass. |
| F-2-2 | Live and source h2 is `Sample readiness report`. |
| F-2-3 | Live and source h2 is `Fleet report review`. |
| F-3-1 | Live and source h3 is `Connect one Android device`. |
| F-3-2 | Live and source h3 is `Check device and app readiness`. |
| F-3-3 | Live and source h3 is `Follow the report’s next step`. |
| F-3-4 | README h2 is `Run a device readiness check`. |

No earlier finding is unfixed, half-fixed, or regressed. F-4-1 is a newly
identified proof mismatch in an existing claim.

## Structure, accessibility, routing, links, and identity

The local production build byte-matches the live HTML, fingerprinted CSS/JS,
service worker, and responsive hero asset. `/`, `/?demo=1`, `/demo`, `/privacy`,
and `/terms` return 200. A missing path returns the designed 404 document with
HTTP 404 and a return action. Each route has one h1, valid heading order,
landmarks, its required title pattern, description, canonical, Open Graph and
Twitter fields, favicon, and the shared header/footer with Privacy and Terms.
The Open Graph art is 1200 × 630 and the Apple touch icon is 180 × 180.

History back restores the landing route and focuses its h1. Route changes are
announced. The skip link, keyboard operation, reduced-motion path, 200% text,
390 px overflow, 44 px targets, and offline demo reload pass. Playwright Axe
found no serious or critical issue on home, demo, privacy, terms, or 404. No
page or console error occurred.

The crawl resolved all internal routes, installers, GitHub Releases, and
Sociobot links. Checkout returned the expected 303 to the hosted Dodo flow;
there was no purchase. No dead link was found.

The concrete-and-moss field-tag treatment, original rugged-device art, square
controls, evidence-strip report, monospace display face, and restrained moss
motion match `.factory/design.md`. This is recognisable and not a generic SaaS
template. Built JavaScript is 21,726 bytes raw / 7,396 bytes gzip; CSS is 8,278
bytes raw / 2,732 bytes gzip.

## Supporting quality gates

From the clean clone:

- `cargo fmt --check`: passed.
- `cargo clippy --all-targets --all-features -- -D warnings`: passed.
- `cargo test --all-targets`: 21 passed.
- `npm test`: 24 Node tests passed; 69 Playwright tests passed and one
  intentional project-specific case was skipped.
- `npm run build`: passed and produced `dist/site`.
- `node scripts/verify-live.mjs https://sideload-readiness.sociobot.in`:
  passed byte identity, metadata, demo isolation, mobile, offline, request-log,
  console, and Axe checks.

## Missed leverage

No obvious feature is missing from the brief. A model-generated safety decision
would weaken a deterministic diagnostic, so an AI step is not warranted. The
useful adjacent paths already exist: browser and CLI samples, JSON export,
local fleet import, checksum/signature verification, and platform installers.
Sync would conflict with the documented local report boundary unless a new user
need justifies it. No decorative AI feature, provider key, or Azure endpoint is
present.

## What would make this perfect

Replace the `single-device-free` demo-only test with the real one-device
`check` proof described in F-4-1, then rerun all 29 exact claims commands and
the full clean-clone/live checklist. Nothing else was found, but the verdict
must remain FAIL until every claim is actually tested.
