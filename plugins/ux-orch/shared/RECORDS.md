# Records

Details go into files, never into chat. A prototype is throwaway: git keeps the few records that explain a decision, and the run folder keeps the rest. Any old state can be rebuilt from its tag (`ux-round-N`).

| Group | Where |
| --- | --- |
| `CONTEXT.md`, `BUILDER-RULES.md`, `PLANS.md`, `docs/plans/`, `states/<plan>.json` | Committed |
| `HISTORY.md` (one row per feedback item) and `decisions/LOG.md` (one line per small decision) | Committed |
| Full decision records of type `design-system`, and `decisions/INDEX.md` | Committed |
| Item files, task files, `RUN-LOG.md`, `REPORT.md`, `ROUND.md`, `REVIEW.md`, other full decision records, screenshots, code facts, judge files | Run folder: `docs/ux/.scratch/<run>/` (`TOOLS.md` → Scratch). Never committed. |

Records in a run folder link to each other and to committed records. A committed record never links into `.scratch/`.

A state file (`states/<plan>.json`) holds saved routes to one screen in one condition each (route, stored data, clicks). `observe.mjs` runs them, and builders, `review`, and `feedback` reuse them as the test script of the app. The results go to the run folder.

## `<run folder>/RUN-LOG.md`

Append-only, one section per task, written when the task changes state:

```markdown
### 01/05 Login screen — haiku — pass after 1 fix round
- Builder: <tokens>, <tool uses>, <seconds>. Checks: pass.
- Review: <verdict>. Blockers: <cause, one line each>.
- Assumptions: <accepted / fixed, with judge numbers>.
- Polish: <one line each, or none>.
```

Close the log with a `## Lessons` section: what the next run should do differently (missing vocabulary, a component that needed a code pattern, a state the review missed).

## `docs/ux/decisions/LOG.md`

Committed. One table row per small decision and accepted assumption:

```markdown
| Date | Round | Plan/task | Decided by | Decision |
| --- | --- | --- | --- | --- |
| 2026-10-02 | 1 | 01/03 | auto (judge: violates 0.93, risk 2.17) → tweak | Email text: `text-neutral-700` → `text-muted`. |
```

## Full decision records

A decision gets a full record (from `templates/DECISION.md`) when its significance score is ≥ 2: it sets a pattern later screens follow, or it changes the design system. Status `proposed`, `decided-by: auto (…)`. Give every reason an evidence level: `preference`, `principle`, `observed`, or `tested`.

- Type `design-system`: write `docs/ux/decisions/<NNN>-<slug>.md` (committed), because the record goes to the real design system.
- Any other type: write `<run folder>/decisions/<NNN>-<slug>.md`. The `LOG.md` line for it carries the summary.

`NNN` counts across all records. Index every full record in `docs/ux/decisions/INDEX.md` (committed; the next `NNN` is the highest ID there plus one). Link only the committed records:

```markdown
| ID | Type | Summary | Status |
| --- | --- | --- | --- |
| [001](001-button-radius.md) | design-system | Buttons use `rounded-md`. | proposed |
| 002 | design-change | Form errors after the first submit, then live. | proposed |
```

When a later task follows a full record, add the record ID to that task's frontmatter and to the commit body, so the person can see how far a decision spread.

## `<run folder>/REPORT.md`

Written once, at the end (from `templates/REPORT.md`). It is the one place the person reviews the run.

## `docs/ux/HISTORY.md`

Committed. One row per feedback item, the only committed record of feedback. It replaces `feedback/INDEX.md`; no other index of items exists. Update the row each time the item's status changes. `Text` is the item's text, quoted, on one line.

```markdown
| ID | Round | Text | Status | Closed by |
| --- | --- | --- | --- | --- |
| FB-004 | 2 | "Checkout button is hidden on phones" | done | commit abc1234 |
| FB-005 | 2 | "Add a dark mode" | deferred | idea; no plan yet |
| FB-006 | tweak | "Rename 'Use demo account' to 'Try the demo'" | done | commit def5678 |
```

Round is a number, or `tweak`. `NNN` counts across all rows, so an ID is unique in the project. A status is open (`open`, `triaged`, `building`) or closed (`done`, `rejected` with a reason, `deferred`). A round ends only when every item of the round is closed. `scratch-clean.mjs` keeps the folder of a round that has open rows.

## `<run folder>/items/`

One file per item of a round, `FB-<NNN>.md` (from `templates/FEEDBACK-ITEM.md`), with the evidence and the triage numbers. Tweaks write no item file. Crops and screenshots from comment mode go into `<run folder>/crops/FB-<NNN>.png`; the item describes what they show in words.

## `<run folder>/ROUND.md`

The round report (from `templates/ROUND-REPORT.md`): the one place the person reviews a feedback round. The lasting record of the round is its `HISTORY.md` rows, the `LOG.md` lines, the design-system records, and the tag.
