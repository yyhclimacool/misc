#include <gflags/gflags.h>
#include <glog/logging.h>
#include <gtest/gtest.h>

#include "plugin.h"

class Touchable {
public:
  virtual ~Touchable() = default;
  virtual std::string touch() = 0;
};

class Sayable {
public:
  virtual ~Sayable() = default;
  virtual std::string say() = 0;
};

class Fruit : public ::aero::Plugin, virtual public Touchable {
public:
  virtual std::string touch() override { return "Fruit"; }
};
PLUGIN_REGIST(fruit, new Fruit);

class Apple : public Fruit {
public:
  virtual std::string touch() override { return "Apple"; }
};
PLUGIN_REGIST(apple, new Apple);

class Pet : public ::aero::Plugin, virtual public Touchable {
public:
  virtual std::string touch() override { return "Pet"; }
};
PLUGIN_REGIST(pet, new Pet);

class Cat : public Pet, virtual public Sayable {
public:
  virtual std::string touch() override { return "Cat"; }
  virtual std::string say() override { return "Meow"; }
};
PLUGIN_REGIST(cat, new Cat);

class Parrot : public Pet, virtual public Sayable {
public:
  Parrot(const std::string &word) : word_(word) {}
  virtual std::string touch() override { return "Parrot"; }
  virtual std::string say() override { return word_; }

private:
  std::string word_;
};
PLUGIN_REGIST(hello_parrot, new Parrot("Hello"));
PLUGIN_REGIST(cat_parrot, new Parrot("Meow"));

TEST(TestPlugin, get) {
  ASSERT_EQ(::aero::PluginRegistry::instance().get(""), nullptr);
  ASSERT_NE(::aero::PluginRegistry::instance().get("fruit"), nullptr);
  ASSERT_NE(::aero::PluginRegistry::instance().get("apple"), nullptr);
  ASSERT_NE(::aero::PluginRegistry::instance().get("pet"), nullptr);
  ASSERT_NE(::aero::PluginRegistry::instance().get("cat"), nullptr);
  ASSERT_NE(::aero::PluginRegistry::instance().get("hello_parrot"), nullptr);
  ASSERT_NE(::aero::PluginRegistry::instance().get("cat_parrot"), nullptr);
}

int main(int argc, char **argv) {
  ::testing::InitGoogleTest(&argc, argv);
  ::google::InitGoogleLogging(argv[0]);
  ::google::ParseCommandLineFlags(&argc, &argv, true);

  return RUN_ALL_TESTS();
}