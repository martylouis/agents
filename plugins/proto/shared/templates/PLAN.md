---
plan: <NN>
title: <title>
status: <draft | decided>
depends-on: [<plan numbers>]
supersedes: <plan file, only when this plan replaces another because its "why" changed>
designs: <designs folder for this plan, or none>
---
# <NN> — <title>

## Goal

<one or two sentences: what the user can do when this plan is done>

## Why

<optional: the reason for the plan; the orchestrator infers one when this is empty>

## Decisions

<decisions from the planning talk, one line each, with the reason when it matters>

- <decision> — <reason>

## In scope

- <item>

## Out of scope

- <item>

## Screens

### <Screen name> (`<route>`)

| State | URL | What the user sees |
| --- | --- | --- |
| Default | `<route>` | <layout, top to bottom> |
| <Empty / Loading / Error / Success / …> | `<route>?<param>=<value>` | |

Copy (exact):

- <element>: "<text>"

## Variants

<optional: only when the plan compares options. Delete this section otherwise.>

| Variant | Hypothesis | What changes | Task prefix |
| --- | --- | --- | --- |
| A | <we believe … because …> | <screens and states that differ> | `A-` |
| B | | | `B-` |

Each variant opens at the plan's routes with `?variant=<letter>` (`/cart?variant=B`). A decision record (`variant-selected`) selects the winner.

## Steps

1. <step: one screen, one piece of logic, or one setup step>

## Files

<files to create or change, when known>

## Check list

A person can follow these in a browser. They become review states.

- [ ] <open route, do action, see result>

## Done when

- <condition>

## Risks

- <risk, or "none">
