<script setup lang="ts">
import { ref } from 'vue'
import { Command } from 'cmdk-vue'

const count = ref(0)
</script>

<template>
  <div>
    <button data-testid="increment" @click="count++">Increment count</button>

    <Command>
      <Command.Input placeholder="Search…" />
      <Command.List>
        <Command.Empty>No results.</Command.Empty>
        <Command.Item :value="`Item A ${count}`">Item A {{ count }}</Command.Item>
        <Command.Item :value="`Item B ${count}`">Item B {{ count }}</Command.Item>
      </Command.List>
    </Command>
  </div>
</template>
