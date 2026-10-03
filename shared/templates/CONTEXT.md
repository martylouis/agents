# Context

Stable facts for this prototype. Plans and tasks refer to this file and do not repeat it.

## Location

- Prototype root: `<path>`
- Plans (input, owned by the person): `<plans folder>`
- Designs (input): `<designs folder or "none">`
- Design summary: `<path to DESIGN.md, or "none" (lo-fi)>`
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

Verified `<YYYY-MM-DD>` against `<library files read>`. Not verified: `<names, or "none">`.

## Component patterns

One pattern per library component this prototype uses. Tasks point here (`CONTEXT.md → Component patterns → UForm`) and do not repeat the pattern.

### `<Component>`

```<lang>
<3–8 lines: the smallest correct use, with the props and slots this prototype uses>
```

## Design system

- Situation: `<full | design-only | partial | none>`
- Token format: `<the project's format, e.g. CSS variables in app.css, DTCG JSON>`
- Base (the real design system, never changed): `<package or file>`
- Prototype overrides: `<file>`; each override needs a decision record.
- Screens use tokens only, never hard-coded values.
- Candidate components (not in the library, local to the prototype): `<name — file, or "none">`

## Prototype defaults

- Fake data only. No server, no real payments, no real email.
- Works offline (no external images, fonts, or icons).
- Not included: unit tests, real backend, performance work.
