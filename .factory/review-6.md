# Adversarial first-read review 6

Product: Sideload Readiness  
URL: <https://sideload-readiness.sociobot.in>  
Reviewed commit: `bdd9354de66df358fac15829b0784e1590f488fe`  
Date: 2026-08-30 UTC  
Verdict: **FAIL**

The first screen is clear, the browser and CLI demos are isolated and useful,
all 32 claim commands pass from a clean clone, and every earlier finding is
fixed. One site-structure finding remains: visible link text does not identify
three external destinations. The required zero-finding standard therefore
keeps this review at FAIL.

## First screen: cold mobile and desktop

Fresh Chromium contexts at 390 × 844 and 1440 × 900 opened production with no
cookies, local storage, service worker, or prior history. Nothing was scrolled
before these answers were recorded.

| Question | Answer before scrolling | Exact first-screen text |
| --- | --- | --- |
| What does this do? | Checks Android update safety. | `Check Android update safety` |
| Who is it for? | People maintaining approved sideloaded apps when device rules or recovery paths change. | `For people who maintain approved sideloaded apps when device rules or recovery paths change.` |
| What should I click first? | Open the ready-made sample report. | `Try it with sample data` and `See a redacted report and the next safe step.` |

At 390 px, the action occupied y=442.31–490.63 and its result ended at
y=527.98. The three facts ended at y=627.98. Desktop showed the complete action,
outcome, and facts by y=752.70. All were visible without scrolling. The cold
contexts had no console errors or stored data. Evidence:
`.factory/review-evidence-6/first-read.json` and the adjacent mobile/desktop
captures.

## Findings

There are no blocking findings.

### F-6-1 — MINOR — external links do not tell the visitor they leave the product

**Exact quotes/locations:** landing install link `Open release downloads`
(GitHub); landing paid action `Buy fleet review` (Sociobot, then hosted Dodo
checkout); footer link `Built by Param Factory` (Sociobot). The same footer link
appears on Demo, Privacy, Terms, and the designed 404.

**Evidence:** Each link has `rel="external"` in source, but that value is not
visible or announced as part of the accessible name. The live crawl confirmed
that the links leave `sideload-readiness.sociobot.in`. The site-structure
contract requires external links to say so.

**Why this loses a first-time visitor:** A phone visitor cannot tell before
activation that the release action leaves for GitHub, the purchase action
leaves for hosted checkout, or the factory credit leaves for another site.
`rel="external"` is browser metadata, not visitor-facing notice.

**Concrete fix:** Use visible, specific link text such as `Open releases on
GitHub (external)`, `Buy fleet review through Sociobot (external checkout)`, and
`Param Factory on Sociobot (external)`. Keep the existing destinations and add
a browser assertion that every off-origin link includes visible or accessible
`external` wording.

## Copy audit

Counts split on whitespace; standalone separators are excluded. Hyphenated
terms, URLs, identifiers, and version numbers count as one word. Commands are
code and are excluded. Headings, labels, actions, statuses, alt text, errors,
and empty states are included because they affect use. No unit exceeds 22
words. No banned marketing adjective, metaphor heading, empty slogan, or
inconsistent product term was found. Literal `unlock` statements describe
operations the tool refuses. The only copy flag is the external-link notice in
F-6-1.

### Landing page and reachable states

