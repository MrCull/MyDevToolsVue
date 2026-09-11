# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project overview

MyDevTools (Vue version) — a static, client-side collection of developer utilities
(JSON/SQL/C# formatters, diff, hash, GUID, QR, cron, converters, etc.) deployed to
Azure Static Web Apps at [mydevtools.org](https://mydevtools.org). A parallel Blazor
implementation lives in a separate repo (`MrCull/MyDevTools`).

Everything runs in the browser. There is **no backend, no API, and no persistence**
beyond `localStorage` (used only for the theme preference and the To Do list). Do not
introduce server calls or secrets.

## Stack

- Vue 3 (`<script setup lang="ts">` SFCs) + TypeScript
- Vite 6 build, `vite-plugin-vue-devtools`
- vue-router 4 with `createWebHistory`
- Cypress 14 for end-to-end tests (the only test layer — there are no unit tests)
- ESLint 9 flat config + Prettier
- Notable deps: `sql-formatter`, `highlight.js`, `diff`, `qrcode.vue`

## Commands

```sh
npm install
npm run dev          # vite dev server
npm run build        # type-check + vite build  (run before opening a PR)
npm run type-check   # vue-tsc --build
npm run lint         # eslint . --fix
npm run format       # prettier --write src/
npm run preview      # serves dist/ on http://localhost:4173
npm run cy:run       # cypress run — requires preview to be running first
```

Cypress `baseUrl` is `http://localhost:4173`, i.e. it tests the **built** app, not the
dev server. The full local equivalent of CI is:

```sh
npx start-server-and-test preview http://localhost:4173 cy:run
```

## Layout

```
src/
  App.vue                 # shell: sidebar nav, hamburger menu, dark-mode toggle
  main.ts                 # createApp + router mount
  router/index.ts         # route table; '/' redirects to '/json'
  components/*.vue        # one SFC per tool, self-contained
  assets/base.css         # Vue starter palette
  assets/main.css         # #app layout
cypress/e2e/components/   # NN-<tool>.cy.js, one spec per tool
.github/workflows/        # Azure Static Web Apps build + test + deploy
staticwebapp.config.json  # SPA fallback rewrite to /index.html
```

## Conventions

**One tool = one self-contained SFC.** Each component owns its own markup, logic and
`<style scoped>`. There is no shared component library, no state store, and no utility
module — tools do not import from each other. Keep it that way unless the user asks for
a refactor.

**Adding a new tool** requires four edits:
1. `src/components/<Name>.vue`
2. A route in `src/router/index.ts`
3. A `<router-link>` in the nav in `src/App.vue` (emoji + short label, matching the
   existing entries)
4. A spec at `cypress/e2e/components/NN-<name>.cy.js`
Also add a bullet to the feature list in `README.md`.

**Test hooks.** Every interactive element that a test touches carries a
`data-test-id` attribute, and specs select with `[data-test-id=foo]` — never by class
or tag. Dynamic ids use the `:data-test-id="'copy-btn-' + value"` pattern. Add these
as you build the component, not afterwards.

**Placeholder/output pattern.** Most tools render `data-test-id=placeholder-message`
when empty and swap it for the output block with `v-if` / `v-else`. Specs assert the
placeholder is visible and the output `should('not.exist')`, so use `v-if`, not
`v-show` or CSS hiding.

**Dark mode** is a `dark-mode` class toggled on `<body>` from `App.vue`, persisted to
`localStorage` under `theme`. Because the class lives outside the component, scoped
styles target it as `.dark-mode .my-element { ... }` — the scope attribute still lands
on the descendant, so this works. Every new component needs dark-mode rules for any
element with an explicit background or text colour; theme colours come from the CSS
custom properties defined in `App.vue`'s unscoped `<style>` block (`--container-bg`,
`--nav-text`, `--border-color`, `--primary-color`, …).

**Formatting.** Prettier: no semicolons, single quotes, 100-column width.
`.editorconfig`: 2-space indent, LF, final newline. Existing SFCs are inconsistent
(several use 4-space indent and semicolons in `<script setup>`) — match the file you
are editing rather than reformatting it, and do not run `npm run format` across the
whole tree as part of an unrelated change; it produces huge unrelated diffs.

## Known quirks

- `App.vue` imports every tool component but never uses them in its template — the
  actual rendering goes through `<router-view>`. The imports are dead weight; leave
  them alone unless cleaning up deliberately.
- `src/components/Counter.vue` and `Weather.vue` are unused leftovers, not routed.
- `package.json` still carries the scaffold name `vue-counter-app`.
- The router has no catch-all 404 route; unknown paths render an empty `<router-view>`.
  SPA deep links work because `staticwebapp.config.json` rewrites to `/index.html`.
- Cypress runs with `supportFile: false`, so there are no custom commands or global
  hooks — each spec is standalone.

## CI / deployment

`.github/workflows/azure-static-web-apps-icy-dune-08280a403.yml` runs on pushes and PRs
to `main`: `npm ci` → `npm run build` → Cypress against the preview server, then deploys
`dist/` to Azure Static Web Apps. A failing build or failing spec blocks the deploy, so
make sure `npm run build` and the Cypress suite pass before pushing.

## Before finishing a change

1. `npm run type-check` (or `npm run build`) — clean
2. `npm run lint` — clean
3. Cypress specs relevant to the touched tool pass against `npm run preview`
4. Check the change in both light and dark mode, and at mobile width (<768px, where the
   nav collapses to a hamburger)
