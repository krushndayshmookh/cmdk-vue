<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useHead } from '@unhead/vue'
import { useDark, useToggle } from '@vueuse/core'
import { Motion, AnimatePresence } from 'motion-v'

import VercelCmdk from './components/cmdk/VercelCmdk.vue'
import LinearCmdk from './components/cmdk/LinearCmdk.vue'
import RaycastCmdk from './components/cmdk/RaycastCmdk.vue'
import FramerCmdk from './components/cmdk/FramerCmdk.vue'
import CodeBlock from './components/CodeBlock.vue'

import {
  RaycastIcon,
  LinearIcon,
  VercelIcon,
  FramerIcon,
  CopyIcon,
  CopiedIcon,
  GitHubIcon,
  VueIcon,
} from './icons/index'

useHead({
  title: '⌘K — Fast, composable, unstyled command menu for Vue',
  meta: [
    { name: 'description', content: 'Fast, composable, unstyled command menu for Vue 3.' },
    { property: 'og:title', content: '⌘K' },
    { property: 'og:image', content: '/og.png' },
  ],
})

type Theme = 'raycast' | 'linear' | 'vercel' | 'framer'

const theme = ref<Theme>('raycast')
const copied = ref(false)

const isDark = useDark()
const toggleDark = useToggle(isDark)

const themes: { key: Theme; icon: any }[] = [
  { key: 'raycast', icon: RaycastIcon },
  { key: 'linear', icon: LinearIcon },
  { key: 'vercel', icon: VercelIcon },
  { key: 'framer', icon: FramerIcon },
]

function setTheme(key: Theme) {
  theme.value = key
}

function onKeyDown(e: KeyboardEvent) {
  const keys = themes.map((t) => t.key)
  const idx = keys.indexOf(theme.value)
  if (e.key === 'ArrowRight' && idx < keys.length - 1) {
    theme.value = keys[idx + 1] as Theme
  }
  if (e.key === 'ArrowLeft' && idx > 0) {
    theme.value = keys[idx - 1] as Theme
  }
}

onMounted(() => document.addEventListener('keydown', onKeyDown))
onUnmounted(() => document.removeEventListener('keydown', onKeyDown))

