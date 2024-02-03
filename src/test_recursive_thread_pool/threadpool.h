#pragma once

#include "hooks/pool_task.h"
#include <condition_variable>
#include <cpputil/metrics2/metric_collector.h>
#include <functional>
#include <future>
#include <memory>
#include <mutex>
#include <pthread.h>
#include <queue>
#include <stdexcept>
#include <string>
#include <thread>
#include <unistd.h>
#include <vector>

class CallbackHook {
 public:
  CallbackHook() {
    taskStatsCallbacks_ = std::make_shared<
        folly::ThreadPoolExecutor::TaskStatsCallbackRegistry>();
  }
  virtual ~CallbackHook() = default;

#ifndef HAS_SUBSCRIBE_TO_TASK_STATUS
#define HAS_SUBSCRIBE_TO_TASK_STATUS
  inline void subscribeToTaskStats(
      folly::ThreadPoolExecutor::TaskStatsCallback cb) {
    if (*taskStatsCallbacks_->inCallback) {
      throw std::runtime_error("cannot subscribe in task stats callback");
    }
    taskStatsCallbacks_->callbackList.wlock()->push_back(std::move(cb));
  }
#endif

 protected:
  void runTaskCallback(folly::ThreadPoolExecutor::TaskStats& stats) {
    taskStatsCallbacks_->callbackList.withRLock([&](auto& callbacks) {
      *taskStatsCallbacks_->inCallback = true;
      SCOPE_EXIT {
        *taskStatsCallbacks_->inCallback = false;
      };
      try {
        for (auto& callback : callbacks) {
          callback(stats);
        }
      } catch (const std::exception& e) {
        LOG(ERROR) << "ThreadPool: task stats callback threw "
                      "unhandled "
                   << typeid(e).name() << " exception: " << e.what();
      } catch (...) {
        LOG(ERROR) << "ThreadPool: task stats callback threw "
                      "unhandled non-exception object";
      }
    });
  }

 private:
  std::shared_ptr<folly::ThreadPoolExecutor::TaskStatsCallbackRegistry>
      taskStatsCallbacks_;
};
