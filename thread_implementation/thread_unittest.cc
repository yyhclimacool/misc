#include "Thread.h"
#include <unistd.h>

int main() {
  printf("main pid=%d, tid=%d\n", getpid(), muduo::detail::tid());
}
