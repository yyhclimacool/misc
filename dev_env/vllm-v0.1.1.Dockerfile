# 注意：从干净的环境开始，不建议使用 nvidia 的 docker
FROM ubuntu:22.04

# 设置环境变量
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV CUDA_HOME=/usr/local/cuda
ENV PATH=${CUDA_HOME}/bin:${PATH}
ENV LD_LIBRARY_PATH=${CUDA_HOME}/lib64:/lib
ENV LD_LIBRARY_PATH=${LD_LIBRARY_PATH}:/lib64:/usr/lib:/usr/lib64:/usr/local/lib:/usr/local/lib64
ENV NVIDIA_DRIVER_CAPABILITIES=compute,utility
ENV NVIDIA_VISIBLE_DEVICES=all
ENV HF_ENDPOINT=https://hf-mirror.com

# 更新包管理器并安装基础依赖
RUN apt-get update && apt-get install -y \
  build-essential \
  software-properties-common \
  curl \
  wget \
  git \
  vim \
  python3.10 \
  python3.10-dev \
  python3.10-distutils \
  python3-pip \
  pkg-config \
  libjpeg-dev \
  libpng-dev \
  ninja-build \
  && rm -rf /var/lib/apt/lists/*

# 创建python3符号链接
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.10 1
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3.10 1

# 升级pip
RUN python3 -m pip install --upgrade pip setuptools wheel

# # 需要进入容器手动安装CUDA Toolkit 12.6
# RUN wget https://developer.download.nvidia.com/compute/cuda/12.6.0/local_installers/cuda_12.6.0_560.28.03_linux.run && \
#     sh cuda_12.6.0_560.28.03_linux.run --silent --toolkit && \
#     rm cuda_12.6.0_560.28.03_linux.run

# 设置工作目录
WORKDIR /root/workspace

# 设置默认命令
CMD ["/bin/bash"]
