import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// 自定义指令方法
import hover from '@/derictives/hover.js'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.directive('hover', hover)

app.mount('#app')
