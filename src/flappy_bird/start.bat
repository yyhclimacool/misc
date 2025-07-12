@echo off
chcp 65001 > nul

echo 🎮 Flappy Bird - 飞扬的小鸟
echo ============================
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python 未安装，请先安装Python
    pause
    exit /b 1
)

REM 检查pip是否安装
pip --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ pip 未安装，请先安装pip
    pause
    exit /b 1
)

echo 📦 正在安装依赖...
pip install -r requirements.txt

echo.
echo 🚀 启动游戏服务器...
echo 📱 游戏地址: http://localhost:5002
echo 🎯 按 Ctrl+C 停止服务器
echo.

REM 启动服务器
python app.py

pause 