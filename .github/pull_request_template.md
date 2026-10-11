<!--
Title: conventional commit, for example feat(proto): tiers instead of model
names. Use feat! for a breaking change. No version in the title: versions change
only in a release PR (root README → Releases).
-->

Before: what someone using the plugin saw or did before this change.

After: what they see or do now.

How: what changed in the files, in a few sentences.

Tested: what you ran and what it showed (for example `claude plugin validate .`, the skills and agents listed by `claude --plugin-dir plugins/<plugin>`, a skill run in the test app).

## Checklist

Delete a line that doesn't apply, and say why if it's not obvious.

### Changelog

- [ ] Lines added under `## Unreleased` in the plugin's or skill's `CHANGELOG.md`, with no empty headings
- [ ] Version not changed (only a release PR changes it)
- [ ] Breaking change: the plugin README says how to move over (old to new commands, what to uninstall)

### Docs

- [ ] Plugin README matches the change (commands, skills, agents, options)
- [ ] Root README matches: Plugins table (a column per harness), Install sections, Harness support, Versioning
- [ ] Renames: a grep for the old names finds only changelog history and migration notes

### Harnesses and models

- [ ] No model names in skills, agents, tasks, or templates; they ask for a tier (`fast` or `strong`), and model families live only in `shared/HARNESS.md`
- [ ] Plugin stays self-contained (no references to files outside its folder)
- [ ] Tested in Claude Code
- [ ] Tested in Cursor (`cursor-agent --plugin-dir`), or marked not tested
- [ ] Tested in Codex, or marked not tested
