# MyDevTools — New Tools, Batch 1 (9 tools)

## Context

MyDevTools has 16 tools across four categories, registered in `src/toolRegistry.ts`. This plan adds
nine browser-only tools that fill obvious gaps next to the existing set:

| # | Tool | Category | Route | Closest existing neighbour |
|---|---|---|---|---|
| 1 | JWT Decoder | Converters | `/jwt` | — |
| 2 | Encoder / Decoder (Base64, URL, HTML) | Converters | `/encode` | Hash Generator |
| 3 | Unix Timestamp Converter | Converters | `/timestamp` | Time Zone Converter |
| 4 | Regex Tester | Formatters | `/regex` | — |
| 5 | Data Format Converter (JSON ↔ YAML / CSV / XML) | Converters | `/dataconvert` | JSON Formatter |
| 6 | Color Converter & Contrast Checker | Converters | `/color` | Unit Converter |
| 7 | Text Case & Line Tools | Formatters | `/text` | Branch Formatter |
| 8 | Fake Data Generator (incl. Lorem Ipsum) | Generators | `/fakedata` | Random Numbers |
| 9 | Markdown Previewer | Formatters | `/markdown` | — |

Resulting category sizes: **Formatters 8, Generators 8, Converters 8, Productivity 1.** `ToolTabs`
already scrolls horizontally with edge fades, so eight tabs per category needs no shell change. It
still has to be checked at 375px (see Verification).

