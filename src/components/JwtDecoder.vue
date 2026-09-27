<!-- eslint-disable vue/no-v-html -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
import CopyButton from './ui/CopyButton.vue'
import EmptyState from './ui/EmptyState.vue'
import Panel from './ui/Panel.vue'
import ToolLayout from './ui/ToolLayout.vue'
import { decodeBase64Url } from '../utils/base64'

hljs.registerLanguage('json', json)
const input = ref('')

const decoded = computed(() => {
  const token = input.value.trim().replace(/^Bearer\s+/i, '').replace(/\s/g, '')
  if (!token) return { empty: true, error: '' }
  const parts = token.split('.')
  if (parts.length !== 3 && parts.length !== 5) return { empty: false, error: 'Not a JWT' }
  try {
    const header = JSON.parse(decodeBase64Url(parts[0])) as Record<string, unknown>
    if (parts.length === 5) return { empty: false, error: '', header, headerText: JSON.stringify(header, null, 2), encrypted: true }
    const payload = JSON.parse(decodeBase64Url(parts[1])) as Record<string, unknown>
    return { empty: false, error: '', header, payload, headerText: JSON.stringify(header, null, 2), payloadText: JSON.stringify(payload, null, 2), signature: parts[2], encrypted: false }
  } catch {
    return { empty: false, error: 'Not a JWT' }
  }
})

const highlight = (value = '') => value ? hljs.highlight(value, { language: 'json' }).value : ''
const numericClaim = (name: 'exp' | 'iat' | 'nbf') => {
  const value = decoded.value.payload?.[name]
  return typeof value === 'number' ? value : undefined
}
const claimText = (name: 'exp' | 'iat' | 'nbf') => {
  const value = numericClaim(name)
  if (value === undefined) return ''
  const date = new Date(value * 1000)
  if (Number.isNaN(date.valueOf())) return String(value)
  const seconds = value - Math.floor(Date.now() / 1000)
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  const [amount, unit] = Math.abs(seconds) < 120 ? [seconds, 'second'] : Math.abs(seconds) < 7200 ? [Math.round(seconds / 60), 'minute'] : Math.abs(seconds) < 172800 ? [Math.round(seconds / 3600), 'hour'] : [Math.round(seconds / 86400), 'day']
  return `${date.toISOString()} (${formatter.format(amount, unit as Intl.RelativeTimeFormatUnit)})`
}
const status = computed(() => {
  if (!decoded.value.payload) return ''
  const now = Date.now() / 1000
  const nbf = numericClaim('nbf')
  const exp = numericClaim('exp')
  if (nbf !== undefined && now < nbf) return 'Not yet valid'
  if (exp !== undefined && now >= exp) return 'Expired'
  return 'Valid'
})
</script>

<template>
  <div class="jwt-tool">
    <p class="notice">Decoded locally. The token never leaves your browser. The signature is not verified.</p>
    <ToolLayout variant="split">
      <Panel title="Token">
        <textarea v-model="input" class="field field--mono token" placeholder="Paste a JWT or Bearer token" data-test-id="jwt-input" />
        <div v-if="decoded.error" class="alert" data-test-id="jwt-error">{{ decoded.error }}</div>
        <EmptyState v-else-if="decoded.empty" data-test-id="jwt-placeholder">Decoded token details will appear here.</EmptyState>
      </Panel>
      <div class="results">
        <Panel title="Header">
          <pre v-if="decoded.headerText" class="code" data-test-id="jwt-header-output"><code v-html="highlight(decoded.headerText)" /></pre>
          <EmptyState v-else>Header unavailable.</EmptyState>
          <div v-if="decoded.header" class="metadata"><span>alg: {{ decoded.header.alg ?? 'unknown' }}</span><span>typ: {{ decoded.header.typ ?? 'unknown' }}</span><strong v-if="decoded.header.alg === 'none'" class="warning">Unsigned token</strong></div>
        </Panel>
        <Panel title="Payload">
          <p v-if="decoded.encrypted" class="encrypted">The payload is encrypted (JWE) and cannot be decoded without a key.</p>
          <template v-else-if="decoded.payloadText">
            <div class="output-actions"><span class="status" :class="{ 'status--bad': status !== 'Valid' }" data-test-id="jwt-status">{{ status }}</span><CopyButton :text="decoded.payloadText" data-test-id="jwt-copy-payload" /></div>
            <pre class="code" data-test-id="jwt-payload-output"><code v-html="highlight(decoded.payloadText)" /></pre>
            <dl class="claims">
              <template v-if="numericClaim('exp') !== undefined"><dt>Expires</dt><dd data-test-id="jwt-claim-exp">{{ claimText('exp') }}</dd></template>
              <template v-if="numericClaim('iat') !== undefined"><dt>Issued</dt><dd data-test-id="jwt-claim-iat">{{ claimText('iat') }}</dd></template>
              <template v-if="numericClaim('nbf') !== undefined"><dt>Not before</dt><dd>{{ claimText('nbf') }}</dd></template>
            </dl>
          </template>
          <EmptyState v-else-if="!decoded.encrypted">Payload unavailable.</EmptyState>
        </Panel>
        <Panel v-if="decoded.signature" title="Signature"><code class="signature" data-test-id="jwt-signature-output">{{ decoded.signature }}</code></Panel>
      </div>
    </ToolLayout>
  </div>
</template>

<style scoped>
.jwt-tool, .results { display: grid; gap: var(--space-4); }
.notice { background: var(--bg-pane); border-left: 3px solid var(--accent); color: var(--fg-muted); margin: 0; padding: var(--space-3); }
.token { min-height: 300px; resize: vertical; }
.alert { margin-top: var(--space-3); }
.code { background: var(--bg-field); border: 1px solid var(--line); margin: 0; overflow: auto; padding: var(--space-3); white-space: pre-wrap; }
.metadata, .output-actions { align-items: center; display: flex; flex-wrap: wrap; gap: var(--space-3); margin-top: var(--space-3); }
.output-actions { justify-content: space-between; margin: 0 0 var(--space-3); }
.status { border: 1px solid var(--accent); border-radius: var(--radius-full); color: var(--accent); padding: var(--space-1) var(--space-2); }
.status--bad, .warning { border-color: var(--danger); color: var(--danger); }
.claims { display: grid; gap: var(--space-2); grid-template-columns: auto 1fr; margin-bottom: 0; }
.claims dt { color: var(--fg-muted); }.claims dd { margin: 0; overflow-wrap: anywhere; }
.signature { overflow-wrap: anywhere; }.encrypted { color: var(--fg-muted); }
</style>
