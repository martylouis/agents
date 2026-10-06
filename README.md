# agents

Agent plugins by Marty Thierry.

## Plugins

| Plugin | What it does |
| --- | --- |
| [`proto`](plugins/proto/README.md) | Plan, build, review, and iterate UX prototypes with builder sub-agents, browser review, and decision records. |

## Claude Code

This repo is a Claude Code marketplace named `martylouis`.

```bash
claude plugin marketplace add martylouis/agents
claude plugin install proto@martylouis
```

## Cursor

Coming soon.

## Add a plugin

1. Create `plugins/<name>/` with its own `.claude-plugin/plugin.json`.
2. Add an entry to `.claude-plugin/marketplace.json` with `"source": "./plugins/<name>"`.
3. Keep each plugin self-contained. Do not reference files outside its folder.

## Versioning

Each plugin has its own [semver](https://semver.org) version. It lives in one place only: the plugin's `.claude-plugin/plugin.json`. Do not repeat it in `marketplace.json`.

- **Patch** (`0.2.1` → `0.2.2`): fixes and wording changes.
- **Minor** (`0.2.1` → `0.3.0`): new skills, agents, or options that keep old behavior.
- **Major** (`0.x` → `1.0.0`): changes that break how people use the plugin.

Installed copies are cached by version, so raise the version in any commit that changes a plugin, and add its lines to the plugin's `CHANGELOG.md` under that version. Commits that touch only the README or other repo files need no bump.

## License

[MIT](LICENSE)
