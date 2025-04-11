import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/home/index.vue'),
      children: [],
    },
    {
      path: '/2048',
      name: '2048',
      component: () => import('../views/2048/index.vue'),
    },
    {
      path: '/greedySnake',
      name: 'greedySnake',
      component: () => import('../views/greedySnake/index.vue'),
    },
    {
      path: '/shout',
      name: 'shout',
      component: () => import('../views/shout/index.vue'),
    },
    {
      path: '/3DRouble',
      name: '3DRouble',
      component: () => import('../views/3DGame/index.vue'),
    },
  ],
})

export default router
