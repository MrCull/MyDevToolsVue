<script setup lang="ts">
import { computed, ref } from 'vue'
import { recordsToDelimited } from '../utils/csv'
import { mulberry32 } from '../utils/prng'
import AppButton from './ui/AppButton.vue'
import CopyButton from './ui/CopyButton.vue'
import EmptyState from './ui/EmptyState.vue'
import FormField from './ui/FormField.vue'
import Panel from './ui/Panel.vue'
import ToolLayout from './ui/ToolLayout.vue'

const loremWords = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ')
const firstNames = ['Alex', 'Avery', 'Blake', 'Casey', 'Drew', 'Emery', 'Finley', 'Harper', 'Jordan', 'Kai', 'Morgan', 'Quinn', 'Riley', 'Rowan', 'Sam', 'Taylor']
const lastNames = ['Adams', 'Bennett', 'Chen', 'Diaz', 'Evans', 'Foster', 'Garcia', 'Hughes', 'Ivanov', 'Jones', 'Khan', 'Lee', 'Martin', 'Nguyen', 'Owens', 'Patel']
const cities = ['Austin', 'Boston', 'Chicago', 'Denver', 'Lisbon', 'London', 'Oslo', 'Paris', 'Sydney', 'Tokyo']
const countries = ['Australia', 'Brazil', 'Canada', 'France', 'Germany', 'Japan', 'Norway', 'Portugal', 'United Kingdom', 'United States']
const fieldOptions = [
  ['id', 'ID'], ['firstName', 'First name'], ['lastName', 'Last name'], ['fullName', 'Full name'], ['email', 'Email'], ['username', 'Username'], ['phone', 'Phone'], ['street', 'Street'], ['city', 'City'], ['country', 'Country'], ['postcode', 'Postcode'], ['company', 'Company'], ['dateOfBirth', 'Date of birth'], ['uuid', 'UUID'], ['boolean', 'Boolean'], ['integer', 'Integer'],
] as const

const mode = ref<'lorem' | 'records'>('lorem')
const loremUnit = ref<'paragraphs' | 'sentences' | 'words'>('paragraphs')
const count = ref(3)
const classic = ref(true)
const selected = ref(['id', 'fullName', 'email'])
const rows = ref(5)
const format = ref<'json' | 'csv' | 'sql'>('json')
const tableName = ref('users')
const seed = ref(42)
const output = ref('')
const extension = computed(() => mode.value === 'lorem' ? 'txt' : format.value)
const choose = <T,>(values: T[], random: () => number) => values[Math.floor(random() * values.length)]
const sentence = (random: () => number, words = 10) => Array.from({ length: words }, () => choose(loremWords, random)).join(' ').replace(/^./, (letter) => letter.toUpperCase()) + '.'
const generateLorem = (random: () => number) => {
  let result: string
  if (loremUnit.value === 'words') result = Array.from({ length: count.value }, () => choose(loremWords, random)).join(' ')
  else if (loremUnit.value === 'sentences') result = Array.from({ length: count.value }, () => sentence(random, 8 + Math.floor(random() * 9))).join(' ')
  else result = Array.from({ length: count.value }, () => Array.from({ length: 4 }, () => sentence(random, 8 + Math.floor(random() * 9))).join(' ')).join('\n\n')
  if (classic.value) result = `Lorem ipsum dolor sit amet${result ? ` ${result.replace(/^lorem ipsum dolor sit amet\s*/i, '')}` : ''}`
  return result
}
const uuid = (random: () => number) => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
  const value = Math.floor(random() * 16)
  return (character === 'x' ? value : (value & 3) | 8).toString(16)
})
const makeRecords = (random: () => number) => Array.from({ length: rows.value }, (_, index) => {
  const firstName = choose(firstNames, random), lastName = choose(lastNames, random)
  const values: Record<string, unknown> = {
    id: index + 1, firstName, lastName, fullName: `${firstName} ${lastName}`,
    email: `${firstName}.${lastName}${Math.floor(random() * 100)}@example.${choose(['com', 'org', 'net'], random)}`.toLowerCase(),
    username: `${firstName}${lastName}${Math.floor(random() * 100)}`.toLowerCase(), phone: `555-01${String(Math.floor(random() * 100)).padStart(2, '0')}`,
    street: `${1 + Math.floor(random() * 999)} ${choose(lastNames, random)} Street`, city: choose(cities, random), country: choose(countries, random), postcode: String(10000 + Math.floor(random() * 90000)),
    company: `${choose(lastNames, random)} ${choose(['Labs', 'Works', 'Studio', 'Systems'], random)}`, dateOfBirth: `${1950 + Math.floor(random() * 55)}-${String(1 + Math.floor(random() * 12)).padStart(2, '0')}-${String(1 + Math.floor(random() * 28)).padStart(2, '0')}`,
    uuid: uuid(random), boolean: random() >= 0.5, integer: Math.floor(random() * 1001),
  }
  return Object.fromEntries(selected.value.map((key) => [key, values[key]]))
})
const sqlValue = (value: unknown) => typeof value === 'number' ? String(value) : typeof value === 'boolean' ? (value ? 'TRUE' : 'FALSE') : `'${String(value).replace(/'/g, "''")}'`
const generate = () => {
  const random = mulberry32(Number(seed.value) || 0)
  if (mode.value === 'lorem') output.value = generateLorem(random)
  else {
    const records = makeRecords(random)
    if (format.value === 'json') output.value = JSON.stringify(records, null, 2)
    else if (format.value === 'csv') output.value = recordsToDelimited(records)
    else {
      const columns = selected.value.join(', ')
      output.value = records.map((record) => `INSERT INTO ${tableName.value || 'records'} (${columns}) VALUES (${selected.value.map((key) => sqlValue(record[key])).join(', ')});`).join('\n')
    }
  }
}
const randomizeSeed = () => { seed.value = Math.floor(Math.random() * 2147483647) }
const download = () => {
  const url = URL.createObjectURL(new Blob([output.value], { type: 'text/plain;charset=utf-8' }))
  const link = document.createElement('a'); link.href = url; link.download = `fake-data.${extension.value}`; link.click(); URL.revokeObjectURL(url)
}
</script>

