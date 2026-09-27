# MyDevTools — Fix Garbled ("Mojibake") Text

## Context

Production (`https://www.mydevtools.org/unit`) shows `Ã¢â€žÂ¹Ã¯Â¸Â` next to both unit selects in the <!-- encoding-check-ignore -->
Unit Converter, where there should be an info icon. It's **mojibake**: UTF-8 bytes read as
Windows-1252 and saved back as UTF-8. Here it happened **twice**:

```
ℹ️  (U+2139 U+FE0F)  →  UTF-8 bytes E2 84 B9 EF B8 8F
   → read as cp1252:  â„¹ï¸        (1st pass) <!-- encoding-check-ignore -->
   → read as cp1252:  Ã¢â€žÂ¹Ã¯Â¸Â  (2nd pass — what the screenshot shows) <!-- encoding-check-ignore -->
```

**Source:** commit `5b9e6df` ("better ui", 2026-09-12). Its diff replaces clean glyphs with garbled
ones and makes no other change to those lines. The parent commit is clean, so this is a one-commit
regression, not old debt. The likely cause is a Windows PowerShell 5.1 edit. `Get-Content` without
`-Encoding utf8` reads UTF-8 without a BOM as ANSI (cp1252), and `Set-Content` writes it back.
Running that twice (or once plus an editor round-trip) gives the double layer.

### Full inventory

This is a scan of **every tracked file** (`git ls-files`) for the Latin-1-lead + cp1252-continuation
pattern. Exactly **5 occurrences in 2 files**:

| File | Line | Garbled | Original | Where it shows | Spec coverage |
|---|---|---|---|---|---|
| `src/components/UnitConverter.vue` | 45 | `Ã¢â€žÂ¹Ã¯Â¸Â` | `ℹ️` | "From" unit info button | none | <!-- encoding-check-ignore -->
| `src/components/UnitConverter.vue` | 86 | `Ã¢â€žÂ¹Ã¯Â¸Â` | `ℹ️` | "To" unit info button | none | <!-- encoding-check-ignore -->
| `src/components/UnitConverter.vue` | 97 | `Ã°Å¸â€â€ž Swap Units` | `🔄 Swap Units` | Swap button label | `swap-btn` clicked by `13-unit`, text not asserted | <!-- encoding-check-ignore -->
| `src/components/ToDoList.vue` | 28 | `Ãƒâ€”` | `×` | Remove-task button | `remove-task-btn-*` clicked by `16-todo`, text not asserted | <!-- encoding-check-ignore -->
| `src/components/ToDoList.vue` | 312 | `'Ã¢Å“â€œ'` | `'✓'` | CSS `::after` tick on checked tasks | none (pseudo-element) | <!-- encoding-check-ignore -->

The other non-ASCII text in the repo is legitimate and was checked. `TimeZoneConverter.vue` has
`×` and accented city names (`São Paulo`, `Bogotá`, `București`, …), and `AppHeader.vue` has `⌘`.
**Leave them as they are.**

**No spec caught this.** Every affected element is either untested or asserted only by
`data-test-id` + click, never by its text. That's the gap the guardrails below close.

## Decision: restore the glyphs, or replace them with icons?

The redesign plan (`attached-tabs-redesign-oxide-zinc.md`, Locked decisions) already says **"Real SVG,
replacing the Unicode glyphs"**. Restoring `ℹ️`/`🔄` would fix the bug only to have it deleted later,
and colour emoji clash with the Oxide/Zinc palette anyway. So:

- **UnitConverter:** replace with `AppIcon`s. This means new `info` and `swap` entries in
  `src/icons.ts`, in the same 24×24 stroke style.
- **ToDoList remove button:** replace with `<AppIcon name="close" />`, which already exists. Keep the
  existing `aria-label="Remove task"`.
- **ToDoList CSS tick:** use the CSS escape `content: '\2713';`. It renders the same `✓` but the
  source is pure ASCII, so no future re-encode can break it.

Where a glyph stays as text, prefer an **ASCII escape** (`&times;`, `\2713`) over the raw character.
That applies to any other glyph in files a Windows script might rewrite.

## Steps

| Step | Work | Gate |
|---|---|---|
| **M1** | **Hotfix.** Byte-exact replacement of the 5 garbled strings. Add `info` and `swap` icons to `icons.ts`; swap in `AppIcon` in `UnitConverter.vue` (×2 info, ×1 swap, with the label text `Swap Units` kept next to the icon); `AppIcon name="close"` in `ToDoList.vue`; `'\2713'` in its CSS. Add `aria-label`s to both info buttons (`"About {unit}"`), which currently have **no accessible name** apart from the garbled text. | `npm run build`, `13-unit` + `16-todo` green, visual check of `/unit` and `/todo` in both themes |
| **M2** | **Encoding guard script.** Add `scripts/check-encoding.mjs` (see below) and wire it in as `"check:encoding"` in `package.json`, chained into `build` so CI and local builds both fail on regressions. | Script fails on a deliberately garbled temp file, passes on the fixed tree |
| **M3** | **Rendered-text Cypress spec** `cypress/e2e/components/20-encoding.cy.js`: loop over every registry route, visit it, and assert that `document.body.innerText` has no mojibake markers. Also assert the specific fixed elements: `swap-btn` text is `Swap Units` and the info buttons have the aria-label. | Full suite green |
| **M4** | **Repo hygiene:** add `.gitattributes` (`* text=auto eol=lf`, plus `*.png binary` etc.) and an `AGENTS.md` rule about writing files from PowerShell. | Review |

M1 is safe to ship on its own immediately. M2–M4 stop it happening again.

