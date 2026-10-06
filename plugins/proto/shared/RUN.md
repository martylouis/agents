# Run loop

The loop that builds task files with `builder` sub-agents and reviews each result. `build` (step 4) and `feedback` both use it. The calling skill gives three inputs:

- **Tasks:** the task files to run (in `<run folder>/tasks/`), with `depends-on` and `model` in their frontmatter.
- **Commit message:** the calling skill's format (for example `feat(ux): <task title>`).
- **Run folder:** the scratch folder for this run (`TOOLS.md` → Scratch).

## Start

Start or reuse the dev server (`TOOLS.md` → Dev server). Create one item per task in the harness's task list (in Claude Code, the task tools: the live checklist with a spinner), named `<NN> <task title>`.

## Dispatch

For each task whose dependencies are done, set its task-list item to in progress (`Building <NN> <title>`) and dispatch `proto:builder` with the model from the task's frontmatter:

> Work in `<prototype root>`. Execute ONLY this task: `<task path>`. A dev server runs on `<url>`; do not start another.

Dispatch tasks in parallel only when their `files:` lists share no file. Tasks that share a file run one after the other. Name the other builders' files in each prompt.

## When a builder returns

1. **Review** it with `REVIEW.md` (task-list item: `Reviewing <NN> <title>`). A screen task is reviewed only after you have looked at its screenshots.
2. **Pass** → move the task to `done/` next to it, log it (`RECORDS.md`), commit if approved (the calling skill's message; body: task path and decision IDs; follow the repo's existing commit convention if it differs), mark the task-list item completed.
3. **Blocker** → choose the cheapest fix:
   - **Tweak:** a change of a few lines that you understand fully. Make it yourself, re-run the affected states, log it.
   - **Fix task:** `<NN>a-fix-<slug>.md` next to the task, listing each problem, its cause, and the exact change. Fix round 1 uses the task's model; fix round 2 uses `sonnet`.
   - Update the task-list item (`Fixing <NN> <title> · fix round <n>`).
   - After 2 fix rounds, mark the task **blocked**, log what was tried, and continue with every task that does not depend on it. Its task-list item stays open with `blocked: <reason>`, and chat gets one line: `[!] <NN> <title> — blocked: <reason>`.
4. **Decisions** you make on the way (a tweak that sets a pattern, an assumption you accept) → significance judgment (`JUDGE.md`) → full record or log line (`RECORDS.md`).

## Progress

Progress shows in the harness's task list, which updates in place. Do not print a markdown checklist in chat while the loop runs. Chat carries only one line per blocked task. The full checklist is written once, in the calling skill's report.

## Stop conditions

The loop continues until every task is done or blocked. Stop and ask the person only for:

- A **contradiction** that needs product intent to resolve.
- A **destructive action** the plans or the confirmation do not clearly ask for (deleting user data, rewriting history, force push).
- A **broken environment**: install, dev server, or build fails before any task can run.

## End

Stop the dev server if the loop started it.

Done when every task is in `done/` or blocked.
