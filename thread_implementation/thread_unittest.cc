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

class Foo {
public:
  explicit Foo(double x) : x_(x) {}
  void memberFunc() {
    printf("tid=%d, Foo::x_=%f\n", muduo::detail::tid(), x_);
    sleep(20);
  }
  void memberFunc2(const std::string &text) {
    printf("tid=%d, Foo::x_=%f, text=%s\n", muduo::detail::tid(), x_, text.c_str());
    sleep(20);
  }
private:
  double x_;
};

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

  Foo foo(42.42);
  muduo::Thread t3(std::bind(&Foo::memberFunc, &foo), "Thread for member function without argument");
  t3.start();
  t3.join();

  muduo::Thread t4(std::bind(&Foo::memberFunc2, &foo, "Running in t4"), "thread with args");
  t4.start();
  t4.join();

  {
    muduo::Thread t5(thread_func3);
    t5.start();
    // t5 may destruct earlier than thread creation.
  }
  {
    muduo::Thread t6(thread_func3);
    t6.start();
    sleep(30);
    // t6 destruct later than thread creation.
  }

  printf("Number of created threads %d\n", muduo::Thread::numCreated());
  pthread_exit(0);
}
