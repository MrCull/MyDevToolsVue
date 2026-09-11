# MyDevTools — Attached Tabs Redesign (Oxide / Zinc)

## Context

The previous plan (`plans/modern-developer-workspace-redesign.md`) is complete **in name only**. Commit
`5438072` delivered the shell half — a tool registry, a dashboard at `/`, a page frame, dynamic routes —
but never touched the 16 tool components. Instead `src/assets/main.css` was added: **71 `!important`
declarations** that reskin the original SFCs from the outside by class name.

The result is two competing style systems shipping at once, with the winner decided by specificity.
That is why the site still looks unfinished:

- **The sidebar scrollbar is structural.** 16 links + 4 headers + brand + footer need ~940px of height;
  a maximised 1080p browser gives ~900. The raw OS scrollbar over dark navy is the *default* desktop
  experience, and "Productivity" sits below the fold.
- **Four tools escape the override sheet entirely** (`DiffTool`, `BranchFormatter`, `QRCodeGenerator`,
  `TimeZoneConverter` use non-`.container` roots), so they get no card chrome. QR and Time Zone also
  render their own headings *underneath* the frame's heading — visible duplicate titles today.
- **62 dead `.dark-mode` rules across 15 files.** Theming moved to `body[data-theme]`; nothing removed
  the old selectors, so they ship to every user and match nothing.
- **`ToDoList.vue`'s `<style>` is unscoped** (line 118), leaking `.container li`,
  `.container input[type=text]` and `.container .primary-btn{…!important}` into the other 13 tools.
- **`highlight.js/styles/github-dark.css` is imported globally by three formatters** — a hardcoded dark
  theme, which is why code blocks are wrong in light mode.
- **`Inter` is declared but never loaded.** No `@font-face`, no link tag; weights `650`/`750` round to
  700. The intended hierarchy silently collapses to system-ui.
- **Theme flashes on every load** — `data-theme` is only applied in `onMounted`, so first paint has no
  custom properties at all. `base.css` also hardcodes `html { background:#0b1120 }`.
- **No design system** — radii of 5/7/8/9/10/12/14px, font sizes 0.64–1.08rem with near-duplicates,
  one shadow token, five different ad-hoc monospace stacks.
- Tool pages pin left while the dashboard centres (`.tool-page` has `max-width` but no `margin:0 auto`).

This plan finishes the job properly: a real token layer, a new shell, and a genuine refactor of all 16
tool components so the override sheet can be deleted.

## Locked decisions

Chosen by the user across three rounds of mockups. **Do not revisit these.**

| | |
|---|---|
| **Layout** | Attached Tabs — no sidebar |
| **Dark theme** | Oxide (charcoal + steel blue) |
| **Light theme** | Zinc (grey ground, white surface, indigo) |
| **Type** | Archivo (UI), IBM Plex Sans (body), IBM Plex Mono (code) |
| **Radius** | Squared, 2px |
| **Icons** | Real SVG, replacing the Unicode glyphs |

