<template>
  <div class="add-event-page">
    <!-- 页面头部 -->
    <div class="page-header fade-in-up">
      <h1 class="page-title">
        <el-icon><Plus v-if="!isEditMode" /><Edit v-else /></el-icon>
        {{ isEditMode ? '编辑事件' : '添加新事件' }}
      </h1>
      <p class="page-subtitle">{{ isEditMode ? '修改事件信息，让记录更加准确' : '记录重要时刻，让每一个瞬间都值得珍藏' }}</p>
    </div>

    <!-- 添加表单 -->
    <div class="form-container">
      <div class="form-content">
        <!-- 主要表单 -->
        <div class="main-form card fade-in-up">
          <h2 class="form-title">{{ isEditMode ? '修改事件信息' : '事件信息' }}</h2>
          
          <el-form 
            ref="eventFormRef" 
            :model="eventForm" 
            :rules="formRules"
            label-width="100px"
            size="large"
          >
            <el-form-item label="事件标题" prop="title">
              <el-input
                v-model="eventForm.title"
                placeholder="请输入事件标题，例如：京东投资了具身智能公司某某某"
                maxlength="200"
                show-word-limit
                @input="onContentChange"
              />
            </el-form-item>

            <el-form-item label="事件描述" prop="description">
              <el-input
                v-model="eventForm.description"
                type="textarea"
                placeholder="详细描述事件内容，系统将自动提取相关标签和分类..."
                :rows="4"
                maxlength="1000"
                show-word-limit
                @input="onContentChange"
              />
            </el-form-item>

            <el-form-item label="事件时间" prop="event_date">
              <el-date-picker
                v-model="eventForm.event_date"
                type="datetime"
                placeholder="选择事件发生时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DDTHH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item label="手动标签">
              <el-input
                v-model="eventForm.tags"
                placeholder="输入标签，用逗号分隔（可选）"
                @input="onTagsChange"
              />
              <div class="form-tip">
                <el-icon><InfoFilled /></el-icon>
                系统会自动提取标签，您也可以手动添加额外标签
              </div>
            </el-form-item>

            <el-form-item label="事件分类">
              <el-select 
                v-model="eventForm.category" 
                placeholder="选择或让系统自动推断"
                clearable
                style="width: 100%"
              >
                <el-option 
                  v-for="category in categoryOptions" 
                  :key="category" 
                  :label="category" 
                  :value="category"
                />
              </el-select>
            </el-form-item>

            <div class="form-actions">
              <el-button size="large" @click="isEditMode ? $router.back() : resetForm">
                {{ isEditMode ? '取消' : '重置' }}
              </el-button>
              <el-button 
                type="primary" 
                size="large" 
                :loading="submitting"
                @click="submitEvent"
              >
                <el-icon><Check /></el-icon>
                {{ isEditMode ? '保存修改' : '添加事件' }}
              </el-button>
            </div>
          </el-form>
        </div>

        <!-- 智能预览 -->
        <div class="preview-panel card slide-in-left">
          <h2 class="form-title">智能预览</h2>
          
          <!-- 自动提取的标签 -->
          <div class="preview-section">
            <h3>自动提取的标签</h3>
            <div class="tags-preview" v-loading="extracting">
              <span 
                v-for="tag in extractedTags" 
                :key="tag"
                class="tag"
                :class="`tag-${getCategoryByTag(tag)}`"
              >
                {{ tag }}
              </span>
              <div v-if="extractedTags.length === 0 && !extracting" class="no-tags">
                <el-icon><MagicStick /></el-icon>
                输入内容后将自动提取标签
              </div>
            </div>
          </div>

          <!-- 推荐分类 -->
          <div class="preview-section">
            <h3>推荐分类</h3>
            <div class="category-preview">
              <el-tag 
                v-if="suggestedCategory" 
                :type="getCategoryTagType(suggestedCategory)"
                effect="dark"
                size="large"
              >
                {{ suggestedCategory }}
              </el-tag>
              <div v-else class="no-category">
                <el-icon><FolderOpened /></el-icon>
                输入内容后将推荐分类
              </div>
            </div>
          </div>

          <!-- 重要性评估 -->
          <div class="preview-section">
            <h3>重要性评估</h3>
            <div class="impact-preview">
              <el-rate
                :model-value="estimatedImpact / 2"
                disabled
                size="large"
                show-text
                :texts="['很低', '较低', '一般', '较高', '很高']"
              />
              <div class="impact-description">
                基于内容关键词自动评估
              </div>
            </div>
          </div>

          <!-- 预览卡片 -->
          <div class="preview-section">
            <h3>事件卡片预览</h3>
            <div class="event-preview-card">
              <div class="card-header">
                <h4>{{ eventForm.title || '事件标题' }}</h4>
                <span class="card-date">
                  {{ formatPreviewDate(eventForm.event_date) }}
                </span>
              </div>
              <p class="card-description">
                {{ eventForm.description || '事件描述...' }}
              </p>
              <div class="card-tags">
                <span 
                  v-for="tag in allTags.slice(0, 4)" 
                  :key="tag"
                  class="tag tag-small"
                  :class="`tag-${getCategoryByTag(tag)}`"
                >
                  {{ tag }}
                </span>
              </div>
              <div class="card-footer">
                <span class="card-category">
                  {{ eventForm.category || suggestedCategory || '未分类' }}
                </span>
                <el-rate 
                  :model-value="estimatedImpact / 2" 
                  disabled 
                  size="small"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Plus, Check, InfoFilled, MagicStick, 
  FolderOpened, Edit
} from '@element-plus/icons-vue'
import { eventAPI } from '@/api/events'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()

