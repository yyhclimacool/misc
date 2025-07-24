#!/usr/bin/env python3
"""
认证功能测试脚本
"""
import requests
import json
import sys

BASE_URL = "http://localhost:8000"


def test_health():
    """测试服务器健康状态"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ 服务器健康检查通过")
            return True
        else:
            print(f"❌ 服务器健康检查失败: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 无法连接到服务器: {e}")
        return False


def test_register():
    """测试用户注册"""
    user_data = {
        "email": "test@example.com",
        "username": "testuser",
        "password": "testpass123",
        "full_name": "测试用户",
    }

    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=user_data)
        if response.status_code == 200:
            print("✅ 用户注册成功")
            print(f"   用户信息: {response.json()}")
            return True
        else:
            print(f"❌ 用户注册失败: {response.status_code}")
            print(f"   错误信息: {response.json()}")
            # 如果是用户已存在的错误，也算正常
            if "已被注册" in response.json().get("detail", ""):
                print("   (用户已存在，继续测试)")
                return True
            return False
    except Exception as e:
        print(f"❌ 注册请求失败: {e}")
        return False


def test_login():
    """测试用户登录"""
    login_data = {"email": "test@example.com", "password": "testpass123"}

    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        if response.status_code == 200:
            result = response.json()
            print("✅ 用户登录成功")
            print(f"   Token类型: {result.get('token_type')}")
            print(f"   用户名: {result.get('user', {}).get('username')}")
            return result.get("access_token")
        else:
            print(f"❌ 用户登录失败: {response.status_code}")
            print(f"   错误信息: {response.json()}")
            return None
    except Exception as e:
        print(f"❌ 登录请求失败: {e}")
        return None


def test_protected_route(token):
    """测试受保护的路由"""
    headers = {"Authorization": f"Bearer {token}"}

    try:
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        if response.status_code == 200:
            user_info = response.json()
            print("✅ 获取用户信息成功")
            print(f"   用户ID: {user_info.get('id')}")
            print(f"   邮箱: {user_info.get('email')}")
            print(f"   用户名: {user_info.get('username')}")
            return True
        else:
            print(f"❌ 获取用户信息失败: {response.status_code}")
            print(f"   错误信息: {response.json()}")
            return False
    except Exception as e:
        print(f"❌ 获取用户信息请求失败: {e}")
        return False


def main():
    """主测试函数"""
    print("🧪 开始测试Grand Things认证功能")
    print("=" * 40)

    # 测试服务器健康状态
    if not test_health():
        print("\n❌ 服务器未正常运行，请先启动服务器")
        sys.exit(1)

    print()

    # 测试用户注册
    if not test_register():
        print("\n❌ 注册测试失败")
        sys.exit(1)

    print()

    # 测试用户登录
    token = test_login()
    if not token:
        print("\n❌ 登录测试失败")
        sys.exit(1)

    print()

    # 测试受保护的路由
    if not test_protected_route(token):
        print("\n❌ 受保护路由测试失败")
        sys.exit(1)

    print()
    print("🎉 所有认证功能测试通过！")
    print("=" * 40)
    print("📝 测试摘要:")
    print("   ✅ 服务器健康检查")
    print("   ✅ 用户注册")
    print("   ✅ 用户登录")
    print("   ✅ 受保护路由访问")
    print()
    print("💡 你现在可以在前端页面测试完整的认证流程了！")


if __name__ == "__main__":
    main()
