# Adversarial first-read review 7

Product: Sideload Readiness

URL: <https://sideload-readiness.sociobot.in>

Reviewed commit: `e48059dba40e9d40126946a5b022658feda12fb3`

Date: 2026-08-30 UTC

Verdict: **FAIL**

The cold first screen and one-click browser demo are clear, useful, and
isolated. The review still fails. The CLI sample gives contradictory readiness
guidance, the public paid checkout is broken and its declared claim test fails,
and one README claim is missing from the claims contract.

## Findings

### F-7-1 — BLOCKING — the same sample says both “ready” and “needs review before updating”

**Exact quotes and locations:**

- Fresh CLI demo report: `83% — Ready for a cautious approved-package update.`
- The same report, `Recovery update visibility`: `needs-review`.
- Live `/demo`: `This sample shows a recovery check that needs review before an approved update.`
- Live sample report header: `83% · Fix one item before recovery`.
- `src/main.rs`, `base_report`: the overall summary depends only on the
  percentage of `ready` findings. Five of six ready findings produce the
  “Ready” summary even when the remaining finding is `needs-review`.

**Evidence:** Running the real binary in a fresh temporary directory produced
a mode-0600 report containing the first two quotes; the extracted result is in
`review-evidence-7/cli-demo-summary.json`. The browser demo, generated
from the same documented sample, contains the latter two. The declared
`demo-report` test asserts the mode, redacted ID, finding count, and checklist,
but does not assert that the overall recommendation agrees with the finding
states.

**Why this fails:** This product exists to guide a safety decision. A visitor
cannot tell whether to proceed or stop when the overall summary and the
browser's instruction disagree about the same sample. `needs-review` cannot be
silently converted into `Ready` by a percentage threshold.

**Concrete fix:** Derive the summary from finding severity before calculating
or displaying a score: any `blocked` finding must say not to update, and any
`needs-review` finding must say to review the marked check before updating.
Use the same summary in the CLI, browser sample, and committed fixture. Extend
the `demo-report` and live-report tests to assert the overall recommendation
for ready, needs-review, and blocked combinations.

### F-7-2 — BLOCKING — the advertised $39 checkout is a dead link and its claim test fails

**Exact quote/location:** Landing, Fleet report review:
`Buy fleet review through Sociobot (external checkout)`.

**Evidence:** The exact `fleet-checkout` claim command, `npm run test:billing`,
failed from the clean clone because `GET
https://api.sociobot.in/api/v1/products` returned 500 instead of 200. An
independent rerun failed the same way. Direct requests to both the catalog and
`/api/v1/products/sideload-readiness/checkout` returned
`{"error":"Internal server error","status":500}`. The live-link crawl therefore
records the paid CTA as HTTP 500. The invalid-license verification endpoint
still returns 200, so this is specifically a catalog/checkout failure.

**Why this fails:** A visitor can see a price and a purchase action but reaches
a raw server error instead of checkout. The published price and hosted-checkout
claim are not currently verifiable. The review instructions make any failing
claim test blocking.

**Concrete fix:** Restore the product catalog to 200 and the product checkout
to a 303 hosted Dodo redirect, then rerun `npm run test:billing`. Also handle a
checkout 5xx in the page with an in-page error such as `Checkout is unavailable.
Try again later.` instead of navigating to raw JSON.

### F-7-3 — MINOR — the winget manifest statement is absent from `claims.json`

**Exact quote/location:** README, Install: `The winget/ folder contains the
checksum-pinned v0.1.4 manifest.`

**Evidence:** `.factory/claims.json` has no winget entry. The untagged test
`packaging metadata keeps the CLI identity and version` checks the local files,
but it is not the one tagged test belonging to a listed claim. The
`published-installer-paths` claim explicitly covers shell, PowerShell,
Homebrew, and Scoop, not winget.

**Why this fails:** “Checksum-pinned” is a concrete supply-chain statement a
Windows user may rely on. The claims contract cannot discover or run its proof.

**Concrete fix:** Add a `winget-manifest` entry and one
`@claim:winget-manifest` test that checks v0.1.4, the Windows asset URL, and the
hash against the current published `SHA256SUMS`; or remove the sentence.

## First screen: cold mobile and desktop

Fresh Chromium contexts at 390 × 844 and 1440 × 900 opened production with no
prior cookies, storage, service worker, or navigation. Nothing was scrolled.

