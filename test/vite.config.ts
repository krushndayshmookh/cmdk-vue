import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
  },
  resolve: {
    // Resolve cmdk-vue directly from source during development and testing.
    // This avoids needing a build step before running tests.
    alias: {
      'cmdk-vue': resolve(__dirname, '../cmdk/src/index.ts'),
    },
  },
})
