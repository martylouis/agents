# Judge

The judge turns a text question into a typed answer with a confidence: Noul (yes/no probability), Choice (one option), or Score (position on ordered levels). It is fast and cheap, and it is text only.

## Which judge

Run `node <plugin>/shared/scripts/judge.mjs --check` with the prototype root as cwd.

- `judge: typesafe` → TypeSafe System One (`jev-latest`). Write the request JSON to `<run folder>/judgments/<NN>-<name>.request.json` (scratch, never committed; the `plan` skill, which has no run, uses `docs/ux/.scratch/<YYYY-MM-DD>-plan-<slug>/judgments/`; the numbers that matter go into the log line or decision record that used them) and run `node <plugin>/shared/scripts/judge.mjs <request> <response>`.
- `judge: self` → you answer the same questions yourself, in the same shapes, and record them the same way. Mark them `judge: self` in the logs.

Request shape:

```json
{
  "state": { "...": "the evidence, as named JSON fields" },
  "questions": {
    "<id>": { "type": "noul", "instructions": "Question that names `state.path`", "criteria": { "true": "…", "false": "…" } },
    "<id>": { "type": "choice", "instructions": "…", "criteria": { "optionA": "meaning", "optionB": "meaning" } },
    "<id>": { "type": "score", "instructions": "…", "criteria": ["level 0 meaning", "level 1 meaning", "level 2 meaning", "level 3 meaning"] }
  }
}
```

Put all independent questions over the same evidence in ONE request; they run in parallel.

## Thresholds

| Confidence or probability | Action |
| --- | --- |
| ≥ 0.9 (Noul ≥ 0.9 or ≤ 0.1) | Act on it. |
| 0.5 – 0.9 | Act on it, and confirm with your own review (look at the evidence). |
| < 0.5 | Decide yourself from the evidence. Log it as a judge disagreement or abstention. |

The judge never replaces the **Look** step in `REVIEW.md`. Its errors in testing were on the safe side (uncertain passes, no false passes), and only when the hi-fi text descriptions were present; with code facts alone, it was uncertain about everything.

## Question bank

**Routing** (step 3, one Choice per task, all tasks in one request): `state.tasks.<id>` = the task text.
- criteria `fast`: "A small, fast coding model can do it reliably: exact, self-contained, known patterns, no research"; `strong`: "Needs research on a library setup that may have changed, resolving config conflicts, or many judgment calls".
- `fast` → `haiku`; `strong` → `sonnet`. Below 0.5 → `haiku` for screen tasks (the fix-round rule escalates).

**Assumption triage** (every builder assumption): `state.rules` = the vocabulary and builder rules; `state.assumptions.<id>` = one assumption.
- Noul `<id>_violates`: "Does the assumption break `state.rules`?"
- Score `<id>_risk`: ["None", "Low: nobody notices", "Medium: visible inconsistency or a pattern others copy", "High: breaks the design system, a flow, or readability"].
- violates ≥ 0.5 or risk ≥ 2 → fix (tweak when it is a one-line change). Else accept with a row in `DECISIONS.md`.

**Acceptance** (hi-fi review): `state.states.<name>` = `{ code_facts, visual_description, design_description }`. One Noul per reviewer check: "Using only the evidence in `state.states.<name>`, is this acceptance item met?"

**Significance** (every orchestrator decision): Score ["Trivial: nobody notices", "Small: one screen, no pattern", "Pattern: sets how later screens behave", "Design system: changes a token, component, or rule"]. Score ≥ 2 → full decision record; else a row in `DECISIONS.md`.

**Plan readiness** (`orchestrate` intake, and `plan` before it writes the files; one request for all plans): `state.plans.<id>` = the plan text.
- Noul `<id>_ready`: "Can a builder divide `state.plans.<id>` into exact tasks with no questions? It names every screen with its states and exact copy, says what is in scope and out of scope, and has a check list a person can follow in a browser."
- One Noul per part, so the gap has a name (in testing, `ready` stayed near 0.7 while only one part was missing):
  - `<id>_states`: "Does every screen in `state.plans.<id>` list its states (default, empty, loading, error, success, as they apply)?"
  - `<id>_copy`: "Does `state.plans.<id>` give the exact text for headings, buttons, labels, and messages?"
  - `<id>_layout`: "Does `state.plans.<id>` say where each region of every screen goes?"
  - `<id>_data`: "Does `state.plans.<id>` say what data each screen shows, where it comes from, and what fake data to use?"
- `orchestrate`: ready < 0.5 → name the plan in the start confirmation with "loose: `/ux-orch:plan <file>` can tighten it", with the parts below 0.5. The run does not stop for it.
- `plan`: ready < 0.9 → ask the next interview question about the lowest part. See the `plan` skill for when to stop asking.

**Feedback triage** (`feedback`, one request per round): `state.plans` = plan titles and goals; `state.screens` = known screens and states; `state.items.<id>` = one feedback item's text and target.
- Choice `<id>_kind`: `bug` "Something does not work as the plan says"; `change` "Works as planned, but the person wants it different"; `idea` "Something new that no plan covers"; `question` "Asks for information, asks for no change"; `praise` "Says that something works well".
- Noul `<id>_why` (kind `change` only): "Does this item change the plan's goal or why, not only what the screen does or says?" ≥ 0.5 → a new plan, not a change.
- Score `<id>_severity`: ["Polish: nobody is stopped", "Minor: a user is slowed or confused", "Major: a user can finish only with help", "Blocker: a user cannot finish the flow"]. ≥ 2 → blocker; else polish.
- Choice `<id>_target` (only when the item names no screen): the options are `state.screens`.
- Noul `<a>_<b>_conflict` (one per pair of items on the same target): "Do items `<a>` and `<b>` ask for opposite changes?" ≥ 0.5 → the person decides in the confirmation. Never resolve a conflict automatically.

**Tweak significance** (`feedback --tweak`): the significance Score above. ≥ 2 → the tweak becomes a round item, and the report says why.
