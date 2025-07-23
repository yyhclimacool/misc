# Grand Things - 大事记应用

一个现代化的大事记应用，帮助您记录、管理和分析人生中的重要时刻。

![Grand Things](https://via.placeholder.com/800x400/667eea/ffffff?text=Grand+Things)

## ✨ 功能特色

### 🎯 核心功能
- **智能事件管理** - 添加、编辑、删除事件，自动记录时间
- **智能标签提取** - 基于AI的中文NLP，自动提取相关标签和分类
- **时间线展示** - 支持垂直和水平两种布局，清晰展示事件发展历程
- **多维度搜索** - 支持关键词、标签、分类、时间范围等多种搜索方式
- **事件反馈系统** - 记录事件的后续影响和结果，提供投资决策线索

### 🎨 界面设计
- **现代化UI** - 采用渐变色彩，时尚美观
- **响应式设计** - 完美适配桌面端和移动端
- **流畅动画** - 丰富的过渡效果和交互动画
- **深色模式** - 支持护眼的深色主题

### 📊 数据分析
- **统计图表** - 分类分布、时间趋势、标签热力图
- **智能洞察** - 活跃度分析、内容分析、趋势预测
- **数据导出** - 支持事件数据的导入导出

## 🛠 技术栈

### 后端 (Python)
- **FastAPI** - 现代化的Python Web框架
- **SQLAlchemy** - Python SQL工具包和ORM
- **SQLite** - 轻量级数据库
- **Jieba** - 中文分词和NLP处理
- **Pydantic** - 数据验证和序列化

### 前端 (Vue.js)
- **Vue.js 3** - 现代化的JavaScript框架
- **Element Plus** - Vue 3 组件库
- **Vue Router** - 官方路由管理器
- **Pinia** - 状态管理
- **Vite** - 前端构建工具
- **SCSS** - CSS预处理器

## 📦 安装指南

### 环境要求
- Python 3.8+
- Node.js 16+
- npm 或 yarn

### 1. 克隆项目
```bash
git clone <repository-url>
cd grand-things
```

### 2. 后端安装
```bash
cd backend
pip install -r requirements.txt
```

### 3. 前端安装
```bash
cd frontend
npm install
# 或者使用 yarn
yarn install
```

## 🚀 启动应用

### 方法一：分别启动

#### 启动后端服务器
```bash
cd backend
python run.py
```
后端服务将在 `http://localhost:8000` 启动

#### 启动前端开发服务器
```bash
cd frontend
npm run dev
# 或者
yarn dev
```
前端应用将在 `http://localhost:5173` 启动

### 方法二：使用启动脚本

创建一个启动脚本 `start.sh`：
```bash
#!/bin/bash

echo "🚀 启动 Grand Things 应用..."

# 启动后端
cd backend
python run.py &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 启动前端
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "✅ 应用启动成功！"
echo "📱 前端地址: http://localhost:5173"
echo "🔗 后端API: http://localhost:8000"
echo "📚 API文档: http://localhost:8000/docs"

# 等待用户输入以停止服务
read -p "按 Enter 键停止服务..."

# 停止服务
kill $BACKEND_PID
kill $FRONTEND_PID

echo "👋 服务已停止"
```

然后运行：
```bash
chmod +x start.sh
./start.sh
```

## 📖 使用指南

### 添加事件
1. 点击导航栏的"添加事件"按钮
2. 填写事件标题和描述
3. 选择事件发生时间
4. 系统将自动提取标签和推荐分类
5. 可手动添加额外标签或修改分类
6. 点击"添加事件"完成创建

### 查看时间线
1. 访问"时间线"页面
2. 选择垂直或水平布局模式
3. 使用分类筛选器过滤事件
4. 点击事件卡片查看详情

### 搜索事件
1. 访问"搜索"页面
2. 输入关键词或选择筛选条件
3. 使用快捷筛选标签快速查找
4. 支持多维度组合搜索

### 添加事件反馈
1. 进入事件详情页面
2. 点击"添加反馈"按钮
3. 输入后续观察和分析
4. 重新评估事件重要性
5. 保存反馈信息

### 查看统计分析
1. 访问"统计"页面
2. 查看事件分类分布
3. 分析时间趋势图表
4. 探索热门标签云
5. 获取智能数据洞察

## 🔧 配置说明

### 后端配置
主要配置文件：`backend/app/main.py`
- 数据库配置：默认使用SQLite，可修改为PostgreSQL或MySQL
- CORS设置：允许前端跨域访问
- API路由：统一前缀 `/api`

### 前端配置
主要配置文件：`frontend/vite.config.js`
- 开发服务器端口：5173
- API代理：自动转发到后端8000端口
- 构建输出：`dist` 目录

## 📁 项目结构

```
grand-things/
├── backend/                 # Python后端
│   ├── app/
│   │   ├── api/            # API路由
│   │   ├── services/       # 业务逻辑
│   │   ├── database.py     # 数据库模型
│   │   ├── models.py       # Pydantic模型
│   │   └── main.py         # FastAPI应用
│   ├── requirements.txt    # Python依赖
│   └── run.py             # 启动脚本
├── frontend/               # Vue.js前端
│   ├── public/            # 静态资源
│   ├── src/
│   │   ├── api/           # API调用
│   │   ├── components/    # Vue组件
│   │   ├── views/         # 页面组件
│   │   ├── router/        # 路由配置
│   │   └── style/         # 样式文件
│   ├── package.json       # NPM依赖
│   └── vite.config.js     # Vite配置
└── README.md              # 项目说明
```

## 🌟 特色功能详解

### 智能标签提取
- 基于jieba中文分词
- 预定义12个主要分类的关键词库
- 自动识别公司名称、金额、重要性关键词
- 智能推断事件分类和重要性评分

### 时间线展示
- **垂直模式**：适合详细浏览，交替左右布局
- **水平模式**：适合快速浏览，点击查看详情
- 支持分类筛选和分页加载

### 搜索功能
- **关键词搜索**：标题和描述全文检索
- **标签筛选**：多标签组合筛选
- **分类筛选**：按事件分类查找
- **时间范围**：指定时间段搜索
- **快捷筛选**：预设常用筛选条件

### 事件反馈
- 记录事件后续发展
- 重新评估影响程度
- 为投资决策提供参考

## 🚀 未来规划

### 短期计划
- [ ] 数据导入导出功能
- [ ] 事件编辑功能完善
- [ ] 移动端App开发
- [ ] 多用户支持

### 长期规划
- [ ] AI智能分析增强
- [ ] 社交分享功能
- [ ] 团队协作功能
- [ ] 更多图表类型

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进项目！

### 开发规范
- 后端遵循FastAPI最佳实践
- 前端使用Vue 3 Composition API
- 代码注释使用中文
- 提交信息使用中文

### 提交步骤
1. Fork本项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 📜 许可证

MIT License

## 🙏 致谢

感谢所有开源项目的贡献者，特别是：
- Vue.js团队
- FastAPI团队
- Element Plus团队
- jieba中文分词项目

---

**让每一个重要时刻都被记录 📝✨**