| Question | Answer before scrolling | Exact visible text |
| --- | --- | --- |
| What does this do? | Checks Android update safety. | `Check Android update safety` |
| Who is it for? | People maintaining approved sideloaded apps when device rules or recovery paths change. | `For people who maintain approved sideloaded apps when device rules or recovery paths change.` |
| What should I click first? | Open the sample report. | `Try it with sample data` and `See a redacted report and the next safe step.` |

On mobile, the primary action occupied y=442.3–490.6 and its result ended at
y=528.0. The three short facts ended at y=628.0. All required information was
visible without scrolling. Desktop showed the same information. There were no
console errors. Evidence is in `review-evidence-7/first-read-mobile.*` and
`first-read-desktop.*`.

## Copy audit

Counts split on whitespace. Standalone separators are excluded. Hyphenated
terms, paths, URLs, identifiers, and version numbers count as one word. Commands
are code and are excluded. Headings, labels, actions, statuses, alt text,
errors, and empty states are included because they affect use. No unit exceeds
22 words. No banned marketing adjective or metaphor heading appears. Literal
uses of `unlock` describe prohibited operations. Buttons name results. The
flags are F-7-1 through F-7-3.

### Landing page and reachable states

| Copy unit | Words | Audit |
| --- | ---: | --- |
| Skip to report | 3 | clear action |
| SR/01 | 1 | wordmark |
| Demo | 1 | navigation |
| Install | 1 | navigation |
| Fleet | 1 | navigation |
| Privacy | 1 | navigation |
| Android maintenance / read-only checks | 4 | clear label |
| Check Android update safety | 4 | clear h1 |
| For people who maintain approved sideloaded apps when device rules or recovery paths change. | 14 | clear audience and situation |
| Try it with sample data | 5 | result-naming action |
| See a redacted report and the next safe step. | 9 | clear result |
| Read-only adb checks | 3 | listed claim |
| Device IDs are redacted | 4 | listed claim |
| Free for one device | 4 | listed claim |
| A rugged handheld device and USB cable rest on concrete beside small patches of moss. | 15 | useful alt text |
| Sample readiness report | 3 | clear h2 |
| Readiness report / sample | 3 | clear report label |
| device-6f31a0b2 · Android 15 (sample) | 4 | realistic sample identity |
| 83% · Fix one item before recovery | 6 | **F-7-1: conflicts with CLI “Ready” summary** |
| Authorized USB debugging | 3 | clear finding |
| ready | 1 | clear state |
| One authorized sample device is visible to adb. | 8 | sample detail |
| Keep the authorization prompt accepted while checking. | 7 | direct next step |
| Developer options | 2 | clear finding |
| Developer options are enabled. | 4 | sample detail |
| Leave this unchanged for approved maintenance. | 6 | direct next step |
| USB data mode | 3 | clear finding |
| The sample device exposes adb over USB. | 7 | sample detail |
| Use a data-capable cable if this changes. | 7 | direct next step |
| Free data storage | 3 | clear finding |
| 2.8 GiB free on /data. | 5 | sample detail |
| The 1 GiB safety floor is met. | 7 | sample detail |
| Keep the floor before copying an update. | 7 | direct next step |
| Package signer match | 3 | clear finding |
| The installed sample signer SHA-256 matches the expected approved signer. | 10 | sample detail |
| Keep the approved APK and signer digest with this report. | 10 | direct next step |
| Recovery update visibility | 3 | clear finding |
| needs review | 2 | clear state; **F-7-1 conflict** |
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
| Open releases on GitHub (external) | 5 | result-naming external link |
| Linux and macOS installer | 4 | descriptive same-origin link |
| PowerShell installer | 2 | descriptive same-origin link |
| Checking published downloads. | 3 | clear status |
| Opening the checksummed download. | 4 | clear status |
| Download [release filename] from GitHub (external) | 6 | result-naming external action |
| Choose your Mac type | 4 | clear choice heading |
| Choose Mac download on GitHub (external) | 6 | result-naming external action |
| Apple silicon Mac (.pkg) on GitHub (external) | 7 | clear choice |
| Intel Mac (.pkg) on GitHub (external) | 6 | clear choice |
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
| It explains what to check next. | 6 | concrete result |
| What the CLI never does | 5 | clear h3 |
| It never bypasses Android controls, unlocks bootloaders, or distributes APKs. | 10 | listed limitation |
| Small IT teams | 3 | clear audience label |
| Fleet report review | 3 | clear h2 |
| Fleet review is a $39 one-time license. | 7 | listed claim; **F-7-2 test fails** |
| It adds a local report queue and package-status table. | 9 | listed claim |
| Single-device checks stay free. | 4 | listed claim |
| $39 one-time purchase | 3 | exact price; **F-7-2 test fails** |
| Buy fleet review through Sociobot (external checkout) | 7 | **F-7-2: dead HTTP 500 action** |
| Have a license? | 3 | clear form label |
| Paste it here. | 3 | direct instruction |
| Verify fleet license | 3 | result-naming button |
| Verification happens with Sociobot when you choose this button. | 9 | clear disclosure |
| Paste a license token, then verify it. | 7 | recoverable error |
| Checking your license… | 3 | clear status |
| Fleet review is active on this browser. | 7 | clear result |
| That license is not active. | 5 | clear error |
| You can buy a new fleet review license. | 8 | recovery action; checkout affected by F-7-2 |
| The license could not be checked. | 6 | clear error |
| Your free single-device report still works. | 6 | clear fallback |
| Add redacted JSON reports | 4 | result-naming file action |
| No reports are queued. | 4 | clear empty state |
| Choose redacted JSON reports to begin. | 6 | direct empty-state action |
| [count] local report(s) queued. | 4 | clear count status |
| Added [count]. | 2 | clear import result |
| No reports added. | 3 | clear error |
| [filename] is not a valid redacted Sideload Readiness report. | 9 | file-specific error |
| Choose a JSON report exported by the CLI. | 8 | recovery action |
| Device | 1 | table heading |
| Score | 1 | table heading |
| Android | 1 | table heading |
| Demo — sample data, nothing is saved. | 6 | clear demo banner |
| Reset demo | 2 | result-naming button |
| Start for real | 3 | result-naming link |
| Demo / sample device | 3 | clear label |
| Find the next safe step | 5 | clear demo h1 |
| This sample shows a recovery check that needs review before an approved update. | 13 | **F-7-1: conflicts with CLI “Ready” summary** |
| Run this on your device | 5 | clear h2 |
| Install the command, connect one authorized device, then run sideload-readiness check. | 11 | direct instruction |
| The demo never reads a device. | 6 | listed claim |
| See install options | 3 | result-naming action |
| Read-only Android update checks for cautious maintainers. | 7 | informative footer |
| Terms | 1 | footer link |
| Param Factory on Sociobot (external) | 5 | external destination named |
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
| The shell installer writes to ~/.local/bin and adds that directory to your startup profile. | 14 | listed claim |
| A curl \| sh command cannot change its parent terminal, so run the exact export PATH line it prints before your first command. | 22 | direct instruction; at hard cap |
| New terminals find sideload-readiness automatically. | 5 | listed claim |
| The PowerShell installer adds the directory to the current session and your user PATH. | 14 | listed claim |
| Every current release payload and manifest has a valid GitHub OIDC Sigstore bundle. | 13 | listed claim |
| Verify a downloaded asset with: | 5 | direct instruction |
| The shell installer supports Linux x86_64 and macOS arm64 and x86_64. | 11 | listed claim |
| It stops before a download on Linux ARM64 because no release asset is published. | 14 | listed claim |
| The macOS package and Windows app are unsigned. | 8 | listed claim |
| Verify their Sigstore bundles before installation. | 6 | direct instruction |
| On macOS, right-click the package and choose Open. | 8 | direct instruction |
| Install with the published Homebrew tap: | 6 | direct instruction |
| Install with the published Scoop bucket: | 6 | direct instruction |
| The winget/ folder contains the checksum-pinned v0.1.4 manifest. | 8 | **F-7-3: unlisted claim** |
| The owner must submit it to microsoft/winget-pkgs before advertising a winget command. | 12 | explicit operator action |
| Run a device readiness check | 5 | clear h2 |
| Connect one device and accept Android's USB debugging prompt. | 9 | direct instruction |
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
| The report labels that check needs-review and tells you to use the device maker's approved recovery instructions. | 17 | listed claim |
| Fleet review | 2 | clear h2 |
| Single-device reports are free. | 4 | listed claim |
| Fleet review is a $39 one-time license. | 7 | listed claim; **F-7-2 test fails** |
| It adds a local report queue and a package-status table on the site. | 13 | listed claim |
| Checkout and license verification use Sociobot; no payment provider is embedded here. | 12 | listed boundary; checkout affected by F-7-2 |
| Develop and verify | 3 | clear h2 |
| Requirements: current Rust stable, Node 20+, and adb only for a live check. | 13 | concrete requirement |
| npm run build:site creates the deployable static site in dist/site. | 10 | verified developer instruction |
| The factory deploys that directory; this repository does not manage DNS or cloud infrastructure. | 14 | clear scope |
| npm run build is an alias for the deploy build. | 10 | verified developer instruction |
| Release installers are built only in GitHub Actions by .github/workflows/release.yml. | 10 | verified repository fact |
| npm test includes desktop and 390 px mobile browser checks for keyboard use, accessibility, offline reloads, privacy, and release-download behavior. | 20 | verified developer instruction |
| Privacy and license | 3 | clear h2 |
| The CLI has no report-upload command. | 6 | listed claim |
| A regular check writes a file only with --output PATH. | 10 | listed claim |
| A demo without --output creates a private temporary file and prints its path. | 13 | listed claim |
| Hardware serials are replaced with a redacted ID in exported reports. | 11 | listed claim |
| The site has no analytics or third-party runtime scripts. | 9 | listed claim |
| See Privacy and Terms. | 4 | direct navigation |
| License | 1 | clear h2 |
| MIT | 1 | clear license link |

