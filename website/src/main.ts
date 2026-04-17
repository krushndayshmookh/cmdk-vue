import { createApp } from 'vue'
import { createHead } from '@unhead/vue'
import App from './App.vue'

import '../styles/globals.scss'
import '../styles/index.scss'
import '../styles/code.scss'
import '../styles/cmdk/vercel.scss'
import '../styles/cmdk/linear.scss'
import '../styles/cmdk/raycast.scss'
import '../styles/cmdk/framer.scss'

const app = createApp(App)
const head = createHead()
app.use(head)
app.mount('#app')
