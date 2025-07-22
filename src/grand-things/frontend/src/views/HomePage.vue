<template>
  <div class="home-page">
    <!-- 欢迎横幅 -->
    <section class="hero-section fade-in-up">
      <div class="hero-content">
        <h1 class="hero-title">
          欢迎使用 <span class="gradient-text">Grand Things</span>
        </h1>
        <p class="hero-subtitle">
          记录人生中的重要时刻，让每个瞬间都值得被珍藏
        </p>
        <div class="hero-actions">
          <el-button type="primary" size="large" @click="$router.push('/event/add')">
            <el-icon><Plus /></el-icon>
            添加你的第一个事件
          </el-button>
          <el-button size="large" @click="$router.push('/timeline')">
            <el-icon><Timeline /></el-icon>
            查看时间线
          </el-button>
        </div>
      </div>
      <div class="hero-image">
        <div class="floating-cards">
          <div class="demo-card card-1" v-for="n in 3" :key="`demo-${n}`">
            <div class="demo-content">
              <div class="demo-title"></div>
              <div class="demo-text"></div>
              <div class="demo-tags">
                <span class="demo-tag"></span>
                <span class="demo-tag"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 统计概览 -->
    <section class="stats-section slide-in-left">
      <div class="stats-grid">
        <div class="stat-card" v-for="stat in stats" :key="stat.key">
          <div class="stat-icon">
            <el-icon size="32">
              <component :is="stat.icon" />
            </el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 最近事件 -->
    <section class="recent-events-section fade-in-up">
      <div class="section-header">
        <h2>最近事件</h2>
        <el-button text @click="$router.push('/timeline')">
          查看全部
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      
      <div class="events-grid" v-loading="loading">
        <div 
          v-for="event in recentEvents" 
          :key="event.id"
          class="event-card"
          @click="$router.push(`/event/${event.id}`)"
        >
          <div class="event-header">
            <h3 class="event-title">{{ event.title }}</h3>
            <span class="event-date">
              {{ formatDate(event.event_date) }}
            </span>
          </div>
          <p class="event-description">{{ event.description }}</p>
          <div class="event-tags">
            <span 
              v-for="tag in parseEventTags(event.tags)" 
              :key="tag"
              class="tag"
              :class="`tag-${getCategoryByTag(tag)}`"
            >
              {{ tag }}
            </span>
          </div>
          <div class="event-footer">
            <span class="event-category">{{ event.category }}</span>
            <div class="event-rating">
              <el-rate 
                :model-value="event.impact_score / 2" 
                disabled 
                size="small"
                show-score
              />
            </div>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-if="!loading && recentEvents.length === 0" class="empty-state">
          <el-icon size="64" color="#a0aec0">
            <Document />
          </el-icon>
          <h3>还没有任何事件</h3>
          <p>开始记录你的第一个重要时刻吧！</p>
          <el-button type="primary" @click="$router.push('/event/add')">
            添加事件
          </el-button>
        </div>
      </div>
    </section>

    <!-- 功能介绍 -->
    <section class="features-section fade-in-up">
      <h2 class="section-title">强大功能</h2>
      <div class="features-grid">
        <div class="feature-card" v-for="feature in features" :key="feature.title">
          <div class="feature-icon">
            <el-icon size="40">
              <component :is="feature.icon" />
            </el-icon>
          </div>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  Plus, Timeline, ArrowRight, Document,
  MagicStick, Search, TrendCharts, Trophy,
  Calendar, Bell
} from '@element-plus/icons-vue'
import { eventAPI } from '@/api/events'
import dayjs from 'dayjs'

// 响应式数据
const loading = ref(false)
const recentEvents = ref([])
const stats = ref([
  { key: 'total', label: '总事件数', value: 0, icon: Calendar },
  { key: 'categories', label: '事件分类', value: 0, icon: TrendCharts },
      { key: 'thisMonth', label: '本月新增', value: 0, icon: Bell },
  { key: 'highImpact', label: '重要事件', value: 0, icon: Trophy }
])

const features = [
  {
    title: '智能标签提取',
    description: '自动分析事件内容，提取相关标签和分类',
    icon: MagicStick
  },
  {
    title: '时间线展示',
    description: '直观的时间线布局，清晰展示事件发展历程',
    icon: Timeline
  },
  {
    title: '高效搜索',
    description: '支持多维度搜索，快速找到想要的事件',
    icon: Search
  },
  {
    title: '数据统计',
    description: '丰富的图表统计，深入了解事件分布情况',
    icon: TrendCharts
  }
]

// 页面加载
onMounted(async () => {
  await loadRecentEvents()
  await loadStats()
})

