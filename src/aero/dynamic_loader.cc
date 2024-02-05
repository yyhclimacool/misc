#include "dynamic_loader.h"
#include "plugin.h"
#include <dlfcn.h>

namespace aero {
int DynamicLoader::load(std::string_view path) noexcept {
  std::lock_guard<std::mutex> lock(mutex_);
  if (handles_.find(std::string(path.data(), path.size())) != handles_.end()) {
    return -1;
  }
  void *handle = dlopen(path.data(), RTLD_NOW | RTLD_LOCAL);
  if (handle == nullptr) {
    return -2;
  }
  handles_.emplace(path, handle);
  return 0;
}

DynamicLoader::~DynamicLoader() noexcept {
  std::lock_guard<std::mutex> lock(mutex_);
  for (auto &pair : handles_) {
    dlclose(pair.second);
  }
  handles_.clear();
}

namespace {
struct PluginRegistryDynamicLoader {
  static PluginRegistryDynamicLoader &instance() noexcept {
    static PluginRegistryDynamicLoader instance;
    return instance;
  }
  DynamicLoader loader;
  PluginRegistry registry;
};
} // namespace

DynamicLoader &DynamicLoader::instance() noexcept {
  static auto &dynamic_loader = PluginRegistryDynamicLoader::instance().loader;
  return dynamic_loader;
}

PluginRegistry &PluginRegistry::instance() noexcept {
  static auto &registry = PluginRegistryDynamicLoader::instance().registry;
  return registry;
}

} // namespace aero