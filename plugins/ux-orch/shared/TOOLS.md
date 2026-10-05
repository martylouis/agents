# Tools

Run with the prototype root as cwd. `<plugin>` is the plugin root.

1. If `<plugin>/shared/scripts/node_modules` is missing, run `npm install --prefix <plugin>/shared/scripts`.
2. If Chromium does not launch later, run `npx --prefix <plugin>/shared/scripts playwright install chromium`.
3. Run `node <plugin>/shared/scripts/judge.mjs --check` and note `typesafe` or `self` (see `JUDGE.md` → Which judge). Skills that use no judge question skip this.

Tool scripts stay in `<plugin>/shared/scripts/`. Never copy them into the prototype repo.

Done when the scripts that the skill needs are runnable.

## Dev server

Most skills need the prototype running.

1. Read the dev command and URL from `docs/ux/CONTEXT.md` → Commands. With no `CONTEXT.md`, read the `dev` script in `package.json` and the framework's default port.
2. When the URL already answers, reuse that server and leave it running at the end.
3. Otherwise start the dev command in the background, wait until the URL answers, and stop it when the skill ends.
4. When it does not start, that is a broken environment: stop and tell the person the command and the first error line.

## File names

All doc files use UPPERCASE names (`CONTEXT.md`, `PLANS.md`, `INDEX.md`, `LOG.md`, …). Find older lowercase files with git, not with `ls`: on case-insensitive file systems (macOS) `ls` can show `CONTEXT.md` while git still tracks `context.md`, and the next commit then goes to the lowercase path.

```bash
git ls-files docs/ux | grep -E '/[a-z_][a-z0-9_-]*\.md$'
```

Rename each one by its git path, in two steps, because a case-only rename fails on those file systems:

```bash
git mv docs/ux/context.md docs/ux/context.tmp.md && git mv docs/ux/context.tmp.md docs/ux/CONTEXT.md
```

`_index.md` becomes `INDEX.md`. For files git does not track, check with `ls` and use plain `mv` in the same two steps. Say what was renamed in one line, then continue. Never write a lowercase doc file name.

## Old evidence

Before 0.2.0, screenshots, judge files, and reports were committed under `docs/ux/` (folders such as `evidence/`, `judgments/`, `reviews/`, and report files next to them). When `git ls-files docs/ux` lists any of them, and commits are approved (`commit: per-task` in `docs/ux/PLANS.md` → Run settings, or a "go" on a confirmation that names this move):

1. Move them into `docs/ux/.scratch/<YYYY-MM-DD>-legacy/` (create the `.gitignore` line first, see Scratch), keeping their folder names.
2. `git rm -r --cached` the old paths, and commit: `chore(ux): move old evidence to scratch`. Git history keeps every file.
3. Say in one line how many files and MB moved.

Cleanup keeps every `-legacy` folder and does not count it in the newest N, because it holds the old records. The owner may delete a legacy folder by hand. Old `feedback/`, `tasks/`, `RUN-LOG.md`, and `REPORT.md` move the same way. An old `feedback/INDEX.md` becomes `HISTORY.md`: `git mv` it, then change its columns to `ID | Round | Text | Status | Closed by` (`RECORDS.md`), taking `Text` from each item file before the move. Otherwise name the folders and their size in one line of the skill's confirmation ("Old evidence: 18 MB committed, move it to scratch?"), and move them after "go".

## Builder rules

`docs/ux/BUILDER-RULES.md` belongs to the plugin, not to the person: builders follow it, and it changes when the plugin changes. Its first line names the version (`<!-- ux-orch builder-rules 0.2.0 -->`). When the file is missing, or its first line differs from the one in `<plugin>/shared/templates/BUILDER-RULES.md`, copy the template over it and say so in one line. Rules the person wants for this prototype go into `CONTEXT.md`, never into this file.

## Scratch

Item files, task files, run logs, reports, screenshots, code facts, and judge requests are working material: they prove a finding and a fix while a round is open, and any old state can be rebuilt from its git tag. They are never committed (`RECORDS.md` lists what is committed).

- Each run writes into its own folder, `docs/ux/.scratch/<YYYY-MM-DD>-<kind>-<scope>/`, where kind is `build`, `review`, `tweak`, or `feedback-r<N>`, and scope is `all`, a plan, or a route slug. Add `-2`, `-3` when the folder exists.
- Before the first write, make sure `docs/ux/.gitignore` contains the line `.scratch/` (create the file when needed).
- **Cleanup**, at the start of every skill: run `node <plugin>/shared/scripts/scratch-clean.mjs`. It reads `scratch:` in `docs/ux/PLANS.md` → Run settings, keeps the newest runs and every feedback round with open items, and trashes the rest. Done when it printed `keep` or `delete` for each folder. Leave the deletes to the script; `--dry-run` shows the verdicts only.
- Records in a run folder may link to each other. A committed record never links into `.scratch/`: it describes its evidence in words. A decision record describes its evidence in words and names the tag where it can be seen (for example "visible at tag `ux-round-2`, state `checkout-phone`"). The one exception: a `design-system` decision record may commit one "after" image as `docs/ux/decisions/<NNN>.png`, because that record goes to the real design system.
