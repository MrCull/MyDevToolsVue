<script setup lang="ts">
import AppIcon from '../AppIcon.vue'
import { useTheme } from '../../composables/useTheme'

const { mode, cycleTheme } = useTheme()
</script>

<template>
  <button class="header-icon" type="button" :aria-label="`Theme: ${mode}. Activate to change.`" data-test-id="theme-toggle" @click="cycleTheme">
    <AppIcon :name="mode === 'dark' ? 'moon' : mode === 'light' ? 'sun' : 'monitor'" />
  </button>
</template>
