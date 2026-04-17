<script lang="ts">
// CommandLoading.vue — Vue 3 port of the Loading component from
// cmdk (https://github.com/dip/cmdk) by Paco Coursey.
//
// Changes from the React original:
//   - Primitive.div → plain <div>
//   - SlottableWithNestedChildren wrapper div → plain <div aria-hidden>
//   - inheritAttrs: false — attrs applied manually via v-bind to prevent duplication

export default {
  inheritAttrs: false,
}
</script>

<script setup lang="ts">
import type { LoadingProps } from '../types'

const props = withDefaults(defineProps<LoadingProps>(), {
  label: 'Loading...',
})
</script>

<template>
  <div
    v-bind="$attrs"
    cmdk-loading=""
    role="progressbar"
    :aria-valuenow="props.progress"
    :aria-valuemin="0"
    :aria-valuemax="100"
    :aria-label="props.label"
  >
    <div aria-hidden="true">
      <slot />
    </div>
  </div>
</template>
