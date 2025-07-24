<template>
  <div class="timeline-page">
    <!-- 页面头部 -->
    <div class="page-header fade-in-up">
      <div class="header-content">
              <h1 class="page-title">
        <el-icon><Clock /></el-icon>
        事件时间线
      </h1>
        <p class="page-subtitle">按时间顺序展示你的重要时刻</p>
      </div>
      
      <!-- 控制面板 -->
      <div class="controls">
        <div class="layout-controls">
          <el-button-group>
            <el-button 
              :type="layoutMode === 'vertical' ? 'primary' : ''" 
              @click="layoutMode = 'vertical'"
            >
              <el-icon><Operation /></el-icon>
              垂直
            </el-button>
            <el-button 
              :type="layoutMode === 'horizontal' ? 'primary' : ''" 
              @click="layoutMode = 'horizontal'"
            >
              <el-icon><Menu /></el-icon>
              水平
            </el-button>
          </el-button-group>
        </div>
        
        <div class="filter-controls">
          <el-select 
            v-model="selectedCategory" 
            placeholder="选择分类" 
            clearable
            @change="loadEvents"
            style="width: 150px"
          >
            <el-option 
              v-for="category in categories" 
              :key="category.category"
              :label="category.category" 
              :value="category.category"
            />
          </el-select>
          
          <el-button @click="loadEvents" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>
    </div>

    <!-- 时间线内容 -->
    <div class="timeline-content" v-loading="loading">
      <!-- 垂直时间线 -->
      <div v-if="layoutMode === 'vertical'" class="vertical-timeline slide-in-left">
        <div 
          v-for="(event, index) in events" 
          :key="event.id"
          class="timeline-item"
          :class="{ 'timeline-item-left': index % 2 === 0, 'timeline-item-right': index % 2 === 1 }"
        >
          <!-- 时间节点 -->
          <div class="timeline-dot">
            <div class="dot-inner" :style="{ background: getCategoryColor(event.category) }">
              <el-icon>
                <component :is="getCategoryIcon(event.category)" />
              </el-icon>
            </div>
          </div>
          
          <!-- 事件卡片 -->
          <div class="timeline-card" @click="viewEventDetail(event.id)">
            <div class="card-header">
              <div class="event-date">{{ formatDate(event.event_date) }}</div>
              <div class="event-category" :style="{ color: getCategoryColor(event.category) }">
                {{ event.category }}
              </div>
            </div>
            
            <h3 class="event-title">{{ event.title }}</h3>
            </div>
        </div>
      </div>

      <!-- 水平时间线 -->
      <div v-else class="horizontal-timeline">
        <div class="timeline-slider">
          <div class="timeline-track">
            <div 
              v-for="(event, index) in events" 
              :key="event.id"
              class="timeline-point"
              :style="{ left: getTimelinePosition(event.event_date) + '%' }"
            >
              <!-- 时间节点 -->
              <div class="point-dot" :style="{ background: getCategoryColor(event.category) }">
                <el-icon>
                  <component :is="getCategoryIcon(event.category)" />
                </el-icon>
        </div>
        
              <!-- 事件卡片 -->
              <div 
                class="horizontal-timeline-card"
                :class="{ 'card-above': index % 2 === 0, 'card-below': index % 2 === 1 }"
                @click="viewEventDetail(event.id)"
              >
            <div class="card-header">
                  <div class="event-date">{{ formatShortDate(event.event_date) }}</div>
                  <div class="event-category" :style="{ color: getCategoryColor(event.category) }">
                    {{ event.category }}
            </div>
            </div>
            
                <h3 class="event-title">{{ event.title }}</h3>
            </div>
            
              <!-- 连接线 -->
              <div class="connection-line" :class="{ 'line-above': index % 2 === 0, 'line-below': index % 2 === 1 }"></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="!loading && events.length === 0" class="empty-state">
        <el-icon size="64" color="rgba(255,255,255,0.5)">
          <Document />
        </el-icon>
        <h3>暂无事件记录</h3>
        <p>开始添加你的第一个重要时刻</p>
        <el-button type="primary" @click="$router.push('/event/add')">
          添加事件
        </el-button>
      </div>
    </div>

    <!-- 加载更多提示 -->
    <div v-if="hasMore && !loading" class="load-more-wrapper">
      <div class="load-more-trigger" ref="loadMoreTrigger">
        <el-button text @click="loadMoreEvents">
          <el-icon><ArrowDown /></el-icon>
          加载更多事件
        </el-button>
      </div>
    </div>
    
    <!-- 加载中提示 -->
    <div v-if="loading && events.length > 0" class="loading-more">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载更多中...</span>
    </div>
    
    <!-- 没有更多数据提示 -->
    <div v-if="!hasMore && events.length > 0" class="no-more">
      <el-divider>
        <el-icon><Check /></el-icon>
        已显示全部事件
      </el-divider>
    </div>

    <!-- 事件详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="事件详情"
      width="70%"
      :close-on-click-modal="false"
      class="event-detail-dialog"
    >
      <div v-loading="detailLoading" class="event-detail-content">
        <div v-if="selectedEventDetail" class="event-detail">
          <!-- 事件头部信息 -->
          <div class="event-header">
            <div class="event-meta">
              <div class="event-date">
                <el-icon><Clock /></el-icon>
                {{ formatDate(selectedEventDetail.event_date) }}
              </div>
              <div 
                class="event-category-badge" 
                :style="{ 
                  background: getCategoryColor(selectedEventDetail.category),
                  color: 'white'
                }"
              >
                <el-icon>
                  <component :is="getCategoryIcon(selectedEventDetail.category)" />
                </el-icon>
                {{ selectedEventDetail.category }}
              </div>
            </div>
            
            <h2 class="event-title">{{ selectedEventDetail.title }}</h2>
          </div>

          <!-- 事件描述 -->
          <div class="event-description">
            <h3>详细描述</h3>
            <p>{{ selectedEventDetail.description }}</p>
          </div>

          <!-- 事件标签 -->
          <div v-if="selectedEventDetail.tags" class="event-tags-section">
            <h3>相关标签</h3>
            <div class="tags-container">
              <span 
                v-for="tag in parseEventTags(selectedEventDetail.tags)" 
                :key="tag"
                class="tag-item"
                :class="`tag-${getCategoryByTag(tag)}`"
              >
                <el-icon><CollectionTag /></el-icon>
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- 重要程度 -->
          <div class="event-impact-section">
            <h3>重要程度</h3>
            <div class="impact-display">
              <el-rate 
                :model-value="selectedEventDetail.impact_score / 2" 
                disabled 
                size="large"
                show-score
                :score-template="`${selectedEventDetail.impact_score}/10`"
              />
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="event-actions">
            <el-button type="primary" @click="editEvent(selectedEventDetail)">
              <el-icon><Edit /></el-icon>
              编辑事件
            </el-button>
            <el-button type="danger" @click="deleteEvent(selectedEventDetail)">
              <el-icon><Delete /></el-icon>
              删除事件
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { 
  Clock, Operation, Menu, Refresh, Document,
  TrendCharts, Coin, Cpu, Star, Monitor, 
  MagicStick, House, Van, VideoCamera, Football,
  ArrowDown, Loading, Check, CollectionTag, Edit, Delete
} from '@element-plus/icons-vue'
import { eventAPI } from '@/api/events'
import dayjs from 'dayjs'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const layoutMode = ref('vertical') // 'vertical' | 'horizontal'
const events = ref([])
const categories = ref([])
const selectedCategory = ref('')

