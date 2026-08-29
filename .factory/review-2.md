# Adversarial first-read review 2

**Product:** Sideload Readiness  
**URL:** <https://sideload-readiness.sociobot.in>  
**Reviewed commit:** `ec1ef4772bccb8d4944d91a817e64ee6a39d3842`  
**Date:** 2026-08-29 UTC  
**Verdict:** **FAIL**

The first screen and one-click sample are clear and work. This review fails because two visitor-facing promises lack matching entries in `.factory/claims.json` and tagged clean-sandbox tests, and two headings do not name their sections.

## First screen: cold mobile and desktop

Fresh Chromium contexts at 390 × 844 and 1440 × 900 loaded the deployed URL without stored state, cookies, service-worker state, or prior navigation.

| Question | Answer before scrolling | Exact first-screen text |
| --- | --- | --- |
| What does it do? | Checks whether an Android update is safe. | `Check Android update safety` |
| Who is it for? | People maintaining approved sideloaded apps when device rules or recovery paths change. | `For people who maintain approved sideloaded apps when device rules or recovery paths change.` |
| What should I click first? | Open the sample report. | `Try it with sample data` → `See a redacted report and the next safe step.` |

On the 390 px screen, the action was at y=442–491 and its result explanation ended at y=528, before scrolling. The concrete, moss, field-tag layout and original device image are distinct from a generic SaaS template and match the recorded design thesis.

## Findings

### F-2-1 — BLOCKING — published trust claims are absent from the claims contract

**Locations and exact quotes:**

- README lines 11–12: `Nothing in demo mode touches a connected Android device.`
- Live `/demo`, “Run this on your device”: `The demo never reads a device.`
- README lines 16–17: `Each published archive has a SHA-256 line in SHA256SUMS.`

**Evidence:** The closest demo claim, `demo-no-adb`, explicitly tests the **CLI** command in a temporary directory. `local-demo` tests only the browser storage namespace. Neither claim says or tests that the browser demo does not use a device API. The closest release test, `published-installer-paths`, checks one public release's Homebrew/Scoop asset hashes; `verified-installer` uses fixture release JSON. Neither claim says or tests that every published archive has a corresponding `SHA256SUMS` line.

**Why this fails first-read honesty:** A visitor is asked to rely on the demo being physically inert and on archive checksums being complete. The claims file is the required proof contract, and neither promise is listed there with an observable clean-sandbox test.

**Concrete fix:** Remove these three sentences, or add `browser-demo-no-device`, whose Playwright test instruments WebUSB/Web Serial and proves the demo/reset/leave flow makes no device request; and `release-checksums`, whose clean test downloads the latest public release, parses `SHA256SUMS`, and asserts one valid SHA-256 line for every advertised archive.

### F-2-2 — MINOR — the sample-report heading is an instruction, not a section name

**Location and exact quote:** Landing-page `h2`: `See the report before you touch a device`.

**Why this loses clarity:** Heard in a heading list, it neither identifies the section as the sample report nor says what report is shown. It is an imperative outcome phrase rather than the name of the content that follows.

**Concrete fix:** Change it to `Sample readiness report`.

### F-2-3 — MINOR — the paid section heading omits the feature name

**Location and exact quote:** Landing-page `h2`: `Review several reports together`.

**Why this loses clarity:** A heading list does not identify this as the paid Fleet review section. The visitor must combine the eyebrow and following paragraph to know what is offered.

**Concrete fix:** Change it to `Fleet report review` (or `Fleet review for small IT teams`).

## Demo and sandbox behaviour

The required one-click path otherwise passes.

- Fresh 390 px landing → `Try it with sample data` opened `/?demo=1`. The first screen already displayed `READINESS REPORT / SAMPLE` for `device-6f31a0b2`, six realistic findings, a needs-review recovery outcome, and a checklist.
- The persistent banner was `Demo — sample data, nothing is saved.` with `Reset demo` and `Start for real`.
- With `localStorage["real:sentinel"] = "must-survive"` set before entering, demo added only `demo:sideload-readiness`. Reset regenerated that key. Start for real removed it and preserved the real sentinel.
- The fresh browser request log during landing → demo → reset → leave contained only the product origin (HTML, fingerprinted CSS/JS, and self-hosted image), with no console errors.
- The public CLI sample was run in a fresh temporary directory. It created a mode-`0600` report with `mode: "demo"`, schema `sideload-readiness/v1`, redacted `device-6f31a0b2`, six findings, and five recovery items.

