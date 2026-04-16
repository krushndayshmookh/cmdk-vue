<script lang="ts">
// CommandInput.vue — Vue 3 port of the Input component from
// cmdk (https://github.com/dip/cmdk) by Paco Coursey.
//
// Changes from the React original:
//   - useContext → inject
//   - useCmdk(selector) → computed(() => store.state.search)
//   - useEffect on [props.value] → watch
//   - Primitive.input → plain <input>
//   - onChange → @input / v-model
//   - Controlled v-model support via modelValue prop + update:modelValue emit
</script>

<script setup lang="ts">
import { inject, computed, watch } from 'vue'
import { StoreContextKey, CommandContextKey } from '../keys'
import type { InputProps } from '../types'

const props = defineProps<
  InputProps & {
    /** v-model support — maps to the search value */
    modelValue?: string
  }
>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:value': [value: string]
}>()

const store = inject(StoreContextKey)!
const context = inject(CommandContextKey)!

const search = computed(() => store.snapshot().search)
const selectedItemId = computed(() => store.snapshot().selectedItemId)

// Controlled mode: sync external value → store
watch(
  () => props.value ?? props.modelValue,
  (v) => {
    if (v != null) store.setState('search', v)
  },
  { flush: 'post' },
)

const isControlled = computed(() => props.value != null || props.modelValue != null)
const inputValue = computed(() => (isControlled.value ? (props.value ?? props.modelValue ?? '') : search.value))

function onInput(e: Event) {
  const val = (e.target as HTMLInputElement).value

  if (!isControlled.value) {
    store.setState('search', val)
  }

  emit('update:modelValue', val)
  emit('update:value', val)
  props.onValueChange?.(val)
}
</script>

<template>
  <input
    v-bind="$attrs"
    cmdk-input=""
    autocomplete="off"
    autocorrect="off"
    :spellcheck="false"
    aria-autocomplete="list"
    role="combobox"
    :aria-expanded="true"
    :aria-controls="context.listId"
    :aria-labelledby="context.labelId"
    :aria-activedescendant="selectedItemId ?? undefined"
    :id="context.inputId"
    type="text"
    :value="inputValue"
    @input="onInput"
  />
</template>
