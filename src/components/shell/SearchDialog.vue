<script setup lang="ts">
import { nextTick, ref, toRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '../AppIcon.vue'
import { filterTools } from '../../toolRegistry'
import { useFocusTrap } from '../../composables/useFocusTrap'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
const root = ref<HTMLElement | null>(null)
const search = ref('')
const input = ref<HTMLInputElement | null>(null)
const router = useRouter()
const results = () => filterTools(search.value)
const close = () => emit('close')
const navigate = (path: string) => { router.push(path); close() }
useFocusTrap(toRef(props, 'open'), root, close)
watch(() => props.open, async (open) => { if (open) { search.value = ''; await nextTick(); input.value?.focus() } })
</script>

<template>
  <Teleport to="body"><div v-if="open" ref="root" class="search-dialog" role="dialog" aria-modal="true" aria-label="Search developer tools"><button class="search-dialog__backdrop" aria-label="Close search" @click="close" /><div class="search-dialog__panel"><label><span class="sr-only">Search developer tools</span><AppIcon name="search" /><input ref="input" v-model="search" type="search" placeholder="Search tools" @keydown.enter="results()[0] && navigate(results()[0].path)" /></label><ul><li v-for="tool in results()" :key="tool.id"><button type="button" @click="navigate(tool.path)" @pointerenter="tool.loader()"><AppIcon :name="tool.icon" /><span><strong>{{ tool.name }}</strong><small>{{ tool.description }}</small></span></button></li></ul><p v-if="!results().length">No tools match that search.</p></div></div></Teleport>
</template>

<style scoped>
.search-dialog { inset: 0; position: fixed; z-index: var(--z-dialog); }.search-dialog__backdrop { background: rgb(0 0 0 / 52%); border: 0; inset: 0; position: absolute; width: 100%; }.search-dialog__panel { background: var(--bg-surface); border: 1px solid var(--line); border-radius: var(--radius-md); box-shadow: var(--shadow-2); left: 50%; max-height: min(620px, calc(100vh - 64px)); overflow: auto; position: absolute; top: 72px; transform: translateX(-50%); width: min(680px, calc(100vw - 32px)); }.search-dialog label { align-items: center; border-bottom: 1px solid var(--line); display: flex; gap: var(--space-3); padding: var(--space-4); }.search-dialog input { background: transparent; border: 0; color: var(--fg); font: 600 var(--text-lg) var(--font-ui); min-width: 0; outline: 0; width: 100%; }.search-dialog ul { list-style: none; margin: 0; padding: var(--space-2); }.search-dialog li button { align-items: center; background: transparent; border: 0; color: var(--fg); cursor: pointer; display: flex; gap: var(--space-3); padding: var(--space-3); text-align: left; width: 100%; }.search-dialog li button:hover { background: var(--bg-hover); }.search-dialog small { color: var(--fg-muted); display: block; margin-top: 3px; }.search-dialog p { color: var(--fg-muted); padding: var(--space-4); text-align: center; }
</style>