## Claims and clean-clone verification

I cloned the reviewed commit into a new temporary directory, ran `npm ci`, and ran every one of the 27 exact commands in `.factory/claims.json` separately. All passed: `demo-report`, `json-report`, `redacted-id`, `read-only-checks`, `unauthorized-device`, `signer-continuity`, `signer-unreadable`, `diagnostic-report`, `example-schema`, `device-selection`, `demo-no-adb`, `private-demo-file`, `explicit-output-replacement`, `single-device-free`, `local-demo`, `privacy`, `fleet-review`, `license-verification`, `license-retention`, `fleet-checkout`, `verified-installer`, `platform-packaging`, `release-manifest`, `release-signatures`, `unsigned-platform-disclosure`, `billing-provider-boundary`, and `published-installer-paths`.

Additional clean-clone checks passed: `npm test` (21 Node tests and the 68-case desktop/mobile Playwright suite), `npm run build`, `cargo test --all-targets` (21 tests), `cargo fmt --check`, and `cargo clippy --all-targets -- -D warnings`. Passing existing tests does not close F-2-1: the published assertions need their own precise claims.

## Copy audit

Counts treat a hyphenated term, URL, code identifier, and numeric version as one word. Command examples are excluded. No unit exceeds 22 words and no banned marketing word appears. `adb` is necessary vocabulary and is used consistently. The only copy flags are F-2-1 through F-2-3.

### Landing page

| Copy unit | Words | Result |
| --- | ---: | --- |
| Android maintenance / read-only checks | 4 | clear label |
| Check Android update safety | 4 | clear h1 |
| For people who maintain approved sideloaded apps when device rules or recovery paths change. | 14 | clear |
| Try it with sample data | 5 | result-naming action |
| See a redacted report and the next safe step. | 9 | clear outcome |
| Read-only adb checks | 3 | claimed |
| Device IDs are redacted | 4 | claimed |
| Free for one device | 4 | claimed |
| See the report before you touch a device | 8 | **F-2-2** |
| Readiness report / sample | 3 | clear label |
| 83% · Fix one item before recovery | 6 | sample status |
| Authorized USB debugging | 3 | sample finding |
| One authorized sample device is visible to adb. | 8 | sample detail |
| Keep the authorization prompt accepted while checking. | 7 | next step |
| Developer options | 2 | sample finding |
| Developer options are enabled. | 4 | sample detail |
| Leave this unchanged for approved maintenance. | 6 | next step |
| USB data mode | 3 | sample finding |
| The sample device exposes adb over USB. | 7 | sample detail |
| Use a data-capable cable if this changes. | 7 | next step |
| Free data storage | 3 | sample finding |
| 2.8 GiB free on /data. | 6 | sample detail |
| The 1 GiB safety floor is met. | 7 | sample detail |
| Keep the floor before copying an update. | 7 | next step |
| Package signer match | 3 | sample finding |
| The installed sample signer SHA-256 matches the expected approved signer. | 10 | sample detail |
| Keep the approved APK and signer digest with this report. | 10 | next step |
| Recovery update visibility | 3 | sample finding |
| A/B update support is visible, but Android cannot safely prove recovery sideload status while running. | 16 | sample detail |
| Read your device’s approved recovery instructions before using recovery. | 9 | next step |
| Recovery checklist | 2 | clear label |
| Keep the approved APK and its known-good version. | 8 | checklist |
| Record the app package and signer before an update. | 9 | checklist |
| Stop after an error and save the report before retrying. | 10 | checklist |
| Install the command-line tool | 4 | clear section |
| Signer matched. | 2 | terminal status |
| Review recovery before updating. | 4 | terminal status |
| The command asks adb for status. | 6 | claimed |
| It does not install apps, unlock devices, or change Android settings. | 11 | claimed |
| The macOS package and Windows app are unsigned. | 8 | claimed |
| Verify the matching Sigstore bundle before installation. | 7 | instruction |
| Open release downloads | 3 | result-naming action |
| Linux and macOS installer | 4 | clear link |
| PowerShell installer | 2 | clear link |
| Checking published downloads. | 3 | status |
| Opening the checksummed download. | 4 | status |
| Choose your Mac type | 5 | clear choice |
| Apple silicon Mac (.pkg) | 4 | clear choice |
| Intel Mac (.pkg) | 3 | clear choice |
| Choose Apple silicon or Intel before downloading. | 7 | instruction |
| This browser does not identify a supported desktop system. | 10 | recovery error |
| Open releases to choose a file. | 6 | recovery action |
| Downloads are being published. | 4 | recovery error |
| Open the release page for the current status. | 8 | recovery action |
| How the readiness check works | 5 | clear section |
| Connect | 1 | step |
| Accept Android’s USB debugging prompt. | 5 | instruction |
| Choose a device when adb lists more than one. | 9 | claimed |
| Check | 1 | step |
| Compare the installed signer SHA-256 with the approved APK. | 9 | claimed |
| Read storage, USB state, and recovery clues. | 7 | instruction |
| Act safely | 2 | step |
| Save a redacted report. | 4 | claimed |
| Follow its next step or stop before an update. | 9 | instruction |
| What this tool does and does not do | 8 | clear section |
| What the CLI checks | 4 | clear subheading |
| Make a device-specific report from read-only adb queries. | 8 | claimed |
| It explains what to check next. | 6 | claimed outcome |
| What the CLI never does | 5 | clear subheading |
| It never bypasses Android controls, unlocks bootloaders, or distributes APKs. | 10 | claimed |
| Small IT teams | 3 | audience |
| Review several reports together | 4 | **F-2-3** |
| Fleet review is a $39 one-time license. | 8 | claimed |
| It adds a local report queue and package-status table. | 9 | claimed |
| Single-device checks stay free. | 4 | claimed |
| $39 one-time purchase | 3 | price |
| Buy fleet review | 3 | result-naming action |
| Have a license? Paste it here. | 5 | clear prompt |
| Verify fleet license | 3 | result-naming action |
| Verification happens with Sociobot when you choose this button. | 9 | claimed |

