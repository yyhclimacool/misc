/**
 * 用户认证相关的API接口
 */
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

// 创建axios实例
const authAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// 请求拦截器 - 添加token
authAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理token过期
authAPI.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token过期，清除本地存储并跳转到登录页
      localStorage.removeItem('access_token')
      localStorage.removeItem('user_info')
      
      // 如果不在登录页，则跳转到登录页
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

/**
 * 用户注册
 * @param {Object} userData - 用户数据
 * @param {string} userData.email - 邮箱
 * @param {string} userData.username - 用户名
 * @param {string} userData.password - 密码
 * @param {string} userData.full_name - 真实姓名（可选）
 */
export const register = async (userData) => {
  try {
    const response = await authAPI.post('/auth/register', userData)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.detail || '注册失败')
  }
}

/**
 * 用户登录
 * @param {Object} loginData - 登录数据
 * @param {string} loginData.email - 邮箱
 * @param {string} loginData.password - 密码
 */
export const login = async (loginData) => {
  try {
    const response = await authAPI.post('/auth/login', loginData)
    const { access_token, user } = response.data
    
    // 保存token和用户信息到本地存储
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('user_info', JSON.stringify(user))
    
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.detail || '登录失败')
  }
}

/**
 * 用户登出
 */
export const logout = async () => {
  try {
    await authAPI.post('/auth/logout')
  } catch (error) {
    // 即使服务器返回错误，也清除本地存储
    console.warn('登出请求失败:', error)
  } finally {
    // 清除本地存储
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_info')
  }
}

/**
 * 获取当前用户信息
 */
export const getCurrentUser = async () => {
  try {
    const response = await authAPI.get('/auth/me')
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.detail || '获取用户信息失败')
  }
}

/**
 * 更新当前用户信息
 * @param {Object} userData - 要更新的用户数据
 */
export const updateCurrentUser = async (userData) => {
  try {
    const response = await authAPI.put('/auth/me', userData)
    
    // 更新本地存储的用户信息
    localStorage.setItem('user_info', JSON.stringify(response.data))
    
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.detail || '更新用户信息失败')
  }
}

/**
 * 检查认证状态
 */
export const checkAuth = async () => {
  try {
    const response = await authAPI.get('/auth/check')
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.detail || '检查认证状态失败')
  }
}

/**
 * 获取本地存储的token
 */
export const getToken = () => {
  return localStorage.getItem('access_token')
}

/**
 * 获取本地存储的用户信息
 */
export const getUserInfo = () => {
  const userInfo = localStorage.getItem('user_info')
  return userInfo ? JSON.parse(userInfo) : null
}

/**
 * 检查是否已登录
 */
export const isAuthenticated = () => {
  const token = getToken()
  const userInfo = getUserInfo()
  return !!(token && userInfo)
}

/**
 * 修改密码
 * @param {Object} passwordData - 密码数据
 * @param {string} passwordData.current_password - 当前密码
 * @param {string} passwordData.new_password - 新密码
 */
export const changePassword = async (passwordData) => {
  try {
    const response = await authAPI.post('/auth/change-password', passwordData)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.detail || '修改密码失败')
  }
}

/**
 * 获取用户统计信息
 */
export const getUserStatistics = async () => {
  try {
    const response = await authAPI.get('/auth/statistics')
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.detail || '获取统计信息失败')
  }
}

export default {
  register,
  login,
  logout,
  getCurrentUser,
  updateCurrentUser,
  checkAuth,
  getToken,
  getUserInfo,
  isAuthenticated,
  changePassword,
  getUserStatistics
} 