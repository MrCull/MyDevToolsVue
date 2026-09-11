# Modern Developer Workspace Redesign

## Summary

Transform MyDevTools into a cohesive, modern developer workspace while preserving all 16 tools and their existing behavior.

The redesign will use a polished dark-first aesthetic, retain a complete light theme, and replace the `/json` home redirect with a searchable tool dashboard.

## Key Changes

- Create a unified design system:
  - Deep navy dark surfaces, cool neutral light surfaces, indigo accents, strong contrast, and restrained shadows.
  - Consistent typography, spacing, radii, controls, interaction states, and subtle motion.
  - Monospace typography for code, hashes, IDs, and generated values.
- Replace the current app shell:
  - Group navigation into Formatters, Generators, Converters, and Productivity.
  - Replace emoji labels with consistent developer-oriented icons.
  - Correct Vue Router active-route styling.
  - Use a persistent desktop sidebar and accessible mobile drawer.
  - Separate theme and Blazor controls from the primary tool navigation.
- Add a dashboard at `/`:
  - Use the headline "Developer tools, ready when you are."
  - Search tools by name, description, category, and keywords.
  - Present responsive category sections with concise tool cards and a useful no-results state.
- Standardize every tool page:
  - Shared icon, title, description, input/settings panel, and output/result panel.
  - Unified buttons, fields, selects, checkboxes, errors, empty states, and copy feedback.
  - Wide editor layouts for formatters and diff; balanced panels for generators and converters.
  - Clean stacked layouts on mobile.
- Improve accessibility and polish:
  - Visible focus states, semantic headings, associated labels, and 44 px touch targets.
  - Keyboard-safe drawer behavior and live regions for transient feedback.
  - WCAG AA contrast and reduced-motion support.
  - Remove excessive gradients, oversized headings, large hover movement, and duplicated styling.

## Interfaces and Architecture

- Introduce a central `ToolDefinition` registry with `id`, `path`, `name`, `shortName`, `description`, `category`, `icon`, and `keywords`.
- Use the registry for routes, dashboard cards, navigation groups, and search.
- Add reusable tool-page, panel, empty-state, copy-action, and form-control primitives.
- Replace body theme classes with a persisted `light | dark` theme state, defaulting to dark when no preference exists.
- Consolidate shared styling under `src/assets`, scope specialized tool styles, and remove the unscoped to-do styles.
- Preserve tool logic, local-storage data, existing routes, and `data-test-id` attributes.
- Make no backend, authentication, storage-schema, or public API changes.

## Test Plan

- Update the home-route test to verify the dashboard instead of a JSON redirect.
- Test tool search, categories, card navigation, active navigation, theme persistence, and the mobile drawer.
- Run all existing Cypress tool scenarios to catch behavioral regressions.
- Add checks for labels, keyboard navigation, focus behavior, drawer semantics, and live feedback.
- Verify responsive behavior through desktop, tablet, and mobile Cypress viewport sizes.
- Restore dependencies and require type-checking, the production build, and the complete Cypress suite to pass.

## Assumptions

- The product name remains "MyDevTools."
- All currently routed tools remain available; inactive Counter and Weather components stay out of scope.
- Dark mode is the default, with fully supported light mode.
- Favorites, recent-tool history, accounts, synchronization, and new tool functionality are excluded.
- Existing URLs remain compatible except `/`, which becomes the dashboard.
