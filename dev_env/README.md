# Ubuntu 开发环境初始化脚本

这是一个功能完整的Ubuntu开发环境自动化配置脚本，帮助快速搭建现代化的开发环境。

## 功能特性

### 🔧 核心功能

- **自动化安装**: 一键安装常用开发工具和库
- **模块化设计**: 可选择性安装不同组件
- **安全备份**: 自动备份重要配置文件
- **详细日志**: 完整的安装过程记录
- **错误处理**: 智能错误处理和恢复机制

### 📦 支持的开发环境

- **编程语言**: Python, Node.js, Go, Rust, Java
- **容器化**: Docker, Docker Compose
- **数据库**: MySQL, PostgreSQL, MongoDB, Redis
- **版本控制**: Git 完整配置
- **编辑器**: Vim 高级配置
- **包管理**: Conda, npm, pip, cargo

### 🛠️ 开发工具

- **编译工具**: GCC, Clang, CMake, Make
- **调试工具**: GDB, Valgrind
- **性能分析**: Google Perftools, Benchmark
- **搜索工具**: ripgrep, fd-find, ag
- **系统监控**: htop, iotop, iftop, ncdu

## 使用方法

### 基础使用

```bash
# 1. 下载脚本
git clone <repository_url>
cd dev_env

# 2. 给脚本执行权限
chmod +x init_ubuntu_improved.sh

# 3. 运行脚本
./init_ubuntu_improved.sh
```

### 自定义安装

脚本支持交互式选择要安装的组件：

- 按照提示选择需要的功能模块
- 输入 `y` 确认安装，直接回车跳过
- 某些组件会要求额外的配置信息

### 无人值守安装

如果需要无人值守安装所有组件，可以修改脚本的交互部分。

## 脚本结构

```
init_ubuntu_improved.sh
├── 系统检查和备份
├── APT源配置
├── 基础工具安装
├── 开发环境安装
│   ├── Python环境
│   ├── Node.js环境  
│   ├── Go语言
│   ├── Rust语言
│   ├── Java环境
│   └── Conda环境
├── 容器化工具
├── 数据库安装
├── 配置文件设置
│   ├── Vim配置
│   ├── Git配置
│   └── SSH配置
└── 系统清理和报告

```

## 安全特性

- **备份机制**: 自动备份重要配置文件
- **权限检查**: 检测运行权限和系统兼容性
- **错误处理**: 完善的错误处理和日志记录
- **选择性安装**: 避免不必要的软件安装

## 支持的系统

- Ubuntu 18.04 LTS 及以上版本
- 其他Debian系Linux发行版（可能需要微调）

## 日志和报告

脚本会自动生成：

- **安装日志**: `install_YYYYMMDD_HHMMSS.log`
- **安装报告**: `install_report_YYYYMMDD_HHMMSS.txt`
- **配置备份**: 原有配置文件的备份

## 注意事项

1. **网络连接**: 确保良好的网络连接，某些下载可能需要时间
2. **磁盘空间**: 预留足够的磁盘空间（建议至少5GB）
3. **系统更新**: 建议在全新系统或更新后运行
4. **重新登录**: 安装完成后建议重新登录以使环境变量生效

## 故障排除

### 常见问题

**Q: APT更新失败**

```bash
# 手动修复软件源
sudo apt-get update --fix-missing
sudo dpkg --configure -a
```

**Q: Docker权限问题**

```bash
# 重新登录或手动刷新组权限
newgrp docker
```

**Q: 某个包安装失败**

- 查看日志文件了解具体错误
- 可以手动安装失败的包
- 某些包可能需要特定的系统版本

### 获取帮助

如遇到问题，请：

1. 查看生成的日志文件
2. 检查网络连接和磁盘空间
3. 确认系统版本兼容性

## 自定义扩展

脚本采用模块化设计，可以轻松添加新的安装函数：

```bash
# 添加新的安装函数
install_your_tool() {
    log "INFO" "安装您的工具..."
    
    # 安装逻辑
    sudo apt-get install -yq your-package
    
    log "INFO" "您的工具安装完成"
}

# 在main函数中添加选项
read -p "安装您的工具? (y/N): " -n 1 -r; echo
[[ $REPLY =~ ^[Yy]$ ]] && install_your_tool
```

## 版本历史

- **v2.0**: 完全重写，添加模块化设计和错误处理
- **v1.0**: 基础版本，简单的包安装脚本

---

**注意**: 此脚本会修改系统配置，建议在测试环境中先试用。
