---
id: <NNN>
type: <design-change | variant-selected | design-system | scope-change | assumption | learning | superseded-plan>
status: <proposed | accepted | rejected | superseded>
date: <YYYY-MM-DD>
plan: <plan file>
tasks: [<task numbers>]
round: <n>
decided-by: <auto (orchestrator) | auto (judge <confidence>) | person>
design-system: [<tokens, components, or patterns affected>]
---
# <NNN> — <decision in a few words>

**Summary:** <one sentence a stakeholder can read>

## Context
<what was observed, and why a decision was needed>

## Options considered
1. <option>
2. <option> ← selected

## Decision
<the selected option>

## Why
| Reason | Evidence level |
| --- | --- |
| <reason> | <preference | principle | observed | tested> |

## Evidence
<what was seen, in words; screenshots are not committed>
- Before: <state name, visible at tag `ux-round-<n>` or commit>
- After: <state name, visible at tag or commit>
- Image: <design-system records only: `<NNN>.png`, the one committed "after" image; else omit>

## Consequences
- **Design system:** <proposed change, or none>
- **Engineering:** <what builders of the real product must know>
- **Follow-up:** <later plans affected>
