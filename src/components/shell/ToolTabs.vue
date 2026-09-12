<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { toolsByCategory, type ToolCategory } from '../../toolRegistry'
import AppIcon from '../AppIcon.vue'

const props = defineProps<{ category: ToolCategory }>()
const route = useRoute()
const scroller = ref<HTMLElement | null>(null)
const atStart = ref(true)
const atEnd = ref(true)
const tabs = computed(() => toolsByCategory(props.category))
const updateEdges = () => { const el = scroller.value; if (!el) return; atStart.value = el.scrollLeft < 2; atEnd.value = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 }
watch(() => route.meta.toolId, async () => { await nextTick(); scroller.value?.querySelector<HTMLElement>('[aria-current="page"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' }); updateEdges() })
</script>

<template>
  <nav class="tool-tabs" :class="{ 'at-start': atStart, 'at-end': atEnd }" aria-label="Tools in category">
    <div ref="scroller" class="tool-tabs__scroll" @scroll="updateEdges">
      <router-link v-for="tool in tabs" :key="tool.id" :to="tool.path" class="tool-tab" :aria-current="route.meta.toolId === tool.id ? 'page' : undefined" @pointerenter="tool.loader()">
        <AppIcon :name="tool.icon" /><span>{{ tool.shortName }}</span>
      </router-link>
    </div>
  </nav>
</template>

<style scoped>
.tool-tabs { background: var(--bg-tabstrip); overflow: hidden; position: relative; }.tool-tabs::before, .tool-tabs::after { bottom: 0; content: ''; height: 1px; position: absolute; width: var(--space-4); z-index: 2; }.tool-tabs::before { background: var(--line); left: 0; }.tool-tabs::after { background: var(--line); right: 0; }
.tool-tabs__scroll { display: flex; overflow-x: auto; scrollbar-width: none; }.tool-tabs__scroll::-webkit-scrollbar { display: none; }
.tool-tab { align-items: center; border: 1px solid transparent; border-bottom-color: var(--line); color: var(--fg-muted); display: flex; flex: none; font: 700 var(--text-xs)/1 var(--font-ui); gap: 6px; min-height: 42px; padding: 0 var(--space-3); position: relative; text-decoration: none; }.tool-tab:hover { background: var(--bg-hover); color: var(--fg); }.tool-tab[aria-current='page'] { background: var(--bg-surface); border-color: var(--line); border-bottom-color: var(--bg-surface); color: var(--fg); }.tool-tab[aria-current='page']::before { background: var(--accent); content: ''; height: 2px; left: 0; position: absolute; right: 0; top: -1px; }
@media (max-width: 599px) { .tool-tab { min-height: 44px; } }
</style>
