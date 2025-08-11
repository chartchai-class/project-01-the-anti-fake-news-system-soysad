import { createRouter, createWebHistory } from 'vue-router'
import NewListView from '@/views/NewListView.vue'
import DetailsView from '@/views/Detail.vue'
import VoteView from '@/views/Votes.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: NewListView,
    },
    {
      path: '/details/:id',
      name: 'details',
      component: DetailsView,
      props: true, 
    },
    {
      path: '/votes/:id',
      name: 'votes',
      component: VoteView,
      props: true,
    }
  ],
})

export default router
