<script setup lang="ts">
// Performance benchmark page — 1000 items.
// React.Profiler has no direct Vue equivalent; Vue DevTools / browser
// performance panel cover the same use case during development.
import { Command } from 'cmdk-vue'

const items = Array.from({ length: 1000 }, (_, i) => i)
</script>

<template>
  <div>
    <Command>
      <Command.Input placeholder="Search…" />
      <Command.List>
        <Command.Item v-for="i in items" :key="`item-${i}`" :value="`Item ${i}`"> Item {{ i }} </Command.Item>
      </Command.List>
    </Command>
  </div>
</template>
