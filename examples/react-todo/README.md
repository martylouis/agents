# react-todo

A small todo app for trying the plugins and skills in this repo. It uses Vite, React, TypeScript, Tailwind CSS, and [shadcn/ui](https://ui.shadcn.com).

You can add todos, check them off, delete them, filter by all, active, or done, and clear the finished ones. Todos are saved in the browser's local storage. The filter is kept in the URL (`?filter=active`), so each view can be opened by link.

## Run it

```bash
cd examples/react-todo
npm install
npm run dev
```

The app opens at http://localhost:5173.

Other scripts: `npm run build` type-checks and builds, and `npm run lint` runs oxlint.

## Add shadcn/ui components

The project is set up for the shadcn CLI, so new components go in `src/components/ui`:

```bash
npx shadcn@latest add dialog
```

## Try a plugin on it

Start your agent in this folder with the plugin loaded from the clone, for example in Claude Code:

```bash
claude --plugin-dir ../../plugins/proto
```

Then run a skill such as `/proto:plan`. Anything the agents write here is test output, so leave it out of commits unless you mean to change the example.
