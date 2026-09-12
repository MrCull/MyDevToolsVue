<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'primary' | 'secondary'; disabled?: boolean }>(), { variant: 'secondary', disabled: false })
</script>
<template><button class="btn" :class="{ 'btn--primary': variant === 'primary' }" type="button" :disabled="disabled"><slot /></button></template>
