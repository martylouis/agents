---
title: Define Generic Context Interfaces for Dependency Injection
impact: HIGH
impactDescription: enables dependency-injectable state across use-cases
tags: composition, provide-inject, state, typescript, dependency-injection
---

## Define Generic Context Interfaces for Dependency Injection

Define a **generic interface** for your component context with three parts:
`state`, `actions`, and `meta`. This interface is a contract that any provider
can implement — enabling the same UI components to work with completely different
state implementations via Vue's provide/inject.

**Core principle:** Lift state, compose internals, make state
dependency-injectable.

**Incorrect (UI coupled to specific state implementation):**

```vue
<!-- ComposerInput.vue -->
<script setup lang="ts">
// Tightly coupled to a specific composable
const { input, setInput } = useChannelComposerState()
</script>

<template>
  <textarea :value="input" @input="setInput(($event.target as HTMLTextAreaElement).value)" />
</template>
```

**Correct (generic interface enables dependency injection):**

Define typed provide/inject with `InjectionKey`:

```ts
// composables/useComposerContext.ts
import type { InjectionKey, Ref } from 'vue'
import { inject, provide, readonly } from 'vue'

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

// Throwing accessor — inject() returns T | undefined, so always wrap it
export function useComposerContext(): ComposerContextValue {
  const ctx = inject(ComposerKey)
  if (!ctx) throw new Error('Composer components must be used within ComposerProvider')
  return ctx
}

export function provideComposerContext(value: ComposerContextValue) {
  provide(ComposerKey, value)
}
```

**UI components consume the interface, not the implementation:**

```vue
<!-- ComposerInput.vue -->
<script setup lang="ts">
import { useComposerContext } from './composables/useComposerContext'

const { state, actions: { update }, meta } = useComposerContext()
</script>

<template>
  <!-- This component works with ANY provider that implements the interface -->
  <textarea
    :ref="(el) => meta.inputRef.value = el as HTMLTextAreaElement"
    :value="state.input"
    @input="update(s => ({ ...s, input: ($event.target as HTMLTextAreaElement).value }))"
  />
</template>
```

**Different providers implement the same interface:**

```vue
<!-- ForwardMessageProvider.vue — local state for ephemeral forms -->
<script setup lang="ts">
import { ref, reactive, readonly } from 'vue'
import { provideComposerContext } from './composables/useComposerContext'

const state = reactive({
  input: '',
  attachments: [] as Attachment[],
  isSubmitting: false,
})
const inputRef = ref<HTMLTextAreaElement | null>(null)
const forwardMessage = useForwardMessage()

provideComposerContext({
  state: readonly(state),
  actions: {
    update: (updater) => Object.assign(state, updater(state)),
    submit: forwardMessage,
  },
  meta: { inputRef },
})
</script>

<template>
  <slot />
</template>
```

```vue
<!-- ChannelProvider.vue — global synced state for channels -->
<script setup lang="ts">
import { readonly } from 'vue'
import { provideComposerContext } from './composables/useComposerContext'

const props = defineProps<{ channelId: string }>()
const { state, update, submit } = useGlobalChannel(props.channelId)
const inputRef = ref<HTMLTextAreaElement | null>(null)

provideComposerContext({
  state: readonly(state),
  actions: { update, submit },
  meta: { inputRef },
})
</script>

<template>
  <slot />
</template>
```

**The same composed UI works with both:**

```vue
<template>
  <!-- Works with ForwardMessageProvider (local state) -->
  <ForwardMessageProvider>
    <ComposerFrame>
      <ComposerInput />
      <ComposerSubmit />
    </ComposerFrame>
  </ForwardMessageProvider>

  <!-- Works with ChannelProvider (global synced state) -->
  <ChannelProvider channel-id="abc">
    <ComposerFrame>
      <ComposerInput />
      <ComposerSubmit />
    </ComposerFrame>
  </ChannelProvider>
</template>
```

**Custom UI outside the component can access state and actions:**

The provider boundary is what matters — not the visual nesting. Components that
need shared state don't have to be inside `ComposerFrame`. They just need to be
within the provider.

```vue
<!-- ForwardMessageDialog.vue -->
<template>
  <ForwardMessageProvider>
    <Dialog>
      <!-- The composer UI -->
      <ComposerFrame>
        <ComposerInput placeholder="Add a message, if you'd like." />
        <ComposerFooter>
          <ComposerFormatting />
          <ComposerEmojis />
        </ComposerFooter>
      </ComposerFrame>

      <!-- Custom UI OUTSIDE the composer, but INSIDE the provider -->
      <MessagePreview />

      <!-- Actions at the bottom of the dialog -->
      <DialogActions>
        <CancelButton />
        <ForwardButton />
      </DialogActions>
    </Dialog>
  </ForwardMessageProvider>
</template>
```

```vue
<!-- ForwardButton.vue — lives OUTSIDE ComposerFrame but can still submit -->
<script setup lang="ts">
import { useComposerContext } from './composables/useComposerContext'

const { actions: { submit } } = useComposerContext()
</script>

<template>
  <button @click="submit">Forward</button>
</template>
```

```vue
<!-- MessagePreview.vue — lives OUTSIDE ComposerFrame but can read state -->
<script setup lang="ts">
import { useComposerContext } from './composables/useComposerContext'

const { state } = useComposerContext()
</script>

<template>
  <Preview :message="state.input" :attachments="state.attachments" />
</template>
```

The `ForwardButton` and `MessagePreview` are not visually inside the composer
box, but they can still access its state and actions. This is the power of
lifting state into providers with provide/inject.

The UI is reusable bits you compose together. The state is dependency-injected
by the provider. Swap the provider, keep the UI.

**Note on `defineModel`:** For simpler two-way binding cases (e.g., a controlled
input that doesn't need the full context pattern), use `defineModel()` (Vue 3.4+)
instead of prop + emit pairs. Reserve provide/inject for compound component
patterns where multiple siblings need shared state.
