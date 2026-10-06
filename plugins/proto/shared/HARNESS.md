# Harness

The plugin names no model and assumes no one harness. Skills and agents ask for a **tier**, and each harness maps the tiers to its own models (Models below). New models come out faster than the plugin changes, so no model name is written into the plugin.

## Tiers

| Tier | Means | Used by |
| --- | --- | --- |
| `fast` | The cheapest model here that edits code reliably on an exact, self-contained task. | `builder` (default), `witness` |
| `strong` | A model that can research a library setup, resolve config conflicts, and make many judgment calls. Cheaper than the session model when the harness offers a choice. | `builder` (setup and research tasks, fix round 2), `librarian` |

The orchestrator is the session itself, on whatever model the person runs. `witness` also needs a model that reads images.

## Models

The person's model choices live in `docs/ux/.scratch/MODELS.md`, one line per harness. The file is git-ignored, so it stays on the machine where it was made and a teammate on another harness never reads it. Scratch cleanup removes run folders only, so the file stays. Template: `<plugin>/shared/templates/MODELS.md`.

At the start of every skill that dispatches an agent:

1. Name the harness you run in (for example `Claude Code`, `Cursor`, `Codex`).
2. Read its line in `docs/ux/.scratch/MODELS.md`. When the line exists and this harness still offers both models, use them. Ask nothing.
3. Otherwise propose a map and confirm it once:
   - When the person said which models to use (for example "only our in-house models"), choose from those only.
   - `fast` → the cheapest model that fits the tier. `strong` → the next one up, or the session model.
   - When the harness cannot choose a model per sub-agent, write `fast → (harness default) · strong → (harness default)`. That is a valid map, not an error, and it needs no question.
   - Put the proposal in the skill's start confirmation as one line, `Models for <harness> (new): fast → <model> · strong → <model>`. A skill with no confirmation asks that one line as its question before the first dispatch.
   - After "go" (or the person's change), add or replace the harness's line in `MODELS.md`. A dispatch before the confirmation (for example `build` intake) uses the proposed map.
4. Write the map in use at the top of `<run folder>/RUN-LOG.md` when the skill writes one.

When the `fast` model cannot read images, `witness` runs on `strong`. When neither can, describe the images yourself.

Model names go only in `MODELS.md` and in run-folder files, never in a committed file. The plugin's own files name models only as the harness examples below.

## Dispatch

To dispatch an agent, start a sub-agent with the agent file (`<plugin>/agents/<name>.md`) as its instructions, the model mapped to its tier, and the prompt the skill gives.

- When the harness has no sub-agents, do the agent's work yourself, one task at a time, reading only what the agent file says to read. Builders then run one after another.
- Sub-agents cannot dispatch other agents, so skills dispatch every agent themselves.

## Task list

Progress goes in the harness's own task or to-do list, updated in place. When the harness has none, keep the list in `<run folder>/RUN-LOG.md` and still print nothing in chat while a run works.

## Claude Code

- Agents are `proto:builder`, `proto:witness`, and `proto:librarian`. Their frontmatter says `model: inherit`; pass the mapped model on every dispatch. Claude Code's model choices for a sub-agent are aliases (`haiku`, `sonnet`, `opus`) that always point at the newest release, so `fast` is usually `haiku` and `strong` usually `sonnet`.
- The task list is the task tools: the live checklist with a spinner.
- Skills run as `/proto:<skill>`.