Rendered mockups of the agreed design (the visual source of truth for this work):
- Layout + light palettes — https://claude.ai/code/artifact/4b009abf-3413-4f8f-9908-97a3017bc11c
- Earlier rounds — [directions](https://claude.ai/code/artifact/8d1c9bce-317a-4ab2-a840-cf00ee041d05),
  [workbench variants](https://claude.ai/code/artifact/956234a6-3819-4597-8d0d-752dfa890284)

### Attached Tabs, precisely

- **Top bar, 47px** — brand block | category tabs (Formatters / Generators / Converters / To Do) with a
  3px accent underline on the active one | search field with ⌘K hint | external-link + theme buttons.
- Below it, one **elevated surface panel** (border + 2px radius + shadow).
- The active category's **tool tabs dock to the top edge of that surface** like file tabs in an editor.
  The active tab takes the surface's background, an inset 2px accent bar on top, and has its bottom
  border removed so it merges into the surface.
- Inside the surface: a header row (tool name + description + right-aligned status pill), then the
  tool's workspace.
- Panes inside the surface sit at a different value from the surface — recessed in dark, faintly
  tinted in light.

### Palettes

**Oxide (dark)** — ground `#15181C`, surface `#1C2126`, pane `#15181C`, rule `#2B323A`, rule-strong
`#39424C`, ink `#DEE5EC`, muted `#7E8996`, accent `#4E9BD1`, accent-on `#08151F`, accent-soft `#182734`,
bar `#1A1F24`, field `#12161A`. Status ok `#4FB07A` / soft `#14261C` / line `#254C36`.
Syntax — key `#7FC4E8`, string `#B4CC86`, number `#E0A878`, literal `#C8A3E0`, punct `#58626E`.
Shadow `0 1px 2px rgba(0,0,0,.5), 0 16px 32px -16px rgba(0,0,0,.85)`.

**Zinc (light)** — ground `#E5E8EB`, surface `#FFFFFF`, pane `#FAFBFC`, rule `#D8DCE1`, rule-strong
`#C0C6CD`, ink `#12161A`, muted `#5B626B`, accent `#2C4CA6`, accent-on `#FFFFFF`, accent-soft `#E6EAF8`,
bar `#FFFFFF`, field `#EFF1F4`. Status ok `#1B7749` / soft `#E3F2EA` / line `#BCDECB`.
Syntax — key `#2C4CA6`, string `#226848`, number `#945218`, literal `#693D9C`, punct `#9AA1AA`.
Shadow `0 1px 2px rgba(14,20,28,.07), 0 18px 34px -16px rgba(14,20,28,.32)`.

## Housekeeping

- `git mv plans/modern-developer-workspace-redesign.md plans/completed/` (create the folder).
- `npm install` — **`node_modules` is absent in this worktree**, so nothing builds or tests until it runs.

## Test coupling — the exact brittleness list

Specs select by `[data-test-id=…]` and survive a rebuild, **except** these:

| Where | Coupling |
|---|---|
| `06-container`, `07-guid` | `.container-item`, `.container-number` |
| `08-password` | `.password-item`, `.password-text` |
| `09-hash` | `.hash-text` |
| `12-numberbase`, `13-unit` | `.result-text` (numberbase also `have.text('FF')`, no trim tolerance) |
| `14-cron` | `.cron-text` |
| `15-randomnumbers` | `.number-item`, `.number-value` |
| `16-todo` | `have.class('completed')` |
| `00-home` | `contains('h1', 'Developer tools, ready when you are.')`, `contains('h2','Formatters')` |

Plus: ~40 `should('be.visible')` (layout-sensitive), `should('be.disabled')` needs a real
`<button disabled>`, the todo checkbox must stay a real `<input type=checkbox>`, `10-qrcode` expects the
input to default to `google.com`, and `placeholder-message` must stay `v-if`/`v-else` — specs assert the
output `should('not.exist')`, so `v-show` fails.

---

## 1 · Token layer

New file **`src/assets/theme.css`**, imported first from `src/main.ts`. Tokens move out of `App.vue`'s
unscoped `<style>` block entirely.

Structure — **light (Zinc) is the base `:root`**, dark overrides under both a media query and an
explicit attribute, so "follow system" works as a real third state:

```css
:root { /* Zinc — full palette + every scale */ }
@media (prefers-color-scheme: dark) { :root:not([data-theme='light']) { /* Oxide colours only */ } }
:root[data-theme='dark'] { /* Oxide colours only */ }
```

Theme state becomes `'light' | 'dark' | 'system'` persisted under the existing `theme` key. `system`
stamps no attribute. Existing `'light'`/`'dark'` values in localStorage stay valid.

Scales to define (replacing the eyeballed 5/7/8/9/10/12/14px radii and 0.64–1.08rem sizes):
`--space-1…8`, `--radius-sm|md` (2px/4px, squared per the decision), `--text-xs…2xl`, `--shadow-sm|lg`,
`--z-bar|tabs|overlay`, `--dur-fast|base`.

`src/assets/base.css` keeps only the reset, `:focus-visible` and `.sr-only`. **Delete
`html { background:#0b1120 }`** — replace with `html { background: var(--ground); color-scheme: light dark }`.

## 2 · FOUC fix

Inline script in `index.html` `<head>`, before any stylesheet, reading `localStorage.theme` and stamping
`document.documentElement.dataset.theme` when the value is `light` or `dark`. The Vue toggle then writes
the same attribute on `<html>` (not `<body>` — the attribute must exist before Vue boots).

This changes the theme selector from `body[data-theme]` to `:root[data-theme]`, which is also what makes
the `:root` token structure above work.

Also add a `<meta name="theme-color">` per scheme.

## 3 · Fonts

Three families are needed and none is currently loaded. **Self-host** rather than use Google Fonts:
this is a static Azure SWA site with no backend, self-hosting removes a third-party round trip on first
paint, and it avoids a CSP/privacy dependency. Add woff2 subsets under `public/fonts/` with `@font-face`
declarations in `theme.css` and `font-display: swap`.

Drop the nonstandard weights `650`/`750` — they round to 700 on a static font and are the reason the
current hierarchy reads flat. Use real 500/600/700/800.

Fix the five ad-hoc mono stacks (`'Fira Code'`, `'Consolas','Monaco','Courier New'`, bare `monospace`,
`'Courier New'`) by routing every one through `--font-mono`.

## 4 · Icons

`ToolDefinition.icon` changes from `string` (a Unicode glyph) to a typed icon **name**. Icons render from
a single inline `<symbol>` sprite so there is no new dependency, no per-icon component, and one HTTP
payload that gzips well at this size.

16 tool icons plus `search`, `sun`, `moon`, `external-link`, `chevron`. `ToolIcon.vue` stops being a
multi-root fragment (it currently can't accept a class from its parent without a warning).

## 5 · Shell components

`App.vue` shrinks to composition only. New components under `src/components/shell/`:

- **`AppHeader.vue`** — brand, category tabs, search trigger, theme + external-link buttons.
- **`ToolTabs.vue`** — the docked tab strip for the active category.
- **`ToolSurface.vue`** — the elevated panel; renders `ToolTabs` on its top edge, the tool header row
  (name, description, status pill) and the workspace slot. Replaces `ToolPageFrame.vue`.

The border-merge for the active tab: tab strip sits on `--ground`, active tab takes `--surface` as its
background with `box-shadow: inset 0 2px 0 var(--accent)`, `border-bottom: 1px solid var(--surface)` and
`margin-bottom: -1px` so it overlaps the surface's own top border.

Fix `.tool-page`'s missing `margin: 0 auto` while doing this — currently tool pages pin left while the
dashboard centres.

**Navigation semantics:** these are route links, not tab panels, so they stay `<router-link>` inside a
`<nav>` — *not* `role="tablist"`. A tablist would promise arrow-key panel switching that routing doesn't
deliver, and would lie to screen readers about the relationship. Mark the current one with
`aria-current="page"`.

All targets go to 44px minimum (nav links are 38px today).

## 6 · Responsive

No sidebar to fall back on, so the header must degrade on its own:

- **< 900px** — tool tabs scroll horizontally with the active tab scrolled into view; category tabs stay.
- **< 600px** — category tabs collapse into a single dropdown showing the active category; search
  collapses to an icon that opens the picker overlay; the surface goes edge-to-edge.

Keep the `prefers-reduced-motion` block that already exists.

## 7 · Dashboard

`ToolDashboard.vue` is restyled to Zinc/Oxide and the hero shrinks — the current `4.35rem` headline above
112px cards is exactly the "oversized heading" the last plan promised to remove.

Two constraints from `00-home.cy.js`: it asserts the exact hero copy in an `h1` and `Formatters` in an
`h2`. Keep both element levels and the hero string, or update that spec deliberately — don't let it break
by accident.

Wire up the decorative `<kbd>/</kbd>` — it currently advertises a shortcut with no handler. Either
implement `/` to focus search or remove the hint.

## 8 · Syntax highlighting

`highlight.js/styles/github-dark.css` is imported globally by `JsonFormatter`, `SqlFormatter` and
`CSharpFormatter` — a hardcoded dark theme that breaks in Zinc. **Remove all three imports** and define
`.hljs-*` token colours from the theme tokens in `theme.css`, so highlighting follows the active theme.

This also lets the per-file `.hljs-attr`/`.hljs-string`/`.hljs-number` blocks and their dead
`.dark-mode` twins be deleted.

## 9 · Router

Lazy-load tool components — `sql-formatter`, `highlight.js`, `diff` and `qrcode.vue` currently all ship
on first paint of the dashboard. Add a catch-all 404 route (unknown paths render an empty
`<router-view>` today) and a `scrollBehavior` that resets to top on navigation.

---

## 10 · Shared primitives

There are currently **no shared components at all** — every tool reimplements its own buttons, fields,
placeholders and clipboard logic. **12 of 16 files hand-roll `navigator.clipboard`**, several with their
own per-item "copied" `Set` state.

Build under `src/components/ui/`:

| Primitive | Kind | Why |
|---|---|---|
| `ToolPane.vue` | component | The input/output pane — header bar (label + slot for actions), body, optional footer bar. Replaces `.input-section`/`.output-section` in 12 files. |
| `ToolPanes.vue` | component | The two-column grid + its mobile stack. Replaces 17 duplicated `@media` blocks. |
| `CopyButton.vue` | component | Wraps `useCopyToClipboard`; handles the copied state and the live-region announcement. |
| `EmptyState.vue` | component | The `placeholder-message` pattern. **Must keep `data-test-id="placeholder-message"` and stay `v-if`/`v-else`** — specs assert the output `should('not.exist')`. |
| `ErrorMessage.vue` | component | `error-message`, 4 files. |
| `useCopyToClipboard.ts` | composable | One implementation, returns `copy(value, key?)` + `isCopied(key)`. Replaces 12 hand-rolled copies. |
| buttons, fields, labels | **CSS classes** in `theme.css` | `.btn`, `.btn--primary`, `.field`, `.form-row`. These are pure presentation with no behaviour — components would add ceremony for nothing, and keeping them as classes means a tool can adopt them incrementally. |

The component/class split matters: anything with **state or a11y behaviour** becomes a component;
anything that is only paint stays a class.

## 11 · Migration sequencing

`main.css` must die, but deleting it breaks 13 tools at once. **Do not big-bang this.** The override
sheet is load-bearing until the last tool is migrated.

**Step 0 — `npm install`.** Nothing runs until this happens.

**Step 1 — foundation, no visual change to tools.** `theme.css`, fonts, FOUC script, icon sprite,
`base.css` cleanup. Keep `main.css` intact but re-point its hardcoded values at the new tokens. The app
should look *the same* at the end of this step, in Zinc/Oxide colours. Ship-able.

**Step 2 — shell.** `AppHeader`, `ToolTabs`, `ToolSurface`; retire `ToolPageFrame`; router lazy-loading,
404, scrollBehavior; dashboard restyle. Tools still ride the override sheet. Ship-able.

**Step 3 — the ToDoList landmine, first among the tools.** Scoping `ToDoList.vue`'s `<style>` changes the
appearance of the *other 13* `.container` tools, because they currently inherit its global
`.container li`, `.container input[type=text]` and `.container .primary-btn{…!important}`. Doing it first,
alone, in its own commit, means exactly one diff to reason about. Doing it last means debugging it
tangled with 15 other changes.

**Steps 4–8 — tools in ascending risk**, one commit per group, `main.css` shrinking as each group's
rules become unused:

1. **QRCodeGenerator** (131 lines) — smallest, and it already needs its duplicate `<h2>` removed.
2. **Simple formatters** — `JsonFormatter`, `SqlFormatter`, `CSharpFormatter` (316/322/353). Shared
   shape; also where the `github-dark.css` imports get removed.
3. **Generators** — `ContainerGenerator`, `GuidGenerator`, `HashGenerator`, `RandomNumbers`,
   `PasswordGenerator`, `BranchFormatter`, `CronGenerator` (318–464). All the same item-list + copy
   pattern; the `useCopyToClipboard` composable pays for itself here.
4. **Converters** — `NumberBaseConverter`, `UnitConverter` (336/521).
5. **The heavy three** — `DiffTool` (596, custom split view), `TimeZoneConverter` (732, largest, plus a
   duplicate `<h2>`), and a `ToDoList` visual pass now that it is scoped.

**Step 9 — delete `src/assets/main.css`.** By now every rule in it is dead. The 71 `!important`
declarations go with it. This is the step that proves the refactor actually landed.

## 12 · Per-tool refactor recipe

Apply to each SFC:

1. Delete the `<h1 class="title">` / `<h2>` heading — `ToolSurface` renders it. (`main.css` only *hides*
   these today, and only for `.container` roots, which is why QR and Time Zone show duplicates.)
2. Delete the gradient title CSS — `linear-gradient(135deg,#4f46e5…)` + `-webkit-text-fill-color`,
   **16 files, 28 occurrences**.
3. Delete every `.dark-mode …` rule — **62 rules across 15 files, all dead**.
4. Delete duplicated button/field/placeholder CSS (`.primary-btn` 46 rules, `.secondary-btn` 50,
   `.copy-btn` 36) and adopt `.btn` / primitives.
5. Delete the per-file `@media` block; `ToolPanes` owns the stack.
6. Normalise the root to a single wrapper class. **The four outliers** (`.branch-container`,
   `.diff-container`, `.timezone-converter`, `.qr-generator`) come into line here.
7. Replace hand-rolled clipboard with `useCopyToClipboard`.
8. Route every `font-family` through `--font-mono`.
9. **Preserve every `data-test-id` on the same semantic element.** Keep `v-if`/`v-else` for placeholders.
   Keep real `<button disabled>`. Keep the todo checkbox a real `<input type=checkbox>`.

## 13 · Test updates

For the class-coupled specs, **add a `data-test-id` to the element and update the spec** rather than
freezing a presentational class name — otherwise the next redesign hits the same wall.

| Spec | Change |
|---|---|
| `06-container`, `07-guid` | add `data-test-id="result-item"` / `"result-value"`, update selectors |
| `08-password` | same, replacing `.password-item` / `.password-text` |
| `09-hash` | replace `.hash-text` |
| `12-numberbase`, `13-unit` | replace `.result-text`; keep exact-text assertions working (watch whitespace — `have.text('FF')` has no trim tolerance) |
| `14-cron` | replace `.cron-text` |
| `15-randomnumbers` | replace `.number-item` / `.number-value` |
| `16-todo` | keep the `completed` class name — it is a genuine state modifier, and preserving it is cheaper than rewriting the assertion |
| `00-home` | update only if the hero copy changes; decide deliberately |

**New specs to add** — the old plan promised these and never delivered them:

- `17-nav.cy.js` — category tabs, tool tabs, active state, deep-link lands on the right tab.
- `18-theme.cy.js` — toggle, persistence across reload, no FOUC (assert the attribute is set before
  Vue mounts).
- Viewport checks at 1280 / 768 / 400 for the header degradation in §6.

## 14 · Cleanup

**In scope** (they are the mess this plan exists to clear):

- Delete `src/components/Counter.vue`, `Weather.vue` (unrouted, and both inject a Google Fonts
  `<link>` from inside a template) and `src/components/icons/*` (5 unused scaffold files).
- Delete `src/assets/main.css` at step 9.
- Update `AGENTS.md` — it still documents `/` redirecting to `/json`, the `.dark-mode` body class, and
  "add a `<router-link>` in `App.vue`". All three are now wrong, and it is the file that tells the next
  agent how to work here.

**Out of scope** — real, but unrelated to the redesign; raise separately:

- `@vue/compiler-sfc` miscategorised in `dependencies`.
- Scaffold package name `vue-counter-app`.
- `start-server-and-test` missing from `package.json` while CI relies on `npx` fetching it.

## 15 · Verification

Per step:

```sh
npm run type-check      # clean
npm run lint            # clean
npm run build           # clean
npx start-server-and-test preview http://localhost:4173 cy:run
```

Cypress tests the **built** app on `:4173`, not the dev server — a step is not verified until it passes
there.

Per-step "done" means:

- The full Cypress suite passes (not just the touched tool's spec — the whole point is that these tools
  share global CSS).
- The tool is checked in **both themes** and at **1280 / 768 / 400px**.
- `git diff src/assets/main.css` shows rules *removed*, never added.

Final acceptance:

- `src/assets/main.css` no longer exists.
- `grep -r "dark-mode" src/` returns nothing.
- `grep -r "linear-gradient(135deg" src/` returns nothing.
- `grep -rn "!important" src/` is empty or justified in review.
- No horizontal scrollbar at 400px; no sidebar scrollbar at any height.
- Theme survives reload with no flash.

## 16 · Effort shape

Roughly, for staging across sessions:

| Stage | Scope | Size |
|---|---|---|
| 0–1 | install, tokens, fonts, FOUC, icons | small–medium |
| 2 | shell + dashboard + router | medium |
| 3 | ToDoList scoping (isolated, risky) | small but delicate |
| 4–7 | 13 tools in four groups | large — the bulk |
| 8 | Diff + TimeZone + ToDo visual | medium–large |
| 9 | delete `main.css`, cleanup, AGENTS.md | small |

The three heaviest files are `TimeZoneConverter` (732), `DiffTool` (596) and `ToDoList` (560) — about a
quarter of the tool code between them, and all three are deliberately last.
