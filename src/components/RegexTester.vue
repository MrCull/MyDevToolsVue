<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import CopyButton from './ui/CopyButton.vue'
import EmptyState from './ui/EmptyState.vue'
import FormField from './ui/FormField.vue'
import Panel from './ui/Panel.vue'
import ToolLayout from './ui/ToolLayout.vue'

interface MatchResult { index: number; value: string; captures: (string | undefined)[]; groups: Record<string, string | undefined> }
interface WorkerResult { id: number; matches?: MatchResult[]; replacement?: string; error?: string }

const pattern = ref('')
const text = ref('')
const replacement = ref('')
const enabledFlags = ref(new Set(['g']))
const matches = ref<MatchResult[]>([])
const replaced = ref('')
const error = ref('')
const timedOut = ref(false)
const waiting = ref(false)
let worker: Worker
let requestId = 0
let debounce: number | undefined
let timeout: number | undefined

const flags = computed(() => ['g', 'i', 'm', 's', 'u', 'y', 'd'].filter((flag) => enabledFlags.value.has(flag)).join(''))
const literal = computed(() => `/${pattern.value.replace(/\//g, '\\/')}/${flags.value}`)
const namedGroups = computed(() => [...new Set(matches.value.flatMap((match) => Object.keys(match.groups)))])
const captureCount = computed(() => Math.max(0, ...matches.value.map((match) => match.captures.length)))
const segments = computed(() => {
  const output: { text: string; marked: boolean }[] = []
  let cursor = 0
  for (const match of matches.value) {
    if (match.index > cursor) output.push({ text: text.value.slice(cursor, match.index), marked: false })
    if (match.value) output.push({ text: match.value, marked: true })
    cursor = Math.max(cursor, match.index + match.value.length)
  }
  if (cursor < text.value.length) output.push({ text: text.value.slice(cursor), marked: false })
  return output
})

const createWorker = () => {
  worker = new Worker(new URL('../workers/regex.worker.ts', import.meta.url), { type: 'module' })
  worker.onmessage = (event: MessageEvent<WorkerResult>) => {
    if (event.data.id !== requestId) return
    window.clearTimeout(timeout)
    waiting.value = false
    error.value = event.data.error ?? ''
    matches.value = event.data.matches ?? []
    replaced.value = event.data.replacement ?? ''
  }
}
const run = () => {
  window.clearTimeout(timeout)
  timedOut.value = false
  error.value = ''
  if (!pattern.value) { matches.value = []; replaced.value = text.value; waiting.value = false; return }
  waiting.value = true
  requestId += 1
  worker.postMessage({ id: requestId, pattern: pattern.value, flags: flags.value, text: text.value, replacement: replacement.value })
  timeout = window.setTimeout(() => {
    worker.terminate(); createWorker(); waiting.value = false; matches.value = []; replaced.value = ''; timedOut.value = true
  }, 1000)
}
const schedule = () => { window.clearTimeout(debounce); debounce = window.setTimeout(run, 150) }
const toggleFlag = (flag: string, checked: boolean) => {
  const next = new Set(enabledFlags.value)
  if (checked) next.add(flag)
  else next.delete(flag)
  enabledFlags.value = next
}

createWorker()
watch([pattern, text, replacement, flags], schedule)
onBeforeUnmount(() => { window.clearTimeout(debounce); window.clearTimeout(timeout); worker.terminate() })
</script>

