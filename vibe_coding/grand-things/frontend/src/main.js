import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style/index.scss'

try {
  console.log('开始初始化Vue应用...')
  
  const app = createApp(App)
  
  // 全局错误处理
  app.config.errorHandler = (error, instance, info) => {
    console.error('Vue全局错误:', error)
    console.error('错误信息:', info)
    console.error('组件实例:', instance)
  }
  
  console.log('注册Element Plus图标...')
  // 注册 Element Plus 图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
  
  console.log('注册插件...')
  app.use(createPinia())
  app.use(ElementPlus)
  app.use(router)
  
  // 路由错误处理
  router.onError((error, to, from) => {
    console.error('路由错误:', error)
    console.error('目标路由:', to)
    console.error('来源路由:', from)
    console.error('错误堆栈:', error.stack)
  })
  
  // 路由守卫 - 添加错误处理
  router.beforeEach((to, from, next) => {
    try {
      console.log(`正在导航到: ${to.path}`)
      next()
    } catch (error) {
      console.error('路由守卫错误:', error)
      next(false)
    }
  })
  
  console.log('挂载应用...')
  app.mount('#app')
  
  console.log('Vue应用初始化完成！')
  
} catch (error) {
  console.error('Vue应用初始化失败:', error)
  console.error('错误堆栈:', error.stack)
  
  // 在页面上显示错误信息
  const appElement = document.getElementById('app')
  if (appElement) {
    appElement.innerHTML = `
      <div style="padding: 20px; color: white; text-align: center; max-width: 800px; margin: 50px auto;">
        <h2>🚨 应用加载失败</h2>
        <p><strong>错误信息:</strong> ${error.message}</p>
        <details style="margin-top: 20px; text-align: left;">
          <summary style="cursor: pointer; margin-bottom: 10px;">点击查看详细错误信息</summary>
          <pre style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 5px; overflow: auto; font-size: 12px; line-height: 1.4;">
${error.stack}
          </pre>
        </details>
        <div style="margin-top: 20px;">
          <button onclick="location.reload()" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
            重新加载页面
          </button>
        </div>
      </div>
    `
  }
} 