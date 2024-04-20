# Build development environment

# FROM ubuntu:22.04
# FROM arm64v8/ubuntu:latest
# FROM nvidia/cuda:12.4.1-devel-ubuntu22.04
FROM nvidia/cuda:11.8.0-devel-ubuntu22.04
LABEL maintainer="yyhclimacool@gmail.com"
LABEL version="0.1"
LABEL description="Personal development environment"

ENV DEBIAN_FRONTEND noninteractive
ENV IMAGE_BUILT_AT 20240401
ENV TMP=/tmp
ENV LD_LIBRARY_PATH /lib:/lib64:/usr/lib:/usr/lib64:/usr/local/lib:/usr/local/lib64

WORKDIR /root/

ADD bashrc .
ADD vimrc .
ADD init_ubuntu.sh .

RUN ln -s /usr/local/bin/gfortran /usr/bin/gfortran
# RUN hwclock --hctosys 

# RUN ./init_ubuntu.sh

# RUN /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
# RUN brew install zsh
# RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

RUN unset TF_NEED_CUDA

## tensorflow 1.10配套的cuda版本为9.0，需要gcc5
## TensorFlow 1.15配套的cuda版本为10.0，需要gcc7.5
#
# 下面的命令可以更新gcc为8.4.0版本，更新其他版本也是类似的方法
#RUN add-apt-repository ppa:ubuntu-toolchain-r/test -y
#RUN apt-get install -yq gcc-8 g++-8 
#RUN update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-8 80 \
#      --slave /usr/bin/g++ g++ /usr/bin/g++-8 \
#      --slave /usr/bin/gcc-ar gcc-ar /usr/bin/gcc-ar-8 \
#      --slave /usr/bin/gcc-nm gcc-nm /usr/bin/gcc-nm-8 \
#      --slave /usr/bin/gcc-ranlib gcc-ranlib /usr/bin/gcc-ranlib-8

# RUN wget https://github.com/Kitware/CMake/releases/download/v3.18.5/cmake-3.18.5-Linux-x86_64.sh && \
#     bash cmake-3.18.5-Linux-x86_64.sh --prefix=/usr/ --skip-license && \
#     rm -rf cmake-3.18.5-Linux-x86_64.sh

# RUN wget https://github.com/bazelbuild/bazel/releases/download/0.24.1/bazel-0.24.1-installer-linux-x86_64.sh && \
#     bash bazel-0.24.1-installer-linux-x86_64.sh && rm -rf bazel-0.24.1-installer-linux-x86_64.sh

# CPU版本不需要cuda库
#RUN wget -nH -m --cut-dirs=2 --ftp-user=chuanmei --ftp-password=chuanmei163Fn4/Q ftp://sa-dianxin-ftp.hz.163.org/youyunhong/cuda_10.0.130_410.48_linux.run && \
#    bash cuda_10.0.130_410.48_linux.run --toolkit --silent && rm cuda_10.0.130_410.48_linux.run && \
#    wget -nH -m --cut-dirs=2 --ftp-user=chuanmei --ftp-password=chuanmei163Fn4/Q ftp://sa-dianxin-ftp.hz.163.org/youyunhong/cuda_10.0.130.1_linux.run && \
#    bash cuda_10.0.130.1_linux.run --silent --accept-eula && rm cuda_10.0.130.1_linux.run
#
#RUN wget -nH -m --cut-dirs=2 --ftp-user=chuanmei --ftp-password=chuanmei163Fn4/Q ftp://sa-dianxin-ftp.hz.163.org/youyunhong/libcudnn7-dev_7.6.2.24-1+cuda10.0_amd64.deb && \
#    dpkg -i libcudnn7-dev_7.6.2.24-1+cuda10.0_amd64.deb && rm libcudnn7-dev_7.6.2.24-1+cuda10.0_amd64.deb

RUN echo 'export PATH=/usr/local/miniconda3/bin:/usr/local/cuda/bin:$PATH && export LD_LIBRARY_PATH=/usr/local/cuda/lib64:/lib:/lib64:/usr/lib:/usr/lib64:/usr/local/lib:/usr/local/lib64:$LD_LIBRARY_PATH' >> ~/.bashrc

# RUN git config --global credential.helper store && \
#    git config --global user.email "yyhclimacool@gmail.com" && \
#    git config --global user.name "yyhclimacool"

# RUN useradd -rm -d /home/kevin -s /bin/bash -g root -G sudo -u 1000 kevin \
#     && echo "kevin:kevin" | chpasswd \
#     && echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers \
#     && service ssh start

# RUN curl -fLo ~/.vim/autoload/plug.vim --create-dirs \
#     https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim

EXPOSE 22

# CMD ["/usr/sbin/sshd", "-D"]
#CMD echo "[CMD]Welcome to my dev docker!"
#ENTRYPOINT echo "[ENTRYPOINT]Welcome to my dev docker!"
