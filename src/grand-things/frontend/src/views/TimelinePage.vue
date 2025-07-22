<template>
  <div class="timeline-page">
    <!-- 页面头部 -->
    <div class="page-header fade-in-up">
      <div class="header-content">
        <h1 class="page-title">
          <el-icon><Timeline /></el-icon>
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
              <div class="event-impact">
                <span>重要程度：</span>
                <el-rate 
                  :model-value="event.impact_score / 2" 
                  disabled 
                  size="small"
                />
              </div>
              
              <div class="event-actions">
                <el-button size="small" text @click.stop="editEvent(event)">
                  编辑
                </el-button>
                <el-button size="small" text type="danger" @click.stop="deleteEvent(event)">
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 水平时间线 -->
      <div v-else class="horizontal-timeline">
        <div class="timeline-slider">
          <div class="timeline-track">
            <div 
              v-for="event in events" 
              :key="event.id"
              class="timeline-point"
              :style="{ left: getTimelinePosition(event.event_date) + '%' }"
              @click="selectedEvent = event"
            >
              <div class="point-dot" :style="{ background: getCategoryColor(event.category) }"></div>
              <div class="point-label">{{ formatShortDate(event.event_date) }}</div>
            </div>
          </div>
        </div>
        
        <!-- 选中事件详情 -->
        <div v-if="selectedEvent" class="selected-event-detail fade-in-up">
          <div class="event-card">
            <div class="card-header">
              <h2>{{ selectedEvent.title }}</h2>
              <el-button circle size="small" @click="selectedEvent = null">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
            
            <div class="event-meta">
              <span class="event-date">{{ formatDate(selectedEvent.event_date) }}</span>
              <span class="event-category" :style="{ color: getCategoryColor(selectedEvent.category) }">
                {{ selectedEvent.category }}
              </span>
            </div>
            
            <p class="event-description">{{ selectedEvent.description }}</p>
            
            <div class="event-tags">
              <span 
                v-for="tag in parseEventTags(selectedEvent.tags)" 
                :key="tag"
                class="tag"
                :class="`tag-${getCategoryByTag(tag)}`"
              >
                {{ tag }}
              </span>
            </div>
            
            <div class="event-actions">
              <el-button type="primary" @click="viewEventDetail(selectedEvent.id)">
                查看详情
              </el-button>
              <el-button @click="editEvent(selectedEvent)">
                编辑
              </el-button>
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

    <!-- 分页 -->
    <div v-if="events.length > 0" class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="totalEvents"
        layout="prev, pager, next, jumper, total"
        @current-change="loadEvents"
        background
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { 
  Timeline, Operation, Menu, Refresh, Close, Document,
  TrendCharts, Coin, Cpu, Rocket, Monitor, 
  MagicStick, House, Car, VideoCamera, Football
} from '@element-plus/icons-vue'
import { eventAPI } from '@/api/events'
import dayjs from 'dayjs'

// 响应式数据
const loading = ref(false)
const layoutMode = ref('vertical') // 'vertical' | 'horizontal'
const events = ref([])
const categories = ref([])
const selectedCategory = ref('')
const selectedEvent = ref(null)
const currentPage = ref(1)
const pageSize = ref(20)
const totalEvents = ref(0)

// 页面加载
onMounted(async () => {
  await loadCategories()
  await loadEvents()
})

