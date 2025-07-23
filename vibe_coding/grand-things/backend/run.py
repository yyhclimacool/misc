#!/usr/bin/env python3
"""
Grand Things Backend Server
大事记应用后端服务器启动脚本
"""

import uvicorn
from app.main import app

if __name__ == "__main__":
    print("🚀 启动 Grand Things API 服务器...")
    print("📝 大事记应用 - 现代化的事件管理平台")
    print("🌐 API文档: http://localhost:8000/docs")
    print("💡 健康检查: http://localhost:8000/health")
    print("=" * 50)

    uvicorn.run(
        "app.main:app", host="0.0.0.0", port=8000, reload=True, log_level="info"
    )