| Copy unit | Words | Audit |
| --- | ---: | --- |
| Skip to report | 3 | direct skip action |
| SR/01 | 1 | wordmark |
| Demo | 1 | navigation |
| Install | 1 | navigation |
| Fleet | 1 | navigation |
| Privacy | 1 | navigation |
| Android maintenance / read-only checks | 4 | clear label |
| Check Android update safety | 4 | clear h1 |
| For people who maintain approved sideloaded apps when device rules or recovery paths change. | 14 | clear audience and situation |
| Try it with sample data | 5 | result-naming action |
| See a redacted report and the next safe step. | 9 | clear action result |
| Read-only adb checks | 3 | listed claim |
| Device IDs are redacted | 4 | listed claim |
| Free for one device | 4 | listed claim |
| A rugged handheld device and USB cable rest on concrete beside small patches of moss. | 15 | useful alt text |
| Sample readiness report | 3 | clear h2 |
| Readiness report / sample | 3 | clear report label |
| device-6f31a0b2 · Android 15 (sample) | 4 | realistic sample identity |
| 83% · Fix one item before recovery | 6 | concrete sample status |
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
| It does not install apps, unlock devices, or change Android settings. | 11 | listed literal limitation |
| The macOS package and Windows app are unsigned. | 8 | listed claim |
| Verify the matching Sigstore bundle before installation. | 7 | direct instruction |
| Open release downloads | 3 | **F-6-1: external destination undisclosed** |
| Linux and macOS installer | 4 | descriptive same-origin link |
| PowerShell installer | 2 | descriptive same-origin link |
| Checking published downloads. | 3 | clear status |
| Opening the checksummed download. | 4 | clear status |
| Download [release filename] | 3 | result-naming dynamic action; external destination falls under F-6-1 |
| Choose your Mac type | 4 | clear choice/action |
| Apple silicon Mac (.pkg) | 4 | clear choice |
| Intel Mac (.pkg) | 3 | clear choice |
| Choose Apple silicon or Intel before downloading. | 7 | direct instruction |
| This browser does not identify a supported desktop system. | 9 | clear error |
| Open releases to choose a file. | 6 | recovery action; external destination falls under F-6-1 |
| Downloads are being published. | 4 | clear error |
| Open the release page for the current status. | 8 | recovery action; external destination falls under F-6-1 |
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
| It never bypasses Android controls, unlocks bootloaders, or distributes APKs. | 10 | listed literal limitation |
| Small IT teams | 3 | clear audience label |
| Fleet report review | 3 | clear h2 |
| Fleet review is a $39 one-time license. | 7 | exact price |
| It adds a local report queue and package-status table. | 9 | listed claim |
| Single-device checks stay free. | 4 | listed claim |
| $39 one-time purchase | 3 | exact price |
| Buy fleet review | 3 | **F-6-1: external checkout undisclosed** |
| Have a license? | 3 | clear form label |
| Paste it here. | 3 | direct instruction |
| Verify fleet license | 3 | result-naming button |
| Verification happens with Sociobot when you choose this button. | 9 | clear disclosure |
| Paste a license token, then verify it. | 7 | recoverable validation error |
| Checking your license… | 3 | clear status |
| Fleet review is active on this browser. | 7 | clear result |
| That license is not active. | 5 | clear error |
| You can buy a new fleet review license. | 8 | recovery action |
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
| Read-only Android update checks for cautious maintainers. | 7 | informative footer sentence |
| Terms | 1 | footer link |
| Built by Param Factory | 4 | **F-6-1: external destination undisclosed** |
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
| A curl \| sh command cannot change its parent terminal, so run the exact export PATH line it prints before your first command. | 22 | direct instruction; at cap |
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
| The winget/ folder contains the checksum-pinned v0.1.4 manifest. | 8 | repository fact verified by the release suite |
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
| A regular check writes a file only with --output PATH. | 10 | listed claim |
| A demo without --output creates a private temporary file and prints its path. | 13 | listed claim |
| Hardware serials are replaced with a redacted ID in exported reports. | 11 | listed claim |
| The site has no analytics or third-party runtime scripts. | 9 | listed claim |
| See Privacy and Terms. | 4 | direct navigation |
| License | 1 | clear h2 |
| MIT | 1 | clear license link |

Terminology remains consistent: `report`, `approved APK`, `package`, `signer
SHA-256`, `adb`, `recovery checklist`, and `fleet review` each name one
concept. Technical terms are appropriate to the stated Android power-user and
IT audience and appear with concrete commands or outcomes.

## Demo and sandbox behavior

**Pass.** One click from the cold 390 px landing page opened `/?demo=1`. The
first resulting viewport already showed the persistent `Demo — sample data,
nothing is saved.` banner, Reset demo, Start for real, the demo h1, the 83%
sample result, device `device-6f31a0b2`, and the first realistic finding. The
full sample has six findings, one needs-review recovery result, and a checklist.

