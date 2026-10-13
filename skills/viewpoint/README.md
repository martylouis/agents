# Viewpoint

A skill that shows any web app in phone and desktop frames side by side, so you can build, compare, and demo screens, states, and variants on one screen, and point your agent at exactly the element you want changed.

```text
+----------------+------------------------------------------+
|                | [ph] [dt] [both] /cart                   |
|                |  Mobile   |  Desktop                     |
|                | +-------+ | +--------------------------+ |
|                | |       | | |                          | |
| Page    Cart v | |  app  | | |           app            | |
| Variant    A v | |       | | |                          | |
|  We believe .. | +-------+ | +--------------------------+ |
+----------------+-----------+------------------------------+
```

## Use

Run `/viewpoint` in your app's folder. It writes the viewer and its nav file into a `__viewpoint/` folder in the app's static folder, apart from the app's own files, fills the sidebar from proto plans or the app's routes, offers to add a `dev:viewpoint` script to `package.json`, and checks the viewer in a browser. Then run the script (for example `pnpm dev:viewpoint`) to start the dev server and open the viewer. `/viewpoint --refresh` updates the sidebar after new pages, states, or variants.

## Install

```bash
npx skills add martylouis/agents --skill viewpoint
```

## How it works

- **One HTML file, any framework.** The viewer is a plain page in the app's static folder (`public/` in Vite, Nuxt, Next.js, Angular 17+, and most others). It is served by the app's own dev server, so it is on the same origin as the app and needs no framework code.
- **Live frames.** Both frames load the running app, so they update when the dev server reloads. The phone frame is a phone's width and either the full height of the window or a set phone height. The desktop frame fills the rest of the window, with a zoom menu next to its size so you can see a wider layout on a small screen.
- **URL states.** Every page, state, and variant in the sidebar is a URL with named query params, like `/cart?drawer=open&variant=B`. Each menu sets one param, so they combine. An app shows a state from its URL; the viewer never clicks through the app to reach one.
- **Sync.** Click through the app in one frame and the other follows to the same URL. The sidebar menus follow too. A switch turns sync off.
- **Select for an agent.** Turn on Select, click an element in either frame, say what should change, and add it. Use Add to annotate several elements, each with its own comment. Each one gets a numbered marker on the page, and the menu next to Select copies them all, hides the markers, or clears them. You get plain text to paste into any agent: the page, viewport, element, selector, and the component that renders it, read from Angular, Vue, React, or Svelte in dev mode. Take a screenshot yourself when the agent needs one.
- **Shareable.** The viewer's own URL keeps the frame URL and the viewport, so a link opens the same view.

## The nav file

`__viewpoint/viewpoint.json` lists the pages and params. The skill writes it from, in order:

1. the existing `viewpoint.json` (hand edits are kept),
2. proto plans, when the project has them: screens become pages, state URLs become param options, and a Variants table becomes a `variant` menu with each hypothesis under it,
3. the app's routes and the query params its code reads,
4. you, when none of these have enough.

Edit it by hand any time; the viewer reads it on every load. The format is in [the skill](SKILL.md#viewpointjson).

## With proto

[`proto`](../../plugins/proto/README.md) builds prototypes whose states and variants open from their URLs, so the viewer can show every planned state. Run `/viewpoint` after `/proto:build`, and `--refresh` after new plans or variants. Proto does not need this skill, and this skill does not need proto.

## Other sites

The viewer can show a site you don't run here, like staging or production: the skill puts the files in a `__viewpoint/` folder with `base` set to the site, for any static server. Frames on another origin can't sync, and many sites refuse to load in a frame at all. For a site you own, add the files to its static folder instead.

## Contents

```
viewpoint/
├── SKILL.md                 the skill
├── assets/index.html        the viewer, copied into the app unchanged
├── CHANGELOG.md
└── README.md
```
