#!/bin/bash

if [ ! -d ./build ]
then
    mkdir -p ./build
fi

cd ./build && \
    cmake -DCMAKE_INSTALL_PREFIX=./output .. && \
    make -j && \
    make install && \
cd -
