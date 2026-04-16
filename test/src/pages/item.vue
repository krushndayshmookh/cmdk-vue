<script setup lang="ts">
import { ref } from 'vue'
import { Command } from 'cmdk-vue'

const unmount = ref(false)
const mount = ref(false)
const many = ref(false)
const forceMount = ref(false)
</script>

<template>
  <div>
    <button data-testid="mount" @click="mount = !mount">Toggle item B</button>
    <button data-testid="unmount" @click="unmount = !unmount">Toggle item A</button>
    <button data-testid="many" @click="many = !many">Toggle many items</button>
    <button data-testid="forceMount" @click="forceMount = !forceMount">Force mount item A</button>

    <Command>
      <Command.Input placeholder="Search…" />
      <Command.List>
        <Command.Empty>No results.</Command.Empty>
        <Command.Item v-if="!unmount" :force-mount="forceMount">A</Command.Item>
        <template v-if="many">
          <Command.Item>1</Command.Item>
          <Command.Item>2</Command.Item>
          <Command.Item>3</Command.Item>
        </template>
        <Command.Item v-if="mount">B</Command.Item>
      </Command.List>
    </Command>
  </div>
</template>
