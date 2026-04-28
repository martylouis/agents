---
name: to-md-issues
description: Break a plan, spec, or PRD into independently-grabbable issues as markdown files under docs/issues/ (not GitHub issues), each with YAML frontmatter and a generated README index with a live dependency graph. Use when the user wants issues tracked in-tree instead of on GitHub, when gh is unavailable, or when they say "no gh", "log these locally", "break this plan into issues", "add an issue", "refresh the index", or "regenerate the README" — including extending an existing breakdown or rebuilding the index after manual frontmatter edits (e.g., marking an issue complete).
argument-hint: "<init|add|sync>"
---

# To Markdown Issues

Break a plan into independently-grabbable vertical-slice issues written as markdown files under `docs/issues/` (or a user-specified directory). Frontmatter is the source of truth; a generated `README.md` is the human-readable index.

The output target is local markdown files, not GitHub issues. Do NOT run `gh issue create` — the user is deliberately avoiding GitHub.

## Modes

The skill has three modes, each describing a state transition on the issues directory:

- **`init`** — fresh breakdown into an empty (or new) directory. Numbers start at `01`.
- **`add`** — extend an existing breakdown with new issues. Numbers start at `max(existing) + 1`.
- **`sync`** — read all issue files and rebuild `README.md` from frontmatter. Never modifies issue files.

### Routing

The user can invoke a mode explicitly as a bare positional argument (`init`, `add`, `sync`) or rely on inference. Inference rules, in order:

1. **Explicit bare arg wins.** If the user typed `init`, `add`, or `sync`, use that mode (subject to the conflict-confirmation rules below).
2. **Sync phrasing wins next.** Phrases like "refresh the index", "regenerate the README", "sync the issues", "update the index" route to `sync` regardless of directory state — the user is signaling render intent, not new work.
3. **Otherwise infer from directory state.** Empty or missing output directory → `init`. Non-empty directory → `add`.

The reason inference is the default: the original failure mode for this skill was creating new issues numbered `01`–`06` when the directory already contained `01`–`10`. The model had the directory listing but didn't connect "existing issues exist" with "I'm adding to them." Routing on directory state forces that connection — by the time you're picking a mode, you've already looked at the directory.

### Conflict confirmation

When the explicit bare arg conflicts with directory state, ask before proceeding. Don't refuse, don't silently override.

- **`init` against a non-empty directory** → ask: "directory has N issues — did you mean `add`, or do you want to start fresh in a different path?" Wait for an answer before writing anything.
- **`add` against an empty directory** → ask: "directory is empty — start from `01`?" If yes, route to `init`. If they want to begin numbering at something other than `01`, that's an unusual case worth surfacing.

The reason: the explicit arg signals intent, but it might be wrong (forgotten `cd`, fresh checkout, wrong directory). One confirmation prompt is much cheaper than a silent overwrite.

## Init mode

Use when the output directory is empty or doesn't exist yet, and the user has a plan to break down.

### 1. Gather context

Work from whatever is already in the conversation. If the user passes a PRD path or issue reference, read it. If a `docs/prd/` directory exists nearby, look there for the source-of-truth plan.

If none of those apply — cold start, no plan in conversation, no obvious PRD on disk — ask the user before drafting. One question: "What's the source plan? Paste it, point me at a file, or describe the work and I'll draft from that." Don't infer scope from the repo's code alone — vertical slices need a stated goal, and inventing one risks an authoritative-looking breakdown of work the user never asked for.

### 2. Determine output directory

Default: `docs/issues/` relative to the current app or repo root. If the user passes a path, use that. Create the directory if missing.

### 3. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand current state. Skip if the conversation already covers it.

### 4. Draft vertical slices

Break the plan into **tracer bullet** slices. Each slice is a thin vertical cut through all integration layers end-to-end, not a horizontal slice of one layer.