<template>
  <ToolLayout variant="editor">
    <Panel title="Pattern">
      <div class="pattern-row">
        <span>/</span><input v-model="pattern" class="field field--mono" data-test-id="regex-pattern" aria-label="Regular expression pattern"><span>/</span>
        <label v-for="flag in ['g', 'i', 'm', 's', 'u', 'y', 'd']" :key="flag" class="flag"><input type="checkbox" :checked="enabledFlags.has(flag)" :data-test-id="`regex-flag-${flag}`" @change="toggleFlag(flag, ($event.target as HTMLInputElement).checked)">{{ flag }}</label>
      </div>
      <code class="literal">{{ literal }}</code>
      <div v-if="error" class="alert" data-test-id="regex-error">{{ error }}</div>
      <div v-if="timedOut" class="alert" data-test-id="regex-timeout">Pattern timed out — possible catastrophic backtracking</div>
    </Panel>
    <Panel title="Test text">
      <div class="editor">
        <pre class="mirror" data-test-id="regex-highlight"><template v-for="(segment, index) in segments" :key="index"><mark v-if="segment.marked">{{ segment.text }}</mark><template v-else>{{ segment.text }}</template></template></pre>
        <textarea v-model="text" class="field field--mono editor__input" data-test-id="regex-test-input" aria-label="Text to test" />
      </div>
    </Panel>
    <Panel title="Matches">
      <p v-if="waiting">Matching…</p>
      <p data-test-id="regex-match-count">{{ matches.length }} match{{ matches.length === 1 ? '' : 'es' }}</p>
      <p v-if="matches.length === 1000" class="note">Showing first 1,000 matches.</p>
      <div v-if="matches.length" class="table-wrap">
        <table data-test-id="regex-match-table"><thead><tr><th>#</th><th>Match</th><th>Position</th><th v-for="index in captureCount" :key="index">Group {{ index }}</th><th v-for="name in namedGroups" :key="name">{{ name }}</th></tr></thead>
          <tbody><tr v-for="(match, index) in matches" :key="`${match.index}-${index}`"><td>{{ index + 1 }}</td><td>{{ match.value }}</td><td>{{ match.index }}</td><td v-for="captureIndex in captureCount" :key="captureIndex">{{ match.captures[captureIndex - 1] }}</td><td v-for="name in namedGroups" :key="name">{{ match.groups[name] }}</td></tr></tbody>
        </table>
      </div>
      <EmptyState v-else data-test-id="regex-placeholder">Matches will appear here</EmptyState>
    </Panel>
    <Panel title="Replace preview">
      <FormField label="Replacement" for-id="regex-replace"><input id="regex-replace" v-model="replacement" class="field field--mono" data-test-id="regex-replace-input"></FormField>
      <pre class="output" data-test-id="regex-replace-output">{{ replaced }}</pre>
      <CopyButton :text="replaced" :disabled="!replaced" />
    </Panel>
    <details><summary>Regular expression cheat sheet</summary><code>. any character · \d digit · \w word · ^ start · $ end · ( ) capture · [ ] character set</code></details>
  </ToolLayout>
</template>

<style scoped>
.pattern-row { display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap; font-family: var(--font-mono); }
.pattern-row > .field { flex: 1 1 16rem; }
.flag { display: inline-flex; gap: var(--space-1); align-items: center; }
.literal, .note { display: block; margin-top: var(--space-3); color: var(--fg-muted); }
.alert { margin-top: var(--space-3); padding: var(--space-3); border: 1px solid var(--danger); color: var(--danger); }
.editor { position: relative; min-height: 12rem; }
.mirror, .editor__input { box-sizing: border-box; width: 100%; min-height: 12rem; margin: 0; padding: var(--space-3); font: var(--text-sm)/1.6 var(--font-mono); white-space: pre-wrap; overflow-wrap: break-word; }
.mirror { position: absolute; inset: 0; overflow: hidden; color: var(--fg); }
.mirror mark { background: var(--accent-soft); color: inherit; }
.editor__input { position: relative; resize: vertical; color: transparent; caret-color: var(--fg); background: transparent; }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: var(--space-2); border-bottom: 1px solid var(--line); text-align: left; font-family: var(--font-mono); }
.output { min-height: 4rem; padding: var(--space-3); white-space: pre-wrap; overflow-wrap: anywhere; border: 1px solid var(--line); }
</style>
