<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { toolById } from '../../toolRegistry'
const route = useRoute()
const message = computed(() => toolById(route.meta.toolId)?.name ?? (route.name === 'home' ? 'All developer tools' : 'Page not found'))
</script>
<template><p class="sr-only" aria-live="polite" aria-atomic="true">{{ message }}</p></template>
