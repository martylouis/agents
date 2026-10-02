# UX Orchestrator

A Claude Code plugin that builds UX prototypes from plans that you already decided.

You give it a folder of plans (and, if you have them, design images). It divides the plans into small, exact tasks. Fresh, low-cost builder sub-agents do the tasks one at a time. The orchestrator reviews each result in a real browser, fixes what fails, and records each decision with its reason. You confirm one time at the start and review one report at the end.

It works with any front-end stack: Vue, React, Angular, Svelte, plain HTML, Tailwind, Bootstrap, or a component library. It uses the stack that your project already has.

## Contents

- [How it works](#how-it-works)
  - [Main ideas](#main-ideas)
- [Fidelity](#fidelity)
- [The judge (TypeSafe Jev)](#the-judge-typesafe-jev)
  - [Where the orchestrator uses it](#where-the-orchestrator-uses-it)
  - [Confidence rules](#confidence-rules)
  - [Text only](#text-only)
  - [Setup](#setup)
  - [What it costs and records](#what-it-costs-and-records)
- [Install](#install)
  - [Requirements](#requirements)
- [Usage](#usage)
  - [What a good plan has](#what-a-good-plan-has)
- [What it writes](#what-it-writes)
- [Plugin contents](#plugin-contents)
- [What the first test showed](#what-the-first-test-showed)
- [Roadmap](#roadmap)
  - [Planned skills](#planned-skills)
  - [Layers integration](#layers-integration)
  - [Impeccable integration](#impeccable-integration)
  - [UI Skills integration](#ui-skills-integration)
  - [Other items](#other-items)

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

## The judge (TypeSafe Jev)

During a run, the orchestrator makes many small decisions: which model gets a task, whether a builder's assumption is safe, whether a screen meets its acceptance items, whether a change is big enough for a full decision record. The **judge** answers these questions as typed values with a confidence, so the orchestrator can act on them without asking you.

The judge is [TypeSafe](https://typesafe.ai)'s **Jev** model (`jev-latest`), called through `skills/orchestrate/scripts/judge.mjs`. Jev does not write text. It returns one of three answer types:

| Type | Answer | Example question |
| --- | --- | --- |
| **Noul** | Probability of yes (0–1) | "Does this assumption break the vocabulary rules?" |
| **Choice** | One option + confidence | "Should this task run on a fast or a strong model?" |
| **Score** | Position on ordered levels + confidence | "How much risk does this assumption add?" (none → high) |

### Where the orchestrator uses it

| Question | When | What the answer decides |
| --- | --- | --- |
| **Routing** (Choice) | Step 3, one request for all tasks | `fast` → Haiku, `strong` → Sonnet |
| **Assumption triage** (Noul + Score) | After each builder returns | Accept with a log line, or fix (a tweak when it is one line) |
| **Acceptance** (Noul per item) | Hi-fi review | Pass, blocker, or "look closer" |
| **Significance** (Score) | Each orchestrator decision | Full decision record, or one line in `decisions/LOG.md` |

The exact questions and criteria are in [`skills/orchestrate/references/JUDGE.md`](skills/orchestrate/references/JUDGE.md).

### Confidence rules

| Confidence | Action |
| --- | --- |
| ≥ 0.9 | Act on the answer. |
| 0.5 – 0.9 | Act, and confirm with the orchestrator's own review. |
| < 0.5 | The orchestrator decides from the evidence and logs the disagreement. |

The judge never replaces the step where the orchestrator looks at the screenshots.

### Text only

Jev reads text, not images. For visual checks, the review first turns each state into text: **code facts** (accessibility tree, URL, console errors) from `observe.mjs`, and, for hi-fi, a **neutral description** of the screenshot and of the design image from the `ux-describer` sub-agent. The judge then compares text with text. In the first test, the descriptions made the difference: with them, true passes scored 0.75–0.95 and failures 0.01–0.02; with code facts alone, every item was uncertain.

### Setup

1. Get an API key from [typesafe.ai](https://typesafe.ai).
2. Put it in `TYPESAFE_API_KEY`, in your environment or in the prototype repo's `.env` (keep `.env` out of git). The script never prints the key.
3. The orchestrator runs `node judge.mjs --check` at the start. It reports `judge: typesafe` or `judge: self`.

**Without a key**, the orchestrator answers the same questions itself, in the same shapes, and marks them `judge: self` in the logs. The run works the same way; it costs more tokens of the session model.

### What it costs and records

- In the first test, each request took **360–550 ms** and used **800–5,200 input tokens** and **under 210 output tokens**. All independent questions over the same evidence go in one request.
- Every request and response is saved in `docs/ux/judgments/` (`<NN>-<name>.request.json`, `.response.json`), and each decision that used the judge records its numbers, for example `auto (judge: violates 0.93, risk 2.17)`. These records let you check later how often the judge agreed with you, and tune the thresholds.

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

| Skill | What it does |
| --- | --- |
| `/ux-orch:plan` | Turns an idea, a brief, design images, or Layers output into decided plans that `orchestrate` builds well. `--explore` writes lo-fi variants to compare. |
| `/ux-orch:context` | Creates or refreshes `CONTEXT.md` (exact vocabulary, component patterns) and `DESIGN.md`. `--sync` checks prototype overrides against the real design system. |
| `/ux-orch:review` | Reviews a running prototype in the browser without building. Discovers states when none exist. Writes a report and one feedback item per problem. |
| `/ux-orch:feedback` | Turns feedback from any source into fix and change tasks, builds them with the run loop, closes every item, and tags the round. `--comment` lets you click an element in the running prototype and comment on it. |

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
