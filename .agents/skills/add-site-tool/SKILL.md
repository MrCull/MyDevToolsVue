---
name: add-site-tool
description: "Scaffold or extend a browser-only developer tool page in MyDevTools Vue using its current registry, shared UI primitives, theme tokens, and interaction conventions."
---

# Add a MyDevTools tool page

Use this skill when adding a utility page to this repository. First read the repository's `AGENTS.md` and inspect the current registry, shared UI, and one nearby tool page; treat the code as the source of truth if conventions have changed.

## Register the tool

- Add one entry to `src/toolRegistry.ts`. It is the source for the tool id, path, visible names, description, category, icon, search keywords, and lazy loader.
- Point `loader` to a named dynamic import of the new SFC under `src/components/`, for example `() => import('./components/MyTool.vue')`.
- `src/router/index.ts` builds named routes and `route.meta.toolId` from the registry. Do not add a parallel route or compare raw paths elsewhere.
- Use an existing category and icon where possible. If the tool needs a new icon, add its path to `src/icons.ts`; `IconName` is derived from that map. Only add a category when the existing four categories cannot describe the tool, and then update the registry category type, category list, and label together.

## Build the page

Create `src/components/<ToolName>.vue` with `<script setup lang="ts">`. The shell's `ToolFrame` already renders the tool heading, icon, category, and description from registry metadata. The page component should render the working area, not another visible page heading.

Prefer the shared primitives in `src/components/ui/`:

- `ToolLayout` for stacked or split work areas; `variant="split"` becomes one column on narrow screens.
- `Panel` for grouped input and output sections.
- `FormField` for a visible label around a native input, select, or textarea.
- `AppButton`, `ResultRow`, `CopyButton`, and `EmptyState` for common actions and output states.

Use the classes in `src/assets/ui.css`: `.field`, `.field--mono`, `.btn`, `.btn--primary`, `.u-action-bar`, and `.checkbox`. Keep inputs, selects, and textareas as native elements; do not wrap them in new control components. A simple tool can follow this shape:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import AppButton from './ui/AppButton.vue'
import EmptyState from './ui/EmptyState.vue'
import FormField from './ui/FormField.vue'
import Panel from './ui/Panel.vue'
import ResultRow from './ui/ResultRow.vue'
import ToolLayout from './ui/ToolLayout.vue'

const input = ref('')
const output = ref('')
const run = () => { output.value = input.value.trim() }
</script>

<template>
  <ToolLayout variant="split">
    <Panel title="Input">
      <FormField label="Text" for-id="tool-input">
        <textarea id="tool-input" v-model="input" class="field field--mono" data-test-id="tool-input" />
      </FormField>
      <div class="u-action-bar">
        <AppButton variant="primary" :disabled="!input.trim()" data-test-id="run-btn" @click="run">Run</AppButton>
      </div>
    </Panel>
    <Panel title="Output">
      <ResultRow v-if="output" :value="output" />
      <EmptyState v-else data-test-id="placeholder-message">The result will appear here</EmptyState>
    </Panel>
  </ToolLayout>
</template>
```

Use `ref`/`computed` for page state and keep the feature browser-only. The app has no backend, and `localStorage` is currently reserved for the theme and To Do list; keep a new tool's state in memory unless the project architecture is intentionally changed. Keep component-specific CSS scoped. Use the defined `--bg-*`, `--fg-*`, `--line`, `--accent`, spacing, radius, and font tokens from `src/assets/tokens.css` and `src/assets/theme.css`; do not add `.dark-mode`, hard-coded theme overrides, or `!important`. Put a style in `src/assets/ui.css` only when it is a deliberate reusable primitive.

## Preserve behavior and testability

- Add a stable, descriptive `data-test-id` to every interactive or stateful element Cypress needs to find. Keep ids unique within the page and use predictable names such as `tool-input`, `run-btn`, `tool-output`, and `placeholder-message`.
- Keep output and its empty placeholder as explicit conditional states (`v-if`/`v-else`) when the tool has no result yet. Bind real native `disabled` attributes when an action is unavailable.
- Include clear, error, copy, or validation states when the tool's behavior calls for them. Keep computations deterministic where possible so end-to-end checks can assert useful results.
- For behavior changes, add a focused spec under `cypress/e2e/components/` that covers the main interaction and important empty/error/disabled states. Follow the repository `AGENTS.md` validation instructions. For layout changes, inspect both themes and a narrow mobile viewport.
