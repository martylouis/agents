# Shared files

Files that more than one skill uses. Each file has one owner topic and is the single source for it; skills point here and do not copy it.

In every skill, `<skill>` means the skill's base directory and `<plugin>` means the plugin root (`<skill>/../..`).

| File | What it holds | Used by |
| --- | --- | --- |
| `TOOLS.md` | Install and check the scripts and the judge; dev server; UPPERCASE file names; scratch folder and cleanup | orchestrate, review, feedback, context |
| `CONTEXT-PROCEDURE.md` | Create, refresh, or sync `docs/ux/CONTEXT.md` and the design summary | `ux-context` agent; context and orchestrate (step 1) dispatch it |
| `RUN.md` | The run loop: dispatch, review, fix rounds, blocked, records | orchestrate (step 4), feedback |
| `REVIEW.md` | The review order, states files, verdicts | orchestrate, review, feedback |
| `JUDGE.md` | Judge setup, thresholds, question bank | all skills |
| `RECORDS.md` | Run log, decision log, full decision records, feedback index | orchestrate, review, feedback |
| `templates/` | File templates (`CONTEXT`, `DESIGN`, `PLAN`, `PLANS`, `TASK`, `DECISION`, `REPORT`, `REVIEW-REPORT`, `FEEDBACK-ITEM`, `ROUND-REPORT`, `BUILDER-RULES`) | see each skill |
| `scripts/` | `observe.mjs` (browser states), `smoke.mjs` (builder smoke check), `discover.mjs` (state discovery), `comment.mjs` (comment overlay), `tokens.mjs` (token diff), `judge.mjs` (TypeSafe) | see each skill |

Scripts run with the prototype root as cwd. The prototype repo holds only `docs/ux/` and the prototype itself; tool scripts and their packages stay here.
