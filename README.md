# UX Orchestrator

A Claude Code plugin that builds UX prototypes from plans that you already decided.

You give it a folder of plans (and, if you have them, design images). It divides the plans into small, exact tasks. Fresh, low-cost builder sub-agents do the tasks one at a time. The orchestrator reviews each result in a real browser, fixes what fails, and records each decision with its reason. You confirm one time at the start and review one report at the end.

It works with any front-end stack: Vue, React, Angular, Svelte, plain HTML, Tailwind, Bootstrap, or a component library. It uses the stack that your project already has.

## How it works

```
plans/ + designs/ (optional)
        │
        ▼
 1. Intake ─────────── reads plans, repo, and designs → docs/ux/CONTEXT.md, PLANS.md
 2. Start confirmation  one message: plans, fidelity, framework, commits OK?   ◄── you
 3. Tasks ──────────── plans → small task files; each task routed to haiku or sonnet
 4. Run (loop) ─────── ux-builder sub-agent builds one task
        │                 │
        │                 ▼
        │              review: code read → checks → browser states → screenshots
        │                 │
        │      pass ──────┼────── blocker → tweak, or fix task (max 2 rounds), or blocked
        │                 ▼
        │              done/ + run log + decision log + commit
        ▼
 5. Report ─────────── docs/ux/REPORT.md                                       ◄── you
```

### Main ideas

- **The plan is the contract.** The orchestrator does not choose where the prototype lives or what it is built with. Your plans and your repo decide that.
- **Strong model plans, small model builds.** The orchestrator (your session model) writes exact tasks. Builders run on Haiku by default and on Sonnet for library setup or research. Each builder starts with a fresh context and reads only `CONTEXT.md`, its task, and the files that the task names.
- **Exact vocabulary.** `CONTEXT.md` lists the real class names, component names, and icon prefixes. Small models follow exact names well and drift from categories.
- **Evidence, not claims.** Builders have no browser, so their reports are claims. The orchestrator runs each state in Chromium, records the accessibility tree and console errors, and looks at the screenshots.
- **Decisions are recorded, not asked.** The orchestrator decides during the run and writes each decision to a log, or to a full decision record when it sets a pattern. You review all decisions in one report.

## Fidelity

The design input decides the fidelity:

| Input | Fidelity | What "done" means |
| --- | --- | --- |
| No designs | **lo-fi** | The flow and the states work. The project's framework is used with its default look. With no framework, it suggests plain Tailwind. |
| Design images (PNG, JPG) | **hi-fi** | Each screen matches its design. The review compares text descriptions of the design and of the screenshot. |

## Install

```bash
claude plugin marketplace add ~/code/martylouis/ux-orch
claude plugin install ux-orch@martylouis
```

Then run `/reload-plugins` in an open session, or start a new session.

### Requirements

