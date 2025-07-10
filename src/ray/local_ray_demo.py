#!/usr/bin/env python3
"""
Ray 本地集群演示程序
解决连接问题的完整示例
"""

import ray
import time
import numpy as np

def main():
    print("=== Ray 本地集群演示 ===")
    
    # 检查Ray是否已经初始化
    if ray.is_initialized():
        print("Ray已经初始化，先关闭...")
        ray.shutdown()
    
    # 初始化本地Ray集群
    print("正在初始化本地Ray集群...")
    try:
        ray.init(
            num_cpus=4,  # 指定CPU核心数
            object_store_memory=1000000000,  # 1GB对象存储
            include_dashboard=True,  # 启用Dashboard
            dashboard_port=8265  # Dashboard端口
        )
        print("✅ Ray集群初始化成功!")
        
        # 显示集群信息
        print(f"可用资源: {ray.available_resources()}")
        print(f"集群资源: {ray.cluster_resources()}")
        print(f"节点数量: {len(ray.nodes())}")
        print("Ray Dashboard: http://localhost:8265")
        
    except Exception as e:
        print(f"❌ Ray初始化失败: {e}")
        return
    
    # 定义远程函数
    @ray.remote
    def compute_square(x):
        """计算平方"""
        time.sleep(0.1)  # 模拟计算时间
        return x * x
    
    @ray.remote
    def compute_pi_chunk(n_samples):
        """计算π的一部分（蒙特卡洛方法）"""
        import random
        count = 0
        for _ in range(n_samples):
            x, y = random.random(), random.random()
            if x*x + y*y <= 1:
                count += 1
        return 4.0 * count / n_samples
    
    # 演示1：并行计算平方
    print("\n=== 演示1：并行计算平方 ===")
    numbers = list(range(1, 11))
    start_time = time.time()
    
    # 创建远程任务
    futures = [compute_square.remote(x) for x in numbers]
    # 获取结果
    results = ray.get(futures)
    
    elapsed_time = time.time() - start_time
    print(f"输入: {numbers}")
    print(f"结果: {results}")
    print(f"并行计算时间: {elapsed_time:.3f}秒")
    
    # 演示2：计算π
    print("\n=== 演示2：并行计算π ===")
    n_tasks = 4
    samples_per_task = 1000000
    
    start_time = time.time()
    # 创建远程任务
    pi_futures = [compute_pi_chunk.remote(samples_per_task) for _ in range(n_tasks)]
    # 获取结果
    pi_results = ray.get(pi_futures)
    pi_estimate = sum(pi_results) / len(pi_results)
    elapsed_time = time.time() - start_time
    
    print(f"各任务的π估算: {[f'{x:.6f}' for x in pi_results]}")
    print(f"最终π估算: {pi_estimate:.6f}")
    print(f"真实π值: {np.pi:.6f}")
    print(f"误差: {abs(pi_estimate - np.pi):.6f}")
    print(f"计算时间: {elapsed_time:.3f}秒")
    
    # 演示3：Ray Actor
    print("\n=== 演示3：Ray Actor ===")
    
    @ray.remote
    class Counter:
        def __init__(self, initial_value=0):
            self.value = initial_value
        
        def increment(self, delta=1):
            self.value += delta
            return self.value
        
        def get_value(self):
            return self.value
    
    # 创建多个计数器Actor
    counters = [Counter.remote(i*10) for i in range(3)]
    
    # 并行操作
    increment_futures = [counter.increment.remote(5) for counter in counters]
    increment_results = ray.get(increment_futures)
    print(f"增量后的值: {increment_results}")
    
    # 获取最终值
    final_futures = [counter.get_value.remote() for counter in counters]
    final_results = ray.get(final_futures)
    print(f"最终值: {final_results}")
    
    print("\n=== 演示完成 ===")
    print("程序将在5秒后关闭Ray集群...")
    time.sleep(5)
    
    # 清理资源
    ray.shutdown()
    print("✅ Ray集群已关闭")

if __name__ == "__main__":
    main() 