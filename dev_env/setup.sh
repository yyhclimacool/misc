#!/bin/bash

# Ubuntu 开发环境初始化脚本
# 作者: Kevin
# 描述: 自动化配置Ubuntu开发环境，包含常用开发工具、库和运行时环境
# 使用方法: bash setup.sh

# 启用严格模式
set -euo pipefail

# 全局变量
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# readonly LOG_FILE="${SCRIPT_DIR}/install_$(date +%Y%m%d_%H%M%S).log"
readonly BACKUP_SUFFIX="$(date "+%Y.%m.%d.%H.%M.%S")"

# 颜色输出定义
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# 日志函数
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")
            echo -e "${GREEN}[INFO]${NC} ${timestamp} - $message"
            ;;
        "WARN")
            echo -e "${YELLOW}[WARN]${NC} ${timestamp} - $message"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} ${timestamp} - $message"
            ;;
        "DEBUG")
            echo -e "${BLUE}[DEBUG]${NC} ${timestamp} - $message"
            ;;
    esac
}

# 错误处理函数
error_exit() {
    log "ERROR" "$1"
    exit 1
}

# 检查是否以root权限运行
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log "WARN" "检测到以root权限运行，某些操作可能需要调整"
    fi
}

# 检查系统版本
check_system() {
    if [[ ! -f /etc/os-release ]]; then
        error_exit "无法检测系统版本"
    fi
    
    local os_name=$(grep '^NAME=' /etc/os-release | cut -d'"' -f2)
    local os_version=$(grep '^VERSION_ID=' /etc/os-release | cut -d'"' -f2)
    
    log "INFO" "检测到系统: $os_name $os_version"
    
    if [[ "$os_name" != "Ubuntu" ]]; then
        log "WARN" "此脚本主要为Ubuntu设计，其他系统可能存在兼容性问题"
    fi
}

# 备份重要文件
backup_files() {
    log "INFO" "备份重要配置文件..."
    
    local files_to_backup=(
        "$HOME/.bashrc"
        "$HOME/.vimrc"
        "$HOME/.gitconfig"
        "/etc/apt/sources.list"
    )
    
    for file in "${files_to_backup[@]}"; do
        if [[ -f "$file" ]]; then
            cp "$file" "${file}.bak.${BACKUP_SUFFIX}"
            log "INFO" "已备份: $file"
        fi
    done
}

# 字符串转义函数
convert_string() {
    local input="$1"
    local escaped
    escaped=$(sed 's/[&/\*[\.]/\\&/g' <<<"$input")
    escaped=$(sed 's/\]/\\]/g' <<<"$escaped")
    echo "$escaped"
}

# 文件内容替换函数
replace_in_file() {
    local old_string="$1"
    local new_string="$2"
    local file="$3"
    
    if [[ ! -f "$file" ]]; then
        log "ERROR" "文件不存在: $file"
        return 1
    fi
    
    local escaped_old
    local escaped_new
    escaped_old=$(convert_string "$old_string")
    escaped_new=$(convert_string "$new_string")
    
    sed -i "s/$escaped_old/$escaped_new/g" "$file"
    log "DEBUG" "已在 $file 中替换: $old_string -> $new_string"
}

# 配置sudo免密
setup_sudo() {
    log "INFO" "配置sudo免密登录..."
    
    local username=$(whoami)
    local sudoers_file="/etc/sudoers.d/$username"
    
    echo "$username ALL=(ALL:ALL) NOPASSWD:ALL" | sudo tee "$sudoers_file" > /dev/null
    sudo chmod 440 "$sudoers_file"
    
    log "INFO" "sudo免密配置完成"
}

