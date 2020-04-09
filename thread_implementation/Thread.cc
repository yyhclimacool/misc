#include "Thread.h"
#include <sys/prctl.h>
#include <sys/syscall.h>
#include <unistd.h>
#include <linux/unistd.h>
#include <assert.h>

namespace muduo {

namespace detail {
__thread int t_cachedTid = 0;
__thread const char *t_threadName = "main";
__thread char t_tidString[32] = {0};
__thread int t_tidStringLength = 0;

pid_t gettid() {
  return static_cast<pid_t>(::syscall(SYS_gettid));
}
void cacheTid() {
  if (t_cachedTid == 0) {
    t_cachedTid = gettid();
  }
  t_tidStringLength = snprintf(t_tidString, sizeof t_tidString, "%5d", t_cachedTid);
}
} // namespace detail

struct ThreadData {
  using ThreadFunc = Thread::ThreadFunc;
  ThreadFunc func_;
  std::string name_;
  pid_t *tid_;

  ThreadData(ThreadFunc f, const std::string &n, pid_t *t)
    : func_(std::move(f)),
      name_(n),
      tid_(t) {
  }

  void runInThread() {
    *tid_ = detail::tid();
    tid_ = nullptr;
    detail::t_threadName = name_.empty() ? "muduoThread" : name_.c_str();
    ::prctl(PR_SET_NAME, muduo::detail::t_threadName);
    try {
      func_();
      detail::t_threadName = "finished";
    } catch (...) {
      detail::t_threadName = "crashed";
      fprintf(stderr, "exception caught in thread %s\n", name_.c_str());
      throw;
    }
  }
};

void *threadRoutine(void *arg) {
  ThreadData *data = static_cast<ThreadData *>(arg);
  data->runInThread(); 
  delete data;
  return NULL;
}

std::atomic_ullong Thread::numCreated_;

Thread::Thread(ThreadFunc f, const std::string &n)
  : started_(false),
    joined_(false),
    pthreadId_(0),
    tid_(0),
    func_(std::move(f)),
    name_(n) {
      setDefaultName();
}

Thread::~Thread() {
  if (!joined_ && started_) {
    pthread_detach(pthreadId_);
  }
}

void Thread::setDefaultName() {
  auto num = numCreated_.fetch_add(1);
  if (name_.empty()) {
    char buf[32];
    snprintf(buf, sizeof buf, "Thread%llu", num);
    name_ = buf;
  }
}

void Thread::start() {
  assert(!started_);
  started_ = true;
  ThreadData *data = new ThreadData(func_, name_, &tid_);
  if (pthread_create(&pthreadId_, NULL, threadRoutine, data)) {
    started_ = false;
    delete data;
    std::terminate();
  } else {
    assert(tid_ > 0);
  }
}

int Thread::join() {
  assert(started_);
  assert(!joined_);
  joined_ = true;
  return pthread_join(pthreadId_, NULL);
}



} // namespace muduo
