<template>
  <div class="profile-page">
    <div class="profile-container">
      <div class="profile-header">
        <div class="user-avatar">
          <el-avatar 
            :size="80" 
            :src="userInfo.avatar" 
            :style="{ backgroundColor: '#409EFF' }"
          >
            {{ userInfo.username?.charAt(0)?.toUpperCase() }}
          </el-avatar>
        </div>
        <div class="user-info">
          <h2 class="username">{{ userInfo.username }}</h2>
          <p class="email">{{ userInfo.email }}</p>
          <p class="join-date">
            <el-icon><Calendar /></el-icon>
            加入时间：{{ formatDate(userInfo.created_at) }}
          </p>
        </div>
      </div>

      <div class="profile-content">
        <el-tabs v-model="activeTab" class="profile-tabs">
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="profile">
            <div class="tab-content">
              <el-card class="info-card">
                <template #header>
                  <div class="card-header">
                    <span>个人信息</span>
                    <el-button 
                      type="primary" 
                      :loading="updating" 
                      @click="updateProfile"
                      :disabled="!isProfileChanged"
                    >
                      保存修改
                    </el-button>
                  </div>
                </template>
                
                <el-form 
                  ref="profileFormRef"
                  :model="profileForm" 
                  :rules="profileRules"
                  label-width="100px"
                  class="profile-form"
                >
                  <el-form-item label="用户名" prop="username">
                    <el-input 
                      v-model="profileForm.username" 
                      placeholder="请输入用户名"
                      maxlength="20"
                      show-word-limit
                    />
                  </el-form-item>
                  
                  <el-form-item label="真实姓名" prop="full_name">
                    <el-input 
                      v-model="profileForm.full_name" 
                      placeholder="请输入真实姓名（可选）"
                      maxlength="20"
                      show-word-limit
                    />
                  </el-form-item>
                  
                  <el-form-item label="邮箱地址">
                    <el-input 
                      v-model="profileForm.email" 
                      disabled
                      placeholder="邮箱地址不可修改"
                    />
                  </el-form-item>
                </el-form>
              </el-card>
            </div>
          </el-tab-pane>

          <!-- 安全设置 -->
          <el-tab-pane label="安全设置" name="security">
            <div class="tab-content">
              <el-card class="security-card">
                <template #header>
                  <div class="card-header">
                    <span>修改密码</span>
                  </div>
                </template>
                
                <el-form 
                  ref="passwordFormRef"
                  :model="passwordForm"
                  :rules="passwordRules"
                  label-width="100px"
                  class="password-form"
                >
                  <el-form-item label="当前密码" prop="current_password">
                    <el-input 
                      v-model="passwordForm.current_password" 
                      type="password"
                      placeholder="请输入当前密码"
                      show-password
                    />
                  </el-form-item>
                  
                  <el-form-item label="新密码" prop="new_password">
                    <el-input 
                      v-model="passwordForm.new_password" 
                      type="password"
                      placeholder="请输入新密码（至少6位）"
                      show-password
                    />
                  </el-form-item>
                  
                  <el-form-item label="确认密码" prop="confirm_password">
                    <el-input 
                      v-model="passwordForm.confirm_password" 
                      type="password"
                      placeholder="请再次输入新密码"
                      show-password
                    />
                  </el-form-item>
                  
                  <el-form-item>
                    <el-button 
                      type="primary" 
                      :loading="changingPassword" 
                      @click="changePassword"
                    >
                      修改密码
                    </el-button>
                    <el-button @click="resetPasswordForm">
                      重置
                    </el-button>
                  </el-form-item>
                </el-form>
              </el-card>
            </div>
          </el-tab-pane>

          <!-- 数据统计 -->
          <el-tab-pane label="数据统计" name="statistics">
            <div class="tab-content">
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-card class="stat-card">
                    <div class="stat-item">
                      <div class="stat-icon">
                        <el-icon size="32" color="#409EFF">
                          <Document />
                        </el-icon>
                      </div>
                      <div class="stat-info">
                        <div class="stat-number">{{ statistics.total_events || 0 }}</div>
                        <div class="stat-label">总事件数</div>
                      </div>
                    </div>
                  </el-card>
                </el-col>
                
                <el-col :span="8">
                  <el-card class="stat-card">
                    <div class="stat-item">
                      <div class="stat-icon">
                        <el-icon size="32" color="#67C23A">
                          <CollectionTag />
                        </el-icon>
                      </div>
                      <div class="stat-info">
                        <div class="stat-number">{{ statistics.categories?.length || 0 }}</div>
                        <div class="stat-label">事件分类</div>
                      </div>
                    </div>
                  </el-card>
                </el-col>
                
                <el-col :span="8">
                  <el-card class="stat-card">
                    <div class="stat-item">
                      <div class="stat-icon">
                        <el-icon size="32" color="#E6A23C">
                          <Calendar />
                        </el-icon>
                      </div>
                      <div class="stat-info">
                        <div class="stat-number">{{ daysSinceJoin }}</div>
                        <div class="stat-label">使用天数</div>
                      </div>
                    </div>
                  </el-card>
                </el-col>
              </el-row>

              <!-- 分类统计图表 -->
              <el-card v-if="statistics.categories?.length > 0" class="chart-card">
                <template #header>
                  <span>事件分类分布</span>
                </template>
                <div class="category-stats">
                  <div 
                    v-for="category in statistics.categories" 
                    :key="category.name"
                    class="category-item"
                  >
                    <div class="category-name">
                      {{ category.name || '未分类' }}
                    </div>
                    <div class="category-bar">
                      <div 
                        class="category-progress"
                        :style="{ 
                          width: `${(category.count / statistics.total_events) * 100}%`,
                          backgroundColor: getCategoryColor(category.name)
                        }"
                      ></div>
                    </div>
                    <div class="category-count">
                      {{ category.count }}
                    </div>
                  </div>
                </div>
              </el-card>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/composables/useTheme'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Calendar, Document, CollectionTag
} from '@element-plus/icons-vue'
import { changePassword as apiChangePassword, getUserStatistics } from '@/api/auth'
import dayjs from 'dayjs'

