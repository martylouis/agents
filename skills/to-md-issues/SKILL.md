---
name: to-md-issues
description: Break a plan, spec, or PRD into independently-grabbable issues written as markdown files under docs/issues/ (not GitHub issues). Each file has YAML frontmatter (status, blocked_by, blocks, user stories) and a generated README index with a live dependency graph that reflects current status. Use when the user wants issues as local markdown files, when gh is unavailable, when a repo tracks work in-tree instead of on GitHub, or when the user says "no gh" or "log these locally." Also use in --sync mode to regenerate the README after manually editing issue frontmatter (e.g., marking an issue complete). Prefer this over `/to-issues` whenever the user asks to write issues to a directory, track issues as files, or keep the issue index in the repo itself.
---

# To Markdown Issues

Break a plan into independently-grabbable vertical-slice issues written as markdown files under `docs/issues/` (or a user-specified directory). Frontmatter is the source of truth; a generated `README.md` is the human-readable index.

The slicing and review process is the same as `/to-issues`. The output target is different: local markdown files, not GitHub issues. Do NOT run `gh issue create` — the user is deliberately avoiding GitHub.

## Modes

The skill has two modes:

- **Create mode** (default) — break a plan into slices, quiz the user, write issue files, then write the README.
- **Sync mode** — skip slicing entirely. Read all existing issue files, parse frontmatter, rebuild the README from current state.

Enter sync mode when:
- The user passes `--sync` as an argument.
- The user says "refresh the issue index", "update the README", "regenerate the index", "sync the issues", or similar.
- The user just finished editing frontmatter (e.g., marked an issue `complete`) and wants the index to reflect it.

In create mode, also regenerate the README at the end so the index and frontmatter are in lockstep the moment issues land.

## Create mode

### 1. Gather context

Work from whatever is already in the conversation. If the user passes a PRD path or issue reference, read it. If a `docs/prd/` directory exists nearby, look there for the source-of-truth plan.

### 2. Determine output directory

Default: `docs/issues/` relative to the current app or repo root. If the user passes a path, use that. Create the directory if missing.

### 3. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand current state.

### 4. Draft vertical slices

Break the plan into **tracer bullet** slices. Each slice is a thin vertical cut through all integration layers end-to-end, not a horizontal slice of one layer.

<vertical-slice-rules>
- Each slice delivers a narrow but COMPLETE path through every layer (schema, API, UI, tests — or, for prototypes, scaffold/state/components/visible result)
- A completed slice is demoable or verifiable on its own
- Prefer many thin slices over few thick ones
</vertical-slice-rules>

### 5. Quiz the user

Present the proposed breakdown as a numbered table. For each slice, show:

- **Title** — short descriptive name
- **Blocked by** — which slices (if any) must complete first
- **User stories covered** — story numbers from the source plan (if any)

Ask:
- Granularity — too coarse, too fine, or right?
- Dependencies correct?
- Any slices to merge or split?

Iterate until the user approves. Do not write files before approval.

### 6. Write issue files

For each approved slice, write one markdown file. Filename: `NN-kebab-case-title.md` where `NN` is zero-padded (`01`, `02`, …, `10`, …).

Write files in dependency order so cross-references work on the first pass.

#### Frontmatter schema

Every issue file opens with YAML frontmatter. Fields:

```yaml
id: 01                    # zero-padded string, matches filename
title: "Human-readable title"
status: pending           # pending | in-progress | blocked | complete
blocked_by: [02, 03]      # list of issue ids; [] if none
blocks: [04, 05]          # list of issue ids this unblocks; [] if nothing
user_stories: [1, 5, 7]   # story numbers from the source plan; [] if source has none
created: 2026-04-20       # ISO date
```

Both `blocked_by` and `blocks` are populated so the dependency graph is readable from either direction.

When **adding a new issue to an in-flight breakdown** (as opposed to the initial slice pass), only list *incomplete* prerequisites in `blocked_by`. Already-complete issues are historical context, not active blockers — listing them clutters the "Blocked by" column in the index and misrepresents the slice's readiness.

#### Issue body template

```markdown
---
<frontmatter>
---

# NN — Title

## What to build

Concise description of the slice. Describe end-to-end behavior, not layer-by-layer implementation.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Blocked by

- Blocked by #02
- Blocked by #03

Or "None — can start immediately" if the slice has no blockers.
```

