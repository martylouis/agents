# Judge

The judge turns a text question into a typed answer with a confidence: Noul (yes/no probability), Choice (one option), or Score (position on ordered levels). It is fast and cheap, and it is text only.

## Which judge

Run `node <skill>/scripts/judge.mjs --check` with the prototype root as cwd.

- `judge: typesafe` → TypeSafe System One (`jev-latest`). Write the request JSON to `docs/ux/judgments/<NN>-<name>.request.json` and run `node <skill>/scripts/judge.mjs <request> <response>`.
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
- violates ≥ 0.5 or risk ≥ 2 → fix (tweak when it is a one-line change). Else accept with a line in `decisions/LOG.md`.

**Acceptance** (hi-fi review): `state.states.<name>` = `{ code_facts, visual_description, design_description }`. One Noul per reviewer check: "Using only the evidence in `state.states.<name>`, is this acceptance item met?"

**Significance** (every orchestrator decision): Score ["Trivial: nobody notices", "Small: one screen, no pattern", "Pattern: sets how later screens behave", "Design system: changes a token, component, or rule"]. Score ≥ 2 → full decision record; else a line in `decisions/LOG.md`.
