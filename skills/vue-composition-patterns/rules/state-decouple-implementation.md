---
title: Decouple State Management from UI
impact: MEDIUM
impactDescription: enables swapping state implementations without changing UI
tags: composition, state, architecture
---

## Decouple State Management from UI

The provider component should be the only place that knows how state is managed.
UI components consume the injected context interface — they don't know if state
comes from `reactive()`, Pinia, or a server sync. Wrap provided state in
`readonly()` to enforce mutations through actions only, since Vue state is
mutable by default.

**Incorrect (UI coupled to state implementation):**

```vue
<!-- ChannelComposer.vue -->
<script setup lang="ts">
const props = defineProps<{ channelId: string }>()

// UI component knows about global state implementation
const state = useGlobalChannelState(props.channelId)
const { submit, updateInput } = useChannelSync(props.channelId)
</script>

<template>
  <ComposerFrame>
    <ComposerInput
      :value="state.input"
      @input="updateInput(($event.target as HTMLTextAreaElement).value)"
    />
    <ComposerSubmit @click="submit" />
  </ComposerFrame>
</template>
```

**Correct (state management isolated in provider):**

```vue
<!-- ChannelProvider.vue -->
<script setup lang="ts">
import { ref, readonly } from 'vue'
import { provideComposerContext } from './composables/useComposerContext'

const props = defineProps<{ channelId: string }>()
const { state, update, submit } = useGlobalChannel(props.channelId)
const inputRef = ref<HTMLTextAreaElement | null>(null)

// readonly() prevents child components from mutating state directly
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

```vue
<!-- ChannelComposer.vue — UI only knows about the context interface -->
<template>
  <ComposerFrame>
    <ComposerHeader />
    <ComposerInput />
    <ComposerFooter>
      <ComposerSubmit />
    </ComposerFooter>
  </ComposerFrame>
</template>
```

```vue
<!-- Usage -->
<template>
  <ChannelProvider :channel-id="channelId">
    <ChannelComposer />
  </ChannelProvider>
</template>
```

**Different providers, same UI:**

```vue
<!-- ForwardMessageProvider.vue — local state for ephemeral forms -->
<script setup lang="ts">
import { reactive, readonly, ref } from 'vue'
import { provideComposerContext } from './composables/useComposerContext'

const state = reactive({ input: '', attachments: [], isSubmitting: false })
const forwardMessage = useForwardMessage()
const inputRef = ref<HTMLTextAreaElement | null>(null)

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
import { readonly, ref } from 'vue'
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

The same `ComposerInput` component works with both providers because it only
depends on the injected context interface, not the implementation. Using
`readonly()` on provided state ensures child components cannot accidentally
mutate state — they must go through the `actions` to make changes.
