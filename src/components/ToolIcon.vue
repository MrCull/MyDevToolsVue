<script setup lang="ts">
defineProps<{ icon: string; label: string }>()
</script>

<template>
  <span class="tool-icon" aria-hidden="true">{{ icon }}</span>
  <span class="sr-only">{{ label }}</span>
</template>

<style scoped>
.tool-icon {
  align-items: center;
  background: var(--accent-soft);
  border: 1px solid var(--accent-border);
  border-radius: 8px;
  color: var(--accent-text);
  display: inline-flex;
  flex: 0 0 auto;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 700;
  height: 28px;
  justify-content: center;
  letter-spacing: -0.04em;
  min-width: 28px;
  padding: 0 5px;
}
</style>