const authStore = useAuthStore()
const { appliedTheme, currentTheme } = useTheme()

// 响应式数据
const activeTab = ref('profile')
const updating = ref(false)
const changingPassword = ref(false)
const statistics = ref({})

// 用户信息
const userInfo = computed(() => authStore.userInfo || {})

// 个人资料表单
const profileForm = ref({
  username: '',
  full_name: '',
  email: ''
})

const profileFormRef = ref()

// 密码修改表单
const passwordForm = ref({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

const passwordFormRef = ref()

// 表单验证规则
const profileRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
    { 
      pattern: /^[a-zA-Z0-9_-]+$/, 
      message: '用户名只能包含字母、数字、下划线和连字符', 
      trigger: 'blur' 
    }
  ]
}

const passwordRules = {
  current_password: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '新密码长度至少6位', trigger: 'blur' }
  ],
  confirm_password: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.new_password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 计算属性
const isProfileChanged = computed(() => {
  const current = userInfo.value
  const form = profileForm.value
  return current.username !== form.username || 
         current.full_name !== form.full_name
})

const daysSinceJoin = computed(() => {
  if (!statistics.value.joined_date) return 0
  return dayjs().diff(dayjs(statistics.value.joined_date), 'day')
})

// 监听用户信息变化
watch(userInfo, (newInfo) => {
  if (newInfo) {
    profileForm.value = {
      username: newInfo.username || '',
      full_name: newInfo.full_name || '',
      email: newInfo.email || ''
    }
  }
}, { immediate: true })

// 页面方法
onMounted(async () => {
  await loadStatistics()
})

