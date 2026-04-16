<script lang="ts">
// Command.vue — Vue 3 port of the root Command component from
// cmdk (https://github.com/dip/cmdk) by Paco Coursey.
//
// Changes from the React original:
//   - React.forwardRef → defineComponent + defineExpose
//   - React.createContext + useContext → provide/inject (keys.ts)
//   - useSyncExternalStore → Vue reactive() store (store.ts)
//   - useLayoutEffect → watchPostEffect / onMounted
//   - useScheduleLayoutEffect → nextTick-based scheduler (see scheduleLayoutEffect)
//   - useId (Radix) → getCurrentInstance().uid counter
//   - useAsRef → a plain ref updated in watchPostEffect
//   - Primitive.div → plain <div> with v-bind="$attrs"
//   - JSX → Vue SFC template
// All business logic (filterItems, sort, selectFirstItem, keyboard handler,
// scrollSelectedIntoView, etc.) is copied verbatim from the original.
//   - inheritAttrs: false — attrs applied manually via v-bind to prevent duplication

export default {
  inheritAttrs: false,
}
</script>

<script setup lang="ts">
import { ref, provide, computed, onMounted, nextTick, watch, useAttrs, getCurrentInstance } from 'vue'
import { commandScore } from '../command-score'
import { createStore } from '../store'
import { CommandContextKey, StoreContextKey } from '../keys'
import {
  GROUP_SELECTOR,
  GROUP_ITEMS_SELECTOR,
  GROUP_HEADING_SELECTOR,
  ITEM_SELECTOR,
  VALID_ITEM_SELECTOR,
  SELECT_EVENT,
  VALUE_ATTR,
  srOnlyStyles,
  findNextSibling,
  findPreviousSibling,
} from '../utils'
import type { CommandProps, CommandFilter, Context } from '../types'

// ---------------------------------------------------------------------------
// Props & emits
// ---------------------------------------------------------------------------

const props = withDefaults(defineProps<CommandProps>(), {
  shouldFilter: undefined,
  vimBindings: true,
  disablePointerSelection: false,
  loop: false,
})

const emit = defineEmits<{
  'update:value': [value: string]
  keydown: [e: KeyboardEvent]
}>()

const attrs = useAttrs()

// ---------------------------------------------------------------------------
// IDs (replaces useId from @radix-ui/react-id)
// ---------------------------------------------------------------------------

const uid = getCurrentInstance()!.uid
const listId = `cmdk-list-${uid}`
const labelId = `cmdk-label-${uid}`
const inputId = `cmdk-input-${uid}`

// ---------------------------------------------------------------------------
// Refs
// ---------------------------------------------------------------------------

const rootRef = ref<HTMLDivElement | null>(null)
const listInnerRef = ref<HTMLDivElement | null>(null)

// ---------------------------------------------------------------------------
// Store & state
// ---------------------------------------------------------------------------

const { state, store } = createStore(props.value ?? props.defaultValue ?? '')

// Track all items/groups/ids — mirrors the original's useLazyRef pattern
const allItems = new Set<string>()
const allGroups = new Map<string, Set<string>>()
const ids = new Map<string, { value: string; keywords?: string[] }>()

// ---------------------------------------------------------------------------
// Controlled value sync (mirrors useLayoutEffect on [value] in original)
// ---------------------------------------------------------------------------

watch(
  () => props.value,
  (v) => {
    if (v !== undefined) {
      state.value = v.trim()
      store.emit()
    }
  },
  { flush: 'post' },
)

// Search change — mirrors the `key === 'search'` branch inside setState in the
// original React component.  filterItems() + sort() must run synchronously
// (before Vue flushes DOM) so the `render` computed on each item sees the
// updated scores during the same microtask.  selectFirstItem() needs the DOM
// to be settled (items removed/added by v-if) so we schedule it for next tick.
watch(
  () => state.search,
  () => {
    filterItems()
    sort()
    scheduleLayoutEffect(1, selectFirstItem)
  },
  { flush: 'sync' },
)

// ---------------------------------------------------------------------------
// Scheduler — replaces useScheduleLayoutEffect
// Batches callbacks by priority id, flushes on next tick (post-render).
// ---------------------------------------------------------------------------

const scheduledFns = new Map<number, () => void>()
let schedulePending = false

function scheduleLayoutEffect(id: number, cb: () => void) {
  scheduledFns.set(id, cb)
  if (!schedulePending) {
    schedulePending = true
    nextTick(() => {
      scheduledFns.forEach((f) => f())
      scheduledFns.clear()
      schedulePending = false
    })
  }
}

// ---------------------------------------------------------------------------
// Filter / sort helpers — copied verbatim from original
// ---------------------------------------------------------------------------

