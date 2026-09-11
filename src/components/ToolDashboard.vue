<script setup lang="ts">
import { computed, ref } from 'vue'
import { toolCategories, tools, type ToolCategory } from '../toolRegistry'
import ToolIcon from './ToolIcon.vue'

const search = ref('')
const normalizedSearch = computed(() => search.value.trim().toLowerCase())
const visibleTools = computed(() => {
  if (!normalizedSearch.value) return tools
  return tools.filter((tool) =>
    [tool.name, tool.shortName, tool.description, tool.category, ...tool.keywords]
      .join(' ')
      .toLowerCase()
      .includes(normalizedSearch.value),
  )
})

const toolsInCategory = (category: ToolCategory) => visibleTools.value.filter((tool) => tool.category === category)
</script>

<template>
  <section class="dashboard" aria-labelledby="dashboard-title">
    <header class="dashboard-hero">
      <p class="eyebrow">MYDEVTOOLS / WORKSPACE</p>
      <h1 id="dashboard-title">Developer tools, ready when you are.</h1>
      <p>Fast, focused utilities for the small jobs that keep your work moving.</p>
      <label class="tool-search" for="tool-search">
        <span class="search-symbol" aria-hidden="true">⌕</span>
        <span class="sr-only">Search developer tools</span>
        <input id="tool-search" v-model="search" data-test-id="tool-search" type="search" placeholder="Search tools, formats, or tasks" autocomplete="off" />
        <kbd aria-hidden="true">/</kbd>
      </label>
    </header>

    <div v-if="visibleTools.length" class="tool-sections">
      <section v-for="category in toolCategories" :key="category" v-show="toolsInCategory(category).length" class="tool-category" :aria-labelledby="`${category}-heading`">
        <div class="category-heading">
          <h2 :id="`${category}-heading`">{{ category }}</h2>
          <span>{{ toolsInCategory(category).length }} tools</span>
        </div>
        <div class="tool-grid">
          <router-link v-for="tool in toolsInCategory(category)" :key="tool.id" :to="tool.path" class="tool-card" :data-test-id="`tool-card-${tool.id}`">
            <ToolIcon :icon="tool.icon" :label="tool.name" />
            <span class="tool-card-content">
              <strong>{{ tool.name }}</strong>
              <span>{{ tool.description }}</span>
            </span>
            <span class="card-arrow" aria-hidden="true">→</span>
          </router-link>
        </div>
      </section>
    </div>
    <div v-else class="no-results" data-test-id="no-search-results" role="status">
      <span aria-hidden="true">⌕</span>
      <h2>No tools found</h2>
      <p>Try another name, category, or keyword.</p>
      <button type="button" @click="search = ''">Clear search</button>
    </div>
  </section>
</template>

<style scoped>
.dashboard { max-width: 1320px; margin: 0 auto; padding: 56px clamp(20px, 5vw, 72px) 80px; width: 100%; }
.dashboard-hero { max-width: 720px; }
.eyebrow { color: var(--accent-text); font: 700 0.74rem/1 var(--font-mono); letter-spacing: 0.12em; margin: 0 0 18px; }
h1 { color: var(--text-strong); font-size: clamp(2.15rem, 4.8vw, 4.35rem); letter-spacing: -0.055em; line-height: 1.03; margin: 0; max-width: 690px; }
.dashboard-hero > p:not(.eyebrow) { color: var(--text-muted); font-size: 1.08rem; line-height: 1.65; margin: 20px 0 30px; max-width: 580px; }
.tool-search { align-items: center; background: var(--surface-raised); border: 1px solid var(--border-color); border-radius: 12px; box-shadow: var(--shadow-sm); display: flex; gap: 12px; max-width: 610px; padding: 0 13px; }
.tool-search:focus-within { border-color: var(--primary-color); box-shadow: 0 0 0 3px var(--focus-ring); }
.tool-search input { background: transparent; border: 0; color: var(--text-strong); font: inherit; height: 52px; min-width: 0; outline: 0; width: 100%; }
.tool-search input::placeholder { color: var(--text-faint); }
.search-symbol { color: var(--text-muted); font-size: 1.5rem; }
kbd { background: var(--surface-muted); border: 1px solid var(--border-color); border-radius: 5px; color: var(--text-muted); font: 0.73rem var(--font-mono); padding: 2px 6px; }
.tool-sections { margin-top: 64px; }
.tool-category + .tool-category { margin-top: 48px; }
.category-heading { align-items: baseline; display: flex; justify-content: space-between; margin-bottom: 16px; }
.category-heading h2 { color: var(--text-strong); font-size: 1.05rem; font-weight: 700; letter-spacing: -0.02em; margin: 0; }
.category-heading span { color: var(--text-faint); font: 0.72rem var(--font-mono); }
.tool-grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
.tool-card { align-items: flex-start; background: var(--surface-raised); border: 1px solid var(--border-color); border-radius: 12px; color: inherit; display: flex; gap: 13px; min-height: 112px; padding: 18px; text-decoration: none; transition: border-color 160ms ease, background-color 160ms ease, box-shadow 160ms ease; }
.tool-card:hover { background: var(--surface-hover); border-color: var(--accent-border); box-shadow: var(--shadow-sm); }
.tool-card:focus-visible { outline: 3px solid var(--focus-ring); outline-offset: 2px; }
.tool-card-content { display: grid; gap: 6px; }
.tool-card strong { color: var(--text-strong); font-size: 0.94rem; }
.tool-card-content > span { color: var(--text-muted); font-size: 0.82rem; line-height: 1.45; }
.card-arrow { color: var(--text-faint); margin-left: auto; }
.no-results { align-items: center; border: 1px dashed var(--border-color); border-radius: 12px; color: var(--text-muted); display: flex; flex-direction: column; margin-top: 60px; padding: 72px 20px; text-align: center; }
.no-results > span { color: var(--accent-text); font-size: 2rem; }.no-results h2 { color: var(--text-strong); font-size: 1.1rem; margin: 12px 0 4px; }.no-results p { margin: 0 0 20px; }.no-results button { background: transparent; border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-strong); cursor: pointer; min-height: 38px; padding: 0 12px; }
@media (max-width: 640px) { .dashboard { padding-top: 36px; }.tool-grid { grid-template-columns: 1fr; }.tool-sections { margin-top: 44px; }.tool-category + .tool-category { margin-top: 36px; } }
</style>
