from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


# 事件基础模型
class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    event_date: Optional[datetime] = None
    tags: Optional[str] = None
    category: Optional[str] = None


# 创建事件模型
class EventCreate(EventBase):
    pass


# 更新事件模型
class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_date: Optional[datetime] = None
    tags: Optional[str] = None
    category: Optional[str] = None
    impact_score: Optional[int] = None
    feedback: Optional[str] = None
    is_reviewed: Optional[bool] = None


# 事件响应模型
class Event(EventBase):
    id: int
    created_at: datetime
    impact_score: int
    feedback: Optional[str] = None
    is_reviewed: bool

    class Config:
        from_attributes = True


# 标签基础模型
class TagBase(BaseModel):
    name: str
    color: Optional[str] = "#3B82F6"
    category: Optional[str] = None


# 创建标签模型
class TagCreate(TagBase):
    pass


# 标签响应模型
class Tag(TagBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# 时间线响应模型
class TimelineResponse(BaseModel):
    events: List[Event]
    total: int
    page: int
    size: int


# 搜索请求模型
class SearchRequest(BaseModel):
    query: Optional[str] = None
    tags: Optional[List[str]] = None
    category: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