- Claude Code with plugin support
- Node.js 20 or later (for the review scripts)
- Chromium for Playwright. The skill installs the script packages on the first run. If Chromium is missing, it runs `playwright install chromium`.
- Optional: a [TypeSafe](https://typesafe.ai) API key in `TYPESAFE_API_KEY` (environment, or the prototype's `.env`). Without a key, the orchestrator makes the same judgments itself.

## Usage

From the prototype's repo:

```
/ux-orch:orchestrate docs/plans
/ux-orch:orchestrate docs/plans designs/
```

1. It reads everything and sends one start confirmation. Reply `go`, or change a line.
2. It shows a checklist and updates it as tasks finish. It stops only for a contradiction in the plans, a destructive action, or a broken environment.
3. At the end, it writes `docs/ux/REPORT.md` and gives you its path.

### What a good plan has

The plugin builds plans that are already decided. A plan works best when it has:

- A goal: what the user can do when the plan is done.
- The screens, their states, and the exact text.
- What is in scope and what is not.
- A check list that a person could follow in a browser.

Plans can be detailed (numbered steps, files) or short. The orchestrator asks only about real contradictions.

## What it writes

Everything goes into `docs/ux/` in the prototype repo:

```
docs/ux/
├── CONTEXT.md            stack, commands, exact vocabulary, defaults
├── PLANS.md              plan index, run settings, done rules
├── BUILDER-RULES.md      rules every builder follows (edit to tune builders)
├── RUN-LOG.md            one section per task: builder cost, review result, lessons
├── REPORT.md             the end-of-run review: checklist, blocked items, decisions
├── tasks/<plan>/         task files; finished tasks move to done/ with a Result section
├── states/<plan>.json    browser states the review runs
├── evidence/<plan>-rN/   screenshots, per-state code facts, FACTS.md
├── judgments/            judge requests and responses (TypeSafe)
└── decisions/
    ├── INDEX.md          full decision records
    ├── LOG.md            small decisions and accepted assumptions
    └── NNN-slug.md       full decision records
```

## Plugin contents

```
ux-orch/
├── .claude-plugin/        plugin.json, marketplace.json
├── agents/
│   ├── ux-builder.md      haiku · executes one task file
│   └── ux-describer.md    haiku · neutral text descriptions of images (hi-fi)
└── skills/orchestrate/
    ├── SKILL.md           the orchestrator's steps
    ├── references/        REVIEW.md, JUDGE.md, RECORDS.md
    ├── templates/         CONTEXT, PLANS, BUILDER-RULES, TASK, DECISION, REPORT
    └── scripts/           observe.mjs (Playwright review), judge.mjs (TypeSafe)
```

## What the first test showed

The design comes from a manual test run of one plan (login and app shell, 6 tasks, Vue + Nuxt UI, lo-fi):

- Haiku built 5 of 6 tasks. One screen needed one fix round.
- Builder self-reports were not reliable. Two builders reported "all pass." One screen showed no form at all.
- Lint and build found none of the real defects. Browser states and screenshots found all of them, including a button that moved under the pointer and lost the click.
- The TypeSafe judge found every failure with high confidence and made no false passes. Without text descriptions of the screenshots, it was uncertain about everything.
- After `CONTEXT.md` listed exact color class names, builders made no more color errors.

These results are the reason for the review order, the exact-vocabulary rule, and the "look at the screenshots" step.

## Roadmap

### Planned skills

Each skill has a handoff document with its design decisions, open questions, and how a person uses it.

| Skill | What it does | Handoff |
| --- | --- | --- |
| `/ux-orch:plan` | Turns an idea, a brief, design images, or Layers output into decided plans that `orchestrate` builds well. `--explore` writes lo-fi variants to compare. | [PLAN-SKILL.md](docs/handoffs/PLAN-SKILL.md) |
| `/ux-orch:context` | Creates or refreshes `CONTEXT.md` (exact vocabulary, component patterns) and `DESIGN.md`. `--sync` checks prototype overrides against the real design system. | [CONTEXT-SKILL.md](docs/handoffs/CONTEXT-SKILL.md) |
| `/ux-orch:review` | Reviews a running prototype in the browser without building. Discovers states when none exist. Writes a report and one feedback item per problem. | [REVIEW-SKILL.md](docs/handoffs/REVIEW-SKILL.md) |
| `/ux-orch:feedback` | Turns feedback from any source into fix and change tasks, builds them with the run loop, closes every item, and tags the round. `--comment` lets you click an element in the running prototype and comment on it. | [FEEDBACK-SKILL.md](docs/handoffs/FEEDBACK-SKILL.md) |

The skills form one loop:

```
Layers (optional) → plan → context → orchestrate → review → feedback ─┐
                                          ▲                            │
                                          └──────── run loop ◄─────────┘
```

**First decision before building any of them:** one shared location (proposal: `shared/` at the plugin root) for the files that several skills use: the review procedure, the judge questions, the run loop, the scripts, and the templates.

### Layers integration

[Layers](https://layers.jamiemill.com/) is a set of product-design skills that guide decisions through seven layers, from observed behaviour to the visible surface:

| Zone | Layers skills |
| --- | --- |
| Problem space | `/layers-observed-behaviour`, `/layers-domain`, `/layers-user-needs` |
| Solution space | `/layers-product-strategy`, `/layers-conceptual-model`, `/layers-interaction-flow`, `/layers-surface` |
| Diagnosis | `/layers-orient` (finds the layer that needs work) |

Install: `npx skills add jamiemill/layers-skills`

Layers writes plain Markdown and Mermaid (job stories, strategy trees, object maps, breadboards, decision inventories). It answers *what to build and why*; UX Orchestrator answers *build it and prove it works*. Planned connection points:

- **`plan` reads Layers output** when it exists. Job stories and user needs become the plan's goal and why; the conceptual model and object map become the screens and their data; interaction-flow breadboards become the flow and the screen list; surface decisions become layout and content.
- **`plan` points to `/layers-orient`** when an idea is too early to plan (no clear user need or flow), instead of guessing.
- **Decision records link back** to the Layers decision that a prototype tests, so a `learning` record ("the test showed …") can update the right layer.
- **`review` and `feedback`** can tag findings with the layer they belong to (for example, a confusing flow is a Layer 06 problem, not a styling fix).

### Impeccable integration

[Impeccable](https://impeccable.style/) gives agents design vocabulary and design-quality commands. It respects an existing design system.

Install (Claude Code): `/plugin marketplace add pbakaus/impeccable`, or `npx skills add pbakaus/impeccable` for other tools.

`/impeccable init` writes two files that overlap with ours:

| Impeccable file | Holds | UX Orchestrator use |
| --- | --- | --- |
| `DESIGN.md` | Colors, typography, components, visual rules | **The design summary.** When it exists, `context` reads it and does not write its own. `CONTEXT.md` keeps only what Impeccable does not: stack, commands, exact class names, component code patterns. |
| `PRODUCT.md` | User context and product purpose | Input for the plan's **why**, in `plan` and in `orchestrate` intake. |

Planned connection points by skill:

| Skill | Impeccable commands | Use |
| --- | --- | --- |
| `context` | `init`, `extract`, `document` | Make or update `DESIGN.md`; pull components into the inventory; record design-system changes. |
| `plan --explore` | `generate`, `adapt` | Lo-fi design variants to compare before a plan is decided. |
| `orchestrate` (hi-fi) | `polish`, `typeset`, `layout`, `colorize` | An optional polish task after a screen passes review. |
| `review` | `audit`, `clarify` | A design-quality pass on the screenshots, next to the functional checks. Findings become feedback items. |
| `feedback` | `bolder`, `quieter`, `distill`, `delight` | Change tasks for feedback such as "too loud" or "too busy". |

Impeccable stays optional: every skill works without it, and uses it when it is installed.

### UI Skills integration

[UI Skills](https://www.ui-skills.com/) is a catalog of design engineering skills (Impeccable is one of them), with a router skill (`ui-skills-root`), a CLI (`npx ui-skills`), and an MCP server that connects an agent to the catalog. Many of its skills are read-only audits that write an improvement plan for another agent to execute. UX Orchestrator is that executing agent: an audit's plan becomes feedback items or a plan, and the run loop builds and reviews it.

Planned connection points (check each skill's current output before relying on it):

| Skill | UI Skills | Use |
| --- | --- | --- |
| `review` | `improve-ui`, `improve-animations` | Audit pass next to the functional checks. Their findings become feedback items (source `skill`). |
| `plan --explore` | `design-lab` | Interactive design exploration before a plan is decided. |
| `orchestrate` (hi-fi) | `better-ui`, `interaction-design`, `12-principles-of-animation` | Optional polish tasks after a screen passes review; principles cited as `principle` evidence in decision records. |
| `feedback` | any audit plan | Input: `/ux-orch:feedback <audit plan file>`. |
| All | `ui-skills-root` | Finds the right UI skill for a finding by topic and stack, instead of a fixed list in each skill. |

Like Impeccable, UI Skills stays optional.

### Other items

- **v0.2:** hi-fi from Paper and Figma (not only images).
- **Later:** unattended runs with `claude -p`; harness-neutral wording so the skills also run in Cursor, Codex, or OpenCode.