// 加载最近事件
async function loadRecentEvents() {
  loading.value = true
  try {
    const response = await eventAPI.getTimeline({ page: 1, size: 6 })
    recentEvents.value = response.events || []
  } catch (error) {
    console.error('加载最近事件失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载统计数据
async function loadStats() {
  try {
    const [categoriesStats, timelineStats] = await Promise.all([
      eventAPI.getCategoriesStats(),
      eventAPI.getTimelineStats()
    ])
    
    const total = categoriesStats.reduce((sum, item) => sum + item.count, 0)
    const currentMonth = dayjs().format('YYYY-MM')
    const thisMonthCount = timelineStats
      .filter(item => item.date.startsWith(currentMonth))
      .reduce((sum, item) => sum + item.count, 0)
    
    // 更新统计数据
    stats.value[0].value = total
    stats.value[1].value = categoriesStats.length
    stats.value[2].value = thisMonthCount
    stats.value[3].value = Math.floor(total * 0.3) // 假设30%为重要事件
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 工具函数
function formatDate(dateString) {
  return dayjs(dateString).format('MM月DD日')
}

function parseEventTags(tagsString) {
  if (!tagsString) return []
  return tagsString.split(',').slice(0, 3) // 只显示前3个标签
}

function getCategoryByTag(tag) {
  const categoryMap = {
    '金融': '金融', '投资': '金融', '股票': '金融',
    '科技': '科技', 'AI': '科技', '人工智能': '科技',
    '创业': '创业', '初创': '创业',
    '互联网': '互联网', '电商': '互联网',
    '医疗': '医疗', '健康': '医疗',
    '教育': '教育', '学习': '教育'
  }
  return categoryMap[tag] || 'default'
}
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
}

// 英雄区域
.hero-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  padding: 60px 0;
  min-height: 500px;

  .hero-content {
    .hero-title {
      font-size: 48px;
      font-weight: 800;
      color: white;
      margin-bottom: 20px;
      line-height: 1.2;

      .gradient-text {
        background: linear-gradient(135deg, #f093fb, #f5576c);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }

    .hero-subtitle {
      font-size: 20px;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 40px;
      line-height: 1.6;
    }

    .hero-actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
  }

  .hero-image {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;

    .floating-cards {
      position: relative;
      width: 300px;
      height: 300px;

      .demo-card {
        position: absolute;
        width: 200px;
        padding: 20px;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 12px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        animation: float 3s ease-in-out infinite;

        &.card-1 { 
          top: 0; 
          left: 50px; 
          animation-delay: 0s; 
        }
        &.card-2 { 
          top: 80px; 
          right: 0; 
          animation-delay: 1s; 
        }
        &.card-3 { 
          bottom: 0; 
          left: 0; 
          animation-delay: 2s; 
        }

        .demo-content {
          .demo-title {
            width: 80%;
            height: 16px;
            background: linear-gradient(90deg, #f0f0f0, #e0e0e0);
            border-radius: 4px;
            margin-bottom: 8px;
          }
          .demo-text {
            width: 100%;
            height: 12px;
            background: linear-gradient(90deg, #f8f8f8, #f0f0f0);
            border-radius: 4px;
            margin-bottom: 12px;
          }
          .demo-tags {
            display: flex;
            gap: 4px;
            .demo-tag {
              width: 40px;
              height: 20px;
              background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
              border-radius: 10px;
            }
          }
        }
      }
    }
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

// 统计区域
.stats-section {
  padding: 40px 0;

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 24px;

    .stat-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
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
        padding: 16px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        color: white;
      }

      .stat-content {
        .stat-number {
          font-size: 32px;
          font-weight: 800;
          color: white;
          line-height: 1;
        }

        .stat-label {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 4px;
        }
      }
    }
  }
}

// 最近事件区域
.recent-events-section {
  padding: 60px 0;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;

    h2 {
      font-size: 32px;
      font-weight: 700;
      color: white;
    }
  }

  .events-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 24px;

    .event-card {
      background: var(--bg-primary);
      border-radius: var(--border-radius);
      padding: 24px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      }

      .event-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12px;

        .event-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          flex: 1;
          margin-right: 12px;
        }

        .event-date {
          font-size: 14px;
          color: var(--text-light);
          flex-shrink: 0;
        }
      }

      .event-description {
        color: var(--text-secondary);
        line-height: 1.5;
        margin-bottom: 16px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .event-tags {
        margin-bottom: 16px;
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .event-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .event-category {
          font-size: 14px;
          font-weight: 500;
          color: var(--primary-color);
        }

        .event-rating {
          :deep(.el-rate) {
            height: auto;
          }
        }
      }
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 60px 20px;
      
      h3 {
        font-size: 24px;
        color: white;
        margin: 20px 0 12px;
      }

      p {
        font-size: 16px;
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 24px;
      }
    }
  }
}

// 功能介绍区域
.features-section {
  padding: 60px 0;

  .section-title {
    font-size: 32px;
    font-weight: 700;
    color: white;
    text-align: center;
    margin-bottom: 50px;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 32px;

    .feature-card {
      text-align: center;
      padding: 40px 24px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-6px);
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.2);
      }

      .feature-icon {
        margin-bottom: 24px;
        color: var(--accent-color);
      }

      h3 {
        font-size: 20px;
        font-weight: 600;
        color: white;
        margin-bottom: 16px;
      }

      p {
        font-size: 16px;
        color: rgba(255, 255, 255, 0.7);
        line-height: 1.6;
      }
    }
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .hero-section {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 40px;

    .hero-image {
      order: -1;
    }
  }
}

@media (max-width: 768px) {
  .hero-section .hero-content .hero-title {
    font-size: 36px;
  }

  .events-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}
</style> 