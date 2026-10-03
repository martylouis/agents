# Review — <date> · <scope>

## Result

<N> states · <B> blockers · <P> polish · fidelity <lo-fi | hi-fi> · judge <typesafe | self | not used>

- Prototype: <url>, commit <short hash>, working tree <clean | dirty (N files): list them>
- States: <states files used; "discovered" when this review discovered them>

## States

| State | Verdict | Finding |
| --- | --- | --- |
| <name> | ok \| blocker \| polish | <one line, or none> |

## Blockers

### <state> — <one line>

- Seen: <what the screenshot and the code facts show>
- Expected: <from the plan, the states file, or the design>
- Cause: <file and line when known, or "not found">; <"file has uncommitted changes" when the tree is dirty and the file is one of them>
- Evidence: `evidence/<state>.png`, `evidence/FACTS.md` → `## State: <state>`
- Feedback item: `items/<NN>-<slug>.md`

## Polish

- <state> — <one line> (`items/<NN>-<slug>.md`)

## Not checked

- <states that could not run, and why>

## Next

`/ux-orch:feedback <this folder>` turns the items into fixes.
