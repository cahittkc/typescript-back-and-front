import './assets/main.css'
import 'uno.css'
import './index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import axios from './plugins/axios'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Make axios available globally
app.config.globalProperties.$axios = axios

app.mount('#app')
