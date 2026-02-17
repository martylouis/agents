---
title: Prefer Slots Over Prop Functions
impact: MEDIUM
impactDescription: cleaner composition, better readability
tags: composition, slots, scoped-slots
---

## Prefer Slots Over Prop Functions

Use slots for composition instead of function props. Slots are Vue's native
composition mechanism — they're more readable, compose naturally, and don't
require understanding callback signatures.

**Incorrect (function props):**

```vue
<!-- Composer.vue -->
<script setup lang="ts">
defineProps<{
  renderHeader?: () => VNode
  renderFooter?: () => VNode
  renderActions?: () => VNode
}>()
</script>

<template>
  <form>
    <component :is="renderHeader" v-if="renderHeader" />
    <ComposerInput />
    <component :is="renderFooter" v-if="renderFooter" />
    <component :is="renderActions" v-if="renderActions" />
  </form>
</template>
```

**Correct (compound components with slots):**

```vue
<!-- ComposerFrame.vue -->
<template>
  <form>
    <slot />
  </form>
</template>
```

```vue
<!-- ComposerFooter.vue -->
<template>
  <footer class="flex">
    <slot />
  </footer>
</template>
```

```vue
<!-- Usage -->
<template>
  <ComposerFrame>
    <CustomHeader />
    <ComposerInput />
    <ComposerFooter>
      <ComposerFormatting />
      <ComposerEmojis />
      <SubmitButton />
    </ComposerFooter>
  </ComposerFrame>
</template>
```

**When scoped slots are appropriate:**

Scoped slots are idiomatic Vue for passing data back to the parent. Unlike React
render props, scoped slots are a first-class Vue feature and not an anti-pattern.

```vue
<!-- ItemList.vue -->
<script setup lang="ts" generic="T">
defineProps<{ items: T[] }>()
</script>

<template>
  <ul>
    <li v-for="(item, index) in items" :key="index">
      <slot :item="item" :index="index" />
    </li>
  </ul>
</template>

<!-- Usage -->
<template>
  <ItemList :items="items">
    <template #default="{ item, index }">
      <ItemCard :item="item" :index="index" />
    </template>
  </ItemList>
</template>
```

**Vue composition guidance — slots vs props vs provide/inject:**

- **Props** — data flowing down to a single child
- **Slots** — composing static structure and layout (default slot), or passing
  data back (scoped slots)
- **Provide/inject** — sharing state across deeply nested components without
  prop drilling

Use slots when composing structure. Use scoped slots when the parent needs
data from the child. Use provide/inject when siblings or deeply nested
components need shared state.
