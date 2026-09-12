# MyDevTools — Attached Tabs Redesign (Oxide / Zinc)

## Context

The previous plan (`plans/completed/modern-developer-workspace-redesign.md`) is complete **in name
only**. Commit `5438072` delivered the shell half — a tool registry, a dashboard at `/`, a page frame,
dynamic routes — but never touched the 16 tool components. Instead `src/assets/main.css` was added:
**71 `!important` declarations** that reskin the original SFCs from the outside by class name.

Two competing style systems now ship at once, with the winner decided by specificity and source order.
That is why the site still looks unfinished. Every item below was verified directly in the tree:

- **The sidebar scrollbar is structural.** 16 links + 4 headers + brand + footer need ~940px of height;
  a maximised 1080p browser gives ~900. The raw OS scrollbar over dark navy is the *default* desktop
  experience, and "Productivity" sits below the fold.
- **21 CSS custom properties are used but never defined** (~31 declarations): `--text-primary` x17,
  `--input-bg` x5, `--card-bg` x3, `--text-secondary` x3, plus `--error-color`, `--text-color`,
  `--disabled-color` and others. No fallbacks, so each is invalid-at-computed-value-time — colour falls
  back to `inherit`, background to `transparent`. **Tools will look *worse* after a naive reskin unless
  the token file ships aliases for these.**
- **Four tools escape the override sheet entirely** (`DiffTool`, `BranchFormatter`, `QRCodeGenerator`,
  `TimeZoneConverter` use non-`.container` roots). QR and Time Zone also render their own `<h2>`
  *underneath* the frame's heading — visible duplicate titles today, and a real a11y defect.
- **62 dead `.dark-mode` rules across 15 files.** Theming moved to `body[data-theme]`; nothing removed
  the old selectors. No SFC selects on `body[data-theme]`, so moving the attribute to `<html>` is safe.
- **`ToDoList.vue`'s `<style>` is unscoped** (line 118), leaking `.container li`,
  `.container input[type=text]`, `.container::before` and `.container .primary-btn{...!important}` into
  the other 13 tools.
- **`highlight.js/styles/github-dark.css` is imported globally by three formatters** (`JsonFormatter`,
  `SqlFormatter`, `CSharpFormatter`) — a hardcoded dark stylesheet shipped app-wide. Zinc will render
  code blocks on `#0d1117`.
- **`Inter` is declared but never loaded.** No `@font-face`, no link tag; weights `650`/`750` round to
  700. The intended hierarchy silently collapses to system-ui.
- **Theme flashes on every load** — `data-theme` is only applied in `onMounted`. `base.css` also
  hardcodes `html { background:#0b1120 }`.
- **No design system** — radii of 5/7/8/9/10/12/14px, font sizes 0.64–1.08rem, one shadow token, five
  different ad-hoc monospace stacks.
- Tool pages pin left while the dashboard centres (`.tool-page` has `max-width`, no `margin:0 auto`).
- **`RandomNumbers.vue:3` reads `<h1 class="title">GUID Generator</h1>`** — wrong title, invisible only
  because `main.css` hides it.
- **`start-server-and-test` is absent from `package-lock.json`** yet CI depends on `npx` fetching it
  unpinned, *after* `npm ci` claims to have installed everything. A real CI hazard.

This plan finishes the job: a real token layer, a new shell, and a genuine refactor of all 16 tools so
the override sheet can be deleted.

## Locked decisions

Chosen across three rounds of mockups. **Do not revisit.**

| | |
|---|---|
| **Layout** | Attached Tabs — no sidebar |
| **Dark** | Oxide (charcoal + steel blue) |
| **Light** | Zinc (grey ground, white surface, indigo) |
| **Type** | Archivo (UI), IBM Plex Sans (body), IBM Plex Mono (code) |
| **Radius** | Squared — 2px controls, 4px surface |
| **Icons** | Real SVG, replacing the Unicode glyphs |

