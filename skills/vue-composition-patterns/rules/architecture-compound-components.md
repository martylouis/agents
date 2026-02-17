---
title: Use Compound Components
impact: HIGH
impactDescription: enables flexible composition without prop drilling
tags: composition, compound-components, architecture
---

## Use Compound Components

Structure complex components as compound components with shared state via
provide/inject. Each subcomponent accesses shared state via `inject()`, not
props. Consumers compose the pieces they need using slots.

**Incorrect (monolithic component with many props):**

```vue
<script setup lang="ts">
defineProps<{
  showAttachments: boolean
  showFormatting: boolean
  showEmojis: boolean
}>()
</script>

<template>
  <form>
    <slot name="header" />
    <ComposerInput />
    <ComposerAttachments v-if="showAttachments" />
    <footer>
      <ComposerFormatting v-if="showFormatting" />
      <ComposerEmojis v-if="showEmojis" />
      <slot name="actions" />
    </footer>
  </form>
</template>
```

**Correct (compound components with provide/inject):**

First, define the shared context with a throwing accessor composable:

```ts
// composables/useComposerContext.ts
import { inject, provide, readonly, type InjectionKey, type Ref } from 'vue'

interface ComposerState {
  input: string
  attachments: Attachment[]
  isSubmitting: boolean
}

interface ComposerActions {
  update: (updater: (state: ComposerState) => ComposerState) => void
  submit: () => void
}

interface ComposerMeta {
  inputRef: Ref<HTMLTextAreaElement | null>
}

export interface ComposerContextValue {
  state: Readonly<ComposerState>
  actions: ComposerActions
  meta: ComposerMeta
}

export const ComposerKey: InjectionKey<ComposerContextValue> =
  Symbol('ComposerContext')

export function useComposerContext(): ComposerContextValue {
  const ctx = inject(ComposerKey)
  if (!ctx) throw new Error('Composer components must be used within ComposerProvider')
  return ctx
}
```

Then, create the provider and subcomponents as individual SFCs:

```vue
<!-- ComposerProvider.vue -->
<script setup lang="ts">
import { provide, readonly } from 'vue'
import { ComposerKey, type ComposerContextValue } from './composables/useComposerContext'

const props = defineProps<{
  state: ComposerContextValue['state']
  actions: ComposerContextValue['actions']
  meta: ComposerContextValue['meta']
}>()

provide(ComposerKey, {
  state: readonly(props.state),
  actions: props.actions,
  meta: props.meta,
})
</script>

<template>
  <slot />
</template>
```

```vue
<!-- ComposerInput.vue -->
<script setup lang="ts">
import { useComposerContext } from './composables/useComposerContext'

const { state, actions: { update }, meta: { inputRef } } = useComposerContext()
</script>

<template>
  <textarea
    ref="inputRef"
    :value="state.input"
    @input="update(s => ({ ...s, input: ($event.target as HTMLTextAreaElement).value }))"
  />
</template>
```

```vue
<!-- ComposerSubmit.vue -->
<script setup lang="ts">
import { useComposerContext } from './composables/useComposerContext'

const { actions: { submit } } = useComposerContext()
</script>

<template>
  <button @click="submit">Send</button>
</template>
```

Export as a barrel from the component directory:

```ts
// components/Composer/index.ts
export { default as ComposerProvider } from './ComposerProvider.vue'
export { default as ComposerFrame } from './ComposerFrame.vue'
export { default as ComposerInput } from './ComposerInput.vue'
export { default as ComposerSubmit } from './ComposerSubmit.vue'
export { default as ComposerHeader } from './ComposerHeader.vue'
export { default as ComposerFooter } from './ComposerFooter.vue'
export { default as ComposerAttachments } from './ComposerAttachments.vue'
export { default as ComposerFormatting } from './ComposerFormatting.vue'
export { default as ComposerEmojis } from './ComposerEmojis.vue'
```

**Usage:**

```vue
<script setup lang="ts">
import {
  ComposerProvider,
  ComposerFrame,
  ComposerInput,
  ComposerFooter,
  ComposerFormatting,
  ComposerSubmit,
} from '@/components/Composer'
</script>

<template>
  <ComposerProvider :state="state" :actions="actions" :meta="meta">
    <ComposerFrame>
      <ComposerHeader />
      <ComposerInput />
      <ComposerFooter>
        <ComposerFormatting />
        <ComposerSubmit />
      </ComposerFooter>
    </ComposerFrame>
  </ComposerProvider>
</template>
```

Consumers explicitly compose exactly what they need. No hidden conditionals. The
state, actions, and meta are dependency-injected by a parent provider via
provide/inject, allowing multiple usages of the same component structure.

**Key Vue patterns:**

- Use `InjectionKey<T>` with `Symbol()` for type-safe provide/inject
- Always create a throwing accessor composable (`useComposerContext()`) since
  `inject()` returns `T | undefined` by default
- Wrap provided state in `readonly()` to enforce mutations through actions only
- Export compound component parts as individual SFCs via a barrel `index.ts`
