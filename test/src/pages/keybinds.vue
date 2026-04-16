<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Command } from 'cmdk-vue'

const route = useRoute()
const vimBindings = computed(() => route.query.noVim !== 'true')
</script>

<template>
  <div>
    <Command :vim-bindings="vimBindings">
      <Command.Input />
      <Command.List>
        <Command.Empty>No results.</Command.Empty>

        <Command.Item value="disabled" disabled>Disabled</Command.Item>
        <Command.Item value="first">First</Command.Item>

        <Command.Group heading="Letters">
          <Command.Item>A</Command.Item>
          <Command.Item>B</Command.Item>
          <Command.Item>Z</Command.Item>
        </Command.Group>

        <Command.Group heading="Fruits">
          <Command.Item>Apple</Command.Item>
          <Command.Item>Banana</Command.Item>
          <Command.Item>Orange</Command.Item>
          <Command.Item disabled>Dragon Fruit</Command.Item>
          <Command.Item>Pear</Command.Item>
        </Command.Group>

        <Command.Item value="last">Last</Command.Item>
        <Command.Item value="disabled-3" disabled>Disabled 3</Command.Item>
      </Command.List>
    </Command>
  </div>
</template>
