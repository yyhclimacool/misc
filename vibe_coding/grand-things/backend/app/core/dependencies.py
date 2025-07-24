"""
FastAPI依赖项
"""

from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.auth import verify_token
from app.database import User
from app.services.user_service import UserService

# HTTP Bearer 认证方案
security = HTTPBearer()


def get_db():
    """获取数据库会话"""
    # 这里需要根据实际的数据库配置来实现
    # 暂时返回None，等待整合到现有的数据库配置中
    from app.database import SessionLocal

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """获取当前用户"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无效的认证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # 验证token
    token_data = verify_token(credentials.credentials)
    if token_data is None or token_data.email is None:
        raise credentials_exception

    # 获取用户
    user_service = UserService(db)
    user = user_service.get_user_by_email(token_data.email)
    if user is None:
        raise credentials_exception

    return user


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """获取当前活跃用户"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="用户账户已被停用"
        )
    return current_user


def get_current_superuser(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """获取当前超级用户"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="权限不足")
    return current_user


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    """获取用户服务实例"""
    return UserService(db)
 