Cross-references in prose use `#NN` (matching the frontmatter `id`). Do not invent issue numbers — the filename digits and the `id` field are the only identifiers.

### 7. Generate the README

After writing all issue files, generate `<output-dir>/README.md` using the template in the "README generation" section below. This is the same logic as sync mode — always derive README from the current state of the frontmatter, never hand-write it.

## Sync mode

When invoked with `--sync` or equivalent intent, skip slicing entirely:

1. Read every `*.md` file in the output directory except `README.md`.
2. Parse each file's YAML frontmatter.
3. Validate: every id referenced in a `blocked_by` list exists; `blocks` relationships are symmetric with `blocked_by`. Report and fix inconsistencies.
4. Regenerate `README.md` from current frontmatter (see next section).

Sync mode does not modify issue files themselves — the user is the authority on content and status. It only rewrites the README.

## README generation

Both create mode (at end) and sync mode produce the same README. It is always a derived view of the frontmatter.

### Template

```markdown
# Issues — <project name or "Work plan">

Vertical slices breaking down [the PRD](<link to PRD if known, otherwise omit>). Each slice is a thin, demoable, end-to-end path.

**Legend:**
- **Status:** ⬜ pending  🟡 in-progress  🟥 blocked  ✅ complete

## Dependency graph

<ASCII tree showing the DAG, with status markers next to each node. Example:

#01 ✅ App scaffold
 ├── #02 🟡 Landing page
 │    └── #04 ⬜ Results
 │         ├── #05 ⬜ Options
 │         │    └── #06 ⬜ Payment
 │         │         └── #07 ⬜ Confirmation
 │         └── #08 ⬜ Demo edge cases
 ├── #03 ✅ Wizard primitives
 │    └── (feeds into #04)
 └── #09 ⬜ Order History
>

## Slices

| # | Title | Status | Blocked by |
|---|-------|--------|------------|
| [01](./01-app-scaffold-...md) | App scaffold | ✅ complete | — |
| [02](./02-landing-page.md) | Landing page | 🟡 in-progress | #01 |
| ... | ... | ... | ... |

## Next up

<Auto-derive: pending issues whose blockers are all complete. If none, say so.>

## Parallelizable work

<Auto-derive: groups of pending issues sharing a set of blockers. Example:
- After #01 lands, **#02, #03, and #09** can proceed in parallel.
- After #04 lands, **#05 and #08** can proceed in parallel.
>

## Progress

<N of M complete, percent>
```

### Derivation rules

- **Dependency graph ordering**: roots (issues with `blocked_by: []`) first. Descend depth-first. If an issue has multiple blockers, place it under its earliest (lowest-id) blocker and note the other dependency inline as `(also blocked by #NN)`.
- **Status emoji**: `pending` → ⬜, `in-progress` → 🟡, `blocked` → 🟥, `complete` → ✅.
- **Next up**: iterate pending issues; include any whose `blocked_by` list is empty or contains only `complete` issues. Sort by id.
- **Parallelizable work**: group pending issues by their set of `blocked_by` ids. Any group of 2+ with the same blocker set and all blockers complete-or-empty is a parallel bundle. Phrase as "After #X lands" if they share a single pending blocker; "Ready now" if all blockers are complete.
- **Progress**: count issues with `status: complete` against total.
- **No LLM-facing notes in the README.** The README is a human-readable index. Don't include instructions for Claude (sync commands, "each file follows the template", status-update how-to) — that guidance lives in this SKILL.md, not in generated output.

### Writing the README

Read every `*.md` in the directory, parse frontmatter, run the derivations above, fill the template, write `README.md`. If the plan referenced a specific PRD file (e.g. passed as an argument or mentioned in issue frontmatter), link it at the top.

## What not to do

- Do not run `gh issue create`, `gh issue edit`, or any other `gh` command. Issues live as markdown.
- Do not write `README.md` by hand — derive it.
- Do not modify issue files during sync mode — the user owns content and status.
- Do not create an issue without an explicit `blocked_by` field (use `[]` if none) — downstream derivations assume the field exists.
- Do not invent new frontmatter fields — the schema above is the contract. If a new field is genuinely needed, confirm with the user first and document it here before using it.