<template>
  <ToolLayout variant="split">
    <Panel title="Options">
      <FormField label="Mode" for-id="fake-mode"><select id="fake-mode" v-model="mode" class="field" data-test-id="fakedata-mode"><option value="lorem">Lorem ipsum</option><option value="records">Records</option></select></FormField>
      <template v-if="mode === 'lorem'">
        <FormField label="Unit" for-id="lorem-unit"><select id="lorem-unit" v-model="loremUnit" class="field" data-test-id="fakedata-lorem-unit"><option value="paragraphs">Paragraphs</option><option value="sentences">Sentences</option><option value="words">Words</option></select></FormField>
        <FormField label="Count" for-id="lorem-count"><input id="lorem-count" v-model.number="count" class="field" type="number" min="1" max="50" data-test-id="fakedata-lorem-count"></FormField>
        <label class="checkbox"><input v-model="classic" type="checkbox" data-test-id="fakedata-lorem-classic"> Start with Lorem ipsum dolor sit amet</label>
      </template>
      <template v-else>
        <fieldset><legend>Fields</legend><label v-for="option in fieldOptions" :key="option[0]" class="checkbox"><input v-model="selected" type="checkbox" :value="option[0]" :data-test-id="`fakedata-field-${option[0]}`"> {{ option[1] }}</label></fieldset>
        <FormField label="Rows" for-id="fake-rows"><input id="fake-rows" v-model.number="rows" class="field" type="number" min="1" max="1000" data-test-id="fakedata-rows"></FormField>
        <FormField label="Format" for-id="fake-format"><select id="fake-format" v-model="format" class="field" data-test-id="fakedata-format"><option value="json">JSON</option><option value="csv">CSV</option><option value="sql">SQL INSERT</option></select></FormField>
        <FormField v-if="format === 'sql'" label="Table name" for-id="fake-table"><input id="fake-table" v-model="tableName" class="field field--mono" data-test-id="fakedata-table-name"></FormField>
      </template>
      <FormField label="Seed" for-id="fake-seed"><div class="seed-row"><input id="fake-seed" v-model.number="seed" class="field" type="number" data-test-id="fakedata-seed"><AppButton data-test-id="fakedata-random-seed" aria-label="Random seed" @click="randomizeSeed">Randomize</AppButton></div></FormField>
      <AppButton variant="primary" :disabled="mode === 'records' && !selected.length" data-test-id="fakedata-generate" @click="generate">Generate</AppButton>
    </Panel>
    <Panel title="Output">
      <template v-if="output"><pre class="output field--mono" data-test-id="fakedata-output">{{ output }}</pre><div class="u-action-bar"><CopyButton :text="output" data-test-id="fakedata-copy" /><AppButton data-test-id="fakedata-download" @click="download">Download</AppButton></div></template>
      <EmptyState v-else data-test-id="fakedata-placeholder">Generated data will appear here</EmptyState>
    </Panel>
  </ToolLayout>
</template>

<style scoped>
.form-field, fieldset { margin-bottom: var(--space-4); }
fieldset { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-2); border: 1px solid var(--line); padding: var(--space-3); }
.seed-row { display: flex; gap: var(--space-2); }
.seed-row .field { flex: 1; }
.output { max-height: 34rem; overflow: auto; padding: var(--space-3); border: 1px solid var(--line); white-space: pre-wrap; overflow-wrap: anywhere; }
@media (max-width: 30rem) { fieldset { grid-template-columns: 1fr; } }
</style>
