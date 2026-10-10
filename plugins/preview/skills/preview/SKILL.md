---
name: preview
description: Add a side-by-side phone and desktop viewer to a web app, at /preview.html, with a sidebar that switches pages, variants, and states through URL params. Works with any framework, and reads proto plans when they exist.
argument-hint: "[app folder or URL] [--refresh]"
---

# Preview

Writes two files into the app's static folder:

- `preview.html`: the viewer. A sidebar on the left (Mobile, Desktop, or Both; a page menu; one menu per URL param, with a note under the chosen option), and live frames of the app on the right, scaled to fit the screen. The frames stay on the same URL as you click through the app; a switch turns that off.
- `preview.json`: what the sidebar lists. The person can edit it by hand; the viewer reads it on every load.

The viewer works on the app as it runs, so it shows code changes as soon as the dev server reloads. It reaches each state by its URL, never by clicks, so the app must be able to show a state from its route and query params (see **URL states**).

This skill never changes the app's code. It runs in the main session and needs no sub-agent and no model choice.

## Arguments

| Argument | Example | Meaning |
| --- | --- | --- |
| none | `/preview:preview` | The app in the current folder |
| folder | `/preview:preview apps/web` | The app in that folder |
| URL | `/preview:preview https://staging.example.com` | A site you don't run here (see **Other sites**) |
| `--refresh` | `/preview:preview --refresh` | Update `preview.json` from the sources again, and the viewer when the plugin has a newer one |

## Steps

### 1. Find the app

Read `package.json` (and the framework config) for the framework, the dev command, and the dev URL (port from the config or the dev script; otherwise the framework's default). Then find the static folder, whose files the dev server serves at the site root:

| Framework | Static folder | Viewer URL |
| --- | --- | --- |
| Vite (Vue, React, Svelte, plain), Nuxt, Next.js, Create React App, Astro, Angular 17+ | `public/` | `/preview.html` |
| SvelteKit | `static/` | `/preview.html` |
| Angular before 17 (no `public/`) | `src/assets/` | `/assets/preview.html` |
| Plain HTML, no build | the folder with `index.html` | `/preview.html` |

When the folder is not clear (a monorepo, a custom server), ask once which app and where its static files go, with your best guess as the proposed answer.

### 2. Copy the viewer

Copy `<plugin>/assets/preview.html` into the static folder unchanged. Its second line names its version (`<!-- preview viewer 0.1.0 -->`). When a `preview.html` already exists with the same line, leave it. When the line differs or is missing, replace the file and say so in one line; changes the person wants belong in `preview.json`, not in the viewer.

### 3. Write the nav

Write `preview.json` next to the viewer, in the format under **preview.json**. Take pages and params from the first source that has them, and add from later sources only what is missing:

1. **The existing `preview.json`.** It may have hand edits: keep every page, param, option, label, and note it has, and only add what the sources below have and it lacks. Never remove an entry unless the person asks.
2. **Proto plans** (`docs/plans/*.md`, with `docs/ux/PLANS.md`), when they exist:
   - Each screen heading `### <Screen> (`<route>`)` is a page, with the screen name as its label and the plan's number and title as its `note`.
   - Each row of a screen's States table whose URL has query params gives that page's params: one param per query name, and one option per value, labelled with the state name. The state without that param is the option with value `""`.
   - A **Variants** table gives a shared `variant` param: one option per variant, value the letter (`A`), label `A · <short name>`, note the hypothesis. Add the value `""` labelled `Current` only when the app has a version without variants.
   - `title` is the project name; `subtitle` is the plan title when there is one plan, else the number of plans.
3. **The app's routes and code**: the router config or the file-based pages folder (Nuxt `pages/`, Next `app/` or `pages/`, SvelteKit `src/routes/`). Give a route with a dynamic segment a real sample value from the app's mock data. For params, search the code for query reads (`route.query.x`, `useRoute().query`, `useSearchParams`, `searchParams.get('x')`, `queryParamMap`, `ActivatedRoute`) and list the values the code compares them to.
4. **The person.** When the first three give fewer than two pages, ask once for the pages and states to show, with the routes you found as the proposed answer.

Order the pages as a person goes through the app (the plan order, or the nav order), not alphabetically. Write labels in the app's own words.

### 4. Check

When the dev server is running (or you can start it with the dev command), open the viewer URL in a browser, if one is available:

- Both frames show the app, not a 404 or a blank page.
- Choosing each page and each option changes the URL in both frames, and the screen changes.
- Clicking a link in one frame moves the other frame to the same URL.

A state that does not change when its option is chosen is not reachable by URL. List it in the report; do not change the app to fix it. With no browser, give the viewer URL and say it was not checked.

### 5. Report

One short message:

```text
Preview ready: http://localhost:5173/preview.html
- Pages: 4 (from proto plans 01–03). Params: variant (A, B), drawer, error.
- Not reachable by URL: Cart · loading (no param in the app yet).
- Files: public/preview.html, public/preview.json.
```

Then one line on git: the two files are plain files in the app; commit them to share the viewer, or add them to `.gitignore` to keep them local. Leave that choice to the person.

## URL states

Every state the sidebar lists must open from a URL: the route plus named query params, one param per condition (`/cart?drawer=open&error=network&variant=B`). Named params combine, so one menu can change the variant while another keeps the drawer open.

For a state that has no param yet, the app needs a small change: read the param when the screen loads, and set the screen's mock data or UI from it (the router's query API, or `URLSearchParams`, with no state library). This skill reports such states and leaves the app alone. In a proto project, `/proto:build` and `/proto:feedback` make every planned state reachable this way (proto builder rules → URL states).

## Other sites

The viewer can show a site that this folder does not run, such as a staging or production app:

- Write both files to `preview/` in the current folder, and set `base` in `preview.json` to the site's origin.
- Serve that folder with any static server (for example `npx serve preview`), because the viewer reads `preview.json` over HTTP.
- The frames are on another origin, so they cannot sync, and the sidebar cannot follow clicks inside them. Menus and Address still move both frames.
- Many sites refuse to load in a frame (`X-Frame-Options` or `Content-Security-Policy: frame-ancestors`). Those frames stay blank; the viewer's **Open in tab** still works. Say this when the site is not the person's own.

When the person owns the site, the better way is to add the two files to its static folder, so the viewer is on the same origin.

## preview.json

```json
{
  "title": "Checkout prototype",
  "subtitle": "Plan 02 · Shipping costs",
  "viewports": { "mobile": 390, "desktop": 1440 },
  "params": [
    {
      "name": "variant",
      "label": "Variant",
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
| `viewports` | Frame widths in CSS pixels. Default 390 and 1440. |
| `params` | Params shared by every page (like `variant`). Their values stay when the page changes. |
| `pages[].path` | The URL the page menu opens, with any params it needs. |
| `pages[].match` | Optional path prefix, so a page with a dynamic segment (`/products/<id>`) still shows its menus when you click to another item. |
| `pages[].params` | Params for this page only. |
| `options[].value` | The param's value. `""` means the param is not in the URL. |
| `options[].note` | Shown under the menu while that option is chosen (a hypothesis, or what the state shows). |

The viewer also has an **Address** field for any URL, keys `1`, `2`, `3` for Mobile, Desktop, Both, and `\` to hide the sidebar. Its own URL keeps the frame URL and the viewport (`/preview.html?path=%2Fcart%3Fvariant%3DB&view=both`), so a link to it opens the same view. Another nav file opens with `?config=<file>.json`.
