# Sideload Readiness design thesis

## Direction: brutalist concrete and moss

This is an inspection tool for devices that are often carried, repaired, and
used in imperfect conditions. The interface takes cues from a field tag fixed
to a concrete wall: squared edges, clear measurements, and small patches of
moss that mark a safe path. It avoids the glossy consumer-app look because
the product is about evidence and cautious recovery.

## Tokens

| Token | Value | Use |
| --- | --- | --- |
| `--ink` | `#172018` | near-black green text |
| `--concrete` | `#e5e1d5` | warm mineral page ground |
| `--surface` | `#f4f1e8` | elevated paper surface |
| `--moss` | `#285b36` | safe/primary action |
| `--lichen` | `#dce8bd` | quiet accent ground |
| `--oxide` | `#9b3c24` | needs-attention state |
| `--signal` | `#e7a92f` | caution state |
| `--rule` | `#a9aa9c` | measured borders |

The site has an explicit light treatment only. The concrete ground is always
painted, so system dark mode never produces unreviewed contrast.

## Type, spacing, and interaction

The display face is a self-hosted-style system monospace stack (`ui-monospace`)
for device evidence. The body is a humanist system sans stack for repair steps.
The pairing keeps command output distinct without adding a downloaded font.
Spacing follows an 8 px field-grid, with a 4 px micro-step. Lines are 2 px
where they separate evidence and 1 px for quiet grouping. Buttons are square,
minimum 44 px tall, and use an inset shadow as their pressed state.

The signature interaction is an evidence strip: readiness rows reveal with a
short upward settle when a report is loaded. It communicates a physical test
being completed. It is removed entirely under `prefers-reduced-motion`.

## Assets and provenance

`site/public/hero-concrete-moss.webp` is an original generated editorial
illustration: an Android-shaped field device against rough concrete with moss
growing around a USB cable. It contains no text or brand marks. Generated in
this work order with `/opt/fleet/lib/gen-image.sh` (factory-image), then
converted to WebP. `site/public/og-concrete-moss.webp` is a crop of the same
original source for social sharing. No third-party artwork, fonts, scripts, or
tracking pixels are used.
