---
name: do-md-issue
description: Implement a single issue from a `to-md-issues`-style breakdown under `docs/issues/`. Reads the issue file, writes the code to satisfy its acceptance criteria, ticks the checkboxes, runs the project's tests, flips frontmatter status, and regenerates the README index. Use when the user says "do the next issue", "implement issue NN", "grab an issue", "work the next slice", or invokes `/do-md-issue` (optionally with an id like `03`, `#03`, or `01-foo`).
---

# Do MD Issue

Implement one issue from `docs/issues/` end-to-end. Companion to [[to-md-issues]] — that skill produces the issue files, this one works through them.

Path is fixed: `docs/issues/` relative to the current repo root. If the directory is missing or contains no issue files, say so and stop. Do not suggest running `to-md-issues init`.

## 1. Resolve which issue

**No arg → auto-pick.** List `docs/issues/*.md`, read frontmatter, pick the lowest-id issue with `status: pending` whose `blocked_by` list is empty or contains only `complete` issues. If none qualify, print the current state (all complete, all blocked, etc.) and stop.

**Explicit arg → use it.** Accept `03`, `#03`, or `01-foo` (filename prefix). Strip `#` and any trailing chars; match by `id`.

- If the requested issue is `status: complete` → tell the user and stop. Don't redo it.
- If any `blocked_by` entry is not `complete` → list the incomplete blockers and ask "proceed anyway? (y/N)". Don't override silently.

Always confirm the picked issue with the user before proceeding ("Picked #03 — Foo. Proceed?"). One prompt, then go.

## 2. Mark in-progress

Edit the chosen issue's frontmatter: `status: in-progress`. Do this before touching any project code so the state on disk reflects the work-in-flight.

## 3. Implement

Dive straight in. Trust the issue's acceptance criteria as the plan — do not draft a separate plan or use ExitPlanMode. Edit project files to satisfy each criterion.

As each acceptance criterion is met, flip its checkbox in the issue body from `- [ ]` to `- [x]`. Tick boxes as work completes, not in a single batch at the end — a partial implementation should leave a partial checkbox state.

## 4. Run tests

Discover the test command from project conventions, in this order:

1. `CLAUDE.md` (project or nearest parent)
2. `package.json` `scripts.test`
3. `Makefile` `test` target
4. `pyproject.toml` `[tool.*]` test config

If none of these yield a runnable command, **warn and proceed** — do not block completion. If the issue body names specific test files, prefer running those.

## 5. Decide final status

- **Success** — every acceptance-criteria box is `- [x]` AND tests passed (or were skipped because no command was found): flip frontmatter `status: complete`.
- **Partial** — any box is still `- [ ]`, or tests failed: leave `status: in-progress`. Do not flip to `blocked` unless an external dependency is genuinely missing.

Briefly summarize what's done vs outstanding either way.

## 6. Regenerate the README

Regenerate `docs/issues/README.md` by following the **README generation** and **Derivation rules** sections of `to-md-issues` (re-read its SKILL.md if needed). Same template, same status emoji, same dependency-graph layout, same "Next up" and "Parallelizable work" sections, same progress count.

## 7. Show what's next, then stop

After the README is regenerated, print the new "Next up" list so the user can see what just unblocked. Do not auto-invoke `do-md-issue` again on the next issue — let the user re-run when ready.

Do not stage, commit, or push anything. Leave all changes (code, issue file, README) unstaged for the user to review.

## What not to do

- Do not run `to-md-issues init` or recommend it when `docs/issues/` is missing — just report and stop.
- Do not work an issue marked `complete`. Tell the user and stop.
- Do not silently work past incomplete blockers — confirm first.
- Do not draft a plan, enter plan mode, or ask clarifying questions before implementing — the acceptance criteria are the plan.
- Do not commit or stage anything. No git ops.
- Do not auto-chain to the next issue.
- Do not flip `status: complete` if any acceptance-criteria box is unchecked or any test failed.
