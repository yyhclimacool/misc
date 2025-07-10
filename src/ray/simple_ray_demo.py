import ray

# 初始化本地Ray集群，而不是连接外部集群
ray.init()

print("Ray集群信息:")
print(f"可用资源: {ray.available_resources()}")
print(f"集群资源: {ray.cluster_resources()}")

print("\n节点信息:")
for node in ray.nodes():
    print(node)


# 简单的远程函数测试
@ray.remote
def hello_ray(name):
    return f"Hello {name} from Ray!"


# 测试远程函数
future = hello_ray.remote("World")
result = ray.get(future)
print(f"\n远程函数结果: {result}")

# 清理资源
ray.shutdown()
