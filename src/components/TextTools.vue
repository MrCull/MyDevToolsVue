<script setup lang="ts">
import { computed, ref } from 'vue'
import CopyButton from './ui/CopyButton.vue'
import EmptyState from './ui/EmptyState.vue'
import Panel from './ui/Panel.vue'
import ResultRow from './ui/ResultRow.vue'
import ToolLayout from './ui/ToolLayout.vue'

const input = ref('')
const previous = ref<string | null>(null)
const natural = ref(false)
const words = computed(() => input.value.trim() ? input.value.trim().split(/\s+/u).length : 0)
const bytes = computed(() => new TextEncoder().encode(input.value).length)
const tokens = computed(() => input.value
  .replace(/([a-z\d])([A-Z])/g, '$1 $2')
  .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
  .split(/[\s_.-]+/u).filter(Boolean).map(value => value.toLocaleLowerCase()))
const capitalise = (value: string) => value ? value[0].toLocaleUpperCase() + value.slice(1) : ''
const conversions = computed(() => {
  const t = tokens.value
  const spaced = t.join(' ')
  return {
    camel: t.map((v, i) => i ? capitalise(v) : v).join(''), pascal: t.map(capitalise).join(''),
    snake: t.join('_'), constant: t.join('_').toLocaleUpperCase(), kebab: t.join('-'),
    title: t.map(capitalise).join(' '), sentence: capitalise(spaced), lower: input.value.toLocaleLowerCase(), upper: input.value.toLocaleUpperCase(),
  }
})
const apply = (operation: (lines: string[]) => string[]) => { previous.value = input.value; input.value = operation(input.value.split('\n')).join('\n') }
const sortLines = (descending = false) => apply(lines => [...lines].sort((a, b) => {
  const result = natural.value ? new Intl.Collator(undefined, { numeric: true }).compare(a, b) : a.localeCompare(b)
  return descending ? -result : result
}))
const undo = () => { if (previous.value === null) return; const value = input.value; input.value = previous.value; previous.value = value }
</script>

<template>
  <ToolLayout variant="stack">
    <Panel title="Text">
      <textarea v-model="input" class="field field--mono input" placeholder="Paste or type text" data-test-id="text-input" />
      <div class="stats" aria-label="Text statistics">
        <span data-test-id="text-stat-chars"><b>{{ input.length }}</b> characters</span><span><b>{{ input.replace(/\s/gu, '').length }}</b> without spaces</span>
        <span data-test-id="text-stat-words"><b>{{ words }}</b> words</span><span data-test-id="text-stat-lines"><b>{{ input ? input.split('\n').length : 0 }}</b> lines</span><span><b>{{ bytes }}</b> bytes</span>
      </div>
    </Panel>
    <Panel title="Case conversions">
      <div v-if="input" class="case-grid">
        <ResultRow v-for="item in ([['camel','camelCase'],['pascal','PascalCase'],['snake','snake_case'],['constant','CONSTANT_CASE'],['kebab','kebab-case'],['title','Title Case'],['sentence','Sentence case'],['lower','lower'],['upper','UPPER']] as const)" :key="item[0]" :value="conversions[item[0]]" :data-test-id="`text-case-${item[0]}`"><span class="case-label">{{ item[1] }}</span><CopyButton :text="conversions[item[0]]" /></ResultRow>
      </div>
      <EmptyState v-else data-test-id="text-placeholder">Enter text to see case conversions</EmptyState>
    </Panel>
    <Panel title="Line operations">
      <div class="operations">
        <button class="btn" type="button" data-test-id="text-line-sort" @click="sortLines()">Sort A→Z</button><button class="btn" type="button" @click="sortLines(true)">Sort Z→A</button>
        <button class="btn" type="button" data-test-id="text-line-reverse" @click="apply(lines => lines.reverse())">Reverse</button><button class="btn" type="button" data-test-id="text-line-dedupe" @click="apply(lines => [...new Set(lines)])">Dedupe</button>
        <button class="btn" type="button" @click="apply(lines => lines.map(line => line.trim()))">Trim each</button><button class="btn" type="button" @click="apply(lines => lines.filter(line => line.trim()))">Remove empty</button>
        <button class="btn" type="button" @click="apply(lines => lines.map(value => ({ value, order: Math.random() })).sort((a,b) => a.order-b.order).map(item => item.value))">Shuffle</button>
        <label class="natural"><input v-model="natural" class="checkbox" type="checkbox" data-test-id="text-natural-sort"> Natural sort</label>
        <button class="btn" type="button" :disabled="previous === null" data-test-id="text-undo" @click="undo">Undo</button>
      </div>
    </Panel>
  </ToolLayout>
</template>

<style scoped>
.input{min-height:180px;resize:vertical}.stats{display:flex;flex-wrap:wrap;gap:var(--space-2) var(--space-5);margin-top:var(--space-3);color:var(--fg-muted);font:var(--text-sm)/1.4 var(--font-body)}.stats b{color:var(--fg);font-family:var(--font-mono)}
.case-grid{display:grid;gap:var(--space-2);grid-template-columns:repeat(2,minmax(0,1fr))}.case-label{color:var(--fg-muted);font-size:var(--text-xs);margin-right:auto}.operations{align-items:center;display:flex;flex-wrap:wrap;gap:var(--space-2)}.natural{align-items:center;display:flex;gap:var(--space-2);font-family:var(--font-ui)}
@media(max-width:640px){.case-grid{grid-template-columns:1fr}}
</style>
