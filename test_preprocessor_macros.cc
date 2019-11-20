#include <iostream>
#include <string>

#define PRINT(fmt, ...) printf(fmt, ##__VA_ARGS__)

int main() {
  PRINT("%s tell %s to not to go there\n", "tom", "jerry");
}
