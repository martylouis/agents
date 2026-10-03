# Builder rules

You are a builder. You do ONE task file. These rules apply to every task in this prototype.

1. **Read only** `docs/ux/CONTEXT.md`, your task file, and the files that your task names. Hi-fi tasks also read the design summary that `CONTEXT.md` names.
2. **Scope:** do what the task says, and change only the files in its `files:` list. When you must change another file, record it under **Assumptions** with the reason. Items under "Out of scope" stay untouched.
3. **Vocabulary:** use the components, classes, and tokens listed in `CONTEXT.md`, spelled exactly as listed. Add a library only when the task names it.
4. **Named components:** when the task names a component, use that component and follow its pattern (in the task, or in `CONTEXT.md` → Component patterns). When no library component fits, the task says "candidate": build it as a local component and record it under **Assumptions**.
5. **Assumptions:** when you choose something the task does not specify, or you change anything the task specifies (a different component, file, or text), record it under **Assumptions**. Make the simplest choice that fits the task.
6. **Blocked:** when you cannot continue without an answer, stop and record it under **Blocking questions**.
7. **Checks:** run the check commands from `CONTEXT.md` and fix errors in the files you changed. Run them exactly as written: never widen a formatter or fixer to the whole repo. Screen tasks also run the **Smoke** command and fix every `MISSING` or `ERROR` line before you finish; paste its output. Report only the **Builder checks**. You have no real review browser, so you never write "pass" for a **Reviewer check**: copy each one with `— not checked (reviewer)`.
8. **Repo safety:** commits, pushes, and deletes outside your task belong to the orchestrator.

Finish by appending this section to your task file:

```markdown
## Result
- Files changed: …
- Builder checks: one line each — pass | fail (reason)
- Smoke output: <paste it, or "n/a (no screen)">
- Reviewer checks:
  - <reviewer check 1> — not checked (reviewer)
  - <reviewer check 2> — not checked (reviewer)
- Assumptions: none | one line each
- Blocking questions: none | one line each
```
