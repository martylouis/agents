# Changelog

All notable changes to the `ux-orch` plugin, newest first. The version number lives in `.claude-plugin/plugin.json`; this file holds the notes. Format: [Keep a Changelog](https://keepachangelog.com).

## 0.4.1 — 2026-10-05

### Changed
- The design inventory is a scratch file, `<run folder>/DESIGN-INVENTORY.md`, not `docs/ux/DESIGN-INVENTORY.md`. `ux-context` reads it for the vocabulary and, when no `DESIGN.md` exists, writes `DESIGN.md` from it, so one committed file holds the design summary and nothing can drift from a second copy.
- A `DESIGN.md` written by `ux-orch` starts with `<!-- ux-orch design-summary -->`. **refresh** rewrites only such a file. An external `DESIGN.md` (for example from Impeccable) is never changed; differences go under "Not verified".
- Scratch kind `context` for the `context` skill's run folder.

## 0.4.0 — 2026-10-05

### Changed
- One `docs/ux/DECISIONS.md` replaces `decisions/LOG.md` and `decisions/INDEX.md`: the log table (with an `ID` column) and the list of committed design-system records. The log table holds every ID, committed or not, so the next `NNN` is its highest `ID` plus one. `decisions/` exists only after the first design-system record. `TOOLS.md` → Old decisions converts an old `LOG.md` and `INDEX.md` on the first run, without a confirmation.

### Removed
- `docs/plans/INDEX.md`. Its fields are in the plan files (`status`, `depends-on`, Goal), and `docs/ux/PLANS.md` is the one plan index with run data. `plan` no longer writes it, and `orchestrate` no longer skips it by name. An existing `INDEX.md` can stay; skills ignore it.

### Fixed
- States are stored by plan: `feedback` adds a state to `states/<NN-plan-slug>.json`, never to a file named for a round. `review` writes `discover.mjs` output to the run folder, then merges each state into its plan's state file. `RECORDS.md` says what a state file is and why skills reuse it.
- `scratch-clean.mjs` never deletes a folder whose name ends in `-legacy`, and does not count it in the newest N. It prints `keep` with the reason "legacy records". The owner may delete a legacy folder by hand (`TOOLS.md` → Old evidence).

## 0.3.2 — 2026-10-05

### Added
- `shared/scripts/size.mjs`: prints the bytes and estimated tokens of each skill, agent, shared file, and template.

### Changed
- `shared/CONTEXT-DISPATCH.md` holds the dispatch steps that skills need. `CONTEXT-PROCEDURE.md` is now for the `ux-context` agent only. A skill that dispatches `ux-context` loads about 2.1K fewer tokens.
- Judge pointers in the skills name their section (`JUDGE.md` → Question bank).

## 0.3.1 — 2026-10-05

### Added
- `shared/scripts/scratch-clean.mjs`: keeps the newest scratch runs (`scratch:` in `PLANS.md`) and every feedback round with open items, and trashes the rest. `--dry-run` shows the verdicts only.

### Changed
- Scratch cleanup runs the script; the agent no longer deletes folders itself.

### Removed
- The "41 MB now" size text in the `orchestrate` start confirmation.

## 0.3.0 — 2026-10-05

### Added
- `docs/ux/HISTORY.md`: one committed row per feedback item (text, status, commit or reason).

### Changed
- Item files, task files, `RUN-LOG.md`, and `REPORT.md` go into the run folder in `docs/ux/.scratch/`, not into git. Committed: `CONTEXT.md`, `BUILDER-RULES.md`, `PLANS.md`, `docs/plans/`, `states/`, `HISTORY.md`, `decisions/LOG.md`, and design-system decision records.
- A `--tweak` adds one `HISTORY.md` row and one `LOG.md` line, and writes no item file.
- `comment.mjs` continues the FB IDs from `HISTORY.md`.
- Records inside a run folder may link to each other; a committed record never links into `.scratch/`.

### Removed
- `docs/ux/feedback/INDEX.md` (replaced by `HISTORY.md`) and `feedback/DEFERRED.md` (deferred ideas are `HISTORY.md` rows).

### Migration
- A prototype with committed `feedback/`, `tasks/`, `RUN-LOG.md`, or `REPORT.md` moves them to scratch (`shared/TOOLS.md` → Old evidence), and its `feedback/INDEX.md` becomes `HISTORY.md`.

## 0.2.1 — 2026-10-05

### Added
- `ux-context` agent (Sonnet) runs the context procedure; the `context` skill and `orchestrate` dispatch it and review its result.
- `smoke.mjs`: builders check that named elements render. `--storage key=value` reaches signed-in routes without touching auth.
- `observe.mjs`: strict clicks (ambiguous matches fail unless `nth` is given), the focused element, a `tab` step, offline states, native form-validation `CHECK` lines, viewport screenshots by default.
- Builder rules: a `files:` list per task, scoped check commands, fixed `not checked (reviewer)` lines in the Result, a version line in `BUILDER-RULES.md`.
- `feedback` reproduces a bug in a state before it writes a fix task.
- `review` records the commit and whether the working tree was dirty.
- Screenshots, code facts, judge files, and reports go to `docs/ux/.scratch/` (git-ignored, last 3 runs kept).

### Changed
- Component patterns list every slot name and an icon pattern.
- A feedback "what" change gets a decision record only at significance 2 or more.
- Progress shows in the harness task list, not in chat checklists.
- `orchestrate` builds one plan file and skips plans marked `done`.
- `plan` asks at most 2 judge-driven questions, from per-part readiness.
- The plugin moved to `plugins/ux-orch/`.

### Fixed
- Old lowercase doc files are found with `git ls-files` and renamed to UPPERCASE.
- Old committed evidence moves to scratch.

## 0.2.0 — 2026-10-03

### Added
- Skills `context`, `plan`, `review`, and `feedback` (comment mode, token diff, state discovery).
- `shared/` folder: procedures, templates, and scripts that several skills use.

### Changed
- README documents the five skills; the install path is fixed.

## 0.1.0 — 2026-10-02

### Added
- First release: the `orchestrate` skill, builder sub-agents, browser review, decision records, and the TypeSafe Jev judge.
