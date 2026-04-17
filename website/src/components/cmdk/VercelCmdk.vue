<script setup lang="ts">
import { ref, computed } from 'vue'
import { Command } from 'cmdk-vue'
import type { ComponentPublicInstance } from 'vue'

const inputValue = ref('')
const pages = ref<string[]>(['home'])
const activePage = computed(() => pages.value[pages.value.length - 1])
const isHome = computed(() => activePage.value === 'home')
const commandRef = ref<ComponentPublicInstance | null>(null)

function popPage() {
  pages.value = pages.value.slice(0, -1)
}

function bounce() {
  const el = commandRef.value?.$el as HTMLElement | undefined
  if (el) {
    el.style.transform = 'scale(0.96)'
    setTimeout(() => {
      if (el) el.style.transform = ''
    }, 100)
    inputValue.value = ''
  }
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    bounce()
  }
  if (isHome.value || inputValue.value.length) return
  if (e.key === 'Backspace') {
    e.preventDefault()
    popPage()
    bounce()
  }
}
</script>

<template>
  <div class="vercel">
    <Command ref="commandRef" @keydown="onKeyDown">
      <div>
        <div v-for="p in pages" :key="p" cmdk-vercel-badge="">{{ p }}</div>
      </div>
      <Command.Input
        autofocus
        placeholder="What do you need?"
        :value="inputValue"
        @update:value="(v: string) => (inputValue = v)"
      />
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>

        <!-- Home page -->
        <template v-if="activePage === 'home'">
          <Command.Group heading="Projects">
            <Command.Item value="Search Projects" :onSelect="() => pages.push('projects')">
              <ProjectsIcon />
              Search Projects...
              <div cmdk-vercel-shortcuts=""><kbd>S</kbd><kbd>P</kbd></div>
            </Command.Item>
            <Command.Item value="Create New Project">
              <PlusIcon />
              Create New Project...
            </Command.Item>
          </Command.Group>
          <Command.Group heading="Teams">
            <Command.Item value="Search Teams">
              <TeamsIcon />
              Search Teams...
              <div cmdk-vercel-shortcuts=""><kbd>⇧</kbd><kbd>P</kbd></div>
            </Command.Item>
            <Command.Item value="Create New Team">
              <PlusIcon />
              Create New Team...
            </Command.Item>
          </Command.Group>
          <Command.Group heading="Help">
            <Command.Item value="Search Docs">
              <DocsIcon />
              Search Docs...
              <div cmdk-vercel-shortcuts=""><kbd>⇧</kbd><kbd>D</kbd></div>
            </Command.Item>
            <Command.Item value="Send Feedback">
              <FeedbackIcon />
              Send Feedback...
            </Command.Item>
            <Command.Item value="Contact Support">
              <ContactIcon />
              Contact Support
            </Command.Item>
          </Command.Group>
        </template>

        <!-- Projects page -->
        <template v-else-if="activePage === 'projects'">
          <Command.Item v-for="n in 6" :key="n" :value="`Project ${n}`"> Project {{ n }} </Command.Item>
        </template>
      </Command.List>
    </Command>
  </div>
</template>

<script lang="ts">
import { defineComponent, h } from 'vue'

const svgBase = {
  fill: 'none',
  height: '24',
  'shape-rendering': 'geometricPrecision',
  stroke: 'currentColor',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
  'stroke-width': '1.5',
  viewBox: '0 0 24 24',
  width: '24',
}

const ProjectsIcon = defineComponent({
  render: () =>
    h('svg', svgBase, [
      h('path', { d: 'M3 3h7v7H3z' }),
      h('path', { d: 'M14 3h7v7h-7z' }),
      h('path', { d: 'M14 14h7v7h-7z' }),
      h('path', { d: 'M3 14h7v7H3z' }),
    ]),
})
const PlusIcon = defineComponent({
  render: () => h('svg', svgBase, [h('path', { d: 'M12 5v14' }), h('path', { d: 'M5 12h14' })]),
})
const TeamsIcon = defineComponent({
  render: () =>
    h('svg', svgBase, [
      h('path', { d: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2' }),
      h('circle', { cx: '9', cy: '7', r: '4' }),
      h('path', { d: 'M23 21v-2a4 4 0 00-3-3.87' }),
      h('path', { d: 'M16 3.13a4 4 0 010 7.75' }),
    ]),
})
const DocsIcon = defineComponent({
  render: () =>
    h('svg', svgBase, [
      h('path', { d: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z' }),
      h('path', { d: 'M14 2v6h6' }),
      h('path', { d: 'M16 13H8' }),
      h('path', { d: 'M16 17H8' }),
      h('path', { d: 'M10 9H8' }),
    ]),
})
const FeedbackIcon = defineComponent({
  render: () =>
    h('svg', svgBase, [
      h('path', {
        d: 'M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z',
      }),
    ]),
})
const ContactIcon = defineComponent({
  render: () =>
    h('svg', svgBase, [
      h('path', { d: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' }),
      h('path', { d: 'M22 6l-10 7L2 6' }),
    ]),
})

export default { components: { ProjectsIcon, PlusIcon, TeamsIcon, DocsIcon, FeedbackIcon, ContactIcon } }
</script>
