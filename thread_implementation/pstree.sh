#!/bin/bash

pid=`ps -ef | grep thread_test | grep -v grep | awk '{print $2}'`
if [ ! -z $pid ]; then
  pstree -t -p $pid
fi
