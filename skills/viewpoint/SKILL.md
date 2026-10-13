---
name: viewpoint
description: Viewpoint shows a running web app in phone and desktop frames side by side, with a sidebar that switches pages, states, and design variants through URL params, and a select mode that copies any element's context and your comment for an AI agent. Works with any framework, and reads proto plans when they exist.
license: MIT
metadata:
  version: 0.1.0
  author: Marty Thierry
argument-hint: "[app folder or URL] [--refresh]"
---

# Viewpoint

Writes two files into a `__viewpoint/` folder in the app's static folder, and, when the person says yes, one script into its `package.json`:

- `__viewpoint/index.html`: the viewer. A sidebar on the left (a page menu, and one menu per URL param with a note under the chosen option), an address bar above the frames with Mobile, Desktop, and Both buttons at its left, and live frames of the app below it. The phone frame keeps a phone's width, and the desktop frame fills the rest of the window at the zoom the person picks. The frames stay on the same URL as you click through the app; a switch turns that off.
- `__viewpoint/viewpoint.json`: what the sidebar lists. The person can edit it by hand; the viewer reads it on every load.
- A `dev:viewpoint` script that starts the dev server and opens the viewer, so the person runs one command.

The viewer works on the app as it runs, so it shows code changes as soon as the dev server reloads. It reaches each state by its URL, never by clicks, so the app must be able to show a state from its route and query params (see **URL states**).

This skill never changes the app's code; the package script, when the person wants it, is the only change outside the two files. It runs in the main session and needs no sub-agent and no model choice.

## Arguments

| Argument | Example | Meaning |
| --- | --- | --- |
| none | `/viewpoint` | The app in the current folder |
| folder | `/viewpoint apps/web` | The app in that folder |
| URL | `/viewpoint https://staging.example.com` | A site you don't run here (see **Other sites**) |
| `--refresh` | `/viewpoint --refresh` | Update `viewpoint.json` from the sources again, and the viewer when this skill has a newer one |

## Steps

### 1. Find the app

