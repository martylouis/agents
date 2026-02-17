---
title: Lift State into Provider Components
impact: HIGH
impactDescription: enables state sharing outside component boundaries
tags: composition, state, provide-inject, providers
---

## Lift State into Provider Components

Move state management into dedicated provider components that use `provide()`.
This allows sibling components outside the main UI to access and modify state
without prop drilling or awkward template refs.

**Incorrect (state trapped inside component):**

```vue
<!-- ForwardMessageComposer.vue -->
<script setup lang="ts">
import { reactive } from 'vue'

const state = reactive({ input: '', attachments: [], isSubmitting: false })
const forwardMessage = useForwardMessage()
</script>

<template>
  <ComposerFrame>
    <ComposerInput />
    <ComposerFooter />
  </ComposerFrame>
</template>
```

```vue
<!-- ForwardMessageDialog.vue -->
<!-- Problem: How does ForwardButton access composer state? -->
<template>
  <Dialog>
    <ForwardMessageComposer />
    <MessagePreview /> <!-- Needs composer state -->
    <DialogActions>
      <CancelButton />
      <ForwardButton /> <!-- Needs to call submit -->
    </DialogActions>
  </Dialog>
</template>
```

**Incorrect (watchers to sync state up):**

```vue
<!-- ForwardMessageDialog.vue -->
<script setup lang="ts">
import { ref } from 'vue'

const input = ref('')
</script>

<template>
  <Dialog>
    <ForwardMessageComposer @input-change="input = $event" />
    <MessagePreview :input="input" />
  </Dialog>
</template>
```

```vue
<!-- ForwardMessageComposer.vue -->
<script setup lang="ts">
import { reactive, watch } from 'vue'

const emit = defineEmits<{ inputChange: [value: string] }>()
const state = reactive({ input: '', attachments: [], isSubmitting: false })

// Sync on every change
watch(() => state.input, (val) => emit('inputChange', val))
</script>
```

**Incorrect (reading state from template ref on submit):**

```vue
<script setup lang="ts">
import { ref } from 'vue'

const composerRef = ref<{ state: ComposerState } | null>(null)
</script>

<template>
  <Dialog>
    <ForwardMessageComposer ref="composerRef" />
    <ForwardButton @click="submit(composerRef?.state)" />
  </Dialog>
</template>
```

**Correct (state lifted to provider with provide/inject):**

```vue
<!-- ForwardMessageProvider.vue -->
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
<!-- ForwardMessageDialog.vue -->
<template>
  <ForwardMessageProvider>
    <Dialog>
      <ForwardMessageComposer />
      <MessagePreview /> <!-- Can access state via inject -->
      <DialogActions>
        <CancelButton />
        <ForwardButton /> <!-- Can access actions via inject -->
      </DialogActions>
    </Dialog>
  </ForwardMessageProvider>
</template>
```

```vue
<!-- ForwardButton.vue -->
<script setup lang="ts">
import { useComposerContext } from './composables/useComposerContext'

const { actions } = useComposerContext()
</script>

<template>
  <button @click="actions.submit">Forward</button>
</template>
```

The ForwardButton lives outside ComposerFrame but still has access to the
submit action because it's within the provider. Even though it's a one-off
component, it can still access the composer's state and actions from outside the
UI itself.

**Key insight:** Components that need shared state don't have to be visually
nested inside each other — they just need to be within the same provider that
calls `provide()`.
