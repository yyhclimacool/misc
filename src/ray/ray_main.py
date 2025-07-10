#!/usr/bin/env python3
"""
Ray 分布式计算示例程序
演示 Ray 的基本功能：远程函数、Actor、分布式数据处理等
"""

import ray
import time
import numpy as np
import logging
from typing import List, Dict, Any
import psutil
import os

# 配置日志
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@ray.remote
def compute_pi_chunk(n_samples: int) -> float:
    """
    远程函数：使用蒙特卡洛方法计算 π 的一部分
    """
    import random

    count = 0
    for _ in range(n_samples):
        x, y = random.random(), random.random()
        if x * x + y * y <= 1:
            count += 1
    return 4.0 * count / n_samples


@ray.remote
def matrix_multiply(A: np.ndarray, B: np.ndarray) -> np.ndarray:
    """
    远程函数：矩阵乘法
    """
    logger.info(
        f"Computing matrix multiplication on worker {ray.get_runtime_context().get_worker_id()}"
    )
    return np.dot(A, B)


@ray.remote
def process_data_chunk(data: List[float], operation: str = "sum") -> float:
    """
    远程函数：处理数据块
    """
    if operation == "sum":
        return sum(data)
    elif operation == "mean":
        return sum(data) / len(data)
    elif operation == "max":
        return max(data)
    elif operation == "min":
        return min(data)
    else:
        raise ValueError(f"Unknown operation: {operation}")


@ray.remote
class DistributedCounter:
    """
    Ray Actor：分布式计数器
    """

    def __init__(self, initial_value: int = 0):
        self.value = initial_value
        self.worker_id = ray.get_runtime_context().get_worker_id()
        logger.info(f"Counter initialized on worker {self.worker_id}")

    def increment(self, delta: int = 1) -> int:
        self.value += delta
        return self.value

    def decrement(self, delta: int = 1) -> int:
        self.value -= delta
        return self.value

    def get_value(self) -> int:
        return self.value

    def reset(self) -> int:
        self.value = 0
        return self.value

    def get_worker_info(self) -> Dict[str, Any]:
        return {
            "worker_id": self.worker_id,
            "current_value": self.value,
            "pid": os.getpid(),
        }


@ray.remote
class DataProcessor:
    """
    Ray Actor：数据处理器
    """

    def __init__(self, processor_id: str):
        self.processor_id = processor_id
        self.processed_count = 0
        self.results = []
        logger.info(f"DataProcessor {processor_id} initialized")

    def process_batch(self, data_batch: List[float]) -> Dict[str, Any]:
        """处理一批数据"""
        start_time = time.time()

        # 模拟数据处理
        processed_data = [x * 2 + 1 for x in data_batch]
        result = {
            "processor_id": self.processor_id,
            "batch_size": len(data_batch),
            "sum": sum(processed_data),
            "mean": sum(processed_data) / len(processed_data),
            "processing_time": time.time() - start_time,
        }

        self.processed_count += len(data_batch)
        self.results.append(result)

        return result

    def get_stats(self) -> Dict[str, Any]:
        """获取处理统计信息"""
        return {
            "processor_id": self.processor_id,
            "total_processed": self.processed_count,
            "batches_processed": len(self.results),
            "worker_id": ray.get_runtime_context().get_worker_id(),
        }