Read `package.json` (and the framework config) for the framework, the dev command, and the dev URL (port from the config or the dev script; otherwise the framework's default). Then find the static folder, whose files the dev server serves at the site root. The viewer always opens by its full file path, because some dev servers answer a bare folder URL with the app's own page:

| Framework | Static folder | Viewer URL |
| --- | --- | --- |
| Vite (Vue, React, Svelte, plain), Nuxt, Next.js, Create React App, Astro, Angular 17+ | `public/` | `/__viewpoint/index.html` |
| SvelteKit | `static/` | `/__viewpoint/index.html` |
| Angular before 17 (no `public/`) | `src/assets/` | `/assets/__viewpoint/index.html` |
| Plain HTML, no build | the folder with `index.html` | `/__viewpoint/index.html` |

When the folder is not clear (a monorepo, a custom server), ask once which app and where its static files go, with your best guess as the proposed answer.

### 2. Copy the viewer

Copy `assets/index.html` from this skill's folder to `__viewpoint/index.html` in the static folder, unchanged. The folder keeps the viewer apart from the app's own files. When the file already exists and is the same as this skill's copy, leave it. When it differs, replace it and say so in one line; changes the person wants belong in `viewpoint.json`, not in the viewer.

### 3. Write the nav

Write `viewpoint.json` next to the viewer, in the format under **viewpoint.json**. Take pages and params from the first source that has them, and add from later sources only what is missing:

1. **The existing `viewpoint.json`.** It may have hand edits: keep every page, param, option, label, and note it has, and only add what the sources below have and it lacks. Never remove an entry unless the person asks.
2. **Proto plans** (`docs/plans/*.md`, with `docs/ux/PLANS.md`), when they exist:
   - Each screen heading `### <Screen> (`<route>`)` is a page, with the screen name as its label and the plan's number and title as its `note`.
   - Each row of a screen's States table whose URL has query params gives that page's params: one param per query name, and one option per value, labelled with the state name. The state without that param is the option with value `""`.
   - A **Variants** table gives a shared `variant` param: one option per variant, value the letter (`A`), label `A · <short name>`, note the hypothesis, and `default` set to the variant the app shows without the param (the first one, unless the code says otherwise). Add the value `""` labelled `Current` only when the app has a version without variants.
   - `title` is the project name; `subtitle` is the plan title when there is one plan, else the number of plans.
3. **The app's routes and code**: the router config or the file-based pages folder (Nuxt `pages/`, Next `app/` or `pages/`, SvelteKit `src/routes/`). Give a route with a dynamic segment a real sample value from the app's mock data. For params, search the code for query reads (`route.query.x`, `useRoute().query`, `useSearchParams`, `searchParams.get('x')`, `queryParamMap`, `ActivatedRoute`) and list the values the code compares them to.
4. **The person.** When the first three give fewer than two pages, ask once for the pages and states to show, with the routes you found as the proposed answer.

Order the pages as a person goes through the app (the plan order, or the nav order), not alphabetically. Write labels in the app's own words.

### 4. Offer the package script

Ask once whether to add a `dev:viewpoint` script to the app's `package.json` that starts the dev server and opens the viewer in the browser. Propose yes, and show the script line you would add. Add it only after a yes. Skip the question when a script with that name already exists (leave it as it is), and when the app has no `package.json` (plain HTML).

Build it from the app's `dev` script and the dev URL from step 1:

| Dev tool | Script |
| --- | --- |
| Vite (Vue, React, Svelte, plain), SvelteKit, Astro 4+ | The `dev` command with `--open /__viewpoint/index.html` added, for example `vite --open /__viewpoint/index.html` or `astro dev --open /__viewpoint/index.html`. These tools open a path once the server is ready. |
| Anything else (Next.js, Nuxt, Angular, Bun, a custom server) | Open the viewer in the background once the server answers, and keep the dev server in the foreground so Ctrl+C stops it: `(npx --yes wait-on http-get://localhost:3000/__viewpoint/index.html && npx --yes open-cli http://localhost:3000/__viewpoint/index.html) & next dev` |
| The viewer is in `__viewpoint/` in the current folder (**Other sites**, or an app with no static folder) | Serve that folder and open it the same way: `(npx --yes wait-on http-get://localhost:4400/ && npx --yes open-cli http://localhost:4400/) & npx --yes serve __viewpoint -l 4400`. When `base` is a dev server on this machine, the person starts it as usual, in another terminal. |

Keep the flags the `dev` script already has. The second and third forms need a POSIX shell (macOS, Linux, or WSL); on Windows, say that the person can run the dev server and open the viewer URL by hand.

### 5. Check

When the dev server is running (or you can start it with the dev command), open the viewer URL in a browser, if one is available:

- Both frames show the app, not a 404 or a blank page.
- Choosing each page and each option changes the URL in both frames, and the screen changes.
- Clicking a link in one frame moves the other frame to the same URL.

A state that does not change when its option is chosen is not reachable by URL. List it in the report; do not change the app to fix it. With no browser, give the viewer URL and say it was not checked.

### 6. Report

One short message:

```text
Preview ready. Run `pnpm dev:viewpoint` to start the dev server and open http://localhost:5173/__viewpoint/index.html.
- Pages: 4 (from proto plans 01–03). Params: variant (A, B), drawer, error.
- Not reachable by URL: Cart · loading (no param in the app yet).
- Files: public/__viewpoint/index.html, public/__viewpoint/viewpoint.json, and the `dev:viewpoint` script in package.json.
```

Use the package manager the lockfile names (`pnpm`, `bun`, `yarn`, or `npm run`). When the person said no to the script, give the dev command and the viewer URL instead. Lead with the command, not with whether the dev server was running.

Then one line on git: the two files are plain files in the app; commit them to share the viewer, or add them to `.gitignore` to keep them local. Leave that choice to the person.

## URL states

Every state the sidebar lists must open from a URL: the route plus named query params, one param per condition (`/cart?drawer=open&error=network&variant=B`). Named params combine, so one menu can change the variant while another keeps the drawer open.

For a state that has no param yet, the app needs a small change: read the param when the screen loads, and set the screen's mock data or UI from it (the router's query API, or `URLSearchParams`, with no state library). This skill reports such states and leaves the app alone. In a proto project, `/proto:build` and `/proto:feedback` make every planned state reachable this way (proto builder rules → URL states).

## Other sites

The viewer can show a site that this folder does not run, such as a staging or production app:

- Write both files to `__viewpoint/` in the current folder, and set `base` in `viewpoint.json` to the site's origin.
- Serve that folder with any static server (for example `npx serve __viewpoint`), because the viewer reads `viewpoint.json` over HTTP.
- The frames are on another origin, so they cannot sync, and the sidebar cannot follow clicks inside them. Menus and the address bar still move both frames.
- Many sites refuse to load in a frame (`X-Frame-Options` or `Content-Security-Policy: frame-ancestors`). Those frames stay blank; the viewer's open-in-new-tab button still works. Say this when the site is not the person's own.

