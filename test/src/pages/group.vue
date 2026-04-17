<script setup lang="ts">
import { ref } from 'vue'
import { Command } from 'cmdk-vue'

const search = ref('')
const forceMount = ref(false)
</script>

<template>
  <div>
    <button data-testid="forceMount" @click="forceMount = !forceMount">Force mount Group Letters</button>

    <Command>
      <Command.Input placeholder="Search…" v-model="search" />
      <Command.List>
        <Command.Empty>No results.</Command.Empty>
        <Command.Group heading="Animals">
          <Command.Item>Giraffe</Command.Item>
          <Command.Item>Chicken</Command.Item>
        </Command.Group>

        <Command.Group :force-mount="forceMount" heading="Letters">
          <Command.Item>A</Command.Item>
          <Command.Item>B</Command.Item>
          <Command.Item>Z</Command.Item>
        </Command.Group>

        <Command.Group v-if="search" heading="Numbers">
          <Command.Item>One</Command.Item>
          <Command.Item>Two</Command.Item>
          <Command.Item>Three</Command.Item>
        </Command.Group>
      </Command.List>
    </Command>
  </div>
</template>
