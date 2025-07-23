from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
import sqlite3
import os

# 数据库文件路径
DATABASE_URL = "sqlite:///./grand_things.db"

# 创建数据库引擎
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 声明基类
Base = declarative_base()


# 事件模型
class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    event_date = Column(DateTime, default=datetime.utcnow)
    tags = Column(String(500))  # 存储为逗号分隔的字符串
    category = Column(String(50))
    impact_score = Column(Integer, default=0)  # 影响评分 0-10
    feedback = Column(Text)  # 后续反馈
    is_reviewed = Column(Boolean, default=False)


# 标签模型
class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    color = Column(String(7), default="#3B82F6")  # 十六进制颜色
    category = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)


# 创建所有表
def create_tables():
    Base.metadata.create_all(bind=engine)


# 获取数据库会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