// 加载统计信息
async function loadStatistics() {
  try {
    const stats = await getUserStatistics()
    statistics.value = stats
  } catch (error) {
    console.error('加载统计信息失败:', error)
    ElMessage.error('加载统计信息失败')
  }
}

// 更新个人资料
async function updateProfile() {
  try {
    await profileFormRef.value.validate()
    
    updating.value = true
    
    const updateData = {
      username: profileForm.value.username,
      full_name: profileForm.value.full_name || null
    }
    
    await authStore.updateUserInfo(updateData)
    ElMessage.success('个人信息更新成功')
  } catch (error) {
    console.error('更新个人信息失败:', error)
    ElMessage.error(error.message || '更新失败，请重试')
  } finally {
    updating.value = false
  }
}

// 修改密码
async function changePassword() {
  try {
    await passwordFormRef.value.validate()
    
    changingPassword.value = true
    
    const passwordData = {
      current_password: passwordForm.value.current_password,
      new_password: passwordForm.value.new_password
    }
    
    await apiChangePassword(passwordData)
    ElMessage.success('密码修改成功')
    resetPasswordForm()
  } catch (error) {
    console.error('修改密码失败:', error)
    ElMessage.error(error.message || '修改密码失败')
  } finally {
    changingPassword.value = false
  }
}

// 重置密码表单
function resetPasswordForm() {
  passwordForm.value = {
    current_password: '',
    new_password: '',
    confirm_password: ''
  }
  passwordFormRef.value?.clearValidate()
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return ''
  return dayjs(dateString).format('YYYY年MM月DD日')
}

// 获取分类颜色
function getCategoryColor(categoryName) {
  const colors = [
    '#409EFF', '#67C23A', '#E6A23C', '#F56C6C', 
    '#909399', '#c71585', '#ff8c00', '#32cd32'
  ]
  
  if (!categoryName) return colors[0]
  
  let hash = 0
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  padding: 20px;
  /* 根据主题设置背景 */
  background: var(--bg-primary);
  background-image: var(--bg-gradient);
  transition: background 0.3s ease;
}

.profile-container {
  max-width: 1000px;
  margin: 0 auto;
}

.profile-header {
  background: var(--card-bg);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.user-avatar {
  flex-shrink: 0;
}

.user-info {
  color: var(--text-primary);
}

.username {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
}

.email {
  margin: 0 0 8px 0;
  opacity: 0.8;
  font-size: 16px;
  color: var(--text-secondary);
}

.join-date {
  margin: 0;
  opacity: 0.7;
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--text-secondary);
}

