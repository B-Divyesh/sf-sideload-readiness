# Landing copy audit

Rechecked from the rendered `/` route for repair 9. Headings, actions, status
labels, report text, and prose are included. No line exceeds 22 words. The
literal safety statements about not unlocking devices are the allowed literal
use of “unlock.” No other banned word appears.

| Text | Words | Flag |
| --- | ---: | --- |
| Android maintenance / read-only checks | 4 | — |
| Check Android update safety | 4 | — |
| For people who maintain approved sideloaded apps when device rules or recovery paths change. | 14 | — |
| Try it with sample data | 5 | — |
| See a redacted report and the next safe step. | 9 | — |
| Read-only adb checks | 3 | — |
| Device IDs are redacted | 4 | — |
| Free for one device | 4 | — |
| Sample readiness report | 3 | — |
| Readiness report / sample | 3 | — |
| 83% · Review the marked checks before updating. | 7 | — |
| Authorized USB debugging | 3 | — |
| One authorized sample device is visible to adb. | 8 | — |
| Keep the authorization prompt accepted while checking. | 7 | — |
| Developer options | 2 | — |
| Developer options are enabled. | 4 | — |
| Leave this unchanged for approved maintenance. | 6 | — |
| USB data mode | 3 | — |
| The sample device exposes adb over USB. | 7 | — |
| Use a data-capable cable if this changes. | 7 | — |
| Free data storage | 3 | — |
| 2.8 GiB free on /data. | 6 | — |
| The 1 GiB safety floor is met. | 7 | — |
| Keep the floor before copying an update. | 7 | — |
| Package signer match | 3 | — |
| The installed sample signer SHA-256 matches the expected approved signer. | 10 | — |
| Keep the approved APK and signer digest with this report. | 10 | — |
| Recovery update visibility | 3 | — |
| A/B update support is visible, but Android cannot safely prove recovery sideload status while running. | 16 | — |
| Read your device’s approved recovery instructions before using recovery. | 9 | — |
| Recovery checklist | 2 | — |
| Keep the approved APK and its known-good version. | 8 | — |
| Record the app package and signer before an update. | 9 | — |
| Stop after an error and save the report before retrying. | 10 | — |
| Install the command-line tool | 4 | — |
| Signer matched. | 2 | — |
| Review the marked checks before updating. | 6 | — |
| The command asks adb for status. | 6 | — |
| It does not install apps, unlock devices, or change Android settings. | 11 | literal “unlock” |
| The macOS package and Windows app are unsigned. | 8 | listed claim |
| Verify the matching Sigstore bundle before installation. | 7 | listed claim |
| Open releases on GitHub (external) | 5 | external destination named |
| Linux and macOS installer | 4 | — |
| PowerShell installer | 2 | — |
| Checking published downloads. | 3 | — |
| Opening the checksummed download. | 4 | — |
| Choose your Mac type | 5 | — |
| Choose Mac download on GitHub (external) | 6 | external destination named |
| Apple silicon Mac (.pkg) on GitHub (external) | 7 | external destination named |
| Intel Mac (.pkg) on GitHub (external) | 6 | external destination named |
| Download [release filename] from GitHub (external) | 6 | external destination named |
| Choose Apple silicon or Intel before downloading. | 7 | — |
| This browser does not identify a supported desktop system. | 10 | — |
| Open releases to choose a file. | 6 | — |
| Downloads are being published. | 4 | — |
| Open the release page for the current status. | 8 | — |
| How the readiness check works | 5 | — |
| Connect one Android device | 4 | — |
| Accept Android’s USB debugging prompt. | 5 | — |
| Choose a device when adb lists more than one. | 9 | — |
| Check device and app readiness | 5 | — |
| Compare the installed signer SHA-256 with the approved APK. | 9 | — |
| Read storage, USB state, and recovery clues. | 7 | — |
| Follow the report’s next step | 5 | — |
| Save a redacted report. | 4 | — |
| Follow its next step or stop before an update. | 9 | — |
| What this tool does and does not do | 8 | — |
| What the CLI checks | 4 | — |
| Make a device-specific report from read-only adb queries. | 8 | — |
| It explains what to check next. | 6 | — |
| What the CLI never does | 5 | — |
| It never bypasses Android controls, unlocks bootloaders, or distributes APKs. | 10 | literal “unlock” |
| Small IT teams | 3 | — |
| Fleet report review | 3 | — |
| Fleet review is a $39 one-time license. | 8 | — |
| It adds a local report queue and package-status table. | 9 | — |
| Single-device checks stay free. | 4 | — |
| $39 one-time purchase | 3 | — |
| Buy fleet review through Sociobot (external checkout) | 7 | external destination named |
| Opening checkout… | 2 | — |
| Checkout is unavailable. Try again later. Your free single-device report still works. | 12 | — |
| Have a license? | 4 | — |
| Paste it here. | 3 | — |
| Verify fleet license | 3 | — |
| Verification happens with Sociobot when you choose this button. | 9 | — |
| Read-only Android update checks for cautious maintainers. | 7 | — |
| Param Factory on Sociobot (external) | 5 | external destination named |

## README audit

The README was checked sentence by sentence after the repair. Its task heading is
`Run a device readiness check`; no sentence exceeds
22 words and no banned marketing word appears. Every behavior or trust statement
maps to one entry in `.factory/claims.json`. In particular, regular-check and
demo-file storage, installer PATH setup, Linux ARM64 refusal, signer read
failures, all six diagnostics, example parity, platform signing status, Sigstore
provenance, browser-demo device isolation, release archive checksums, the
checksum-pinned winget manifest, and the Sociobot-only billing boundary have
dedicated tagged tests.

## Terminology

| Concept | One term used |
| --- | --- |
| Android maintenance result | report |
| permitted app file | approved APK |
| installed application identifier | package |
| signing certificate identifier | signer SHA-256 |
| system connection command | adb |
| restore instructions | recovery checklist |
| multi-device paid feature | fleet review |
