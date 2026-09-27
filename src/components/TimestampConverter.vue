<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import CopyButton from './ui/CopyButton.vue'
import EmptyState from './ui/EmptyState.vue'
import FormField from './ui/FormField.vue'
import Panel from './ui/Panel.vue'
import ResultRow from './ui/ResultRow.vue'
import ToolLayout from './ui/ToolLayout.vue'

type Unit = 'auto' | 's' | 'ms' | 'us' | 'ns'
const now = ref(Date.now())
const timer = window.setInterval(() => { now.value = Date.now() }, 1000)
onUnmounted(() => window.clearInterval(timer))

const timestamp = ref('')
const unit = ref<Unit>('auto')
const dateInput = ref('')
const dateText = ref('')
const detectedUnit = computed<Exclude<Unit, 'auto'>>(() => {
  const digits = timestamp.value.trim().replace(/^[-+]/, '').replace(/\..*$/, '').length
  if (digits <= 10) return 's'
  if (digits <= 13) return 'ms'
  if (digits <= 16) return 'us'
  return 'ns'
})
const unitLabel = computed(() => ({ s: 'seconds', ms: 'milliseconds', us: 'microseconds', ns: 'nanoseconds' })[detectedUnit.value])
const timestampResult = computed(() => {
  if (!timestamp.value.trim()) return null
  const numeric = Number(timestamp.value)
  if (!Number.isFinite(numeric)) return { error: 'Enter a valid numeric timestamp.' }
  const selected = unit.value === 'auto' ? detectedUnit.value : unit.value
  const millis = selected === 's' ? numeric * 1000 : selected === 'ms' ? numeric : selected === 'us' ? numeric / 1000 : numeric / 1_000_000
  const date = new Date(millis)
  if (Number.isNaN(date.getTime())) return { error: 'That timestamp is outside the supported date range.' }
  const formatter = new Intl.DateTimeFormat(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', second: '2-digit', timeZoneName: 'short',
  })
  const delta = millis - now.value
  const abs = Math.abs(delta)
  const [amount, relativeUnit] = abs >= 86_400_000 ? [delta / 86_400_000, 'day'] : abs >= 3_600_000 ? [delta / 3_600_000, 'hour'] : abs >= 60_000 ? [delta / 60_000, 'minute'] : [delta / 1000, 'second']
  return {
    iso: date.toISOString(),
    rfc: date.toUTCString(),
    local: formatter.format(date),
    relative: new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' }).format(Math.round(amount), relativeUnit as Intl.RelativeTimeFormatUnit),
  }
})
const parsedDate = computed(() => {
  const value = dateText.value.trim() || dateInput.value
  if (!value) return null
  const millis = Date.parse(value)
  return Number.isNaN(millis) ? { error: 'Enter a valid date or date/time.' } : { seconds: Math.floor(millis / 1000), millis }
})
</script>

<template>
  <ToolLayout variant="stack">
    <Panel title="Now">
      <div class="results-grid">
        <ResultRow :value="Math.floor(now / 1000)" data-test-id="timestamp-now-seconds"><span class="label">Seconds</span><CopyButton :text="String(Math.floor(now / 1000))" /></ResultRow>
        <ResultRow :value="now" data-test-id="timestamp-now-ms"><span class="label">Milliseconds</span><CopyButton :text="String(now)" /></ResultRow>
      </div>
    </Panel>
    <div class="converter-grid">
      <Panel title="Timestamp to date">
        <FormField label="Unix timestamp" for-id="timestamp-input"><input id="timestamp-input" v-model="timestamp" class="field field--mono" inputmode="decimal" data-test-id="timestamp-input"></FormField>
        <div class="unit-row">
          <span>Detected: {{ unitLabel }}</span>
          <label>Unit override <select v-model="unit" class="field" data-test-id="timestamp-unit"><option value="auto">Auto</option><option value="s">Seconds</option><option value="ms">Milliseconds</option><option value="us">Microseconds</option><option value="ns">Nanoseconds</option></select></label>
        </div>
        <div v-if="timestampResult && !timestampResult.error" class="result-list">
          <ResultRow :value="timestampResult.iso!" data-test-id="timestamp-iso"><CopyButton :text="timestampResult.iso!" /></ResultRow>
          <ResultRow :value="timestampResult.rfc!" data-test-id="timestamp-rfc" />
          <ResultRow :value="timestampResult.local!" data-test-id="timestamp-local" />
          <ResultRow :value="timestampResult.relative!" data-test-id="timestamp-relative" />
        </div>
        <div v-else-if="timestampResult?.error" class="alert" data-test-id="timestamp-error">{{ timestampResult.error }}</div>
        <EmptyState v-else data-test-id="timestamp-placeholder">Enter a timestamp to see its date</EmptyState>
      </Panel>
      <Panel title="Date to timestamp">
        <FormField label="Local date and time" for-id="timestamp-date-input"><input id="timestamp-date-input" v-model="dateInput" type="datetime-local" class="field" data-test-id="timestamp-date-input" @input="dateText = ''"></FormField>
        <FormField label="Or enter a date" for-id="timestamp-date-text"><input id="timestamp-date-text" v-model="dateText" class="field" placeholder="Thu, 01 Jan 2026 00:00:00 GMT" data-test-id="timestamp-date-text" @input="dateInput = ''"></FormField>
        <div v-if="parsedDate && !parsedDate.error" class="result-list">
          <ResultRow :value="parsedDate.seconds!" data-test-id="timestamp-date-seconds"><CopyButton :text="String(parsedDate.seconds)" /></ResultRow>
          <ResultRow :value="parsedDate.millis!" data-test-id="timestamp-date-ms"><CopyButton :text="String(parsedDate.millis)" /></ResultRow>
        </div>
        <div v-else-if="parsedDate?.error" class="alert">{{ parsedDate.error }}</div>
        <EmptyState v-else>Choose or enter a date</EmptyState>
      </Panel>
    </div>
  </ToolLayout>
</template>

<style scoped>
.converter-grid,.results-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-4)}
.unit-row{align-items:end;color:var(--fg-muted);display:flex;font:var(--text-sm)/1.4 var(--font-body);justify-content:space-between;margin:var(--space-3) 0}.unit-row label{display:grid;gap:var(--space-1)}
.result-list{display:grid;gap:var(--space-2);margin-top:var(--space-3)}.label{color:var(--fg-muted);font-size:var(--text-xs);margin-right:auto}
.form-field+.form-field{margin-top:var(--space-3)}
@media(max-width:760px){.converter-grid,.results-grid{grid-template-columns:1fr}.unit-row{align-items:stretch;flex-direction:column;gap:var(--space-2)}}
</style>