Terminology is otherwise consistent: `report`, `approved APK`, `package`,
`signer SHA-256`, `adb`, `recovery checklist`, and `fleet review` each name one
concept.

## Demo and sandbox behavior

The browser sandbox passes apart from the contradictory recommendation in
F-7-1. One click opened `/?demo=1`. Its first 390 px viewport already contained
the persistent `Demo — sample data, nothing is saved.` banner, Reset demo,
Start for real, the demo heading, the report header, and the first realistic
finding. The full report has six findings and a recovery checklist.

A seeded `real:sentinel` survived entry, Reset, online reload, offline reload,
and exit. Reset recreated only `demo:sideload-readiness`; Start for real removed
that key. Instrumented WebUSB and Web Serial calls remained zero. The complete
live flow made no off-origin request and reloaded offline.

The real CLI demo ran in a new temporary directory. It did not require adb,
printed an unpredictable output path, and wrote a mode-0600 JSON report with a
redacted device, six findings, and five recovery items. That run exposed the
conflicting summary in F-7-1.

## Claims

All 32 exact `test` commands from `.factory/claims.json` were run separately in
a no-hardlink clean clone. Result: **31 passed, 1 failed**.

| Claim | Result | Evidence |
| --- | --- | --- |
| `demo-report` | PASS | redacted six-finding report and checklist |
| `json-report` | PASS | machine-readable public demo JSON |
| `redacted-id` | PASS | hardware serial absent |
| `read-only-checks` | PASS | adb operations and commands non-mutating |
| `unauthorized-device` | PASS | refusal and next step |
| `signer-continuity` | PASS | signer extraction and match/mismatch |
| `signer-unreadable` | PASS | unreadable certificate is needs-review |
| `diagnostic-report` | PASS | all documented diagnostics and recovery outcomes |
| `example-schema` | PASS | committed example matches demo values |
| `device-selection` | PASS | multiple devices require selection |
| `demo-no-adb` | PASS | no adb and temporary output |
| `cli-report-storage` | PASS | regular/demo output behavior |
| `private-demo-file` | PASS | distinct unpredictable mode-0600 files |
| `explicit-output-replacement` | PASS | requested file replaced |
| `single-device-free` | PASS | real one-device check without license state |
| `local-demo` | PASS | separate demo namespace |
| `browser-demo-no-device` | PASS | zero WebUSB/Web Serial calls |
| `privacy` | PASS | same-origin-only browser demo flow |
| `fleet-review` | PASS | fixture license enables local queue/table |
| `license-verification` | PASS | token sent only after submit |
| `license-retention` | PASS | expired verdict removed |
| `fleet-checkout` | **FAIL** | public catalog returned 500; F-7-2 |
| `verified-installer` | PASS | fixture archives verified and installed |
| `installer-path-setup` | PASS | shell and PowerShell PATH behavior |
| `installer-platform-support` | PASS | supported platforms and ARM64 refusal |
| `platform-packaging` | PASS | release matrix |
| `release-manifest` | PASS | absolute supported-platform URLs |
| `release-signatures` | PASS | current payloads/manifests passed Cosign |
| `release-checksums` | PASS | current archives matched SHA256SUMS |
| `unsigned-platform-disclosure` | PASS | current macOS/Windows signing state |
| `billing-provider-boundary` | PASS | runtime billing is Sociobot-only |
| `published-installer-paths` | PASS | public shell, PowerShell, Homebrew, and Scoop paths |