Rendered mockups (visual source of truth):
[layout + light palettes](https://claude.ai/code/artifact/4b009abf-3413-4f8f-9908-97a3017bc11c) ·
[directions](https://claude.ai/code/artifact/8d1c9bce-317a-4ab2-a840-cf00ee041d05) ·
[workbench variants](https://claude.ai/code/artifact/956234a6-3819-4597-8d0d-752dfa890284)

### Attached Tabs, precisely

- **Top bar, 47px** — brand | category tabs with a 3px accent underline | search with Cmd-K |
  external-link + theme buttons.
- Below it, one **elevated surface** (border, 4px radius, shadow).
- The active category's **tool tabs dock to the surface's top edge**. Active tab takes the surface
  background, an inset 2px accent bar, and merges into the surface.
- Inside: header row (name, description, status pill), then the workspace.
- Panes sit at a different value from the surface — recessed in dark, tinted in light.

### Palette amendments — needs sign-off

Three problems with the palette as specified from the mockups. **Proposed fixes, flag if unwanted:**

1. **Zinc's `bar` and `surface` are both `#FFFFFF`**, which makes the tab merge invisible in light mode —
   only the 2px accent bar would carry the state. Introduce `--bg-tabstrip`: `#EDEFF2` light,
   `#1A1F24` dark. The top bar stays `#FFFFFF`.
2. **`--syn-punct` fails WCAG AA in both themes** — `#58626E` on `#15181C` is 2.90:1; `#9AA1AA` on
   `#FAFBFC` is 2.52:1. Punctuation in code (`{}`, `[]`, `:`) is meaningful text, not decoration.
   Raise to `#7A848F` (~4.6:1) and `#6E757E` (~4.9:1), or accept as a documented exception.
3. **No danger/warn colours were specified**, but 16 tools render error states and the password tool
   colour-codes strength. Proposed — dark `#E0736B`/`#D9A441`, light `#B3261E`/`#8A5A00`, each with a
   soft + line variant.

Everything else checks out: `--fg-muted` dark 4.54:1, accent dark 5.3:1, accent light 7.8:1.

## Housekeeping

- **`npm install` first — `node_modules` is absent in this worktree.** Nothing builds or tests until then.
- `plans/modern-developer-workspace-redesign.md` → `plans/completed/` *(done)*.

---

# Part A — Shell and design system

## A1 · Token layer

```
src/assets/tokens.css        new    scales: type, space, radius, shadow, z, motion, font stacks
src/assets/theme.css         new    Oxide/Zinc colours + legacy aliases + color-scheme
src/assets/base.css          edit   reset, focus-visible, .sr-only
src/assets/legacy-tools.css  rename was main.css — the !important bridge
```

Imported in strict order from `src/main.ts` — **not** via CSS `@import`, which creates a request
waterfall and hides the ordering. `App.vue`'s `<style>` becomes `scoped` and holds only shell layout.
**Zero tokens in any SFC.**

Dark is the base `:root` (product default). The inline bootstrap script always resolves `system` to a
concrete value, so **CSS only ever needs two states** and no `prefers-color-scheme` block is required.

> **`@layer` cannot retire the `!important` bridge.** Unlayered styles — which is every `<style scoped>`
> block — beat layered ones regardless of order, so the tool SFCs would win. Keep `!important`, confined
> to `legacy-tools.css`, and delete it file-by-file.

Scales replace the eyeballed values: `--space-1...16` on a 4px grid, `--radius-sm|md|full` (2/4/999),
`--text-2xs...3xl` anchored at 14px body, `--shadow-1|2`, `--z-*`, `--dur-1|2|3` + easings. Reduced
motion overrides the `--dur-*` tokens *and* keeps a blanket `!important` net for the 16 legacy SFCs that
hardcode their own transitions.

### The legacy alias block — highest-value 20 lines in the plan

Maps the old names onto the new tokens **and defines the 21 undefined ones**. This reskins all 16 tools
to Oxide/Zinc for free and fixes the invalid declarations, before a single tool is touched:

```css
--text-primary:   var(--fg);         /* was undefined — 17 uses */
--input-bg:       var(--bg-field);   /* was undefined —  5 uses */
--card-bg:        var(--bg-pane);    /* was undefined —  3 uses */
--text-secondary: var(--fg-muted);   /* was undefined —  3 uses */
--container-bg:   var(--bg-surface);
--border-color:   var(--line);
--primary-color:  var(--accent);
--nav-text:       var(--fg);         /* ...etc */
```

Each entry is deleted when its last consumer migrates. `npm run build` will **not** catch a premature
removal — grep before deleting.

## A2 · FOUC fix

Move `data-theme` from `<body>` to `<html>` (verified safe) and resolve it in an inline script placed as
the **last element in `<head>`**, before Vite's stylesheet link. It writes two attributes:
`data-theme` (resolved `light|dark`, what CSS selects on) and `data-theme-mode` (the user's choice,
which may be `system`).

`src/composables/useTheme.ts` **reads those attributes and never re-derives on mount** — a second
derivation is exactly how the flash comes back. Module-level singleton state so the header button and
any other consumer agree.

Theme state is `'dark' | 'light' | 'system'` under the existing `theme` key. **Absent key means
`'dark'`**, not `'system'` — headless Chrome reports `prefers-color-scheme: light`, so defaulting to
system would silently flip CI to the light theme. The button cycles dark → light → system.

## A3 · Fonts

**Self-host via `@fontsource`, latin subsets only.** Not the Google Fonts `<link>`: Azure SWA already
serves hashed `/assets/*` with long cache headers, a third-party link adds DNS + TLS + a render-blocking
round trip to a ~200 KB site, and the cross-site font cache has been partitioned since 2020 so there is
no shared-cache upside left.

```
npm i @fontsource-variable/archivo @fontsource/ibm-plex-sans @fontsource/ibm-plex-mono
```

Add metric-matched `@font-face` fallbacks (`size-adjust`, `ascent-override`) so the swap doesn't reflow
the tab row. **Delete every `font-weight: 650`/`750`** — with a variable Archivo they would actually
render at those weights and look wrong against the 600/700/800 set.

## A4 · Icons

**One typed path map + one inline-SVG component** — `src/icons.ts` exporting `iconPaths` and a closed
`IconName` union, plus `src/components/AppIcon.vue`.

Rejected: a `<symbol>` sprite (untyped, unlintable, invisible to HMR, and saves nothing because the
dashboard renders all 16 at once) and 20 per-icon SFCs (nothing tree-shakes — the registry references
all 16 statically).

`ToolDefinition.icon` becomes `IconName`, so **`vue-tsc` catches every typo** — the whole payoff.
`AppIcon` has a **single root** (today's `ToolIcon.vue` is a fragment, which silently drops
`class`/`style` fallthrough). `label` omitted means `aria-hidden`; `label` present means `role="img"` +
accessible name, replacing the `.sr-only` sibling hack. Delete `ToolIcon.vue`.

## A5 · Shell components

```
src/components/shell/  AppHeader · CategoryTabs · ToolTabs · ToolSurface · ToolFrame
                       StatusPill · ThemeToggle · SearchDialog · RouteAnnouncer
src/composables/       useTheme · useFocusTrap · useToolStatus · useCategoryMemory
DELETED                ToolIcon.vue · ToolPageFrame.vue
```

`ToolFrame` keeps the tab strip and header **outside** the routed component, so under lazy loading the
chrome paints instantly and only the workspace rectangle is briefly empty. Biggest architectural win.

Route → tool lookup goes through **`route.meta.toolId`**, not `tools.find(t => t.path === route.path)` —
the current path compare breaks on trailing slashes and query strings.

The surface title is an **`<h1>` styled at h4 size**, not a literal `<h4>`: same pixels, but the page
keeps exactly one `h1` and no heading-level skip.

### The border-merge — do not use negative margins

The obvious trick (active tab with `margin-bottom:-1px` overlapping the body's top border) **breaks the
moment the tab row scrolls horizontally**, because `overflow-x:auto` clips the 1px overhang. Formatters
and Generators have 5–7 tabs and mobile *must* scroll.

Use **"tabs own the rule line"** instead: the surface body has no top border; inactive tabs draw
`border-bottom: 1px solid var(--line)`, the active tab sets `border-bottom-color: var(--bg-surface)`,
and two flex fillers (`.tabs::before/::after`) complete the rule across the padding. `gap: 0` is
required so there are no undrawable seam pixels. No negative margins, nothing to clip.

Add edge fades driven by a `scroll`/`ResizeObserver` handler, and `scrollIntoView({inline:'nearest'})`
for the active tab on route change.

**44px targets in a 47px bar** are physically impossible visually, so expand the hit area past the bar
with an invisible centred `::after` of 44x44.

Category tab label: the registry's fourth category is `Productivity` but the tab reads `To Do`. Change
the **label** via a `categoryLabels` map — don't rename the type, which would lose headroom for a second
productivity tool.

## A6 · Responsive

- **>= 900px** — full Attached Tabs. `.app-main { max-width:1320px; margin:0 auto }`, which fixes the
  left-pinned tool pages for every route at once rather than per page.
- **600–900px** — search collapses to an icon opening `SearchDialog`; tool tabs scroll with edge fades.
- **< 600px** — brand collapses to the mark; **category tabs leave the bar** for a dropdown + bottom
  sheet (you change tool far more often than category); tool tabs stay as the scrollable docked row —
  they *are* the mobile nav; the surface goes full-bleed, losing side borders and radius to reclaim
  ~34px on a 360px phone.

No sidebar fallback, deliberately.

## A7 · Accessibility

**Tabs must not be `role="tablist"`.** The ARIA tabs pattern promises a `tabpanel` in the same document,
activation that does not navigate, and arrow-key selection with roving `tabindex`. None holds here —
these change the URL, push history, are deep-linkable and must be Ctrl+clickable. Use `<nav>` +
`<router-link>` + `aria-current="page"`.

Also: a **skip link** (absent today — keyboard users traverse ~12 links before content); **route focus
management** (focus the `tabindex="-1"` `<h1>` on tool change) plus an SR-only `RouteAnnouncer`;
`useFocusTrap` with the Escape listener registered **only while open**, fixing today's always-on global
listener; `inert` on the rest of the app while a dialog is open.

The status pill is `role="status"` — it must exist in the DOM from mount with default text, and
`ToolFrame` must **not** put route-derived text in it or every navigation announces twice.

Make the decorative `<kbd>/</kbd>` real. **The typing guard is essential** — all 16 tools are
textarea-driven and `/` is a common character in JSON, SQL and paths:

```ts
const typing = !!target?.closest('input, textarea, select, [contenteditable]')
```

## A8 · Dashboard

Renders **inside the same `ToolSurface`** so the silhouette never changes between `/` and a tool; where
`ToolFrame` puts `ToolTabs`, the dashboard puts a single static "All tools" tab.

The `h1` text is contractually fixed by `00-home.cy.js` and stays **byte-identical**. It shrinks from
`clamp(2.15rem, 4.8vw, 4.35rem)` to 24px — the "oversized heading" the last plan promised to remove.
Cards lose the hover transform, drop to 88px min-height, and use `auto-fill` not `auto-fit` so a single
filtered result doesn't stretch to full width.

`.dashboard { margin: 0 auto }` is **deleted** — centring moves to `.app-main`.

Extract `filterTools(query)` into the registry so the dashboard and `SearchDialog` can't diverge.

## A9 · Router

**Lazy-load — the biggest measurable win.** Today `main.js` carries `highlight.js` + three grammars,
`sql-formatter`, `diff` and `qrcode.vue` just to render 16 cards.

This **requires splitting the registry**: `toolRegistry.ts` statically imports all 16 SFCs, so nothing
can split until `component: Component` becomes `loader: () => import(...)`.

Plus named routes, `meta.toolId`, a catch-all 404 (`NotFound.vue` — today an unknown path renders a
blank page under a header), and `scrollBehavior` that returns `false` when only the query changed.

Prefetch on intent — `@pointerenter="tool.loader()"` on tabs and cards. `import()` is idempotent and
cached, so a warm switch is indistinguishable from today.

**No `<Suspense>`** — no SFC uses top-level `await`; it would add a fallback state machine for a blank
rectangle. Give `.surface-body` a `min-height` so it doesn't collapse.

**Cypress risk:** specs assert immediately after `cy.visit('/json')`. Cypress retries for 4s and these
are same-origin chunks off localhost, so it is safe — but it is the one behavioural risk in this change
and must be the first thing verified against `preview`.

---

# Part B — The 16 tools

## B1 · Shared primitives

> **Containers are components. Controls are classes.**

Anything that *wraps* markup becomes a component. Anything a spec types into, selects from, or asserts
`have.value`/`be.disabled` on stays a **raw native element with a global class**. Wrapping
`<input>`/`<select>`/`<textarea>` means `v-model` proxying and `$attrs` forwarding onto non-root
elements — a class of subtle breakage for zero benefit over a `.field` class.

Components in `src/components/ui/`: `ToolLayout` (variants `split|editor|stack`, normalises the four
outlier roots), `Panel`, `AppButton`, `CopyButton`, `EmptyState`, `FormField`, `ResultRow`.
Classes in `ui.css`: `.btn` + variants, `.field`, `.alert`, `.checkbox`, `.u-action-bar`.

`AppButton` renders the `.btn` classes — **the CSS is the source of truth, the component is ergonomics**.
That lets Diff's `.clear-btn`, QR's `.download-button` and Time Zone's `.remove-button` adopt
`.btn .btn--icon` directly without becoming components.

Two rules on `ui.css`, enforced by grep in review: **zero `!important`**, and **zero descendant
selectors keyed on tool-owned class names**. That discipline is the entire difference between `ui.css`
and the thing it replaces.

Rejected: `AppInput`/`AppSelect`/`AppTextarea`, a custom toggle component (the todo spec needs a real
`<input type=checkbox>`), `ActionBar` (three flex properties), `useToolStorage` (only 2 tools persist).

`useCopyToClipboard` collapses **12 hand-rolled clipboard implementations** and deletes the
`copiedIds`/`copiedPasswords`/`copiedNumbers` `Set` refs from 4 files.

## B2 · Migration sequencing — gate the override sheet

`main.css` can't be deleted until the last tool migrates, because its selectors are keyed on
`.container` / `.primary-btn`. But it **can** be stopped from fighting migrated tools.

**Re-key every legacy rule from `.main-content X` to `.legacy-skin X`**, add `migrated?: boolean` to
`ToolDefinition`, and have the frame render `:class="{ 'legacy-skin': !tool.migrated }"`.

Migrating a tool is then **one boolean flip**. Unmigrated tools stay byte-identical; migrated tools are
completely free of the sheet. This converts a 16-way all-or-nothing into **16 independent,
individually-shippable, one-line-revertible changes** — the highest-value decision in Part B. Mark it
`// TODO(step-B5): remove` so it doesn't become permanent debt.

| Step | Work | Gate |
|---|---|---|
| **B0** | Foundation: CSS files, 7 UI components, composable, registry flag, `main.css` re-key, package metadata. **Pure addition — zero tool files touched.** | Suite green + **zero** visual diff |
| **B1a** | **`ToDoList.vue` `scoped` — one word, its own commit.** | Suite green; *expect* visible change on 13 tools |
| **B1b** | ToDoList full migration (442 → ~120 style lines) | |
| **B2** | 9 "form → result" tools, ascending risk. **`BranchFormatter` first** — already outside the sheet, so migration is purely additive with no "does it still match?" question. Make it the reference implementation. `PasswordGenerator` last (range slider + checkbox group). | Per-tool + full suite |
| **B3** | 3 formatters — `syntax.css` swap once, then near-identical commits | |
| **B4** | 3 bespoke — QR (~20 min) → TimeZone (732 lines, popover z-index) → **Diff last** (596 lines, highest regression risk) | |
| **B5** | **Delete the legacy block**, the `migrated` flag, the `legacy-skin` binding, the `.title{display:none}` rule and the `min(64vh,680px)` clamp | `main.css` gone |
| **B6** | Cleanup + `AGENTS.md` rewrite | |
| **B7** | New specs (nav, theme, responsive) | |

**Why ToDoList is scoped early, alone:** while `.legacy-skin` still pins the other 13 tools with
`!important`, this is the least destabilising possible moment — the sheet already wins on background,
border, radius and padding, so the blast radius narrows to what it doesn't cover. Doing it *last* means
cleaning up styles nobody can still see; doing it *before* B0 means having nothing to revert to.

> **Likely surprise:** ToDoList's `.container .primary-btn{...!important}` and `main.css`'s
> `.main-content .primary-btn{...!important}` have **equal specificity (0,2,0) and equal importance**, so
> source order decides — and Vite injects SFC styles *after* `main.css`. The flat indigo primary button
> the reskin thinks it ships is probably still rendering as the old gradient on all 13 tools. Verify in
> devtools before B1a. If confirmed, scoping ToDoList produces a visible change on 13 pages that looks
> like a regression but is the fix.

**Corollary: never set "pixel-identical to today" as an acceptance criterion.** The criterion is
"specs green + deliberate design".

## B3 · Per-tool recipe

1. Normalise the root to `<ToolLayout>`. **Leave no `.container` class anywhere** — if one survives, the
   legacy sheet can still reach it.
2. Delete the `<h1 class="title">` / `<h2>` + subtitle and the whole `.title{}` block (gradient,
   `-webkit-text-fill-color`). If a deleted subtitle said something the registry description doesn't,
   **update `toolRegistry.ts`, not the component.**
3. Delete every `.dark-mode` rule — all 62. Re-express anything they did as a token.
4. Delete duplicated `.primary-btn` (46 rules) / `.secondary-btn` (50) / `.copy-btn` (36) /
   `.button-group` / `.input-field` / `.form-group` / `.section-title` / `.placeholder-message` /
   `.error-message` / `.input-section` / `.output-section` and the local `@media` block.
5. Adopt primitives; route every `font-family` through `--font-mono`.
6. **Preserve every `data-test-id` verbatim**, including dynamic string composition
   (`'copy-btn-' + number`). Keep `v-if`/`v-else`. Keep real `<button disabled>`.
7. **Don't touch `<script setup>`** except removing copy state now owned by `CopyButton`.
8. Flip `migrated: true`.

### Per-tool exceptions

- **`BranchFormatter`** — reference implementation.
- **`RandomNumbers`** — deleting the `<h1>` silently fixes "GUID Generator". Call it out in the PR.
- **`QRCodeGenerator`** — delete `.qr-header` (fixes the duplicate title). **Keep
  `text = ref('google.com')`.** Don't add a placeholder for symmetry; the spec doesn't expect one.
- **`TimeZoneConverter`** — delete `.timezone-header`. `.search-results` is `position:absolute`, and the
  elevated surface + docked tabs introduce **stacking contexts the old flat layout didn't have** — give
  it an explicit z-index above both, and verify the `be.visible` assertion.
- **`DiffTool`** — **keep `.split-view`/`.line-numbers`/`.line`/`.char-delete` as scoped CSS**; that is
  functionality, not decoration. Its textareas use `class="input-field"` and rely on `main.css` forcing
  `font-family: var(--font-mono)` on all `.main-content textarea` — under the new sheet you must apply
  `.field--mono` **explicitly** or the columns desync from the line-number gutter. **Gutter alignment
  depends on monospace + fixed line-height, and Cypress only asserts `contain.text`, so it will not
  catch a desync. Manual check required.**
- **`ToDoList`** — two commits. **Keep the class name `completed`.** Keep `TransitionGroup tag="ul"`.
  Replace the `.task-list:empty::before` trick with a real `EmptyState`.
- **Formatters** — drop `height: calc(100vh - 12rem)`; put `min/max-height` on the `<textarea>`/`<pre>`,
  **not on the panel**, so the placeholder can never be clipped. Delete the three `github-dark.css`
  imports; add `src/assets/syntax.css` once.

## B4 · Test strategy

For the class-coupled specs, **add `data-test-id`s and update the specs** rather than freezing
presentational class names — otherwise the next redesign hits the identical wall, and `ResultRow` would
carry six synonym props forever.

`ResultRow` emits `data-test-id="result-row"` / `result-value`, replacing `.container-item`,
`.container-number`, `.password-item`, `.password-text`, `.hash-text`, `.result-text`, `.cron-text`,
`.number-item`, `.number-value` across **8 spec files, ~16 lines**.

Exceptions, deliberately kept:

- **`16-todo`'s `have.class('completed')`** — a genuine *state* class. Asserting on state is legitimate;
  the sin is asserting on *structure*.
- **`00-home`'s hero copy** — stays byte-identical; the spec moves from `contains('h1', ...)` to a
  `data-test-id` so the copy is pinned without pinning the tag. Owned by the shell PR.

### Traps that will silently break the suite

| | |
|---|---|
| **T1** | `12-numberbase` types **255** and asserts `have.text('FF')` — **whitespace-exact, no trim**. `ResultRow`'s value span must be one line with no internal newline. |
| **T2** | `useCopyToClipboard` must call `navigator.clipboard.writeText` **at call time**, never capture it at module scope — specs `cy.stub` it *after* page load, and a captured reference bypasses the stub. |
| **T3** | `NumberBaseConverter.vue:144`'s bare top-level `convertNumber()` is **load-bearing**: it makes `convertedNumber` truthy on mount, so `clear-btn` is enabled, so `12-numberbase`'s `beforeEach` can click it. Removing it or making it async breaks all five tests. Add a comment saying so. |
| **T4** | `06-container:41` and `07-guid:38` build **unquoted attribute selectors from generated values**. Don't change generated formats; switching GUID's default to braces/parens yields an invalid selector. |
| **T5** | `be.visible` doesn't check occlusion but **`.click()` does**. A sticky docked tab strip over a scrolled panel fails with "covered by another element". Keep sticky chrome under ~120px and give the workspace `scroll-margin-top`. |
| **T6** | **`npm run preview` serves `dist/`.** Rebuild before every Cypress run — a stale `dist/` silently tests the old code. |
| **T7** | Cypress's default viewport is **1000x660**, above the 767px breakpoint, so every existing spec runs desktop-only. `min(64vh,680px)` is only **422px** there. |

### New specs (B7)

`17-navigation` (tabs, `aria-current`, deep-link), `18-theme` (cycle, persistence across reload),
`19-responsive` (375/768/1440 against **three** tools only — `/json`, `/guid`, `/todo`; more doubles
runtime for marginal coverage). Keep them in `cypress/e2e/components/` — the directory name is already a
misnomer and a second convention is worse than one slightly-wrong one.

## B5 · Cleanup

**In scope:**

- Delete `Counter.vue`, `Weather.vue` (unrouted; both embed a Google Fonts `<link>` *inside a template*)
  and `components/icons/*` — 634 lines, 7 `.dark-mode` hits.
- Move `@vue/compiler-sfc` to `devDependencies`; rename `vue-counter-app` → `mydevtools`.
- **Add `start-server-and-test` to `devDependencies`** + a `test:e2e` script, and point CI at it. Do
  this in **B0** so every subsequent verification is reproducible.
- **Rewrite `AGENTS.md` — mandatory.** It currently states four falsehoods (`/` redirects to `/json`;
  dark mode is a `.dark-mode` body class; add nav links to `App.vue`; App.vue imports every tool) and
  one actively hostile instruction: *"There is no shared component library... Keep it that way unless
  the user asks for a refactor."* **An agent reading that will undo this entire plan.**

**Out of scope** — real but unrelated; raise separately: the workflow's EOL `node-version: '18'`, the
4-space/semicolon inconsistency (**do not run `npm run format` across the tree**), `README.md` unless a
description changes.

## B6 · Verification

```sh
npm run lint && npm run type-check && npm run build
npx start-server-and-test preview http://localhost:4173 cy:run
```

Fast inner loop: `npm run build-only` then `cypress run --spec <one file>`.

Grep gates, per commit:

```sh
grep -rn "dark-mode" src/                        # monotonically decreasing; 0 by B5
grep -rn "linear-gradient(135deg" src/           # 0 by B5
grep -rn "!important" src/assets/                # 0 by B5
grep -rn "highlight.js/styles" src/              # 0 after B3
grep -c "data-test-id" src/components/<Tool>.vue # must not decrease vs HEAD~1
```

Manual gates Cypress cannot see: `/json`, `/guid`, `/diff`, `/todo` in **both themes** at 1440 and 375.

**Final acceptance:** `main.css` gone · `legacy-skin`/`migrated` gone · no sidebar scrollbar at any
height · no horizontal scroll at 400px · theme survives reload with no flash.

## B7 · Effort shape

| Stage | Size |
|---|---|
| Shell + tabs (Part A) | ~1 session |
| B0 foundation | ~1 session |
| B1 ToDoList | ~½ session, delicate |
| B2 nine tools | ~2 sessions — the bulk |
| B3 formatters | ~1 session |
| B4 QR / TimeZone / Diff | ~2 sessions |
| B5–B7 | ~1 session |

**~8–9 focused sessions across ~9 PRs, every one shipping green.** B2 and B4 parallelise across
sessions once BranchFormatter sets the pattern.
