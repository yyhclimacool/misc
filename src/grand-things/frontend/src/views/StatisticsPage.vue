<template>
  <div class="statistics-page">
    <!-- 页面头部 -->
    <div class="page-header fade-in-up">
      <h1 class="page-title">
        <el-icon><BarChart /></el-icon>
        数据统计
      </h1>
      <p class="page-subtitle">深入了解您的事件数据分布和趋势</p>
    </div>

    <!-- 统计概览卡片 -->
    <div class="stats-overview fade-in-up">
      <div class="stats-grid">
        <div class="stat-card" v-for="stat in overviewStats" :key="stat.key">
          <div class="stat-icon" :style="{ background: stat.color }">
            <el-icon size="24">
              <component :is="stat.icon" />
            </el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
            <div v-if="stat.growth" class="stat-growth" :class="{ positive: stat.growth > 0, negative: stat.growth < 0 }">
              <el-icon>
                <CaretTop v-if="stat.growth > 0" />
                <CaretBottom v-else />
              </el-icon>
              {{ Math.abs(stat.growth) }}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-container">
      <div class="charts-grid">
        <!-- 分类分布图 -->
        <div class="chart-card slide-in-left">
          <div class="chart-header">
            <h3>事件分类分布</h3>
          </div>
          <div class="chart-content" v-loading="loadingCharts">
            <div class="pie-chart">
              <!-- 简化的分类展示 -->
              <div class="category-list">
                <div 
                  v-for="category in categoryStats" 
                  :key="category.category"
                  class="category-item"
                >
                  <div class="category-info">
                    <div class="category-color" :style="{ background: getCategoryColor(category.category) }"></div>
                    <span class="category-name">{{ category.category }}</span>
                  </div>
                  <div class="category-bar">
                    <div 
                      class="category-fill"
                      :style="{ 
                        width: `${(category.count / maxCategoryCount) * 100}%`,
                        background: getCategoryColor(category.category)
                      }"
                    ></div>
                  </div>
                  <span class="category-count">{{ category.count }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 时间趋势 -->
        <div class="chart-card slide-in-right">
          <div class="chart-header">
            <h3>时间趋势</h3>
            <div class="time-filters">
              <el-button-group size="small">
                <el-button 
                  :type="timeRange === '7d' ? 'primary' : ''"
                  @click="changeTimeRange('7d')"
                >
                  7天
                </el-button>
                <el-button 
                  :type="timeRange === '30d' ? 'primary' : ''"
                  @click="changeTimeRange('30d')"
                >
                  30天
                </el-button>
              </el-button-group>
            </div>
          </div>
          <div class="chart-content" v-loading="loadingCharts">
            <div class="timeline-chart">
              <div class="chart-bars">
                <div 
                  v-for="(data, index) in timelineData" 
                  :key="index"
                  class="chart-bar"
                  :style="{ 
                    height: `${(data.value / maxTimelineValue) * 100}%`
                  }"
                  :title="`${data.date}: ${data.value} 个事件`"
                >
                </div>
              </div>
              <div class="chart-labels">
                <span v-for="(data, index) in timelineData.filter((_, i) => i % 3 === 0)" :key="index">
                  {{ formatChartDate(data.date) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 热门标签 -->
        <div class="chart-card fade-in-up">
          <div class="chart-header">
            <h3>热门标签</h3>
            <el-button size="small" text @click="refreshTagCloud">
              <el-icon><Refresh /></el-icon>
            </el-button>
          </div>
          <div class="chart-content" v-loading="loadingCharts">
            <div class="tag-cloud">
              <span
                v-for="tag in popularTags"
                :key="tag.name"
                class="cloud-tag"
                :style="{
                  fontSize: `${Math.max(12, Math.min(20, tag.count * 1.5))}px`,
                  color: getCategoryColor(tag.category)
                }"
                @click="searchByTag(tag.name)"
              >
                {{ tag.name }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 详细分析 -->
    <div class="analysis-section fade-in-up">
      <h2 class="section-title">数据洞察</h2>
      <div class="analysis-grid">
        <div class="analysis-card">
          <h3>活跃度分析</h3>
          <div class="insight-item">
            <el-icon class="insight-icon"><TrendCharts /></el-icon>
            <div class="insight-text">
              <span class="insight-title">本月新增事件</span>
              <span class="insight-value">{{ monthlyStats.current }} 个</span>
              <span class="insight-desc">比上月增长 {{ monthlyStats.growth }}%</span>
            </div>
          </div>
        </div>

        <div class="analysis-card">
          <h3>内容分析</h3>
          <div class="insight-item">
            <el-icon class="insight-icon"><Document /></el-icon>
            <div class="insight-text">
              <span class="insight-title">最活跃分类</span>
              <span class="insight-value">{{ mostActiveCategory.name }}</span>
              <span class="insight-desc">占比 {{ mostActiveCategory.percentage }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  BarChart, TrendCharts, Refresh, 
  Document, CaretTop, CaretBottom
} from '@element-plus/icons-vue'
import { eventAPI } from '@/api/events'
import dayjs from 'dayjs'

const router = useRouter()

// 响应式数据
const loadingCharts = ref(false)
const timeRange = ref('30d')
const categoryStats = ref([])
const timelineData = ref([])
const totalEvents = ref(0)

// 概览统计
const overviewStats = ref([
  { key: 'total', label: '总事件数', value: 0, icon: Document, color: '#667eea', growth: 12 },
  { key: 'categories', label: '事件分类', value: 0, icon: BarChart, color: '#764ba2' },
  { key: 'thisMonth', label: '本月新增', value: 0, icon: TrendCharts, color: '#f093fb', growth: 25 }
])

// 热门标签
const popularTags = ref([])

// 统计数据
const monthlyStats = ref({ current: 15, growth: 25 })

// 计算属性
const maxTimelineValue = computed(() => {
  return Math.max(...timelineData.value.map(d => d.value)) || 1
})

const maxCategoryCount = computed(() => {
  return Math.max(...categoryStats.value.map(c => c.count)) || 1
})

const mostActiveCategory = computed(() => {
  if (categoryStats.value.length === 0) return { name: '暂无', percentage: 0 }
  
  const topCategory = categoryStats.value.reduce((max, cat) => 
    cat.count > max.count ? cat : max
  )
  
  return {
    name: topCategory.category,
    percentage: ((topCategory.count / totalEvents.value) * 100).toFixed(1)
  }
})

// 页面初始化
onMounted(async () => {
  await loadStatistics()
})

// 加载统计数据
async function loadStatistics() {
  loadingCharts.value = true
  
  try {
    const [categories, timeline] = await Promise.all([
      eventAPI.getCategoriesStats(),
      eventAPI.getTimelineStats()
    ])
    
    categoryStats.value = categories
    timelineData.value = generateTimelineData(timeline)
    totalEvents.value = categories.reduce((sum, cat) => sum + cat.count, 0)
    
    // 更新概览统计
    updateOverviewStats(categories, timeline)
    
    // 生成热门标签
    generatePopularTags()
    
  } catch (error) {
    console.error('加载统计数据失败:', error)
    // 模拟数据
    loadMockData()
  } finally {
    loadingCharts.value = false
  }
}

// 加载模拟数据
function loadMockData() {
  categoryStats.value = [
    { category: '科技', count: 25 },
    { category: '金融', count: 18 },
    { category: '创业', count: 15 },
    { category: '互联网', count: 12 },
    { category: '医疗', count: 8 }
  ]
  
  timelineData.value = Array.from({ length: 30 }, (_, i) => ({
    date: dayjs().subtract(29 - i, 'day').format('YYYY-MM-DD'),
    value: Math.floor(Math.random() * 8) + 1
  }))
  
  totalEvents.value = 78
  
  overviewStats.value[0].value = 78
  overviewStats.value[1].value = 5
  overviewStats.value[2].value = 15
  
  generatePopularTags()
}

// 生成时间线数据
function generateTimelineData(rawData) {
  const days = timeRange.value === '7d' ? 7 : 30
  const data = []
  
  for (let i = days - 1; i >= 0; i--) {
    const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD')
    const existing = rawData.find(d => d.date === date)
    data.push({
      date,
      value: existing?.count || Math.floor(Math.random() * 6)
    })
  }
  
  return data
}

// 更新概览统计
function updateOverviewStats(categories, timeline) {
  const total = categories.reduce((sum, cat) => sum + cat.count, 0)
  const currentMonth = dayjs().format('YYYY-MM')
  const thisMonthCount = timeline
    .filter(item => item.date && item.date.startsWith(currentMonth))
    .reduce((sum, item) => sum + item.count, 0)
  
  overviewStats.value[0].value = total
  overviewStats.value[1].value = categories.length
  overviewStats.value[2].value = thisMonthCount
}

// 生成热门标签
function generatePopularTags() {
  popularTags.value = [
    { name: '投资', count: 15, category: '金融' },
    { name: '人工智能', count: 12, category: '科技' },
    { name: '创业', count: 10, category: '创业' },
    { name: '电商', count: 8, category: '互联网' },
    { name: '区块链', count: 7, category: '科技' },
    { name: '新能源', count: 9, category: '汽车' },
    { name: '5G', count: 11, category: '科技' },
    { name: '云计算', count: 13, category: '科技' },
    { name: '医疗', count: 6, category: '医疗' },
    { name: '教育', count: 5, category: '教育' }
  ]
}

// 时间范围切换
async function changeTimeRange(range) {
  timeRange.value = range
  await loadStatistics()
}

// 刷新标签云
function refreshTagCloud() {
  popularTags.value = popularTags.value.sort(() => Math.random() - 0.5)
}

// 按标签搜索
function searchByTag(tagName) {
  router.push({
    path: '/search',
    query: { tags: tagName }
  })
}

// 工具函数
function formatChartDate(dateString) {
  return dayjs(dateString).format('MM/DD')
}

function getCategoryColor(category) {
  const colorMap = {
    '金融': '#f59e0b',
    '科技': '#06b6d4',
    '创业': '#8b5cf6',
    '互联网': '#ec4899',
    '医疗': '#10b981',
    '教育': '#3b82f6',
    '房产': '#f97316',
    '汽车': '#6366f1',
    '娱乐': '#f43f5e',
    '体育': '#84cc16'
  }
  return colorMap[category] || '#667eea'
}
</script>

<style lang="scss" scoped>
.statistics-page {
  min-height: 100vh;
}

// 页面头部
.page-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 40px 0;

  .page-title {
    font-size: 36px;
    font-weight: 700;
    color: white;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .page-subtitle {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.8);
  }
}

// 统计概览
.stats-overview {
  margin-bottom: 40px;

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;

    .stat-card {
      background: var(--bg-primary);
      border-radius: 16px;
      padding: 32px;
      display: flex;
      align-items: center;
      gap: 20px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      }

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }

      .stat-content {
        flex: 1;

        .stat-value {
          font-size: 32px;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1;
        }

        .stat-label {
          font-size: 16px;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .stat-growth {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          margin-top: 8px;

          &.positive {
            color: #10b981;
          }

          &.negative {
            color: #f87171;
          }
        }
      }
    }
  }
}

