---
name: vue-composition-patterns
description:
  Vue 3 Composition API patterns that scale. Use when refactoring components with
  boolean prop proliferation, building flexible component libraries, or designing
  reusable APIs. Triggers on tasks involving compound components, provide/inject,
  slots, or component architecture in Vue 3.
---

# Vue 3 Composition Patterns

Composition patterns for building flexible, maintainable Vue 3 components. Avoid
boolean prop proliferation by using compound components, lifting state with
provide/inject, and composing internals with slots. These patterns make codebases
easier for both humans and AI agents to work with as they scale.

**Vue 3 notes:** All examples use `<script setup lang="ts">` with the Composition
API. State shared via `provide()` must use reactive primitives (`ref()`,
`reactive()`, `computed()`) to maintain reactivity. Use `InjectionKey<T>` for
type-safe `inject()`. Use `defineModel()` (Vue 3.4+) for two-way binding.

## When to Apply

Reference these guidelines when:

- Refactoring components with many boolean props
- Building reusable component libraries in Vue 3
- Designing flexible component APIs with slots and provide/inject
- Reviewing component architecture
- Working with compound components or provide/inject patterns

## Rule Categories by Priority

| Priority | Category                | Impact | Prefix          |
| -------- | ----------------------- | ------ | --------------- |
| 1        | Component Architecture  | HIGH   | `architecture-` |
| 2        | State Management        | MEDIUM | `state-`        |
| 3        | Implementation Patterns | MEDIUM | `patterns-`     |

## Quick Reference

### 1. Component Architecture (HIGH)

- `architecture-avoid-boolean-props` - Don't add boolean props to customize
  behavior; use composition with slots
- `architecture-compound-components` - Structure complex components with
  provide/inject and barrel exports

### 2. State Management (MEDIUM)

- `state-decouple-implementation` - Provider is the only place that knows how
  state is managed; wrap provided state in `readonly()`
- `state-context-interface` - Define generic interface with state, actions, meta
  for dependency injection via typed provide/inject
- `state-lift-state` - Move state into provider components for sibling access

### 3. Implementation Patterns (MEDIUM)

- `patterns-explicit-variants` - Create explicit variant components instead of
  boolean modes
- `patterns-children-over-render-props` - Use slots for composition; use scoped
  slots when passing data back

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/architecture-avoid-boolean-props.md
rules/state-context-interface.md
```

Each rule file contains:

- Brief explanation of why it matters
- Incorrect code example with explanation
- Correct code example with explanation
- Additional context and references