const currentPage = ref(1)
const pageSize = ref(20)
const totalEvents = ref(0)
const hasMore = ref(true)
const loadMoreTrigger = ref(null)

// 事件详情对话框
const detailDialogVisible = ref(false)
const selectedEventDetail = ref(null)
const detailLoading = ref(false)

// 页面加载
onMounted(async () => {
  try {
    console.log('时间线页面开始加载...')
    await loadCategories()
    console.log('分类加载完成')
    await loadEvents() 
    console.log('事件加载完成')
    
    // 设置无限滚动
    setupInfiniteScroll()
  } catch (error) {
    console.error('时间线页面加载失败:', error)
  }
})

// 加载分类
async function loadCategories() {
  try {
    console.log('正在加载分类...')
    categories.value = await eventAPI.getCategoriesStats()
    console.log('分类数据:', categories.value)
  } catch (error) {
    console.error('加载分类失败:', error)
    // 设置模拟数据以防API失败
    categories.value = [
      { category: '科技', count: 1 },
      { category: '金融', count: 0 },
      { category: '创业', count: 0 }
    ]
  }
}

// 加载事件（重置加载）
async function loadEvents() {
  loading.value = true
  currentPage.value = 1
  
  try {
    console.log('正在加载事件...')
    const response = await eventAPI.getTimeline({
      page: 1,
      size: pageSize.value,
      category: selectedCategory.value || undefined
    })
    
    // 按时间倒序排列（最新在前）
    const eventList = (response.events || []).sort((a, b) => 
      new Date(b.event_date) - new Date(a.event_date)
    )
    
    events.value = eventList
    totalEvents.value = response.total || 0
    hasMore.value = eventList.length >= pageSize.value
    
    console.log(`加载了 ${eventList.length} 个事件，总数: ${totalEvents.value}`)
  } catch (error) {
    console.error('加载事件失败:', error)
    ElMessage.error('加载事件失败')
  } finally {
    loading.value = false
  }
}

