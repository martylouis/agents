---
name: context
description: Create or refresh docs/ux/CONTEXT.md (stack, commands, exact vocabulary, component patterns) and the design summary from the repo and the designs. --refresh after a library or design change; --sync after a design-system release.
argument-hint: "[designs folder] [--refresh | --sync]"
disable-model-invocation: true
---

# Context

You prepare the vocabulary that every builder reads: `docs/ux/CONTEXT.md` and the design summary. `/proto:build` runs the same procedure in its intake; the person runs this skill to prepare or check the vocabulary on its own, before the first run, after a library upgrade or a design-system release, or when builders keep making the same mistake (wrong class, wrong icon, look-alike component). That mistake is almost always a missing or vague name here.

`<skill>` means this skill's base directory and `<plugin>` means the plugin root (`<skill>/../..`).

## Arguments

| Argument | Mode |
| --- | --- |
| none | **create** when `docs/ux/CONTEXT.md` does not exist; else **refresh** |
| `<designs folder>` | Also read design images (hi-fi: tokens and components) |
| `--refresh` | **refresh**: re-read the library and the designs, show what changed |
| `--sync` | **sync**: check the prototype overrides against the real design system |

## Steps

The reading and checking run in the `ux-context` agent (Sonnet), so the library files stay out of this session. You review its result.

1. Follow `<plugin>/shared/TOOLS.md` → File names (rename old lowercase files). In **sync** mode, also install the scripts first when needed (`<plugin>/shared/TOOLS.md`, step 1).
2. Follow `<plugin>/shared/CONTEXT-DISPATCH.md`, in the mode above: the design inventory (hi-fi), then `ux-context`, then your review. Hi-fi runs write the inventory into the run folder `docs/ux/.scratch/<date>-context-<mode>/` (`<plugin>/shared/TOOLS.md` → Scratch).

This skill changes no prototype code. It writes only `docs/ux/CONTEXT.md`, the design summary, `docs/ux/tokens/` (situation **none**), and decision records and `DECISIONS.md` rows in **sync** mode.

Done when the procedure's completion criterion holds: no `<placeholder>` left, and every name verified or listed under "Not verified".

## Reply

One short summary, then the paths of the files written:

```
Context — created
- Stack: Nuxt · Nuxt UI · Tailwind · bun
- Fidelity: lo-fi · design system: full (Nuxt UI)
- Vocabulary: 14 colors and surfaces · 9 components · 9 patterns · icons i-lucide-*
- Not verified: none
- Files: docs/ux/CONTEXT.md · design summary: none (lo-fi)
Read the Vocabulary section and correct any name before the first run.
```

For **refresh**, the change lines from procedure step 9. For **sync**, adopted overrides, conflicts, and open proposals (procedure step 10).
