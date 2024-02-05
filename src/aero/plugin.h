#pragma once

#include <memory>
#include <mutex>
#include <unordered_map>

#include "macros.h"

namespace aero {
class Plugin {
public:
  virtual ~Plugin() = default;
};

class PluginRegistry {
public:
  static PluginRegistry &instance() noexcept;
  int regist(std::string_view name, Plugin *plugin) noexcept;
  int regist(std::string_view name, std::unique_ptr<Plugin> &&plugin) noexcept;
  Plugin *get(std::string_view name) const noexcept;

private:
  mutable std::mutex mutex_;
  std::unordered_map<std::string, std::unique_ptr<Plugin>> plugins_;
};

class PluginRegistrar {
public:
  template <typename... Args> PluginRegistrar(Args &&...args) {
    PluginRegistry::instance().regist(std::forward<Args>(args)...);
  }
};

} // namespace aero

#define PLUGIN_REGIST(name, ins...)                                            \
  ::aero::PluginRegistrar AERO_CAT(__plugin_registrar_,                        \
                                   name)(AERO_TO_STR(name), ins);
// supress warning: backslash-newline at end of file