When the person owns the site, the better way is to add the two files to its static folder, so the viewer is on the same origin.

## viewpoint.json

```json
{
  "title": "Checkout prototype",
  "subtitle": "Plan 02 · Shipping costs",
  "viewports": { "mobile": 390, "mobileHeight": 844 },
  "params": [
    {
      "name": "variant",
      "label": "Variant",
      "default": "A",
      "options": [
        { "value": "A", "label": "A · Inline costs", "note": "We believe showing costs next to each item reduces drop-off at checkout." },
        { "value": "B", "label": "B · Summary card", "note": "We believe one summary card is easier to scan." }
      ]
    }
  ],
  "pages": [
    { "label": "Cart", "path": "/cart", "note": "Plan 02", "params": [
      { "name": "drawer", "label": "Drawer", "options": [
        { "value": "", "label": "Closed" },
        { "value": "open", "label": "Open" }
      ] }
    ] },
    { "label": "Product", "path": "/products/espresso-cup", "match": "/products/" }
  ]
}
```

| Field | Meaning |
| --- | --- |
| `title`, `subtitle` | The sidebar heading. |
| `base` | Optional origin of the app, for **Other sites**. Default: the viewer's own origin. |
| `start` | Optional first URL. Default: the first page. |
| `viewports` | The phone frame's size in CSS pixels: `mobile` is its width (default 390) and `mobileHeight` its height when the person picks **Phone** over **Full height** (default 844). The desktop frame has no set size: it fills the window, and its zoom menu sets how many CSS pixels it shows. |
| `params` | Params shared by every page (like `variant`). Their values stay when the page changes. |
| `pages[].path` | The URL the page menu opens, with any params it needs. |
| `pages[].match` | Optional path prefix, so a page with a dynamic segment (`/products/<id>`) still shows its menus when you click to another item. |
| `pages[].params` | Params for this page only. |
| `params[].default` | Optional. The value the app shows when the param is not in the URL, so the menu shows it. Default: the option with value `""`, else the first option. |
| `options[].value` | The param's value. `""` means the param is not in the URL. |
| `options[].note` | Shown under the menu while that option is chosen (a hypothesis, or what the state shows). |

Above the frames is an address bar for any URL, with icon buttons to reload both frames, and open the page in a new tab. Mobile, Desktop, and Both buttons sit to its left. Above each frame, at its right, is a small menu: the phone's height (**Full height** of the window or a set **Phone** height), and the desktop's zoom (100% down to 50%). The viewer remembers both choices.

The **Select** button at the right of the address bar (or the `C` key) turns on select mode. Clicking an element in either frame opens a small box that asks what should change, with **Cancel** and **Add**. **Add** (or Cmd+Enter) saves the element and its comment as an annotation and marks it in the frame with a numbered marker. **Copy all** in the menu next to Select puts the annotations on the clipboard as plain text, ready to paste into an agent. Each one has: the page URL and its sidebar state, the viewport, the element's tag, text, CSS selector, and size, the component that renders it with its parents and file, and last the comment. Component names come from each framework's dev-mode data: Angular's `ng` global, Vue 2 and 3, React (with the source file before React 19), Svelte, and Astro islands; other apps get the nearest custom element. Several annotations are copied as numbered items. Click a marker to reopen its annotation, with **Delete**, **Cancel**, and **Save**. A badge on the Select button shows how many annotations there are. The menu button next to Select shows the count (`Selected: 2`) and has **Copy all**, **Hide markers** (or **Show markers**), and **Clear all**. Copying keeps the annotations unless the menu's **Clear after copy** switch is on (the viewer remembers it); Clear all removes them. `Esc` closes the menu or the box, and then leaves select mode. Select mode needs the frames on the viewer's origin, and it never changes the app. The `?` button (or the `?` key) lists the keyboard shortcuts: `1`, `2`, `3` for Mobile, Desktop, Both, `S` for sync, `R` to reload, `C` for select mode, `\` to hide the sidebar, and `/` for the address bar. The viewer's own URL keeps the frame URL and the viewport (`/__viewpoint/index.html?path=%2Fcart%3Fvariant%3DB&view=both`), so a link to it opens the same view. Another nav file opens with `?config=<file>.json`.
