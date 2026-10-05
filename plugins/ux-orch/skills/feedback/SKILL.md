---
name: feedback
description: Turn feedback on a prototype from any source (notes, a review, user tests, audit plans, or comments on elements in the running prototype) into fix and change tasks, build them with the run loop, close every item, and tag the round.
argument-hint: "[notes file | review folder | audit plan file | --comment | --tweak \"<text>\"]"
disable-model-invocation: true
---

# Feedback

You take feedback on a prototype from any source, turn it into tasks, build them with the shared run loop, and record what changed and why. **Every item closes:** `done`, `rejected` (with a reason), or `deferred`. Lost feedback is the failure this skill exists to prevent.

`<skill>` means this skill's base directory and `<plugin>` means the plugin root (`<skill>/../..`).

## Voice

The same as `orchestrate`: one confirmation at the start, live progress in the harness's task list while it runs (`<plugin>/shared/RUN.md` → Progress), one report at the end. No checkpoints during the round. Details go into files.

## Two speeds

| Speed | Entry | What happens |
| --- | --- | --- |
| **Round** | every entry except `--tweak` | Full triage, one confirmation, tasks, review, round report, git tag |
| **Tweak** | `--tweak "<text>"` | One small, direct change: no confirmation, no round. See "Tweak" below. |

## Sources

| Argument | Source | `source` field |
| --- | --- | --- |
| none | Text the person pastes or types in chat | `person` (or `stakeholder` / `user-test` when the text says so) |
| `<notes file>` | Meeting notes, test notes | `stakeholder` or `user-test`, from the file |
| `<review folder>` | `docs/ux/.scratch/<date>-review-<scope>/items/*.md` from `/ux-orch:review` | `reviewer` |
| `<audit plan file>` | An improvement plan written by a design-audit skill | `skill` (`from:` the skill name) |
| `--comment` | Comments on elements in the running prototype | `person` |

## Steps

### 0. Tools and context

Follow `<plugin>/shared/TOOLS.md` (tools, file names, builder rules, old evidence, scratch cleanup). When `docs/ux/CONTEXT.md` does not exist (the prototype was not built by `orchestrate`), follow `<plugin>/shared/CONTEXT-DISPATCH.md` in **create** mode, so builders have their vocabulary.

**Round number:** one more than the highest numeric Round in `docs/ux/HISTORY.md`. Everything the round writes except `HISTORY.md` rows, plan edits, `DECISIONS.md` rows, and design-system records (items, tasks, crops, screenshots, facts, judge files, `ROUND.md`) goes into the run folder `docs/ux/.scratch/<date>-feedback-r<N>/` (`<plugin>/shared/RECORDS.md`).

### 1. Collect

- **Comment mode** (`--comment`): start the dev server, then run
  ```bash
  node <plugin>/shared/scripts/comment.mjs <url> <run folder>/items --round <N> --crops <run folder>/crops
  ```
  Tell the person, in one line, to click **Comment**, click an element, type, and **Save**; and to close the window when done. Each comment becomes `FB-<NNN>.md` with the route and the element, and a cropped `FB-<NNN>.png` in the run folder. The overlay runs only in that browser window; it never touches prototype code.
- **Review folder:** read every item in `items/`.
- **Text, notes, audit plans:** read them in full.

### 2. Normalize

Split the input into items: one item per distinct request, problem, question, or praise. Copy each item's text exactly (quote it). Write one file per item, `<run folder>/items/FB-<NNN>.md`, from `<plugin>/shared/templates/FEEDBACK-ITEM.md`, with `status: open`. `NNN` continues from the highest ID in `docs/ux/HISTORY.md`. Items from a review keep their evidence description; set `from:` to the review folder. Read review items before the scratch cleanup can remove their folder. Add a row per item to `docs/ux/HISTORY.md`, status `open`, with the item's text quoted (`<plugin>/shared/RECORDS.md`).

Done when every piece of the input is in exactly one item.

### 3. Triage

Ask the feedback-triage judgment (`<plugin>/shared/JUDGE.md` → Question bank) for all items in one request: kind, "why" change, severity, target (only when the item names none), and conflicts between items on the same target. Known screens come from `docs/ux/states/`, the plans, and the routes. Record the numbers in each item's **Triage** section and set `status: triaged` (item file and `HISTORY.md` row).

**Reproduce every bug first.** Add a state that shows it to the plan's state file (`REVIEW.md` → States file; the plan whose screen the item targets), then run `observe.mjs` into the run folder and look at the screenshot. When it shows the bug, the state becomes the task's reviewer check. When it does not, do not guess a fix: list the item under "Needs you" in the confirmation ("FB-007 did not reproduce in state `login-errors`: close it as not reproduced, or tell me the steps"). With "go", it closes `rejected` with the reason "not reproduced: <state>".

Route each item:

