# Records

Details go into files, never into chat. Four files carry the record of a run.

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
