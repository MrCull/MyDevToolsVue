<script setup lang="ts">
import { computed } from 'vue'
import { iconPaths, type IconName } from '../icons'

const props = defineProps<{ name: IconName; label?: string }>()
const paths = computed(() => iconPaths[props.name])
</script>

<template>
  <svg class="app-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" :role="label ? 'img' : undefined" :aria-hidden="label ? undefined : true" :aria-label="label">
    <path v-for="path in paths" :key="path" :d="path" />
  </svg>
</template>

<style scoped>
.app-icon { display: block; flex: none; height: 1.15em; width: 1.15em; }
</style>
