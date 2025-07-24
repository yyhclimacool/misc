#!/usr/bin/env python3
"""
数据库初始化脚本
重新创建数据库表结构，包含用户认证相关的字段
"""

from app.database import create_tables, engine, Base
from sqlalchemy import inspect


def init_database():
    """初始化数据库表结构"""
    print("🚀 开始初始化数据库...")

    try:
        # 创建所有表
        create_tables()

        # 验证表结构
        inspector = inspect(engine)
        tables = inspector.get_table_names()

        print("✅ 成功创建以下数据表:")
        for table in tables:
            columns = inspector.get_columns(table)
            print(f"  📋 {table}:")
            for col in columns:
                print(f"    - {col['name']} ({col['type']})")

        print("\n🎉 数据库初始化完成！")

    except Exception as e:
        print(f"❌ 数据库初始化失败: {e}")
        raise


if __name__ == "__main__":
    init_database()
