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

// 应用已加载完成
console.log('Grand Things应用已完全加载！')
</script>

<style lang="scss">
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-attachment: fixed;
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
</style> 