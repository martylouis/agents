# Preview

A plugin that adds a side-by-side phone and desktop viewer to any web app, so you can build, compare, and demo screens, states, and variants on one screen.

```text
+----------------+-----------+------------------------------+
| Mobile Desktop |  Mobile   |  Desktop                     |
|  [ Both ]      | +-------+ | +--------------------------+ |
|                | |       | | |                          | |
| Page    Cart v | |  app  | | |           app            | |
| Variant    A v | |       | | |                          | |
|  We believe .. | +-------+ | +--------------------------+ |
+----------------+-----------+------------------------------+
```

## Skill

| Skill | What it does | You |
| --- | --- | --- |
| `/preview:preview` | Writes `preview.html` and `preview.json` into the app's static folder, fills the nav from proto plans or the app's routes, and checks the viewer in a browser. `--refresh` updates the nav. | Open `/preview.html` on your dev server |

In Cursor the skill runs as `/preview`.

## Install

Install steps for every harness are in the [repo README](../../README.md#install). In Claude Code:

```bash
claude plugin marketplace add martylouis/agents
claude plugin install preview@martylouis
```

Then run `/reload-plugins`, or start a new session.

## How it works

- **One HTML file, any framework.** The viewer is a plain page in the app's static folder (`public/` in Vite, Nuxt, Next.js, Angular 17+, and most others). It is served by the app's own dev server, so it is on the same origin as the app and needs no framework code.
- **Live frames.** Both frames load the running app, so they update when the dev server reloads. They scale to fit: on a laptop the desktop frame shrinks, and on a large display both run at full size.
- **URL states.** Every page, state, and variant in the sidebar is a URL with named query params, like `/cart?drawer=open&variant=B`. Each menu sets one param, so they combine. An app shows a state from its URL; the viewer never clicks through the app to reach one.
- **Sync.** Click through the app in one frame and the other follows to the same URL. The sidebar menus follow too. A switch turns sync off.
- **Shareable.** The viewer's own URL keeps the frame URL and the viewport, so a link opens the same view.

## The nav file

`preview.json` lists the pages and params. The skill writes it from, in order:

1. the existing `preview.json` (hand edits are kept),
2. proto plans, when the project has them: screens become pages, state URLs become param options, and a Variants table becomes a `variant` menu with each hypothesis under it,
3. the app's routes and the query params its code reads,
4. you, when none of these have enough.

Edit it by hand any time; the viewer reads it on every load. The format is in [the skill](skills/preview/SKILL.md#previewjson).

## With proto

[`proto`](../proto/README.md) builds prototypes whose states and variants open from their URLs, so the viewer can show every planned state. Run `/preview:preview` after `/proto:build`, and `--refresh` after new plans or variants. Proto does not need this plugin, and this plugin does not need proto.

## Other sites

The viewer can show a site you don't run here, like staging or production: the skill puts the files in a `preview/` folder with `base` set to the site, for any static server. Frames on another origin can't sync, and many sites refuse to load in a frame at all. For a site you own, add the files to its static folder instead.

## Plugin contents

```
preview/
├── .claude-plugin/plugin.json
├── .cursor-plugin/plugin.json
├── assets/preview.html      the viewer, copied into the app unchanged
├── skills/preview/SKILL.md
├── CHANGELOG.md
└── README.md
```
