#include "Thread.h"
#include <unistd.h>
#include <assert.h>

void thread_func() {
  printf("tid=%d\n", muduo::detail::tid());
  sleep(20);
}

void thread_func2(int ival) {
  printf("tid=%d, val=%d\n", muduo::detail::tid(), ival);
  sleep(20);
}

void thread_func3() {
  printf("tid=%d\n", muduo::detail::tid());
  sleep(20);
}

int main() {
  printf("main pid=%d, tid=%d\n", getpid(), muduo::detail::tid());
  {
    muduo::Thread t1(thread_func);
    t1.start();
    assert(t1.started());
    //printf("t1.tid=%d\n", t1.tid());

    muduo::Thread t2(std::bind(thread_func2, 42));
    t2.start();

    muduo::Thread t3(thread_func3);
    t3.start();
  }
  pthread_exit(0);
}
