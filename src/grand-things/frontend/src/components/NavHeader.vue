<template>
  <header class="nav-header">
    <div class="nav-container">
      <!-- Logo和标题 -->
      <div class="logo-section">
        <div class="logo">
          <el-icon size="32" color="#ffffff">
            <Calendar />
          </el-icon>
        </div>
        <div class="title">
          <h1>Grand Things</h1>
          <span class="subtitle">大事记</span>
        </div>
      </div>

      <!-- 导航菜单 -->
      <nav class="nav-menu">
        <router-link 
          v-for="item in menuItems" 
          :key="item.path"
          :to="item.path" 
          class="nav-item"
          :class="{ active: $route.path === item.path }"
        >
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
          <span>{{ item.title }}</span>
        </router-link>
      </nav>

      <!-- 快捷操作 -->
      <div class="actions">
        <el-button type="primary" size="default" @click="$router.push('/event/add')">
          <el-icon><Plus /></el-icon>
          添加事件
        </el-button>
        <el-button circle size="default" @click="toggleTheme">
          <el-icon><Moon /></el-icon>
        </el-button>
      </div>

      <!-- 移动端菜单按钮 -->
      <div class="mobile-menu-btn">
        <el-button circle @click="showMobileMenu = true">
          <el-icon><Menu /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 移动端菜单抽屉 -->
    <el-drawer
      v-model="showMobileMenu"
      direction="rtl"
      title="菜单"
      size="280px"
    >
      <div class="mobile-menu">
        <router-link 
          v-for="item in menuItems" 
          :key="item.path"
          :to="item.path" 
          class="mobile-nav-item"
          @click="showMobileMenu = false"
        >
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
          <span>{{ item.title }}</span>
        </router-link>
      </div>
    </el-drawer>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { Calendar, Timeline, Search, Plus, TrendCharts, Moon, Menu, House } from '@element-plus/icons-vue'

const showMobileMenu = ref(false)

const menuItems = [
  { path: '/', title: '首页', icon: House },
  { path: '/timeline', title: '时间线', icon: Timeline },
  { path: '/search', title: '搜索', icon: Search },
  { path: '/statistics', title: '统计', icon: TrendCharts }
]

const toggleTheme = () => {
  // 暂时留空，后续可以实现主题切换
  console.log('主题切换功能待实现')
}
</script>

<style lang="scss" scoped>
.nav-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 70px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .logo {
    padding: 8px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .title {
    h1 {
      font-size: 24px;
      font-weight: 700;
      color: white;
      margin: 0;
      line-height: 1.2;
    }
    
    .subtitle {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.8);
      font-weight: 400;
    }
  }
}

.nav-menu {
  display: flex;
  gap: 8px;
  
  .nav-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease;
    
    &:hover, &.active {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      transform: translateY(-1px);
    }
    
    span {
      font-size: 14px;
    }
  }
}

.actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mobile-menu-btn {
  display: none;
}

.mobile-menu {
  .mobile-nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    color: var(--text-primary);
    text-decoration: none;
    border-bottom: 1px solid var(--border-color);
    transition: all 0.3s ease;
    
    &:hover {
      background: var(--bg-secondary);
      color: var(--primary-color);
    }
    
    span {
      font-size: 16px;
      font-weight: 500;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .nav-menu, .actions {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .nav-container {
    padding: 0 16px;
  }
  
  .logo-section .title h1 {
    font-size: 20px;
  }
}

// Element Plus样式覆盖
:deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
}

:deep(.el-drawer__header) {
  margin-bottom: 0;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}
</style> 