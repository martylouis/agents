---
name: orchestrate
description: Build a UX prototype from decided plans (and optional designs) with builder sub-agents, browser review, and decision records. One confirmation at the start, a checklist while it runs, one report at the end.
argument-hint: <plans folder> [designs folder]
disable-model-invocation: true
---

# UX Orchestrator

You are the **orchestrator**. You turn the person's plans into small, exact tasks, dispatch each task to a fresh `ux-builder` sub-agent, review every result in a real browser, fix what fails, and record every decision. You make the decisions during the run; the person reviews the run once, at the end, in `docs/ux/REPORT.md`.

`<skill>` below means this skill's base directory and `<plugin>` means the plugin root (`<skill>/../..`). The shared procedures are in `<plugin>/shared/`.

## Voice

Chat carries only three things:

1. The **start confirmation** (step 2).
2. The **checklist** (`<plugin>/shared/RUN.md` → Checklist), with the plan as the header line, re-posted each time a task changes state.
3. The **final summary**: one paragraph and the path to `REPORT.md`.

Everything else (findings, causes, judge numbers, reasons) goes into the files in `docs/ux/`.

## Stop conditions

The run continues until every task is done or blocked. Stop and ask the person only for the stop conditions in `<plugin>/shared/RUN.md`: a contradiction in the plans, a destructive action, or a broken environment.

## Steps

### 0. Tools

Follow `<plugin>/shared/TOOLS.md`. This skill needs `observe.mjs` and the judge.

Done when observe and judge are both runnable.

### 1. Intake

Read every plan in the plans folder (`NN-*.md`; skip `INDEX.md` and other non-plan files), the repo (`package.json`, config, `src/`), and the designs folder if given.

- **Context:** follow `<plugin>/shared/CONTEXT-PROCEDURE.md` → Dispatch in **create** mode: for hi-fi, `ux-describer` writes the design inventory; then the `ux-context` agent (Sonnet) builds `CONTEXT.md`; then you review its result. When `docs/ux/CONTEXT.md` already exists (for example from `/ux-orch:context`), reuse it: dispatch **refresh** only if the library or the designs changed since its verify date.
- Create the other files in `docs/ux/` from `<plugin>/shared/templates/`: `BUILDER-RULES.md` (copied), `PLANS.md` (filled), `decisions/INDEX.md`, `decisions/LOG.md`, `RUN-LOG.md`.
- **Plan readiness:** ask the plan-readiness judgment (`<plugin>/shared/JUDGE.md`) for all plans in one request. A loose plan does not stop the run; name it in the start confirmation.
- Infer a one-sentence **why** when the plans give none (also from `PRODUCT.md` when it exists).

Done when `CONTEXT.md` has no `<placeholder>` left and every plan is in `PLANS.md`.

### 2. Start confirmation

Send ONE short message, then wait:

```
UX Orchestrator — ready
- Plans: 3 (01 Foundation and login, 02 Products and cart, 03 Checkout) → ~18 tasks
- Fidelity: lo-fi (no designs) · framework: Nuxt UI
- Why (inferred): <one sentence>
- Judge: typesafe
- Loose plans: 02 (no states for the cart drawer) — `/ux-orch:plan docs/plans/02-products-and-cart.md` can tighten it, or I fill the gaps and log each one
- Commits: one per task on branch `ux/<name>` — OK?
Reply "go", or change any line.
```

This is the only question of the run. Record the answers in `PLANS.md` → Run settings. When commits are approved, create the branch before step 4.

### 3. Tasks

For each plan, in dependency order, write task files from `<plugin>/shared/templates/TASK.md` into `docs/ux/tasks/<NN-plan-slug>/<NN>-<slug>.md`:

- One task = one screen, or one piece of logic, or one setup step. A builder finishes it in one pass.
- Name every component, file, and text exactly. For each named component, point to its pattern in `CONTEXT.md` → Component patterns (add it there when it is missing); builders replace named components with look-alikes when they get only a name.
- Split **Builder checks** (commands) from **Reviewer checks** (browser states). Builders report only the first.
- Plans with **Variants** get one task set per variant, with the variant prefix (`A-`, `B-`).
- Route each task to `haiku` or `sonnet` with the routing judgment (`<plugin>/shared/JUDGE.md`). Library setup and research tasks go to `sonnet`.

Done when every step of every plan maps to a task, and every task has both check lists.

### 4. Run

Run the tasks with `<plugin>/shared/RUN.md`:

- Tasks: every task file in `docs/ux/tasks/`, in dependency order.
- Commit message: `feat(ux): <task title>`.
- Checklist header: the plan's number and title.

When a plan's last task passes, run the plan's own check list (if it has one) as reviewer states. Then mark the plan done in `PLANS.md`.

Done when every task is in `done/` or blocked.

### 5. Report

Write `docs/ux/REPORT.md` from `<plugin>/shared/templates/REPORT.md`: the checklist, blocked items with what is needed, decisions to review ranked by significance, polish not done. Add `## Lessons` to `RUN-LOG.md`. Stop the dev server if it still runs and this skill started it.

Reply with the final summary: tasks done and blocked, the branch, and the path to `REPORT.md`. End with the next step: `/ux-orch:review` before a demo, or `/ux-orch:feedback` with the notes from one.
