<template>
  <div id="app">
    <NavHeader />
    <main class="main-content">
      <router-view />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import NavHeader from './components/NavHeader.vue'
import AppFooter from './components/AppFooter.vue'
import { useTheme } from '@/composables/useTheme'

// 初始化主题系统
const { currentTheme, appliedTheme } = useTheme()

// 应用已加载完成
console.log('Grand Things应用已完全加载！')
console.log('当前主题:', currentTheme.value, '实际应用:', appliedTheme.value)
</script>

<style lang="scss">
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--gradient-bg);
  background-attachment: fixed;
  color: var(--text-primary);
  transition: background 0.3s ease, color 0.3s ease;
}

.main-content {
  flex: 1;
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

@media (max-width: 768px) {
  .main-content {
    padding: 10px;
  }
}

// 主题过渡动画
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
}
</style> 