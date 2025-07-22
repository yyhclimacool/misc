import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomePage.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/timeline',
    name: 'Timeline',
    component: () => import('../views/TimelinePage.vue'),
    meta: { title: '时间线' }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('../views/SearchPage.vue'),
    meta: { title: '搜索' }
  },
  {
    path: '/event/add',
    name: 'AddEvent',
    component: () => import('../views/AddEventPage.vue'),
    meta: { title: '添加事件' }
  },
  {
    path: '/event/:id',
    name: 'EventDetail',
    component: () => import('../views/EventDetailPage.vue'),
    meta: { title: '事件详情' }
  },
  {
    path: '/stats',
    name: 'Statistics',
    component: () => import('../views/StatisticsPage.vue'),
    meta: { title: '统计分析' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫 - 设置页面标题
router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} - Grand Things`
  next()
})

export default router 