# 配置APT源
config_apt() {
    log "INFO" "配置APT软件源..."
    
    # 可选择性启用阿里云镜像源
    read -p "是否配置阿里云镜像源? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log "INFO" "配置阿里云镜像源..."
        sudo cp /etc/apt/sources.list "/etc/apt/sources.list.bak.${BACKUP_SUFFIX}"
        replace_in_file "http://archive.ubuntu.com/ubuntu/" "http://mirrors.aliyun.com/ubuntu/" /etc/apt/sources.list
        replace_in_file "http://security.ubuntu.com/ubuntu/" "http://mirrors.aliyun.com/ubuntu/" /etc/apt/sources.list
    fi
    
    log "INFO" "更新软件包列表..."
    sudo apt-get update -yq || error_exit "APT更新失败"
    
    log "INFO" "安装基础软件包..."
    sudo apt-get install -yq software-properties-common apt-utils || error_exit "基础软件包安装失败"
    
    log "INFO" "升级系统软件包..."
    sudo apt-get upgrade -yq || error_exit "系统升级失败"
}

# 安装基础开发工具
install_basic_tools() {
    log "INFO" "安装基础开发工具..."
    
    local basic_packages=(
        # 编译工具
        "build-essential"
        "automake"
        "libtool"
        "make"
        "cmake"
        "ninja-build"
        "pkg-config"
        
        # 编程语言和编译器
        "gcc"
        "g++"
        "clang"
        "gdb"
        "valgrind"
        "bison"
        "flex"
        "texinfo"
        
        # 网络和系统工具
        "curl"
        "wget"
        "net-tools"
        "tree"
        "htop"
        "iotop"
        "iftop"
        "ncdu"
        "pciutils"
        "lshw"
        
        # 压缩和文件工具
        "zip"
        "unzip"
        "p7zip-full"
        "rsync"
        
        # 版本控制
        "git"
        
        # 编辑器
        "vim"
        
        # 搜索工具
        "ripgrep"
        "fd-find"
        "silversearcher-ag"
        
        # 其他实用工具
        "jq"
        "yq"
        "parallel"
        "tmux"
        "screen"
        "ssh"
        "sshfs"
    )
    
    for package in "${basic_packages[@]}"; do
        log "DEBUG" "安装: $package"
        sudo apt-get install -yq "$package" || log "WARN" "安装失败: $package"
    done
    
    log "INFO" "基础开发工具安装完成"
}

# 安装开发库
install_dev_libraries() {
    log "INFO" "安装开发库..."
    
    local dev_libraries=(
        # C/C++ 库
        "libbenchmark-dev"
        "libgmock-dev"
        "libgtest-dev"
        "libboost-all-dev"
        "libevent-dev"
        "libssl-dev"
        "libcurl4-openssl-dev"
        "libxml2-dev"
        "libxslt1-dev"
        "libyaml-dev"
        "libreadline-dev"
        "libffi-dev"
        "libbz2-dev"
        "liblzma-dev"
        "libsqlite3-dev"
        
        # 性能分析和日志
        "libgoogle-glog-dev"
        "libgoogle-perftools-dev"
        "google-perftools"
        "libunwind8-dev"
        
        # 数据库和存储
        "libleveldb-dev"
        "libsnappy-dev"
        "librocksdb-dev"
        "redis-tools"
        
        # 网络和通信
        "libc-ares-dev"
        "libprotobuf-dev"
        "protobuf-compiler"
        "librdkafka-dev"
        "libzmq3-dev"
        
        # Apache相关
        "libapr1-dev"
        "libaprutil1-dev"
        
        # 图形化工具
        "graphviz"
        "imagemagick"
    )
    
    for library in "${dev_libraries[@]}"; do
        log "DEBUG" "安装: $library"
        sudo apt-get install -yq "$library" || log "WARN" "安装失败: $library"
    done
    
    log "INFO" "开发库安装完成"
}

# 安装Java开发环境
install_java() {
    log "INFO" "安装Java开发环境..."
    
    sudo apt-get install -yq default-jdk default-jre maven gradle || log "WARN" "Java环境安装失败"
    
    # 设置JAVA_HOME
    local java_home=$(dirname $(dirname $(readlink -f $(which java))))
    echo "export JAVA_HOME=$java_home" >> ~/.bashrc
    echo "export PATH=\$JAVA_HOME/bin:\$PATH" >> ~/.bashrc
    
    log "INFO" "Java开发环境安装完成"
}

