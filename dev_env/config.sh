#!/bin/bash

# Ubuntu开发环境配置文件
# 此文件包含了脚本的默认配置和用户可自定义的选项

# ==================== 镜像源配置 ====================

# 是否启用阿里云镜像源 (true/false)
USE_ALIYUN_MIRROR=false

# 阿里云镜像源地址
ALIYUN_MIRROR="http://mirrors.aliyun.com/ubuntu/"

# 其他可选镜像源
# TUNA_MIRROR="https://mirrors.tuna.tsinghua.edu.cn/ubuntu/"
# USTC_MIRROR="https://mirrors.ustc.edu.cn/ubuntu/"

# ==================== 安装选项配置 ====================

# 自动安装模式 - 设置为true将跳过交互式选择
AUTO_INSTALL=false

# 如果启用自动安装，以下选项控制要安装的组件
AUTO_INSTALL_SUDO=true
AUTO_INSTALL_APT=true
AUTO_INSTALL_BASIC_TOOLS=true
AUTO_INSTALL_DEV_LIBRARIES=true
AUTO_INSTALL_JAVA=false
AUTO_INSTALL_GO=true
AUTO_INSTALL_NODEJS=true
AUTO_INSTALL_PYTHON=true
AUTO_INSTALL_RUST=false
AUTO_INSTALL_CONDA=false
AUTO_INSTALL_DOCKER=true
AUTO_INSTALL_DATABASES=false
AUTO_INSTALL_VIM_CONFIG=true
AUTO_INSTALL_GIT_CONFIG=true
AUTO_INSTALL_SSH_CONFIG=true
AUTO_INSTALL_ADDITIONAL_TOOLS=false

# ==================== Git配置 ====================

# 默认Git配置（如果在自动模式下使用）
DEFAULT_GIT_USERNAME=""
DEFAULT_GIT_EMAIL=""

# ==================== Python配置 ====================

# Python包索引源
PYTHON_INDEX_URL="https://pypi.org/simple/"
# 阿里云PyPI镜像（国内用户可启用）
# PYTHON_INDEX_URL="https://mirrors.aliyun.com/pypi/simple/"

# 要安装的Python包列表
PYTHON_PACKAGES=(
    "virtualenv"
    "virtualenvwrapper"
    "pipenv"
    "poetry"
    "black"
    "flake8"
    "mypy"
    "pytest"
    "jupyter"
    "ipython"
    "requests"
    "numpy"
    "pandas"
    "matplotlib"
    "seaborn"
    "flask"
    "django"
    "fastapi"
)

# ==================== Node.js配置 ====================

# npm镜像源配置
NPM_REGISTRY="https://registry.npmjs.org/"
# 淘宝npm镜像（国内用户可启用）
# NPM_REGISTRY="https://registry.npmmirror.com/"

# 要安装的全局npm包
NPM_PACKAGES=(
    "yarn"
    "pnpm"
    "typescript"
    "ts-node"
    "@types/node"
    "eslint"
    "prettier"
    "nodemon"
    "pm2"
    "http-server"
    "json-server"
    "create-react-app"
    "vue-cli"
    "@angular/cli"
)

# ==================== Go配置 ====================

# Go模块代理
GO_PROXY="https://proxy.golang.org,direct"
# 国内用户可使用七牛云代理
# GO_PROXY="https://goproxy.cn,direct"

# Go环境变量
GO_PATH="$HOME/go"
GO_BIN="$GO_PATH/bin"

# ==================== Docker配置 ====================

# Docker镜像源配置
DOCKER_REGISTRY_MIRRORS=(
    "https://registry.docker-cn.com"
    "https://docker.mirrors.ustc.edu.cn"
)

# ==================== 系统配置 ====================

# 日志级别 (DEBUG, INFO, WARN, ERROR)
LOG_LEVEL="INFO"

# 备份保留天数
BACKUP_RETENTION_DAYS=30

# 临时文件目录
TEMP_DIR="/tmp/ubuntu_dev_setup"

# 下载超时时间（秒）
DOWNLOAD_TIMEOUT=300

# ==================== 自定义包列表 ====================

# 额外的APT包（用户自定义）
CUSTOM_APT_PACKAGES=(
    # "package1"
    # "package2"
)

# 额外的Snap包
CUSTOM_SNAP_PACKAGES=(
    # "package1"
    # "package2 --classic"
)

# ==================== 功能开关 ====================

# 是否创建开发目录结构
CREATE_DEV_DIRECTORIES=true

# 开发目录列表
DEV_DIRECTORIES=(
    "$HOME/workspace"
    "$HOME/projects"
    "$HOME/tools"
    "$HOME/.local/bin"
)

# 是否配置shell别名
CONFIGURE_ALIASES=true

# 是否安装字体
INSTALL_FONTS=false

# 字体列表
FONTS=(
    "fonts-firacode"
    "fonts-jetbrains-mono"
    "fonts-hack"
)

# ==================== 安全配置 ====================

# 是否启用防火墙配置
CONFIGURE_FIREWALL=false

# 是否配置SSH强化
HARDEN_SSH=false

# SSH端口（如果启用SSH强化）
SSH_PORT=22

# ==================== 性能优化 ====================

# 是否启用并行下载
PARALLEL_DOWNLOADS=true

# 最大并行数
MAX_PARALLEL_JOBS=4

# 是否启用编译优化
ENABLE_COMPILE_OPTIMIZATION=true

# 编译线程数（0表示自动检测）
COMPILE_JOBS=0

# ==================== 版本控制 ====================

# 特定版本的软件包（留空使用默认版本）
NODE_VERSION=""  # 例如: "18.x"
PYTHON_VERSION=""  # 例如: "3.10"
GO_VERSION=""     # 例如: "1.21"

# ==================== 环境变量 ====================

# 自定义环境变量
CUSTOM_ENV_VARS=(
    # "VARIABLE_NAME=value"
    # "ANOTHER_VAR=another_value"
)

# ==================== 函数定义 ====================

# 加载配置文件的函数
load_config() {
    local config_file="$1"
    if [[ -f "$config_file" ]]; then
        source "$config_file"
        echo "已加载配置文件: $config_file"
    fi
}

# 验证配置的函数
validate_config() {
    # 检查必要的变量是否设置
    if [[ -z "$TEMP_DIR" ]]; then
        echo "错误: TEMP_DIR 未设置"
        return 1
    fi
    
    # 创建临时目录
    mkdir -p "$TEMP_DIR"
    
    return 0
}

# 显示配置摘要的函数
show_config_summary() {
    echo "==================== 配置摘要 ===================="
    echo "镜像源: $([ "$USE_ALIYUN_MIRROR" = true ] && echo "阿里云" || echo "官方")"
    echo "自动安装: $([ "$AUTO_INSTALL" = true ] && echo "启用" || echo "交互式")"
    echo "日志级别: $LOG_LEVEL"
    echo "临时目录: $TEMP_DIR"
    echo "================================================="
}

# ==================== 导出变量 ====================

# 将重要变量导出为环境变量
export TEMP_DIR
export LOG_LEVEL
export DOWNLOAD_TIMEOUT
