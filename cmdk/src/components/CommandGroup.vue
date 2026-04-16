<script lang="ts">
// CommandGroup.vue — Vue 3 port of the Group component from
// cmdk (https://github.com/dip/cmdk) by Paco Coursey.
//
// Changes from the React original:
//   - useContext → inject
//   - GroupContext.Provider → provide(GroupContextKey, ...)
//   - useCmdk(selector) → computed from reactive store
//   - useLayoutEffect (group registration) → onMounted/onUnmounted
//   - useLayoutEffect (useValue reading heading textContent) → watchPostEffect
//   - useId (Radix) → getCurrentInstance().uid
//   - composeRefs → template ref + defineExpose
//   - heading?: React.ReactNode → heading?: string + named slot 'heading'
//   - Primitive.div → plain <div>
//   - hidden={render ? undefined : true} → :hidden="!render || undefined"
</script>

<script setup lang="ts">
import { ref, computed, inject, provide, onMounted, onUnmounted, watchPostEffect, getCurrentInstance } from 'vue'
import { CommandContextKey, StoreContextKey, GroupContextKey } from '../keys'
import { VALUE_ATTR } from '../utils'
import type { GroupProps } from '../types'

const props = defineProps<GroupProps>()

const context = inject(CommandContextKey)!
const store = inject(StoreContextKey)!

const uid = getCurrentInstance()!.uid
const id = String(uid)
const headingId = `cmdk-group-heading-${uid}`

const groupRef = ref<HTMLDivElement | null>(null)
const headingRef = ref<HTMLDivElement | null>(null)

// Render visibility — mirrors useCmdk selector in original
const render = computed(() => {
  if (props.forceMount) return true
  if (context.filter() === false) return true
  const s = store.snapshot()
  if (!s.search) return true
  return s.filtered.groups.has(id)
})

// Value resolution (mirrors useValue) — explicit prop.value → heading text → heading slot text
watchPostEffect(() => {
  const v = props.value ?? props.heading ?? headingRef.value?.textContent?.trim() ?? ''
  groupRef.value?.setAttribute(VALUE_ATTR, encodeURIComponent(v))
  context.value(id, v)
})

// Group lifecycle registration — mirrors context.group() in original
let unregister: (() => void) | undefined

onMounted(() => {
  unregister = context.group(id)
})

onUnmounted(() => {
  unregister?.()
})

// Provide group context to child Items
provide(GroupContextKey, {
  id,
  get forceMount() {
    return props.forceMount
  },
})

defineExpose({ el: groupRef })
</script>

<template>
  <div
    ref="groupRef"
    v-bind="$attrs"
    cmdk-group=""
    role="presentation"
    :hidden="!render || undefined"
  >
    <!-- heading: accepts either the heading prop (string) or a named slot -->
    <div
      v-if="props.heading || $slots.heading"
      ref="headingRef"
      cmdk-group-heading=""
      aria-hidden="true"
      :id="headingId"
    >
      <slot name="heading">{{ props.heading }}</slot>
    </div>
    <div
      cmdk-group-items=""
      role="group"
      :aria-labelledby="(props.heading || $slots.heading) ? headingId : undefined"
    >
      <slot />
    </div>
  </div>
</template>
