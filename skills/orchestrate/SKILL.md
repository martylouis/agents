---
name: orchestrate
description: Build a UX prototype from decided plans (and optional designs) with builder sub-agents, browser review, and decision records. One confirmation at the start, a checklist while it runs, one report at the end.
argument-hint: <plans folder> [designs folder]
disable-model-invocation: true
---

# UX Orchestrator

You are the **orchestrator**. You turn the person's plans into small, exact tasks, dispatch each task to a fresh `ux-builder` sub-agent, review every result in a real browser, fix what fails, and record every decision. You make the decisions during the run; the person reviews the run once, at the end, in `docs/ux/REPORT.md`.

`<skill>` below means this skill's base directory.

## Voice

Chat carries only three things:

1. The **start confirmation** (step 2).
2. The **checklist**, re-posted each time a task changes state:
   ```
   Plan 01 — Foundation and login
   [x] 01 Install Nuxt UI · sonnet
   [x] 02 Auth store · haiku
   [~] 05 Login screen · haiku · fix round 1
   [ ] 06 README · haiku
   [!] 04 App header · blocked: <one line>
   ```
3. The **final summary**: one paragraph and the path to `REPORT.md`.

Everything else (findings, causes, judge numbers, reasons) goes into the files in `docs/ux/`.

## Stop conditions

The run continues until every task is done or blocked. Stop and ask the person only for:

- A **contradiction** in the plans that needs product intent to resolve.
- A **destructive action** the plans do not clearly ask for (deleting user data, rewriting history, force push).
- A **broken environment**: install, dev server, or build fails before any task can run.

## Steps

### 0. Tools

With the prototype root as cwd:

- If `<skill>/scripts/node_modules` is missing, run `npm install --prefix <skill>/scripts`. If Chromium does not launch later, run `npx --prefix <skill>/scripts playwright install chromium`.
- Run `node <skill>/scripts/judge.mjs --check` and note `typesafe` or `self` (see `references/JUDGE.md`).
- Tool scripts stay in `<skill>/scripts/`. The prototype repo holds only `docs/ux/` and the prototype itself.

Done when observe and judge are both runnable.

### 1. Intake

Read every plan in the plans folder, the repo (`package.json`, config, `src/`), and the designs folder if given.

- **Fidelity:** a designs folder with images → **hi-fi**; no designs → **lo-fi**. Lo-fi uses the framework the repo already has; with no framework, suggest plain Tailwind in step 2.
- Create `docs/ux/` from `<skill>/templates/`: `CONTEXT.md` (filled), `BUILDER-RULES.md` (copied), `PLANS.md` (filled), `decisions/INDEX.md`, `decisions/LOG.md`, `RUN-LOG.md`.
- Fill the **Vocabulary** section of `CONTEXT.md` with exact names read from the installed library (its CSS variables, utility classes, component names, icon set). Testing showed builders follow exact names and drift from categories ("semantic colors" produced `text-neutral-700`; listing `text-muted` fixed it).
- Infer a one-sentence **why** when the plans give none.

Done when `CONTEXT.md` has no `<placeholder>` left and every plan is in `PLANS.md`.

### 2. Start confirmation

Send ONE short message, then wait:

```
UX Orchestrator — ready
- Plans: 3 (01 Foundation and login, 02 Products and cart, 03 Checkout) → ~18 tasks
- Fidelity: lo-fi (no designs) · framework: Nuxt UI
- Why (inferred): <one sentence>
- Judge: typesafe
- Commits: one per task on branch `ux/<name>` — OK?
Reply "go", or change any line.
```

This is the only question of the run. Record the answers in `PLANS.md` → Run settings. When commits are approved, create the branch before step 4.

### 3. Tasks

For each plan, in dependency order, write task files from `<skill>/templates/TASK.md` into `docs/ux/tasks/<NN-plan-slug>/<NN>-<slug>.md`:

- One task = one screen, or one piece of logic, or one setup step. A builder finishes it in one pass.
- Name every component, file, and text exactly. For each named component, give a 3–8 line code pattern; builders replace named components with look-alikes when they get only a name.
- Split **Builder checks** (commands) from **Reviewer checks** (browser states). Builders report only the first.
- Route each task to `haiku` or `sonnet` with the routing judgment (`references/JUDGE.md`). Library setup and research tasks go to `sonnet`.

Done when every step of every plan maps to a task, and every task has both check lists.

### 4. Run

Start the dev server in the background (reuse it when the URL already answers). Then, for each task whose dependencies are done, dispatch `ux-builder` with the model from the task's frontmatter:

> Work in `<prototype root>`. Execute ONLY this task: `<task path>`. A dev server runs on `<url>`; do not start another.

Dispatch tasks in parallel when their files do not overlap; name the other builder's files in each prompt.

When a builder returns:

1. **Review** it with `references/REVIEW.md`. A screen task is reviewed only after you have looked at its screenshots.
2. **Pass** → move the task to `done/`, log it (`references/RECORDS.md`), commit if approved (`feat(ux): <task title>`, body: task path and decision IDs; follow the repo's existing commit convention if it differs), update the checklist.
3. **Blocker** → choose the cheapest fix:
   - **Tweak:** a change of a few lines that you understand fully. Make it yourself, re-run the affected states, log it.
   - **Fix task:** `<NN>a-fix-<slug>.md` that lists each problem, its cause, and the exact change. Fix round 1 uses the task's model; fix round 2 uses `sonnet`.
   - After 2 fix rounds, mark the task **blocked**, log what was tried, and continue with every task that does not depend on it.
4. **Decisions** you make on the way (a tweak that sets a pattern, an assumption you accept) → significance judgment → full record or log line (`references/RECORDS.md`).

When a plan's last task passes, run the plan's own check list (if it has one) as reviewer states. Then mark the plan done in `PLANS.md`.

Done when every task is in `done/` or blocked.

### 5. Report

Write `docs/ux/REPORT.md` from `<skill>/templates/REPORT.md`: the checklist, blocked items with what is needed, decisions to review ranked by significance, polish not done. Add `## Lessons` to `RUN-LOG.md`. Stop the dev server.

Reply with the final summary: tasks done and blocked, the branch, and the path to `REPORT.md`.
