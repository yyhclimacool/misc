# Ray 分布式计算示例

这个项目演示了如何使用 Ray 创建分布式计算环境和程序。

## 功能特性

### 1. 远程函数 (Remote Functions)
- 并行计算 π（蒙特卡洛方法）
- 并行矩阵运算
- 分布式数据处理

### 2. Actor 模式
- 分布式计数器
- 任务处理器
- 状态管理

### 3. 数据处理管道
- 大数据集分块处理
- 多步骤处理流水线
- 结果聚合

## 安装依赖

### 方法 1：使用 pip 安装
```bash
pip install ray[default] numpy psutil
```

### 方法 2：使用 requirements.txt
```bash
cd src/ray
pip install -r requirements.txt
```

## 运行程序

### 简化版本（推荐）
```bash
cd src/ray
python simple_ray_demo.py
```

### 完整版本
```bash
cd src/ray
python ray_main.py
```

## 程序结构

### 文件说明

1. **`simple_ray_demo.py`** - 简化的演示程序
   - 基本的远程函数演示
   - Actor 使用示例
   - 数据处理管道

2. **`ray_main.py`** - 完整的演示程序
   - 高级功能演示
   - 性能测试
   - 集群管理

3. **`requirements.txt`** - 依赖包列表

## 示例输出

运行程序后，你会看到类似以下的输出：

```
2024-01-15 10:30:00,123 - INFO - Starting Ray Distributed Computing Demo
2024-01-15 10:30:01,456 - INFO - Ray initialized successfully
2024-01-15 10:30:01,457 - INFO - Ray cluster resources: {'CPU': 8.0, 'memory': 17179869184, 'object_store_memory': 8589934592, 'node:127.0.0.1': 1.0}

=== Basic Remote Functions Demo ===
2024-01-15 10:30:01,500 - INFO - 1. Parallel square computation...
2024-01-15 10:30:01,600 - INFO - Input numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
2024-01-15 10:30:01,601 - INFO - Squared results: [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]

2024-01-15 10:30:01,602 - INFO - 2. Computing π using Monte Carlo method...
2024-01-15 10:30:02,123 - INFO - π estimates from each task: [3.14156, 3.14204, 3.14088, 3.14276]
2024-01-15 10:30:02,124 - INFO - Final π estimate: 3.141810
2024-01-15 10:30:02,125 - INFO - Computation time: 0.52s
```

## Ray 核心概念

### 1. 远程函数 (@ray.remote)
```python
@ray.remote
def my_function(x):
    return x * 2

# 异步调用
future = my_function.remote(5)
result = ray.get(future)  # 获取结果
```

### 2. Actor 类 (@ray.remote class)
```python
@ray.remote
class MyActor:
    def __init__(self):
        self.value = 0
    
    def increment(self):
        self.value += 1
        return self.value

# 创建和使用 Actor
actor = MyActor.remote()
result = ray.get(actor.increment.remote())
```

### 3. 分布式对象存储
- Ray 自动管理对象存储
- 大对象自动分片
- 智能缓存和垃圾回收

## 性能优化建议

### 1. 任务粒度
- 避免过小的任务（开销大于计算）
- 避免过大的任务（负载不均衡）
- 推荐任务执行时间：0.1-10 秒

### 2. 数据传输
- 最小化数据传输
- 使用 ray.put() 存储大对象
- 尽量在 Worker 节点就地处理数据

### 3. 内存管理
- 合理设置 object_store_memory
- 及时释放不需要的对象
- 避免内存泄漏

## 扩展到多机集群

### 启动 Ray 集群

1. **在头节点启动**：
```bash
ray start --head --port=6379
```

2. **在工作节点连接**：
```bash
ray start --address='头节点IP:6379'
```

3. **在程序中连接集群**：
```python
ray.init(address='ray://头节点IP:10001')
```

### 集群监控
- Ray Dashboard: http://头节点IP:8265
- 查看节点状态、任务执行、资源使用

## 故障排除

### 常见问题

1. **安装问题**
   ```bash
   # 如果安装 ray 失败，尝试：
   pip install -U pip setuptools wheel
   pip install ray[default]
   ```

2. **内存不足**
   ```python
   # 减少 object_store_memory
   ray.init(object_store_memory=1000000000)  # 1GB
   ```

3. **端口被占用**
   ```python
   # 指定不同的端口
   ray.init(ray_client_server_port=10002)
   ```

## 更多资源

- [Ray 官方文档](https://docs.ray.io/)
- [Ray 教程](https://docs.ray.io/en/latest/ray-overview/getting-started.html)
- [Ray 最佳实践](https://docs.ray.io/en/latest/ray-core/best-practices.html) 