<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ToolIcon from './components/ToolIcon.vue'
import ToolPageFrame from './components/ToolPageFrame.vue'
import { toolCategories, tools, toolsByCategory } from './toolRegistry'

const route = useRoute()
const isMenuOpen = ref(false)
const theme = ref<'light' | 'dark'>('dark')
const currentTool = computed(() => tools.find((tool) => tool.path === route.path))
const applyTheme = () => { document.body.dataset.theme = theme.value }
const toggleTheme = () => { theme.value = theme.value === 'dark' ? 'light' : 'dark'; localStorage.setItem('theme', theme.value); applyTheme() }
const closeMenu = () => { isMenuOpen.value = false }
const onKeydown = (event: KeyboardEvent) => { if (event.key === 'Escape') closeMenu() }

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  theme.value = savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark'
  applyTheme()
  window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
watch(() => route.fullPath, closeMenu)
</script>

<template>
  <div class="app-shell">
    <aside id="primary-navigation" class="sidebar" :class="{ 'is-open': isMenuOpen }" aria-label="Primary navigation">
      <div class="brand-row">
        <router-link to="/" class="brand" @click="closeMenu"><span class="brand-mark" aria-hidden="true">&lt;/&gt;</span><span>MyDevTools</span></router-link>
        <button class="mobile-close" type="button" aria-label="Close navigation" @click="closeMenu">×</button>
      </div>
      <nav class="tool-nav" aria-label="Developer tools">
        <section v-for="category in toolCategories" :key="category" class="nav-group">
          <h2>{{ category }}</h2>
          <router-link v-for="tool in toolsByCategory(category)" :key="tool.id" :to="tool.path" class="nav-link" active-class="is-active" @click="closeMenu">
            <ToolIcon :icon="tool.icon" :label="tool.name" /><span>{{ tool.shortName }}</span>
          </router-link>
        </section>
      </nav>
      <div class="sidebar-footer">
        <a class="utility-link" href="https://www.blazor.mydevtools.org"><span aria-hidden="true">↗</span> Blazor version</a>
        <button class="theme-button" type="button" :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`" :aria-pressed="theme === 'dark'" @click="toggleTheme">
          <span aria-hidden="true">{{ theme === 'dark' ? '☼' : '◐' }}</span><span>{{ theme === 'dark' ? 'Light mode' : 'Dark mode' }}</span><span class="theme-state">{{ theme }}</span>
        </button>
      </div>
    </aside>
    <div v-if="isMenuOpen" class="drawer-backdrop" aria-hidden="true" @click="closeMenu"></div>
    <div class="content-column">
      <header class="mobile-header">
        <router-link to="/" class="brand" aria-label="MyDevTools dashboard"><span class="brand-mark" aria-hidden="true">&lt;/&gt;</span><span>MyDevTools</span></router-link>
        <button class="menu-button" type="button" aria-controls="primary-navigation" :aria-expanded="isMenuOpen" aria-label="Open navigation" @click="isMenuOpen = true"><span></span><span></span><span></span></button>
      </header>
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <ToolPageFrame v-if="currentTool" :tool="currentTool"><component :is="Component" /></ToolPageFrame>
          <component :is="Component" v-else />
        </router-view>
      </main>
    </div>
  </div>
</template>

<style>
:root { --font-sans: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; --font-mono: "SFMono-Regular", Consolas, "Liberation Mono", monospace; --sidebar-width: 244px; }
body[data-theme='dark'] { --body-bg: #0b1120; --surface-raised: #111a2d; --surface-muted: #172238; --surface-hover: #192640; --container-bg: #111a2d; --nav-bg: #0d1526; --nav-text: #dbe5f5; --text-strong: #f2f6ff; --text-muted: #9ba9c0; --text-faint: #70809a; --border-color: #273650; --primary-color: #818cf8; --primary-hover: #a5b4fc; --accent-text: #a5b4fc; --accent-soft: #202d55; --accent-border: #3c4f87; --button-bg: #202d43; --button-text: #e4ebf7; --button-hover: #2b3a56; --focus-ring: rgba(129, 140, 248, 0.34); --shadow-sm: 0 8px 22px rgba(0, 0, 0, 0.18); }
body[data-theme='light'] { --body-bg: #f5f7fb; --surface-raised: #ffffff; --surface-muted: #f0f3f8; --surface-hover: #f8faff; --container-bg: #ffffff; --nav-bg: #ffffff; --nav-text: #26334a; --text-strong: #17233a; --text-muted: #59677d; --text-faint: #75829a; --border-color: #dce3ee; --primary-color: #4f46e5; --primary-hover: #4338ca; --accent-text: #4f46e5; --accent-soft: #eef0ff; --accent-border: #c8ceff; --button-bg: #eef1f6; --button-text: #253249; --button-hover: #e1e6ee; --focus-ring: rgba(79, 70, 229, 0.24); --shadow-sm: 0 8px 22px rgba(31, 42, 68, 0.08); }
.app-shell { background: var(--body-bg); color: var(--nav-text); display: flex; min-height: 100vh; }.sidebar { background: var(--nav-bg); border-right: 1px solid var(--border-color); display: flex; flex-direction: column; height: 100vh; left: 0; overflow: hidden; position: fixed; top: 0; width: var(--sidebar-width); z-index: 20; }.brand-row { align-items: center; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; min-height: 74px; padding: 0 20px; }.brand { align-items: center; color: var(--text-strong); display: inline-flex; font-size: 1rem; font-weight: 750; gap: 9px; letter-spacing: -0.03em; text-decoration: none; }.brand-mark { align-items: center; background: var(--primary-color); border-radius: 7px; color: #fff; display: inline-flex; font: 700 0.67rem var(--font-mono); height: 26px; justify-content: center; width: 31px; }.tool-nav { flex: 1; overflow-y: auto; padding: 16px 10px; }.nav-group + .nav-group { margin-top: 21px; }.nav-group h2 { color: var(--text-faint); font: 700 0.64rem/1 var(--font-mono); letter-spacing: 0.1em; margin: 0 9px 7px; text-transform: uppercase; }.nav-link, .utility-link, .theme-button { align-items: center; border-radius: 8px; color: var(--text-muted); display: flex; font-size: 0.85rem; gap: 9px; min-height: 38px; padding: 5px 9px; text-align: left; text-decoration: none; transition: background-color 150ms ease, color 150ms ease; }.nav-link .tool-icon { background: transparent; border-color: transparent; color: var(--text-faint); height: 26px; min-width: 26px; }.nav-link:hover, .utility-link:hover, .theme-button:hover { background: var(--surface-hover); color: var(--text-strong); }.nav-link.is-active { background: var(--accent-soft); color: var(--accent-text); font-weight: 650; }.nav-link.is-active .tool-icon { color: var(--accent-text); }.sidebar-footer { border-top: 1px solid var(--border-color); padding: 10px; }.utility-link, .theme-button { border: 0; box-sizing: border-box; cursor: pointer; font-family: var(--font-sans); width: 100%; }.theme-button { background: transparent; }.theme-state { color: var(--text-faint); font: 0.64rem var(--font-mono); margin-left: auto; text-transform: uppercase; }.content-column { margin-left: var(--sidebar-width); min-width: 0; width: calc(100% - var(--sidebar-width)); }.main-content { display: flex; min-height: 100vh; }.main-content > * { min-width: 0; }.mobile-header, .mobile-close, .menu-button, .drawer-backdrop { display: none; }
@media (max-width: 767px) { .sidebar { box-shadow: var(--shadow-sm); transform: translateX(-105%); transition: transform 190ms ease; width: min(300px, 86vw); }.sidebar.is-open { transform: translateX(0); }.drawer-backdrop { background: rgba(5, 11, 23, 0.56); display: block; inset: 0; position: fixed; z-index: 10; }.content-column { margin-left: 0; width: 100%; }.mobile-header { align-items: center; background: var(--nav-bg); border-bottom: 1px solid var(--border-color); display: flex; height: 60px; justify-content: space-between; padding: 0 16px; position: sticky; top: 0; z-index: 9; }.menu-button, .mobile-close { align-items: center; background: transparent; border: 1px solid var(--border-color); border-radius: 7px; color: var(--text-strong); cursor: pointer; display: inline-flex; height: 38px; justify-content: center; width: 40px; }.menu-button { flex-direction: column; gap: 4px; }.menu-button span { background: currentColor; height: 2px; width: 17px; }.mobile-close { font-size: 1.6rem; }.main-content { min-height: calc(100vh - 60px); } }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; transition-duration: 0.01ms !important; } }
</style>
