<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <!-- 主要内容 -->
    <div class="login-container">
      <!-- 左侧：品牌介绍 -->
      <div class="brand-section">
        <div class="brand-content">
          <div class="logo">
            <el-icon size="48"><Clock /></el-icon>
            <h1>Grand Things</h1>
          </div>
          <h2>记录生活中的每一个重要时刻</h2>
          <p>智能标签管理 · 时间线展示 · 事件分析</p>
          
          <div class="features">
            <div class="feature-item">
              <el-icon><MagicStick /></el-icon>
              <span>智能标签提取</span>
            </div>
            <div class="feature-item">
              <el-icon><TrendCharts /></el-icon>
              <span>数据可视化分析</span>
            </div>
            <div class="feature-item">
              <el-icon><Bell /></el-icon>
              <span>重要事件提醒</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：登录表单 -->
      <div class="form-section">
        <div class="form-container">
          <div class="form-header">
            <h3>{{ isLoginMode ? '登录账户' : '注册账户' }}</h3>
            <p>{{ isLoginMode ? '欢迎回来，继续记录精彩时刻' : '加入我们，开始记录人生重要时刻' }}</p>
          </div>

          <!-- 登录表单 -->
          <el-form
            v-if="isLoginMode"
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            size="large"
            @submit.prevent="handleLogin"
          >
            <el-form-item prop="email">
              <el-input
                v-model="loginForm.email"
                placeholder="邮箱地址"
                prefix-icon="Message"
                clearable
              />
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="密码"
                prefix-icon="Lock"
                clearable
                show-password
                @keyup.enter="handleLogin"
              />
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                class="submit-btn"
                :loading="authStore.loading"
                @click="handleLogin"
              >
                <el-icon v-if="!authStore.loading"><User /></el-icon>
                登录
              </el-button>
            </el-form-item>
          </el-form>

          <!-- 注册表单 -->
          <el-form
            v-else
            ref="registerFormRef"
            :model="registerForm"
            :rules="registerRules"
            size="large"
            @submit.prevent="handleRegister"
          >
            <el-form-item prop="email">
              <el-input
                v-model="registerForm.email"
                placeholder="邮箱地址"
                prefix-icon="Message"
                clearable
              />
            </el-form-item>

            <el-form-item prop="username">
              <el-input
                v-model="registerForm.username"
                placeholder="用户名"
                prefix-icon="User"
                clearable
              />
            </el-form-item>

            <el-form-item prop="full_name">
              <el-input
                v-model="registerForm.full_name"
                placeholder="真实姓名（可选）"
                prefix-icon="Avatar"
                clearable
              />
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="密码（至少6位）"
                prefix-icon="Lock"
                clearable
                show-password
              />
            </el-form-item>

            <el-form-item prop="confirmPassword">
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="确认密码"
                prefix-icon="Lock"
                clearable
                show-password
                @keyup.enter="handleRegister"
              />
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                class="submit-btn"
                :loading="authStore.loading"
                @click="handleRegister"
              >
                <el-icon v-if="!authStore.loading"><Plus /></el-icon>
                注册
              </el-button>
            </el-form-item>
          </el-form>

          <!-- 切换模式 -->
          <div class="switch-mode">
            <span v-if="isLoginMode">
              还没有账户？
              <el-button type="primary" text @click="switchMode">
                立即注册
              </el-button>
            </span>
            <span v-else>
              已有账户？
              <el-button type="primary" text @click="switchMode">
                立即登录
              </el-button>
            </span>
          </div>

          <!-- 其他登录方式 -->
          <div class="other-methods">
            <el-divider>
              <span class="divider-text">其他方式</span>
            </el-divider>
            
            <div class="social-login">
              <el-button circle size="large" disabled>
                <el-icon><Platform /></el-icon>
              </el-button>
              <el-button circle size="large" disabled>
                <el-icon><Connection /></el-icon>
              </el-button>
              <span class="coming-soon">即将推出</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Clock, MagicStick, TrendCharts, Bell, 
  User, Lock, Message, Plus, Avatar,
  Platform, Connection
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 表单模式切换
const isLoginMode = ref(true)

