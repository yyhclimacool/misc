#!/bin/bash
# author yyhclimacool@gmail.com
# 递归地从某一目录拷贝某一类型的文件
# 当前函数实现的是递归的拷贝.a文件

destination=$2

recursive_copy() {
  for file in `ls $1`
  do
    if [ -d $1/$file ]
    then
      t=$1/$file
      t=${t:0-8}
      if [ "$t"x != "runfiles"x ]
      then
       recursive_copy $1/$file
      else
        echo "Ignore directory: $1/$file ..."
      fi
    else
      a=$1/$file
      b=${a:0-2}
      c=${a##*/}
      c=${c:0:3}
      if [ "$b"x = ".a"x -a "$c"x = "lib"x ]
      then
        echo $1/$file
        cp $1/$file $destination
      fi
    fi
  done
}

recursive_copy $1