// 加载更多事件
async function loadMoreEvents() {
  if (loading.value || !hasMore.value) return
  
  loading.value = true
  currentPage.value++
  
  try {
    console.log(`正在加载第 ${currentPage.value} 页...`)
    const response = await eventAPI.getTimeline({
      page: currentPage.value,
      size: pageSize.value,
      category: selectedCategory.value || undefined
    })
    
    const newEvents = (response.events || []).sort((a, b) => 
      new Date(b.event_date) - new Date(a.event_date)
    )
    
    if (newEvents.length > 0) {
      // 合并新事件，保持时间倒序
      const allEvents = [...events.value, ...newEvents]
      events.value = allEvents.sort((a, b) => 
        new Date(b.event_date) - new Date(a.event_date)
      )
      
      console.log(`新增 ${newEvents.length} 个事件`)
    }
    
    // 检查是否还有更多数据
    hasMore.value = newEvents.length >= pageSize.value
    
  } catch (error) {
    console.error('加载更多事件失败:', error)
    ElMessage.error('加载更多事件失败')
    currentPage.value-- // 回退页码
  } finally {
    loading.value = false
  }
}

// 查看事件详情
async function viewEventDetail(eventId) {
  try {
    detailLoading.value = true
    detailDialogVisible.value = true
    
    console.log('获取事件详情:', eventId)
    const eventDetail = await eventAPI.getEvent(eventId)
    selectedEventDetail.value = eventDetail
    
  } catch (error) {
    console.error('获取事件详情失败:', error)
    ElMessage.error('获取事件详情失败')
    detailDialogVisible.value = false
  } finally {
    detailLoading.value = false
  }
}

// 编辑事件
function editEvent(event) {
  console.log('编辑事件:', event)
  // 关闭详情对话框
  detailDialogVisible.value = false
  // 跳转到编辑页面
  router.push(`/event/edit/${event.id}`)
}

// 删除事件
async function deleteEvent(event) {
  try {
    await ElMessageBox.confirm(
      `确定要删除事件"${event.title}"吗？此操作无法撤销。`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    await eventAPI.deleteEvent(event.id)
    ElMessage.success('删除成功')
    await loadEvents()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除事件失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 工具函数
function formatDate(dateString) {
  return dayjs(dateString).format('YYYY年MM月DD日 HH:mm')
}

function formatShortDate(dateString) {
  return dayjs(dateString).format('MM/DD')
}

function parseEventTags(tagsString, limit = null) {
  if (!tagsString) return []
  const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag)
  return limit ? tags.slice(0, limit) : tags
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

function getCategoryIcon(category) {
  const iconMap = {
    '金融': TrendCharts,
    '科技': Cpu,
    '创业': Star,
    '互联网': Monitor,
    '医疗': MagicStick,
    '教育': House,
    '房产': House,
    '汽车': Van,
    '娱乐': VideoCamera,
    '体育': Football
  }
  return iconMap[category] || TrendCharts
}

// 水平时间线位置计算
function getTimelinePosition(eventDate) {
  if (events.value.length === 0) return 0
  
  const dates = events.value.map(e => dayjs(e.event_date))
  if (dates.length === 0) return 50
  
  // 找到最小和最大日期
  let minDate = dates[0]
  let maxDate = dates[0]
  
  for (const date of dates) {
    if (date.isBefore(minDate)) minDate = date
    if (date.isAfter(maxDate)) maxDate = date
  }
  
  const currentDate = dayjs(eventDate)
  
  if (minDate.isSame(maxDate)) return 50
  
  const totalDuration = maxDate.diff(minDate)
  const eventDuration = currentDate.diff(minDate)
  
  return Math.max(5, Math.min(95, (eventDuration / totalDuration) * 90 + 5))
}

// 设置无限滚动
function setupInfiniteScroll() {
  if (!loadMoreTrigger.value) return
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && hasMore.value && !loading.value) {
          console.log('触发无限滚动，加载更多数据...')
          loadMoreEvents()
        }
      })
    },
    {
      rootMargin: '100px' // 提前100px触发
    }
  )
  
  observer.observe(loadMoreTrigger.value)
  
  // 组件卸载时清理观察器
  onUnmounted(() => {
    observer.disconnect()
  })
}
</script>

