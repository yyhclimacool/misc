#!/bin/bash
# author: youyunhong @ corp netease com
# date: 2020-06-18
# Func: 递归的替换头代码库中的所有文件
# Usage: bash replace.sh feature_engine "apis/proto/feature.pb.h" "apis/proto/cpp_proto/feature.pb.h"

function convert
{
  c1=$(sed 's/[&/\*[\.]/\\&/g' <<<"$1")
  cstr=$(sed 's/\]/\\]/g' <<<"$c1")
}

function replace
{
  convert "$1"
  c0=$cstr
  convert "$2"
  c1=$cstr
  sed -i "s/$c0/$c1/g" $3
}

function do_replace() {
  echo "replace $2 $3 $1"
  replace "$2" "$3" $1
}

function main() {
  for file in `ls $1`
  do
    if [ -d $1"/"$file ];then
      main $1"/"$file "$2" "$3"
    else
      do_replace $1"/"$file "$2" "$3"
    fi
  done
}

main "$1" "$2" "$3"
