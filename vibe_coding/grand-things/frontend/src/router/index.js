import { createRouter, createWebHistory } from 'vue-router'

// 创建一个简单的测试组件
const TestPage = {
  template: `
    <div style="padding: 40px; text-align: center; color: white;">
      <h1>🎯 测试页面</h1>
      <p>如果你看到这个页面，说明Vue Router工作正常！</p>
      <div style="margin: 20px 0;">
        <p>后端API状态: <span :style="{ color: apiStatus.color }">{{ apiStatus.text }}</span></p>
      </div>
      <div style="margin: 20px 0;">
        <router-link to="/" style="color: #10b981; text-decoration: underline;">返回首页</router-link>
      </div>
    </div>
  `,
  data() {
    return {
      apiStatus: {
        text: '检查中...',
        color: '#fff'
      }
    }
  },
  async mounted() {
    console.log('测试页面已挂载')
    
    try {
      // 测试API连接
      const response = await fetch('/api/events/timeline')
      const data = await response.json()
      
      this.apiStatus = {
        text: '✅ 正常',
        color: '#10b981'
      }
      console.log('API测试成功:', data)
    } catch (error) {
      this.apiStatus = {
        text: `❌ 错误: ${error.message}`,
        color: '#f87171'
      }
      console.error('API测试失败:', error)
    }
  }
}

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomePage.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/test',
    name: 'Test',
    component: TestPage,
    meta: { title: '测试页面' }
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
    path: '/event/edit/:id',
    name: 'EditEvent',
    component: () => import('../views/AddEventPage.vue'),
    meta: { title: '编辑事件' }
  },
  {
    path: '/event/:id',
    name: 'EventDetail',
    component: () => import('../views/EventDetailPage.vue'),
    meta: { title: '事件详情' }
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('../views/StatisticsPage.vue'),
    meta: { title: '统计' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  console.log('路由导航:', from.path, '->', to.path)
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - Grand Things`
  }
  
  next()
})

// 路由错误处理
router.onError((error, to, from) => {
  console.error('路由导航错误:')
  console.error('- 错误:', error)
  console.error('- 目标路由:', to)
  console.error('- 来源路由:', from)
  console.error('- 错误类型:', error.name)
  console.error('- 错误消息:', error.message)
  console.error('- 错误堆栈:', error.stack)
})

export default router 