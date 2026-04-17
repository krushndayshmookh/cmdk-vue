<script lang="ts">
// CommandList.vue — Vue 3 port of the List component from
// cmdk (https://github.com/dip/cmdk) by Paco Coursey.
//
// Changes from the React original:
//   - useContext → inject
//   - useCmdk(selector) → computed from reactive store
//   - useEffect (ResizeObserver) → onMounted
//   - composeRefs(ref, forwardedRef) → single template ref + defineExpose
//   - composeRefs(height, context.listInnerRef) → template ref assigned to context.listInnerRef
//   - Primitive.div → plain <div>
//   - inheritAttrs: false — attrs applied manually via v-bind to prevent duplication

export default {
  inheritAttrs: false,
}
</script>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import { CommandContextKey, StoreContextKey } from '../keys'
import type { ListProps } from '../types'

const props = withDefaults(defineProps<ListProps>(), {
  label: 'Suggestions',
})

const store = inject(StoreContextKey)!
const context = inject(CommandContextKey)!

const selectedItemId = computed(() => store.snapshot().selectedItemId)

const listRef = ref<HTMLDivElement | null>(null)
const sizerRef = ref<HTMLDivElement | null>(null)

// Expose root element
defineExpose({ el: listRef })

// ResizeObserver — mirrors the original useEffect exactly
let animationFrame: number
let observer: ResizeObserver

onMounted(() => {
  if (sizerRef.value && listRef.value) {
    const el = sizerRef.value
    const wrapper = listRef.value

    observer = new ResizeObserver(() => {
      animationFrame = requestAnimationFrame(() => {
        const height = el.offsetHeight
        wrapper.style.setProperty('--cmdk-list-height', height.toFixed(1) + 'px')
      })
    })
    observer.observe(el)

    // Assign the sizer ref into the shared context so Command.vue can use
    // listInnerRef for DOM queries (same as composeRefs in the original)
    context.listInnerRef.value = sizerRef.value
  }
})

onUnmounted(() => {
  cancelAnimationFrame(animationFrame)
  if (sizerRef.value) observer?.unobserve(sizerRef.value)
})
</script>

<template>
  <div
    ref="listRef"
    v-bind="$attrs"
    cmdk-list=""
    role="listbox"
    :tabindex="-1"
    :aria-activedescendant="selectedItemId ?? undefined"
    :aria-label="props.label"
    :id="context.listId"
  >
    <div ref="sizerRef" cmdk-list-sizer="">
      <slot />
    </div>
  </div>
</template>
