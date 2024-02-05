#include <gflags/gflags.h>
#include <glog/logging.h>
#include <gtest/gtest.h>
#include <thread>

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

TEST(TestPlugin, fruit) {
  auto *plugin = ::aero::PluginRegistry::instance().get("fruit");
  ASSERT_NE(plugin, nullptr);
  auto *fruit = dynamic_cast<Fruit *>(plugin);
  auto *touchable = dynamic_cast<Touchable *>(plugin);
  auto *sayable = dynamic_cast<Sayable *>(plugin);
  ASSERT_NE(fruit, nullptr);
  ASSERT_EQ(fruit->touch(), "Fruit");
  ASSERT_NE(touchable, nullptr);
  ASSERT_EQ(touchable->touch(), "Fruit");
  ASSERT_EQ(sayable, nullptr);
}

TEST(TestPlugin, apple) {
  auto *plugin = ::aero::PluginRegistry::instance().get("apple");
  ASSERT_NE(plugin, nullptr);
  auto *apple = dynamic_cast<Apple *>(plugin);
  auto *fruit = dynamic_cast<Fruit *>(plugin);
  auto *touchable = dynamic_cast<Touchable *>(plugin);
  auto *sayable = dynamic_cast<Sayable *>(plugin);
  ASSERT_NE(apple, nullptr);
  ASSERT_EQ(apple->touch(), "Apple");
  ASSERT_NE(fruit, nullptr);
  ASSERT_EQ(fruit->touch(), "Apple");
  ASSERT_NE(touchable, nullptr);
  ASSERT_EQ(touchable->touch(), "Apple");
  ASSERT_EQ(sayable, nullptr);
}

TEST(TestPlugin, pet) {
  auto *plugin = ::aero::PluginRegistry::instance().get("pet");
  ASSERT_NE(plugin, nullptr);
  auto *pet = dynamic_cast<Pet *>(plugin);
  auto *touchable = dynamic_cast<Touchable *>(plugin);
  auto *sayable = dynamic_cast<Sayable *>(plugin);
  ASSERT_NE(pet, nullptr);
  ASSERT_EQ(pet->touch(), "Pet");
  ASSERT_NE(touchable, nullptr);
  ASSERT_EQ(touchable->touch(), "Pet");
  ASSERT_EQ(sayable, nullptr);
}

TEST(TestPlugin, cat) {
  auto *plugin = ::aero::PluginRegistry::instance().get("cat");
  ASSERT_NE(plugin, nullptr);
  auto *cat = dynamic_cast<Cat *>(plugin);
  auto *pet = dynamic_cast<Pet *>(plugin);
  auto *touchable = dynamic_cast<Touchable *>(plugin);
  auto *sayable = dynamic_cast<Sayable *>(plugin);
  ASSERT_NE(cat, nullptr);
  ASSERT_EQ(cat->touch(), "Cat");
  ASSERT_NE(pet, nullptr);
  ASSERT_EQ(pet->touch(), "Cat");
  ASSERT_NE(touchable, nullptr);
  ASSERT_EQ(touchable->touch(), "Cat");
  ASSERT_NE(sayable, nullptr);
  ASSERT_EQ(sayable->say(), "Meow");
}

TEST(TestPlugin, parrot) {
  auto *plugin = ::aero::PluginRegistry::instance().get("hello_parrot");
  ASSERT_NE(plugin, nullptr);
  auto *parrot = dynamic_cast<Parrot *>(plugin);
  auto *pet = dynamic_cast<Pet *>(plugin);
  auto *touchable = dynamic_cast<Touchable *>(plugin);
  auto *sayable = dynamic_cast<Sayable *>(plugin);
  ASSERT_NE(parrot, nullptr);
  ASSERT_EQ(parrot->touch(), "Parrot");
  ASSERT_NE(pet, nullptr);
  ASSERT_EQ(pet->touch(), "Parrot");
  ASSERT_NE(touchable, nullptr);
  ASSERT_EQ(touchable->touch(), "Parrot");
  ASSERT_NE(sayable, nullptr);
  ASSERT_EQ(sayable->say(), "Hello");
}

TEST(TestPlugin, cat_parrot) {
  auto *plugin = ::aero::PluginRegistry::instance().get("cat_parrot");
  ASSERT_NE(plugin, nullptr);
  auto *parrot = dynamic_cast<Parrot *>(plugin);
  auto *pet = dynamic_cast<Pet *>(plugin);
  auto *touchable = dynamic_cast<Touchable *>(plugin);
  auto *sayable = dynamic_cast<Sayable *>(plugin);
  ASSERT_NE(parrot, nullptr);
  ASSERT_EQ(parrot->touch(), "Parrot");
  ASSERT_NE(pet, nullptr);
  ASSERT_EQ(pet->touch(), "Parrot");
  ASSERT_NE(touchable, nullptr);
  ASSERT_EQ(touchable->touch(), "Parrot");
  ASSERT_NE(sayable, nullptr);
  ASSERT_EQ(sayable->say(), "Meow");
}

class StringPlace : public ::aero::Plugin {
public:
  StringPlace(const std::string &str, int *const counter)
      : str_(str), counter_(counter) {
    AERO_TRACE;
    ++(*counter_);
  }
  ~StringPlace() {
    AERO_TRACE;
    --(*counter_);
  }

  const char *str() const noexcept { return str_.c_str(); }

private:
  std::string str_;
  int *const counter_;
};

TEST(TestPluginRegistry, regist) {
  int counter = 0;
  ::aero::PluginRegistry r;
  ASSERT_EQ(r.get(""), nullptr);
  ASSERT_EQ(r.regist("a", new StringPlace("A", &counter)), 0);
  ASSERT_EQ(counter, 1);
  ASSERT_NE(r.get("a"), nullptr);
  ASSERT_EQ(r.regist("a", new StringPlace("AA", &counter)), -1);
  ASSERT_EQ(counter, 1);
  auto *a = r.get("a");
  ASSERT_NE(a, nullptr);
  ASSERT_STREQ(dynamic_cast<StringPlace *>(a)->str(), "A");
}

int main(int argc, char **argv) {
  ::google::ParseCommandLineFlags(&argc, &argv, true);
  ::google::InitGoogleLogging(argv[0]);
  ::testing::InitGoogleTest(&argc, argv);

  return RUN_ALL_TESTS();
}