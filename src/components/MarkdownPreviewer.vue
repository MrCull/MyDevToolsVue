<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import AppButton from './ui/AppButton.vue'
import CopyButton from './ui/CopyButton.vue'
import EmptyState from './ui/EmptyState.vue'
import FormField from './ui/FormField.vue'
import Panel from './ui/Panel.vue'
import ToolLayout from './ui/ToolLayout.vue'

const source = ref('')
const html = ref('')
const input = ref<HTMLTextAreaElement>()
const preview = ref<HTMLElement>()
const rows = ref(2)
const columns = ref(2)
let timer = 0

const renderMarkdown = (value: string) => {
  const escaped = value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const lines = escaped.split(/\r?\n/)
  const output: string[] = []
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    if (/^\|.*\|$/.test(line) && /^\|(?:\s*:?-+:?\s*\|)+$/.test(lines[index + 1] ?? '')) {
      const headers = line.slice(1, -1).split('|').map((cell) => cell.trim())
      const rows: string[][] = []; index += 2
      while (index < lines.length && /^\|.*\|$/.test(lines[index])) { rows.push(lines[index].slice(1, -1).split('|').map((cell) => cell.trim())); index += 1 }
      index -= 1; output.push(`<table><thead><tr>${headers.map((cell) => `<th>${cell}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table>`); continue
    }
    const heading = /^(#{1,6})\s+(.+)$/.exec(line)
    if (heading) { const level = heading[1].length; output.push(`<h${level}>${heading[2]}</h${level}>`) }
    else if (/^&gt; /.test(line)) output.push(`<blockquote>${line.slice(5)}</blockquote>`)
    else if (/^- \[[ x]\]/i.test(line)) output.push(`<p><input type="checkbox" disabled ${/^- \[x\]/i.test(line) ? 'checked' : ''}> ${line.slice(6)}</p>`)
    else if (line) output.push(`<p>${line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/~~(.+?)~~/g, '<del>$1</del>').replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')}</p>`)
  }
  return output.join('')
}
const sanitizeRawHtml = (value: string) => {
  const parser = new DOMParser(); const document = parser.parseFromString(`<body>${value}</body>`, 'text/html')
  document.querySelectorAll('script,iframe,object,embed').forEach((node) => node.remove())
  document.querySelectorAll('*').forEach((node) => [...node.attributes].forEach((attribute) => { if (/^on/i.test(attribute.name) || /^(?:javascript|data):/i.test(attribute.value)) node.removeAttribute(attribute.name) }))
  return document.body.innerHTML
}

watch(source, (value) => {
  window.clearTimeout(timer)
  timer = window.setTimeout(() => { html.value = sanitizeRawHtml(renderMarkdown(value) + (value.includes('<') ? value : '')) }, 100)
}, { immediate: true })
onBeforeUnmount(() => window.clearTimeout(timer))

const sample = '# Markdown sample\n\n- [x] Task\n- [ ] Next\n\n| Name | Value |\n| --- | --- |\n| One | **Bold** |\n\n> Quote\n\n~~Removed~~ and [a link](https://example.com).\n\n```ts\nconst ready = true\n```'
const table = computed(() => {
  const count = Math.max(1, columns.value)
  const header = `| ${Array.from({ length: count }, (_, index) => `Column ${index + 1}`).join(' | ')} |`
  const divider = `| ${Array.from({ length: count }, () => '---').join(' | ')} |`
  const body = Array.from({ length: Math.max(1, rows.value) }, () => `| ${Array.from({ length: count }, () => '').join(' | ')} |`).join('\n')
  return `${header}\n${divider}\n${body}`
})
const insertTable = async () => {
  const start = input.value?.selectionStart ?? source.value.length
  source.value = `${source.value.slice(0, start)}${table.value}${source.value.slice(start)}`
  await nextTick(); input.value?.focus()
}
const syncScroll = () => {
  if (!input.value || !preview.value) return
  const ratio = input.value.scrollTop / Math.max(1, input.value.scrollHeight - input.value.clientHeight)
  preview.value.scrollTop = ratio * Math.max(0, preview.value.scrollHeight - preview.value.clientHeight)
}
</script>

<template>
  <ToolLayout variant="split">
    <Panel title="Markdown">
      <FormField label="Source" for-id="markdown-input">
        <textarea id="markdown-input" ref="input" v-model="source" class="field field--mono editor" data-test-id="markdown-input" @scroll="syncScroll" />
      </FormField>
      <div class="u-action-bar">
        <CopyButton :text="source" data-test-id="markdown-copy-md" />
        <AppButton data-test-id="markdown-sample" @click="source = sample">Load sample</AppButton>
        <AppButton data-test-id="markdown-clear" :disabled="!source" @click="source = ''">Clear</AppButton>
      </div>
      <details class="table-helper">
        <summary>Insert table</summary>
        <label>Rows <input v-model.number="rows" class="field" type="number" min="1" max="20" data-test-id="markdown-table-rows" /></label>
        <label>Columns <input v-model.number="columns" class="field" type="number" min="1" max="10" data-test-id="markdown-table-cols" /></label>
        <AppButton data-test-id="markdown-table-insert" @click="insertTable">Insert</AppButton>
      </details>
    </Panel>
    <Panel title="Preview">
      <!-- eslint-disable-next-line vue/no-v-html -- sanitized by DOMPurify above -->
      <div v-if="html" ref="preview" class="markdown-body" data-test-id="markdown-preview" v-html="html" />
      <EmptyState v-else data-test-id="markdown-placeholder">Enter Markdown to preview it.</EmptyState>
      <CopyButton v-if="html" :text="html" data-test-id="markdown-copy-html" />
    </Panel>
  </ToolLayout>
</template>

<style scoped>
.editor,.markdown-body{min-height:28rem;max-height:60vh;overflow:auto}.markdown-body{font-family:var(--font-content);line-height:1.65}.markdown-body :deep(pre),.markdown-body :deep(code){font-family:var(--font-mono);background:var(--bg-pane)}.markdown-body :deep(pre){overflow:auto;padding:var(--space-4)}.markdown-body :deep(table){border-collapse:collapse;width:100%}.markdown-body :deep(th),.markdown-body :deep(td){border:1px solid var(--line);padding:var(--space-2)}.markdown-body :deep(blockquote){border-left:3px solid var(--accent);margin-left:0;padding-left:var(--space-4)}.table-helper{margin-top:var(--space-4)}.table-helper label{display:inline-grid;gap:var(--space-1);margin:var(--space-3) var(--space-3) var(--space-3) 0}.table-helper .field{width:6rem}
</style>
