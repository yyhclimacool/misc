from pydantic import BaseModel, EmailStr, validator
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


# 用户相关的Pydantic模型
class UserBase(BaseModel):
    """用户基础模型"""

    email: EmailStr
    username: str
    full_name: Optional[str] = None


class UserCreate(UserBase):
    """用户创建模型"""

    password: str

    @validator("password")
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError("密码长度至少6位")
        return v

    @validator("username")
    def validate_username(cls, v):
        if len(v) < 3:
            raise ValueError("用户名长度至少3位")
        if not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError("用户名只能包含字母、数字、下划线和连字符")
        return v


class UserLogin(BaseModel):
    """用户登录模型"""

    email: EmailStr
    password: str


class UserResponse(UserBase):
    """用户响应模型"""

    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    """用户更新模型"""

    username: Optional[str] = None
    full_name: Optional[str] = None

    @validator("username")
    def validate_username(cls, v):
        if v is not None:
            if len(v) < 3:
                raise ValueError("用户名长度至少3位")
            if not v.replace("_", "").replace("-", "").isalnum():
                raise ValueError("用户名只能包含字母、数字、下划线和连字符")
        return v


class PasswordChangeRequest(BaseModel):
    """修改密码请求模型"""

    current_password: str
    new_password: str

    @validator("new_password")
    def validate_new_password(cls, v):
        if len(v) < 6:
            raise ValueError("新密码长度至少6位")
        return v
