# Landing copy audit

Captured from the rendered `/` route for v0.1.3. Headings, actions, status
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
| See the report before you touch a device | 8 | — |
| Readiness report / sample | 3 | — |
| 83% · Fix one item before recovery | 6 | — |
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
| Install one small command | 4 | — |
| Signer matched. | 2 | — |
| Review recovery before updating. | 4 | — |
| The command asks adb for status. | 6 | — |
| It does not install apps, unlock devices, or change Android settings. | 11 | literal “unlock” |
| Open release downloads | 3 | — |
| Linux and macOS installer | 4 | — |
| PowerShell installer | 2 | — |
| Checking published downloads. | 3 | — |
| Opening the checksummed download. | 4 | — |
| Downloads are being published. | 4 | — |
| Open the release page for the current status. | 8 | — |
| Make one cautious maintenance decision | 5 | — |
| Connect | 1 | — |
| Accept Android’s USB debugging prompt. | 5 | — |
| Choose a device when adb lists more than one. | 9 | — |
| Check | 1 | — |
| Compare the installed signer SHA-256 with the approved APK. | 9 | — |
| Read storage, USB state, and recovery clues. | 7 | — |
| Act safely | 2 | — |
| Save a redacted report. | 4 | — |
| Follow its next step or stop before an update. | 9 | — |
| What this tool does and does not do | 8 | — |
| It does | 2 | — |
| Make a device-specific report from read-only adb queries. | 8 | — |
| It explains what to check next. | 6 | — |
| It does not | 3 | — |
| It never bypasses Android controls, unlocks bootloaders, or distributes APKs. | 10 | literal “unlock” |
| Small IT teams | 3 | — |
| Review several reports together | 4 | — |
| Fleet review is a $39 one-time license. | 8 | — |
| It adds a local report queue and package-status table. | 9 | — |
| Single-device checks stay free. | 4 | — |
| $39 one-time purchase | 3 | — |
| Buy fleet review | 3 | — |
| Have a license? | 4 | — |
| Paste it here. | 3 | — |
| Verify fleet license | 3 | — |
| Verification happens with Sociobot when you choose this button. | 9 | — |

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
