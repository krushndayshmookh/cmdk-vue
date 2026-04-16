<script lang="ts">
// CommandEmpty.vue — Vue 3 port of the Empty component from
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

const store = inject(StoreContextKey)!

// Visible when filtered count is 0 — mirrors useCmdk((state) => state.filtered.count === 0)
const render = computed(() => store.snapshot().filtered.count === 0)
</script>

<template>
  <div
    v-if="render"
    v-bind="$attrs"
    cmdk-empty=""
    role="presentation"
  >
    <slot />
  </div>
</template>
