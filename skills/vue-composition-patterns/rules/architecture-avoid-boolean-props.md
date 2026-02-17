---
title: Avoid Boolean Prop Proliferation
impact: CRITICAL
impactDescription: prevents unmaintainable component variants
tags: composition, props, architecture
---

## Avoid Boolean Prop Proliferation

Don't add boolean props like `isThread`, `isEditing`, `isDMThread` to customize
component behavior. Each boolean doubles possible states and creates
unmaintainable conditional logic. Use composition with slots instead.

**Incorrect (boolean props create exponential complexity):**

```vue
<!-- Composer.vue -->
<script setup lang="ts">
defineProps<{
  onSubmit: () => void
  isThread: boolean
  channelId?: string
  isDMThread: boolean
  dmId?: string
  isEditing: boolean
  isForwarding: boolean
}>()
</script>

<template>
  <form>
    <ComposerHeader />
    <ComposerInput />
    <AlsoSendToDMField v-if="isDMThread" :id="dmId" />
    <AlsoSendToChannelField v-else-if="isThread" :id="channelId" />
    <EditActions v-if="isEditing" />
    <ForwardActions v-else-if="isForwarding" />
    <DefaultActions v-else />
    <ComposerFooter :on-submit="onSubmit" />
  </form>
</template>
```

**Correct (composition eliminates conditionals):**

```vue
<!-- ChannelComposer.vue -->
<template>
  <ComposerFrame>
    <ComposerHeader />
    <ComposerInput />
    <ComposerFooter>
      <ComposerAttachments />
      <ComposerFormatting />
      <ComposerEmojis />
      <ComposerSubmit />
    </ComposerFooter>
  </ComposerFrame>
</template>
```

```vue
<!-- ThreadComposer.vue — adds "also send to channel" field -->
<script setup lang="ts">
defineProps<{ channelId: string }>()
</script>

<template>
  <ComposerFrame>
    <ComposerHeader />
    <ComposerInput />
    <AlsoSendToChannelField :id="channelId" />
    <ComposerFooter>
      <ComposerFormatting />
      <ComposerEmojis />
      <ComposerSubmit />
    </ComposerFooter>
  </ComposerFrame>
</template>
```

```vue
<!-- EditComposer.vue — different footer actions -->
<template>
  <ComposerFrame>
    <ComposerInput />
    <ComposerFooter>
      <ComposerFormatting />
      <ComposerEmojis />
      <ComposerCancelEdit />
      <ComposerSaveEdit />
    </ComposerFooter>
  </ComposerFrame>
</template>
```

Each variant is explicit about what it renders. We can share internals without
sharing a single monolithic parent. In Vue, each variant is its own SFC that
imports and composes the shared compound component parts.
