<script setup lang="ts">
defineProps<{ label: string; forId?: string }>()
</script>
<template><label class="form-field" :for="forId"><span>{{ label }}</span><slot /></label></template>