<vertical-slice-rules>
- Each slice delivers a narrow but COMPLETE path through every layer (schema, API, UI, tests — or, for prototypes, scaffold/state/components/visible result)
- A completed slice is demoable or verifiable on its own. For UI work, "demoable" means a user can click through the slice in a running app. For backend, library, CLI, or infra work, it means a test, script, or command-line invocation exercises the slice end-to-end and produces an observable result (a passing test, a printed output, a file written, an endpoint returning the right shape).
- Prefer many thin slices over few thick ones
</vertical-slice-rules>

### 5. Quiz the user

Present the proposed breakdown as a numbered table starting at `#01`. For each slice, show:

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

### 7. Generate the README

After writing all issue files, generate `<output-dir>/README.md`. See "README generation" below.

## Add mode

Use when extending an existing breakdown with new issues. The directory already contains issues; you're appending coherent new work, not restarting.

### 1. List the directory first

Before doing anything else, list `<output-dir>/*.md` and identify the highest existing `NN`. New issues start at `max(existing) + 1`. This is the single most important step in `add` mode — every other decision depends on the existing state.

Also read the frontmatter of every existing issue. You need their ids, titles, and statuses for the quiz step and for back-pointer maintenance.

### 2. Draft the new slices

Same rules as init's step 4 — vertical, tracer-bullet, demoable. The relaxation: a single-issue add ("add an issue for the redirect bug") doesn't need to be a tracer bullet through all layers. Treat it as a coherent unit of work appropriate to its scope. The vertical-slice framing is a guideline for plan-cuts, not a constraint on every standalone addition.

When a new issue depends on an existing one (`blocked_by` references an existing id), only list **incomplete** prerequisites. Already-complete issues are historical context, not active blockers — listing them clutters the "Blocked by" column in the index and misrepresents the slice's readiness.

### 3. Quiz the user with full context

Present the quiz table in two sections so the user sees the full picture and can catch numbering or dependency errors before files are written:

```
Existing (read-only, for reference):
| #  | Title              | Status        |
|----|--------------------|---------------|
| 01 | App scaffold       | ✅ complete   |
| 02 | Landing page       | 🟡 in-progress|
| ...| ...                | ...           |

New (to be written):
| #  | Title              | Blocked by | User stories |
|----|--------------------|------------|--------------|
| 11 | Add CSV export     | #07        | 12           |
| 12 | Filter UI          | #11        | 13           |
```

The reason for showing existing issues: the failure this skill was designed to prevent is the model treating new work as standalone when it's actually an addition. Putting existing issues in the user-visible artifact forces that connection and lets the user spot stale dependencies (e.g., "wait, #07 is already complete, you don't need to block on it").

Iterate until the user approves.

### 4. Write new issue files

Same filename and frontmatter rules as init. Write in dependency order.

### 5. Update back-pointers on referenced existing issues

For each existing issue that a new issue lists in `blocked_by`, update that existing issue's `blocks` array to include the new id. This is the only kind of edit `add` is allowed to make to existing files — the user owns everything else (title, body, status, acceptance criteria).

The reason this exception exists: `blocks` and `blocked_by` are two views of the same edges; the schema requires symmetry so the dependency graph is readable from either direction. If `add` skips this, the graph is asymmetric until next sync — a known-broken state on disk, which is worse than the original problem.

### 6. Generate the README

Same as init step 7.

## Sync mode

Use when the user has manually edited issue frontmatter (most commonly flipping `status` to `complete`) and wants the README to reflect the new state. Sync never modifies issue files — the user is the authority on content and status.

### Steps

1. Read every `*.md` file in the output directory except `README.md`.
2. Parse each file's YAML frontmatter.
3. **Lint without fixing.** Run these checks and report drift inline; proceed regardless. Don't auto-rewrite — the user opted out of `gh` precisely because they want to own their files.

   - **Reference integrity**: every id in any `blocked_by` or `blocks` list must correspond to an existing issue file.
   - **Symmetry**: if `#A` lists `#B` in `blocked_by`, then `#B` must list `#A` in `blocks`, and vice versa. Report each direction of the mismatch.
   - **Duplicate ids**: no two files share the same `id` frontmatter value.
   - **Id/filename agreement**: the `NN` prefix on the filename matches the `id` field.
   - **Cycles**: the `blocked_by` graph must be acyclic. Report the cycle as `#A → #B → #C → #A`.
   - **Complete-with-incomplete-blockers**: if an issue is `status: complete` but any of its `blocked_by` entries are not complete, warn — usually an honest oversight where the user marked something done without updating its prerequisites.

   Phrase warnings so the user can fix them by hand: name both files involved and the exact field to edit.
