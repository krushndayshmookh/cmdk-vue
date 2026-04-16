<script lang="ts">
// CommandDialog.vue — Vue 3 port of the Dialog component from
// cmdk (https://github.com/dip/cmdk) by Paco Coursey.
//
// Changes from the React original:
//   - @radix-ui/react-dialog → reka-ui Dialog components
//     (reka-ui is the official Vue 3 port of Radix UI)
//   - onOpenChange callback prop → v-model:open / update:open emit
//   - All Command props forwarded to the inner <Command> component
</script>

<script setup lang="ts">
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
} from 'reka-ui'
import Command from './Command.vue'
import type { DialogProps } from '../types'

const props = withDefaults(defineProps<DialogProps>(), {
  open: false,
  vimBindings: true,
  disablePointerSelection: false,
  loop: false,
})

const emit = defineEmits<{
  'update:open': [open: boolean]
  'update:value': [value: string]
}>()
</script>

<template>
  <DialogRoot :open="props.open" @update:open="emit('update:open', $event)">
    <DialogPortal :to="props.container ?? 'body'">
      <DialogOverlay cmdk-overlay="" :class="props.overlayClassName" />
      <DialogContent
        cmdk-dialog=""
        :aria-label="props.label"
        :class="props.contentClassName"
      >
        <Command
          :label="props.label"
          :should-filter="props.shouldFilter"
          :filter="props.filter"
          :default-value="props.defaultValue"
          :value="props.value"
          :loop="props.loop"
          :disable-pointer-selection="props.disablePointerSelection"
          :vim-bindings="props.vimBindings"
          @update:value="emit('update:value', $event)"
        >
          <slot />
        </Command>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
