<script setup lang="ts">
defineProps<{ value: string | number }>()
</script>
<template><div class="result-row" data-test-id="result-row"><span data-test-id="result-value">{{ value }}</span><slot /></div></template>