4. Regenerate `README.md` from current frontmatter.

If the user wants the lint warnings fixed, they can do it by hand or run `add` again with no new issues — but in practice these inconsistencies should only arise from manual edits, not from skill-driven flows.

## Frontmatter schema

Every issue file opens with YAML frontmatter. Fields:

```yaml
id: "01"                  # zero-padded string; quote to preserve leading zero
title: "Human-readable title"
status: pending           # pending | in-progress | blocked | complete
blocked_by: ["02", "03"]  # list of issue ids; [] if none
blocks: ["04", "05"]      # list of issue ids this unblocks; [] if nothing
user_stories: [1, 5, 7]   # story numbers from the source plan; [] if source has none
created: 2026-04-20       # ISO date
```

Both `blocked_by` and `blocks` are populated so the dependency graph is readable from either direction. `id`, `blocked_by`, and `blocks` use quoted strings so YAML doesn't drop the leading zero.

## Issue body template

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
```

Or "None — can start immediately" if the slice has no blockers.

Cross-references in prose use `#NN` (matching the frontmatter `id`). Do not invent issue numbers — the filename digits and the `id` field are the only identifiers.

## README generation

All three modes produce the same README. It is always a derived view of the frontmatter, never hand-written.

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

- **Dependency graph ordering**: roots (issues with `blocked_by: []`) first. Descend depth-first. If an issue has multiple blockers, place it under its earliest (lowest-id) blocker and note the other dependency inline as `(also blocked by #NN)`. Worked example — `#04` has `blocked_by: ["02", "03"]`:

  ```
  #01 ✅ App scaffold
   ├── #02 ✅ Landing page
   │    └── #04 ⬜ Results (also blocked by #03)
   └── #03 ✅ Wizard primitives
  ```

  `#04` appears once, under its lowest-id blocker (`#02`), with the other blocker noted inline. Don't render `#04` twice.
- **Status emoji**: `pending` → ⬜, `in-progress` → 🟡, `blocked` → 🟥, `complete` → ✅.
- **Next up**: iterate pending issues; include any whose `blocked_by` list is empty or contains only `complete` issues. Sort by id.
- **Parallelizable work**: group pending issues by their set of `blocked_by` ids. Any group of 2+ with the same blocker set and all blockers complete-or-empty is a parallel bundle. Phrase as "After #X lands" if they share a single pending blocker; "Ready now" if all blockers are complete.
- **Progress**: count issues with `status: complete` against total.
- **No LLM-facing notes in the README.** The README is a human-readable index. Don't include instructions for Claude (sync commands, "each file follows the template", status-update how-to) — that guidance lives in this SKILL.md, not in generated output.

## What not to do

- Do not run `gh issue create`, `gh issue edit`, or any other `gh` command. Issues live as markdown.
- Do not write `README.md` by hand — derive it.
- In `add` mode, do not modify existing issue files except to update their `blocks` back-pointer arrays. The user owns title, body, status, and acceptance criteria.
- In `sync` mode, do not modify any issue files at all. Lint and report; don't rewrite.
- Do not create an issue without an explicit `blocked_by` field (use `[]` if none) — downstream derivations assume the field exists.
- Do not invent new frontmatter fields — the schema above is the contract. If a new field is genuinely needed, confirm with the user first and document it here before using it.
- Do not skip the directory listing in `add` mode. The starting `NN` is `max(existing) + 1`, never `01`. Renumbering existing issues silently corrupts every dependency reference and every link in the README.
