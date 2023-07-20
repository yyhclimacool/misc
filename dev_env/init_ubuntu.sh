#!/bin/bash

# set -x

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
  cp /etc/apt/sources.list /etc/apt/sources.list.bak.${current_time}
  replace "http://archive.ubuntu.com/ubuntu/" "http://mirrors.aliyun.com/ubuntu/" /etc/apt/sources.list
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

config_apt
run_apts
