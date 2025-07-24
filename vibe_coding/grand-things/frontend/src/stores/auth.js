/**
 * 用户认证状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import * as authAPI from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref(null)
  const token = ref(null)
  const loading = ref(false)

  // 计算属性
  const isAuthenticated = computed(() => {
    return !!(token.value && user.value)
  })

  const userInfo = computed(() => {
    return user.value
  })

  // 初始化认证状态
  const initAuth = () => {
    const savedToken = authAPI.getToken()
    const savedUser = authAPI.getUserInfo()
    
    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = savedUser
    }
  }

  // 用户注册
  const register = async (userData) => {
    loading.value = true
    try {
      const response = await authAPI.register(userData)
      ElMessage.success('注册成功！请登录')
      return response
    } catch (error) {
      ElMessage.error(error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 用户登录
  const login = async (loginData) => {
    loading.value = true
    try {
      const response = await authAPI.login(loginData)
      
      // 更新状态
      token.value = response.access_token
      user.value = response.user
      
      ElMessage.success(`欢迎回来，${response.user.username}！`)
      return response
    } catch (error) {
      ElMessage.error(error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 用户登出
  const logout = async () => {
    loading.value = true
    try {
      await authAPI.logout()
      
      // 清除状态
      token.value = null
      user.value = null
      
      ElMessage.success('已安全登出')
    } catch (error) {
      console.warn('登出时出现错误:', error)
      // 即使服务器返回错误，也清除本地状态
      token.value = null
      user.value = null
    } finally {
      loading.value = false
    }
  }

  // 获取当前用户信息
  const getCurrentUser = async () => {
    if (!token.value) {
      throw new Error('未登录')
    }

    loading.value = true
    try {
      const userData = await authAPI.getCurrentUser()
      user.value = userData
      
      // 更新本地存储
      localStorage.setItem('user_info', JSON.stringify(userData))
      
      return userData
    } catch (error) {
      ElMessage.error(error.message)
      // 如果获取用户信息失败，可能是token过期，执行登出
      if (error.message.includes('认证') || error.message.includes('401')) {
        await logout()
      }
      throw error
    } finally {
      loading.value = false
    }
  }

  // 更新用户信息
  const updateUserInfo = async (userData) => {
    loading.value = true
    try {
      const updatedUser = await authAPI.updateCurrentUser(userData)
      user.value = updatedUser
      
      ElMessage.success('用户信息更新成功')
      return updatedUser
    } catch (error) {
      ElMessage.error(error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 检查认证状态
  const checkAuth = async () => {
    if (!token.value) {
      return false
    }

    try {
      await authAPI.checkAuth()
      return true
    } catch (error) {
      // 认证失败，清除状态
      token.value = null
      user.value = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('user_info')
      return false
    }
  }

  // 强制刷新用户信息
  const refreshUserInfo = async () => {
    if (isAuthenticated.value) {
      try {
        await getCurrentUser()
      } catch (error) {
        console.warn('刷新用户信息失败:', error)
      }
    }
  }

  return {
    // 状态
    user,
    token,
    loading,
    
    // 计算属性
    isAuthenticated,
    userInfo,
    
    // 方法
    initAuth,
    register,
    login,
    logout,
    getCurrentUser,
    updateUserInfo,
    checkAuth,
    refreshUserInfo
  }
}) 