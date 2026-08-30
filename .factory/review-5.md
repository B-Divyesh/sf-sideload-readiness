# Adversarial first-read review 5

Product: Sideload Readiness  
URL: https://sideload-readiness.sociobot.in  
Reviewed commit: f4e17396ade8706ad016b87ffafcd4c9d8f30593  
Date: 2026-08-30 UTC  
Verdict: FAIL

The product is clear on first view, the sample is real and isolated, and every
declared claim passes from a clean clone. One routing accessibility defect
remains, so the zero-findings standard requires FAIL.

## First screen

Fresh Chromium contexts without prior cookies, storage, service workers, or
history were opened at 390 × 844 and 1440 × 900.

| Question | Answer before scrolling | Exact first-screen text |
| --- | --- | --- |
| What does it do? | Checks Android update safety. | Check Android update safety |
| Who is it for? | People maintaining approved sideloaded apps as rules or recovery paths change. | For people who maintain approved sideloaded apps when device rules or recovery paths change. |
| What should I click first? | Open the sample report. | Try it with sample data → See a redacted report and the next safe step. |

At 390 px, the action was y=442.31–490.63 and its result ended at y=527.98:
both were visible before scrolling. The concrete-and-moss field-tag treatment
is distinct, original, and matches the design thesis.

## Findings

### F-5-1 — BLOCKING — header navigation and Back do not focus the destination heading

Location: The live header Demo link is an anchor to /demo, and Privacy uses the
same pattern. The route/focus handler in site/app.js applies only to links marked
data-route.

Evidence: In a fresh live context, activate header Demo, then use Back. The
route returns to / with h1 Check Android update safety, but the active element is
BODY, not h1#page-title. The primary Try it with sample data link uses
data-route and does focus the demo h1, so this is inconsistent product routing.

Why this fails: A keyboard or screen-reader user returning through visible
global navigation is not placed at, or told, the new page heading. The route
contract requires real URLs plus back/forward focus restoration.

Concrete fix: Apply the existing same-origin pushState route handler to every
header and footer route link. Add desktop and mobile tests that activate header
Demo and Privacy, use Back and Forward, and assert that the active element is
page-title after every route change.

## Demo and sandbox

Pass; no finding. One landing click opened /?demo=1. Its first 390 px viewport
already showed a realistic report for device-6f31a0b2, an 83% score, findings,
a needs-review recovery result, and the recovery checklist. The persistent
banner said Demo — sample data, nothing is saved. and provided Reset demo and
Start for real.

With real:sentinel = must-survive seeded before entry, demo created only
demo:sideload-readiness; Reset recreated it; Start for real removed it while
leaving the sentinel intact. The fresh landing → demo → reset → exit request log
contained only the product origin and no console error. A fresh context reloaded
the demo offline and still showed its h1.

The real CLI demo was run in a newly created temporary directory. It printed an
unpredictable output path and created a mode-0600 JSON report with schema
sideload-readiness/v1, mode demo, redacted device-6f31a0b2, six findings, and
five recovery-list items. It made no adb connection.

## Claims and quality checks

A fresh clone at the reviewed commit passed every one of the 32 exact claim
commands: demo-report, json-report, redacted-id, read-only-checks,
unauthorized-device, signer-continuity, signer-unreadable, diagnostic-report,
example-schema, device-selection, demo-no-adb, cli-report-storage,
private-demo-file, explicit-output-replacement, single-device-free, local-demo,
browser-demo-no-device, privacy, fleet-review, license-verification,
license-retention, fleet-checkout, verified-installer, installer-path-setup,
installer-platform-support, platform-packaging, release-manifest,
release-signatures, release-checksums, unsigned-platform-disclosure,
billing-provider-boundary, and published-installer-paths.

npm test passed (27 Node and 72 Playwright tests) and npm run build produced
dist/site. The clean build's HTML, fingerprinted JS/CSS, service-worker, and
hero-art hashes matched live. No claim-like landing or README sentence lacks a
claims entry.

## Copy audit

Counts treat a hyphenated term, URL, identifier, and numeric version as one
word. Commands are excluded. Headings, labels, actions, and status copy are
included because they affect first read. No unit exceeds 22 words; no banned
marketing word, inconsistent term, empty heading, or non-result-naming button
was found. adb is necessary and consistent.

### Landing page — text (words)

