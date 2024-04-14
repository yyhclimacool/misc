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
  sed -i "s/$c0/$c1/g" "$3"
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
  apt-get install -yq docker.io
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
  apt-get install -yq libgoogle-glog-dev libgtest-dev
  apt-get install -yq libgoogle-perftools-dev
  apt-get install -yq libleveldb-dev
  apt-get install -yq libprotobuf-dev
  apt-get install -yq librdkafka-dev
  apt-get install -yq libsnappy-dev
  apt-get install -yq libssl-dev
  apt-get install -yq libtool
  apt-get install -yq libunwind8-dev
  apt-get install -yq make
  apt-get install -yq net-tools
  # apt-get install -yq nvidia-cuda-toolkit
  apt-get install -yq pkg-config
  apt-get install -yq protobuf-compiler
  apt-get install -yq python-numpy
  apt-get install -yq ripgrep
  apt-get install -yq rustc
  apt-get install -yq samba samba-common-bin
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

install_nvidia_driver() {
  # ref: https://ubuntu.com/server/docs/nvidia-drivers-installation
  # manual install
  wget https://us.download.nvidia.cn/XFree86/Linux-x86_64/535.113.01/NVIDIA-Linux-x86_64-535.113.01.run &&
    bash NVIDIA-Linux-x86_64-535.113.01.run &&
    rm -rf NVIDIA-Linux-x86_64-535.113.01.run

  # apt install
  # sudo ubuntu-drivers install --gpgpu
}

install_cuda() {
  # ref: https://developer.nvidia.com/cuda-downloads?target_os=Linux&target_arch=x86_64&Distribution=Ubuntu&target_version=22.04&target_type=runfile_local
  # wget https://developer.download.nvidia.com/compute/cuda/12.3.2/local_installers/cuda_12.3.2_545.23.08_linux.run &&
  #   sudo sh cuda_12.3.2_545.23.08_linux.run --silent --toolkit --run-nvidia-xconfig

  wget https://developer.download.nvidia.com/compute/cuda/11.8.0/local_installers/cuda_11.8.0_520.61.05_linux.run &&
    bash cuda_11.8.0_520.61.05_linux.run --silent --toolkit --run-nvidia-xconfig &&
    rm -rf cuda_11.8.0_520.61.05_linux.run

  echo "export CUDA_HOME=/usr/local/cuda-11.8" >>~/.bashrc
  echo "export PATH=${CUDA_HOME}/bin:$PATH" >>~/.bashrc
  echo "export LD_LIBRARY_PATH=${CUDA_HOME}/lib64:$LD_LIBRARY_PATH" >>~/.bashrc

  # maybe you need https://developer.nvidia.com/rdp/cudnn-download
}

install_cudnn() {
  # ref: https://developer.nvidia.com/cudnn-downloads?target_os=Linux&target_arch=x86_64&Distribution=Ubuntu&target_version=22.04&target_type=deb_local
  wget https://developer.download.nvidia.com/compute/cudnn/9.0.0/local_installers/cudnn-local-repo-ubuntu2204-9.0.0_1.0-1_amd64.deb
  sudo dpkg -i cudnn-local-repo-ubuntu2204-9.0.0_1.0-1_amd64.deb
  sudo cp /var/cudnn-local-repo-ubuntu2204-9.0.0/cudnn-*-keyring.gpg /usr/share/keyrings/
  sudo apt-get update
  # sudo apt-get -y install cudnn

  sudo apt-get -y install cudnn-cuda-11
  # sudo apt-get -y install cudnn-cuda-12
}

install_torch() {
  # pip install torch==1.10.0+cu111 torchvision==0.11.0+cu111 torchaudio==0.10.0 -f https://download.pytorch.org/whl/torch_stable.html
  conda install pytorch torchvision torchaudio pytorch-cuda=11.8 -c pytorch -c nvidia
  # conda install pytorch torchvision torchaudio pytorch-cuda=12.1 -c pytorch -c nvidia
}

install_docker() {
  # ref: https://docs.docker.com/engine/install/ubuntu/
  # Add Docker's official GPG key:
  sudo apt-get update
  sudo apt-get install ca-certificates curl
  sudo install -m 0755 -d /etc/apt/keyrings
  sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  sudo chmod a+r /etc/apt/keyrings/docker.asc

  # Add the repository to Apt sources:
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" |
    sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
  sudo apt-get update
  sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

  # install nvidia-toolkit: https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html
}

config_apt
run_apts
install_go
install_conda
#  install_cuda
 install_torch
