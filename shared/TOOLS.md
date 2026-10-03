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
