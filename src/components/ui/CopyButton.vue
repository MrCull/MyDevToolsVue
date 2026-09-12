<script setup lang="ts">
import { ref } from 'vue'
const props = defineProps<{ text: string; disabled?: boolean }>()
const copied = ref(false)
const copy = async () => { await navigator.clipboard.writeText(props.text); copied.value = true; window.setTimeout(() => { copied.value = false }, 1200) }
</script>
<template><button class="btn" type="button" :disabled="disabled" @click="copy">{{ copied ? 'Copied' : 'Copy' }}</button></template>