### README

| Sentence or heading | Words | Result |
| --- | ---: | --- |
| Sideload Readiness | 2 | title |
| Check Android update safety before you update an approved sideloaded app. | 10 | clear summary |
| Sideload Readiness is for Android power users and small IT teams. | 11 | clear audience |
| It runs read-only adb checks, writes a redacted report, and gives a recovery checklist. | 14 | claimed |
| It never installs an APK, changes Android settings, unlocks a bootloader, or bypasses a device policy. | 15 | claimed |
| The one-click browser demo is at sideload-readiness.sociobot.in/?demo=1. | 7 | direct path |
| It uses sample data in a separate browser key. | 9 | claimed |
| Nothing in demo mode touches a connected Android device. | 9 | **F-2-1** |
| Install | 1 | clear heading |
| Releases support Linux, macOS, and Windows. | 5 | claimed |
| Each published archive has a SHA-256 line in SHA256SUMS. | 9 | **F-2-1** |
| The installers download the matching release, verify its SHA-256 checksum, then place the binary on your PATH. | 17 | claimed |
| Every current release payload and manifest has a valid GitHub OIDC Sigstore bundle. | 13 | claimed |
| Verify a downloaded asset with: | 6 | instruction |
| The macOS package and Windows app are unsigned. | 8 | claimed |
| Verify their Sigstore bundles before installation. | 6 | instruction |
| On macOS, right-click the package and choose Open. | 9 | instruction |
| Install with the published Homebrew tap: | 6 | instruction |
| Install with the published Scoop bucket: | 6 | instruction |
| The winget/ folder contains the checksum-pinned v0.1.4 manifest. | 8 | repository note |
| The owner must submit it to microsoft/winget-pkgs before advertising a winget command. | 12 | repository note |
| Use | 1 | clear heading |
| Connect one device and accept Android’s USB debugging prompt. | 9 | instruction |
| If adb lists several authorized devices, the command stops until you pass --device SERIAL. | 13 | claimed |
| Get the expected signer SHA-256 from your approved APK: | 9 | instruction |
| Compare that digest with the installed package: | 7 | instruction |
| The command reads the installed base APK through adb and parses its signing certificate locally. | 15 | claimed |
| A matching digest is ready, and a mismatch is blocked. | 10 | claimed |
| If the package or certificate cannot be read, the result is needs-review. | 13 | claimed |
| Use JSON in scripts: | 4 | instruction |
| Try the bundled sample without adb: | 6 | instruction |
| The sample creates one private, unpredictable temporary report file and prints its path. | 12 | claimed |
| It never reuses an existing temporary filename. | 8 | claimed |
| --output PATH is different: it writes the requested path and replaces that file when it already exists. | 17 | claimed |
| examples/sample-report.json documents the stable schema and values. | 7 | claimed |
| The report checks: | 3 | clear lead-in |
| Authorized USB debugging and USB data mode. | 6 | claimed |
| Developer options visibility. | 3 | claimed |
| Free /data storage against a 1 GiB safety floor. | 8 | claimed |
| Installed signer SHA-256 comparison when a package and expected signer are supplied. | 11 | claimed |
| A/B update hints and a recovery checklist. | 7 | claimed |
| Android does not expose a safe, complete recovery-sideload status while it is running. | 12 | claimed diagnostic context |
| The report labels that check needs-review and tells you to use the device maker’s approved recovery instructions. | 17 | claimed |
| Fleet review | 2 | clear heading |
| Single-device reports are free. | 5 | claimed |
| Fleet review is a $39 one-time license. | 8 | claimed |
| It adds a local report queue and a package-status table on the site. | 12 | claimed |
| Checkout and license verification use Sociobot; no payment provider is embedded here. | 11 | claimed |
| Develop and verify | 3 | clear heading |
| Requirements: current Rust stable, Node 20+, and adb only for a live check. | 11 | setup requirement |
| npm run build:site creates the deployable static site in dist/site. | 9 | developer instruction |
| The factory deploys that directory; this repository does not manage DNS or cloud infrastructure. | 13 | scope statement |
| npm run build is an alias for the deploy build. | 10 | developer instruction |
| Release installers are built only in GitHub Actions by .github/workflows/release.yml. | 10 | developer instruction |
| npm test includes desktop and 390 px mobile browser checks for keyboard use, accessibility, offline reloads, privacy, and release-download behavior. | 19 | developer instruction |
| Privacy and license | 3 | clear heading |
| The CLI has no report-upload command. | 7 | claimed |
| It only runs local adb commands and writes an output file when requested. | 13 | claimed |
| Hardware serials are replaced with a redacted ID in exported reports. | 11 | claimed |
| The site has no analytics or third-party runtime scripts. | 9 | claimed privacy outcome |
| See Privacy and Terms. | 4 | navigation |
| License | 1 | clear heading |
| MIT | 1 | license link |

