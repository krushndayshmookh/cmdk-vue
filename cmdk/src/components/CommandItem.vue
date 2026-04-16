<script lang="ts">
// CommandItem.vue — Vue 3 port of the Item component from
// cmdk (https://github.com/dip/cmdk) by Paco Coursey.
//
// Changes from the React original:
//   - useContext/GroupContext → inject
//   - useCmdk(selector) → computed from reactive store
//   - useLayoutEffect (item registration) → onMounted/onUnmounted
//   - useLayoutEffect (useValue) → watchPostEffect to read textContent
//   - useEffect (SELECT_EVENT listener) → onMounted addEventListener
//   - useId (Radix) → getCurrentInstance().uid
//   - composeRefs → template ref + defineExpose
//   - Primitive.div → plain <div>
//   - return null → v-if on the template root
</script>

<script setup lang="ts">
import { ref, computed, inject, onMounted, onUnmounted, watchPostEffect, getCurrentInstance } from 'vue'
import { CommandContextKey, StoreContextKey, GroupContextKey } from '../keys'
import { SELECT_EVENT, VALUE_ATTR } from '../utils'
import type { ItemProps } from '../types'

const props = withDefaults(defineProps<ItemProps>(), {
  disabled: false,
  forceMount: undefined,
})

const emit = defineEmits<{
  select: [value: string]
}>()

const context = inject(CommandContextKey)!
const store = inject(StoreContextKey)!
const groupContext = inject(GroupContextKey, undefined)

const id = String(getCurrentInstance()!.uid)
const itemRef = ref<HTMLDivElement | null>(null)

const forceMount = computed(() => props.forceMount ?? groupContext?.forceMount ?? false)

// Reactive value — mirrors useValue from original
// Priority: explicit prop.value → textContent of element
const resolvedValue = ref<string>('')

watchPostEffect(() => {
  const v = props.value ?? itemRef.value?.textContent?.trim() ?? ''
  if (v !== resolvedValue.value) {
    resolvedValue.value = v
    context.value(id, v, props.keywords)
    itemRef.value?.setAttribute(VALUE_ATTR, v)
  }
})

// Derived display state
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

// Item lifecycle — mirrors context.item() registration in original
let unregister: (() => void) | undefined

onMounted(() => {
  if (!forceMount.value) {
    unregister = context.item(id, groupContext?.id ?? '')
  }
})

onUnmounted(() => {
  unregister?.()
})

// SELECT_EVENT listener — mirrors the original useEffect
function onSelect() {
  select()
  emit('select', resolvedValue.value)
  props.onSelect?.(resolvedValue.value)
}

function select() {
  store.setState('value', resolvedValue.value, true)
}

onMounted(() => {
  if (!props.disabled) {
    itemRef.value?.addEventListener(SELECT_EVENT, onSelect)
  }
})

onUnmounted(() => {
  itemRef.value?.removeEventListener(SELECT_EVENT, onSelect)
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
    @click="!props.disabled ? onSelect() : undefined"
  >
    <slot />
  </div>
</template>