A seeded `real:sentinel` survived entry, reset, online reload, offline reload,
and exit. Demo mode created only `demo:sideload-readiness`; reset restored a
deliberately corrupted demo value; Start for real removed the demo key.
Instrumented WebUSB and Web Serial APIs recorded zero calls. The complete
landing/demo/reset/reload flow requested only
`https://sideload-readiness.sociobot.in` and emitted no console error. Evidence:
`.factory/review-evidence-6/demo-sandbox.json` and `demo-mobile.png`.

The real CLI demo ran with a fresh `TMPDIR`. It printed an unpredictable output
path and wrote a mode-0600 JSON report with schema `sideload-readiness/v1`, mode
`demo`, redacted device `device-6f31a0b2`, six findings, and five recovery
items. It required no adb connection.

## Claims

**Pass: 32 of 32 exact commands.** A no-hardlink clean clone at reviewed commit
`bdd9354` was used. Each `test` value in `.factory/claims.json` ran separately;
none was inferred from the full suite.

| Claim | Result | Observable proof |
| --- | --- | --- |
| `demo-report` | PASS | Redacted six-finding report and checklist |
| `json-report` | PASS | Public demo JSON parsed |
| `redacted-id` | PASS | Known hardware serial absent |
| `read-only-checks` | PASS | adb operations and public commands remain non-mutating |
| `unauthorized-device` | PASS | Unauthorized device refused with next step |
| `signer-continuity` | PASS | Installed signer extracted and matched/mismatched |
| `signer-unreadable` | PASS | Invalid APK produced needs-review |
| `diagnostic-report` | PASS | Every documented live diagnostic and recovery outcome |
| `example-schema` | PASS | Committed example matches public demo output |
| `device-selection` | PASS | Multiple devices require explicit selection |
| `demo-no-adb` | PASS | Demo used no adb and wrote a temporary report |
| `cli-report-storage` | PASS | Regular and demo output behavior matches disclosure |
| `private-demo-file` | PASS | Distinct unpredictable mode-0600 files |
| `explicit-output-replacement` | PASS | Requested output is replaced |
| `single-device-free` | PASS | Public live `check` ran with one fake device and no license state |
| `local-demo` | PASS | Separate demo namespace preserved real data |
| `browser-demo-no-device` | PASS | Zero WebUSB/Web Serial requests |
| `privacy` | PASS | Same-origin-only browser demo flow |
| `fleet-review` | PASS | Valid fixture verdict enabled local queue/table |
| `license-verification` | PASS | Token sent to Sociobot only after submit |
| `license-retention` | PASS | Expired verdict removed after 24 hours |
| `fleet-checkout` | PASS | Sociobot returned hosted Dodo checkout redirect without purchase |
| `verified-installer` | PASS | Linux/macOS fixture installers verified checksums |
| `installer-path-setup` | PASS | Shell and PowerShell PATH behavior verified |
| `installer-platform-support` | PASS | Supported platforms install; Linux ARM64 stops before download |
| `platform-packaging` | PASS | Required release matrix retained |
| `release-manifest` | PASS | Absolute URL for each supported platform |
| `release-signatures` | PASS | Every current payload/manifest passed pinned Cosign verification |
| `release-checksums` | PASS | Every current archive matched SHA256SUMS |
| `unsigned-platform-disclosure` | PASS | Current macOS/Windows signing state confirmed |
| `billing-provider-boundary` | PASS | Product runtime billing integration is Sociobot-only |
| `published-installer-paths` | PASS | Public shell, PowerShell, Homebrew, and Scoop paths verified |

Cross-checking every claim-like landing and README sentence found a matching
claims entry and observable test. There is no unlisted or untested product
claim.

## Earlier finding verification

Every earlier `.factory/review-*.md`, `.factory/polish-*.md`, and the incoming
handoff was read. Each finding was checked against current source, production,
and its current test rather than accepted from a closure note.