- Android maintenance / read-only checks (4)
- Check Android update safety (4)
- For people who maintain approved sideloaded apps when device rules or recovery paths change. (14)
- Try it with sample data (5)
- See a redacted report and the next safe step. (9)
- Read-only adb checks (3)
- Device IDs are redacted (4)
- Free for one device (4)
- A rugged handheld device and USB cable rest on concrete beside small patches of moss. (15)
- Sample readiness report (3)
- Readiness report / sample (3)
- device-6f31a0b2 · Android 15 (sample) (4)
- 83% · Fix one item before recovery (6)
- Authorized USB debugging (3)
- One authorized sample device is visible to adb. (8)
- Keep the authorization prompt accepted while checking. (7)
- Developer options (2)
- Developer options are enabled. (4)
- Leave this unchanged for approved maintenance. (6)
- USB data mode (3)
- The sample device exposes adb over USB. (7)
- Use a data-capable cable if this changes. (7)
- Free data storage (3)
- 2.8 GiB free on /data. (6)
- The 1 GiB safety floor is met. (7)
- Keep the floor before copying an update. (7)
- Package signer match (3)
- The installed sample signer SHA-256 matches the expected approved signer. (10)
- Keep the approved APK and signer digest with this report. (10)
- Recovery update visibility (3)
- A/B update support is visible, but Android cannot safely prove recovery sideload status while running. (16)
- Read your device’s approved recovery instructions before using recovery. (9)
- Recovery checklist (2)
- Keep the approved APK and its known-good version. (8)
- Record the app package and signer before an update. (9)
- Stop after an error and save the report before retrying. (10)
- Install the command-line tool (4)
- Wrote readiness.md (2)
- Signer matched. (2)
- Review recovery before updating. (4)
- The command asks adb for status. (6)
- It does not install apps, unlock devices, or change Android settings. (11)
- The macOS package and Windows app are unsigned. (8)
- Verify the matching Sigstore bundle before installation. (7)
- Open release downloads (3)
- Linux and macOS installer (4)
- PowerShell installer (2)
- Checking published downloads. (3)
- Opening the checksummed download. (4)
- Choose your Mac type (5)
- Apple silicon Mac (.pkg) (4)
- Intel Mac (.pkg) (3)
- Choose Apple silicon or Intel before downloading. (7)
- This browser does not identify a supported desktop system. (10)
- Open releases to choose a file. (6)
- Downloads are being published. (4)
- Open the release page for the current status. (8)
- How the readiness check works (5)
- Connect one Android device (4)
- Accept Android’s USB debugging prompt. (5)
- Choose a device when adb lists more than one. (9)
- Check device and app readiness (5)
- Compare the installed signer SHA-256 with the approved APK. (9)
- Read storage, USB state, and recovery clues. (7)
- Follow the report’s next step (5)
- Save a redacted report. (4)
- Follow its next step or stop before an update. (9)
- What this tool does and does not do (8)
- What the CLI checks (4)
- Make a device-specific report from read-only adb queries. (8)
- It explains what to check next. (6)
- What the CLI never does (5)
- It never bypasses Android controls, unlocks bootloaders, or distributes APKs. (10)
- Small IT teams (3)
- Fleet report review (3)
- Fleet review is a $39 one-time license. (8)
- It adds a local report queue and package-status table. (9)
- Single-device checks stay free. (4)
- $39 one-time purchase (3)
- Buy fleet review (3)
- Have a license? (3)
- Paste it here. (3)
- Verify fleet license (3)
- Verification happens with Sociobot when you choose this button. (9)
- Read-only Android update checks for cautious maintainers. (7)

### README — text (words)

