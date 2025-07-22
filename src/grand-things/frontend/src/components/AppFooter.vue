<template>
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-section">
          <h3>Grand Things</h3>
          <p>现代化的大事记应用，记录生活中的重要时刻</p>
        </div>
        
        <div class="footer-section">
          <h4>功能特色</h4>
          <ul>
            <li>智能标签提取</li>
            <li>时间线展示</li>
            <li>分类检索</li>
            <li>结果反馈</li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h4>技术栈</h4>
          <ul>
            <li>Vue.js 3 + Element Plus</li>
            <li>Python FastAPI</li>
            <li>SQLite数据库</li>
            <li>中文NLP处理</li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h4>联系方式</h4>
          <div class="social-links">
            <el-button circle size="small">
              <el-icon><Message /></el-icon>
            </el-button>
            <el-button circle size="small">
              <el-icon><Link /></el-icon>
            </el-button>
            <el-button circle size="small">
              <el-icon><Share /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; 2024 Grand Things. 让每一个重要时刻都被记录.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { Message, Link, Share } from '@element-plus/icons-vue'
</script>

<style lang="scss" scoped>
.app-footer {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  margin-top: 60px;
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px 20px;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  margin-bottom: 30px;
}

.footer-section {
  h3 {
    color: white;
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 16px;
  }
  
  h4 {
    color: rgba(255, 255, 255, 0.9);
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
  }
  
  p {
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.6;
    font-size: 14px;
  }
  
  ul {
    list-style: none;
    
    li {
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 8px;
      font-size: 14px;
      position: relative;
      padding-left: 16px;
      
      &:before {
        content: '•';
        color: rgba(255, 255, 255, 0.5);
        position: absolute;
        left: 0;
      }
    }
  }
}

.social-links {
  display: flex;
  gap: 12px;
  
  :deep(.el-button) {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.8);
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.3);
      color: white;
      transform: translateY(-2px);
    }
  }
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 20px;
  text-align: center;
  
  p {
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    margin: 0;
  }
}

@media (max-width: 768px) {
  .footer-container {
    padding: 30px 16px 16px;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }
}
</style> 