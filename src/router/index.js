import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/2048.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/greedySnake',
      name: 'greedySnake',
      component: () => import('../views/greedySnake.vue'),
    },
    {
      path: '/shout',
      name: 'shout',
      component: () => import('../views/shout.vue'),
    },
  ],
})

export default router
