<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from './components/shell/AppHeader.vue'
import RouteAnnouncer from './components/shell/RouteAnnouncer.vue'
import SearchDialog from './components/shell/SearchDialog.vue'
import ToolFrame from './components/shell/ToolFrame.vue'
import { toolById, toolsByCategory, type ToolCategory } from './toolRegistry'

const route = useRoute()
const router = useRouter()
const searchOpen = ref(false)
const activeCategory = computed<ToolCategory>(() => toolById(route.meta.toolId)?.category ?? 'Formatters')
const currentTool = computed(() => toolById(route.meta.toolId))
const chooseCategory = (category: ToolCategory) => router.push(toolsByCategory(category)[0].path)

const onShortcut = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement | null
  const typing = !!target?.closest('input, textarea, select, [contenteditable]')
  if (!typing && (event.key === '/' || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'))) { event.preventDefault(); searchOpen.value = true }
}
watch(() => route.fullPath, async () => { await nextTick(); document.querySelector<HTMLElement>('h1[tabindex="-1"]')?.focus() })
window.addEventListener('keydown', onShortcut)
onBeforeUnmount(() => window.removeEventListener('keydown', onShortcut))
</script>

<template>
  <a class="skip-link" href="#main-content">Skip to workspace</a>
  <div class="app-shell" :inert="searchOpen ? true : undefined">
    <AppHeader :category="activeCategory" @select-category="chooseCategory" @search="searchOpen = true" />
    <main id="main-content" class="app-main">
      <router-view v-slot="{ Component }">
        <ToolFrame v-if="currentTool" :tool="currentTool"><component :is="Component" /></ToolFrame>
        <component :is="Component" v-else />
      </router-view>
    </main>
    <RouteAnnouncer />
  </div>
  <SearchDialog :open="searchOpen" @close="searchOpen = false" />
</template>

<style scoped>
.app-shell { min-height: 100vh; }.skip-link { background: var(--accent); color: #fff; left: var(--space-3); padding: var(--space-2) var(--space-3); position: fixed; top: -60px; z-index: calc(var(--z-dialog) + 1); }.skip-link:focus { top: var(--space-3); }.app-main { margin: var(--space-6) auto; max-width: 1320px; padding: 0 var(--space-4) var(--space-8); } @media (max-width: 599px) { .app-main { margin: 0; padding: 0; } }
</style>
