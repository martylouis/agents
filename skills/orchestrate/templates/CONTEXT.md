# Context

Stable facts for this prototype. Plans and tasks refer to this file and do not repeat it.

## Location

- Prototype root: `<path>`
- Plans (input, owned by the person): `<plans folder>`
- Designs (input): `<designs folder or "none">`
- Orchestration files: `docs/ux/`

## Fidelity

`<lo-fi | hi-fi>` — `<lo-fi: no designs; flow and states first, the framework's default look>` | `<hi-fi: must match the designs in <folder>>`

## Stack (detected)

| Item | Value |
| --- | --- |
| Framework | |
| Build | |
| State | |
| Routing | |
| Styling | |
| Component library | |
| Package manager | |

## Commands

| Purpose | Command |
| --- | --- |
| Dev server | `<command>` → `<url>` |
| Checks (builders run these) | `<lint>`, `<build or type check>` |

## Vocabulary

Builders use ONLY these names, spelled exactly. List real class names and component names, never categories.

- Components: `<library components to use, e.g. UButton, UCard>`
- Text colors: `<exact classes>`
- Backgrounds and borders: `<exact classes>`
- Component props: `<e.g. color="primary|neutral|error", variant="solid|outline|soft|ghost|link">`
- Icons: `<installed icon set and prefix, e.g. i-lucide-*>`
- Forbidden: `<palette shades, hex, rgb, manual dark: color variants>`

## Design system

- Situation: `<full | design-only | partial | none>`
- Overrides: `<file and section where prototype overrides live>`; each override needs a decision record.

## Prototype defaults

- Fake data only. No server, no real payments, no real email.
- Works offline (no external images, fonts, or icons).
- Not included: unit tests, real backend, performance work.