// 登录表单
const loginFormRef = ref(null)
const loginForm = reactive({
  email: '',
  password: ''
})

const loginRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
}

// 注册表单
const registerFormRef = ref(null)
const registerForm = reactive({
  email: '',
  username: '',
  full_name: '',
  password: '',
  confirmPassword: ''
})

const registerRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度至少3位', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_-]+$/, message: '用户名只能包含字母、数字、下划线和连字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    await authStore.login(loginForm)
    
    // 登录成功，跳转到首页
    router.push('/')
  } catch (error) {
    console.error('登录失败:', error)
  }
}

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  try {
    await registerFormRef.value.validate()
    
    const { confirmPassword, ...userData } = registerForm
    await authStore.register(userData)
    
    // 注册成功，切换到登录模式
    switchMode()
    // 预填充邮箱
    loginForm.email = registerForm.email
  } catch (error) {
    console.error('注册失败:', error)
  }
}

// 切换登录/注册模式
const switchMode = () => {
  isLoginMode.value = !isLoginMode.value
  
  // 清空表单
  if (loginFormRef.value) {
    loginFormRef.value.resetFields()
  }
  if (registerFormRef.value) {
    registerFormRef.value.resetFields()
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

// 背景装饰
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;

  .circle {
    position: absolute;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
    animation: float 6s ease-in-out infinite;

    &.circle-1 {
      width: 300px;
      height: 300px;
      top: -150px;
      right: -150px;
      animation-delay: 0s;
    }

    &.circle-2 {
      width: 200px;
      height: 200px;
      bottom: -100px;
      left: -100px;
      animation-delay: 2s;
    }

    &.circle-3 {
      width: 150px;
      height: 150px;
      top: 50%;
      left: 20%;
      animation-delay: 4s;
    }
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

// 主容器
.login-container {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 1200px;
  margin: 0 auto;
}

// 品牌区域
.brand-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));

  .brand-content {
    text-align: center;
    max-width: 400px;

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-bottom: 32px;

      .el-icon {
        color: var(--primary-color);
      }

      h1 {
        font-size: 36px;
        font-weight: 700;
        background: linear-gradient(135deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin: 0;
      }
    }

    h2 {
      font-size: 24px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 16px;
    }

    p {
      font-size: 16px;
      color: var(--text-secondary);
      margin-bottom: 40px;
    }

    .features {
      display: flex;
      flex-direction: column;
      gap: 20px;

      .feature-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: var(--bg-secondary);
        border-radius: 12px;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .el-icon {
          color: var(--primary-color);
          font-size: 20px;
        }

        span {
          font-weight: 500;
          color: var(--text-primary);
        }
      }
    }
  }
}

// 表单区域
.form-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;

  .form-container {
    width: 100%;
    max-width: 400px;

    .form-header {
      text-align: center;
      margin-bottom: 32px;

      h3 {
        font-size: 28px;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 8px;
      }

      p {
        color: var(--text-secondary);
        line-height: 1.5;
      }
    }

    .submit-btn {
      width: 100%;
      height: 48px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 12px;
    }

    .switch-mode {
      text-align: center;
      margin-top: 24px;
      color: var(--text-secondary);

      .el-button {
        font-weight: 600;
      }
    }

    .other-methods {
      margin-top: 32px;

      .divider-text {
        color: var(--text-light);
        font-size: 14px;
      }

      .social-login {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 16px;
        margin-top: 20px;

        .coming-soon {
          font-size: 12px;
          color: var(--text-light);
          margin-left: 8px;
        }
      }
    }
  }
}

// Element Plus 样式覆盖
:deep(.el-form-item) {
  margin-bottom: 20px;

  .el-input__wrapper {
    height: 48px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
}

:deep(.el-divider__text) {
  background-color: var(--bg-primary);
}

// 响应式设计
@media (max-width: 1024px) {
  .login-container {
    grid-template-columns: 1fr;
  }

  .brand-section {
    display: none;
  }

  .form-section {
    padding: 20px;
  }
}

@media (max-width: 768px) {
  .form-section {
    padding: 16px;

    .form-container {
      max-width: 100%;
    }
  }
}
</style> 