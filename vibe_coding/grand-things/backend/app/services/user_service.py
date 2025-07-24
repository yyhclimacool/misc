"""
用户服务层，处理用户相关的业务逻辑
"""

from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.database import User
from app.models import (
    UserCreate,
    UserLogin,
    UserUpdate,
    UserResponse,
    PasswordChangeRequest,
)
from app.core.auth import get_password_hash, verify_password, create_access_token


class UserService:
    """用户服务类"""

    def __init__(self, db: Session):
        self.db = db

    def create_user(self, user_data: UserCreate) -> UserResponse:
        """创建新用户"""
        # 检查邮箱是否已存在
        existing_user = (
            self.db.query(User).filter(User.email == user_data.email).first()
        )
        if existing_user:
            raise ValueError("邮箱已被注册")

        # 检查用户名是否已存在
        existing_username = (
            self.db.query(User).filter(User.username == user_data.username).first()
        )
        if existing_username:
            raise ValueError("用户名已被占用")

        # 创建新用户
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            email=user_data.email,
            username=user_data.username,
            full_name=user_data.full_name,
            hashed_password=hashed_password,
        )

        try:
            self.db.add(db_user)
            self.db.commit()
            self.db.refresh(db_user)
            return UserResponse.from_orm(db_user)
        except IntegrityError:
            self.db.rollback()
            raise ValueError("用户创建失败，邮箱或用户名可能已存在")

    def authenticate_user(self, login_data: UserLogin) -> Optional[User]:
        """验证用户登录"""
        user = self.db.query(User).filter(User.email == login_data.email).first()
        if not user:
            return None
        if not verify_password(login_data.password, user.hashed_password):
            return None
        if not user.is_active:
            return None
        return user

    def get_user_by_email(self, email: str) -> Optional[User]:
        """根据邮箱获取用户"""
        return self.db.query(User).filter(User.email == email).first()

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """根据ID获取用户"""
        return self.db.query(User).filter(User.id == user_id).first()

    def update_user(
        self, user_id: int, user_data: UserUpdate
    ) -> Optional[UserResponse]:
        """更新用户信息"""
        user = self.get_user_by_id(user_id)
        if not user:
            return None

        # 检查用户名是否被其他用户占用
        if user_data.username and user_data.username != user.username:
            existing_user = (
                self.db.query(User)
                .filter(User.username == user_data.username, User.id != user_id)
                .first()
            )
            if existing_user:
                raise ValueError("用户名已被占用")

        # 更新用户信息
        update_data = user_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)

        try:
            self.db.commit()
            self.db.refresh(user)
            return UserResponse.from_orm(user)
        except IntegrityError:
            self.db.rollback()
            raise ValueError("用户信息更新失败")

    def deactivate_user(self, user_id: int) -> bool:
        """停用用户"""
        user = self.get_user_by_id(user_id)
        if not user:
            return False

        user.is_active = False
        self.db.commit()
        return True

    def login_user(self, login_data: UserLogin) -> dict:
        """用户登录，返回token和用户信息"""
        user = self.authenticate_user(login_data)
        if not user:
            raise ValueError("邮箱或密码错误")

        # 创建访问令牌
        access_token = create_access_token(data={"sub": user.email})

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse.from_orm(user),
        }

    def change_password(
        self, user_id: int, password_data: PasswordChangeRequest
    ) -> bool:
        """修改用户密码"""
        user = self.get_user_by_id(user_id)
        if not user:
            raise ValueError("用户不存在")

        # 验证当前密码
        if not verify_password(password_data.current_password, user.hashed_password):
            raise ValueError("当前密码错误")

        # 设置新密码
        user.hashed_password = get_password_hash(password_data.new_password)

        try:
            self.db.commit()
            return True
        except IntegrityError:
            self.db.rollback()
            raise ValueError("密码修改失败")

    def get_user_statistics(self, user_id: int) -> dict:
        """获取用户统计信息"""
        from app.database import Event

        user = self.get_user_by_id(user_id)
        if not user:
            return {}

        # 统计用户的事件数据
        total_events = self.db.query(Event).filter(Event.user_id == user_id).count()

        # 按分类统计
        from sqlalchemy import func

        category_stats = (
            self.db.query(Event.category, func.count(Event.id))
            .filter(Event.user_id == user_id)
            .group_by(Event.category)
            .all()
        )

        return {
            "total_events": total_events,
            "categories": (
                [
                    {"name": category, "count": count}
                    for category, count in category_stats
                ]
                if category_stats
                else []
            ),
            "joined_date": user.created_at,
        }
