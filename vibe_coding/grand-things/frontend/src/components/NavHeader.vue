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
        <!-- 用户区域 -->
        <div v-if="!authStore.isAuthenticated" class="auth-section">
          <el-button @click="$router.push('/login')" size="default">
            <el-icon><User /></el-icon>
            登录
          </el-button>
        </div>

        <div v-else class="user-section">
          <!-- 添加事件按钮 -->
          <el-button type="primary" size="default" @click="$router.push('/event/add')">
            <el-icon><Plus /></el-icon>
            添加事件
          </el-button>

          <!-- 用户下拉菜单 -->
          <el-dropdown trigger="click" @command="handleUserCommand" class="user-dropdown">
            <div class="user-info">
              <el-avatar :size="32">
                <el-icon><User /></el-icon>
              </el-avatar>
              <span class="username">{{ authStore.userInfo?.username }}</span>
              <el-icon class="dropdown-icon"><ArrowDown /></el-icon>  
            </div>
            
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人资料
                </el-dropdown-item>
                <el-dropdown-item command="settings">
                  <el-icon><Setting /></el-icon>
                  设置
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        
        <!-- 主题切换 -->
        <el-dropdown @command="setTheme" class="theme-dropdown">
          <el-button circle size="default" class="theme-toggle">
            <el-icon>
              <component :is="currentThemeIcon" />
            </el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item 
                v-for="theme in themeOptions" 
                :key="theme.value"
                :command="theme.value"
                :disabled="currentTheme === theme.value"
                class="theme-option"
              >
                <el-icon class="theme-icon">
                  <component :is="getThemeIcon(theme.icon)" />
                </el-icon>
                <span>{{ theme.label }}</span>
                <el-icon v-if="currentTheme === theme.value" class="check-icon">
                  <Check />
                </el-icon>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
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
        <!-- 导航项 -->
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
        
        <!-- 分隔线 -->
        <div class="mobile-menu-divider"></div>
        
        <!-- 主题切换 -->
        <div class="mobile-theme-section">
          <div class="mobile-section-title">主题设置</div>
          <div 
            v-for="theme in themeOptions" 
            :key="theme.value"
            class="mobile-theme-item"
            :class="{ active: currentTheme === theme.value }"
            @click="setTheme(theme.value)"
          >
            <el-icon class="theme-icon">
              <component :is="getThemeIcon(theme.icon)" />
            </el-icon>
            <span>{{ theme.label }}</span>
            <el-icon v-if="currentTheme === theme.value" class="check-icon">
              <Check />
            </el-icon>
          </div>
        </div>
        
        <!-- 添加事件按钮 -->
        <div class="mobile-action-section">
          <el-button 
            type="primary" 
            size="large"
            @click="$router.push('/event/add'); showMobileMenu = false"
            class="mobile-add-btn"
          >
            <el-icon><Plus /></el-icon>
            添加事件
          </el-button>
        </div>
      </div>
    </el-drawer>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  Calendar, Clock, Search, Plus, TrendCharts, Menu, House,
  Sunny, Moon, Monitor, Check, User, ArrowDown, Setting, SwitchButton
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useTheme, THEMES } from '@/composables/useTheme'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const showMobileMenu = ref(false)

const menuItems = [
  { path: '/', title: '首页', icon: House },
  { path: '/timeline', title: '时间线', icon: Clock },
  { path: '/search', title: '搜索', icon: Search },
  { path: '/statistics', title: '统计', icon: TrendCharts }
]

// 使用主题系统
const { 
  currentTheme, 
  appliedTheme, 
  themeOptions, 
  setTheme, 
  isLight, 
  isDark, 
  isSystem 
} = useTheme()

// 当前主题图标
const currentThemeIcon = computed(() => {
  if (currentTheme.value === THEMES.LIGHT) return Sunny
  if (currentTheme.value === THEMES.DARK) return Moon
  return Monitor // system
})

// 获取主题图标组件
const getThemeIcon = (iconName) => {
  const iconMap = {
    sunny: Sunny,
    moon: Moon,
    monitor: Monitor
  }
  return iconMap[iconName] || Monitor
}

// 处理用户下拉菜单命令
const handleUserCommand = async (command) => {
  switch (command) {
    case 'profile':
      // TODO: 跳转到个人资料页面
      console.log('跳转到个人资料')
      break
    case 'settings':
      // TODO: 跳转到设置页面
      console.log('跳转到设置')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm(
          '确定要退出登录吗？',
          '确认退出',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        await authStore.logout()
        router.push('/login')
      } catch (error) {
        // 用户取消退出或退出失败
        if (error !== 'cancel') {
          console.error('退出登录失败:', error)
        }
      }
      break
  }
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

    .auth-section {
      display: flex;
      align-items: center;
    }

    .user-section {
      display: flex;
      align-items: center;
      gap: 12px;

      .user-dropdown {
        .user-info {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            background-color: rgba(255, 255, 255, 0.1);
          }

          .username {
            color: white;
            font-weight: 500;
            font-size: 14px;
          }

          .dropdown-icon {
            color: rgba(255, 255, 255, 0.8);
            font-size: 12px;
            transition: transform 0.3s ease;
          }

          &:hover .dropdown-icon {
            transform: rotate(180deg);
          }
        }
      }
    }
}

.mobile-menu-btn {
  display: none;
}

.mobile-menu {
  padding: 0;
  
  .mobile-nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
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
  
  .mobile-menu-divider {
    height: 1px;
    background: var(--border-color);
    margin: 10px 0;
  }
  
  .mobile-theme-section {
    padding: 20px;
    
    .mobile-section-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-light);
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .mobile-theme-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      margin: 4px 0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      
      .theme-icon {
        font-size: 18px;
        color: #409eff;
      }
      
      span {
        flex: 1;
        font-size: 15px;
      }
      
      .check-icon {
        font-size: 16px;
        color: #67c23a;
      }
      
      &:hover {
        background: var(--bg-secondary);
      }
      
      &.active {
        background: rgba(64, 158, 255, 0.1);
        color: #409eff;
        font-weight: 500;
      }
    }
  }
  
  .mobile-action-section {
    padding: 20px;
    
    .mobile-add-btn {
      width: 100%;
      height: 48px;
      font-size: 16px;
      font-weight: 600;
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

// 主题切换样式
.theme-dropdown {
  .theme-toggle {
    color: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    &:hover {
      color: white;
      border-color: rgba(255, 255, 255, 0.4);
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

:deep(.theme-option) {
  display: flex !important;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  min-width: 140px;
  
  .theme-icon {
    font-size: 16px;
    color: #409eff;
  }
  
  span {
    flex: 1;
    font-size: 14px;
  }
  
  .check-icon {
    font-size: 14px;
    color: #67c23a;
  }
  
  &:hover {
    background: rgba(64, 158, 255, 0.1);
  }
  
  &.is-disabled {
    background: rgba(64, 158, 255, 0.05);
    color: #409eff;
    font-weight: 500;
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