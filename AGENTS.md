# Working on this repo

This repo holds Marty's agent plugins (`plugins/`) and standalone skills (`skills/`). The root [README](README.md) is the full guide. Follow these rules in every change.

## Versions and changelogs

- Do not change a version in a regular PR. Versions change only in a release PR, and only when Marty asks for a release.
- Add your changes to the plugin's or skill's `CHANGELOG.md` under `## Unreleased`, in Added, Changed, Removed, or Fixed. Leave out headings you don't use.
- Everything stays under `0.x`. Never propose `1.0.0`; Marty decides when something is stable.
- Releases and tags follow README → Releases. Cloud sessions can't push tags, so give Marty the steps instead.

## Plugins and skills

- Keep each plugin self-contained. Nothing in `plugins/<name>/` may point to a file outside that folder.
- Name no models in skills, agents, tasks, or templates. Ask for a tier (`fast` or `strong`). Model families live only in the plugin's `shared/HARNESS.md`.
- A plugin's `.claude-plugin/plugin.json` and `.cursor-plugin/plugin.json` carry the same version and description.
- Agents read skill and agent files, not changelogs. If a change needs old files in a project to be updated, the skill has to handle it itself, for example with a version line it checks.

## Writing

Changelogs, READMEs, and skills are read by people, sometimes with a screen reader. Write plain, complete sentences that say what someone sees or does. Avoid em dashes in prose, stock phrases, and strings of short fragments.

## Pull requests

- Use the template in `.github/pull_request_template.md`.
- Run `claude plugin validate .` before you push. The repo has no CI.
- Test a plugin change by loading the clone with `--plugin-dir` (README → Install).