// 编辑模式相关
const isEditMode = computed(() => route.name === 'EditEvent')
const eventId = computed(() => route.params.id)

// 响应式数据
const eventFormRef = ref(null)
const submitting = ref(false)
const extracting = ref(false)
const extractedTags = ref([])
const suggestedCategory = ref('')
const estimatedImpact = ref(5)

// 表单数据
const eventForm = ref({
  title: '',
  description: '',
  event_date: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
  tags: '',
  category: ''
})

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入事件标题', trigger: 'blur' },
    { min: 2, max: 200, message: '标题长度在 2 到 200 个字符', trigger: 'blur' }
  ],
  description: [
    { max: 1000, message: '描述不能超过 1000 个字符', trigger: 'blur' }
  ]
}

// 分类选项
const categoryOptions = [
  '金融', '科技', '创业', '互联网', '医疗', 
  '教育', '房产', '汽车', '娱乐', '体育', 
  '政策', '国际', '其他'
]

// 计算属性
const allTags = computed(() => {
  const userTags = eventForm.value.tags ? 
    eventForm.value.tags.split(',').map(t => t.trim()).filter(Boolean) : []
  return [...new Set([...extractedTags.value, ...userTags])]
})

// 组件挂载
onMounted(async () => {
  if (isEditMode.value && eventId.value) {
    await loadEventForEdit(eventId.value)
  } else {
    // 检查是否有复制的事件数据
    const duplicateData = sessionStorage.getItem('duplicateEventData')
    if (duplicateData) {
      try {
        const data = JSON.parse(duplicateData)
        eventForm.value = {
          title: data.title || '',
          description: data.description || '',
          event_date: data.event_date || dayjs().format('YYYY-MM-DDTHH:mm:ss'),
          tags: data.tags || '',
          category: data.category || ''
        }
        
        // 清除sessionStorage中的数据
        sessionStorage.removeItem('duplicateEventData')
        
        // 触发标签提取
        await extractTagsAndCategory()
        
        ElMessage.success('已为您复制事件数据')
      } catch (error) {
        console.error('解析复制数据失败:', error)
        sessionStorage.removeItem('duplicateEventData')
      }
    }
  }
})

// 加载编辑事件数据
async function loadEventForEdit(id) {
  try {
    submitting.value = true
    const eventData = await eventAPI.getEvent(id)
    
    // 填充表单数据
    eventForm.value = {
      title: eventData.title || '',
      description: eventData.description || '',
      event_date: eventData.event_date || dayjs().format('YYYY-MM-DDTHH:mm:ss'),
      tags: eventData.tags || '',
      category: eventData.category || ''
    }
    
    // 触发标签提取（用于预览）
    await extractTagsAndCategory()
    
    ElMessage.success('事件数据加载成功')
  } catch (error) {
    console.error('加载事件数据失败:', error)
    ElMessage.error('加载事件数据失败，请重试')
    router.push('/timeline')
  } finally {
    submitting.value = false
  }
}

// 监听内容变化
let extractTimer = null
function onContentChange() {
  if (extractTimer) {
    clearTimeout(extractTimer)
  }
  
  extractTimer = setTimeout(() => {
    extractTagsAndCategory()
  }, 500) // 防抖500ms
}

// 标签输入变化
function onTagsChange() {
  // 实时更新预览
}

// 模拟标签提取（实际应该调用后端API）
async function extractTagsAndCategory() {
  const content = `${eventForm.value.title} ${eventForm.value.description}`.trim()
  if (!content) {
    extractedTags.value = []
    suggestedCategory.value = ''
    estimatedImpact.value = 5
    return
  }

  extracting.value = true
  
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // 简单的关键词匹配逻辑（实际应该调用后端智能提取API）
  const mockExtraction = simulateTagExtraction(content)
  extractedTags.value = mockExtraction.tags
  suggestedCategory.value = mockExtraction.category
  estimatedImpact.value = mockExtraction.impact
  
  extracting.value = false
}

