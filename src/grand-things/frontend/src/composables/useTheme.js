import { computed, onMounted, ref, watch } from 'vue'

// 主题类型
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
}

// 主题状态
const currentTheme = ref(THEMES.SYSTEM)
const systemPrefersDark = ref(false)

// 计算实际应用的主题
const appliedTheme = computed(() => {
  if (currentTheme.value === THEMES.SYSTEM) {
    return systemPrefersDark.value ? THEMES.DARK : THEMES.LIGHT
  }
  return currentTheme.value
})

// 主题选项
const themeOptions = [
  {
    value: THEMES.LIGHT,
    label: '白天模式',
    icon: 'sunny'
  },
  {
    value: THEMES.DARK,
    label: '夜晚模式', 
    icon: 'moon'
  },
  {
    value: THEMES.SYSTEM,
    label: '跟随系统',
    icon: 'monitor'
  }
]

// 系统主题监听
let mediaQuery = null

function setupSystemThemeListener() {
  if (typeof window === 'undefined') return
  
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  systemPrefersDark.value = mediaQuery.matches
  
  const handleChange = (e) => {
    systemPrefersDark.value = e.matches
    console.log('系统主题变化:', e.matches ? '深色' : '浅色')
  }
  
  mediaQuery.addEventListener('change', handleChange)
  
  return () => {
    mediaQuery?.removeEventListener('change', handleChange)
  }
}

// 应用主题到DOM
function applyTheme(theme) {
  if (typeof document === 'undefined') return
  
  const html = document.documentElement
  
  // 移除所有主题class
  html.classList.remove('theme-light', 'theme-dark')
  
  // 添加当前主题class
  html.classList.add(`theme-${theme}`)
  
  // 设置CSS变量
  if (theme === THEMES.DARK) {
    html.style.setProperty('--bg-primary', '#1a1a1a')
    html.style.setProperty('--bg-secondary', '#2d2d2d')
    html.style.setProperty('--bg-tertiary', '#404040')
    html.style.setProperty('--text-primary', '#ffffff')
    html.style.setProperty('--text-secondary', '#e0e0e0')
    html.style.setProperty('--text-light', '#a0a0a0')
    html.style.setProperty('--border-color', '#404040')
    html.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.3)')
    html.style.setProperty('--gradient-bg', 'linear-gradient(135deg, #2d1b69 0%, #11998e 100%)')
  } else {
    html.style.setProperty('--bg-primary', '#ffffff')
    html.style.setProperty('--bg-secondary', '#f8f9fa')
    html.style.setProperty('--bg-tertiary', '#e9ecef')
    html.style.setProperty('--text-primary', '#2c3e50')
    html.style.setProperty('--text-secondary', '#34495e')
    html.style.setProperty('--text-light', '#7f8c8d')
    html.style.setProperty('--border-color', '#dee2e6')
    html.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.1)')
    html.style.setProperty('--gradient-bg', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)')
  }
  
  console.log('已切换到主题:', theme === THEMES.DARK ? '夜晚模式' : '白天模式')
}

// 保存主题设置到localStorage
function saveThemeToStorage(theme) {
  try {
    localStorage.setItem('grand-things-theme', theme)
  } catch (error) {
    console.warn('无法保存主题设置:', error)
  }
}

// 从localStorage加载主题设置
function loadThemeFromStorage() {
  try {
    const saved = localStorage.getItem('grand-things-theme')
    if (saved && Object.values(THEMES).includes(saved)) {
      return saved
    }
  } catch (error) {
    console.warn('无法加载主题设置:', error)
  }
  return THEMES.SYSTEM
}

export function useTheme() {
  // 初始化
  onMounted(() => {
    // 加载保存的主题设置
    currentTheme.value = loadThemeFromStorage()
    
    // 设置系统主题监听
    const cleanup = setupSystemThemeListener()
    
    // 组件卸载时清理
    return cleanup
  })
  
  // 监听主题变化，应用到DOM
  watch(appliedTheme, (newTheme) => {
    applyTheme(newTheme)
  }, { immediate: true })
  
  // 监听用户主题选择变化，保存到存储
  watch(currentTheme, (newTheme) => {
    saveThemeToStorage(newTheme)
  })
  
  // 切换主题
  const setTheme = (theme) => {
    if (Object.values(THEMES).includes(theme)) {
      currentTheme.value = theme
    }
  }
  
  // 循环切换主题（用于快捷键或按钮）
  const toggleTheme = () => {
    const themes = Object.values(THEMES)
    const currentIndex = themes.indexOf(currentTheme.value)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }
  
  return {
    // 状态
    currentTheme: computed(() => currentTheme.value),
    appliedTheme,
    systemPrefersDark: computed(() => systemPrefersDark.value),
    themeOptions,
    
    // 方法
    setTheme,
    toggleTheme,
    
    // 工具方法
    isLight: computed(() => appliedTheme.value === THEMES.LIGHT),
    isDark: computed(() => appliedTheme.value === THEMES.DARK),
    isSystem: computed(() => currentTheme.value === THEMES.SYSTEM)
  }
} 