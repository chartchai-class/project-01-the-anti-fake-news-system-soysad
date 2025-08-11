import { createRouter, createWebHistory } from 'vue-router'
import NewListView from '@/views/NewListView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: NewListView,
    },
  ],
})

export default router