<style lang="scss" scoped>
.timeline-page {
  min-height: 100vh;
}

// 页面头部
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40px;
  padding: 30px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .header-content {
    .page-title {
      font-size: 36px;
      font-weight: 700;
      color: white;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .page-subtitle {
      font-size: 18px;
      color: rgba(255, 255, 255, 0.7);
    }
  }

  .controls {
    display: flex;
    gap: 20px;
    align-items: center;

    .layout-controls, .filter-controls {
      display: flex;
      gap: 12px;
      align-items: center;
    }
  }
}

// 垂直时间线
.vertical-timeline {
  position: relative;
  padding: 20px 0;

  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(180deg, 
      rgba(255, 255, 255, 0.1) 0%, 
      rgba(255, 255, 255, 0.3) 50%, 
      rgba(255, 255, 255, 0.1) 100%);
    transform: translateX(-50%);
  }

  .timeline-item {
    position: relative;
    margin-bottom: 32px;
    display: flex;
    align-items: center;

    &.timeline-item-left {
      flex-direction: row;
      .timeline-card {
        margin-right: 44px;
      }
    }

    &.timeline-item-right {
      flex-direction: row-reverse;
      .timeline-card {
        margin-left: 44px;
      }
    }

    .timeline-dot {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      z-index: 2;

      .dot-inner {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 18px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border: 3px solid rgba(255, 255, 255, 0.3);
      }
    }

    .timeline-card {
      flex: 1;
      max-width: calc(50% - 44px);
      background: var(--bg-primary);
      border-radius: 12px;
      padding: 16px 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;

        .event-date {
          font-size: 12px;
          color: var(--text-light);
        }

        .event-category {
          font-size: 12px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.1);
        }
      }

      .event-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }
  }
}

// 水平时间线
.horizontal-timeline {
  .timeline-slider {
    padding: 80px 0;
    margin-bottom: 40px;

    .timeline-track {
      position: relative;
      height: 4px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
      margin: 0 20px;

      .timeline-point {
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);

        .point-dot {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 3px solid rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
          z-index: 3;
          position: relative;

          &:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
          }
        }

        .connection-line {
          position: absolute;
          left: 50%;
          width: 2px;
          background: rgba(255, 255, 255, 0.3);
          transform: translateX(-50%);
          z-index: 1;

          &.line-above {
            top: -16px;
            height: 60px;
          }

          &.line-below {
            bottom: -16px;
            height: 60px;
    }
  }

        .horizontal-timeline-card {
          position: absolute;
          left: 50%;
          width: 220px;
          transform: translateX(-50%);
      background: var(--bg-primary);
          border-radius: 12px;
          padding: 12px 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          z-index: 2;

          &.card-above {
            bottom: 44px;
          }

          &.card-below {
            top: 44px;
          }

          &:hover {
            transform: translateX(-50%) translateY(-3px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      }

          .card-header {
        display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;

        .event-date {
              font-size: 11px;
          color: var(--text-light);
        }

        .event-category {
              font-size: 10px;
          font-weight: 600;
              padding: 2px 6px;
              border-radius: 8px;
              background: rgba(255, 255, 255, 0.1);
        }
      }

          .event-title {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-primary);
            margin: 0;
            line-height: 1.3;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }
      }
    }
  }
}

// 空状态
.empty-state {
  text-align: center;
  padding: 100px 20px;

  h3 {
    font-size: 24px;
    color: white;
    margin: 24px 0 12px;
  }

  p {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 32px;
  }
}

// 无限滚动相关样式
.load-more-wrapper {
  display: flex;
  justify-content: center;
  padding: 60px 0 40px;

  .load-more-trigger {
    padding: 20px;
    cursor: pointer;
    
    .el-button {
      color: rgba(255, 255, 255, 0.8);
      font-size: 16px;
      
      &:hover {
        color: #409eff;
        background: rgba(64, 158, 255, 0.1);
      }
    }
  }
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  gap: 12px;

  .is-loading {
    animation: rotating 1s linear infinite;
  }
}