const defaultFilter: CommandFilter = (value, search, keywords) => commandScore(value, search, keywords)

function score(value: string, keywords?: string[]) {
  const filterFn = props.filter ?? defaultFilter
  return value ? filterFn(value, state.search, keywords) : 0
}

function filterItems() {
  if (!state.search || props.shouldFilter === false) {
    state.filtered.count = allItems.size
    return
  }

  state.filtered.groups = new Set()
  let itemCount = 0

  for (const id of allItems) {
    const value = ids.get(id)?.value ?? ''
    const keywords = ids.get(id)?.keywords ?? []
    const rank = score(value, keywords)
    state.filtered.items.set(id, rank)
    if (rank > 0) itemCount++
  }

  for (const [groupId, group] of allGroups) {
    for (const itemId of group) {
      if ((state.filtered.items.get(itemId) ?? 0) > 0) {
        state.filtered.groups.add(groupId)
        break
      }
    }
  }

  state.filtered.count = itemCount
}

function sort() {
  if (!state.search || props.shouldFilter === false) {
    return
  }

  const scores = state.filtered.items

  const groups: [string, number][] = []
  state.filtered.groups.forEach((value) => {
    const items = allGroups.get(value)
    let max = 0
    items?.forEach((item) => {
      const s = scores.get(item) ?? 0
      max = Math.max(s, max)
    })
    groups.push([value, max])
  })

  const listInsertionElement = listInnerRef.value

  getValidItems()
    .sort((a, b) => {
      const valueA = a.getAttribute('id')!
      const valueB = b.getAttribute('id')!
      return (scores.get(valueB) ?? 0) - (scores.get(valueA) ?? 0)
    })
    .forEach((item) => {
      const group = item.closest(GROUP_ITEMS_SELECTOR)
      if (group) {
        group.appendChild(item.parentElement === group ? item : item.closest(`${GROUP_ITEMS_SELECTOR} > *`)!)
      } else {
        listInsertionElement?.appendChild(
          item.parentElement === listInsertionElement ? item : item.closest(`${GROUP_ITEMS_SELECTOR} > *`)!,
        )
      }
    })

  groups
    .sort((a, b) => b[1] - a[1])
    .forEach((group) => {
      const element = listInnerRef.value?.querySelector(
        `${GROUP_SELECTOR}[${VALUE_ATTR}="${encodeURIComponent(group[0])}"]`,
      )
      element?.parentElement?.appendChild(element)
    })
}

function selectFirstItem() {
  const item = getValidItems().find((item) => item.getAttribute('aria-disabled') !== 'true')
  const value = item?.getAttribute(VALUE_ATTR)
  store.setState('value', value || undefined)
}

function scrollSelectedIntoView() {
  const item = getSelectedItem()
  if (item) {
    if (item.parentElement?.firstChild === item) {
      item.closest(GROUP_SELECTOR)?.querySelector(GROUP_HEADING_SELECTOR)?.scrollIntoView({ block: 'nearest' })
    }
    item.scrollIntoView({ block: 'nearest' })
  }
}

function getSelectedItem() {
  return listInnerRef.value?.querySelector(`${ITEM_SELECTOR}[aria-selected="true"]`)
}

function getValidItems() {
  return Array.from(listInnerRef.value?.querySelectorAll(VALID_ITEM_SELECTOR) || []) as HTMLElement[]
}

// ---------------------------------------------------------------------------
// Navigation helpers — copied verbatim from original
// ---------------------------------------------------------------------------

function updateSelectedToIndex(index: number) {
  const items = getValidItems()
  const item = items[index]
  if (item) store.setState('value', item.getAttribute(VALUE_ATTR))
}

function updateSelectedByItem(change: 1 | -1) {
  const selected = getSelectedItem()
  const items = getValidItems()
  const index = items.findIndex((item) => item === selected)
  let newSelected = items[index + change]

  if (props.loop) {
    newSelected =
      index + change < 0 ? items[items.length - 1] : index + change === items.length ? items[0] : items[index + change]
  }

  if (newSelected) store.setState('value', newSelected.getAttribute(VALUE_ATTR))
}

function updateSelectedByGroup(change: 1 | -1) {
  const selected = getSelectedItem()
  let group = selected?.closest(GROUP_SELECTOR)
  let item: HTMLElement | undefined

  while (group && !item) {
    group = change > 0 ? findNextSibling(group, GROUP_SELECTOR) : findPreviousSibling(group, GROUP_SELECTOR)
    item = group?.querySelector(VALID_ITEM_SELECTOR) as HTMLElement | undefined
  }

  if (item) {
    store.setState('value', item.getAttribute(VALUE_ATTR))
  } else {
    updateSelectedByItem(change)
  }
}