The Scratchpad/Snippets idea (#10) is deliberately **out of scope**. It would break the `AGENTS.md` rule
that `localStorage` holds only the theme and the To Do list. **None of the nine tools below persist
anything.**

## Relationship to the redesign plan

`plans/attached-tabs-redesign-oxide-zinc.md` is mid-flight: the shell, tokens and `components/ui/`
primitives have shipped, but none of the 16 existing tools uses them yet. They still carry legacy
scoped CSS.

**New tools are born migrated.** They are the first real consumers of the primitives and must follow
the redesign's B3 recipe from the start, not copy an existing tool:

- Root is `<ToolLayout>` (`split`, `editor` or `stack`). **No `.container` class anywhere**, because
  `main.css`'s `.tool-workspace .container` rules would reach it.
- **No `<h1>`/`<h2>` title or subtitle.** `ToolFrame` renders the name and description from the
  registry. Section headings use `<Panel title="…">`.
- Controls are raw native `<input>`/`<select>`/`<textarea>` with `.field` / `.field--mono`. Buttons
  use `AppButton` or `.btn` / `.btn--primary` / `.btn--icon`. Copy uses `CopyButton`. Empty output uses
  `EmptyState`. Errors use `.alert`. Scalar results use `ResultRow`.
- Scoped CSS only, token-driven (`--fg`, `--bg-pane`, `--line`, `--accent`, `--danger`, `--space-*`,
  `--font-mono`, …). Zero `!important`, zero `.dark-mode`, zero hard-coded hex (except where a colour
  *is* the data, e.g. the color swatch).
- If the redesign adds a `migrated` flag to `ToolDefinition` before this lands, set it to `true` on
  all nine.

**Don't use `JsonFormatter.vue`, `HashGenerator.vue` etc. as templates.** Their markup and CSS are
the legacy style that the redesign is removing. Use `BranchFormatter` once the redesign has migrated
it; until then, use this plan's conventions.

## Conventions for every tool

### Registry entry

One line per tool in `src/toolRegistry.ts`, placed at the end of its category block so the existing
tab order doesn't change:

```ts
{ id: 'jwt', path: '/jwt', name: 'JWT Decoder', shortName: 'JWT', description: 'Decode JSON Web Tokens and inspect their claims.', category: 'Converters', icon: 'jwt', keywords: ['jwt', 'token', 'auth', 'claims', 'bearer'], loader: () => import('./components/JwtDecoder.vue') },
```

Routes, search, dashboard cards and tabs all derive from this. **No router edits.**

### Icons

Add one entry per tool to `iconPaths` in `src/icons.ts`, using the existing style: 24×24 viewBox,
stroke-only paths, 2–4 strokes, no fills. New keys: `jwt`, `encode`, `timestamp`, `regex`,
`dataconvert`, `color`, `textcase`, `fakedata`, `markdown`. `IconName` is derived from the object, so
the registry won't type-check until the icon exists.

### Reactivity model

Default to **live output** (a `computed` from the input) for the pure, cheap transforms: JWT, Encode,
Timestamp, Text, Color, Regex, Markdown. That's cleaner than a Generate button and needs fewer
`data-test-id`s. Use an explicit action button only when the work is expensive or random: Fake Data
(Generate) and Data Convert (Convert, because large inputs block on every keystroke).

Wherever output is conditional, keep the `v-if` output / `v-else` `EmptyState` swap. Specs assert on
it.

### Shared helpers

Create `src/utils/` (it doesn't exist yet) for logic shared by more than one tool. Keep it
framework-free so it can be reasoned about separately:

- `src/utils/base64.ts` — UTF-8-safe `encodeBase64`, `decodeBase64`, `encodeBase64Url`,
  `decodeBase64Url`. Use `TextEncoder`/`TextDecoder` around `btoa`/`atob`, because raw `btoa` throws on
  any non-Latin-1 character (e.g. `é`, emoji). Used by **JWT** and **Encode**.
- `src/utils/prng.ts` — seeded `mulberry32(seed)`. Used by **Fake Data**. `RandomNumbers` could adopt
  it later, but not in this batch.

### Test IDs

Every element a spec touches gets a `data-test-id` prefixed with the tool id (`jwt-input`,
`jwt-header-output`, …). Assert on test IDs and state, **never on presentational class names**
(redesign B4). Dynamic IDs follow the existing `'copy-btn-' + key` pattern.

### Dependencies

Each new package is imported only from its tool's SFC, so Vite puts it in that route's lazy chunk and
the initial bundle is unaffected.

| Package | Tool | Why not hand-roll |
|---|---|---|
| `yaml` | Data Convert | YAML's spec is large; hand-rolled parsers get anchors, multiline strings and quoting wrong |
| `fast-xml-parser` | Data Convert | Handles XML ↔ JS in both directions with attribute options, and has no DOM dependency |
| `marked` | Markdown | GFM tables, task lists and fenced code |
| `dompurify` | Markdown | **Required**. Output goes through `v-html` |

Deliberately **no** `@faker-js/faker` (multi-MB even with a single locale), no colour library (the
conversions are ~80 lines of known math), no date library (`Intl` covers it), and no CSV library
(RFC 4180 quoting is ~40 lines and is covered by the spec below). `highlight.js` is already a
dependency, so reuse it for Markdown code blocks via `hljs/lib/core` + registered languages, as the
formatters do.

---

## Tool specifications

Build order is ascending complexity. Each tool is one self-contained commit (registry line + icon +
SFC + spec), except #2 and #1, which share `utils/base64.ts` and land in that order.

### 3 · Unix Timestamp Converter — `/timestamp`

`TimestampConverter.vue` · shortName `Timestamp` · icon `timestamp` · keywords `unix, epoch, timestamp, date, iso, milliseconds`

**Layout:** `stack`. A "Now" panel on top, then a two-way converter.

- **Now panel:** the current epoch in seconds and in milliseconds, ticking every second
  (`setInterval`, cleared in `onUnmounted`). Each value has a `CopyButton`.
- **Timestamp → date:** one input that accepts seconds, milliseconds, microseconds or nanoseconds.
  **Auto-detect the unit by digit count** (≤10 s, 13 ms, 16 µs, 19 ns) and show the detected unit
  next to the input, with a `<select>` to override it. The output is a list of `ResultRow`s: ISO 8601
  UTC, RFC 2822, the local date/time via `Intl.DateTimeFormat` (with the resolved zone name), and
  relative time via `Intl.RelativeTimeFormat` ("3 hours ago").
- **Date → timestamp:** a native `<input type="datetime-local">` plus a free-text field that accepts
  anything `Date.parse` accepts. Output is seconds and milliseconds.
- Invalid input shows `.alert`, not `Invalid Date`.

**Test IDs:** `timestamp-now-seconds`, `timestamp-now-ms`, `timestamp-input`, `timestamp-unit`,
`timestamp-iso`, `timestamp-local`, `timestamp-relative`, `timestamp-date-input`,
`timestamp-date-seconds`, `timestamp-error`, `timestamp-placeholder`.

**Spec `20-timestamp.cy.js`:** use `cy.clock(Date.UTC(2026, 0, 1))` to freeze time. Then assert that
the now value equals `1767225600`; that `1767225600` produces ISO `2026-01-01T00:00:00.000Z`; that a
13-digit input auto-detects `ms`; that the placeholder shows when empty and the error on `abc`.
**Only assert on UTC outputs.** CI's timezone is whatever the runner has, so `timestamp-local` gets
`should('not.be.empty')` only.

### 2 · Encoder / Decoder — `/encode`

`EncoderDecoder.vue` · shortName `Encode` · icon `encode` · keywords `base64, url, encode, decode, html entities, percent`

**Layout:** `split`, input on the left and output on the right.

- A mode `<select>`: **Base64**, **Base64URL**, **URL component** (`encodeURIComponent`), **Full URL**
  (`encodeURI`), **HTML entities**.
- A direction toggle with two `.btn`s (Encode / Decode, `aria-pressed`) plus a **Swap** button that
  moves the output into the input and flips the direction.
- Live output with a `CopyButton`. Decoding malformed input (bad Base64, lone `%`) shows `.alert`
  with the error message and **keeps the previous valid output hidden**, not stale.
- HTML entity decode uses a detached `<textarea>`'s `innerHTML` → `value` trick. Never inject into
  the live DOM.
- **File → data URI:** a native `<input type="file">` that reads with `FileReader.readAsDataURL` and
  puts the result in the output. Cap it at 5 MB with an `.alert` above that, so the tab doesn't choke.

**Test IDs:** `encode-mode`, `encode-direction-encode`, `encode-direction-decode`, `encode-swap`,
`encode-input`, `encode-output`, `encode-error`, `encode-placeholder`, `encode-file`, `encode-copy`.

**Spec `21-encode.cy.js`:** `héllo 👋` round-trips through Base64 (proves UTF-8 safety); Base64URL
has no `+`, `/` or `=`; `a b&c` → `a%20b%26c`; `<b>` → `&lt;b&gt;`; invalid Base64 shows the error;
swap flips the direction and moves the text; `cy.get('[data-test-id=encode-file]').selectFile(...)`
with a small fixture produces a `data:` prefix.

### 1 · JWT Decoder — `/jwt`

`JwtDecoder.vue` · shortName `JWT` · icon `jwt` · keywords `jwt, token, auth, claims, bearer, oauth`

**Layout:** `split`. A token textarea (`.field--mono`) on the left; header, payload and signature
panels on the right.

- Strip a leading `Bearer ` and whitespace. Split on `.`; anything other than 3 parts (or 5, for
  JWE) shows `.alert` "Not a JWT".
- Decode the header and payload with `decodeBase64Url` + `JSON.parse`, then pretty-print with
  `JSON.stringify(…, null, 2)` and highlight with the existing `hljs` JSON setup. The signature is
  shown raw.
- **Claims table** under the payload: for `exp`, `iat` and `nbf`, show the ISO date and relative
  time. A status badge reads **Expired** (`--danger`), **Not yet valid**, or **Valid** (`--success`,
  or the nearest existing token; add one to `tokens.css` if missing). Also show `alg` and `typ` from
  the header, with a warning badge for `alg: none`.
- **A visible notice: "Decoded locally. The token never leaves your browser. The signature is not
  verified."** Verification is out of scope, because it needs a secret or public key and a clear UX
  for handling them.
- JWE (5 parts): show the header only, and a note that the payload is encrypted.

**Test IDs:** `jwt-input`, `jwt-header-output`, `jwt-payload-output`, `jwt-signature-output`,
`jwt-status`, `jwt-claim-exp`, `jwt-claim-iat`, `jwt-error`, `jwt-placeholder`, `jwt-copy-payload`.

**Spec `22-jwt.cy.js`:** use fixed fixture tokens built once and committed to `cypress/fixtures/`,
one expired and one with `exp` in 2099. Paste them with `invoke('val', token).trigger('input')`,
because typing 200+ characters is slow. Assert: the payload contains `"sub"`; the expired token shows
`Expired`; the 2099 token shows `Valid`; a `Bearer `-prefixed token still decodes; `abc` shows the
error; an empty input shows the placeholder.

### 7 · Text Case & Line Tools — `/text`

`TextTools.vue` · shortName `Text` · icon `textcase` · keywords `case, camel, snake, kebab, pascal, slug, word count, sort lines, dedupe`

**Layout:** `stack`. One input textarea, a stats bar, then two output groups.

- **Stats** (live): characters, characters without spaces, words, lines, and bytes as UTF-8
  (`TextEncoder().encode(s).length`).
- **Case conversions**, each a `ResultRow` with a `CopyButton`: camelCase, PascalCase, snake_case,
  CONSTANT_CASE, kebab-case, Title Case, Sentence case, lower, UPPER. Tokenise once: split on
  whitespace, `_`, `-`, `.` **and camel boundaries** (`myHTTPServer` → `my`, `HTTP`, `Server`), so
  converting between cases round-trips.
- **Line operations** as `.btn`s that transform the input in place: Sort A→Z, Sort Z→A, Reverse,
  Dedupe, Trim each, Remove empty, Shuffle. Add a **natural sort** checkbox so `item10` sorts after
  `item2`, via `Intl.Collator(undefined, { numeric: true })`.
- An Undo button that holds the single previous input value. It's cheap, and in-place transforms are
  destructive.

**Test IDs:** `text-input`, `text-stat-chars`, `text-stat-words`, `text-stat-lines`,
`text-case-camel`, `text-case-pascal`, `text-case-snake`, `text-case-constant`, `text-case-kebab`,
`text-case-title`, `text-line-sort`, `text-line-dedupe`, `text-line-reverse`, `text-natural-sort`,
`text-undo`, `text-placeholder`.

**Spec `23-text.cy.js`:** `my HTTP server_name` → camel `myHttpServerName`, snake `my_http_server_name`,
kebab `my-http-server-name`; `hello world` gives words = 2; sorting `b\na\nc` gives `a\nb\nc`; dedupe
`a\na\nb` → `a\nb`; natural sort orders `item2` before `item10`; undo restores the input.
**Case outputs must be single-line text with no inner whitespace** (the same issue as redesign trap
T1), so `have.text` is exact.

### 6 · Color Converter & Contrast Checker — `/color`

`ColorConverter.vue` · shortName `Color` · icon `color` · keywords `color, colour, hex, rgb, hsl, oklch, contrast, wcag, accessibility`

**Layout:** `split`. The converter on the left, the contrast checker on the right. It stacks on
mobile.

- **Converter:** a native `<input type="color">` plus a text `.field` that accepts `#rgb`, `#rrggbb`,
  `#rrggbbaa`, `rgb()`/`rgba()`, `hsl()`/`hsla()` and `oklch()`, in any of them. A large swatch.
  `ResultRow`s for HEX, RGB, HSL and OKLCH, each copyable. OKLCH uses the standard sRGB → linear →
  OKLab → OKLCH math. Round to sensible precision (L to 3 decimal places, C to 3, H to 1).
- The native picker has no alpha, so keep the alpha from the text input and show it separately.
- **Contrast checker:** foreground and background inputs (the same parser, each with its own picker)
  and a live preview block of sample text in both sizes. Show the WCAG 2.x ratio to 2 decimal places
  and four pass/fail badges: **AA normal (4.5)**, **AA large (3)**, **AAA normal (7)**, **AAA large
  (4.5)**. Add a swap button.
- The swatch and preview use inline `:style` bindings, because the colour is the data. That's the one
  allowed exception to the token-only rule.

**Test IDs:** `color-picker`, `color-input`, `color-swatch`, `color-hex`, `color-rgb`, `color-hsl`,
`color-oklch`, `color-error`, `contrast-fg`, `contrast-bg`, `contrast-swap`, `contrast-ratio`,
`contrast-aa-normal`, `contrast-aa-large`, `contrast-aaa-normal`, `contrast-aaa-large`.

**Spec `24-color.cy.js`:** `#ff0000` → `rgb(255, 0, 0)` and `hsl(0, 100%, 50%)`; `rgb(0,128,255)` →
`#0080ff`; `#fff` expands to `#ffffff`; black on white gives ratio `21.00` and all four pass;
`#777` on white gives ~`4.48`, so AA normal fails and AA large passes (a known edge case); garbage
input shows the error. Drive the picker with `invoke('val', '#00ff00').trigger('input')`.

### 4 · Regex Tester — `/regex`

`RegexTester.vue` · shortName `Regex` · icon `regex` · keywords `regex, regexp, regular expression, match, pattern, replace`

**Layout:** `editor`. The pattern row across the top, then test text with highlighting, then the
match table and replace preview.

- **Pattern row:** `/` [pattern `.field--mono`] `/` [flags]. Flags are toggle checkboxes for `g i m s u
  y d`, and the row shows the compiled `/…/gim` literal. Compile errors (`new RegExp` throws) show in
  `.alert` with the engine's message.
- **Test text with live highlighting:** a transparent `<textarea>` over a `<pre>` mirror. The mirror
  renders the text split into plain and `<mark>` spans, built as a **VNode/`v-for` array, never
  `v-html`**, so the test text can't inject markup. The textarea and mirror must share font, padding,
  line-height and `white-space: pre-wrap`, or the highlights drift. That's the same issue as the Diff
  gutter (redesign B3), and **Cypress won't catch drift, so check it manually**.
- **Match table:** index, match, position, then one column per capture group, with named groups
  labelled by name. Uses `matchAll` when `g` is set, and a single `exec` otherwise. Cap at 1,000
  matches with a "showing first 1,000" note.
- **Replace preview:** a replacement `.field` (supports `$1`, `$<name>`, `$&`) and a live output with
  a `CopyButton`.
- **Catastrophic backtracking:** `(a+)+$` on a long string freezes the main thread, and there's no
  way to interrupt a synchronous `RegExp`. Run matching in a **Web Worker** (`new Worker(new
  URL('../workers/regex.worker.ts', import.meta.url), { type: 'module' })`, which Vite bundles
  natively). Debounce input by 150 ms. If the worker hasn't answered within 1 s, `terminate()` it,
  create a fresh one, and show "Pattern timed out — possible catastrophic backtracking". This is the
  most involved part of the batch; budget accordingly.
- A collapsible cheat-sheet (`<details>`) of common tokens. Clicking one inserts it at the pattern
  cursor.
- Zero-length matches (`/^/gm`, `/\b/g`) must advance `lastIndex` manually or loop forever. `matchAll`
  handles this; a hand-written `exec` loop doesn't.

**Test IDs:** `regex-pattern`, `regex-flag-g`, `regex-flag-i`, `regex-flag-m`, `regex-flag-s`,
`regex-test-input`, `regex-highlight`, `regex-match-count`, `regex-match-table`, `regex-error`,
`regex-timeout`, `regex-replace-input`, `regex-replace-output`, `regex-placeholder`.

**Spec `25-regex.cy.js`:** type with `{ delay: 0, parseSpecialCharSequences: false }`. Cypress
otherwise treats `{` in `\d{3}` as a key sequence, the same trap the JSON spec already works around.
Assert: `\d+` on `a1b22c333` with `g` finds 3 matches; turning off `g` finds 1; `(?<year>\d{4})`
shows a `year` column; `i` makes `ABC` match `abc`; `[` shows the error; replace `(\w+)@(\w+)` →
`$2 at $1`; `(a+)+$` on `'a'.repeat(30)+'!'` shows the timeout **and the page stays responsive**
(type into the pattern field afterwards and assert it updates). Wait on `regex-match-count` rather
than using fixed `cy.wait`s, because of the worker round-trip.

### 8 · Fake Data Generator — `/fakedata`

`FakeDataGenerator.vue` · shortName `Fake Data` · icon `fakedata` · keywords `lorem ipsum, fake, mock, test data, placeholder, dummy, seed`

**Layout:** `split`. Options on the left, output on the right.

- **Mode `<select>`:** Lorem ipsum, or Records.
- **Lorem ipsum:** a unit (paragraphs / sentences / words), a count (1–50), and a "Start with *Lorem
  ipsum dolor sit amet*" checkbox. Uses a ~200-word classic Latin word list.
- **Records:** a checkbox group of fields (id, first name, last name, full name, email, username,
  phone, street, city, country, postcode, company, date of birth, UUID, boolean, integer), a row count
  (1–1,000), and an output format `<select>`: **JSON**, **CSV**, **SQL `INSERT`** (with a table name
  field). Emails derive from the generated name at a reserved domain (`@example.com`/`.org`/`.net`,
  RFC 2606), so generated data can never email a real person. Phone numbers use the reserved `555-01xx`
  range.
- **Seed:** a numeric field and a 🎲 button for a random one. The same seed and options always give
  the same output (`utils/prng.ts`). UUIDs come from the PRNG too, not `crypto.randomUUID`, so seeded
  runs stay repeatable.
- Word lists live in `src/data/fakeData.ts`: ~100 first names, ~100 surnames, ~50 cities and
  countries, company-name parts. Plain arrays, a few KB, in the route chunk only.
- The Generate button (`btn--primary`) and output `<pre>` (`.field--mono`, with `max-height` +
  scroll). Add a `CopyButton` and a **Download** button (`Blob` + object URL, `.json`/`.csv`/`.sql`).
- CSV escaping: quote a field if it contains `,`, `"`, CR or LF, and double any embedded `"`. SQL
  escaping: double `'`. The Data Convert tool reuses the CSV writer, so put it in
  `src/utils/csv.ts`.

**Test IDs:** `fakedata-mode`, `fakedata-lorem-unit`, `fakedata-lorem-count`, `fakedata-lorem-classic`,
`fakedata-field-<key>` (dynamic), `fakedata-rows`, `fakedata-format`, `fakedata-table-name`,
`fakedata-seed`, `fakedata-random-seed`, `fakedata-generate`, `fakedata-output`, `fakedata-copy`,
`fakedata-download`, `fakedata-placeholder`.

**Spec `26-fakedata.cy.js`:** placeholder before Generate; 3 lorem paragraphs → output split on
`\n\n` has length 3; classic start begins with `Lorem ipsum`; JSON with 5 rows parses (`JSON.parse`
in `.then`) to an array of length 5 with only the selected keys; **seed 42 generated twice gives
identical output**; SQL output starts with `INSERT INTO`; every email ends with a reserved domain.
**Don't add `password` to keywords.** `00-home` filters on `password` and asserts that exactly the
Password card is found.

### 9 · Markdown Previewer — `/markdown`

`MarkdownPreviewer.vue` · shortName `Markdown` · icon `markdown` · keywords `markdown, md, preview, gfm, readme, html`

**Layout:** `split`. Source on the left, preview on the right, with scroll sync (proportional
scrollTop).

- `marked` with GFM enabled (tables, task lists, strikethrough, autolinks). Fenced code goes through
  `hljs` via a `marked` renderer hook. Register only the languages the formatters already use, plus
  `bash`, `ts`, `yaml` and `xml`, not the full hljs bundle.
- **Sanitize every render with `DOMPurify.sanitize` before it reaches `v-html`.** This is
  non-negotiable: pasted Markdown can contain `<img onerror>` or `<script>`. Add
  `// eslint-disable-next-line vue/no-v-html -- sanitized by DOMPurify above` on the one line that uses
  it. Links get `target="_blank" rel="noopener noreferrer"` via a DOMPurify hook.
- Preview typography: scoped styles on `.markdown-body` for headings, lists, tables (bordered with
  `--line`), blockquote, `code`/`pre` on `--bg-pane` + `--font-mono`, and task-list checkboxes
  (disabled). Content uses IBM Plex Sans per `AGENTS.md`.
- The existing `syntax.css` supplies the hljs token colours in both themes. **Don't import any
  `highlight.js/styles/*.css`**; the redesign removed those.
- Actions: **Copy HTML** (the sanitized string), **Copy Markdown**, **Load sample** (a sample
  covering every GFM feature, which is also the manual-check fixture), and Clear.
- **Table helper:** a `<details>` with rows × columns inputs that inserts an empty GFM table at the
  cursor.
- Debounce renders by 100 ms. `marked` is fast, but hljs on large code blocks isn't.

**Test IDs:** `markdown-input`, `markdown-preview`, `markdown-copy-html`, `markdown-copy-md`,
`markdown-sample`, `markdown-clear`, `markdown-table-rows`, `markdown-table-cols`,
`markdown-table-insert`, `markdown-placeholder`.

**Spec `27-markdown.cy.js`:** `# Hi` renders an `h1` inside `markdown-preview`. That preview `h1`
must **not** break `17-navigation`'s `cy.contains('h1', …)`, which runs on `/guid` only, so it's fine,
but note it. A GFM table renders a `table`. **XSS:**
`<img src=x onerror="window.__xss=1">` renders and then `cy.window().its('__xss').should('be.undefined')`.
Also `<script>` doesn't appear in the preview DOM. Copy HTML calls a stubbed `writeText` with a
string containing `<h1`. Load sample fills the input.

### 5 · Data Format Converter — `/dataconvert`

`DataConverter.vue` · shortName `Data` · icon `dataconvert` · keywords `json, yaml, csv, xml, convert, transform, tsv`

**Layout:** `split`. Input on the left, output on the right. A toolbar above holds **From** `<select>`
(JSON / YAML / CSV / TSV / XML), a **Swap** button, **To** `<select>`, and **Convert**
(`btn--primary`).

- Everything goes through a single JS value: `parse(from, text) → unknown → serialize(to, value)`.
  That gives 5 parsers + 5 serializers, not 20 converters. Put them in `src/utils/dataFormats.ts`,
  framework-free and one function per format.
- **JSON:** native. The indent `<select>` (2 / 4 / tab) applies to JSON and YAML output.
- **YAML:** the `yaml` package. `parse` rejects multi-document input with an explicit message, or it
  could offer "first document only". Pick the explicit error.
- **CSV/TSV:** `src/utils/csv.ts` (shared with Fake Data). Parse is RFC 4180 (quoted fields, embedded
  newlines, `""`), with a "First row is header" checkbox. The result is an array of objects, or
  arrays without a header. For serializing, the value must be an array of flat objects. Nested values
  are `JSON.stringify`'d into the cell with a visible warning. Columns are the union of keys in
  first-seen order. Anything that isn't an array gives `.alert` "CSV output needs an array of
  objects".
- **XML:** `fast-xml-parser` with `ignoreAttributes: false` and `attributeNamePrefix: '@_'`, so
  attributes round-trip. Serializing needs a single root key, so wrap arrays or multi-key objects in
  `<root>` and show a note saying so.
- **Table preview:** when the parsed value is an array of flat objects, show an extra `<table>` tab
  next to the text output (the same data, readable). Cap at 500 rendered rows.
- Errors name the format and include the parser's line/column when it provides one ("YAML: line 3,
  column 5: bad indentation"), in `.alert`. **Don't show stale output.** Clear it on error, as the
  JSON formatter does.
- Input size guard: above 5 MB, show a warning but still allow it. That's why conversion is on a
  button, not live.
- Swap: output → input, then swap From/To.

**Test IDs:** `dataconvert-from`, `dataconvert-to`, `dataconvert-swap`, `dataconvert-convert`,
`dataconvert-input`, `dataconvert-output`, `dataconvert-indent`, `dataconvert-csv-header`,
`dataconvert-table-tab`, `dataconvert-table`, `dataconvert-error`, `dataconvert-warning`,
`dataconvert-placeholder`, `dataconvert-copy`.

**Spec `28-dataconvert.cy.js`:** paste JSON with `invoke('val').trigger('input')`, because braces
again. Assert: `{"a":1,"b":[1,2]}` → YAML contains `a: 1` and `- 1`; YAML → JSON round-trip equals the
original after `JSON.parse`; `[{"n":"x, y"}]` → CSV quotes `"x, y"`; CSV with header → JSON is an
array of objects; CSV with an embedded newline in quotes parses to a single row; `<a id="1">t</a>` →
JSON has `@_id`; invalid JSON shows the error with no output; swap swaps both the selects and the
text; the table tab appears for array input and not for a scalar.

---

## Sequencing

| Step | Work | Gate |
|---|---|---|
| **N0** | `src/utils/` (`base64.ts`, `prng.ts`, `csv.ts`), all 9 icons in `icons.ts`. No registry entries yet. Pure addition. | `npm run build` green |
| **N1** | Timestamp (#3) | build + `20-timestamp` + full suite |
| **N2** | Encode (#2) | + `21-encode` |
| **N3** | JWT (#1). Reuses `base64.ts`; add the `--success` token if missing | + `22-jwt` |
| **N4** | Text (#7) | + `23-text` |
| **N5** | Color (#6) | + `24-color` |
| **N6** | Regex (#4). Includes the worker; the largest single step | + `25-regex` + manual highlight-alignment check |
| **N7** | Fake Data (#8) | + `26-fakedata` |
| **N8** | Markdown (#9). Adds `marked`, `dompurify` | + `27-markdown` (incl. XSS) |
| **N9** | Data Convert (#5). Adds `yaml`, `fast-xml-parser`; reuses `csv.ts` | + `28-dataconvert` |
| **N10** | If `plans/fix-mojibake-text.md` has landed, make sure its all-routes encoding spec covers the 9 new paths (and settle the spec-number clash). Docs: `README.md` tool list; update `19-responsive` only if a new tool reveals a layout issue (keep it at 3 routes otherwise) | full suite |

Each step is independently shippable and revertible: delete the registry line and the tool is gone.

## Traps

| | |
|---|---|
| **N-T1** | **Rebuild before Cypress.** `test:e2e` previews `dist/` (redesign T6). A stale build tests the old registry, and the new routes 404 into `NotFound`. |
| **N-T2** | **`00-home` search filter.** It types `password` and asserts that the JSON card disappears. Keep `password`, `secret` and `json`-heavy wording out of new keywords except where it's genuinely relevant. Data Convert legitimately has `json`, but no spec searches `json`, so check that stays true. |
| **N-T3** | **`17-navigation` uses `cy.contains('a', 'SQL')`.** No new Formatters `shortName` may contain `SQL`. Fake Data outputs SQL but lives in Generators, and its shortName is `Fake Data`. Fine. |
| **N-T4** | **Clipboard stubs.** Specs `cy.stub(win.navigator.clipboard, 'writeText')` after load. `CopyButton` reads `navigator.clipboard` at call time, so it's fine. Don't cache it in any new code (redesign T2). |
| **N-T5** | **Braces in `cy.type`.** JSON, regex quantifiers and JWT all contain `{`. Use `parseSpecialCharSequences: false` or `invoke('val').trigger('input')`. |
| **N-T6** | **Time and timezone in CI.** Freeze with `cy.clock`; assert on UTC only (Timestamp, JWT claims). The JWT "Valid" fixture uses `exp` in 2099, not "now + 1h". |
| **N-T7** | **`v-html` lint.** `eslint-plugin-vue` flags `vue/no-v-html`. The Markdown preview is the only allowed use, with a justified disable comment. Regex highlighting must not use it. |
| **N-T8** | **Worker in preview build.** Vite emits the worker as a separate asset. Test the regex timeout against `npm run preview`, not just `dev`. `staticwebapp.config.json` already excludes `/assets/*` from the navigation fallback. Keep it that way, or the worker request gets rewritten to `index.html`. |
| **N-T9** | **Tab strip at 8 tools.** At 375px, check that the active tab scrolls into view (`ToolTabs` already calls `scrollIntoView`) and that the edge fades appear. `T5` from the redesign still applies: sticky chrome must not cover click targets. |

## Verification

1. `npm run lint`, then `npm run build`: type-check passes, and the new icons type-check against the
   registry.
2. `npm run test:e2e`: all 20 existing specs plus 9 new (`20`–`28`) green.
3. **Bundle check:** `dist/assets/index-*.js` size is unchanged within ~2 KB of before (registry lines
   + icon paths only). `marked`, `dompurify`, `yaml` and `fast-xml-parser` appear only in their route
   chunks.
4. **Manual, per tool:** light and dark theme; 375px, 768px and 1440px; keyboard-only (tab order,
   visible focus, `aria-pressed` on toggles, labels on every control via `FormField` or `<label
   for>`).
5. **Manual, specific:**
   - Regex: highlights stay aligned with the textarea while typing, scrolling and wrapping long lines.
   - Regex: a catastrophic pattern times out and the tab stays usable.
   - Markdown: the Load sample renders every GFM feature correctly in both themes; code blocks use the
     `syntax.css` colours.
   - Color: the picker and text field stay in sync both ways; the contrast badges match
     webaim.org/resources/contrastchecker for 3 spot checks.
   - Encode: a 4 MB file becomes a data URI without freezing; a 6 MB file shows the cap alert.
6. Dashboard (`/`) shows all 25 cards in the right category groups; search finds each new tool by
   name and by at least one keyword.

## Out of scope

- Scratchpad / Snippets (#10). It needs an `AGENTS.md` storage-policy decision first.
- JWT signature verification and JWT *encoding*.
- Regex flavours other than JavaScript (PCRE/.NET differences). Label the tool "JavaScript RegExp" in
  its description so nobody expects otherwise.
- Shareable URLs / URL-state for tool inputs. That's a good follow-up across all tools, but it's a
  cross-cutting change, not per-tool.
- Migrating the existing 16 tools. That's owned by `attached-tabs-redesign-oxide-zinc.md`.
