<template>
  <div class="search-page">
    <!-- 搜索头部 -->
    <div class="search-header fade-in-up">
      <h1 class="page-title">
        <el-icon><Search /></el-icon>
        智能搜索
      </h1>
      <p class="page-subtitle">快速找到你想要的事件记录</p>
    </div>

    <!-- 搜索表单 -->
    <div class="search-form-container card slide-in-left">
      <el-form :model="searchForm" class="search-form" size="large">
        <div class="form-row">
          <el-form-item label="关键词搜索" class="keyword-item">
            <el-input
              v-model="searchForm.query"
              placeholder="输入关键词，搜索标题和描述..."
              clearable
              @input="onSearchInput"
              @keyup.enter="performSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item class="search-btn-item">
            <el-button 
              type="primary" 
              :loading="searching"
              @click="performSearch"
            >
              搜索
            </el-button>
          </el-form-item>
        </div>

        <div class="form-row">
          <el-form-item label="事件分类">
            <el-select 
              v-model="searchForm.category" 
              placeholder="选择分类"
              clearable
              @change="onFilterChange"
            >
              <el-option 
                v-for="category in categories" 
                :key="category.category"
                :label="`${category.category} (${category.count})`"
                :value="category.category"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="标签筛选">
            <el-select
              v-model="searchForm.tags"
              placeholder="选择标签"
              multiple
              collapse-tags
              collapse-tags-tooltip
              clearable
              @change="onFilterChange"
            >
              <el-option
                v-for="tag in popularTags"
                :key="tag.name"
                :label="`${tag.name} (${tag.count})`"
                :value="tag.name"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="时间范围">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="onFilterChange"
            />
          </el-form-item>
        </div>
      </el-form>

      <!-- 快捷筛选 -->
      <div class="quick-filters">
        <span class="filter-label">快捷筛选：</span>
        <div class="filter-tags">
          <el-tag 
            v-for="filter in quickFilters"
            :key="filter.key"
            :type="isActiveFilter(filter) ? 'primary' : ''"
            effect="plain"
            class="filter-tag"
            @click="applyQuickFilter(filter)"
          >
            {{ filter.label }}
          </el-tag>
        </div>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div class="search-results fade-in-up">
      <!-- 结果统计 -->
      <div v-if="hasSearched" class="results-header">
        <div class="results-info">
          <span class="results-count">
            找到 <strong>{{ totalResults }}</strong> 个相关事件
          </span>
          <span v-if="searchForm.query" class="search-keyword">
            关键词: "{{ searchForm.query }}"
          </span>
        </div>
        
        <div class="sort-controls">
          <el-select v-model="sortBy" @change="onSortChange" style="width: 150px">
            <el-option label="时间倒序" value="date_desc" />
            <el-option label="时间正序" value="date_asc" />
            <el-option label="重要性" value="impact" />
            <el-option label="相关性" value="relevance" />
          </el-select>
        </div>
      </div>

      <!-- 事件列表 -->
      <div class="events-list" v-loading="searching">
        <div 
          v-for="event in searchResults" 
          :key="event.id"
          class="event-item"
          @click="viewEventDetail(event.id)"
        >
          <div class="event-header">
            <h3 class="event-title" v-html="highlightKeyword(event.title)"></h3>
            <div class="event-meta">
              <span class="event-date">{{ formatDate(event.event_date) }}</span>
              <span class="event-category" :style="{ color: getCategoryColor(event.category) }">
                {{ event.category }}
              </span>
            </div>
          </div>
          
          <p class="event-description" v-html="highlightKeyword(event.description)"></p>
          
          <div class="event-tags">
            <span 
              v-for="tag in parseEventTags(event.tags)" 
              :key="tag"
              class="tag"
              :class="`tag-${getCategoryByTag(tag)}`"
              @click.stop="searchByTag(tag)"
            >
              {{ tag }}
            </span>
          </div>
          
          <div class="event-footer">
            <div class="event-impact">
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

        <!-- 空状态 -->
        <div v-if="!searching && hasSearched && searchResults.length === 0" class="empty-results">
          <el-icon size="64" color="rgba(255,255,255,0.4)">
            <DocumentDelete />
          </el-icon>
          <h3>没有找到相关事件</h3>
          <p>尝试调整搜索条件或使用不同的关键词</p>
          <el-button @click="clearSearch">清空筛选</el-button>
        </div>

        <!-- 未搜索状态 -->
        <div v-if="!hasSearched" class="search-suggestions">
          <h3>搜索建议</h3>
          <div class="suggestion-grid">
            <div 
              v-for="suggestion in searchSuggestions" 
              :key="suggestion.title"
              class="suggestion-item"
              @click="applySuggestion(suggestion)"
            >
              <div class="suggestion-icon">
                <el-icon>
                  <component :is="suggestion.icon" />
                </el-icon>
              </div>
              <div class="suggestion-content">
                <h4>{{ suggestion.title }}</h4>
                <p>{{ suggestion.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="searchResults.length > 0" class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="totalResults"
          layout="prev, pager, next, jumper, total"
          @current-change="onPageChange"
          background
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, DocumentDelete, TrendCharts, 
  Calendar, Trophy, Clock, CollectionTag, 
  Star, Coin, Cpu 
} from '@element-plus/icons-vue'
import { eventAPI } from '@/api/events'
import dayjs from 'dayjs'

const router = useRouter()

// 响应式数据
const searching = ref(false)
const hasSearched = ref(false)
const searchResults = ref([])
const categories = ref([])
const popularTags = ref([])
const totalResults = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const sortBy = ref('date_desc')

// 搜索表单
const searchForm = ref({
  query: '',
  category: '',
  tags: [],
  dateRange: null
})

// 快捷筛选
const quickFilters = [
  { key: 'thisWeek', label: '本周', type: 'date', value: 'thisWeek' },
  { key: 'thisMonth', label: '本月', type: 'date', value: 'thisMonth' },
  { key: 'highImpact', label: '重要事件', type: 'impact', value: 'high' },
  { key: 'finance', label: '金融', type: 'category', value: '金融' },
  { key: 'tech', label: '科技', type: 'category', value: '科技' },
  { key: 'startup', label: '创业', type: 'category', value: '创业' }
]

// 搜索建议
const searchSuggestions = [
  {
    title: '按分类浏览',
    description: '探索不同分类的事件',
    icon: TrendCharts,
    action: 'category'
  },
  {
    title: '最近事件',
    description: '查看最新添加的事件',
    icon: Clock,
    action: 'recent'
  },
  {
    title: '重要事件',
    description: '查看高影响力的事件',
    icon: Trophy,
    action: 'important'
  },
  {
    title: '热门标签',
    description: '基于标签发现相关事件',
    icon: CollectionTag,
    action: 'tags'
  }
]

// 搜索防抖定时器
let searchTimer = null

// 页面初始化
onMounted(async () => {
  await loadCategories()
  await loadPopularTags()
})

// 加载分类数据
async function loadCategories() {
  try {
    categories.value = await eventAPI.getCategoriesStats()
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

// 加载热门标签
async function loadPopularTags() {
  // 模拟热门标签数据
  popularTags.value = [
    { name: '投资', count: 15 },
    { name: '人工智能', count: 12 },
    { name: '创业', count: 10 },
    { name: '互联网', count: 8 },
    { name: '金融', count: 18 },
    { name: '科技', count: 20 },
    { name: '教育', count: 6 },
    { name: '医疗', count: 5 }
  ]
}

// 搜索输入事件
function onSearchInput() {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(performSearch, 300)
}

// 执行搜索
async function performSearch() {
  searching.value = true
  hasSearched.value = true
  currentPage.value = 1
  
  try {
    const params = {
      query: searchForm.value.query,
      category: searchForm.value.category,
      tags: searchForm.value.tags,
      start_date: searchForm.value.dateRange?.[0],
      end_date: searchForm.value.dateRange?.[1]
    }
    
    const results = await eventAPI.searchEvents(params)
    searchResults.value = sortResults(results)
    totalResults.value = results.length
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败，请重试')
  } finally {
    searching.value = false
  }
}

// 筛选条件变化
function onFilterChange() {
  if (hasSearched.value) {
    performSearch()
  }
}

// 排序变化
function onSortChange() {
  searchResults.value = sortResults(searchResults.value)
}

// 结果排序
function sortResults(results) {
  const sorted = [...results]
  
  switch (sortBy.value) {
    case 'date_desc':
      return sorted.sort((a, b) => dayjs(b.event_date).unix() - dayjs(a.event_date).unix())
    case 'date_asc':
      return sorted.sort((a, b) => dayjs(a.event_date).unix() - dayjs(b.event_date).unix())
    case 'impact':
      return sorted.sort((a, b) => b.impact_score - a.impact_score)
    case 'relevance':
      // 按相关性排序（简单实现）
      const query = searchForm.value.query.toLowerCase()
      return sorted.sort((a, b) => {
        const scoreA = (a.title.toLowerCase().includes(query) ? 2 : 0) +
                      (a.description?.toLowerCase().includes(query) ? 1 : 0)
        const scoreB = (b.title.toLowerCase().includes(query) ? 2 : 0) +
                      (b.description?.toLowerCase().includes(query) ? 1 : 0)
        return scoreB - scoreA
      })
    default:
      return sorted
  }
}

// 分页变化
function onPageChange(page) {
  currentPage.value = page
  // 这里可以实现分页加载
}

// 快捷筛选
function isActiveFilter(filter) {
  switch (filter.type) {
    case 'category':
      return searchForm.value.category === filter.value
    case 'date':
      return getCurrentDateRange() === filter.value
    default:
      return false
  }
}

function applyQuickFilter(filter) {
  switch (filter.type) {
    case 'category':
      searchForm.value.category = searchForm.value.category === filter.value ? '' : filter.value
      break
    case 'date':
      searchForm.value.dateRange = getDateRangeForFilter(filter.value)
      break
    case 'impact':
      // TODO: 实现影响力筛选
      break
  }
  onFilterChange()
}

// 获取当前日期范围类型
function getCurrentDateRange() {
  if (!searchForm.value.dateRange) return null
  
  const [start, end] = searchForm.value.dateRange
  const thisWeekStart = dayjs().startOf('week').format('YYYY-MM-DD')
  const thisWeekEnd = dayjs().endOf('week').format('YYYY-MM-DD')
  const thisMonthStart = dayjs().startOf('month').format('YYYY-MM-DD')
  const thisMonthEnd = dayjs().endOf('month').format('YYYY-MM-DD')
  
  if (start === thisWeekStart && end === thisWeekEnd) return 'thisWeek'
  if (start === thisMonthStart && end === thisMonthEnd) return 'thisMonth'
  return null
}

// 获取筛选器对应的日期范围
function getDateRangeForFilter(filterValue) {
  switch (filterValue) {
    case 'thisWeek':
      return [
        dayjs().startOf('week').format('YYYY-MM-DD'),
        dayjs().endOf('week').format('YYYY-MM-DD')
      ]
    case 'thisMonth':
      return [
        dayjs().startOf('month').format('YYYY-MM-DD'),
        dayjs().endOf('month').format('YYYY-MM-DD')
      ]
    default:
      return null
  }
}

// 搜索建议点击
function applySuggestion(suggestion) {
  switch (suggestion.action) {
    case 'category':
      // 显示所有分类
      searchForm.value.category = ''
      performSearch()
      break
    case 'recent':
      searchForm.value.dateRange = getDateRangeForFilter('thisWeek')
      performSearch()
      break
    case 'important':
      // TODO: 实现重要事件筛选
      searchForm.value.query = '重大'
      performSearch()
      break
    case 'tags':
      // 显示热门标签
      break
  }
}

// 按标签搜索
function searchByTag(tag) {
  searchForm.value.tags = [tag]
  searchForm.value.query = ''
  performSearch()
}

// 清空搜索
function clearSearch() {
  searchForm.value = {
    query: '',
    category: '',
    tags: [],
    dateRange: null
  }
  searchResults.value = []
  hasSearched.value = false
  totalResults.value = 0
}

// 关键词高亮
function highlightKeyword(text) {
  if (!text || !searchForm.value.query) return text
  
  const keyword = searchForm.value.query
  const regex = new RegExp(`(${keyword})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
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
        type: 'warning'
      }
    )
    
    await eventAPI.deleteEvent(event.id)
    ElMessage.success('删除成功')
    performSearch() // 重新搜索
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除事件失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 工具函数
function formatDate(dateString) {
  return dayjs(dateString).format('MM月DD日 HH:mm')
}

function parseEventTags(tagsString) {
  if (!tagsString) return []
  return tagsString.split(',').slice(0, 5)
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
    '教育': '#3b82f6'
  }
  return colorMap[category] || '#667eea'
}
</script>

<style lang="scss" scoped>
.search-page {
  min-height: 100vh;
}

// 搜索头部
.search-header {
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

// 搜索表单
.search-form-container {
  margin-bottom: 40px;

  .search-form {
    .form-row {
      display: grid;
      gap: 20px;
      margin-bottom: 20px;
      align-items: end;

      &:first-child {
        grid-template-columns: 1fr auto;
      }

      &:last-child {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      }
    }

    .keyword-item {
      .el-input {
        :deep(.el-input__wrapper) {
          border-radius: 25px;
          padding: 0 20px;
        }
      }
    }

    :deep(.el-form-item__label) {
      font-weight: 600;
      color: var(--text-primary);
    }
  }

  .quick-filters {
    display: flex;
    align-items: center;
    gap: 16px;
    padding-top: 20px;
    border-top: 1px solid var(--border-color);

    .filter-label {
      color: var(--text-secondary);
      font-weight: 500;
      flex-shrink: 0;
    }

    .filter-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .filter-tag {
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          transform: scale(1.05);
        }
      }
    }
  }
}

// 搜索结果
.search-results {
  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 20px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    .results-info {
      .results-count {
        color: white;
        font-size: 18px;
        
        strong {
          color: var(--accent-color);
        }
      }

      .search-keyword {
        color: rgba(255, 255, 255, 0.7);
        margin-left: 16px;
        font-size: 14px;
      }
    }
  }

  .events-list {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .event-item {
      background: var(--bg-primary);
      border-radius: 12px;
      padding: 24px;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 1px solid transparent;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
        border-color: var(--primary-color);
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
          margin-right: 20px;

          :deep(mark) {
            background: var(--accent-color);
            color: white;
            padding: 2px 4px;
            border-radius: 4px;
          }
        }

        .event-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;

          .event-date {
            font-size: 13px;
            color: var(--text-light);
          }

          .event-category {
            font-size: 13px;
            font-weight: 600;
          }
        }
      }

      .event-description {
        color: var(--text-secondary);
        line-height: 1.6;
        margin-bottom: 16px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;

        :deep(mark) {
            background: var(--accent-color);
            color: white;
            padding: 2px 4px;
            border-radius: 4px;
          }
      }

      .event-tags {
        margin-bottom: 16px;
        display: flex;
        flex-wrap: wrap;
        gap: 6px;

        .tag {
          transition: all 0.2s ease;

          &:hover {
            transform: scale(1.1);
          }
        }
      }

      .event-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .event-actions {
          display: flex;
          gap: 8px;
        }
      }
    }

    .empty-results {
      text-align: center;
      padding: 80px 20px;

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

    .search-suggestions {
      .suggestion-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
        margin-top: 20px;

        .suggestion-item {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 24px;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.2);
            transform: translateY(-4px);
          }

          .suggestion-icon {
            font-size: 32px;
            color: var(--accent-color);
            margin-bottom: 16px;
          }

          .suggestion-content {
            h4 {
              font-size: 18px;
              font-weight: 600;
              color: white;
              margin-bottom: 8px;
            }

            p {
              color: rgba(255, 255, 255, 0.7);
              font-size: 14px;
              line-height: 1.5;
            }
          }
        }
      }

      h3 {
        font-size: 24px;
        color: white;
        text-align: center;
        margin-bottom: 32px;
      }
    }
  }

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
}

// 响应式设计
@media (max-width: 1024px) {
  .search-form {
    .form-row {
      &:first-child {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      &:last-child {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }
  }

  .quick-filters {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;

    .filter-tags {
      justify-content: center;
    }
  }

  .results-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
    text-align: center;
  }
}

@media (max-width: 768px) {
  .search-header {
    padding: 20px 0;

    .page-title {
      font-size: 28px;
    }
  }

  .search-form-container {
    padding: 20px;
  }

  .events-list .event-item {
    padding: 16px;

    .event-header {
      flex-direction: column;
      align-items: stretch;

      .event-meta {
        flex-direction: row;
        justify-content: space-between;
        margin-top: 8px;
      }
    }

    .event-footer {
      flex-direction: column;
      gap: 16px;
    }
  }

  .search-suggestions .suggestion-grid {
    grid-template-columns: 1fr;
  }
}
</style> 