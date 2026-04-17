# Changelog

## 1.0.0 — 2026-04-17

Initial release of `cmdk-vue` — a Vue 3 port of [cmdk](https://github.com/pacocoursey/cmdk) by Paco Coursey.

### Included

- `Command` — root component with filtering, sorting, and keyboard navigation
- `Command.Input` — search input, drives filtering automatically
- `Command.List` — animated list container with `--cmdk-list-height` CSS variable
- `Command.Item` — selectable item with `onSelect` callback
- `Command.Group` — labelled group with automatic show/hide when empty
- `Command.Separator` — visual divider, hidden when its group is empty
- `Command.Empty` — shown automatically when no items match
- `Command.Loading` — progress indicator for async data
- `Command.Dialog` — accessible dialog wrapper (uses `reka-ui` Dialog)
- `useCommandState(selector)` — composable to read filter state from anywhere in the tree
- Full TypeScript types for all components and props
- Custom filter function support via `:filter` prop
- `defaultFilter` export (commandScore algorithm) for custom implementations

### Notes

- Requires Vue 3.3+
- No styles included — bring your own or use the `[cmdk-*]` attribute selectors
- API is intentionally aligned with the React original for easy reference
