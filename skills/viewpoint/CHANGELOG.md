# Changelog

All notable changes to the `viewpoint` skill (named `responsive-preview` in 0.1.0), newest first. The version number lives in `metadata.version` in `SKILL.md`; this file holds the notes. Changes merge under Unreleased, and a release gives them a version (root README → Releases). Format: [Keep a Changelog](https://keepachangelog.com).

## Unreleased

Nothing yet.

## 0.2.0 — 2026-10-24

### Added
- Select mode, from the Select button at the right of the address bar or the `C` key. Click an element in either frame, add a comment, and press **Add** (or Cmd+Enter). **Copy all** in the menu next to Select copies plain text for an AI agent: the page URL and sidebar state, the viewport, the element's tag, text, selector, and size, the component that renders it with its parents and file, and the comment at the end. The Reload button moved to the left of the address bar. Components are read from Angular, Vue, React, Svelte, and Astro islands in dev mode, and from the nearest custom element otherwise. Each annotation gets a numbered marker in the frame, so you can annotate several. A new annotation's box has **Cancel** and **Add**; click a marker to reopen it with **Delete**, **Cancel**, and **Save**. A menu button joined to Select as one split button (both halves turn dark in select mode, and a badge shows how many annotations there are) shows how many elements are selected and has **Copy all**, **Hide markers**, and **Clear all**, each with an icon. Copy copies every annotation as numbered items and keeps them, unless the **Clear after copy** switch at the bottom of the menu is on. `Esc` closes the menu or the box, then leaves select mode.
- The skill offers to add a `dev:viewpoint` script to the app's `package.json`, and adds it after a yes. It starts the dev server and opens the viewer, so you run one command instead of starting the server and typing the URL.
- A height menu above the phone frame: **Full height** fills the window, and **Phone** uses a set phone height (844 by default, `viewports.mobileHeight` in `preview.json`).
- A zoom menu above the desktop frame, from 100% down to 50%, next to the frame's size. The viewer remembers it.
- A parent host check for apps served under a base path other than `/`. When a static host above the app serves several apps from one origin, the skill asks it for one of the app's routes and reports when the host answers with its own page instead of the app's. It names the fix and never changes the host. When the host is not running, the report says it was not checked and gives a curl command to try.

### Changed
- The skill is renamed from `responsive-preview` to `viewpoint`, because with select mode it is more than a responsive preview. Run it as `/viewpoint`.
- The viewer and its nav file live in their own folder, `__viewpoint/index.html` and `__viewpoint/viewpoint.json` in the app's static folder, so they never clash with the app's files. Open `/__viewpoint/index.html` on the dev server.
- The desktop frame fills the width of the window instead of scaling a 1440 pixel page to fit. Use the zoom menu to see a wider layout. `viewports.desktop` in `preview.json` is no longer used.
- The Mobile, Desktop, and Both buttons moved from the sidebar to the left of the address bar, as a group of icon buttons.
- The report leads with the command that opens the viewer.
- The skill replaces an existing viewer whenever it differs from its own copy, instead of checking the version line.

### Fixed
- The viewer URL, the page paths, and the `dev:viewpoint` script include the app's base path (Vite `base`, Next.js `basePath`, and the like), so an app served under a path such as `/shop/` opens the viewer at `/shop/__viewpoint/index.html`.
- The space between the phone frame and the desktop frame is 16 pixels, down from 24, so it matches the padding around the frames.
- While the annotation box is open, hovering and clicking in the frames no longer picks another element. A click puts you back in the comment box; Cancel, Add, or Save first.
- When `viewpoint.json` is missing, the sidebar says so plainly instead of showing a JSON error. Many dev servers answer a missing file with the app's HTML page, which made the viewer report an unexpected `<` token.

## 0.1.0 — 2026-10-10

### Added
- `/responsive-preview` writes `preview.html` and `preview.json` into the app's static folder. Open `/preview.html` on the dev server to see the app in a phone frame and a desktop frame side by side.
- Sidebar: Mobile, Desktop, or Both; a page menu; one menu per URL param, with a note under the chosen option (for example a variant's hypothesis).
- Styled menus that stay the browser's own control, so keyboard and screen reader behavior are native. Chrome and Edge 135+ also get a styled option list with a checkmark.
- An address bar above the frames, like a browser's, with icon buttons to reload both frames and open the page in a new tab.
- The frames scale to fit the screen. In Both, the phone keeps up to 35% of the width, so it stays readable, and the desktop scales into the rest.
- Sync: a click inside one frame moves the other to the same URL, and the sidebar follows. A switch turns it off.
- Keyboard shortcuts for viewport, sync, reload, sidebar, and address bar, listed in a dialog behind the `?` button or the `?` key.
- The nav comes from an existing `preview.json` (hand edits kept), then proto plans (screens, state URLs, Variants), then the app's routes and query reads.
- Works with any framework that serves a static folder, and with sites on another origin (no sync there).
- A param's `default` names the value the app shows when the param is not in the URL, so the menu shows the right variant on a plain URL.
