"""
用户认证相关的API路由
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_active_user, get_user_service
from app.core.auth import Token
from app.database import User
from app.models import (
    UserCreate,
    UserLogin,
    UserResponse,
    UserUpdate,
    PasswordChangeRequest,
)
from app.services.user_service import UserService

router = APIRouter(prefix="/auth", tags=["认证"])


@router.post("/register", response_model=UserResponse, summary="用户注册")
async def register(
    user_data: UserCreate, user_service: UserService = Depends(get_user_service)
):
    """
    用户注册接口

    - **email**: 邮箱地址（必须是有效的邮箱格式）
    - **username**: 用户名（3位以上，只能包含字母、数字、下划线和连字符）
    - **password**: 密码（6位以上）
    - **full_name**: 真实姓名（可选）
    """
    try:
        user = user_service.create_user(user_data)
        return user
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=dict, summary="用户登录")
async def login(
    login_data: UserLogin, user_service: UserService = Depends(get_user_service)
):
    """
    用户登录接口

    - **email**: 邮箱地址
    - **password**: 密码

    返回访问令牌和用户信息
    """
    try:
        result = user_service.login_user(login_data)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post("/token", response_model=Token, summary="OAuth2 token端点")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    user_service: UserService = Depends(get_user_service),
):
    """
    OAuth2兼容的token端点，用于支持标准OAuth2客户端
    """
    login_data = UserLogin(email=form_data.username, password=form_data.password)
    try:
        result = user_service.login_user(login_data)
        return Token(**result)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="邮箱或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.get("/me", response_model=UserResponse, summary="获取当前用户信息")
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """
    获取当前登录用户的详细信息
    """
    return UserResponse.from_orm(current_user)


@router.put("/me", response_model=UserResponse, summary="更新当前用户信息")
async def update_current_user_info(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    user_service: UserService = Depends(get_user_service),
):
    """
    更新当前登录用户的信息

    - **username**: 用户名（可选）
    - **full_name**: 真实姓名（可选）
    """
    try:
        updated_user = user_service.update_user(current_user.id, user_data)
        if updated_user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在"
            )
        return updated_user
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/logout", summary="用户登出")
async def logout(current_user: User = Depends(get_current_active_user)):
    """
    用户登出接口

    注意：JWT token是无状态的，实际的token失效需要客户端删除token
    这个接口主要用于记录用户登出行为
    """
    return {"message": f"用户 {current_user.username} 已成功登出"}


@router.get("/check", summary="检查认证状态")
async def check_auth(current_user: User = Depends(get_current_active_user)):
    """
    检查当前用户的认证状态
    """
    return {
        "authenticated": True,
        "user_id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
    }


@router.post("/change-password", summary="修改密码")
async def change_password(
    password_data: PasswordChangeRequest,
    current_user: User = Depends(get_current_active_user),
    user_service: UserService = Depends(get_user_service),
):
    """
    修改当前用户密码

    - **current_password**: 当前密码
    - **new_password**: 新密码（至少6位）
    """
    try:
        success = user_service.change_password(current_user.id, password_data)
        if success:
            return {"message": "密码修改成功"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="密码修改失败"
            )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/statistics", summary="获取用户统计信息")
async def get_user_statistics(
    current_user: User = Depends(get_current_active_user),
    user_service: UserService = Depends(get_user_service),
):
    """
    获取当前用户的统计信息

    包括事件总数、分类统计、加入时间等
    """
    try:
        stats = user_service.get_user_statistics(current_user.id)
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="获取统计信息失败"
        )
