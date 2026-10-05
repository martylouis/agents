# agents

Claude Code plugins by Marty Thierry. This repo is a plugin marketplace named `martylouis`.

## Plugins

| Plugin | What it does |
| --- | --- |
| [`ux-orch`](plugins/ux-orch/README.md) | Plan, build, review, and iterate UX prototypes with builder sub-agents, browser review, and decision records. |

## Install

```bash
claude plugin marketplace add martylouis/agents
claude plugin install ux-orch@martylouis
```

## Add a plugin

1. Create `plugins/<name>/` with its own `.claude-plugin/plugin.json`.
2. Add an entry to `.claude-plugin/marketplace.json` with `"source": "./plugins/<name>"`.
3. Keep each plugin self-contained. Do not reference files outside its folder.
