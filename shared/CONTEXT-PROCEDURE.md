# Context procedure

Creates or updates `docs/ux/CONTEXT.md` (stack, commands, exact vocabulary, component patterns, design system) and the design summary. The `context` skill runs it on its own; `orchestrate` runs it in step 1. Builders read `CONTEXT.md` on every task, so every name in it must be exact and every line must earn its tokens.

Testing showed why: when `CONTEXT.md` said "semantic colors", a builder wrote `text-neutral-700 dark:text-neutral-200`; after it listed `text-muted` and `bg-elevated`, the next builders made no color errors. When a task gave only a component name, builders built look-alikes; a short code pattern fixed it.

## Modes

| Mode | When | What it does |
| --- | --- | --- |
| **create** | No `docs/ux/CONTEXT.md` yet | Steps 1–8, writes the files. |
| **refresh** | The library, the stack, or the designs changed | Steps 1–8 again, then shows what changed (step 9). |
| **sync** | The real design system (the base) released a change | Step 10 only. |

## Steps

### 1. Stack and commands

Read `package.json`, the lockfile, framework and build config, the router config, and the styling setup. Fill **Stack** and **Commands** in `CONTEXT.md` (from `<plugin>/shared/templates/CONTEXT.md`). Commands are the ones the repo already has: dev (with its URL), lint, and type check or build.

### 2. Fidelity

A designs folder with images → **hi-fi**. No designs → **lo-fi**: vocabulary comes from the installed framework, or from plain Tailwind when there is none.

### 3. Design-system situation

Pick one and record it in `CONTEXT.md` → Design system:

| Situation | Means | Vocabulary source |
| --- | --- | --- |
| **full** | A component library and its tokens are installed | The installed library |
| **design-only** | A design library exists, no code for it | The designs; components become candidates |
| **partial** | Some components or tokens are installed | The library first, the designs for the rest |
| **none** | Nothing but screen designs (or nothing) | Derived from the screen designs; lo-fi: the framework |

Three token layers, never mixed:

1. **Base:** the real design system. Never changed by the prototype.
2. **Prototype overrides:** owned by the prototype, in the project's token format. Each override needs a decision record (type `design-system`, status `proposed`) that records the base value at the time. The overrides are the design-system proposal list.
3. **Screens:** use tokens only, never hard-coded values.

Use the project's token format. With none (situation **none**, hi-fi), write the derived tokens as W3C Design Tokens (DTCG) JSON in `docs/ux/tokens/prototype.tokens.json`.

### 4. Vocabulary

Fill **Vocabulary** with exact names read from the installed library files, never from memory or docs alone:

- **Colors and surfaces:** the library's CSS variables and utility classes (for example its `dist/**/*.css`). List classes (`text-muted`, `bg-elevated`), never categories ("semantic colors").
- **Components:** the names the library exports, and the props and values the prototype uses.
- **Icons:** the icon set that is installed (check `package.json` and `node_modules`), with its prefix. An icon set that is not installed is a defect, not a choice.
- **Forbidden:** what builders must not write (palette shades, hex, `rgb(`, manual `dark:` color variants), so the review can grep for it.

Hi-fi: also dispatch `ux-describer` with the **Design inventory** template on the design images, and map each color, type style, and component it lists to a library name. A design element with no library match becomes a candidate component (step 6) or a prototype override (step 3).

### 5. Component patterns

For each library component the plans or the existing screens use, add one pattern to **Component patterns**: 3–8 lines, the smallest correct use, with the props and slots this prototype needs. Read the props from the component's type definitions or source in `node_modules`. Tasks point to these patterns and do not repeat them.

### 6. Candidate components

A component the library does not have becomes a **candidate**: a local component, listed under Design system → Candidate components with its file. Before adding one, check the inventory and the existing candidates for a duplicate (same role, same props). Later plans may reuse a candidate; it stays marked candidate until the design system adopts it.

### 7. Design summary

Look for an existing `DESIGN.md` (repo root, `docs/`, `docs/ux/`), for example one written by Impeccable's `init`.

- **It exists:** read it, record its path in `CONTEXT.md` → Location → Design summary, and do not write a second one. `CONTEXT.md` keeps only what it does not hold: stack, commands, exact class names, component patterns.
- **It does not exist,** and the fidelity is hi-fi or the situation is not **none:** write `docs/ux/DESIGN.md` from `<plugin>/shared/templates/DESIGN.md`. Keep it under two pages; link to the source files for detail. Its sections follow the common order (colors, typography, components, visual rules) so another tool can take it over later.
- Lo-fi with situation **none:** no design summary. Write "none".

### 8. Verify

For every name in **Vocabulary** and **Component patterns**, find it in the installed library files (grep the package's `dist/` or exports; for icons, the installed collection). Remove a name that is not found, or list it under "Not verified" with the reason. Write the verify date and the files read.

Done when `CONTEXT.md` has no `<placeholder>` left, and every name is verified or listed under "Not verified".

### 9. Refresh: show what changed

Compare the new values with the file before the refresh. Keep lines the person added by hand when they still verify. Show one line per change:

```
Context refresh
- Vocabulary: + bg-accented · − bg-muted (not found in the installed library)
- Patterns: UForm (updated: a prop was renamed) · + UDrawer
- Icons: i-lucide-* (no change)
- Design summary: no change
```

A change that affects built screens (a removed class or component, a renamed prop) → one line per affected file in the summary, so the person can run `/ux-orch:review`.

### 10. Sync: check the prototype overrides

Run, with the prototype root as cwd:

```bash
node <plugin>/shared/scripts/tokens.mjs diff <overrides file> <base file> [more base files]
```

For each override, it prints the base value and one status:

| Status | Action |
| --- | --- |
| `same` | The base adopted the override. Remove the override, set its decision record to `accepted`, add a line to `decisions/LOG.md`. |
| `differs` | The override stays. Compare the base value with the base value in the override's decision record. Changed → **conflict**: report it, change nothing. Unchanged → still a proposal; no action. |
| `not-in-base` | The token is new in the prototype (a proposal), or the base removed or renamed it. Check the decision record; a removed or renamed token is a **conflict**. |

Show the person: adopted overrides (removed), conflicts (one line each, with both values), and the number of proposals still open. Conflicts are never resolved automatically.
