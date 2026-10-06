# agents

Agent plugins by Marty Thierry.

## Plugins

| Plugin | What it does | Claude Code | Cursor | Codex |
| --- | --- | --- | --- | --- |
| [`proto`](plugins/proto/README.md) | Plan, build, review, and iterate UX prototypes with builder sub-agents, browser review, and decision records. | Yes | Yes, from a local clone | Not tested yet |

Each plugin's README covers how to use it. This page covers how to install it in each harness.

## Install

### Claude Code

This repo is a Claude Code marketplace named `martylouis`. Add it once:

```bash
claude plugin marketplace add martylouis/agents
```

Then install the plugins you want:

```bash
claude plugin install proto@martylouis
```

Skills run as `/<plugin>:<skill>`, for example `/proto:build`.

- **Update:** `claude plugin marketplace update martylouis`, then `claude plugin update <plugin>@martylouis`, then restart the session.
- **Uninstall:** `claude plugin uninstall <plugin>@martylouis`.
- **Work on a plugin:** start Claude Code with `claude --plugin-dir <clone>/plugins/<plugin>` to load your clone instead of the installed copy.

### Cursor

Cursor's agent CLI loads a plugin from a local folder. Clone the repo once:

```bash
git clone https://github.com/martylouis/agents.git
```

Then start the agent with the plugin you want:

```bash
cursor-agent --plugin-dir agents/plugins/proto
```

Skills run as `/<skill>`, without the plugin name, for example `/build`. Cursor lists the plugin's agents by their bare names (`builder`, `witness`, `librarian`).

- **Update:** `git pull` in the clone.
- **Uninstall:** start `cursor-agent` without `--plugin-dir`, and delete the clone.
- Installing from a Cursor marketplace is not set up yet: this repo has no `.cursor-plugin/` files.

### Codex

Not tested yet.

## Harness support

Plugins are written for any harness. Skills ask for a model tier (`fast` or `strong`) instead of a model name, and each harness maps the tiers to its own models. A plugin that dispatches agents describes how in its own `shared/HARNESS.md` (see [proto's](plugins/proto/shared/HARNESS.md)).

## For maintainers

### Add a plugin

1. Create `plugins/<name>/` with its own `.claude-plugin/plugin.json`.
2. Add an entry to `.claude-plugin/marketplace.json` with `"source": "./plugins/<name>"`.
3. Add a row to the Plugins table above, with a column for each harness.
4. Keep each plugin self-contained. Do not reference files outside its folder.
5. Name no models in skills or agents. Ask for a tier, and keep model families in the plugin's `HARNESS.md`.

### Add a harness

1. Add a subsection under Install with install, update, and uninstall steps that you tested.
2. Add a column to the Plugins table.
3. In each plugin's `shared/HARNESS.md`, add the harness to Known harnesses (model families, not versions) and a short section on how it dispatches agents and shows progress.
4. Run one skill of each plugin in the harness and note what failed.

### Versioning

Each plugin has its own [semver](https://semver.org) version. It lives in one place only: the plugin's `.claude-plugin/plugin.json`. Do not repeat it in `marketplace.json`.

- **Patch** (`0.2.1` → `0.2.2`): fixes and wording changes.
- **Minor** (`0.2.1` → `0.3.0`): new skills, agents, or options that keep old behavior.
- **Major** (`0.x` → `1.0.0`): changes that break how people use the plugin.

Installed copies are cached by version, so raise the version in any commit that changes a plugin, and add its lines to the plugin's `CHANGELOG.md` under that version. Commits that touch only the README or other repo files need no bump.

## License

[MIT](LICENSE)
