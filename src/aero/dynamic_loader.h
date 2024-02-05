#pragma once

#include <mutex>
#include <string_view>
#include <unordered_map>

namespace aero {
class DynamicLoader {
public:
  static DynamicLoader &instance() noexcept;
  ~DynamicLoader() noexcept;
  int load(std::string_view path) noexcept;

private:
  std::mutex mutex_;
  std::unordered_map<std::string, void *> handles_;
};
} // namespace aero