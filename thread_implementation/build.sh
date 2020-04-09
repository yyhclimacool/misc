#!/bin/bash

CURRENT_DIR=`pwd`
BUILD_DIR=${BUILD_DIR:-${CURRENT_DIR}/build}
BUILD_TYPE=${BUILD_TYPE:-Debug}
INSTALL_DIR=${INSTALL_DIR:-${BUILD_DIR}/${BUILD_TYPE}_install}

COLORBLACK="\033[30m"
COLORRED="\033[31m"
COLORGREEN="\033[32m"
COLORBLUE="\033[34m"
COLORYELLOW="\033[33m"
COLORPURPLE="\033[35m"
COLORSKYBLUE="\033[36m"
COLORWHITE="\033[37m"
COLOREND="\033[0m"

function LOG() {
  date_str=`date "+%Y-%m-%d %H:%M:%S"`
  case "$1" in
    "WARNING")
      shift
      echo -e "${COLORSKYBLUE}WARNING `date "+%Y-%m-%d %H:%M:%S"` $* $COLOREND"
      ;;
    "ERROR")
      shift
      echo -e "${COLORRED}ERROR `date "+%Y-%m-%d %H:%M:%S"` $* $COLOREND"
      ;;
    *)
      echo -e "${COLORGREEN}INFO `date "+%Y-%m-%d %H:%M:%S"` $* $COLOREND"
  esac
}

if [ "$1"x = "clean"x ]
then
  if [ -d ${BUILD_DIR} ]
  then
    LOG WARNING "rm -rf ${BUILD_DIR}"
    rm -rf ${BUILD_DIR}
  fi
  exit 0
fi

if [ ! -d ${BUILD_DIR} ]
then
  LOG "mkdir -p ${BUILD_DIR}"
  mkdir -p ${BUILD_DIR}
fi

cmake \
  -H${CURRENT_DIR} -B${BUILD_DIR} \
  -DCMAKE_INSTALL_PREFIX=${INSTALL_DIR} \
  -DCMAKE_BUILD_TYPE=${BUILD_TYPE} \
  -DCMAKE_EXPORT_COMPILE_COMMANDS=TRUE && \
cmake --build ${BUILD_DIR} -- -j && \
cmake --build ${BUILD_DIR} --target install