## Structure, accessibility, routing, and links

All of the following passed on the deployed site: route-specific titles, descriptions, canonical URLs, Open Graph URLs, Twitter metadata, favicon, `lang`, one h1 per route, landmarks, designed HTTP 404, skip link, keyboard focus, history/back focus restoration, 390 px touch targets and overflow, 200% text, reduced motion, offline demo reload, and no serious/critical axe violations. Live `verify-live.mjs` confirmed all of `/`, `/?demo=1`, `/demo`, `/privacy`, `/terms`, and the designed 404. The header/footer are consistent and include Privacy/Terms.

I crawled all static links rendered across those routes. Product links, installers, GitHub Releases, Sociobot, and hosted checkout resolved. The only HTTP 404 result was the expected self-link created by the skip link on the deliberately missing 404 route; it points to that page's `#main`, not a dead destination.

## Earlier history

I read `.factory/review-1.md`, `.factory/polish-1.md`, and the previous handoff. Every earlier finding was independently confirmed fixed:

| Earlier ID | Verification in this round |
| --- | --- |
| F-1-1 | `release-signatures` passed against the current public release with pinned Cosign. |
| F-1-2 | The formerly unlisted signer, diagnostic, example, platform-signing, and billing assertions now have named claims and tagged tests. |
| F-1-3 | Live heading is `How the readiness check works`. |
| F-1-4 | Live subheadings are `What the CLI checks` and `What the CLI never does`. |
| F-1-5 | Live install heading is `Install the command-line tool`. |
| F-1-6 | `/demo`, `/privacy`, and `/terms` have distinct title, description, canonical, and Open Graph URL metadata. |

F-2-1 through F-2-3 are new independent findings, not regressions of those closed IDs.

## Missed leverage

No AI feature is missing. The brief calls for a deterministic, read-only Android diagnostic, where model output would make the safety result less reliable. The expected companion capabilities already exist: browser and CLI samples, JSON output, local redacted reports, local fleet import, and platform installers.

## What would make this perfect

Add or remove the two unlisted trust promises in F-2-1, rename the two headings in F-2-2/F-2-3, then rerun the full clean-clone claims loop and fresh-browser review. Only zero findings should change the verdict to PASS.

