<template>
  <section class="not-found">
    <h1 tabindex="-1">Page not found</h1>
    <p>The tool or page you requested does not exist.</p>
    <router-link class="btn btn--primary" to="/">Return to all tools</router-link>
  </section>
</template>

<style scoped>
.not-found { margin: var(--space-8) auto; max-width: 620px; padding: var(--space-8); }
.not-found h1 { font-family: var(--font-ui); }
.not-found p { color: var(--fg-muted); }
</style>
