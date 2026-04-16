<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Command } from 'cmdk-vue'

const open = ref(false)
onMounted(() => { open.value = true })
</script>

<template>
  <div>
    <Command.Dialog v-model:open="open">
      <Command.Input placeholder="Search…" />
      <Command.List>
        <Command.Empty>No results.</Command.Empty>
        <Command.Item @select="() => console.log('Item selected')">Item</Command.Item>
        <Command.Item value="xxx">Value</Command.Item>
      </Command.List>
    </Command.Dialog>
  </div>
</template>
