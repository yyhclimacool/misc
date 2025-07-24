#!/bin/bash

echo "🚀 启动 Grand Things 大事记应用..."
echo "================================="

# 检查Python环境
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误：未找到Python3，请先安装Python 3.8+"
    exit 1
fi

# 检查Node.js环境
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未找到Node.js，请先安装Node.js 16+"
    exit 1
fi

echo "✅ 环境检查通过"

# 安装前端依赖（如果需要）
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 安装前端依赖..."
    cd frontend || exit
    npm install
    cd ..
fi

# 启动后端服务
echo "🔧 启动后端服务..."
cd backend || exit
uv run main.py &
BACKEND_PID=$!
cd ..

# 等待后端启动
echo "⏳ 等待后端服务启动..."
sleep 5

# 检查后端是否启动成功
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ 后端服务启动成功"
else
    echo "⚠️  后端服务可能启动异常，但继续启动前端..."
fi

# 启动前端服务
echo "🔧 启动前端服务..."
cd frontend || exit
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 Grand Things 应用启动成功！"
echo "================================="
echo "📱 前端应用地址: http://localhost:5173"
echo "🔗 后端API地址:  http://localhost:8000"
echo "📚 API文档地址:  http://localhost:8000/docs"
echo "💡 健康检查:     http://localhost:8000/health"
echo ""
echo "💡 使用说明："
echo "   - 在浏览器中访问 http://localhost:5173 开始使用"
echo "   - 首次使用建议先添加几个测试事件"
echo "   - 系统会自动提取标签和分类"
echo ""
echo "⏹️  按 Ctrl+C 或 Enter 键停止所有服务"
echo "================================="

# 等待用户输入停止服务
wait_for_exit() {
    while true; do
        read -t 1 -n 1 key
        if [[ $key == $'\x0a' ]] || [[ $key == $'\x03' ]]; then
            break
        fi
        # 检查后台进程是否还在运行
        if ! kill -0 $BACKEND_PID 2>/dev/null && ! kill -0 $FRONTEND_PID 2>/dev/null; then
            echo "⚠️  检测到服务异常退出"
            break
        fi
    done
}

# 捕获Ctrl+C信号
trap 'echo ""; echo "🛑 正在停止服务..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo "👋 服务已停止"; exit 0' INT

wait_for_exit

# 停止服务
echo ""
echo "🛑 正在停止服务..."
kill $BACKEND_PID 2>/dev/null
kill $FRONTEND_PID 2>/dev/null

# 等待进程结束
sleep 2

echo "👋 Grand Things 应用已停止运行"
echo "感谢使用！" 