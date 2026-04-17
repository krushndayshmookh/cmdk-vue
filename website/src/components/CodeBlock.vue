<script setup lang="ts">
import { computed, ref } from 'vue'
import Prism from 'prismjs'
import 'prismjs/components/prism-jsx'
import { CopyIcon, CopiedIcon } from '@/icons/index'

const props = defineProps<{ code: string }>()

const highlighted = computed(() => Prism.highlight(props.code.trim(), Prism.languages.jsx, 'jsx'))

const copied = ref(false)

function copyCode() {
  navigator.clipboard.writeText(props.code).then(() => {
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  })
}
</script>

<template>
  <div class="code-block__shine" />
  <pre class="code-block__root"><code v-html="highlighted" /><button aria-label="Copy Code" @click="copyCode">
    <CopiedIcon v-if="copied" />
    <CopyIcon v-else />
  </button></pre>
</template>
