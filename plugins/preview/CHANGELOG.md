# Changelog

All notable changes to the `preview` plugin, newest first. The version number lives in `.claude-plugin/plugin.json`; this file holds the notes. Format: [Keep a Changelog](https://keepachangelog.com).

## 0.1.0 — 2026-10-10

### Added
- `/preview:preview` writes `preview.html` and `preview.json` into the app's static folder. Open `/preview.html` on the dev server to see the app in a phone frame and a desktop frame side by side.
- Sidebar: Mobile, Desktop, or Both; a page menu; one menu per URL param, with a note under the chosen option (for example a variant's hypothesis).
- Styled menus that stay the browser's own control, so keyboard and screen reader behavior are native. Chrome and Edge 135+ also get a styled option list with a checkmark.
- An address bar above the frames, like a browser's, with Reload and Open in tab.
- The frames scale to fit the screen. In Both, the phone keeps up to 35% of the width, so it stays readable, and the desktop scales into the rest.
- Sync: a click inside one frame moves the other to the same URL, and the sidebar follows. A switch turns it off.
- Keyboard shortcuts for viewport, sync, reload, sidebar, and address bar, listed in a dialog behind the `?` button or the `?` key.
- The nav comes from an existing `preview.json` (hand edits kept), then proto plans (screens, state URLs, Variants), then the app's routes and query reads.
- Works with any framework that serves a static folder, and with sites on another origin (no sync there).
- A param's `default` names the value the app shows when the param is not in the URL, so the menu shows the right variant on a plain URL.
