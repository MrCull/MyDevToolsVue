<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
defineProps<{ title?: string }>()
</script>
<template><section class="panel"><h2 v-if="title" class="panel__title">{{ title }}</h2><slot /></section></template>