The complete command/result list is
`.factory/review-evidence-7/claim-results.json`. F-7-3 is the one claim-like
README sentence not represented by this list.

## Earlier finding verification

Every earlier `review-*.md`, every `polish-*.md`, and the incoming handoff were
read. Each earlier finding was checked in current source and on production,
not accepted from its closure note.

| Earlier ID | Current source and live confirmation |
| --- | --- |
| F-1-1 | `release-signatures` again downloaded the current release and passed pinned Cosign verification. |
| F-1-2 | Dedicated signer-failure, diagnostics, schema, unsigned-platform, and billing-boundary entries remain present; those tests pass. |
| F-1-3 | Live/source h2 is `How the readiness check works`. |
| F-1-4 | Live/source h3 values are `What the CLI checks` and `What the CLI never does`. |
| F-1-5 | Live/source h2 is `Install the command-line tool`. |
| F-1-6 | Home, Demo, Privacy, Terms, and 404 have distinct titles, descriptions, canonicals, and Open Graph metadata. |
| F-2-1 | Browser device calls are zero; Permissions Policy disables USB/Serial; current release checksums pass. |
| F-2-2 | Live/source h2 is `Sample readiness report`. |
| F-2-3 | Live/source h2 is `Fleet report review`. |
| F-3-1 | Live/source h3 is `Connect one Android device`. |
| F-3-2 | Live/source h3 is `Check device and app readiness`. |
| F-3-3 | Live/source h3 is `Follow the report’s next step`. |
| F-3-4 | README h2 is `Run a device readiness check`. |
| F-4-1 | The public one-device check passed with isolated state and no license variables; Fleet controls remain locked without a license. |
| F-5-1 | Header/footer route transitions and Back/Forward focused the destination h1 in live desktop and mobile checks. |
| F-6-1 | Every rendered off-origin link names GitHub or Sociobot and says `external`; the source guard and live crawl confirm it. |

