<script lang="ts">
// CommandItem.vue — Vue 3 port of the Item component from
// cmdk (https://github.com/dip/cmdk) by Paco Coursey.
//
// Changes from the React original:
//   - useContext/GroupContext → inject
//   - useCmdk(selector) → computed from reactive store
//   - useLayoutEffect (item registration) → onMounted/onUnmounted
//   - useLayoutEffect (useValue reading children/textContent) → watchPostEffect;
//     slot VNode text is read once in onMounted (not inside the reactive effect)
//     to seed the initial value before the root div may be rendered.
//   - useEffect (SELECT_EVENT listener) → onMounted addEventListener
//   - useId (Radix) → getCurrentInstance().uid
//   - composeRefs → template ref + defineExpose
//   - Primitive.div → plain <div>
//   - return null → v-if on the template root
//   - inheritAttrs: false — attrs applied manually via v-bind to prevent duplication
//   - onSelect: prop-callback (React-style) so `@select="handler"` maps to the
//     `onSelect` prop directly; avoids ambiguity with the native DOM `select`
//     event that Vue's emit / fallthrough system can intercept.

export default {
  inheritAttrs: false,
}
</script>

<script setup lang="ts">
import {
  ref,
  computed,
  inject,
  onMounted,
  onUnmounted,
  watchPostEffect,
  getCurrentInstance,
  useSlots,
  useAttrs,
  type VNode,
} from 'vue'
import { CommandContextKey, StoreContextKey, GroupContextKey } from '../keys'
import { SELECT_EVENT, VALUE_ATTR } from '../utils'
import type { ItemProps } from '../types'

const props = withDefaults(defineProps<ItemProps>(), {
  disabled: false,
  forceMount: undefined,
})

const context = inject(CommandContextKey)!
const store = inject(StoreContextKey)!
const groupContext = inject(GroupContextKey, undefined)
const slots = useSlots()

const id = String(getCurrentInstance()!.uid)
const itemRef = ref<HTMLDivElement | null>(null)
const attrs = useAttrs()

const forceMount = computed(() => props.forceMount ?? groupContext?.forceMount ?? false)

// ---------------------------------------------------------------------------
// Value resolution — mirrors useValue from the original.
//
// React's `children` prop is always available even when the component renders
// null, so React can index the text value before the DOM element exists.
// In Vue, we work around this by:
//   1. Reading slot VNode text ONCE in onMounted (before watchPostEffect runs)
//      so items mounted while a search is active are pre-seeded in the index.
//   2. In watchPostEffect, falling back to `resolvedValue.value` (the last
//      known value) when the root div is not in the DOM, preventing the
//      search index from being cleared when an item is hidden by v-if.
// ---------------------------------------------------------------------------

const resolvedValue = ref<string>('')

/** Extract plain text from slot VNodes without touching the DOM. */
function getSlotText(): string {
  function extract(vn: VNode): string {
    if (typeof vn.children === 'string') return vn.children
    if (Array.isArray(vn.children)) return (vn.children as VNode[]).map(extract).join('')
    return ''
  }
  return (slots.default?.() ?? []).map(extract).join('').trim()
}

watchPostEffect(() => {
  const domText = itemRef.value?.textContent?.trim()
  // When the root div is in the DOM, use its textContent (most accurate).
  // When not in the DOM (v-if = false), fall back to the last known resolved
  // value so the search index is not cleared while the item is hidden.
  const v = props.value ?? domText ?? resolvedValue.value
  if (v !== resolvedValue.value) {
    resolvedValue.value = v
    context.value(id, v, props.keywords)
  }
  // Always sync the data-value attribute when the element is present, even
  // if the resolved value didn't change (e.g. when the item re-appears after
  // being hidden and the value was pre-seeded in onMounted).
  if (itemRef.value && resolvedValue.value) {
    itemRef.value.setAttribute(VALUE_ATTR, resolvedValue.value)
  }
})

// ---------------------------------------------------------------------------
// Derived display state
// ---------------------------------------------------------------------------

const selected = computed(() => {
  const s = store.snapshot()
  return Boolean(s.value && s.value === resolvedValue.value)
})

const render = computed(() => {
  if (forceMount.value) return true
  if (context.filter() === false) return true
  const s = store.snapshot()
  if (!s.search) return true
  return (s.filtered.items.get(id) ?? 0) > 0
})

// ---------------------------------------------------------------------------
// Item lifecycle — mirrors context.item() registration in original
// ---------------------------------------------------------------------------

let unregister: (() => void) | undefined

onMounted(() => {
  // Seed the value from slot VNode text BEFORE registering the item so that
  // filterItems() (scheduled by context.item) already has the correct ids
  // entry when the item mounts while a search is active (render may be false,
  // meaning itemRef.value is null and watchPostEffect can't read textContent).
  if (!props.value && !resolvedValue.value) {
    const slotVal = getSlotText()
    if (slotVal) {
      resolvedValue.value = slotVal
      context.value(id, slotVal, props.keywords)
    }
  }

  if (!forceMount.value) {
    unregister = context.item(id, groupContext?.id ?? '')
  }
})

onUnmounted(() => {
  unregister?.()
})

// ---------------------------------------------------------------------------
// SELECT_EVENT listener — mirrors the original useEffect
// ---------------------------------------------------------------------------

function onSelectItem() {
  select()
  // `onSelect` may end up in props or $attrs depending on whether the Vue
  // compiler successfully resolves the imported ItemProps type.  Check both
  // so the callback fires reliably in all environments.
  const handler = props.onSelect ?? (attrs as any).onSelect
  if (typeof handler === 'function') handler(resolvedValue.value)
}

function select() {
  store.setState('value', resolvedValue.value, true)
}

onMounted(() => {
  if (!props.disabled) {
    itemRef.value?.addEventListener(SELECT_EVENT, onSelectItem)
  }
})

onUnmounted(() => {
  itemRef.value?.removeEventListener(SELECT_EVENT, onSelectItem)
})

defineExpose({ el: itemRef })
</script>

<template>
  <div
    v-if="render"
    ref="itemRef"
    v-bind="$attrs"
    :id="id"
    cmdk-item=""
    role="option"
    :aria-disabled="String(Boolean(props.disabled))"
    :aria-selected="String(Boolean(selected))"
    :data-disabled="Boolean(props.disabled)"
    :data-selected="Boolean(selected)"
    @pointermove="!props.disabled && !context.getDisablePointerSelection() ? select() : undefined"
    @click="!props.disabled ? onSelectItem() : undefined"
  >
    <slot />
  </div>
</template>
