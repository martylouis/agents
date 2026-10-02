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

- **v0.2:** hi-fi from Paper and Figma (not only images); a feedback round with comments on elements in the running prototype.
- **Later:** help with planning (lo-fi exploration of options); unattended runs with `claude -p`; specialist skills (for example Impeccable) attached to the review step.