- Sideload Readiness (2)
- Check Android update safety before you update an approved sideloaded app. (10)
- Sideload Readiness is for Android power users and small IT teams. (11)
- It runs read-only adb checks, writes a redacted report, and gives a recovery checklist. (14)
- It never installs an APK, changes Android settings, unlocks a bootloader, or bypasses a device policy. (15)
- The one-click browser demo is at sideload-readiness.sociobot.in/?demo=1. (7)
- It uses sample data in a separate browser key. (9)
- Nothing in demo mode touches a connected Android device. (9)
- Install (1)
- Releases support Linux, macOS, and Windows. (5)
- Each published archive has a SHA-256 line in SHA256SUMS. (9)
- The shell installer writes to ~/.local/bin and adds that directory to your startup profile. (14)
- A curl | sh command cannot change its parent terminal, so run the exact export PATH line it prints before your first command. (22)
- New terminals find sideload-readiness automatically. (4)
- The PowerShell installer adds the directory to the current session and your user PATH. (13)
- Every current release payload and manifest has a valid GitHub OIDC Sigstore bundle. (13)
- Verify a downloaded asset with: (6)
- The shell installer supports Linux x86_64 and macOS arm64 and x86_64. (11)
- It stops before a download on Linux ARM64 because no release asset is published. (14)
- The macOS package and Windows app are unsigned. (8)
- Verify their Sigstore bundles before installation. (6)
- On macOS, right-click the package and choose Open. (9)
- Install with the published Homebrew tap: (6)
- Install with the published Scoop bucket: (6)
- The winget/ folder contains the checksum-pinned v0.1.4 manifest. (8)
- The owner must submit it to microsoft/winget-pkgs before advertising a winget command. (12)
- Run a device readiness check (5)
- Connect one device and accept Android's USB debugging prompt. (9)
- If adb lists several authorized devices, the command stops until you pass --device SERIAL. (13)
- Get the expected signer SHA-256 from your approved APK: (9)
- Compare that digest with the installed package: (7)
- The command reads the installed base APK through adb and parses its signing certificate locally. (15)
- A matching digest is ready, and a mismatch is blocked. (10)
- If the package or certificate cannot be read, the result is needs-review. (13)
- Use JSON in scripts: (4)
- Try the bundled sample without adb: (6)
- The sample creates one private, unpredictable temporary report file and prints its path. (12)
- It never reuses an existing temporary filename. (8)
- --output PATH is different: it writes the requested path and replaces that file when it already exists. (17)
- examples/sample-report.json documents the stable schema and values. (7)
- The report checks: (3)
- Authorized USB debugging and USB data mode. (6)
- Developer options visibility. (3)
- Free /data storage against a 1 GiB safety floor. (8)
- Installed signer SHA-256 comparison when a package and expected signer are supplied. (11)
- A/B update hints and a recovery checklist. (7)
- Android does not expose a safe, complete recovery-sideload status while it is running. (13)
- The report labels that check needs-review and tells you to use the device maker's approved recovery instructions. (17)
- Fleet review (2)
- Single-device reports are free. (4)
- Fleet review is a $39 one-time license. (8)
- It adds a local report queue and a package-status table on the site. (12)
- Checkout and license verification use Sociobot; no payment provider is embedded here. (11)
- Develop and verify (3)
- Requirements: current Rust stable, Node 20+, and adb only for a live check. (11)
- npm run build:site creates the deployable static site in dist/site. (9)
- The factory deploys that directory; this repository does not manage DNS or cloud infrastructure. (13)
- npm run build is an alias for the deploy build. (10)
- Release installers are built only in GitHub Actions by .github/workflows/release.yml. (10)
- npm test includes desktop and 390 px mobile browser checks for keyboard use, accessibility, offline reloads, privacy, and release-download behavior. (19)
- Privacy and license (3)
- The CLI has no report-upload command. (7)
- A regular check writes a file only with --output PATH. (10)
- A demo without --output creates a private temporary file and prints its path. (12)
- Hardware serials are replaced with a redacted ID in exported reports. (11)
- The site has no analytics or third-party runtime scripts. (9)
- See Privacy and Terms. (4)
- License (1)
- MIT (1)

## Earlier findings

Every earlier review, polish record, and handoff was read. Each earlier finding
was checked against current source and production; none is unfixed, half-fixed,
or regressed.

| Earlier ID | Current confirmation |
| --- | --- |
| F-1-1 | release-signatures passed current public-release Cosign verification. |
| F-1-2 | The signer, diagnostic, schema, platform-signing, and billing claims remain listed and passed. |
| F-1-3 | The h2 is How the readiness check works. |
| F-1-4 | The h3 values are What the CLI checks and What the CLI never does. |
| F-1-5 | The h2 is Install the command-line tool. |
| F-1-6 | Home, demo, privacy, terms, and 404 retain distinct metadata and canonicals. |
| F-2-1 | Browser device calls were zero; Permissions Policy disables USB/serial; checksums passed. |
| F-2-2 | The h2 is Sample readiness report. |
| F-2-3 | The h2 is Fleet report review. |
| F-3-1 | The h3 is Connect one Android device. |
| F-3-2 | The h3 is Check device and app readiness. |
| F-3-3 | The h3 is Follow the report’s next step. |
| F-3-4 | The README h2 is Run a device readiness check. |
| F-4-1 | The public one-device check test passed without license state. |

F-5-1 is new. It does not regress the primary sample route, which correctly
focuses the h1 after its History API transition.

## Structure, accessibility, links, and identity

/, /?demo=1, /demo, /privacy, and /terms returned 200. A missing path returned
the designed HTTP 404 page with a return action. Every checked route has a
route-specific title, description, canonical, Open Graph data, favicon,
lang="en", one h1, main landmark, skip link, and Privacy/Terms footer.

Production headers include CSP with frame-ancestors none, HSTS, nosniff,
restrictive referrer policy, and Permissions Policy disabling USB and serial.
The live verifier passed byte identity, metadata, mobile layout, same-origin
demo traffic, demo isolation, offline reload, zero console errors, and zero
serious/critical Axe issues. verify-url.sh separately passed home, demo,
privacy, and terms. Product routes, installers, GitHub Releases, Sociobot, and
hosted checkout all resolved. F-5-1 is the routing-focus exception.

## Missed leverage

No feature is missing from the brief. This is a deterministic read-only device
diagnostic; an AI-generated safety conclusion would weaken its reliability.
Useful adjacent capabilities already exist: browser and CLI samples, JSON
output, local redacted fleet import, and platform installers. No decorative AI,
embedded provider key, or Azure endpoint is present.

## What would make this perfect

Apply the focused History API transition to all same-origin global navigation,
test header navigation plus Back/Forward on desktop and mobile, and rerun the
clean-clone claim loop and live first-read checklist. Only zero findings should
change the verdict to PASS.

