<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'split' | 'editor' | 'stack' }>(), { variant: 'stack' })
</script>
<template><div class="tool-layout" :class="`tool-layout--${variant}`"><slot /></div></template>