> **Numbering clash:** `plans/new-tools-batch-1.md` reserves spec numbers `20`–`28`. If this plan
> lands first, it takes `20-encoding.cy.js` and the tools batch shifts to `21`–`29` (or vice versa).
> Whichever lands second renumbers.

### M1 — how to make the edit safely

**Don't make this edit with PowerShell `Get-Content`/`Set-Content`.** That's the tool that caused it.
Use the editor's own file tools or a Node/Python script that reads and writes with explicit `utf-8`.
After editing, confirm the bytes:

```sh
node -e "const t=require('fs').readFileSync('src/components/UnitConverter.vue','utf8');console.log(/[À-ÿ][\u0080-¿ -⃿Œ-ƒˆ-˜]/.test(t))"   # → false
```

The Unit Converter's scoped styles size `.info-btn` for an emoji. Once it holds an `AppIcon`, check
that it's still square, vertically centred against the `<select>`, and at least 40px as a touch target.
**Don't** use this commit to migrate `UnitConverter`'s legacy CSS onto the redesign primitives. That's
the redesign plan's B2 step. Keep this diff minimal so it's easy to review and to cherry-pick as a
hotfix.

### M2 — `scripts/check-encoding.mjs`

This is a zero-dependency Node script:

1. List files with `git ls-files` and filter to text extensions (`.vue .ts .js .cjs .mjs .css .html
   .md .json .svg .yml`).
2. Read each as UTF-8. **Fail** on:
   - **Invalid UTF-8.** Decode with `new TextDecoder('utf-8', { fatal: true })`, which catches files
     saved as ANSI.
   - **A UTF-8 BOM** (`﻿` at offset 0). That's the other thing PowerShell 5.1 does silently.
   - **Mojibake markers**: `/[À-ÿ][\u0080-¿ -⃿Œ-ƒˆ-˜]/`.
     A Latin-1 lead byte followed by a cp1252 continuation character is essentially never real text.
     Checked against the current tree, the legitimate `São Paulo` / `București` don't match.
3. Print `file:line: <snippet>` and, for mojibake, the **best-guess repair**: repeatedly
   `encode('cp1252') → decode('utf-8')` until it's stable. Use a lenient cp1252 map, because bytes
   `0x81 0x8D 0x8F 0x90 0x9D` are undefined in strict cp1252 and appear in the emoji cases above.
4. Allow-list: an optional `// encoding-check-ignore` comment on the line, for any future file that
   has to contain such a sequence on purpose (e.g. a test fixture for an encoding tool).

Wiring: `"build": "run-p check:encoding type-check \"build-only {@}\" --"`. It runs in parallel with
the type-check, adds well under a second, and CI already runs `npm run build`.

### M3 — `20-encoding.cy.js`

```js
import { tools } from '../../../src/toolRegistry'   // if the import path fights Cypress's bundler, inline the path list
const MOJIBAKE = /[À-ÿ][\u0080-¿ -⃿Œ-ƒˆ-˜]|�/
describe('no garbled text', () => {
  ['/', ...tools.map((t) => t.path)].forEach((path) => {
    it(`renders clean text on ${path}`, () => {
      cy.visit(path)
      cy.get('body').invoke('text').should('not.match', MOJIBAKE)
    })
  })
})
```

- `�` (the replacement character) is included too. It's what the browser shows when a file is
  served as non-UTF-8.
- `innerText` doesn't include CSS `::after` content, so the ToDo tick relies on M2 (the source scan).
  That's why both layers exist.
- `toolRegistry.ts` imports `.vue` loaders lazily. If Cypress's webpack preprocessor can't resolve
  them, fall back to a hard-coded path array and a comment pointing at the registry. The new-tools
  plan adds 9 routes, so note in that plan that they need adding here.
- The ToDo route renders the remove button only when a task exists, so add one task in that test
  before asserting.

### M4 — hygiene

- **`.gitattributes`**: `* text=auto eol=lf`. `git ls-files --eol` shows the working tree is CRLF
  while the index is LF. That's harmless for this bug but noisy, and it's the same family of Windows
  tooling drift. `.editorconfig` already says `charset = utf-8` / `end_of_line = lf`, but only editors
  honour it; scripts don't.
- **`AGENTS.md`**, under "Before finishing" or a new "Editing files" note: *"Never write source files
  with Windows PowerShell `Set-Content`/`Out-File`/`>` — PowerShell 5.1 reads UTF-8 as ANSI and writes
  a BOM. Use the editor tools, or `node`/`git` for scripted edits. `npm run build` runs
  `check:encoding` and will fail on garbled text."*

## Verification

1. `npm run check:encoding` gives 0 findings. Temporarily paste `Ã¢â€žÂ¹` into any `.vue` and confirm <!-- encoding-check-ignore -->
   it fails with the file, line and suggested repair `ℹ`. Revert.
2. `npm run build`, then `npm run test:e2e`: all specs green, including the new `20-encoding`.
3. Manual, in light and dark themes, at 1440px and 375px:
   - `/unit`: two info icons, correctly aligned with the selects, whose hover `title` still shows the
     unit description; the swap button shows the icon + "Swap Units".
   - `/todo`: remove button shows ×; checking a task shows the white ✓ tick.
4. After deploying, reload `https://www.mydevtools.org/unit` (hard refresh) and confirm the garbled
   text is gone.

## Out of scope

- Migrating `UnitConverter` / `ToDoList` to the redesign primitives. That's owned by the redesign plan.
  M1 touches only the five broken strings, the two new icons and the aria-labels.
- Changing the legitimate non-ASCII content (city names, `⌘`).
