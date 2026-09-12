<script setup lang="ts">
import AppIcon from '../AppIcon.vue'
import CategoryTabs from './CategoryTabs.vue'
import ThemeToggle from './ThemeToggle.vue'
import type { ToolCategory } from '../../toolRegistry'

defineProps<{ category: ToolCategory }>()
const emit = defineEmits<{ selectCategory: [category: ToolCategory]; search: [] }>()
</script>

<template>
  <header class="app-header"><router-link class="brand" to="/" aria-label="MyDevTools, all tools"><AppIcon name="mark" /><span>MyDevTools</span></router-link><CategoryTabs :active="category" @select="emit('selectCategory', $event)" /><div class="header-actions"><button class="search-button" type="button" data-test-id="open-search" @click="emit('search')"><AppIcon name="search" /><span>Search</span><kbd>⌘ K</kbd></button><a class="header-icon" href="https://www.blazor.mydevtools.org" aria-label="Open the Blazor version"><AppIcon name="external" /></a><ThemeToggle /></div></header>
</template>

<style scoped>
.app-header { align-items: center; background: var(--bg-bar); border-bottom: 1px solid var(--line); display: flex; height: 47px; padding: 0 max(var(--space-4), calc((100vw - 1320px) / 2)); position: sticky; top: 0; z-index: var(--z-header); }.brand { align-items: center; color: var(--fg); display: inline-flex; font: 800 var(--text-sm)/1 var(--font-ui); gap: var(--space-2); letter-spacing: -.03em; text-decoration: none; white-space: nowrap; }.brand .app-icon { color: var(--accent); font-size: 1.3rem; }.header-actions { align-items: center; display: flex; gap: var(--space-1); margin-left: auto; }.header-icon, .search-button { align-items: center; background: transparent; border: 0; color: var(--fg-muted); cursor: pointer; display: inline-flex; justify-content: center; min-height: 38px; position: relative; text-decoration: none; }.header-icon { width: 34px; }.header-icon::after, .search-button::after { content: ''; height: 44px; left: 50%; position: absolute; top: 50%; transform: translate(-50%, -50%); width: 44px; }.header-icon:hover, .search-button:hover { color: var(--fg); }.search-button { border: 1px solid var(--line); border-radius: var(--radius-sm); font: 600 var(--text-xs) var(--font-ui); gap: 7px; height: 30px; padding: 0 var(--space-2); }.search-button kbd { color: var(--fg-faint); font: var(--text-2xs) var(--font-mono); margin-left: var(--space-3); }
@media (max-width: 899px) { .search-button span, .search-button kbd { display: none; }.search-button { border: 0; padding: 0; width: 34px; } }
@media (max-width: 599px) { .app-header { padding: 0 var(--space-3); }.brand span { display: none; } }
</style>
