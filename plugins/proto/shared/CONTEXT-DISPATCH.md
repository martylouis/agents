# Context dispatch

How a skill gets `docs/ux/CONTEXT.md` built: it dispatches `librarian` and reviews the result. The agent reads `CONTEXT-PROCEDURE.md`; you do not.

## Modes

| Mode | When | What it does |
| --- | --- | --- |
| **create** | No `docs/ux/CONTEXT.md` yet | Steps 1–8, writes the files. |
| **refresh** | The library, the stack, or the designs changed | Steps 1–8 again, then shows what changed (step 9). |
| **sync** | The real design system (the base) released a change | Step 10 only. |

## Steps

1. **Hi-fi only:** dispatch `witness` with the **Design inventory** template on the design images, output `<run folder>/DESIGN-INVENTORY.md`. The `context` skill uses `docs/ux/.scratch/<date>-context-<mode>/` as its run folder. Sub-agents cannot dispatch other agents, so this happens before step 2.
2. Dispatch `librarian`:
   > Prototype root: `<path>`. Plugin root: `<plugin>`. Mode: `<create | refresh | sync>`. Designs: `<folder or none>`. Design inventory: `<run folder>/DESIGN-INVENTORY.md or none`.
3. **Review its reply.** Read the Vocabulary and Component patterns sections of `docs/ux/CONTEXT.md`. For each name under "Not verified", and any name that is a category instead of an exact name, check it yourself in the library files and fix the file.
