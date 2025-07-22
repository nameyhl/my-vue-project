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
    {
      path: '/cesium',
      name: 'cesium',
      component: () => import('../views/cesium/index.vue'),
    },
    {
      path: '/newCesium',
      name: 'newCesium',
      component: () => import('../views/3Dcesium/index.vue'),
    },
    {
      path: '/moveHouse',
      name: 'moveHouse',
      component: () => import('@/views/moveHouse/index.vue'),
    },
    {
      path: '/markDown',
      name: 'markDown',
      component: () => import('@/views/markDown/index.vue'),
    },
    {
      path: '/coorSys',
      name: 'coorSys',
      component: () => import('@/views/coorSys/index.vue'),
    },
    {
      path: '/create3D',
      name: 'create3D',
      component: () => import('@/views/create3D/index.vue'),
    },
    {
      path: '/cesiumWithThreeJs',
      name: 'cesiumWithThreeJs',
      component: () => import('@/views/cesiumWithThreeJs/index.vue'),
    },
  ],
})

export default router