.profile-content {
  background: var(--card-bg);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.profile-tabs {
  --el-color-primary: #409EFF;
}

.profile-tabs :deep(.el-tabs__header) {
  margin: 0 0 20px 0;
}

.profile-tabs :deep(.el-tabs__nav-wrap::after) {
  background-color: rgba(255, 255, 255, 0.2);
}

.profile-tabs :deep(.el-tabs__item) {
  color: var(--text-secondary);
  font-weight: 500;
  transition: color 0.3s ease;
}

.profile-tabs :deep(.el-tabs__item.is-active) {
  color: var(--primary-color);
}

.profile-tabs :deep(.el-tabs__active-bar) {
  background-color: var(--primary-color);
}

.profile-tabs :deep(.el-tabs__nav-wrap::after) {
  background-color: var(--border-color);
}

.tab-content {
  color: var(--text-primary);
}

.info-card,
.security-card,
.stat-card,
.chart-card {
  background: var(--card-bg-secondary);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.info-card :deep(.el-card__header),
.security-card :deep(.el-card__header),
.chart-card :deep(.el-card__header) {
  background: var(--card-header-bg);
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.profile-form,
.password-form {
  margin-top: 20px;
}

.profile-form :deep(.el-form-item__label),
.password-form :deep(.el-form-item__label) {
  color: var(--text-primary);
}

.profile-form :deep(.el-input__wrapper),
.password-form :deep(.el-input__wrapper) {
  background-color: var(--input-bg);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.profile-form :deep(.el-input__wrapper:hover),
.password-form :deep(.el-input__wrapper:hover) {
  border-color: var(--primary-color);
}

.profile-form :deep(.el-input__wrapper.is-focus),
.password-form :deep(.el-input__wrapper.is-focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color-light);
}

.profile-form :deep(.el-input__inner),
.password-form :deep(.el-input__inner) {
  color: var(--text-primary);
  background: transparent;
}

.profile-form :deep(.el-input__inner::placeholder),
.password-form :deep(.el-input__inner::placeholder) {
  color: var(--text-placeholder);
}

.profile-form :deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: var(--disabled-bg);
  border-color: var(--border-color);
}

.profile-form :deep(.el-input.is-disabled .el-input__inner) {
  color: var(--text-disabled);
}

.stat-card {
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 14px;
}

.category-stats {
  padding: 10px 0;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.category-name {
  flex: 0 0 100px;
  color: var(--text-primary);
  font-size: 14px;
}

.category-bar {
  flex: 1;
  height: 8px;
  background: var(--progress-bg);
  border-radius: 4px;
  overflow: hidden;
}

.category-progress {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.category-count {
  flex: 0 0 40px;
  text-align: right;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .profile-page {
    padding: 10px;
  }
  
  .category-item {
    flex-wrap: wrap;
  }
  
  .category-name {
    flex: 0 0 100%;
    margin-bottom: 5px;
  }
}

/* 主题变量 */
.profile-page {
  /* 浅色主题 */
  --bg-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --bg-gradient: none;
  --card-bg: rgba(255, 255, 255, 0.15);
  --card-bg-secondary: rgba(255, 255, 255, 0.1);
  --card-header-bg: rgba(255, 255, 255, 0.1);
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.8);
  --text-placeholder: rgba(255, 255, 255, 0.6);
  --text-disabled: rgba(255, 255, 255, 0.4);
  --border-color: rgba(255, 255, 255, 0.2);
  --input-bg: rgba(255, 255, 255, 0.1);
  --disabled-bg: rgba(255, 255, 255, 0.05);
  --progress-bg: rgba(255, 255, 255, 0.2);
  --primary-color: #409EFF;
  --primary-color-light: rgba(64, 158, 255, 0.2);
}

/* 深色主题 */
html.theme-dark .profile-page {
  --bg-primary: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  --bg-gradient: none;
  --card-bg: rgba(255, 255, 255, 0.08);
  --card-bg-secondary: rgba(255, 255, 255, 0.05);
  --card-header-bg: rgba(255, 255, 255, 0.08);
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --text-placeholder: rgba(255, 255, 255, 0.4);
  --text-disabled: rgba(255, 255, 255, 0.3);
  --border-color: rgba(255, 255, 255, 0.15);
  --input-bg: rgba(255, 255, 255, 0.08);
  --disabled-bg: rgba(255, 255, 255, 0.03);
  --progress-bg: rgba(255, 255, 255, 0.15);
  --primary-color: #409EFF;
  --primary-color-light: rgba(64, 158, 255, 0.15);
}

/* 浅色主题 */
html.theme-light .profile-page {
  --bg-primary: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  --bg-gradient: none;
  --card-bg: rgba(255, 255, 255, 0.9);
  --card-bg-secondary: rgba(255, 255, 255, 0.8);
  --card-header-bg: rgba(248, 250, 252, 0.9);
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-placeholder: #94a3b8;
  --text-disabled: #cbd5e1;
  --border-color: rgba(30, 41, 59, 0.1);
  --input-bg: rgba(255, 255, 255, 0.9);
  --disabled-bg: rgba(248, 250, 252, 0.9);
  --progress-bg: rgba(30, 41, 59, 0.1);
  --primary-color: #3b82f6;
  --primary-color-light: rgba(59, 130, 246, 0.1);
}
</style> 