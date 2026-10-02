# Review

Every task is reviewed before it moves to `done/`. A builder's Result is a claim, not evidence: builders have no browser, and in testing they reported "all pass" for a screen with no form on it. The review is where defects are found.

## Order

Run the cheapest check that can decide, then the next:

1. **Builder Result.** Read it. Every assumption goes to triage (`JUDGE.md` → assumption triage). A blocking question is a blocker.
2. **Code read.** Read the changed files. Look for: components the task named but the code does not use, names outside the `CONTEXT.md` vocabulary (grep for palette shades, hex, `rgb(`, `dark:` color variants), icons from a set that is not installed, events or props that the component does not have.
3. **Checks.** Run the check commands from `CONTEXT.md` yourself.
4. **Browser** (screen tasks and routing tasks). Write the states file, run `observe.mjs`, read the summary lines.
5. **Look.** Open the screenshots of every state that this task changed (Read tool on the PNG). This step found defects that steps 1–4 and the judge all missed: a browser pop-up covering the app's error text, and a button that moved under the pointer and lost the click. A screen task is reviewed only when you have looked.
6. **Hi-fi only: compare.** Dispatch `ux-describer` for the screenshots AND the design images, then run the acceptance judgment (`JUDGE.md`). Lo-fi skips this step.

## States file

One file per plan: `docs/ux/states/<NN-plan-slug>.json`. Add states as tasks finish; keep earlier states so every review re-checks the whole plan.

```json
{
  "baseUrl": "http://localhost:5173",
  "states": [
    { "name": "login-default", "steps": [{ "goto": "/login" }] },
    { "name": "login-demo-filled", "steps": [{ "goto": "/login" }, { "click": { "role": "button", "name": "Use demo account" } }] },
    { "name": "login-phone", "viewport": { "width": 375, "height": 812 }, "steps": [{ "goto": "/login" }] },
    { "name": "login-dark", "colorScheme": "dark", "steps": [{ "goto": "/login" }] }
  ]
}
```

Step types are listed at the top of `scripts/observe.mjs`. Rules for a complete states file:

- One state per row of the task's **States** table.
- One state per **interactive element**: click it, then capture. Interaction bugs only show when the interaction runs.
- Phone width (375 × 812) and dark mode for every screen.
- Reset storage at the start of states that depend on it (`{ "storage": { "key": "…", "value": null } }` after a first `goto`).

Run, with the prototype root as cwd:

```bash
node <skill>/scripts/observe.mjs docs/ux/states/<plan>.json docs/ux/evidence/<plan>-r<round> [state ...]
```

Output: `<state>.png` and `<state>.md` per state, `FACTS.md` merged. Summary lines start with `ok` or `CHECK`.

## Verdict

- **Pass:** every builder check and reviewer check holds, and the screenshots show nothing broken.
- **Blocker:** broken flow, missing state, failed check, a step error, a console error, or (hi-fi) a design mismatch. → fix (see `SKILL.md` step 4).
- **Polish:** anything else. → one line in `RUN-LOG.md` under "Polish", then pass.

Write the verdict, and every blocker with its cause, to `RUN-LOG.md`.
