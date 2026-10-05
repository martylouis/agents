# Records

Details go into files, never into chat. Four files carry the record of a run; feedback rounds add the feedback index and a round report.

**Committed:** `CONTEXT.md`, `PLANS.md`, `RUN-LOG.md`, `REPORT.md` (the latest run; each run overwrites it), `decisions/`, `tasks/`, `states/`, and `feedback/` (item text and indexes). **Scratch, never committed** (`TOOLS.md` → Scratch): screenshots, code facts, judge requests and responses, review reports, and round reports. A prototype is throwaway: the lasting record is the text, and any old state can be rebuilt from its tag.

## `docs/ux/RUN-LOG.md`

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

One table row per small decision and accepted assumption:

```markdown
| Date | Round | Plan/task | Decided by | Decision |
| --- | --- | --- | --- | --- |
| 2026-10-02 | 1 | 01/03 | auto (judge: violates 0.93, risk 2.17) → tweak | Email text: `text-neutral-700` → `text-muted`. |
```

## Full decision records

A decision gets a full record (from `templates/DECISION.md`) when its significance score is ≥ 2: it sets a pattern later screens follow, or it changes the design system. File: `docs/ux/decisions/<NNN>-<slug>.md`, status `proposed`, `decided-by: auto (…)`. Give every reason an evidence level: `preference`, `principle`, `observed`, or `tested`.

Index every full record in `docs/ux/decisions/INDEX.md`:

```markdown
| ID | Type | Summary | Status |
| --- | --- | --- | --- |
| [001](001-validate-on-submit-then-live.md) | design-change | Form errors after the first submit, then live. | proposed |
```

When a later task follows a full record, add the record ID to that task's frontmatter and to the commit body, so the person can see how far a decision spread.

## `docs/ux/REPORT.md`

Written once, at the end (from `templates/REPORT.md`). It is the one place the person reviews the run.

## `docs/ux/feedback/`

One file per feedback item, `r<round>/FB-<NNN>.md` (from `templates/FEEDBACK-ITEM.md`). `NNN` counts across all rounds, so an ID is unique in the project. Crops and screenshots from comment mode go into the round's scratch folder (`crops/FB-<NNN>.png`), and the item describes what they show in words.

`INDEX.md` has one row per item. Update the row each time the item's status changes:

```markdown
| ID | Round | Source | Kind | Target | Status | Closed by |
| --- | --- | --- | --- | --- | --- | --- |
| [FB-004](r2/FB-004.md) | 2 | user-test | bug | checkout-phone | done | task 03/F2-01, commit abc1234 |
| [FB-005](r2/FB-005.md) | 2 | stakeholder | idea | — | deferred | new idea; in DEFERRED.md |
```

An item is open (`open`, `triaged`, `building`) or closed (`done`, `rejected` with a reason, `deferred`). A round ends only when every item of the round is closed.

The round report, `ROUND.md` (from `templates/ROUND-REPORT.md`), goes into the round's scratch folder: the one place the person reviews a feedback round. The lasting record of the round is the items, `INDEX.md`, the decisions, and the tag.
