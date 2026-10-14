import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useAuthStore } from './features/auth/states/authStore.js'
import '@fontsource/plus-jakarta-sans/400.css'
import '@fontsource/plus-jakarta-sans/600.css'
import '@fontsource/plus-jakarta-sans/800.css'
import './index.css'
import App from './App.vue'
import { createAppRouter } from './router.js'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
useAuthStore(pinia)
app.use(createAppRouter())
app.mount('#app')