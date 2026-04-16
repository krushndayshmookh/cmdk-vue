<script lang="ts">
// CommandSeparator.vue — Vue 3 port of the Separator component from
// cmdk (https://github.com/dip/cmdk) by Paco Coursey.
//
// Changes from the React original:
//   - useCmdk(selector) → computed from reactive store
//   - return null → v-if on root element
//   - Primitive.div → plain <div>
</script>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { StoreContextKey } from '../keys'
import type { SeparatorProps } from '../types'

const props = withDefaults(defineProps<SeparatorProps>(), {
  alwaysRender: false,
})

const store = inject(StoreContextKey)!

// Visible when search is empty — mirrors useCmdk((state) => !state.search)
const render = computed(() => !store.snapshot().search)
</script>

<template>
  <div
    v-if="props.alwaysRender || render"
    v-bind="$attrs"
    cmdk-separator=""
    role="separator"
  />
</template>
