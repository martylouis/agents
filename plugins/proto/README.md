# Proto

A Claude Code plugin that plans, builds, reviews, and improves UX prototypes.

You decide what to build with `/proto:plan`. You give the plans (and, if you have them, design images) to `/proto:build`. It divides the plans into small, exact tasks. Fresh, low-cost builder sub-agents do the tasks one at a time. Your session acts as the orchestrator: it reviews each result in a real browser, fixes what fails, and records each decision with its reason. You confirm one time at the start and review one report at the end. After a demo or a user test, `/proto:review` and `/proto:feedback` find what is broken and turn every piece of feedback into a recorded fix.

It works with any front-end stack: Vue, React, Angular, Svelte, plain HTML, Tailwind, Bootstrap, or a component library. It uses the stack that your project already has.

## Contents

- [Skills](#skills)
- [How it works](#how-it-works)
  - [Main ideas](#main-ideas)
- [Fidelity](#fidelity)
- [The judge (TypeSafe Jev)](#the-judge-typesafe-jev)
  - [Where the skills use it](#where-the-skills-use-it)
  - [Confidence rules](#confidence-rules)
  - [Text only](#text-only)
  - [Setup](#setup)
  - [What it costs and records](#what-it-costs-and-records)
- [Install](#install)
  - [Update](#update)
  - [Requirements](#requirements)
- [Usage](#usage)
  - [Plan](#plan)
  - [Context](#context)
  - [Build](#build)
  - [Review](#review)
  - [Feedback](#feedback)
  - [What a good plan has](#what-a-good-plan-has)
- [What it writes](#what-it-writes)
- [Plugin contents](#plugin-contents)
- [What the first test showed](#what-the-first-test-showed)
- [Roadmap](#roadmap)
  - [Layers integration](#layers-integration)
  - [Impeccable integration](#impeccable-integration)
  - [UI Skills integration](#ui-skills-integration)
  - [Other items](#other-items)

## Skills

| Skill | What it does | You |
| --- | --- | --- |
| `/proto:plan` | Turns an idea, a brief, or design images into decided plans, with a short interview. `--explore` writes lo-fi variants to compare. | Answer one question at a time, then approve |
| `/proto:context` | Creates or refreshes `CONTEXT.md` (exact vocabulary, component patterns) and the design summary. `--sync` checks prototype overrides against the real design system. | Read and correct the vocabulary |
| `/proto:build` | Builds the prototype from the plans with builder sub-agents and browser review. | Confirm once, read one report |
| `/proto:review` | Reviews a running prototype in the browser without building. Discovers states when none exist. Writes a report and one feedback item per problem. | Read the report |
| `/proto:feedback` | Turns feedback from any source into fix and change tasks, builds them with the run loop, closes every item, and tags the round. `--comment` lets you click an element in the running prototype and comment on it. | Confirm once, read one report |

The skills form one loop:

```
plan → context → build → review → feedback ─┐
                   ▲                        │
                   └────── run loop ◄───────┘
```

`build` runs the `context` procedure in its intake, so you need `/proto:context` only to prepare or check the vocabulary on its own. All skills share one copy of the run loop, the review procedure, the judge questions, the templates, and the scripts, in `shared/`.

## How it works

What `/proto:build` does:

```
plans/ + designs/ (optional)
        │
        ▼
 1. Intake ─────────── reads plans, repo, and designs → docs/ux/CONTEXT.md, PLANS.md
 2. Start confirmation  one message: plans, fidelity, framework, commits OK?   ◄── you
 3. Tasks ──────────── plans → small task files; each task routed to the fast or strong tier
 4. Run (loop) ─────── builder sub-agent builds one task
        │                 │
        │                 ▼
        │              review: code read → checks → browser states → screenshots
        │                 │
        │      pass ──────┼────── blocker → tweak, or fix task (max 2 rounds), or blocked
        │                 ▼
        │              done/ + run log + decision log + commit
        ▼
 5. Report ─────────── <run folder>/REPORT.md                                  ◄── you
```

### Main ideas

- **The plan is the contract.** The orchestrator does not choose where the prototype lives or what it is built with. Your plans and your repo decide that.
- **Strong model plans, small model builds.** The orchestrator (your session model) writes exact tasks. Builders run on the `fast` tier by default and on the `strong` tier for library setup or research. Each builder starts with a fresh context and reads only `CONTEXT.md`, its task, and the files that the task names.
- **Tiers, not model names.** The plugin asks for a `fast` or a `strong` model and never names one, so a new model release needs no plugin update. Claude Code, Codex, and Cursor have built-in defaults written as model families (`shared/HARNESS.md` → Known harnesses), so they never ask. Any other harness proposes a map once, in the start confirmation, and saves it after your "go" in `docs/ux/.scratch/MODELS.md`, one line per harness. A line there also overrides a default. The file is git-ignored, so switching harnesses never mixes up the choices (`shared/HARNESS.md`).
- **Exact vocabulary.** `CONTEXT.md` lists the real class names, component names, and icon prefixes. Small models follow exact names well and drift from categories.
- **Evidence, not claims.** Builders run only a smoke check (do the named elements render?), so their reports are claims. The orchestrator runs each state in Chromium, records the accessibility tree and console errors, and looks at the screenshots.
- **Decisions are recorded, not asked.** The orchestrator decides during the run and writes each decision to a log, or to a full decision record when it sets a pattern. You review all decisions in one report.

## Fidelity

The design input decides the fidelity:

| Input | Fidelity | What "done" means |
| --- | --- | --- |
| No designs | **lo-fi** | The flow and the states work. The project's framework is used with its default look. With no framework, it suggests plain Tailwind. |
| Design images (PNG, JPG) | **hi-fi** | Each screen matches its design. The review compares text descriptions of the design and of the screenshot. |

## The judge (TypeSafe Jev)

During a run, the orchestrator makes many small decisions: which model gets a task, whether a builder's assumption is safe, whether a screen meets its acceptance items, whether a change is big enough for a full decision record. The **judge** answers these questions as typed values with a confidence, so the orchestrator can act on them without asking you.

The judge is [TypeSafe](https://typesafe.ai)'s **Jev** model (`jev-latest`), called through `shared/scripts/judge.mjs`. Jev does not write text. It returns one of three answer types:

| Type | Answer | Example question |
| --- | --- | --- |
| **Noul** | Probability of yes (0–1) | "Does this assumption break the vocabulary rules?" |
| **Choice** | One option + confidence | "Should this task run on a fast or a strong model?" |
| **Score** | Position on ordered levels + confidence | "How much risk does this assumption add?" (none → high) |

### Where the skills use it

| Question | When | What the answer decides |
| --- | --- | --- |
| **Routing** (Choice) | Build step 3 and feedback tasks, one request for all tasks | The task's tier: `fast` or `strong` |
| **Assumption triage** (Noul + Score) | After each builder returns | Accept with a log line, or fix (a tweak when it is one line) |
| **Acceptance** (Noul per item) | Hi-fi review | Pass, blocker, or "look closer" |
| **Significance** (Score) | Each orchestrator decision, and each `feedback --tweak` | Full decision record, or one row in `DECISIONS.md`; a tweak that scores high becomes a round |
| **Plan readiness** (Noul per plan) | `plan` before it writes, `build` intake | `plan` asks about the missing part; `build` names loose plans in the start confirmation |
| **Feedback triage** (Choice, Noul, Score) | `feedback`, one request per round | Kind (bug, change, idea, question, praise), "why" change, severity, target, and conflicts between items |

The exact questions and criteria are in [`shared/JUDGE.md`](shared/JUDGE.md).

### Confidence rules

| Confidence | Action |
| --- | --- |
| ≥ 0.9 | Act on the answer. |
| 0.5 – 0.9 | Act, and confirm with the orchestrator's own review. |
| < 0.5 | The orchestrator decides from the evidence and logs the disagreement. |

The judge never replaces the step where the orchestrator looks at the screenshots.

### Text only

Jev reads text, not images. For visual checks, the review first turns each state into text: **code facts** (accessibility tree, URL, console errors) from `observe.mjs`, and, for hi-fi, a **neutral description** of the screenshot and of the design image from the `witness` sub-agent. The judge then compares text with text. In the first test, the descriptions made the difference: with them, true passes scored 0.75–0.95 and failures 0.01–0.02; with code facts alone, every item was uncertain.

### Setup

1. Get an API key from [typesafe.ai](https://typesafe.ai).
2. Put it in `TYPESAFE_API_KEY`, in your environment or in the prototype repo's `.env` (keep `.env` out of git). The script never prints the key.
3. The orchestrator runs `node judge.mjs --check` at the start. It reports `judge: typesafe` or `judge: self`.

**Without a key**, the orchestrator answers the same questions itself, in the same shapes, and marks them `judge: self` in the logs. The run works the same way; it costs more tokens of the session model.

### What it costs and records

- In the first test, each request took **360–550 ms** and used **800–5,200 input tokens** and **under 210 output tokens**. All independent questions over the same evidence go in one request.
- Every request and response is saved in the run's scratch folder (`judgments/<NN>-<name>.request.json`, `.response.json`; not committed), and each decision that used the judge records its numbers, for example `auto (judge: violates 0.93, risk 2.17)`. These records let you check later how often the judge agreed with you, and tune the thresholds.

## Install

Install steps for every harness (Claude Code, Cursor, and others) are in the [repo README](../../README.md#install). Below are the Claude Code details.

In a terminal:

```bash
claude plugin marketplace add martylouis/agents
claude plugin install proto@martylouis
```

Or in an open Claude Code session:

```
/plugin marketplace add martylouis/agents
/plugin install proto@martylouis
```

Then run `/reload-plugins`, or start a new session. The marketplace is named `martylouis` and the plugin `proto`, so the skills are `/proto:plan`, `/proto:build`, and so on.

To work on the plugin itself, add your local clone instead: `claude plugin marketplace add ~/code/martylouis/agents`.

### Update

```bash
claude plugin marketplace update martylouis
claude plugin update proto@martylouis
```

Restart the session after an update.

**Coming from `ux-orch`.** Before 1.0.0 the plugin was named `ux-orch` and the build skill was `/ux-orch:orchestrate`. A new name is a new plugin to Claude Code, so remove the old one and install `proto`:

```bash
claude plugin uninstall ux-orch@martylouis
claude plugin marketplace update martylouis
claude plugin install proto@martylouis
```

Your prototype files in `docs/plans/` and `docs/ux/` stay as they are. The next run replaces `BUILDER-RULES.md` with the new copy, and `context --refresh` still recognizes a `DESIGN.md` that `ux-orch` wrote.

The installed copy is cached by version number, so an update picks up only a new version. When you change the plugin in a local clone, start Claude Code with `claude --plugin-dir ~/code/martylouis/agents/plugins/proto` to load the clone directly, or raise the version before you update.

### Requirements

- Claude Code with plugin support, or Cursor's agent CLI (see the [repo README](../../README.md#cursor))
- Node.js 20 or later (for the review scripts)
- Chromium for Playwright. The skill installs the script packages on the first run. If Chromium is missing, it runs `playwright install chromium`.
- Optional: a [TypeSafe](https://typesafe.ai) API key in `TYPESAFE_API_KEY` (environment, or the prototype's `.env`). Without a key, the orchestrator makes the same judgments itself.

## Usage

Run every skill from the prototype's repo.

### Plan

```
/proto:plan "Let returning customers check out in one page"
/proto:plan briefs/order-history.md
/proto:plan designs/checkout/
/proto:plan --explore "Two ways to show shipping costs"
```

1. It reads the input and the repo, then asks one question at a time, each with a proposed answer, so "yes" moves on.
2. It writes `docs/plans/NN-<slug>.md` files and shows one line per plan.
3. When you approve, it ends with the command to build them.

### Context

```
/proto:context                  # create docs/ux/CONTEXT.md (and the design summary)
/proto:context designs/         # also read design images (hi-fi tokens and components)
/proto:context --refresh        # library or designs changed: update and show what changed
/proto:context --sync           # the real design system changed: check prototype overrides
```

The library reading and name checks run in the `librarian` agent (`strong` tier), so they stay out of your session's context; your session reviews the result. Use it before the first run to check the vocabulary, after a library upgrade or a design-system release, or when builders keep making the same mistake (wrong class, wrong icon, look-alike component).

### Build

```
/proto:build docs/plans                       # every plan not yet done
/proto:build docs/plans/04-order-history.md   # one plan
/proto:build docs/plans designs/
```

1. It reads everything and sends one start confirmation. Reply `go`, or change a line.
2. Progress shows in Claude Code's task list, one item per task, updated in place. Chat gets one line only when a task is blocked. It stops only for a contradiction in the plans, a destructive action, or a broken environment.
3. At the end, it writes `REPORT.md` into the run folder in `docs/ux/.scratch/` and gives you its path.

### Review

```
/proto:review                         # whole prototype, all known states
/proto:review 02-products-and-cart    # one plan's states and check list
/proto:review /checkout               # one route
/proto:review designs/                # hi-fi: compare with design images
/proto:review --audit                 # add a design-quality pass, when an audit skill is installed
```

It changes no prototype code. It shows one line per problem and writes `docs/ux/.scratch/<date>-review-<scope>/REVIEW.md`, with one feedback item per finding. The report header records the commit and whether the working tree had uncommitted changes. With no states yet, it discovers them from the routes and saves them for the next review.

### Feedback

```
/proto:feedback                                  # paste or type notes in chat
/proto:feedback notes/stakeholder-review.md      # meeting notes or test notes
/proto:feedback docs/ux/.scratch/2026-10-03-review-all   # findings from /proto:review
/proto:feedback --comment                        # click elements in the prototype and comment
/proto:feedback --tweak "Rename 'Use demo account' to 'Try the demo'"
```

1. It splits the feedback into items and sorts each one: bug, change, new idea, question, or praise.
2. It sends one confirmation. The only per-item question is a conflict between two items.
3. It builds the fixes and changes with the same run loop as `build`, then closes every item as done, rejected (with a reason), or deferred.
4. It writes a round report and tags the round (`ux-round-N`), so you can compare, demo, or revert rounds.

**Comment mode** opens the prototype in a visible browser with a small overlay. Click **Comment**, click an element, type, and save. Each comment records the route, the element, a cropped screenshot, and your text, so a builder knows exactly which button "this button" is. The overlay runs only in that browser window and never touches the prototype's code.

A **tweak** is one small, direct change with no round. When the judge rates it as significant (it sets a pattern or changes the design system), it becomes a round.

### What a good plan has

The plugin builds plans that are already decided. A plan works best when it has:

- A goal: what the user can do when the plan is done.
- The screens, their states, and the exact text.
- What is in scope and what is not.
- A check list that a person could follow in a browser.

Plans can be detailed (numbered steps, files) or short. The orchestrator asks only about real contradictions, and names loose plans in its start confirmation. `/proto:plan` writes plans that have all four.

## What it writes

Plans go into `docs/plans/` (only `/proto:plan` writes there; after approval, the plans are yours). Everything else goes into `docs/ux/` in the prototype repo.

A prototype is throwaway, so git keeps only what explains the prototype: context, plans, states, `HISTORY.md` (one row per feedback item), the decision log, and design-system decision records. Item files, tasks, run logs, reports, screenshots, code facts, and judge files go into `docs/ux/.scratch/`, which git ignores. Each skill keeps the last 3 scratch folders (`scratch:` in `PLANS.md` → Run settings) and deletes older ones, except a feedback round that is still open. Any earlier state can be rebuilt: check out its tag (`ux-round-N`) and run `/proto:review`.

All doc files have UPPERCASE names. A skill that finds an older lowercase file (`context.md`, `plans.md`) renames it.

```
docs/plans/
└── NN-slug.md            the plans (owned by you)

docs/ux/
├── CONTEXT.md            stack, commands, exact vocabulary, component patterns, design system
├── DESIGN.md             design summary (< 2 pages), when no DESIGN.md exists yet
├── PLANS.md              plan index, run settings, done rules
├── BUILDER-RULES.md      rules every builder follows (from the plugin; replaced when it updates)
├── states/<plan>.json    browser states the review runs, one file per plan
├── HISTORY.md            one row per feedback item: text, status, commit or reason
├── tokens/               prototype tokens (only when the project has no token format)
├── DECISIONS.md          log table (every decision, every record ID) and the design-system list
├── decisions/            only when a design-system record exists
│   └── NNN-slug.md       design-system records only (may add NNN.png)
├── .gitignore            contains .scratch/
└── .scratch/             NOT committed; one folder per run, last 3 kept
    ├── MODELS.md                     which model runs each tier, one line per harness (kept by cleanup)
    ├── 2026-10-03-build-all/         REPORT.md, RUN-LOG.md, tasks/, decisions/, evidence/, judgments/
    ├── 2026-10-03-review-all/        REVIEW.md, items/, evidence/
    └── 2026-10-04-feedback-r2/       ROUND.md, items/, tasks/, crops/, evidence/, judgments/
```

## Plugin contents

```
proto/
├── .claude-plugin/        plugin.json
├── CHANGELOG.md           what changed in each version
├── agents/
│   ├── builder.md         fast or strong · executes one task file, runs its smoke check
│   ├── librarian.md       strong · builds and verifies CONTEXT.md from the installed library
│   └── witness.md         fast · neutral text descriptions of images (states, design inventory)
├── skills/
│   ├── plan/              /proto:plan
│   ├── context/           /proto:context
│   ├── build/             /proto:build
│   ├── review/            /proto:review
│   └── feedback/          /proto:feedback
└── shared/                one source for what several skills use
    ├── README.md          which skill uses which shared file
    ├── TOOLS.md           script install, judge check, dev server
    ├── HARNESS.md         tiers, per-harness model choices, dispatch and progress in any harness
    ├── CONTEXT-DISPATCH.md
    ├── CONTEXT-PROCEDURE.md
    ├── RUN.md             the run loop (dispatch, review, fix rounds, blocked)
    ├── REVIEW.md, JUDGE.md, RECORDS.md
    ├── templates/         CONTEXT, DESIGN, MODELS, PLAN, PLANS, TASK, DECISION, REPORT,
    │                      REVIEW-REPORT, FEEDBACK-ITEM, ROUND-REPORT, BUILDER-RULES
    └── scripts/           observe.mjs (browser states), smoke.mjs (builder smoke check),
                           discover.mjs (state discovery),
                           comment.mjs (comment overlay), tokens.mjs (token diff),
                           judge.mjs (TypeSafe), scratch-clean.mjs (scratch cleanup),
                           size.mjs (token size of each file)
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

### Layers integration

[Layers](https://layers.jamiemill.com/) is a set of product-design skills that guide decisions through seven layers, from observed behaviour to the visible surface:

| Zone | Layers skills |
| --- | --- |
| Problem space | `/layers-observed-behaviour`, `/layers-domain`, `/layers-user-needs` |
| Solution space | `/layers-product-strategy`, `/layers-conceptual-model`, `/layers-interaction-flow`, `/layers-surface` |
| Diagnosis | `/layers-orient` (finds the layer that needs work) |

Install: `npx skills add jamiemill/layers-skills`

Layers writes plain Markdown and Mermaid (job stories, strategy trees, object maps, breadboards, decision inventories). It answers *what to build and why*; Proto answers *build it and prove it works*.

In 0.2.0, `plan` reads Layers files when you name them, and points to a discovery step such as `/layers-orient` when an idea is too early. Planned connection points:

- **`plan` finds Layers output by itself** (today it reads it when you name the files). Job stories and user needs become the plan's goal and why; the conceptual model and object map become the screens and their data; interaction-flow breadboards become the flow and the screen list; surface decisions become layout and content.
- **Decision records link back** to the Layers decision that a prototype tests, so a `learning` record ("the test showed …") can update the right layer.
- **`review` and `feedback`** can tag findings with the layer they belong to (for example, a confusing flow is a Layer 06 problem, not a styling fix).

### Impeccable integration

[Impeccable](https://impeccable.style/) gives agents design vocabulary and design-quality commands. It respects an existing design system.

Install (Claude Code): `/plugin marketplace add pbakaus/impeccable`, or `npx skills add pbakaus/impeccable` for other tools.

`/impeccable init` writes two files that overlap with ours:

| Impeccable file | Holds | Proto use |
| --- | --- | --- |
| `DESIGN.md` | Colors, typography, components, visual rules | **The design summary.** When it exists, `context` reads it and does not write its own. `CONTEXT.md` keeps only what Impeccable does not: stack, commands, exact class names, component code patterns. |
| `PRODUCT.md` | User context and product purpose | Input for the plan's **why**, in `plan` and in `build` intake. |

Planned connection points by skill:

| Skill | Impeccable commands | Use |
| --- | --- | --- |
| `context` | `init`, `extract`, `document` | Make or update `DESIGN.md`; pull components into the inventory; record design-system changes. |
| `plan --explore` | `generate`, `adapt` | Lo-fi design variants to compare before a plan is decided. |
| `build` (hi-fi) | `polish`, `typeset`, `layout`, `colorize` | An optional polish task after a screen passes review. |
| `review` | `audit`, `clarify` | A design-quality pass on the screenshots, next to the functional checks. Findings become feedback items. |
| `feedback` | `bolder`, `quieter`, `distill`, `delight` | Change tasks for feedback such as "too loud" or "too busy". |

In 0.2.0, `context` reads an existing `DESIGN.md` and does not write a second one, `plan` and `build` read `PRODUCT.md` for the why, and `review --audit` runs an installed audit skill. The other connection points are planned.

Impeccable stays optional: every skill works without it, and uses it when it is installed.

### UI Skills integration

[UI Skills](https://www.ui-skills.com/) is a catalog of design engineering skills (Impeccable is one of them), with a router skill (`ui-skills-root`), a CLI (`npx ui-skills`), and an MCP server that connects an agent to the catalog. Many of its skills are read-only audits that write an improvement plan for another agent to execute. Proto is that executing agent: an audit's plan becomes feedback items or a plan, and the run loop builds and reviews it.

Planned connection points (check each skill's current output before relying on it):

| Skill | UI Skills | Use |
| --- | --- | --- |
| `review` | `improve-ui`, `improve-animations` | Audit pass next to the functional checks. Their findings become feedback items (source `skill`). |
| `plan --explore` | `design-lab` | Interactive design exploration before a plan is decided. |
| `build` (hi-fi) | `better-ui`, `interaction-design`, `12-principles-of-animation` | Optional polish tasks after a screen passes review; principles cited as `principle` evidence in decision records. |
| `feedback` | any audit plan | Input: `/proto:feedback <audit plan file>`. |
| All | `ui-skills-root` | Finds the right UI skill for a finding by topic and stack, instead of a fixed list in each skill. |

In 0.2.0, `review --audit` can run an installed UI Skills audit, and `feedback` accepts an audit plan file as input. The other connection points are planned.

Like Impeccable, UI Skills stays optional.

### Other items

- **Next:** hi-fi from Paper and Figma (not only images); a test of the new skills on a real prototype.
- **Later:** unattended runs with `claude -p`; install steps and adapter notes for Cursor, Codex, Amp, or OpenCode (the skills already ask for tiers, not models).
