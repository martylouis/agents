# Run loop

The loop that builds task files with `ux-builder` sub-agents and reviews each result. `orchestrate` (step 4) and `feedback` both use it. The calling skill gives three inputs:

- **Tasks:** the task files to run, with `depends-on` and `model` in their frontmatter.
- **Commit message:** the calling skill's format (for example `feat(ux): <task title>`).
- **Checklist header:** the line above the checklist in chat.

## Start

Start or reuse the dev server (`TOOLS.md` → Dev server).

## Dispatch

For each task whose dependencies are done, dispatch `ux-builder` with the model from the task's frontmatter:

> Work in `<prototype root>`. Execute ONLY this task: `<task path>`. A dev server runs on `<url>`; do not start another.

Dispatch tasks in parallel when their files do not overlap; name the other builder's files in each prompt.

## When a builder returns

1. **Review** it with `REVIEW.md`. A screen task is reviewed only after you have looked at its screenshots.
2. **Pass** → move the task to `done/` next to it, log it (`RECORDS.md`), commit if approved (the calling skill's message; body: task path and decision IDs; follow the repo's existing commit convention if it differs), update the checklist.
3. **Blocker** → choose the cheapest fix:
   - **Tweak:** a change of a few lines that you understand fully. Make it yourself, re-run the affected states, log it.
   - **Fix task:** `<NN>a-fix-<slug>.md` next to the task, listing each problem, its cause, and the exact change. Fix round 1 uses the task's model; fix round 2 uses `sonnet`.
   - After 2 fix rounds, mark the task **blocked**, log what was tried, and continue with every task that does not depend on it.
4. **Decisions** you make on the way (a tweak that sets a pattern, an assumption you accept) → significance judgment (`JUDGE.md`) → full record or log line (`RECORDS.md`).

## Checklist

Re-post it in chat each time a task changes state:

```
<checklist header>
[x] 01 Install Nuxt UI · sonnet
[x] 02 Auth store · haiku
[~] 05 Login screen · haiku · fix round 1
[ ] 06 README · haiku
[!] 04 App header · blocked: <one line>
```

## Stop conditions

The loop continues until every task is done or blocked. Stop and ask the person only for:

- A **contradiction** that needs product intent to resolve.
- A **destructive action** the plans or the confirmation do not clearly ask for (deleting user data, rewriting history, force push).
- A **broken environment**: install, dev server, or build fails before any task can run.

## End

Stop the dev server if the loop started it.

Done when every task is in `done/` or blocked.