async function copyInstall() {
  try {
    await navigator.clipboard.writeText('npm install cmdk-vue')
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {}
}

const footerRef = ref<HTMLElement | null>(null)

const codeSnippets: Record<Theme, string> = {
  raycast: `
import { Command } from 'cmdk-vue'

<Command>
  <Command.Input placeholder="Type a command..." />
  <Command.List>
    <Command.Empty>No results found.</Command.Empty>
    <Command.Group heading="Actions">
      <Command.Item value="search">
        Search Files
        <kbd>⌘ F</kbd>
      </Command.Item>
      <Command.Item value="open">
        Open Application
        <kbd>⌘ O</kbd>
      </Command.Item>
    </Command.Group>
    <Command.Group heading="Recent">
      <Command.Item value="docs">Documentation</Command.Item>
      <Command.Item value="settings">Settings</Command.Item>
    </Command.Group>
  </Command.List>
</Command>`,

  linear: `
import { Command } from 'cmdk-vue'

<Command>
  <Command.Input placeholder="Type a command..." />
  <Command.List>
    <Command.Empty>No results found.</Command.Empty>
    <Command.Group heading="Issue">
      <Command.Item value="assign">
        Assign to...
        <kbd>A</kbd>
      </Command.Item>
      <Command.Item value="status">
        Change status...
        <kbd>S</kbd>
      </Command.Item>
      <Command.Item value="priority">
        Set priority...
        <kbd>P</kbd>
      </Command.Item>
      <Command.Item value="label">
        Add label...
        <kbd>L</kbd>
      </Command.Item>
    </Command.Group>
  </Command.List>
</Command>`,

  vercel: `
import { Command } from 'cmdk-vue'

const pages = ref(['home'])
const activePage = computed(() => pages.value.at(-1))
const popPage = () => pages.value.pop()

<Command @keydown="onKeyDown">
  <Command.Input :placeholder="activePage === 'home'
    ? 'Search or jump to...'
    : 'Search projects...'" />
  <Command.List>
    <template v-if="activePage === 'home'">
      <Command.Item @select="pages.push('projects')">
        Search Projects...
      </Command.Item>
      <Command.Item value="teams">Teams</Command.Item>
    </template>
    <template v-if="activePage === 'projects'">
      <Command.Item value="proj-1">Project Alpha</Command.Item>
      <Command.Item value="proj-2">Project Beta</Command.Item>
    </template>
  </Command.List>
</Command>`,

  framer: `
import { Command } from 'cmdk-vue'

const selected = ref('Button')

<div style="display: flex">
  <Command>
    <Command.Input placeholder="Search components..." />
    <Command.List>
      <Command.Empty>No results.</Command.Empty>
      <Command.Group heading="Components">
        <Command.Item value="button"
          @select="selected = 'Button'">Button</Command.Item>
        <Command.Item value="input"
          @select="selected = 'Input'">Input</Command.Item>
        <Command.Item value="card"
          @select="selected = 'Card'">Card</Command.Item>
      </Command.Group>
    </Command.List>
  </Command>

  <!-- Preview panel -->
  <div class="preview">{{ selected }}</div>
</div>`,
}

const codeSnippet = computed(() => codeSnippets[theme.value])
</script>

<template>
  <main class="main">
    <!-- Dark mode toggle -->
    <button
      class="dark-toggle"
      @click="toggleDark()"
      :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      aria-label="Toggle dark mode"
    >
      <svg
        v-if="isDark"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
      <svg
        v-else
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>

    <div class="content">
      <!-- Meta / Hero -->
      <div class="meta">
        <div class="info">
          <span class="version-badge">v1.0.0</span>
          <div class="hero-title">
            <h1>⌘K</h1>
            <span class="hero-plus">+</span>
            <VueIcon class="hero-vue-icon" />
          </div>
          <p>Fast, composable, unstyled command menu for Vue.</p>
        </div>
        <div class="buttons">
          <button class="install-button" @click="copyInstall">
            npm install cmdk-vue
            <span>
              <CopiedIcon v-if="copied" />
              <CopyIcon v-else />
            </span>
          </button>
          <a
            href="https://github.com/krushndayshmookh/cmdk-vue"
            target="_blank"
            rel="noopener noreferrer"
            class="github-button"
          >
            <GitHubIcon />
            krushndayshmookh/cmdk-vue
          </a>
        </div>
      </div>

      <!-- Demo nav links -->
      <nav class="demo-nav" aria-label="Demo themes">
        <button
          v-for="t in themes"
          :key="t.key"
          class="demo-nav__item"
          :class="{ 'demo-nav__item--active': theme === t.key }"
          @click="setTheme(t.key)"
        >
          <component :is="t.icon" class="demo-nav__icon" />
          <span>{{ t.key }}</span>
        </button>
      </nav>

      <!-- Two-column: demo left, code right -->
      <div class="demo-and-code">
        <!-- Left: demo + theme switcher -->
        <div class="demo-column">
          <AnimatePresence mode="wait">
            <Motion
              v-if="theme === 'raycast'"
              key="raycast"
              class="cmdk-wrapper"
              :initial="{ opacity: 0, scale: 0.98 }"
              :animate="{ opacity: 1, scale: 1 }"
              :exit="{ opacity: 0, scale: 0.98 }"
              :transition="{ duration: 0.2 }"
            >
              <RaycastCmdk />
            </Motion>
            <Motion
              v-else-if="theme === 'linear'"
              key="linear"
              class="cmdk-wrapper"
              :initial="{ opacity: 0, scale: 0.98 }"
              :animate="{ opacity: 1, scale: 1 }"
              :exit="{ opacity: 0, scale: 0.98 }"
              :transition="{ duration: 0.2 }"
            >
              <LinearCmdk />
            </Motion>
            <Motion
              v-else-if="theme === 'vercel'"
              key="vercel"
              class="cmdk-wrapper"
              :initial="{ opacity: 0, scale: 0.98 }"
              :animate="{ opacity: 1, scale: 1 }"
              :exit="{ opacity: 0, scale: 0.98 }"
              :transition="{ duration: 0.2 }"
            >
              <VercelCmdk />
            </Motion>
            <Motion
              v-else-if="theme === 'framer'"
              key="framer"
              class="cmdk-wrapper"
              :initial="{ opacity: 0, scale: 0.98 }"
              :animate="{ opacity: 1, scale: 1 }"
              :exit="{ opacity: 0, scale: 0.98 }"
              :transition="{ duration: 0.2 }"
            >
              <FramerCmdk />
            </Motion>
          </AnimatePresence>
        </div>

        <!-- Right: code block -->
        <div class="code-column">
          <div class="code-block">
            <div class="line2" aria-hidden />
            <div class="line3" aria-hidden />
            <CodeBlock :code="codeSnippet" :key="theme" />
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer ref="footerRef" class="footer">
      <p class="footer-attribution">
        Original <a href="https://github.com/pacocoursey/cmdk" target="_blank" rel="noopener noreferrer">cmdk</a>
        created by
        <a href="https://paco.me" target="_blank" rel="noopener noreferrer">Paco Coursey</a>
        and
        <a href="https://rauno.me" target="_blank" rel="noopener noreferrer">Rauno Fäbig</a>.
      </p>
      <p class="footer-port">
        Vue port by
        <a href="https://github.com/krushndayshmookh" target="_blank" rel="noopener noreferrer">Krushn Dayshmookh</a>,
        built with <a href="https://claude.ai/claude-code" target="_blank" rel="noopener noreferrer">Claude</a>.
      </p>
    </footer>
  </main>
</template>

<style lang="scss">
// Dark mode toggle (optional, placed top-right)
// This is a minimal button that can be added later
</style>
