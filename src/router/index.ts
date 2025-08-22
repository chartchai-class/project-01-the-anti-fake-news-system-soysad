import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'

export const PER_PAGE_OPTIONS = [4, 7, 10, 14, 21] as const
export type PerPage = (typeof PER_PAGE_OPTIONS)[number]
export const DEFAULT_PER_PAGE: PerPage = 7

type Filter = 'all' | 'fake' | 'real'
const normFilter = (v: unknown): Filter =>
  ['fake', 'real'].includes(String(v)) ? (v as Filter) : 'all'

const NewListView = () => import('@/views/NewListView.vue')
const NewsDetailFrame = () => import('@/views/NewsDetail/NewsDetailFrame.vue')
const DetailPage = () => import('@/views/NewsDetail/DetailPage.vue')
const VotePage = () => import('@/views/NewsDetail/VotePage.vue')

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
          ? (qSize as PerPage)
          : DEFAULT_PER_PAGE
        const filter = normFilter(route.query.filter)
        return { page, perPage, filter }
      },
    },
    {
      path: '/details/:id',
      component: NewsDetailFrame,
      children: [
        { path: '', redirect: { name: 'details-detail' } },
        { path: 'detail', name: 'details-detail', component: DetailPage },
        { path: 'vote', name: 'details-vote', component: VotePage },
      ],
    },
  ],
  scrollBehavior(_to, _from, saved) {
    if (saved) {
      return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(saved))))
    }
    return { top: 0 }
  },
})

NProgress.configure({
  showSpinner: false,
  trickleSpeed: 150,
  minimum: 0.08,
})

router.beforeEach((_to, _from, next) => {
  NProgress.start()
  next()
})

router.afterEach(() => {
  NProgress.done()
})

router.onError((err) => {
  // log ไว้ดูตอนโปรดักชัน
  console.error('[router error]', err)
  NProgress.done()
})

export default router
