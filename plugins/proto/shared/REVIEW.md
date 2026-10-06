# Review

Every task is reviewed before it moves to `done/`. The `review` skill uses the same procedure on a running prototype, without a builder (steps 4–6 only). A builder's Result is a claim, not evidence: builders run only a smoke check, and in testing they reported "all pass" for a screen with no form on it. The review is where defects are found.

## Order

Run the cheapest check that can decide, then the next:

1. **Builder Result.** Read it. Every assumption goes to triage (`JUDGE.md` → assumption triage). A blocking question is a blocker. A `MISSING` or `ERROR` line in the smoke output is a blocker. Every reviewer check must read `not checked (reviewer)`; any other wording there ("pass", "Acceptance: pass") is a broken rule: log it in `<run folder>/RUN-LOG.md` under the task, and do not count it as evidence.
2. **Code read.** Read the changed files (`git diff` against the commit before the task), and compare them with the task's `files:` list. A file outside it needs an assumption that explains it; a change to auth, route guards, or stores outside the list is a blocker, even with an assumption, because builders must never change the app to make a check pass. Look for: components the task named but the code does not use, names outside the `CONTEXT.md` vocabulary (grep for palette shades, hex, `rgb(`, `dark:` color variants), icons from a set that is not installed or written as a bare `<i class="…">` instead of the library's icon component, slots or events or props that the component does not have (check them against `CONTEXT.md` → Component patterns).
3. **Checks.** Run the check commands from `CONTEXT.md` yourself.
4. **Browser** (screen tasks and routing tasks). Write the states file, run `observe.mjs`, read the summary lines.
5. **Look.** Open the screenshots of every state that this task changed (Read tool on the PNG). This step found defects that steps 1–4 and the judge all missed: a browser pop-up covering the app's error text, and a button that moved under the pointer and lost the click. A screen task is reviewed only when you have looked.
6. **Hi-fi only: compare.** Dispatch `witness` for the screenshots AND the design images, then run the acceptance judgment (`JUDGE.md`). Lo-fi skips this step.

## States file

One state file per plan: `docs/ux/states/<NN-plan-slug>.json`. Add a state to the file of the plan whose screen it shows. When no plan names the screen, use the plan that owns the route. Add states as tasks finish; keep earlier states so every review re-checks the whole plan. When two states in one file have the same name, keep the newer one and remove the older one.

```json
{
  "baseUrl": "http://localhost:5173",
  "states": [
    { "name": "login-default", "steps": [{ "goto": "/login" }] },
    { "name": "login-demo-filled", "steps": [{ "goto": "/login" }, { "click": { "role": "button", "name": "Use demo account" } }] },
    { "name": "login-phone", "viewport": { "width": 375, "height": 812 }, "steps": [{ "goto": "/login" }] },
    { "name": "login-dark", "colorScheme": "dark", "steps": [{ "goto": "/login" }] },
    { "name": "login-focus", "steps": [{ "goto": "/login" }, { "tab": 3 }] },
    { "name": "login-offline", "offline": true, "steps": [{ "goto": "/login" }, { "click": { "role": "button", "name": "Use demo account" } }] },
    { "name": "cart-drawer", "capture": "#cart-drawer", "steps": [{ "goto": "/" }, { "click": { "role": "button", "name": "Cart" } }] }
  ]
}
```

Step types and state options are listed at the top of `<plugin>/shared/scripts/observe.mjs`. Screenshots show the viewport; add `"fullPage": true` for a tall page, or `"capture": "<selector>"` to crop to one element (a drawer, a dialog). A `click`, `hover`, `clickText`, or `fill` that matches more than one element fails; add `"nth": 0` only when the first match is really meant. Rules for a complete states file:

- One state per row of the task's **States** table.
- One state per **interactive element**: click it, then capture. Interaction bugs only show when the interaction runs.
- Phone width (375 × 812) and dark mode for every screen.
- One **focus** state per screen: `{ "tab": N }` steps; the facts record the focused element after each state.
- One **offline** state per screen (`"offline": true`): the browser goes offline after the last `goto`, so the screen must keep working without the network. To go offline at another point, use an `{ "offline": true }` step.
- Reset storage at the start of states that depend on it (`{ "storage": { "key": "…", "value": null } }` after a first `goto`).

Run, with the prototype root as cwd:

```bash
node <plugin>/shared/scripts/observe.mjs docs/ux/states/<plan>.json <run folder>/evidence/<plan>-r<round> [state ...]
```

Output: `<state>.png` per state and one `FACTS.md` (re-running some states updates only their sections). Summary lines start with `ok` or `CHECK`. `CHECK … native validation blocked a submit` means the browser's own pop-up stopped the form instead of the app's error text (usually a missing `novalidate`): a blocker for any form whose task shows field errors. The run folder is in `docs/ux/.scratch/` and is never committed (`TOOLS.md` → Scratch). For a quick regression re-run whose output nobody needs, write to a temporary folder and delete it after reading the summary.

## Step errors

A step error is first a question about the states file, then about the app. Look at the screenshot before you decide:

- **"matches N elements"**: the step is ambiguous, not the app broken. Fix the step with a more exact name or `"nth"`, re-run that state, and log it as a states-file fix. States files written before 0.2.0 often hit this, because clicks used the first match then.
- **"matches no element"**: compare the step with the screenshot. A renamed or moved element that the plan still calls for is an app blocker; a step that names text the plan changed is a states-file fix.
- **Timeouts and navigation errors**: an app blocker, unless the dev server stopped.

## Verdict

- **Pass:** every builder check and reviewer check holds, and the screenshots show nothing broken.
- **Blocker:** broken flow, missing state, failed check, a step error that is the app's (see Step errors), a console error, native validation blocking a form, or (hi-fi) a design mismatch. → fix (`RUN.md` → When a builder returns). The `review` skill builds nothing: it writes a feedback item instead.
- **Polish:** anything else. → one line in `<run folder>/RUN-LOG.md` under "Polish", then pass.

Write the verdict, and every blocker with its cause, to `<run folder>/RUN-LOG.md`.
