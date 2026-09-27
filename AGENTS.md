# MyDevTools Vue

MyDevTools is a static Vue 3 + TypeScript collection of browser-only developer utilities. It has no backend, API, or secrets. `localStorage` is limited to the theme preference and the To Do list.

## Commands

```sh
npm run build       # type-check + production build
npm run lint        # eslint . --fix
npm run test:e2e    # preview the built app and run Cypress
```

## Architecture

- `src/toolRegistry.ts` is the single source of truth for tool metadata, paths, category membership, icons, search, and lazy component loaders.
- Routes use named lazy loaders and `route.meta.toolId`; never look up a tool by comparing raw paths.
- `App.vue` owns the attached-tabs shell. New shell UI belongs in `components/shell/`; shared presentational primitives belong in `components/ui/` or `assets/ui.css`.
- Theme tokens live in `assets/tokens.css` and `assets/theme.css`. The resolved theme is an attribute on `<html>` and the preference is stored as `dark`, `light`, or `system` under `theme`.
- Tool SFCs retain their behavior and test hooks. Every element Cypress touches must have a `data-test-id`; preserve `v-if` output/placeholder swaps and native disabled controls.

## Styling

- Use the Oxide/Zinc token layer. Do not add `.dark-mode`, global override sheets, or `!important` styling.
- Use Archivo for UI, IBM Plex Sans for content, and IBM Plex Mono for code through the defined font tokens.
- Controls are native elements styled with shared classes. Avoid wrapper components around inputs, selects, and textareas.
- Keep component CSS scoped unless there is a deliberate global primitive in `assets/`.

## Before finishing

Run `npm run build`, then `npm run test:e2e` for behavior changes. Check light/dark themes and a narrow mobile viewport for shell or tool layout work.

## Editing files

- Never write source files with Windows PowerShell 5.1 `Set-Content`, `Out-File`, or `>`; these commands can reinterpret UTF-8 as ANSI or add a BOM. Use editor tools or Node/Git for scripted edits. `npm run build` runs `check:encoding` and fails on garbled text.
