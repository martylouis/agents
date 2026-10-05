---
plan: <plan file> (steps <n–m>)
depends-on: [<task numbers>]
files: [<every file this task may create or change>]
model: <haiku | sonnet>
fidelity: <lo-fi | hi-fi>
round: 1
feedback: [<FB-NNN items this task closes; omit for plan tasks>]
screen: <screen name, or omit for non-screen tasks>
design: <design image path, hi-fi only>
---
# <NN> — <title>

## Goal
<one sentence: what the user can do or see when this is done>

## Reference
<files to create or change; components to use; for each named component, point to `CONTEXT.md` → Component patterns, or give a 3–8 line code pattern when it is not there>

## Layout
<regions top to bottom / left to right, with exact text>

## States
| State | What the user sees |
| --- | --- |
| Default | |

## Interactions
<click, Enter, focus, navigation — one line each>

## Content
<exact copy, in quotes>

## Out of scope
<what to leave alone>

## Builder checks
- [ ] <check commands from CONTEXT.md> pass.
- [ ] Smoke: `node <plugin>/shared/scripts/smoke.mjs <url> <route> "<role>:<name>" …` prints no `MISSING` or `ERROR` line. <screen tasks only: list the elements that must render, by role and name, e.g. "button:Pay now" "heading:Your cart"; for a route behind a sign-in, add `--storage <key>=<value>` with the key and value the app itself writes when a user signs in>

## Reviewer checks (browser)
- <one line per state and interaction; these become review states>
