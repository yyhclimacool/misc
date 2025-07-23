import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    console.log('发送请求:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log('收到响应:', response.status, response.config.url)
    return response.data
  },
  (error) => {
    console.error('响应错误:', error)
    const message = error.response?.data?.detail || error.message || '网络错误'
    throw new Error(message)
  }
)

// 事件API
export const eventAPI = {
  // 创建事件
  async createEvent(eventData) {
    return await api.post('/events/', eventData)
  },

  // 获取时间线
  async getTimeline(params = {}) {
    const { page = 1, size = 20, category } = params
    const query = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...(category && { category })
    })
    return await api.get(`/events/timeline?${query}`)
  },

  // 搜索事件
  async searchEvents(params = {}) {
    const { query, tags, category, start_date, end_date } = params
    const searchParams = new URLSearchParams()
    
    if (query) searchParams.append('query', query)
    if (tags) searchParams.append('tags', Array.isArray(tags) ? tags.join(',') : tags)
    if (category) searchParams.append('category', category)
    if (start_date) searchParams.append('start_date', start_date)
    if (end_date) searchParams.append('end_date', end_date)
    
    return await api.get(`/events/search?${searchParams}`)
  },

  // 获取事件详情
  async getEvent(eventId) {
    return await api.get(`/events/${eventId}`)
  },

  // 更新事件
  async updateEvent(eventId, eventData) {
    return await api.put(`/events/${eventId}`, eventData)
  },

  // 删除事件
  async deleteEvent(eventId) {
    return await api.delete(`/events/${eventId}`)
  },

  // 获取分类统计
  async getCategoriesStats() {
    return await api.get('/events/stats/categories')
  },

  // 获取时间线统计
  async getTimelineStats() {
    return await api.get('/events/stats/timeline')
  }
}

export default api 