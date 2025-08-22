import { createRouter, createWebHistory } from 'vue-router'
import NewListView from '@/views/NewListView.vue'
import NewsDetailFrame from '@/views/NewsDetail/NewsDetailFrame.vue'
import DetailPage from '@/views/NewsDetail/DetailPage.vue'
import VotePage from '@/views/NewsDetail/VotePage.vue'

export const PER_PAGE_OPTIONS = [4, 7, 14, 10, 21] as const
export type PerPage = (typeof PER_PAGE_OPTIONS)[number]
export const DEFAULT_PER_PAGE: PerPage = 7
type Filter = 'all' | 'fake' | 'real'
const normFilter = (v: unknown): Filter =>
  ['fake', 'real'].includes(String(v)) ? (v as Filter) : 'all'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: NewListView,
      props: (route) => {
        const qPage = parseInt((route.query.page as string) ?? '1', 10)
        const qSize = parseInt((route.query.perPage as string) ?? String(DEFAULT_PER_PAGE), 10)
        const page = Number.isFinite(qPage) && qPage > 0 ? qPage : 1
        const perPage = (PER_PAGE_OPTIONS as readonly number[]).includes(qSize)
          ? qSize
          : DEFAULT_PER_PAGE
        const filter = normFilter(route.query.filter)
        return { page, perPage, filter }
      },
    },
    {
      path: '/details/:id',
      component: () => NewsDetailFrame,
      children: [
        { path: '', redirect: { name: 'details-detail' } },
        {
          path: 'detail',
          name: 'details-detail',
          component: () => DetailPage,
        },
        {
          path: 'vote',
          name: 'details-vote',
          component: () => VotePage,
        },
      ],
    },
  ],
  scrollBehavior(_to, _from, saved) {
    if (saved)
      return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(saved))))
    return { top: 0 }
  },
})
export default router