No earlier finding is unfixed, half-fixed, or regressed. F-7-1 through F-7-3
are new findings.

## Structure, accessibility, links, and identity

The required structure passes except for the dead checkout in F-7-2.

- `/`, `/?demo=1`, `/demo`, `/privacy`, and `/terms` return 200. The designed
  missing route returns HTTP 404 with a return action.
- Each route has its specific title, description, canonical, Open Graph data,
  favicon, `lang="en"`, one h1, ordered headings, main landmark, skip link, and
  consistent header/footer with Privacy and Terms.
- History navigation, route announcements, h1 focus, keyboard operation,
  reduced motion, 200% text, 390 px overflow, and 44 px targets pass.
- Playwright Axe reports zero serious or critical issues on Home, Demo,
  Privacy, Terms, and 404. `/opt/fleet/lib/verify-url.sh` reports no console or
  basic accessibility errors on all real routes.
- The live crawl resolves all internal routes, installers, GitHub releases,
  release assets, and the Sociobot factory link. The paid checkout alone
  returns 500. The 404-page skip link correctly remains on that 404 document.
- Production byte-matches the local build. JavaScript is 7,552 bytes gzip and
  CSS is 2,732 bytes gzip.
- The concrete-and-moss field tag, original device artwork, square controls,
  evidence-strip layout, and monospace display face match `.factory/design.md`.
  The result is distinct and not a generic SaaS template.

## Quality gates

- `npm test`: 28 Node tests passed; 75 Playwright tests passed and one
  project-specific test was intentionally skipped.
- `npm run build`: passed and produced `dist/site`.
- Live `BASE_URL=https://sideload-readiness.sociobot.in npm run test:browser`:
  75 passed and one intentional skip.
- `cargo fmt --check`, Clippy with warnings denied, and
  `cargo test --all-targets`: passed; 22 Rust tests passed.
- `node scripts/verify-live.mjs https://sideload-readiness.sociobot.in` passed
  byte identity, routes, focus, demo isolation, offline reload, request-log,
  mobile, console, and Axe checks.
- The independent link crawl and `npm run test:billing` expose F-7-2.

## Missed leverage

No brief-implied feature is missing. The deterministic Android diagnostic does
not benefit from an AI-generated safety decision. The useful adjacent paths
already exist: browser and CLI samples, JSON export, local fleet import,
platform installers, and public checksum/signature verification. Sync would
conflict with the documented local report boundary. No decorative AI feature,
provider key, or Azure endpoint is present.

## What would make this perfect

Make the CLI and browser give one severity-aware recommendation for the same
report; restore and gracefully handle the paid checkout; and put the winget
statement under a tagged claims entry. Then rerun all 32 current claim commands
plus the new recommendation and winget tests. Only zero findings should change
the verdict to PASS.
