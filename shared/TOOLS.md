# Tools

Run with the prototype root as cwd. `<plugin>` is the plugin root.

1. If `<plugin>/shared/scripts/node_modules` is missing, run `npm install --prefix <plugin>/shared/scripts`.
2. If Chromium does not launch later, run `npx --prefix <plugin>/shared/scripts playwright install chromium`.
3. Run `node <plugin>/shared/scripts/judge.mjs --check` and note `typesafe` or `self` (see `JUDGE.md`). Skills that use no judge question skip this.

Tool scripts stay in `<plugin>/shared/scripts/`. Never copy them into the prototype repo.

Done when the scripts that the skill needs are runnable.

## Dev server

Most skills need the prototype running.

1. Read the dev command and URL from `docs/ux/CONTEXT.md` → Commands. With no `CONTEXT.md`, read the `dev` script in `package.json` and the framework's default port.
2. When the URL already answers, reuse that server and leave it running at the end.
3. Otherwise start the dev command in the background, wait until the URL answers, and stop it when the skill ends.
4. When it does not start, that is a broken environment: stop and tell the person the command and the first error line.

## File names

All doc files use UPPERCASE names (`CONTEXT.md`, `PLANS.md`, `INDEX.md`, `LOG.md`, …). When `docs/ux/` holds an older lowercase file (`context.md`, `plans.md`, `log.md`, `_index.md`), rename it in two steps, because a case-only rename fails on case-insensitive file systems (macOS):

```bash
git mv docs/ux/context.md docs/ux/context.tmp.md && git mv docs/ux/context.tmp.md docs/ux/CONTEXT.md
```

`_index.md` becomes `INDEX.md`. Use plain `mv` for files git does not track. Say what was renamed in one line, then continue. Never write a lowercase doc file name.

## Scratch

Screenshots, code facts, judge requests, review and round reports are working material: they prove a finding and a fix while a round is open, and any old state can be rebuilt from its git tag. They are never committed.

- Each run writes into its own folder, `docs/ux/.scratch/<YYYY-MM-DD>-<kind>-<scope>/`, where kind is `build`, `review`, or `feedback-r<N>`, and scope is `all`, a plan, or a route slug. Add `-2`, `-3` when the folder exists.
- Before the first write, make sure `docs/ux/.gitignore` contains the line `.scratch/` (create the file when needed).
- **Cleanup**, at the start of every skill: read `scratch:` in `docs/ux/PLANS.md` → Run settings (default `keep-last-3`; `keep-all` keeps everything). Delete the oldest scratch folders beyond that number. Never delete a `feedback-r<N>` folder while `docs/ux/feedback/INDEX.md` has open items in round N.
- Committed records never link into `.scratch/`. A decision record describes its evidence in words and names the tag where it can be seen (for example "visible at tag `ux-round-2`, state `checkout-phone`"). The one exception: a `design-system` decision record may commit one "after" image as `docs/ux/decisions/<NNN>.png`, because that record goes to the real design system.