// 模拟标签提取逻辑
function simulateTagExtraction(content) {
  const keywords = {
    '金融': ['投资', '股票', '融资', '上市', '金融', '银行', '基金', '并购'],
    '科技': ['AI', '人工智能', '科技', '算法', '芯片', '5G', '云计算'],
    '创业': ['创业', '初创', '孵化', 'A轮', 'B轮', 'C轮', '估值'],
    '互联网': ['互联网', '电商', '平台', 'APP', '社交', '直播'],
    '医疗': ['医疗', '医药', '健康', '疫苗', '临床', '治疗']
  }
  
  const tags = []
  let category = '其他'
  let impact = 5
  
  // 关键词匹配
  Object.entries(keywords).forEach(([cat, words]) => {
    words.forEach(word => {
      if (content.includes(word)) {
        tags.push(word)
        category = cat
      }
    })
  })
  
  // 公司名称提取
  const companyMatch = content.match(/[\u4e00-\u9fa5]+(?:公司|科技|集团)/g)
  if (companyMatch) {
    tags.push(...companyMatch.slice(0, 2))
  }
  
  // 金额提取
  const amountMatch = content.match(/\d+(?:\.\d+)?(?:亿|万)/g)
  if (amountMatch) {
    tags.push(...amountMatch.slice(0, 2))
    impact = Math.min(10, impact + 2)
  }
  
  // 重要性关键词
  if (content.includes('重大') || content.includes('历史性') || content.includes('首次')) {
    impact = Math.min(10, impact + 3)
  }
  
  return {
    tags: [...new Set(tags)].slice(0, 6),
    category,
    impact
  }
}

// 提交事件
async function submitEvent() {
  if (!eventFormRef.value) return
  
  try {
    await eventFormRef.value.validate()
    
    submitting.value = true
    
    const eventData = {
      ...eventForm.value,
      tags: allTags.value.join(',')
    }
    
    if (isEditMode.value) {
      // 编辑模式：更新事件
      await eventAPI.updateEvent(eventId.value, eventData)
      ElMessage.success('事件修改成功！')
    } else {
      // 添加模式：创建事件
    await eventAPI.createEvent(eventData)
      ElMessage.success('事件添加成功！')
    }
    
    router.push('/timeline')
  } catch (error) {
    console.error('提交事件失败:', error)
    if (typeof error === 'string') {
      ElMessage.error(error)
    } else {
      const action = isEditMode.value ? '修改' : '添加'
      ElMessage.error(`${action}事件失败，请重试`)
    }
  } finally {
    submitting.value = false
  }
}

// 重置表单
function resetForm() {
  if (eventFormRef.value) {
    eventFormRef.value.resetFields()
  }
  extractedTags.value = []
  suggestedCategory.value = ''
  estimatedImpact.value = 5
  eventForm.value.event_date = dayjs().format('YYYY-MM-DDTHH:mm:ss')
}

// 工具函数
function formatPreviewDate(dateString) {
  if (!dateString) return '现在'
  return dayjs(dateString).format('MM月DD日 HH:mm')
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

function getCategoryTagType(category) {
  const typeMap = {
    '金融': 'warning',
    '科技': 'primary', 
    '创业': 'success',
    '互联网': 'info',
    '医疗': 'success',
    '教育': 'primary'
  }
  return typeMap[category] || ''
}
</script>

<style lang="scss" scoped>
.add-event-page {
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

// 表单容器
.form-container {
  max-width: 1200px;
  margin: 0 auto;

  .form-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 40px;
    align-items: flex-start;
  }
}

// 主要表单
.main-form {
  .form-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .form-tip {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--text-light);
    font-size: 13px;
    margin-top: 6px;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid var(--border-color);
  }

  // Element Plus 表单样式覆盖
  :deep(.el-form-item__label) {
    font-weight: 600;
    color: var(--text-primary);
  }

  :deep(.el-input__wrapper) {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  :deep(.el-textarea__inner) {
    border-radius: 8px;
    resize: vertical;
  }
}

// 预览面板
.preview-panel {
  position: sticky;
  top: 20px;

  .form-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .preview-section {
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border-color);

    &:last-child {
      border-bottom: none;
    }

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 12px;
    }
  }

  .tags-preview {
    min-height: 40px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;

    .no-tags {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-light);
      font-size: 14px;
    }
  }

  .category-preview {
    .no-category {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-light);
      font-size: 14px;
    }
  }

  .impact-preview {
    .impact-description {
      font-size: 13px;
      color: var(--text-light);
      margin-top: 8px;
    }
  }

  .event-preview-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 20px;
    transition: all 0.3s ease;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;

      h4 {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
        flex: 1;
        margin-right: 12px;
      }

      .card-date {
        font-size: 13px;
        color: var(--text-light);
        flex-shrink: 0;
      }
    }

    .card-description {
      color: var(--text-secondary);
      font-size: 14px;
      line-height: 1.5;
      margin-bottom: 12px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-tags {
      margin-bottom: 16px;
      display: flex;
      flex-wrap: wrap;
      gap: 4px;

      .tag-small {
        font-size: 11px;
        padding: 2px 8px;
      }
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .card-category {
        font-size: 13px;
        font-weight: 500;
        color: var(--primary-color);
      }
    }
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .form-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .preview-panel {
    position: relative;
    order: -1;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 20px 0;

    .page-title {
      font-size: 28px;
    }
  }

  .form-container {
    padding: 0 16px;
  }

  .main-form,
  .preview-panel {
    padding: 20px;
  }

  .form-actions {
    flex-direction: column-reverse;
    gap: 12px;

    .el-button {
      width: 100%;
    }
  }
}

// Element Plus 样式覆盖
:deep(.el-loading-mask) {
  border-radius: 8px;
}

:deep(.el-rate) {
  display: flex;
  align-items: center;
}
</style> 