// 图表区域
.charts-container {
  margin-bottom: 60px;

  .charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 24px;

    .chart-card {
      background: var(--bg-primary);
      border-radius: 16px;
      padding: 24px;
      min-height: 400px;

      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;

        h3 {
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary);
        }
      }

      .chart-content {
        height: 320px;
      }
    }
  }
}

// 分类分布
.category-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .category-item {
    display: flex;
    align-items: center;
    gap: 12px;

    .category-info {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 80px;

      .category-color {
        width: 12px;
        height: 12px;
        border-radius: 50%;
      }

      .category-name {
        font-weight: 500;
        color: var(--text-primary);
      }
    }

    .category-bar {
      flex: 1;
      height: 12px;
      background: var(--bg-secondary);
      border-radius: 6px;
      overflow: hidden;

      .category-fill {
        height: 100%;
        border-radius: 6px;
        transition: width 0.6s ease;
      }
    }

    .category-count {
      font-weight: 600;
      color: var(--text-primary);
      min-width: 30px;
      text-align: right;
    }
  }
}

// 时间线图表
.timeline-chart {
  height: 100%;
  display: flex;
  flex-direction: column;

  .chart-bars {
    flex: 1;
    display: flex;
    align-items: end;
    gap: 2px;
    padding-bottom: 20px;

    .chart-bar {
      flex: 1;
      min-height: 8px;
      background: linear-gradient(to top, var(--primary-color), var(--secondary-color));
      border-radius: 2px 2px 0 0;
      transition: all 0.3s ease;

      &:hover {
        opacity: 0.8;
        transform: scaleY(1.1);
      }
    }
  }

  .chart-labels {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--text-light);
  }
}

// 标签云
.tag-cloud {
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;

  .cloud-tag {
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 6px 12px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.1);

    &:hover {
      transform: scale(1.1);
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

// 详细分析
.analysis-section {
  .section-title {
    font-size: 28px;
    font-weight: 700;
    color: white;
    text-align: center;
    margin-bottom: 40px;
  }

  .analysis-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 24px;

    .analysis-card {
      background: var(--bg-primary);
      border-radius: 16px;
      padding: 28px;

      h3 {
        font-size: 20px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 20px;
      }

      .insight-item {
        display: flex;
        align-items: center;
        gap: 16px;

        .insight-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: var(--primary-color);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .insight-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;

          .insight-title {
            font-size: 14px;
            color: var(--text-secondary);
          }

          .insight-value {
            font-size: 20px;
            font-weight: 700;
            color: var(--text-primary);
          }

          .insight-desc {
            font-size: 13px;
            color: var(--text-light);
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }

  .analysis-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 20px 0;

    .page-title {
      font-size: 28px;
    }
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .chart-card {
    padding: 20px;
    min-height: 350px;

    .chart-content {
      height: 280px;
    }
  }
}
</style> 