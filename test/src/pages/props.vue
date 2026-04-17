<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Command } from 'cmdk-vue'
import type { CommandFilter } from 'cmdk-vue'

const route = useRoute()
const value = ref('ant')
const search = ref('')
const shouldFilter = ref(true)
const useCustomFilter = ref(false)

onMounted(() => {
  if (route.query.shouldFilter === 'false') shouldFilter.value = false
  if (route.query.customFilter === 'true') useCustomFilter.value = true
  if (route.query.initialValue) value.value = route.query.initialValue as string
})

const customFilter: CommandFilter = (item, search) => {
  console.log(item, search)
  if (!search || !item) return 1
  return item.endsWith(search) ? 1 : 0
}

const filter = computed(() => (useCustomFilter.value ? customFilter : undefined))
</script>

<template>
  <div>
    <div data-testid="value">{{ value }}</div>
    <div data-testid="search">{{ search }}</div>

    <button data-testid="controlledValue" @click="value = 'anteater'">Change value</button>
    <button data-testid="controlledSearch" @click="search = 'eat'">Change search value</button>

    <Command :should-filter="shouldFilter" v-model:value="value" :filter="filter">
      <Command.Input placeholder="Search…" v-model="search" />
      <Command.List>
        <Command.Item>ant</Command.Item>
        <Command.Item>anteater</Command.Item>
      </Command.List>
    </Command>
  </div>
</template>