# 安装Go语言
install_go() {
    log "INFO" "安装Go语言..."
    
    # 检查是否已安装Go
    if command -v go &> /dev/null; then
        local go_version=$(go version | awk '{print $3}')
        log "INFO" "Go已安装: $go_version"
        return 0
    fi
    
    # 从官方PPA安装最新版本
    sudo add-apt-repository ppa:longsleep/golang-backports -y
    sudo apt-get update -yq
    sudo apt-get install -yq golang-go
    
    # 配置Go环境变量
    echo "export GOPATH=\$HOME/go" >> ~/.bashrc
    echo "export GOBIN=\$GOPATH/bin" >> ~/.bashrc
    echo "export PATH=\$GOBIN:\$PATH" >> ~/.bashrc
    
    # 创建Go工作目录
    mkdir -p "$HOME/go/{bin,src,pkg}"
    
    log "INFO" "Go语言安装完成"
}

# 安装Node.js和npm
install_nodejs() {
    log "INFO" "安装Node.js和npm..."
    
    # 安装Node.js LTS版本
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    sudo apt-get install -yq nodejs
    
    # 安装常用的全局npm包
    local npm_packages=(
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
    )
    
    for package in "${npm_packages[@]}"; do
        npm install -g "$package" || log "WARN" "npm包安装失败: $package"
    done
    
    log "INFO" "Node.js和npm安装完成"
}

# 安装Python环境
install_python() {
    log "INFO" "安装Python开发环境..."
    
    # 安装Python和相关工具
    sudo apt-get install -yq python3 python3-pip python3-venv python3-dev
    
    # 安装常用Python包
    local python_packages=(
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
    )
    
    for package in "${python_packages[@]}"; do
        pip3 install --user "$package" || log "WARN" "Python包安装失败: $package"
    done
    
    log "INFO" "Python开发环境安装完成"
}

# 安装Rust
install_rust() {
    log "INFO" "安装Rust..."
    
    if command -v rustc &> /dev/null; then
        local rust_version=$(rustc --version)
        log "INFO" "Rust已安装: $rust_version"
        return 0
    fi
    
    # 使用rustup安装Rust
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source ~/.cargo/env
    
    # 安装常用组件
    rustup component add rustfmt clippy
    
    log "INFO" "Rust安装完成"
}

# 安装Conda
install_conda() {
    log "INFO" "安装Miniconda..."
    
    if command -v conda &> /dev/null; then
        log "INFO" "Conda已安装"
        return 0
    fi
    
    local conda_installer="Miniconda3-latest-Linux-x86_64.sh"
    
    wget "https://repo.anaconda.com/miniconda/$conda_installer" -O "/tmp/$conda_installer"
    bash "/tmp/$conda_installer" -bfu
    rm -f "/tmp/$conda_installer"
    
    # 初始化conda
    ~/miniconda3/bin/conda init bash
    
    log "INFO" "Miniconda安装完成"
}

# 安装Docker
install_docker() {
    log "INFO" "安装Docker..."
    
    if command -v docker &> /dev/null; then
        log "INFO" "Docker已安装"
        return 0
    fi
    
    # 安装Docker官方GPG密钥
    sudo apt-get update
    sudo apt-get install -yq ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    
    # 添加Docker仓库
    echo \
        "deb [arch=\"$(dpkg --print-architecture)\" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
        $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
        sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    sudo apt-get update
    sudo apt-get install -yq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # 将用户添加到docker组
    sudo usermod -aG docker "$USER"
    
    # 安装docker-compose（如果不存在）
    if ! command -v docker-compose &> /dev/null; then
        sudo pip3 install docker-compose
    fi
    
    log "INFO" "Docker安装完成，请重新登录以使用Docker"
}

# 安装数据库
install_databases() {
    log "INFO" "安装数据库..."
    
    read -p "是否安装数据库? (MySQL/PostgreSQL/MongoDB) (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        return 0
    fi
    
    # MySQL
    sudo apt-get install -yq mysql-server mysql-client libmysqlclient-dev
    
    # PostgreSQL
    sudo apt-get install -yq postgresql postgresql-contrib libpq-dev
    
    # MongoDB
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
    sudo apt-get update
    sudo apt-get install -yq mongodb-org
    
    # Redis
    sudo apt-get install -yq redis-server
    
    log "INFO" "数据库安装完成"
}