// 加载分类
async function loadCategories() {
  try {
    categories.value = await eventAPI.getCategoriesStats()
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

// 加载事件
async function loadEvents() {
  loading.value = true
  try {
    const response = await eventAPI.getTimeline({
      page: currentPage.value,
      size: pageSize.value,
      category: selectedCategory.value || undefined
    })
    events.value = response.events || []
    totalEvents.value = response.total || 0
    
    // 水平时间线默认选择第一个事件
    if (layoutMode.value === 'horizontal' && events.value.length > 0) {
      selectedEvent.value = events.value[0]
    }
  } catch (error) {
    console.error('加载事件失败:', error)
    ElMessage.error('加载事件失败')
  } finally {
    loading.value = false
  }
}

// 查看事件详情
function viewEventDetail(eventId) {
  console.log('查看事件详情:', eventId)
  // TODO: 跳转到事件详情页
}

// 编辑事件
function editEvent(event) {
  console.log('编辑事件:', event)
  // TODO: 打开编辑对话框
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

function parseEventTags(tagsString) {
  if (!tagsString) return []
  return tagsString.split(',').slice(0, 4) // 显示前4个标签
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
    '创业': Rocket,
    '互联网': Monitor,
    '医疗': MagicStick,
    '教育': House,
    '房产': House,
    '汽车': Car,
    '娱乐': VideoCamera,
    '体育': Football
  }
  return iconMap[category] || TrendCharts
}

// 水平时间线位置计算
function getTimelinePosition(eventDate) {
  if (events.value.length === 0) return 0
  
  const dates = events.value.map(e => dayjs(e.event_date))
  const minDate = dayjs.min(dates)
  const maxDate = dayjs.max(dates)
  const currentDate = dayjs(eventDate)
  
  if (minDate.isSame(maxDate)) return 50
  
  const totalDuration = maxDate.diff(minDate)
  const eventDuration = currentDate.diff(minDate)
  
  return Math.max(5, Math.min(95, (eventDuration / totalDuration) * 90 + 5))
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
    margin-bottom: 60px;
    display: flex;
    align-items: center;

    &.timeline-item-left {
      flex-direction: row;
      .timeline-card {
        margin-right: 60px;
      }
    }

    &.timeline-item-right {
      flex-direction: row-reverse;
      .timeline-card {
        margin-left: 60px;
      }
    }

    .timeline-dot {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      z-index: 2;

      .dot-inner {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 24px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        border: 4px solid rgba(255, 255, 255, 0.3);
      }
    }

    .timeline-card {
      flex: 1;
      max-width: calc(50% - 60px);
      background: var(--bg-primary);
      border-radius: 16px;
      padding: 28px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);

      &:hover {
        transform: translateY(-6px);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .event-date {
          font-size: 14px;
          color: var(--text-light);
        }

        .event-category {
          font-size: 14px;
          font-weight: 600;
        }
      }

      .event-title {
        font-size: 20px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 12px;
        line-height: 1.4;
      }

      .event-description {
        color: var(--text-secondary);
        line-height: 1.6;
        margin-bottom: 16px;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .event-tags {
        margin-bottom: 20px;
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .event-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .event-impact {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .event-actions {
          display: flex;
          gap: 8px;
        }
      }
    }
  }
}

// 水平时间线
.horizontal-timeline {
  .timeline-slider {
    padding: 40px 0;
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
        cursor: pointer;

        .point-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 3px solid rgba(255, 255, 255, 0.8);
          transition: all 0.3s ease;

          &:hover {
            transform: scale(1.3);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }
        }

        .point-label {
          position: absolute;
          top: 30px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          white-space: nowrap;
        }
      }
    }
  }

  .selected-event-detail {
    .event-card {
      background: var(--bg-primary);
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 20px;

        h2 {
          font-size: 24px;
          font-weight: 600;
          color: var(--text-primary);
          flex: 1;
        }
      }

      .event-meta {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;

        .event-date {
          font-size: 16px;
          color: var(--text-light);
        }

        .event-category {
          font-size: 16px;
          font-weight: 600;
        }
      }

      .event-description {
        font-size: 16px;
        color: var(--text-secondary);
        line-height: 1.6;
        margin-bottom: 20px;
      }

      .event-tags {
        margin-bottom: 24px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .event-actions {
        display: flex;
        gap: 12px;
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

// 分页
.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 40px 0;

  :deep(.el-pagination) {
    --el-pagination-bg-color: rgba(255, 255, 255, 0.1);
    --el-pagination-text-color: rgba(255, 255, 255, 0.8);
    --el-pagination-border-radius: 8px;
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .page-header {
    flex-direction: column;
    gap: 24px;
    align-items: stretch;
  }

  .vertical-timeline {
    &::before {
      left: 30px;
    }

    .timeline-item {
      &.timeline-item-left,
      &.timeline-item-right {
        flex-direction: row;
        
        .timeline-card {
          margin-left: 80px;
          margin-right: 0;
          max-width: none;
        }
      }

      .timeline-dot {
        left: 30px;
      }
    }
  }
}

@media (max-width: 768px) {
  .page-header .controls {
    flex-direction: column;
    gap: 16px;
  }

  .horizontal-timeline .timeline-slider .timeline-track {
    margin: 0 10px;
  }

  .timeline-item .timeline-card {
    padding: 20px;
  }
}
</style> 