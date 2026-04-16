<p align="center">
<img src="./website/public/og.png" />
</p>

# ⌘K for Vue 3

> A Vue 3 port of [cmdk](https://github.com/pacocoursey/cmdk) — the composable command menu component.

**Original authors:** [Paco Coursey](https://github.com/pacocoursey) and [contributors](https://github.com/pacocoursey/cmdk/graphs/contributors). The core architecture, filtering algorithm, accessibility design, and all fundamental ideas in this library are entirely their work. Please star [the original](https://github.com/dip/cmdk).

**This fork** was created by [Krushn Dayshmookh](https://github.com/krushndayshmookh) with the assistance of [Claude](https://claude.ai) (Anthropic AI). The goal is a line-for-line faithful Vue 3 port — minimal changes, maximum parity.

---

⌘K is a command menu component that can also be used as an accessible combobox. You render items, it filters and sorts them automatically. Supports a fully composable API <sup><sup>[How?](/ARCHITECTURE.md)</sup></sup>, so you can wrap items in other components or even as static JSX.

## Install

```bash
pnpm install cmdk-vue
```

## Use

```vue
<script setup>
import { Command } from 'cmdk-vue'
</script>

<template>
  <Command label="Command Menu">
    <Command.Input />
    <Command.List>
      <Command.Empty>No results found.</Command.Empty>

      <Command.Group heading="Letters">
        <Command.Item>a</Command.Item>
        <Command.Item>b</Command.Item>
        <Command.Separator />
        <Command.Item>c</Command.Item>
      </Command.Group>

      <Command.Item>Apple</Command.Item>
    </Command.List>
  </Command>
</template>
```

Or in a dialog:

```vue
<script setup>
import { ref } from 'vue'
import { Command } from 'cmdk-vue'

const open = ref(false)

function onKeydown(e) {
  if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault()
    open.value = !open.value
  }
}

document.addEventListener('keydown', onKeydown)
</script>

<template>
  <Command.Dialog :open="open" @update:open="open = $event" label="Global Command Menu">
    <Command.Input />
    <Command.List>
      <Command.Empty>No results found.</Command.Empty>

      <Command.Group heading="Letters">
        <Command.Item>a</Command.Item>
        <Command.Item>b</Command.Item>
        <Command.Separator />
        <Command.Item>c</Command.Item>
      </Command.Group>

      <Command.Item>Apple</Command.Item>
    </Command.List>
  </Command.Dialog>
</template>
```

## Parts and styling

All parts forward attrs to an appropriate element. Each part has a specific data-attribute (starting with `cmdk-`) that can be used for styling.

### Command `[cmdk-root]`

Render this to show the command menu inline, or use [Dialog](#dialog-cmdk-dialog-cmdk-overlay) to render in an elevated context. Can be controlled with the `value` and `onValueChange` props.

> **Note**
>
> Values are always trimmed with the [trim()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim) method.

```vue
<script setup>
const value = ref('apple')
</script>

<template>
  <Command :value="value" @update:value="value = $event">
    <Command.Input />
    <Command.List>
      <Command.Item>Orange</Command.Item>
      <Command.Item>Apple</Command.Item>
    </Command.List>
  </Command>
</template>
```

You can provide a custom `filter` function that is called to rank each item. Note that the value will be trimmed.

```vue
<Command :filter="(value, search) => (value.includes(search) ? 1 : 0)" />
```

A third argument, `keywords`, can also be provided to the filter function. Keywords act as aliases for the item value, and can also affect the rank of the item. Keywords are trimmed.

```vue
<Command
  :filter="
    (value, search, keywords) => {
      const extendValue = value + ' ' + keywords.join(' ')
      return extendValue.includes(search) ? 1 : 0
    }
  "
/>
```

Or disable filtering and sorting entirely:

```vue
<Command :should-filter="false">
  <Command.List>
    <Command.Item v-for="item in filteredItems" :key="item" :value="item">
      {{ item }}
    </Command.Item>
  </Command.List>
</Command>
```

You can make the arrow keys wrap around the list by setting the `loop` prop:

```vue
<Command loop />
```

### Dialog `[cmdk-dialog]` `[cmdk-overlay]`

Props are forwarded to [Command](#command-cmdk-root). Composes [Reka UI](https://reka-ui.com)'s Dialog component. The overlay is always rendered. Can be controlled with the `open` and `@update:open` props.

```vue
<Command.Dialog :open="open" @update:open="open = $event">
  ...
</Command.Dialog>
```

You can provide a `container` prop to specify which element the Dialog should portal into (defaults to `body`).

### Input `[cmdk-input]`

All attrs are forwarded to the underlying `input` element. Can be controlled with the `value` and `@update:value` props.

```vue
<Command.Input :value="search" @update:value="search = $event" />
```

### List `[cmdk-list]`

Contains items and groups. Animate height using the `--cmdk-list-height` CSS variable.

```css
[cmdk-list] {
  min-height: 300px;
  height: var(--cmdk-list-height);
  max-height: 500px;
  transition: height 100ms ease;
}
```

To scroll item into view earlier near the edges of the viewport, use scroll-padding:

```css
[cmdk-list] {
  scroll-padding-block-start: 8px;
  scroll-padding-block-end: 8px;
}
```

### Item `[cmdk-item]` `[data-disabled?]` `[data-selected?]`

Item that becomes active on pointer enter. You should provide a unique `value` for each item, but it will be automatically inferred from the `.textContent`.

```vue
<Command.Item @select="(value) => console.log('Selected', value)">
  Apple
</Command.Item>
```

You can also provide a `keywords` prop to help with filtering:

```vue
<Command.Item :keywords="['fruit', 'apple']">Apple</Command.Item>
```

You can force an item to always render, regardless of filtering, by passing the `forceMount` prop.

### Group `[cmdk-group]` `[hidden?]`

Groups items together with the given `heading` (`[cmdk-group-heading]`).

```vue
<Command.Group heading="Fruit">
  <Command.Item>Apple</Command.Item>
</Command.Group>
```

Groups will not unmount from the DOM, rather the `hidden` attribute is applied to hide it from view.

You can force a group to always render, regardless of filtering, by passing the `forceMount` prop.

### Separator `[cmdk-separator]`

Visible when the search query is empty or `alwaysRender` is true, hidden otherwise.

### Empty `[cmdk-empty]`

Automatically renders when there are no results for the search query.

### Loading `[cmdk-loading]`

You should conditionally render this with `progress` while loading asynchronous items.

```vue
<Command.List>
  <Command.Loading v-if="loading">Hang on…</Command.Loading>
</Command.List>
```

### `useCommandState(state => state.selectedField)`

Composable that returns a computed ref of a slice of command menu state. Pass a selector function. This is provided for advanced use cases and should not be commonly used.

```vue
<script setup>
import { useCommandState } from 'cmdk-vue'
const search = useCommandState((state) => state.search)
</script>

<template>
  <Command.Empty>No results found for "{{ search }}".</Command.Empty>
</template>
```

## Examples

### Nested items

```vue
<script setup>
const search = ref('')
const pages = ref([])
const page = computed(() => pages.value[pages.value.length - 1])

function onKeydown(e) {
  if (e.key === 'Escape' || (e.key === 'Backspace' && !search.value)) {
    e.preventDefault()
    pages.value = pages.value.slice(0, -1)
  }
}
</script>

<template>
  <Command @keydown="onKeydown">
    <Command.Input :value="search" @update:value="search = $event" />
    <Command.List>
      <template v-if="!page">
        <Command.Item @select="pages = [...pages, 'projects']">Search projects…</Command.Item>
        <Command.Item @select="pages = [...pages, 'teams']">Join a team…</Command.Item>
      </template>
      <template v-if="page === 'projects'">
        <Command.Item>Project A</Command.Item>
        <Command.Item>Project B</Command.Item>
      </template>
      <template v-if="page === 'teams'">
        <Command.Item>Team 1</Command.Item>
        <Command.Item>Team 2</Command.Item>
      </template>
    </Command.List>
  </Command>
</template>
```

### Show sub-items when searching

```vue
<script setup>
import { useCommandState } from 'cmdk-vue'

const SubItem = defineComponent({
  setup(props, { slots }) {
    const search = useCommandState((state) => state.search)
    return () => (search.value ? h(CommandItem, props, slots) : null)
  },
})
</script>
```

### Asynchronous results

```vue
<script setup>
const loading = ref(false)
const items = ref([])

onMounted(async () => {
  loading.value = true
  items.value = await api.get('/dictionary')
  loading.value = false
})
</script>

<template>
  <Command>
    <Command.Input />
    <Command.List>
      <Command.Loading v-if="loading">Fetching words…</Command.Loading>
      <Command.Item v-for="item in items" :key="item" :value="item">
        {{ item }}
      </Command.Item>
    </Command.List>
  </Command>
</template>
```

### Drop in stylesheets

See [website/styles/cmdk](website/styles/cmdk) for example stylesheets.

## FAQ

**Accessible?** Yes. Labeling, aria attributes, and DOM ordering tested with Voice Over and Chrome DevTools.

**Virtualization?** No. Good performance up to 2,000–3,000 items.

**Filter/sort items manually?** Yes. Pass `:should-filter="false"` to Command.

**Vue 3?** Yes, required. Uses Vue 3 reactivity and composables.

**Unstyled?** Yes, use the listed CSS selectors.

**React strict mode equivalent?** Not applicable — Vue has no equivalent concern.

## History

The original ⌘K was written in 2019 by Paco ([@pacocoursey](https://twitter.com/pacocoursey)). Used for the Vercel command menu and autocomplete by Rauno ([@raunofreiberg](https://twitter.com/raunofreiberg)) in 2020. Re-written in 2022 with a simpler and more performant approach. Ideas and help from Shu ([@shuding\_](https://twitter.com/shuding_)).

This Vue 3 port was created in 2024–2025 by [Krushn Dayshmookh](https://github.com/krushndayshmookh) with AI assistance (Claude, Anthropic). The architecture, scoring algorithm, and all core ideas remain those of the original authors.

## Testing

```bash
pnpm install
pnpm playwright install
pnpm build
pnpm test
```
