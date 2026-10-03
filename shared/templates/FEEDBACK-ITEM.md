---
id: FB-<NNN>
source: <person | stakeholder | user-test | reviewer | skill>
from: <who or what gave it: a name, "review 2026-10-03-all", a skill name, a file path>
round: <n>
kind: <bug | change | idea | question | praise>
severity: <blocker | polish>
target:
  plan: <plan file, or none>
  screen: <screen or route>
  state: <state name, when known>
  element: <selector or role + name, when known>
status: <open | triaged | building | done | rejected | deferred>
closed-by: <task path and commit, decision record, answer, or reason>
---
# FB-<NNN> — <short title>

## Feedback

<the feedback text, exactly as given; quote it>

## Evidence

- <what was seen, in words; crop or screenshot path in `docs/ux/.scratch/` while the round is open, or none>

## Triage

<judge numbers, or `judge: self`; conflict with other items; route chosen: fix task | plan update + change task + decision | new plan | deferred | answer | log>

## Outcome

<what was done, or why it was rejected or deferred>
