<script setup lang="ts">
import { computed, ref } from 'vue'
import { isFlatRecordArray, parseData, serializeData, type DataFormat } from '../utils/dataFormats'
import AppButton from './ui/AppButton.vue'
import CopyButton from './ui/CopyButton.vue'
import EmptyState from './ui/EmptyState.vue'
import FormField from './ui/FormField.vue'
import Panel from './ui/Panel.vue'
import ToolLayout from './ui/ToolLayout.vue'

const formats: { value: DataFormat; label: string }[] = [
  { value: 'json', label: 'JSON' }, { value: 'yaml', label: 'YAML' }, { value: 'csv', label: 'CSV' }, { value: 'tsv', label: 'TSV' }, { value: 'xml', label: 'XML' },
]
const from = ref<DataFormat>('json')
const to = ref<DataFormat>('yaml')
const input = ref('')
const output = ref('')
const error = ref('')
const warning = ref('')
const indent = ref<'2' | '4' | '\t'>('2')
const csvHeader = ref(true)
const parsed = ref<unknown>()
const showTable = ref(false)
const tableRows = computed(() => isFlatRecordArray(parsed.value) ? parsed.value.slice(0, 500) : [])
const tableColumns = computed(() => [...new Set(tableRows.value.flatMap((row) => Object.keys(row)))])

const convert = () => {
  error.value = ''; warning.value = ''; output.value = ''; parsed.value = undefined; showTable.value = false
  if (!input.value.trim()) return
  if (new TextEncoder().encode(input.value).length > 5 * 1024 * 1024) warning.value = 'Large inputs may take a moment to convert.'
  try {
    parsed.value = parseData(from.value, input.value, csvHeader.value)
    output.value = serializeData(to.value, parsed.value, indent.value === '\t' ? '\t' : Number(indent.value))
    if ((to.value === 'csv' || to.value === 'tsv') && JSON.stringify(parsed.value).match(/[\[{]/)) warning.value = 'Nested values are serialized as JSON in cells.'
  } catch (caught) {
    error.value = `${from.value.toUpperCase()}: ${caught instanceof Error ? caught.message : String(caught)}`
  }
}
const swap = () => {
  if (output.value) input.value = output.value
  const previous = from.value; from.value = to.value; to.value = previous
  output.value = ''; parsed.value = undefined; error.value = ''; showTable.value = false
}
</script>

<template>
  <div class="toolbar panel">
    <FormField label="From" for-id="dataconvert-from"><select id="dataconvert-from" v-model="from" class="field" data-test-id="dataconvert-from"><option v-for="format in formats" :key="format.value" :value="format.value">{{ format.label }}</option></select></FormField>
    <AppButton data-test-id="dataconvert-swap" :disabled="!output" @click="swap">Swap</AppButton>
    <FormField label="To" for-id="dataconvert-to"><select id="dataconvert-to" v-model="to" class="field" data-test-id="dataconvert-to"><option v-for="format in formats" :key="format.value" :value="format.value">{{ format.label }}</option></select></FormField>
    <FormField label="Indent" for-id="dataconvert-indent"><select id="dataconvert-indent" v-model="indent" class="field" data-test-id="dataconvert-indent"><option value="2">2 spaces</option><option value="4">4 spaces</option><option value="\t">Tab</option></select></FormField>
    <AppButton variant="primary" data-test-id="dataconvert-convert" :disabled="!input.trim()" @click="convert">Convert</AppButton>
  </div>
  <label v-if="from === 'csv' || from === 'tsv'" class="checkbox"><input v-model="csvHeader" type="checkbox" data-test-id="dataconvert-csv-header" /> First row is header</label>
  <p v-if="error" class="alert" data-test-id="dataconvert-error">{{ error }}</p>
  <p v-if="warning" class="alert" data-test-id="dataconvert-warning">{{ warning }}</p>
  <ToolLayout variant="split">
    <Panel title="Input"><textarea v-model="input" class="field field--mono editor" data-test-id="dataconvert-input" /></Panel>
    <Panel title="Output">
      <div v-if="output">
        <div class="u-action-bar"><AppButton v-if="tableRows.length" data-test-id="dataconvert-table-tab" @click="showTable = !showTable">{{ showTable ? 'Text' : 'Table' }}</AppButton><CopyButton :text="output" data-test-id="dataconvert-copy" /></div>
        <table v-if="showTable" data-test-id="dataconvert-table"><thead><tr><th v-for="column in tableColumns" :key="column">{{ column }}</th></tr></thead><tbody><tr v-for="(row,index) in tableRows" :key="index"><td v-for="column in tableColumns" :key="column">{{ row[column] }}</td></tr></tbody></table>
        <textarea v-else class="field field--mono editor" readonly :value="output" data-test-id="dataconvert-output" />
      </div>
      <EmptyState v-else data-test-id="dataconvert-placeholder">Converted data will appear here.</EmptyState>
    </Panel>
  </ToolLayout>
</template>

<style scoped>
.toolbar{align-items:end;display:flex;flex-wrap:wrap;gap:var(--space-3);margin-bottom:var(--space-4)}.toolbar .form-field{min-width:9rem}.editor{min-height:26rem}table{border-collapse:collapse;width:100%}th,td{border:1px solid var(--line);padding:var(--space-2);text-align:left}td{font-family:var(--font-mono)}
</style>
