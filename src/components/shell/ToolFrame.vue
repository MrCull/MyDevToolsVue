<script setup lang="ts">
import type { ToolDefinition } from '../../toolRegistry'
import AppIcon from '../AppIcon.vue'
import StatusPill from './StatusPill.vue'
import ToolSurface from './ToolSurface.vue'
import ToolTabs from './ToolTabs.vue'

defineProps<{ tool: ToolDefinition }>()
</script>

<template>
  <ToolSurface>
    <template #tabs><ToolTabs :category="tool.category" /></template>
    <header class="tool-heading"><AppIcon :name="tool.icon" /><div><p>{{ tool.category }}</p><h1 :id="`${tool.id}-title`" tabindex="-1">{{ tool.name }}</h1><span>{{ tool.description }}</span></div><StatusPill /></header>
    <div class="tool-workspace"><slot /></div>
  </ToolSurface>
</template>

<style scoped>
.tool-heading { align-items: flex-start; border-bottom: 1px solid var(--line); display: flex; gap: var(--space-3); padding: var(--space-5) var(--space-6); }.tool-heading > .app-icon { color: var(--accent); font-size: 1.45rem; margin-top: 2px; }.tool-heading p { color: var(--accent); font: 700 var(--text-2xs)/1 var(--font-ui); letter-spacing: .08em; margin: 0 0 5px; text-transform: uppercase; }.tool-heading h1 { color: var(--fg); font: 700 var(--text-xl)/1.15 var(--font-ui); margin: 0; }.tool-heading span { color: var(--fg-muted); display: block; font-size: var(--text-sm); margin-top: 5px; }.status-pill { margin-left: auto; }.tool-workspace { padding: var(--space-5) var(--space-6); scroll-margin-top: 120px; } @media (max-width: 599px) { .tool-heading { padding: var(--space-4); }.tool-workspace { padding: var(--space-4); } }
</style>
