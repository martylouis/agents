---
title: Create Explicit Component Variants
impact: MEDIUM
impactDescription: self-documenting code, no hidden conditionals
tags: composition, variants, architecture
---

## Create Explicit Component Variants

Instead of one component with many boolean props, create explicit variant
components as separate SFCs. Each variant composes the pieces it needs. The
code documents itself.

**Incorrect (one component, many modes):**

```vue
<template>
  <!-- What does this component actually render? -->
  <Composer
    is-thread
    :is-editing="false"
    channel-id="abc"
    show-attachments
    :show-formatting="false"
  />
</template>
```

**Correct (explicit variants):**

```vue
<template>
  <!-- Immediately clear what this renders -->
  <ThreadComposer channel-id="abc" />

  <!-- Or -->
  <EditMessageComposer message-id="xyz" />

  <!-- Or -->
  <ForwardMessageComposer message-id="123" />
</template>
```

Each implementation is unique, explicit, and self-contained. Yet they can each
use shared parts.

**Implementation:**

```vue
<!-- ThreadComposer.vue -->
<script setup lang="ts">
import { ComposerFrame, ComposerInput, ComposerFooter, ComposerFormatting, ComposerEmojis, ComposerSubmit } from '@/components/Composer'

const props = defineProps<{ channelId: string }>()
</script>

<template>
  <ThreadProvider :channel-id="channelId">
    <ComposerFrame>
      <ComposerInput />
      <AlsoSendToChannelField :channel-id="channelId" />
      <ComposerFooter>
        <ComposerFormatting />
        <ComposerEmojis />
        <ComposerSubmit />
      </ComposerFooter>
    </ComposerFrame>
  </ThreadProvider>
</template>
```

```vue
<!-- EditMessageComposer.vue -->
<script setup lang="ts">
import { ComposerFrame, ComposerInput, ComposerFooter, ComposerFormatting, ComposerEmojis } from '@/components/Composer'

const props = defineProps<{ messageId: string }>()
</script>

<template>
  <EditMessageProvider :message-id="messageId">
    <ComposerFrame>
      <ComposerInput />
      <ComposerFooter>
        <ComposerFormatting />
        <ComposerEmojis />
        <ComposerCancelEdit />
        <ComposerSaveEdit />
      </ComposerFooter>
    </ComposerFrame>
  </EditMessageProvider>
</template>
```

```vue
<!-- ForwardMessageComposer.vue -->
<script setup lang="ts">
import { ComposerFrame, ComposerInput, ComposerFooter, ComposerFormatting, ComposerEmojis, ComposerMentions } from '@/components/Composer'

const props = defineProps<{ messageId: string }>()
</script>

<template>
  <ForwardMessageProvider :message-id="messageId">
    <ComposerFrame>
      <ComposerInput placeholder="Add a message, if you'd like." />
      <ComposerFooter>
        <ComposerFormatting />
        <ComposerEmojis />
        <ComposerMentions />
      </ComposerFooter>
    </ComposerFrame>
  </ForwardMessageProvider>
</template>
```

Each variant is explicit about:

- What provider/state it uses
- What UI elements it includes
- What actions are available

No boolean prop combinations to reason about. No impossible states.
