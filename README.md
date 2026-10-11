# agents

Agent plugins by Marty Thierry.

## Plugins

| Plugin | What it does | Claude Code | Cursor | Codex |
| --- | --- | --- | --- | --- |
| [`proto`](plugins/proto/README.md) | Plan, build, review, and iterate UX prototypes with builder sub-agents, browser review, and decision records. | Yes | Yes, marketplace or local clone | Not tested yet |

Each plugin's README covers how to use it. This page covers how to install it in each harness.

## Skills

Single skills that need no plugin. They follow the [Agent Skills](https://agentskills.io) format, so they work in Claude Code, Cursor, Codex, and other agents.

| Skill | What it does |
| --- | --- |
| [`responsive-preview`](skills/responsive-preview/README.md) | Responsive preview with a variant switcher: your running app in phone and desktop frames side by side, with a sidebar that switches pages, states, and variants through URL params. |

Install one with the [skills CLI](https://github.com/vercel-labs/skills):

```bash
npx skills add martylouis/agents --skill responsive-preview
```

## Examples

Small demo apps for trying the plugins and skills. They live in `examples/` and are not part of any install.

| Example | Stack |
| --- | --- |
| [`react-todo`](examples/react-todo/README.md) | Vite, React, Tailwind CSS, shadcn/ui |

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

This repo is a Cursor marketplace named `martylouis`. In Cursor, open **Customize**, add the marketplace from GitHub (`martylouis/agents`), then install **proto**.

Skills run as `/<skill>`, without the plugin name, for example `/build`. Cursor lists the plugin's agents by their bare names (`builder`, `witness`, `librarian`).

- **Update:** refresh or update the marketplace in Customize, then update the plugin.
- **Uninstall:** remove the plugin in Customize.
- **Work on a plugin:** clone the repo and start the agent CLI with `--plugin-dir`:

```bash
git clone https://github.com/martylouis/agents.git
cursor-agent --plugin-dir agents/plugins/proto
```

- **Public listing:** submit the repo at [cursor.com/marketplace/publish](https://cursor.com/marketplace/publish) when you want it on the official marketplace.

### Codex

Not tested yet.

## Harness support

Plugins are written for any harness. Skills ask for a model tier (`fast` or `strong`) instead of a model name, and each harness maps the tiers to its own models. A plugin that dispatches agents describes how in its own `shared/HARNESS.md` (see [proto's](plugins/proto/shared/HARNESS.md)).

## For maintainers

### Add a plugin

1. Create `plugins/<name>/` with its own `.claude-plugin/plugin.json` and `.cursor-plugin/plugin.json` (same version and description; Cursor `author` is `name` only).
2. Add an entry to `.claude-plugin/marketplace.json` with `"source": "./plugins/<name>"` and to `.cursor-plugin/marketplace.json` with `"source": "<name>"` under `metadata.pluginRoot` `plugins`.
3. Add a row to the Plugins table above, with a column for each harness.
4. Keep each plugin self-contained. Do not reference files outside its folder.
5. Name no models in skills or agents. Ask for a tier, and keep model families in the plugin's `HARNESS.md`.

### Add an example

1. Create `examples/<stack>-<app>/`, for example `react-todo`, with its own `README.md` that says how to run it.
2. Commit the lockfile, and keep `node_modules` and build output out of git.
3. Add a row to the Examples table above.

### Add a harness

1. Add a subsection under Install with install, update, and uninstall steps that you tested.
2. Add a column to the Plugins table.
3. In each plugin's `shared/HARNESS.md`, add the harness to Known harnesses (model families, not versions) and a short section on how it dispatches agents and shows progress.
4. Run one skill of each plugin in the harness and note what failed.

### Versioning

Each plugin and each standalone skill has its own [semver](https://semver.org) version. A plugin keeps it in `.claude-plugin/plugin.json`, with the same number copied to `.cursor-plugin/plugin.json`, and a skill keeps it in `metadata.version` in its `SKILL.md`. Do not repeat it in marketplace files.

Everything stays under `0.x` while it is still being explored. `1.0.0` comes only when Marty calls a plugin or skill stable. Until then:

- **Minor** (`0.5.0` → `0.6.0`): new skills, agents, or options, and changes that break how people use it.
- **Patch** (`0.5.0` → `0.5.1`): fixes and wording changes.

### Changes in a PR

A PR does not change the version. It adds its lines to the plugin's or skill's `CHANGELOG.md` under `## Unreleased`, in the usual sections (Added, Changed, Removed, Fixed). PRs that touch only the README or other repo files need no changelog lines.

Installed copies are cached by version, so a merged change does not reach an installed plugin until the next release. To try unreleased work, load your clone with `--plugin-dir` (Install → Work on a plugin).

### Releases

There is no release per PR. A release happens only when Marty decides to cut one.

1. Open a small PR that renames `## Unreleased` to `## <version> — <date>`, adds a new `## Unreleased` above it that says "Nothing yet.", and raises the version (both `plugin.json` files for a plugin, `metadata.version` for a skill). Title it `chore(<name>): release <version>`.
2. After it merges, create a GitHub release on `main` with the tag `<name>-v<version>` (for example `proto-v0.5.0`) and the changelog section as its notes. On github.com: Releases, Draft a new release, type the new tag, pick `main`. This works from a phone browser. From a terminal: `gh release create <name>-v<version> --target main --notes-file <notes>`.
3. Never move a tag. To undo a release, delete the release and its tag, and release again with the next number.

## License

[MIT](LICENSE)
