#! /bin/bash
# author yyhclimacool@gmail.com
# date   Apirl 2020
# brief  build script that wrappes cmake command.
#

COLORRED="\033[31m"
COLOREND="\033[0m"

CURRENT_DIR=`pwd`
OUTPUT=$CURRENT_DIR/output
BUILD_DIR=${BUILD_DIR:-${CURRENT_DIR}/cmake_build}
BUILD_TYPE=${BUILD_TYPE:-RelWithDebInfo}
INSTALL_DIR=${INSTALL_DIR:-${BUILD_DIR}/${BUILD_TYPE}_install}

if [ "$1"x = "clean"x ]
then
  echo -e "${COLORRED}rm -rf ${BUILD_DIR} && rm -rf ${OUTPUT} ${COLOREND}"
  rm -rf ${BUILD_DIR}
  rm -rf ${OUTPUT}
  exit 0
fi

mkdir -p ${OUTPUT}
mkdir -p ${BUILD_DIR}

cmake -H${CURRENT_DIR} -B${BUILD_DIR} \
  -DCMAKE_INSTALL_PREFIX=${INSTALL_DIR} \
  -DCMAKE_EXPORT_COMPILE_COMMANDS=ON \
  -DCMAKE_BUILD_TYPE=${BUILD_TYPE} && \
cmake --build ${BUILD_DIR} -- -j && \
cmake --build ${BUILD_DIR} --target install

cp -rf ${INSTALL_DIR}/* ${OUTPUT}
