<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import CopyButton from './ui/CopyButton.vue'
import EmptyState from './ui/EmptyState.vue'
import Panel from './ui/Panel.vue'
import ToolLayout from './ui/ToolLayout.vue'
import { decodeBase64, decodeBase64Url, encodeBase64, encodeBase64Url } from '../utils/base64'

type Mode = 'base64' | 'base64url' | 'component' | 'url' | 'html'
type Direction = 'encode' | 'decode'

const mode = ref<Mode>('base64')
const direction = ref<Direction>('encode')
const input = ref('')
const fileOutput = ref('')
const fileError = ref('')

const encodeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const decodeHtml = (value: string) => {
  const textarea = document.createElement('textarea')
  textarea.innerHTML = value
  return textarea.value
}

const transformed = computed(() => {
  if (!input.value) return { output: '', error: '' }
  try {
    const encoding = direction.value === 'encode'
    const output = {
      base64: () => encoding ? encodeBase64(input.value) : decodeBase64(input.value),
      base64url: () => encoding ? encodeBase64Url(input.value) : decodeBase64Url(input.value),
      component: () => encoding ? encodeURIComponent(input.value) : decodeURIComponent(input.value),
      url: () => encoding ? encodeURI(input.value) : decodeURI(input.value),
      html: () => encoding ? encodeHtml(input.value) : decodeHtml(input.value),
    }[mode.value]()
    return { output, error: '' }
  } catch (error) {
    return { output: '', error: error instanceof Error ? error.message : 'Unable to transform input' }
  }
})

const output = computed(() => fileOutput.value || transformed.value.output)
const error = computed(() => fileError.value || transformed.value.error)

watch([input, mode, direction], () => {
  fileOutput.value = ''
  fileError.value = ''
})

const setDirection = (next: Direction) => { direction.value = next }
const swap = () => {
  if (!output.value) return
  const previousOutput = output.value
  direction.value = direction.value === 'encode' ? 'decode' : 'encode'
  input.value = previousOutput
}

const readFile = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  fileOutput.value = ''
  fileError.value = ''
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    fileError.value = 'File must be 5 MB or smaller'
    return
  }
  const reader = new FileReader()
  reader.onload = () => { fileOutput.value = String(reader.result ?? '') }
  reader.onerror = () => { fileError.value = 'Unable to read file' }
  reader.readAsDataURL(file)
}
</script>

<template>
  <ToolLayout variant="split">
    <Panel title="Input">
      <div class="controls">
        <label>Mode
          <select v-model="mode" class="field" data-test-id="encode-mode">
            <option value="base64">Base64</option><option value="base64url">Base64URL</option>
            <option value="component">URL component</option><option value="url">Full URL</option>
            <option value="html">HTML entities</option>
          </select>
        </label>
        <div class="u-action-bar">
          <button class="btn" type="button" :aria-pressed="direction === 'encode'" data-test-id="encode-direction-encode" @click="setDirection('encode')">Encode</button>
          <button class="btn" type="button" :aria-pressed="direction === 'decode'" data-test-id="encode-direction-decode" @click="setDirection('decode')">Decode</button>
          <button class="btn" type="button" :disabled="!output" data-test-id="encode-swap" @click="swap">Swap</button>
        </div>
      </div>
      <textarea v-model="input" class="field field--mono input" placeholder="Enter text to transform" data-test-id="encode-input" />
      <label class="file-label">File to data URI (maximum 5 MB)
        <input type="file" class="field" data-test-id="encode-file" @change="readFile">
      </label>
    </Panel>
    <Panel title="Output">
      <div v-if="error" class="alert" data-test-id="encode-error">{{ error }}</div>
      <template v-else-if="output">
        <pre class="output field--mono" data-test-id="encode-output">{{ output }}</pre>
        <CopyButton :text="output" data-test-id="encode-copy" />
      </template>
      <EmptyState v-else data-test-id="encode-placeholder">Transformed output will appear here.</EmptyState>
    </Panel>
  </ToolLayout>
</template>

<style scoped>
.controls, label, .file-label { display: grid; gap: var(--space-2); }
.controls { margin-bottom: var(--space-3); }
.input { min-height: 240px; resize: vertical; }
.file-label { color: var(--fg-muted); font-size: var(--text-sm); margin-top: var(--space-3); }
.output { background: var(--bg-field); border: 1px solid var(--line); margin: 0 0 var(--space-3); min-height: 240px; overflow-wrap: anywhere; padding: var(--space-3); white-space: pre-wrap; }
.alert { margin-bottom: var(--space-3); }
</style>
