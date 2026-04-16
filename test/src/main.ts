import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('./pages/index.vue') },
    { path: '/dialog', component: () => import('./pages/dialog.vue') },
    { path: '/group', component: () => import('./pages/group.vue') },
    { path: '/item', component: () => import('./pages/item.vue') },
    { path: '/item-advanced', component: () => import('./pages/item-advanced.vue') },
    { path: '/keybinds', component: () => import('./pages/keybinds.vue') },
    { path: '/numeric', component: () => import('./pages/numeric.vue') },
    { path: '/props', component: () => import('./pages/props.vue') },
  ],
})

createApp(App).use(router).mount('#app')
