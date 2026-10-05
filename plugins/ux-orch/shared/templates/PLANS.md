# Plans

The plan files are the input. This index adds what the orchestrator needs; it never edits the plan files.

## Run settings (confirmed <YYYY-MM-DD>)

```yaml
fidelity: <lo-fi | hi-fi>
designs: <folder or none>
commit: <per-task | none>
judge: <typesafe | self>
scratch: <keep-last-3 | keep-all>   # screenshots and reports in docs/ux/.scratch/; never committed
```

## Why

<one or two sentences; from the plans, or inferred and confirmed at the start>

## Plans

| # | Plan | Status | Depends on | Tasks |
| --- | --- | --- | --- | --- |
| 01 | [<title>](<path>) | <waiting | tasks ready | building | done | blocked> | — | `tasks/<NN-slug>/` |

## Done rules

| Dimension | lo-fi | hi-fi |
| --- | --- | --- |
| Flow | No dead ends | No dead ends |
| States | All states in the task, built | All states, styled as designed |
| Design match | Not checked; framework used consistently | Matches the design image |
| Content | Realistic | Exact copy |
| Interaction | Main interactions; Enter submits | All interactions |
| Responsive | Phone width does not break | All sizes in the designs |
| Accessibility | Keyboard, labels | Keyboard, labels, contrast |
| Vocabulary | Only `CONTEXT.md` names | Only `CONTEXT.md` names |

Blocker: broken flow, missing state, failed builder check, failed reviewer check, design mismatch (hi-fi). Everything else is polish: log it, keep going.
