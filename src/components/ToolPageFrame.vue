<script setup lang="ts">
import type { ToolDefinition } from '../toolRegistry'
import ToolIcon from './ToolIcon.vue'

defineProps<{ tool: ToolDefinition }>()
</script>

<template>
  <section class="tool-page" :aria-labelledby="`${tool.id}-title`">
    <header class="tool-page-header">
      <ToolIcon :icon="tool.icon" :label="tool.name" />
      <div>
        <p class="tool-category-label">{{ tool.category }}</p>
        <h1 :id="`${tool.id}-title`">{{ tool.name }}</h1>
        <p>{{ tool.description }}</p>
      </div>
    </header>
    <div class="tool-workspace"><slot /></div>
  </section>
</template>

<style scoped>
.tool-page { max-width: 1320px; padding: 42px clamp(20px, 5vw, 72px) 72px; width: 100%; }
.tool-page-header { align-items: flex-start; display: flex; gap: 14px; margin: 0 auto 4px; max-width: 1120px; }.tool-page-header .tool-icon { height: 38px; min-width: 38px; }.tool-category-label { color: var(--accent-text); font: 700 0.68rem/1 var(--font-mono); letter-spacing: 0.1em; margin: 2px 0 7px; text-transform: uppercase; }.tool-page h1 { color: var(--text-strong); font-size: clamp(1.7rem, 3vw, 2.35rem); letter-spacing: -0.04em; line-height: 1.1; margin: 0; }.tool-page-header p:last-child { color: var(--text-muted); margin: 8px 0 0; }.tool-workspace { width: 100%; }
@media (max-width: 767px) { .tool-page { padding: 28px 0 40px; }.tool-page-header { margin: 0 20px; }.tool-page-header .tool-icon { height: 34px; min-width: 34px; } }
</style>
