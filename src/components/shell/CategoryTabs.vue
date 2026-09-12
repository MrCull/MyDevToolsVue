<script setup lang="ts">
import { categoryLabels, toolCategories, type ToolCategory } from '../../toolRegistry'

defineProps<{ active: ToolCategory }>()
const emit = defineEmits<{ select: [category: ToolCategory] }>()
</script>

<template>
  <nav class="category-tabs" aria-label="Tool categories">
    <button v-for="category in toolCategories" :key="category" type="button" :class="{ 'is-active': active === category }" @click="emit('select', category)">{{ categoryLabels[category] }}</button>
  </nav>
</template>

<style scoped>
.category-tabs { align-self: stretch; display: flex; margin-left: var(--space-4); }
.category-tabs button { background: transparent; border: 0; color: var(--fg-muted); cursor: pointer; font: 700 var(--text-xs)/1 var(--font-ui); padding: 0 var(--space-3); position: relative; white-space: nowrap; }
.category-tabs button::after { background: transparent; bottom: 0; content: ''; height: 3px; left: var(--space-3); position: absolute; right: var(--space-3); transition: background-color var(--dur-1) var(--ease-out); }
.category-tabs button:hover { color: var(--fg); }.category-tabs button.is-active { color: var(--fg); }.category-tabs button.is-active::after { background: var(--accent); }
@media (max-width: 599px) { .category-tabs { display: none; } }
</style>
