#!/bin/bash

set -x

cp vimrc ~/.vimrc

current_time=$(date "+%Y.%m.%d.%H.%M.%S")

convert() {
  c1=$(sed 's/[&/\*[\.]/\\&/g' <<<"$1")
  cstr=$(sed 's/\]/\\]/g' <<<"$c1")
}

replace() {
  convert "$1"
  c0=$cstr
  convert "$2"
  c1=$cstr
  sed -i "s/$c0/$c1/g" $3
}

config_apt() {
  # cp /etc/apt/sources.list /etc/apt/sources.list.bak.${current_time}
  # replace "http://archive.ubuntu.com/ubuntu/" "http://mirrors.aliyun.com/ubuntu/" /etc/apt/sources.list
  apt-get update -yq
  apt-get install -yq software-properties-common apt-utils && apt-get upgrade -yq
}

run_apts() {
  apt-get install -yq automake
  apt-get install -yq bison
  apt-get install -yq clang-11
  apt-get install -yq ctags
  apt-get install -yq globalss
  apt-get install -yq curl
  apt-get install -yq default-jdk
  apt-get install -yq default-jre
  apt-get install -yq flex
  apt-get install -yq gcc-10
  apt-get install -yq gdb
  apt-get install -yq git
  apt-get install -yq google-perftools
  apt-get install -yq graphviz
  apt-get install -yq libapr1-dev
  apt-get install -yq libaprutil1-dev
  apt-get install -yq libboost-all-dev
  apt-get install -yq libc-ares-dev
  apt-get install -yq libevent-dev
  apt-get install -yq libgoogle-glog-dev
  apt-get install -yq libgoogle-perftools-dev
  apt-get install -yq libleveldb-dev
  apt-get install -yq libprotobuf-dev
  apt-get install -yq librdkafka-dev
  apt-get install -yq libsnappy-dev
  apt-get install -yq libssl-dev
  apt-get install -yq libtool
  apt-get install -yq libunwind8-dev
  apt-get install -yq make
  apt-get install -yq pkg-config
  apt-get install -yq protobuf-compiler
  apt-get install -yq python-numpy
  apt-get install -yq ripgrep
  apt-get install -yq rustc
  apt-get install -yq ssh
  apt-get install -yq texinfo
  apt-get install -yq tree
  apt-get install -yq unzip
  apt-get install -yq vim
  apt-get install -yq wget
  apt-get install -yq zip
  apt-get install -yq pciutils
}

install_go() {
  add-apt-repository ppa:longsleep/golang-backports -y
  apt-get install -yq golang-go
}

install_conda() {
#-p /usr/local/miniconda3
  wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh &&
    bash Miniconda3-latest-Linux-x86_64.sh -bfu &&
    rm -rf Miniconda3-latest-Linux-x86_64.sh
}

install_cuda() {
  wget https://cn.download.nvidia.com/XFree86/Linux-x86_64/535.86.05/NVIDIA-Linux-x86_64-535.86.05.run &&
    bash NVIDIA-Linux-x86_64-535.86.05.run &&
    rm -rf NVIDIA-Linux-x86_64-535.86.05.run &&
    wget https://developer.download.nvidia.com/compute/cuda/11.8.0/local_installers/cuda_11.8.0_520.61.05_linux.run &&
    bash cuda_11.8.0_520.61.05_linux.run --silent --toolkit --run-nvidia-xconfig &&
    rm -rf cuda_11.8.0_520.61.05_linux.run &&
    echo "export CUDA_HOME=/usr/local/cuda-11.8" >>~/.bashrc &&
    echo "export PATH=/usr/local/cuda-11.8/bin:$PATH" >>~/.bashrc &&
    echo "export LD_LIBRARY_PATH=/usr/local/cuda-11.8/lib64:$LD_LIBRARY_PATH" >>~/.bashrc

  # maybe you need https://developer.nvidia.com/rdp/cudnn-download
}

install_torch() {
  # pip install torch==1.10.0+cu111 torchvision==0.11.0+cu111 torchaudio==0.10.0 -f https://download.pytorch.org/whl/torch_stable.html
  conda install pytorch torchvision torchaudio pytorch-cuda=11.8 -c pytorch -c nvidia
}

config_apt
run_apts
install_go
install_conda
install_cuda
install_torch
