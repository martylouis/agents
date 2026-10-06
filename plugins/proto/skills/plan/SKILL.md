---
name: plan
description: Turn an idea, a brief, or design images into decided plans that /proto:build builds well. A short interview, one decision at a time, then plan files. --explore writes lo-fi variants to compare.
argument-hint: "<idea text | brief file | designs folder> [--explore]"
disable-model-invocation: true
---

# Plan

You help the person decide what to build, and write it down as plans that the orchestrator builds without questions. This is the one skill where the person and you think together; `build` and `feedback` run without questions afterwards. Keep it short: ask only about decisions the plan needs.

`<skill>` means this skill's base directory and `<plugin>` means the plugin root (`<skill>/../..`).

## Inputs

| Input | Example | Read as |
| --- | --- | --- |
| Idea text | `"Let returning customers check out in one page"` | The goal; everything else comes from the interview |
| Brief file | `briefs/order-history.md` | Goal, why, scope, and constraints; ask only about what it leaves open |
| Designs folder | `designs/checkout/` | Hi-fi: one screen per image; dispatch `proto:witness` (State template, models from `<plugin>/shared/HARNESS.md` → Models) to get the layout and exact copy as text |
| `--explore` | `--explore "Two ways to show shipping costs"` | One plan with a **Variants** section: 2–3 options, each with a hypothesis |

Always read the repo too: the existing screens, routes, and `docs/ux/CONTEXT.md` when it exists. A plan that changes an existing screen names its route and its current states.

Also read, when they exist: `PRODUCT.md` (user context and product purpose; a source for the why), and product-design files the person names (for example Layers output: job stories → goal and why; object map → screens and data; breadboards → flow and screen list; surface decisions → layout and copy). When the idea is too early to plan (no clear user, need, or flow), say so and point to a discovery step (for example `/layers-orient`, when it is installed) instead of guessing.

## Plan rules

1. **One plan = one thing the person reviews as a unit** (a flow or a feature). A project is several plans.
2. **The person owns the plan files.** After approval, tools add data in `docs/ux/PLANS.md`, never inside the plans. `/proto:feedback` edits a plan only for an approved "what" change, and records it (rule 3).
3. **"What" changes** → update the plan, plus a decision record or a row in `docs/ux/DECISIONS.md`, by significance (`<plugin>/shared/JUDGE.md` → Question bank). **"Why" changes** → a new plan with `supersedes:`.
4. **Variants live in ONE plan** (a Variants section, each with a hypothesis; task prefixes `A-`, `B-`). A decision record selects the winner.
5. **Fidelity comes from the designs,** not from a field: no designs → lo-fi; designs → hi-fi. There is no mid-fi.
6. **`why` is optional.** The orchestrator infers one when it is missing.

## Quality bar

A plan is ready when:

- Every screen has its states (default, empty, loading, error, success, as they apply) and the exact copy where it matters.
- **In scope** and **Out of scope** are both present.
- The **Check list** has items a person can follow in a browser (open, do, see). They become review states.
- Steps are small enough that each is one screen, one piece of logic, or one setup step.

Use the plan-readiness judgment (`<plugin>/shared/JUDGE.md` → Question bank) to find what is missing: the part Nouls (states, copy, layout, data) name the gap. Ready < 0.9 → the next interview question is about the lowest part.

**Stop asking** after at most 2 questions driven by the judgment. When ready is still below 0.9, decide from your own review against the quality bar above: when each item holds, write the plan and note the judge numbers in its **Decisions** section; when one does not, name it in the approval step (step 4) instead of asking again.

## Steps

### 1. Read

Read the input, the repo, and the files above. Find the existing plans in `docs/plans/` (or the folder the person uses) so new plans continue the numbering and do not repeat one.

### 2. Interview

Ask ONE question at a time, only about decisions the plans need: which screens, their states, exact copy where it matters, what is out of scope, how the plans divide. Give your proposed answer with each question, so "yes" moves on:

```
Q3 of about 6 — Empty cart
When the cart is empty, the drawer shows "Your cart is empty" and a "Browse products" button that closes the drawer. OK?
```

Stop when every plan meets the quality bar. Do not ask about things the repo, the brief, or the designs already answer. Record each answer as a line in the plan's **Decisions** section.

### 3. Write

Write one file per plan, `docs/plans/<NN>-<slug>.md`, from `<plugin>/shared/templates/PLAN.md`, with `status: draft`. Delete template sections that do not apply (Variants, Why when empty), and keep no `<placeholder>`. The plan files are the only plan record; `build` lists them in `docs/ux/PLANS.md`.

For `--explore`: one plan with a **Variants** section (2–3 variants). Each variant has a hypothesis and the screens and states that differ. Write variants only; the orchestrator builds them (one task set per variant), and a decision record selects the winner after the person compares them.

### 4. Review and approve

Show one line per plan, then wait:

```
Plans — 3 drafts in docs/plans/
- 01 Foundation and login · 2 screens · 9 states · 6 check items
- 02 Products and cart · 3 screens · 12 states · 8 check items
- 03 Checkout and done · 2 screens · 7 states · 5 check items
Reply "approve", or name a plan to change.
```

Change what the person asks, then show the lines again. On approval, set `status: decided` in each plan file.

Done when every plan meets the quality bar and the person approved it.

## Reply

End with the exact command to build the plans, with the designs folder when there is one:

```
/proto:build docs/plans
```