# 配置Vim
configure_vim() {
    log "INFO" "配置Vim..."
    
    if [[ -f "$SCRIPT_DIR/vimrc" ]]; then
        cp "$SCRIPT_DIR/vimrc" ~/.vimrc
        log "INFO" "Vim配置文件已复制"
    else
        # 创建基础的vimrc配置
        cat > ~/.vimrc << 'EOF'
" 基础配置
set number
set relativenumber
set tabstop=4
set shiftwidth=4
set expandtab
set autoindent
set smartindent
set hlsearch
set incsearch
set ignorecase
set smartcase
set showmatch
set ruler
set wildmenu
set laststatus=2
set encoding=utf-8
set fileencoding=utf-8
set fileencodings=utf-8,gbk,gb2312
set termencoding=utf-8

" 语法高亮
syntax on
filetype plugin indent on

" 颜色主题
colorscheme desert

" 状态栏
set statusline=%F%m%r%h%w\ [FORMAT=%{&ff}]\ [TYPE=%Y]\ [POS=%l,%v][%p%%]\ %{strftime(\"%d/%m/%y\ -\ %H:%M\")}
EOF
        log "INFO" "已创建基础Vim配置"
    fi
}

# 配置Git
configure_git() {
    log "INFO" "配置Git..."
    
    read -p "请输入Git用户名: " git_username
    read -p "请输入Git邮箱: " git_email
    
    if [[ -n "$git_username" && -n "$git_email" ]]; then
        git config --global user.name "$git_username"
        git config --global user.email "$git_email"
        git config --global init.defaultBranch main
        git config --global core.editor vim
        git config --global pull.rebase false
        
        log "INFO" "Git配置完成"
    else
        log "WARN" "Git配置跳过"
    fi
}

# 配置SSH
configure_ssh() {
    log "INFO" "配置SSH..."
    
    if [[ ! -f ~/.ssh/id_rsa ]]; then
        read -p "是否生成SSH密钥? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            ssh-keygen -t rsa -b 4096 -C "$(whoami)@$(hostname)" -f ~/.ssh/id_rsa -N ""
            log "INFO" "SSH密钥已生成"
            log "INFO" "公钥内容:"
            cat ~/.ssh/id_rsa.pub
        fi
    else
        log "INFO" "SSH密钥已存在"
    fi
}

# 安装额外工具
install_additional_tools() {
    log "INFO" "安装额外开发工具..."
    
    # 安装Snap包
    local snap_packages=(
        "code --classic"
        "postman"
        "discord"
        "slack --classic"
    )
    
    for package in "${snap_packages[@]}"; do
        sudo snap install "$package" || log "WARN" "Snap包安装失败: $package"
    done
    
    # 安装AppImage工具
    if ! command -v appimaged &> /dev/null; then
        wget https://github.com/AppImage/appimaged/releases/download/continuous/appimaged-x86_64.AppImage
        chmod +x appimaged-x86_64.AppImage
        sudo mv appimaged-x86_64.AppImage /usr/local/bin/appimaged
    fi
    
    log "INFO" "额外工具安装完成"
}

# 清理系统
cleanup_system() {
    log "INFO" "清理系统..."
    
    sudo apt-get autoremove -yq
    sudo apt-get autoclean -yq
    
    # 清理临时文件
    sudo rm -rf /tmp/*
    
    log "INFO" "系统清理完成"
}

# 生成安装报告
generate_report() {
    log "INFO" "生成安装报告..."
    
    local report_file="${SCRIPT_DIR}/install_report_$(date +%Y%m%d_%H%M%S).txt"
    
    cat > "$report_file" << EOF
Ubuntu开发环境安装报告
===================

安装时间: $(date)
系统信息: $(uname -a)
用户: $(whoami)

已安装的主要工具:
EOF
    
    # 检查各种工具的安装状态
    local tools=(
        "gcc --version"
        "python3 --version"
        "node --version"
        "go version"
        "rustc --version"
        "docker --version"
        "git --version"
        "vim --version | head -1"
    )
    
    for tool in "${tools[@]}"; do
        if eval "$tool" &> /dev/null; then
            echo "✓ $tool" >> "$report_file"
        else
            echo "✗ $tool" >> "$report_file"
        fi
    done
    
    echo "" >> "$report_file"
    echo "详细日志: $LOG_FILE" >> "$report_file"
    
    log "INFO" "安装报告已生成: $report_file"
}

# 主函数
main() {
    log "INFO" "开始Ubuntu开发环境初始化..."
    # log "INFO" "日志文件: $LOG_FILE"
    
    # 检查系统
    check_root
    check_system
    
    # 备份文件
    backup_files
    
    # 询问用户要安装的组件
    echo "请选择要安装的组件 (输入y确认，直接回车跳过):"
    
    read -p "1. 配置sudo免密? (y/N): " -n 1 -r; echo
    [[ $REPLY =~ ^[Yy]$ ]] && setup_sudo
    
    read -p "2. 配置APT源? (y/N): " -n 1 -r; echo
    [[ $REPLY =~ ^[Yy]$ ]] && config_apt
    
    read -p "3. 安装基础开发工具? (y/N): " -n 1 -r; echo
    [[ $REPLY =~ ^[Yy]$ ]] && install_basic_tools
    
    read -p "4. 安装开发库? (y/N): " -n 1 -r; echo
    [[ $REPLY =~ ^[Yy]$ ]] && install_dev_libraries
    
    read -p "5. 安装Java? (y/N): " -n 1 -r; echo
    [[ $REPLY =~ ^[Yy]$ ]] && install_java
    
    read -p "6. 安装Go? (y/N): " -n 1 -r; echo
    [[ $REPLY =~ ^[Yy]$ ]] && install_go
    
    read -p "7. 安装Node.js? (y/N): " -n 1 -r; echo
    [[ $REPLY =~ ^[Yy]$ ]] && install_nodejs
    
    read -p "8. 安装Python环境? (y/N): " -n 1 -r; echo
    [[ $REPLY =~ ^[Yy]$ ]] && install_python
    
    read -p "9. 安装Rust? (y/N): " -n 1 -r; echo
    [[ $REPLY =~ ^[Yy]$ ]] && install_rust
    
    read -p "10. 安装Conda? (y/N): " -n 1 -r; echo
    [[ $REPLY =~ ^[Yy]$ ]] && install_conda
    
    read -p "11. 安装Docker? (y/N): " -n 1 -r; echo
    [[ $REPLY =~ ^[Yy]$ ]] && install_docker
    
    read -p "12. 安装数据库? (y/N): " -n 1 -r; echo
    [[ $REPLY =~ ^[Yy]$ ]] && install_databases
    
    read -p "13. 配置Vim? (y/N): " -n 1 -r; echo
    [[ $REPLY =~ ^[Yy]$ ]] && configure_vim
    
    read -p "14. 配置Git? (y/N): " -n 1 -r; echo
    [[ $REPLY =~ ^[Yy]$ ]] && configure_git
    
    read -p "15. 配置SSH? (y/N): " -n 1 -r; echo
    [[ $REPLY =~ ^[Yy]$ ]] && configure_ssh
    
    read -p "16. 安装额外工具? (y/N): " -n 1 -r; echo
    [[ $REPLY =~ ^[Yy]$ ]] && install_additional_tools
    
    # 清理系统
    cleanup_system
    
    # 生成报告
    generate_report
    
    log "INFO" "Ubuntu开发环境初始化完成!"
    log "INFO" "建议重新登录或执行 'source ~/.bashrc' 以使环境变量生效"
    
    # 如果安装了Docker，提醒用户重新登录
    if command -v docker &> /dev/null; then
        log "WARN" "由于安装了Docker，建议重新登录系统以使docker组权限生效"
    fi
}

# 脚本入口点
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
