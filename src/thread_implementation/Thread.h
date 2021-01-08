#pragma once

#include <pthread.h>
#include <string>
#include <functional>
#include <atomic>

namespace muduo {

namespace detail {
  extern __thread int t_cachedTid;
  extern __thread const char *t_threadName;
  extern __thread char t_tidString[32];
  extern __thread int t_tidStringLength;

  inline pid_t gettid();
  void cacheTid();
  inline pid_t tid() {
    if (__builtin_expect(t_cachedTid == 0, 0)) {
      cacheTid();
    }
    return t_cachedTid;
  }
} // namespace detail

class Thread {
public:
  using ThreadFunc = std::function<void ()>;

  explicit Thread(ThreadFunc f, const std::string &n = "");

  ~Thread();
  
  void start();
  int join();

  bool started() const { return started_; }
  pid_t tid() const { return tid_; }
  const std::string &name() const { return name_; };
  static int numCreated() { return numCreated_; }

private:
  void setDefaultName();
  bool started_;
  bool joined_;
  pthread_t pthreadId_;
  pid_t tid_;
  ThreadFunc func_;
  std::string name_;
  static std::atomic_ullong numCreated_;
};
} // namespace muduo
