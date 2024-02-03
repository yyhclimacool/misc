#include "plugin.h"

namespace aero {
int PluginRegistry::regist(std::string_view name, Plugin *plugin) noexcept {
  std::lock_guard<std::mutex> lock(mutex_);
  if (plugins_.emplace(name, plugin).second) {
    return 0;
  }
  return -1;
}

int PluginRegistry::regist(std::string_view name,
                           std::unique_ptr<Plugin> &&plugin) noexcept {
  std::lock_guard<std::mutex> lock(mutex_);
  if (plugins_.emplace(name, std::move(plugin)).second) {
    return 0;
  }
  return -1;
}

Plugin *PluginRegistry::get(std::string_view name) const noexcept {
  std::lock_guard<std::mutex> lock(mutex_);
  auto it = plugins_.find(std::string(name.data(), name.size()));
  if (it != plugins_.end()) {
    return it->second.get();
  }
  return nullptr;
}

} // namespace aero