| Kind | Route |
| --- | --- |
| **bug** | Fix task |
| **change** ("what") | Plan update + change task + a decision record or a log line, by significance |
| **change** ("why") | New plan: write a draft (`status: draft`, `supersedes:`) and close the item `deferred` to it; the person decides it with `/ux-orch:plan` |
| **idea** | Close `deferred`; the `HISTORY.md` row says "idea" and why it waits |
| **question** | Answer it from the plans, decisions, and code; close `done` with the answer. When only the person can answer, list it under "Needs you". |
| **praise** | Close `done`; one line in the round report (useful evidence for decisions) |

**Conflicts are never resolved automatically.** They are the only per-item question in the confirmation. A change that touches the design system goes into the prototype overrides with a `proposed` design-system decision record; the real design system is never changed.

### 4. Confirmation

Send ONE message, then wait:

```
Feedback round 2 — 9 items
- 5 fixes · 2 changes (plan 03 updated) · 1 new idea (deferred) · 1 praise (logged)
- Needs you: items FB-014 and FB-017 conflict ("bigger button" vs "too loud") — pick one
- Needs you: FB-019 did not reproduce in state `cart-empty` — close it, or tell me the steps
- Commits: one per task on ux/feedback-r2, tag ux-round-2 at the end — OK?
Reply "go", or change any line.
```

This is the only question of the round. After the answer, close bugs that did not reproduce as `rejected` (unless the person gave steps: then reproduce again), and close the conflict items the person did not pick as `rejected` (reason: "conflict: the person chose FB-<NNN>"). When commits are approved, create the branch.

### 5. Tasks

For each fix and change item, write a task from `<plugin>/shared/templates/TASK.md` into `<run folder>/tasks/<NN-plan-slug>/F<N>-<NN>-<slug>.md` (no plan → `<run folder>/tasks/feedback-r<N>/`), with `round: <N>` and `feedback: [FB-<NNN>]`. Items on the same screen may share one task. Give each task the target route, state, and element, the evidence (crop or screenshot), and the exact change. Route models with the routing judgment.

For each "what" change: update the plan file (the person approved it in the confirmation) and ask the significance judgment (`<plugin>/shared/JUDGE.md` → Question bank). Score ≥ 2 (it sets a pattern or changes the design system) → a full decision record (`RECORDS.md` → Full decision records; `round: <N>`, the item IDs in Context). Below 2 → one row in `docs/ux/DECISIONS.md` with the item ID and the plan edit. Set the items to `building` in `HISTORY.md`.

### 6. Run

Run the tasks with `<plugin>/shared/RUN.md`:

- Commit message: `fix(ux): <task title>` for bug tasks, `feat(ux): <task title>` for change tasks; body: task path, item IDs, decision IDs.
- Run folder: the one from step 0.

The review of each task must include the states of the items it closes (add a state for each item's target element when none exists).

### 7. Close and report

- Close every item: `done` (`closed-by`: task path and commit), `rejected` (with the reason), or `deferred` (where it went). A blocked task's items close as `deferred` with "blocked: <reason>". Update the item files and the `HISTORY.md` rows.
- Write `<run folder>/ROUND.md` from `<plugin>/shared/templates/ROUND-REPORT.md`.
- When commits are approved, commit the lasting records: `HISTORY.md` rows, `DECISIONS.md` rows, plan edits, and design-system decision records (`docs(ux): feedback round <N> records`). Then tag the branch head `ux-round-<N>`, so rounds can be compared, demoed, or reverted, and any state rebuilt.

Done when every item of the round is closed, `ROUND.md` is written, and the tag exists (when commits are approved).

Reply with one paragraph: items done, rejected, and deferred; the branch and tag; the path to `ROUND.md`; and how to compare: `git diff ux-round-<N-1> ux-round-<N>`.

## Tweak

`--tweak "<text>"` is for a small, direct change ("rename 'Use demo account' to 'Try the demo'").

1. Add one row to `docs/ux/HISTORY.md` (round `tweak`, status `open`, the text quoted; `NNN` continues from the highest ID). A tweak writes no item file. Its run folder is `docs/ux/.scratch/<date>-tweak-<slug>/`.
2. Ask the significance judgment (`<plugin>/shared/JUDGE.md` → Question bank). Score ≥ 2 (it sets a pattern or changes the design system) → it is not a tweak: say so in one line and continue as a round with this one item, from step 3.
3. Otherwise make the change yourself, re-run the states that show it (`observe.mjs`; a new state goes to the plan's state file, `REVIEW.md` → States file), look at the screenshots, and add one row to `docs/ux/DECISIONS.md` (round `tweak`). Screenshots go into the tweak's run folder. Commit (`fix(ux): <text>`) only when `docs/ux/PLANS.md` → Run settings has `commit: per-task`.
4. Close the `HISTORY.md` row `done`, with the commit or "not committed".

Reply in one line: what changed, the file, and the commit or "not committed".
