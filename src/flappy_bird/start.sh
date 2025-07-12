#!/bin/bash

# Flappy Bird 游戏启动脚本

echo "🎮 Flappy Bird - 飞扬的小鸟"
echo "============================"
echo ""

# 检查Python是否安装
if ! command -v python3 &>/dev/null; then
  echo "❌ Python3 未安装，请先安装Python3"
  exit 1
fi

# 检查pip是否安装
if ! command -v pip3 &>/dev/null; then
  echo "❌ pip3 未安装，请先安装pip3"
  exit 1
fi

echo "📦 正在安装依赖..."
pip3 install -r requirements.txt

echo ""
echo "🚀 启动游戏服务器..."
echo "📱 游戏地址: http://localhost:5002"
echo "🎯 按 Ctrl+C 停止服务器"
echo ""

# 启动服务器
python3 app.py