.no-more {
  padding: 40px 0;
  text-align: center;

  :deep(.el-divider__text) {
    background: transparent;
    color: rgba(255, 255, 255, 0.6);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  :deep(.el-divider) {
    border-color: rgba(255, 255, 255, 0.2);
  }
}

@keyframes rotating {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 事件详情对话框样式
:deep(.event-detail-dialog) {
  .el-dialog {
    border-radius: 16px;
    background: var(--bg-primary);
  }

  .el-dialog__header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 24px 32px;
    border-radius: 16px 16px 0 0;

    .el-dialog__title {
      font-size: 20px;
      font-weight: 600;
    }

    .el-dialog__headerbtn {
      .el-dialog__close {
        color: white;
        font-size: 20px;
        
        &:hover {
          color: rgba(255, 255, 255, 0.8);
        }
      }
    }
  }

  .el-dialog__body {
    padding: 0;
  }
}

.event-detail-content {
  min-height: 200px;

  .event-detail {
    padding: 32px;

    .event-header {
      margin-bottom: 32px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      .event-meta {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;
        align-items: center;

        .event-date {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-light);
          font-size: 14px;
        }

        .event-category-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }

      .event-title {
        font-size: 28px;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0;
        line-height: 1.3;
      }
    }

    .event-description {
      margin-bottom: 32px;

      h3 {
        font-size: 18px;
        color: var(--text-primary);
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        
        &::before {
          content: '';
          width: 4px;
          height: 18px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 2px;
          margin-right: 10px;
        }
      }

      p {
        color: var(--text-secondary);
        line-height: 1.8;
        font-size: 16px;
        margin: 0;
      }
    }

    .event-tags-section {
      margin-bottom: 32px;

      h3 {
        font-size: 18px;
        color: var(--text-primary);
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        
        &::before {
          content: '';
          width: 4px;
          height: 18px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 2px;
          margin-right: 10px;
        }
      }

      .tags-container {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;

        .tag-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          color: var(--text-primary);
          font-size: 14px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;

          &:hover {
            background: rgba(255, 255, 255, 0.15);
            transform: translateY(-1px);
          }
        }
      }
    }

    .event-impact-section {
      margin-bottom: 32px;

      h3 {
        font-size: 18px;
        color: var(--text-primary);
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        
        &::before {
          content: '';
          width: 4px;
          height: 18px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 2px;
          margin-right: 10px;
        }
      }

      .impact-display {
        .el-rate {
          :deep(.el-rate__text) {
            color: var(--text-secondary);
            font-weight: 600;
            margin-left: 12px;
          }
        }
      }
    }

    .event-actions {
      display: flex;
      gap: 16px;
      padding-top: 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      justify-content: center;

      .el-button {
        padding: 12px 24px;
        font-size: 14px;
        font-weight: 600;
        border-radius: 8px;
        
        .el-icon {
          margin-right: 6px;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1024px) {
  :deep(.event-detail-dialog) {
    .el-dialog {
      width: 90% !important;
      margin: 5vh auto;
    }
  }

  .event-detail-content .event-detail {
    padding: 20px;

    .event-header .event-title {
      font-size: 24px;
    }

    .event-actions {
      flex-direction: column;
      
      .el-button {
        width: 100%;
      }
    }
  }
}

@media (max-width: 1024px) {
  .page-header {
    flex-direction: column;
    gap: 24px;
    align-items: stretch;
  }

  .vertical-timeline {
    &::before {
      left: 24px;
    }

    .timeline-item {
      &.timeline-item-left,
      &.timeline-item-right {
        flex-direction: row;
        
        .timeline-card {
          margin-left: 54px;
          margin-right: 0;
          max-width: none;
        }
      }

      .timeline-dot {
        left: 24px;
      }
    }
  }
}

@media (max-width: 768px) {
  :deep(.event-detail-dialog) {
    .el-dialog {
      width: 95% !important;
      margin: 2vh auto;
    }
    
    .el-dialog__header {
      padding: 16px 20px;
      
      .el-dialog__title {
        font-size: 18px;
      }
    }
  }

  .event-detail-content .event-detail {
    padding: 16px;

    .event-header {
      margin-bottom: 24px;

      .event-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }

      .event-title {
        font-size: 20px;
      }
    }

    .event-description,
    .event-tags-section,
    .event-impact-section {
      margin-bottom: 24px;

      h3 {
        font-size: 16px;
      }
    }

    .tags-container .tag-item {
      font-size: 12px;
      padding: 6px 10px;
    }
  }

  .page-header .controls {
    flex-direction: column;
    gap: 16px;
  }

  .horizontal-timeline .timeline-slider .timeline-track {
    margin: 0 10px;

    .timeline-point .horizontal-timeline-card {
      width: 180px;
      padding: 10px 12px;

      .card-header {
        margin-bottom: 6px;

        .event-date {
          font-size: 10px;
        }

        .event-category {
          font-size: 9px;
          padding: 1px 4px;
        }
      }

      .event-title {
        font-size: 12px;
        line-height: 1.2;
      }
    }
  }

  .timeline-item .timeline-card {
    padding: 14px 16px;
  }
}
</style> 