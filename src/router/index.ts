import { createRouter, createWebHistory } from 'vue-router'
import NewListView from '@/views/NewListView.vue'
import DetailsView from '@/views/Detail.vue'
import VoteView from '@/views/Votes.vue'

export const PER_PAGE_OPTIONS = [3, 5, 8, 10, 12, 16, 20] as const
export type PerPage = (typeof PER_PAGE_OPTIONS)[number]
export const DEFAULT_PER_PAGE: PerPage = 5
type Filter = 'all' | 'fake' | 'real'

function normFilter(v: unknown): Filter {
  const s = String(v ?? 'all').toLowerCase()
  return s === 'fake' || s === 'real' ? (s as Filter) : 'all'
}

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
  scrollBehavior(to, from, saved) {
    if (saved) {
      return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(saved))))
    }
    return { top: 0 }
  },
})

export default router
