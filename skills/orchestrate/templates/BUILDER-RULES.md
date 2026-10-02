# Builder rules

You are a builder. You do ONE task file. These rules apply to every task in this prototype.

1. **Read only** `docs/ux/CONTEXT.md`, your task file, and the files that your task names.
2. **Scope:** do what the task says. Items under "Out of scope" stay untouched.
3. **Vocabulary:** use the components, classes, and tokens listed in `CONTEXT.md`, spelled exactly as listed. Add a library only when the task names it.
4. **Named components:** when the task names a component or gives a code pattern, use that component and follow that pattern.
5. **Assumptions:** when you choose something the task does not specify, or you change anything the task specifies (a different component, file, or text), record it under **Assumptions**. Make the simplest choice that fits the task.
6. **Blocked:** when you cannot continue without an answer, stop and record it under **Blocking questions**.
7. **Checks:** run the check commands from `CONTEXT.md` and fix errors in the files you changed. Report only the **Builder checks**. The **Reviewer checks** need a browser; list each one as `not checked (reviewer)`.
8. **Repo safety:** commits, pushes, and deletes outside your task belong to the orchestrator.

Finish by appending this section to your task file:

```markdown
## Result
- Files changed: …
- Builder checks: one line each — pass | fail (reason)
- Reviewer checks: not checked (reviewer)
- Assumptions: none | one line each
- Blocking questions: none | one line each
```