class RayDistributedSystem:
    """
    Ray 分布式系统管理类
    """

    def __init__(self, num_cpus: int = None, object_store_memory: int = None):
        """
        初始化 Ray 集群

        Args:
            num_cpus: CPU 核心数
            object_store_memory: 对象存储内存大小（字节）
        """
        self.num_cpus = num_cpus or psutil.cpu_count()
        self.object_store_memory = object_store_memory or int(
            psutil.virtual_memory().total * 0.3
        )

        # 初始化 Ray
        if ray.is_initialized():
            ray.shutdown()

        ray.init(
            num_cpus=self.num_cpus,
            object_store_memory=self.object_store_memory,
            ignore_reinit_error=True,
        )

        logger.info(f"Ray initialized with {self.num_cpus} CPUs")
        logger.info(
            f"Object store memory: {self.object_store_memory / (1024**3):.2f} GB"
        )
        logger.info(f"Ray cluster resources: {ray.cluster_resources()}")

    def demo_remote_functions(self):
        """演示远程函数的使用"""
        logger.info("=== Remote Functions Demo ===")

        # 1. 并行计算 π
        logger.info("1. Computing π using Monte Carlo method...")
        n_tasks = 8
        samples_per_task = 1000000

        start_time = time.time()
        # 创建远程任务
        futures = [compute_pi_chunk.remote(samples_per_task) for _ in range(n_tasks)]
        # 获取结果
        results = ray.get(futures)
        pi_estimate = sum(results) / len(results)
        elapsed_time = time.time() - start_time

        logger.info(
            f"π estimate: {pi_estimate:.6f} (error: {abs(pi_estimate - np.pi):.6f})"
        )
        logger.info(f"Parallel computation time: {elapsed_time:.2f}s")

        # 2. 并行矩阵乘法
        logger.info("2. Parallel matrix multiplication...")
        matrix_size = 500
        A = np.random.random((matrix_size, matrix_size))
        B = np.random.random((matrix_size, matrix_size))

        # 将矩阵分块
        chunk_size = matrix_size // 4
        chunks_A = [A[i : i + chunk_size] for i in range(0, matrix_size, chunk_size)]

        start_time = time.time()
        # 并行计算各个块
        futures = [matrix_multiply.remote(chunk, B) for chunk in chunks_A]
        results = ray.get(futures)
        # 合并结果
        C_parallel = np.vstack(results)
        parallel_time = time.time() - start_time

        # 串行计算对比
        start_time = time.time()
        C_serial = np.dot(A, B)
        serial_time = time.time() - start_time

        logger.info(f"Parallel matrix multiplication time: {parallel_time:.2f}s")
        logger.info(f"Serial matrix multiplication time: {serial_time:.2f}s")
        logger.info(f"Speedup: {serial_time/parallel_time:.2f}x")
        logger.info(f"Results match: {np.allclose(C_parallel, C_serial)}")

    def demo_actors(self):
        """演示 Actor 的使用"""
        logger.info("=== Actors Demo ===")

        # 1. 分布式计数器
        logger.info("1. Distributed Counter...")
        counters = [DistributedCounter.remote(i * 10) for i in range(4)]

        # 并行操作计数器
        increment_futures = [counter.increment.remote(5) for counter in counters]
        increment_results = ray.get(increment_futures)
        logger.info(f"After increment: {increment_results}")

        # 获取计数器信息
        info_futures = [counter.get_worker_info.remote() for counter in counters]
        info_results = ray.get(info_futures)
        for info in info_results:
            logger.info(f"Counter info: {info}")

        # 2. 数据处理器
        logger.info("2. Data Processors...")
        processors = [DataProcessor.remote(f"processor_{i}") for i in range(3)]

        # 生成测试数据
        data = [list(np.random.random(100)) for _ in range(9)]

        # 分发数据到不同的处理器
        futures = []
        for i, batch in enumerate(data):
            processor = processors[i % len(processors)]
            futures.append(processor.process_batch.remote(batch))

        # 获取处理结果
        results = ray.get(futures)
        for result in results:
            logger.info(f"Batch result: {result}")

        # 获取处理器统计信息
        stats_futures = [processor.get_stats.remote() for processor in processors]
        stats_results = ray.get(stats_futures)
        for stats in stats_results:
            logger.info(f"Processor stats: {stats}")

    def demo_data_processing_pipeline(self):
        """演示数据处理管道"""
        logger.info("=== Data Processing Pipeline Demo ===")

        # 生成大数据集
        data_size = 100000
        chunk_size = 10000
        data = list(np.random.random(data_size))

        # 将数据分块
        chunks = [data[i : i + chunk_size] for i in range(0, data_size, chunk_size)]
        logger.info(f"Processing {data_size} items in {len(chunks)} chunks")

        # 并行处理不同操作
        operations = ["sum", "mean", "max", "min"]

        start_time = time.time()
        all_futures = []

        for operation in operations:
            operation_futures = [
                process_data_chunk.remote(chunk, operation) for chunk in chunks
            ]
            all_futures.extend(operation_futures)

        # 获取所有结果
        all_results = ray.get(all_futures)

        # 整理结果
        results_by_operation = {}
        idx = 0
        for operation in operations:
            operation_results = all_results[idx : idx + len(chunks)]
            if operation in ["sum", "mean"]:
                # 对于 sum 和 mean，需要重新计算总体结果
                if operation == "sum":
                    total_result = sum(operation_results)
                else:  # mean
                    total_result = sum(operation_results) / len(operation_results)
            else:  # max, min
                total_result = (
                    max(operation_results)
                    if operation == "max"
                    else min(operation_results)
                )

            results_by_operation[operation] = total_result
            idx += len(chunks)

        processing_time = time.time() - start_time

        logger.info(f"Processing completed in {processing_time:.2f}s")
        for operation, result in results_by_operation.items():
            logger.info(f"{operation}: {result}")

    def get_cluster_info(self) -> Dict[str, Any]:
        """获取集群信息"""
        return {
            "cluster_resources": ray.cluster_resources(),
            "available_resources": ray.available_resources(),
            "nodes": ray.nodes(),
            "is_initialized": ray.is_initialized(),
        }

    def shutdown(self):
        """关闭 Ray 集群"""
        if ray.is_initialized():
            ray.shutdown()
            logger.info("Ray cluster shutdown")


def main():
    """主函数"""
    logger.info("Starting Ray Distributed System Demo")

    # 创建分布式系统
    system = RayDistributedSystem()

    try:
        # 显示集群信息
        cluster_info = system.get_cluster_info()
        logger.info(f"Cluster info: {cluster_info}")

        # 运行各种演示
        system.demo_remote_functions()
        print()

        system.demo_actors()
        print()

        system.demo_data_processing_pipeline()

    except Exception as e:
        logger.error(f"Error during execution: {e}")
        import traceback

        traceback.print_exc()

    finally:
        time.sleep(1000000)
        # 清理资源
        system.shutdown()


if __name__ == "__main__":
    main()