const last = () => updateSelectedToIndex(getValidItems().length - 1)

function next(e: KeyboardEvent) {
  e.preventDefault()
  if (e.metaKey) last()
  else if (e.altKey) updateSelectedByGroup(1)
  else updateSelectedByItem(1)
}

function prev(e: KeyboardEvent) {
  e.preventDefault()
  if (e.metaKey) updateSelectedToIndex(0)
  else if (e.altKey) updateSelectedByGroup(-1)
  else updateSelectedByItem(-1)
}

// ---------------------------------------------------------------------------
// Keyboard handler — copied verbatim from original
// (e.nativeEvent.isComposing → e.isComposing, the only change)
// ---------------------------------------------------------------------------

function onKeydown(e: KeyboardEvent) {
  emit('keydown', e)

  const isComposing = e.isComposing || e.keyCode === 229
  if (e.defaultPrevented || isComposing) return

  switch (e.key) {
    case 'n':
    case 'j':
      if (props.vimBindings && e.ctrlKey) next(e)
      break
    case 'ArrowDown':
      next(e)
      break
    case 'p':
    case 'k':
      if (props.vimBindings && e.ctrlKey) prev(e)
      break
    case 'ArrowUp':
      prev(e)
      break
    case 'Home':
      e.preventDefault()
      updateSelectedToIndex(0)
      break
    case 'End':
      e.preventDefault()
      last()
      break
    case 'Enter': {
      e.preventDefault()
      const item = getSelectedItem()
      if (item) item.dispatchEvent(new Event(SELECT_EVENT))
      break
    }
  }
}

// ---------------------------------------------------------------------------
// Context — provided to child components (mirrors React Context.Provider)
// ---------------------------------------------------------------------------

const context: Context = {
  value: (id, value, keywords) => {
    if (value !== ids.get(id)?.value) {
      ids.set(id, { value, keywords })
      state.filtered.items.set(id, score(value, keywords))
      scheduleLayoutEffect(2, () => {
        sort()
        store.emit()
      })
    }
  },
  item: (id, groupId) => {
    allItems.add(id)

    if (groupId) {
      if (!allGroups.has(groupId)) allGroups.set(groupId, new Set([id]))
      else allGroups.get(groupId)!.add(id)
    }

    scheduleLayoutEffect(3, () => {
      filterItems()
      sort()
      if (!state.value) selectFirstItem()
      store.emit()
    })

    return () => {
      // Capture the item's registered value BEFORE deleting it.
      // At onUnmounted time the DOM element may already be removed, so we
      // cannot rely on getSelectedItem() to identify the previously-selected
      // item.  Comparing state.value against the last-known value is the
      // approach used in the original React source.
      const itemValue = ids.get(id)?.value
      ids.delete(id)
      allItems.delete(id)
      state.filtered.items.delete(id)

      scheduleLayoutEffect(4, () => {
        filterItems()
        if (state.value === itemValue) selectFirstItem()
        store.emit()
      })
    }
  },
  group: (id) => {
    if (!allGroups.has(id)) allGroups.set(id, new Set())

    return () => {
      ids.delete(id)
      allGroups.delete(id)
    }
  },
  filter: () => props.shouldFilter !== false,
  get label() {
    return props.label ?? (attrs['aria-label'] as string) ?? ''
  },
  getDisablePointerSelection: () => props.disablePointerSelection,
  listId,
  labelId,
  inputId,
  listInnerRef,
}

// Handle value change from store (controlled mode callback)
watch(
  () => state.value,
  (newValue) => {
    // Schedule selectedItemId update (priority 7)
    scheduleLayoutEffect(7, () => {
      state.selectedItemId = getSelectedItem()?.id
      store.emit()
    })
    // Schedule scroll (priority 5)
    scheduleLayoutEffect(5, scrollSelectedIntoView)
    // Controlled mode: emit instead of mutating internally
    if (props.value !== undefined) {
      emit('update:value', newValue ?? '')
    }
  },
  { flush: 'post' },
)

// Schedule initial scroll (priority 6)
onMounted(() => {
  scheduleLayoutEffect(6, scrollSelectedIntoView)
})

provide(CommandContextKey, context)
provide(StoreContextKey, store)

// Expose root element ref for parent template refs
defineExpose({ el: rootRef })
</script>

<template>
  <div ref="rootRef" v-bind="$attrs" cmdk-root="" :tabindex="-1" @keydown="onKeydown">
    <label cmdk-label="" :for="inputId" :id="labelId" :style="srOnlyStyles">{{ props.label }}</label>
    <slot />
  </div>
</template>