| Earlier ID | Current confirmation |
| --- | --- |
| F-1-1 | `release-signatures` downloaded every current payload/manifest and passed pinned Cosign verification. |
| F-1-2 | Signer-failure, diagnostic, schema, platform-signing, and billing-boundary claims remain listed and passed. |
| F-1-3 | Live/source h2 is `How the readiness check works`. |
| F-1-4 | Live/source h3 values are `What the CLI checks` and `What the CLI never does`. |
| F-1-5 | Live/source h2 is `Install the command-line tool`. |
| F-1-6 | Home, Demo, Privacy, Terms, and 404 have distinct titles, descriptions, canonicals, and Open Graph metadata. |
| F-2-1 | Browser device calls are zero; Permissions Policy disables USB/Serial; every current release archive checksum passed. |
| F-2-2 | Live/source h2 is `Sample readiness report`. |
| F-2-3 | Live/source h2 is `Fleet report review`. |
| F-3-1 | Live/source h3 is `Connect one Android device`. |
| F-3-2 | Live/source h3 is `Check device and app readiness`. |
| F-3-3 | Live/source h3 is `Follow the report’s next step`. |
| F-3-4 | README h2 is `Run a device readiness check`. |
| F-4-1 | The public live one-device `check` passed with isolated home/config/data and all license variables removed; free visitors cannot open paid Fleet tools. |
| F-5-1 | Header Demo/Privacy and footer Terms use History API routing; destination, Back, and Forward focused the h1 in live checks. |

No earlier finding is unfixed, half-fixed, or regressed. F-6-1 is a new
site-structure finding.

## Structure, accessibility, routing, links, and identity

Pass except F-6-1. The production build byte-matches live HTML, fingerprinted
JS/CSS, service worker, and hero art. `/`, `/?demo=1`, `/demo`, `/privacy`, and
`/terms` return 200; an unknown route returns the designed 404 with HTTP 404 and
a return action. Every route has one h1, ordered headings, landmarks, skip link,
route-specific title/description/canonical/Open Graph data, favicon, and the
consistent header/footer with Privacy and Terms. The Open Graph art is
1200 × 630 and the Apple icon is 180 × 180.

History navigation, global-link focus, route announcements, keyboard use,
reduced motion, 200% text, 390 px overflow, 44 px targets, and offline demo
reload passed. Playwright Axe found zero serious/critical issues on home, Demo,
Privacy, Terms, and 404. The factory URL checker reported no console or basic
accessibility errors on all four real routes.

The crawl resolved every product route, installer, GitHub release page,
Sociobot page, and hosted checkout transition. The only HTTP 404 encountered
was the expected self-targeting skip link on the deliberately missing 404 test
page, not a dead destination. F-6-1 concerns disclosure, not reachability.

Production JavaScript is 22,018 bytes raw / 7,510 bytes gzip; CSS is 8,278
bytes raw / 2,732 bytes gzip. Response headers include CSP with
`frame-ancestors 'none'`, HSTS, nosniff, restrictive referrer policy, and a
Permissions Policy that disables USB and Serial.

The concrete-and-moss field-tag composition, original rugged-device art,
squared controls, evidence-strip report, monospace evidence type, and restrained
motion match `.factory/design.md`. The result is recognizable and not a generic
SaaS template.

## Quality gates

The same clean clone passed:

- `npm test`: 27 Node tests; 73 Playwright tests passed and one intentional
  mobile-project skip.
- `npm run build`: produced `dist/site`.
- `cargo fmt --check`.
- `cargo clippy --all-targets --all-features -- -D warnings`.
- `cargo test --all-targets`: 22 tests passed.
- `cargo build --release --locked`.
- `cargo package --locked` and package verification.
- `node scripts/verify-live.mjs https://sideload-readiness.sociobot.in`.

## Missed leverage

No obvious brief-implied feature is missing. A model-generated safety decision
would weaken this deterministic read-only diagnostic, so an AI step is not
warranted. The useful adjacent capabilities are present: browser and CLI
samples, JSON export, local fleet import, platform installers, and public
checksum/signature verification. Sync would conflict with the local report
boundary without a separate user need. No decorative AI feature, embedded
provider key, or Azure endpoint exists.

## What would make this perfect

Fix F-6-1 by identifying every off-origin destination in its visible or
accessible link wording, add an automated external-link disclosure assertion,
and rerun the live crawl. Nothing else was found, but the verdict cannot become
PASS until that final finding is closed.
