<script setup lang="ts">
import { Command } from 'cmdk-vue'
</script>

<template>
  <div>
    <Command class="root">
      <Command.Input placeholder="Search…" class="input" />
      <Command.List class="list">
        <Command.Empty class="empty">No results.</Command.Empty>
        <Command.Item
          :keywords="['key']"
          class="item"
          @select="() => ((window as any).onSelect = 'Item selected')"
        >
          Item
        </Command.Item>
        <Command.Item value="xxx" class="item">Value</Command.Item>
      </Command.List>
    </Command>
  </div>
</template>
