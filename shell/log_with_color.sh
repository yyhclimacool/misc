#!/bin/bash
# 不同的LOG级别用不同的颜色显示
# author yyhclimacool@gmail.com

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

