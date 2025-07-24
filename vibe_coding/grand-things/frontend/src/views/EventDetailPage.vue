<template>
  <div class="event-detail-page">
    <!-- 页面头部 -->
    <div class="page-header fade-in-up" v-if="event">
      <div class="header-actions">
        <el-button @click="$router.back()" circle>
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <div class="action-buttons">
          <el-button @click="editEvent">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button type="danger" @click="deleteEvent">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </div>
      </div>
      
      <div class="event-header">
        <div class="event-meta">
          <span class="event-date">{{ formatDate(event.event_date) }}</span>
          <span class="event-category" :style="{ color: getCategoryColor(event.category) }">
            {{ event.category }}
          </span>
        </div>
        <h1 class="event-title">{{ event.title }}</h1>
        <div class="event-rating">
          <span class="rating-label">重要程度：</span>
          <el-rate 
            :model-value="event.impact_score / 2" 
            disabled 
            show-score
            size="large"
          />
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton animated>
        <template #template>
          <el-skeleton-item variant="h1" style="width: 60%" />
          <el-skeleton-item variant="text" style="width: 40%" />
          <el-skeleton-item variant="text" style="width: 100%" />
          <el-skeleton-item variant="text" style="width: 80%" />
        </template>
      </el-skeleton>
    </div>

    <!-- 事件内容 -->
    <div v-else-if="event" class="event-content">
      <!-- 主要信息 -->
      <div class="main-content">
        <div class="content-card fade-in-up">
          <h2>事件描述</h2>
          <div class="event-description">
            {{ event.description || '暂无描述' }}
          </div>
          
          <div class="event-tags" v-if="eventTags.length > 0">
            <h3>相关标签</h3>
            <div class="tags-list">
              <span 
                v-for="tag in eventTags" 
                :key="tag"
                class="tag"
                :class="`tag-${getCategoryByTag(tag)}`"
                @click="searchByTag(tag)"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>

        <!-- 反馈区域 -->
        <div class="feedback-card fade-in-up">
          <div class="feedback-header">
            <h2>事件反馈</h2>
            <el-button 
              v-if="!showFeedbackForm" 
              type="primary" 
              @click="showFeedbackForm = true"
            >
              <el-icon><Plus /></el-icon>
              添加反馈
            </el-button>
          </div>

          <!-- 反馈表单 -->
          <div v-if="showFeedbackForm" class="feedback-form">
            <el-form :model="feedbackForm" label-width="80px">
              <el-form-item label="反馈内容">
                <el-input
                  v-model="feedbackForm.content"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入对这个事件的后续观察、结果分析或相关思考..."
                  maxlength="500"
                  show-word-limit
                />
              </el-form-item>
              
              <el-form-item label="影响评估">
                <el-rate 
                  v-model="feedbackForm.impactUpdate" 
                  show-text
                  :texts="['无影响', '较小', '一般', '较大', '重大']"
                />
                <span class="impact-note">重新评估此事件的重要性</span>
              </el-form-item>

              <el-form-item>
                <div class="form-actions">
                  <el-button @click="cancelFeedback">取消</el-button>
                  <el-button type="primary" :loading="submittingFeedback" @click="submitFeedback">
                    保存反馈
                  </el-button>
                </div>
              </el-form-item>
            </el-form>
          </div>

          <!-- 已有反馈 -->
          <div v-if="event.feedback && !showFeedbackForm" class="existing-feedback">
            <div class="feedback-content">
              <el-icon class="feedback-icon"><ChatDotRound /></el-icon>
              <div class="feedback-text">{{ event.feedback }}</div>
            </div>
            <div class="feedback-meta">
              <span v-if="event.is_reviewed" class="reviewed-badge">
                <el-icon><Select /></el-icon>
                已评估
              </span>
              <el-button size="small" text @click="showFeedbackForm = true">
                更新反馈
              </el-button>
            </div>
          </div>

          <!-- 无反馈状态 -->
          <div v-if="!event.feedback && !showFeedbackForm" class="no-feedback">
            <div class="no-feedback-content">
              <el-icon size="48" color="#d1d5db"><ChatDotRound /></el-icon>
              <p>还没有添加反馈</p>
              <span>记录这个事件的后续影响和结果</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 侧边信息 -->
      <div class="sidebar">
        <!-- 基本信息 -->
        <div class="info-card slide-in-left">
          <h3>基本信息</h3>
          <div class="info-list">
            <div class="info-item">
              <label>创建时间</label>
              <span>{{ formatDate(event.created_at) }}</span>
            </div>
            <div class="info-item">
              <label>事件时间</label>
              <span>{{ formatDate(event.event_date) }}</span>
            </div>
            <div class="info-item">
              <label>事件分类</label>
              <span :style="{ color: getCategoryColor(event.category) }">
                {{ event.category }}
              </span>
            </div>
            <div class="info-item">
              <label>重要程度</label>
              <el-rate 
                :model-value="event.impact_score / 2" 
                disabled 
                size="small"
              />
            </div>
            <div class="info-item">
              <label>反馈状态</label>
              <el-tag :type="event.is_reviewed ? 'success' : 'info'">
                {{ event.is_reviewed ? '已评估' : '未评估' }}
              </el-tag>
            </div>
          </div>
        </div>

        <!-- 相关操作 -->
        <div class="actions-card slide-in-left">
          <h3>相关操作</h3>
          <div class="action-list">
            <el-button class="action-btn" @click="shareEvent">
              <el-icon><Share /></el-icon>
              分享事件
            </el-button>
            <el-button class="action-btn" @click="exportEvent">
              <el-icon><Download /></el-icon>
              导出数据
            </el-button>
            <el-button class="action-btn" @click="duplicateEvent">
              <el-icon><DocumentCopy /></el-icon>
              复制事件
            </el-button>
            <el-button class="action-btn" @click="findSimilar">
              <el-icon><Search /></el-icon>
              查找相似
            </el-button>
          </div>
        </div>

        <!-- 统计信息 -->
        <div class="stats-card slide-in-left">
          <h3>统计信息</h3>
          <div class="stats-list">
            <div class="stat-item">
              <span class="stat-label">同类事件</span>
              <span class="stat-value">{{ similarEventsCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">相关标签</span>
              <span class="stat-value">{{ eventTags.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">查看次数</span>
              <span class="stat-value">{{ viewCount }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <div class="error-content">
        <el-icon size="64" color="#f87171"><WarningFilled /></el-icon>
        <h2>加载失败</h2>
        <p>{{ error }}</p>
        <el-button type="primary" @click="loadEvent">重新加载</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  ArrowLeft, Edit, Delete, Plus, ChatDotRound, 
  Select, Share, Download, DocumentCopy, Search, WarningFilled
} from '@element-plus/icons-vue'
import { eventAPI } from '@/api/events'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(true)
const error = ref('')
const event = ref(null)
const showFeedbackForm = ref(false)
const submittingFeedback = ref(false)

// 反馈表单
const feedbackForm = ref({
  content: '',
  impactUpdate: 3
})

// 模拟数据
const similarEventsCount = ref(8)
const viewCount = ref(23)

// 计算属性
const eventTags = computed(() => {
  if (!event.value?.tags) return []
  return event.value.tags.split(',').filter(Boolean)
})

// 页面初始化
onMounted(() => {
  loadEvent()
})

// 加载事件详情
async function loadEvent() {
  loading.value = true
  error.value = ''
  
  try {
    const eventId = route.params.id
    const eventData = await eventAPI.getEvent(eventId)
    event.value = eventData
    
    // 如果有反馈，填充到表单中
    if (eventData.feedback) {
      feedbackForm.value.content = eventData.feedback
      feedbackForm.value.impactUpdate = Math.ceil(eventData.impact_score / 2)
    }
  } catch (err) {
    console.error('加载事件详情失败:', err)
    error.value = '无法加载事件详情，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 编辑事件
function editEvent() {
  // 跳转到编辑页面
  router.push(`/event/edit/${event.value.id}`)
}

// 删除事件
async function deleteEvent() {
  try {
    await ElMessageBox.confirm(
      `确定要删除事件"${event.value.title}"吗？此操作无法撤销。`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    await eventAPI.deleteEvent(event.value.id)
    ElMessage.success('删除成功')
    router.push('/timeline')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除事件失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 提交反馈
async function submitFeedback() {
  if (!feedbackForm.value.content.trim()) {
    ElMessage.warning('请输入反馈内容')
    return
  }

  submittingFeedback.value = true
  
  try {
    const updateData = {
      feedback: feedbackForm.value.content,
      impact_score: feedbackForm.value.impactUpdate * 2,
      is_reviewed: true
    }
    
    const updatedEvent = await eventAPI.updateEvent(event.value.id, updateData)
    event.value = updatedEvent
    showFeedbackForm.value = false
    
    ElMessage.success('反馈保存成功')
  } catch (error) {
    console.error('保存反馈失败:', error)
    ElMessage.error('保存反馈失败，请重试')
  } finally {
    submittingFeedback.value = false
  }
}

// 取消反馈
function cancelFeedback() {
  showFeedbackForm.value = false
  // 恢复原始内容
  if (event.value.feedback) {
    feedbackForm.value.content = event.value.feedback
    feedbackForm.value.impactUpdate = Math.ceil(event.value.impact_score / 2)
  } else {
    feedbackForm.value.content = ''
    feedbackForm.value.impactUpdate = 3
  }
}

// 按标签搜索
function searchByTag(tag) {
  router.push({
    path: '/search',
    query: { tags: tag }
  })
}

// 分享事件
function shareEvent() {
  const shareText = `${event.value.title} - ${event.value.description || ''}`
  if (navigator.share) {
    navigator.share({
      title: event.value.title,
      text: shareText,
      url: window.location.href
    })
  } else {
    // 复制到剪贴板
    navigator.clipboard.writeText(shareText)
    ElMessage.success('事件内容已复制到剪贴板')
  }
}

// 导出事件
function exportEvent() {
  const exportData = {
    title: event.value.title,
    description: event.value.description,
    category: event.value.category,
    tags: event.value.tags,
    event_date: event.value.event_date,
    impact_score: event.value.impact_score,
    feedback: event.value.feedback
  }
  
  const dataStr = JSON.stringify(exportData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `event_${event.value.id}.json`
  link.click()
  
  ElMessage.success('事件数据导出成功')
}

// 复制事件
function duplicateEvent() {
  // 创建副本数据并跳转到添加页面
  const duplicateData = {
        title: event.value.title + ' (副本)',
        description: event.value.description,
        category: event.value.category,
    tags: event.value.tags,
    event_date: dayjs().format('YYYY-MM-DDTHH:mm:ss') // 使用当前时间
    }
  
  // 可以通过sessionStorage传递数据避免URL过长
  sessionStorage.setItem('duplicateEventData', JSON.stringify(duplicateData))
  router.push('/event/add')
}

// 查找相似事件
function findSimilar() {
  router.push({
    path: '/search',
    query: { 
      category: event.value.category,
      tags: eventTags.value.slice(0, 3).join(',')
    }
  })
}

// 工具函数
function formatDate(dateString) {
  return dayjs(dateString).format('YYYY年MM月DD日 HH:mm')
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
</script>

<style lang="scss" scoped>
.event-detail-page {
  min-height: 100vh;
}

// 页面头部
.page-header {
  margin-bottom: 40px;
  
  .header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .action-buttons {
      display: flex;
      gap: 12px;
    }
  }
  
  .event-header {
    text-align: center;
    
    .event-meta {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-bottom: 16px;
      
      .event-date {
        color: rgba(255, 255, 255, 0.8);
        font-size: 16px;
      }
      
      .event-category {
        font-weight: 600;
        font-size: 16px;
      }
    }
    
    .event-title {
      font-size: 36px;
      font-weight: 800;
      color: white;
      margin-bottom: 20px;
      line-height: 1.3;
    }
    
    .event-rating {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      
      .rating-label {
        color: rgba(255, 255, 255, 0.8);
        font-weight: 500;
      }
    }
  }
}

// 加载状态
.loading-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

// 事件内容
.event-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 40px;
  max-width: 1400px;
  margin: 0 auto;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

// 内容卡片
.content-card {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 32px;
  
  h2 {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 20px;
  }
  
  .event-description {
    color: var(--text-secondary);
    line-height: 1.8;
    font-size: 16px;
    margin-bottom: 24px;
  }
  
  .event-tags {
    h3 {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 16px;
    }
    
    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      
      .tag {
        cursor: pointer;
        transition: all 0.2s ease;
        
        &:hover {
          transform: scale(1.05);
        }
      }
    }
  }
}

// 反馈卡片
.feedback-card {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 32px;
  
  .feedback-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    
    h2 {
      font-size: 24px;
      font-weight: 600;
      color: var(--text-primary);
    }
  }
  
  .feedback-form {
    .impact-note {
      font-size: 13px;
      color: var(--text-light);
      margin-left: 12px;
    }
    
    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }
  }
  
  .existing-feedback {
    .feedback-content {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      padding: 20px;
      background: var(--bg-secondary);
      border-radius: 12px;
      
      .feedback-icon {
        color: var(--primary-color);
        font-size: 20px;
        flex-shrink: 0;
        margin-top: 2px;
      }
      
      .feedback-text {
        color: var(--text-primary);
        line-height: 1.6;
      }
    }
    
    .feedback-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .reviewed-badge {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--success-color);
        font-size: 14px;
        font-weight: 500;
      }
    }
  }
  
  .no-feedback {
    text-align: center;
    padding: 40px 20px;
    
    .no-feedback-content {
      p {
        font-size: 18px;
        color: var(--text-secondary);
        margin: 16px 0 8px;
      }
      
      span {
        color: var(--text-light);
        font-size: 14px;
      }
    }
  }
}

// 侧边栏
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
  
  .info-card, .actions-card, .stats-card {
    background: var(--bg-primary);
    border-radius: 16px;
    padding: 24px;
    
    h3 {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 16px;
    }
  }
}

// 信息列表
.info-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    label {
      color: var(--text-secondary);
      font-size: 14px;
    }
    
    span {
      color: var(--text-primary);
      font-weight: 500;
    }
  }
}

// 操作列表
.action-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  .action-btn {
    width: 100%;
    justify-content: flex-start;
    
    .el-icon {
      margin-right: 8px;
    }
  }
}

// 统计列表
.stats-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid var(--border-color);
    
    &:last-child {
      border-bottom: none;
    }
    
    .stat-label {
      color: var(--text-secondary);
      font-size: 14px;
    }
    
    .stat-value {
      color: var(--primary-color);
      font-weight: 600;
    }
  }
}

// 错误状态
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  
  .error-content {
    text-align: center;
    padding: 40px;
    
    h2 {
      font-size: 24px;
      color: white;
      margin: 20px 0 12px;
    }
    
    p {
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 24px;
    }
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .event-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .sidebar {
    order: -1;
    
    .info-card, .actions-card, .stats-card {
      padding: 20px;
    }
  }
}

@media (max-width: 768px) {
  .page-header {
    .header-actions {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;
    }
    
    .event-header {
      .event-title {
        font-size: 28px;
      }
      
      .event-meta {
        flex-direction: column;
        gap: 8px;
      }
    }
  }
  
  .content-card, .feedback-card {
    padding: 20px;
  }
  
  .feedback-card .feedback-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
}
</style> 