---
name: review
description: Review a running prototype in a real browser and report what is broken, without building anything. Discovers states when none exist. Writes a review report and one feedback item per finding for /proto:feedback.
argument-hint: "[plan | route | designs folder] [--audit]"
disable-model-invocation: true
---

# Review

You review a running prototype in a real browser and report what is broken. You change no prototype code: every finding becomes a feedback item, and `/proto:feedback` decides the fixes. Use it before a demo or a user test, after the prototype was changed by hand or by another tool, on a prototype that `/proto:build` did not make, and (hi-fi) to check that the prototype still matches the designs.

`<skill>` means this skill's base directory and `<plugin>` means the plugin root (`<skill>/../..`).

## Arguments

| Argument | Scope | States |
| --- | --- | --- |
| none | `all` | Every states file in `docs/ux/states/` |
| `<plan>` (e.g. `02-products-and-cart`) | that plan | `docs/ux/states/<plan>.json`, plus the plan's **Check list** as states |
| `<route>` (e.g. `/checkout`) | that route | The states whose steps open the route |
| `<designs folder>` | hi-fi | All states, compared with the design images |
| `--audit` | adds a design-quality pass | See step 6 |

## What the test proved

- **Look at the screenshots.** Two real defects were visible only there: a browser pop-up covering the app's error text, and a button that moved under the pointer and lost the click. Code facts, builder reports, and the judge all missed them.
- **One state per interactive element.** The lost click appeared only when the script clicked the button.
- **The judge needs text descriptions.** With code facts only, it was uncertain on every item; with witness output, passes scored 0.75–0.95 and failures 0.01–0.02. Lo-fi skips the witness; hi-fi needs it.

## Steps

### 1. Tools and server

Follow `<plugin>/shared/TOOLS.md` (scripts, judge for hi-fi, file names, scratch cleanup, and Dev server). Record the prototype's commit (`git rev-parse --short HEAD`) and the working tree (`git status --porcelain`): `clean`, or `dirty` with the changed files. A finding in a file with uncommitted changes may come from an unfinished edit, not from the committed code; the report says so.

Create one task-list item per step below (states, observe, look, verdict), so progress shows in place.

### 2. States

- **States exist** (`docs/ux/states/*.json`): use the ones in scope. For a plan, also add one state per **Check list** item of the plan that no state covers yet, in the plan's states file.
- **No states:** discover them. Read the routes from the router config (or the pages folder; for a static site, the HTML files). Then run:
  ```bash
  node <plugin>/shared/scripts/discover.mjs <url> <run folder>/discovered.json [--crawl] <route> [route ...]
  ```
  It writes one default, phone (375 × 812), and dark state per route, and one click state per visible interactive element. Use `--crawl` when the router config lists dynamic routes (`/products/:id`), so real links are followed. After the review, merge each discovered state into the state file of the plan that owns its route (`REVIEW.md` → States file). A state that no plan owns stays in the run folder. Done when every discovered state is in a plan's state file or in the run folder. The next review reuses the plan state files; run discovery again only when routes changed. Text fields get no state: form submissions need data that only the plan knows.

### 3. Observe

Create the run folder `docs/ux/.scratch/<YYYY-MM-DD>-review-<scope>/` (scope: `all`, the plan, or the route as a slug). It is never committed. Run, with the prototype root as cwd:

```bash
node <plugin>/shared/scripts/observe.mjs <states file> <run folder>/evidence [state ...]
```

Read the summary lines (`ok` or `CHECK`) and `evidence/FACTS.md`.

### 4. Look

Open the screenshot of EVERY state (Read tool on the PNG). Compare it with the code facts and with what the plan or the states file expects. A state is reviewed only when you have looked at it. Also check, when `docs/ux/CONTEXT.md` exists, the changed files since the last review for names outside its vocabulary (`<plugin>/shared/REVIEW.md` → step 2).

### 5. Hi-fi: compare

Only with a designs folder (argument, or `CONTEXT.md` → Fidelity hi-fi). Dispatch `witness` (State template) for the screenshots AND for the matching design images, then run the acceptance judgment (`<plugin>/shared/JUDGE.md` → Question bank) with one Noul per state. Lo-fi skips this step.

### 6. Audit (only with `--audit`)

When a design-quality skill is installed (for example Impeccable's `audit` or `critique`, or UI Skills' `improve-ui`), run it on the screenshots or the routes in scope, in read-only mode. Each finding it reports becomes a feedback item with `source: skill` and `from: <skill name>`. When none is installed, say so in the report and skip it.

### 7. Verdict and items

Use the verdicts in `<plugin>/shared/REVIEW.md`: **ok**, **blocker** (broken flow, missing state, step error, console error, design mismatch), or **polish**. For each blocker, find the cause in the code (file and line) when you can, without changing it.

Write one feedback item per finding to `<run folder>/items/<NN>-<slug>.md` from `<plugin>/shared/templates/FEEDBACK-ITEM.md`, with `id: <NN>` (the review-local number; `feedback` gives the project ID), `source: reviewer`, `from: review <run folder name>`, `round: —`, `kind: bug` (or `change` for a design mismatch that works), the severity, the target state and element, `status: open`, and what the evidence shows, in words, with its path.

Write `<run folder>/REVIEW.md` from `<plugin>/shared/templates/REVIEW-REPORT.md`.

### 8. End

Stop the dev server if this skill started it.

Done when every state in scope has a verdict, every finding has a feedback item, and `REVIEW.md` is written.

## Reply

One line per state with a finding (`[!]` blocker, `[~]` polish); states that pass are only counted:

```
Review — 31 states · 2 blockers · 4 polish
[!] cart-drawer-empty — "Checkout" button enabled with an empty cart
[!] checkout-phone — summary card overflows at 375 px
[~] login-dark — focus ring hard to see
Tree: clean at a1b2c3d
Report: docs/ux/.scratch/2026-10-03-review-all/REVIEW.md
Next: /proto:feedback docs/ux/.scratch/2026-10-03-review-all   (turns findings into fixes)
```
