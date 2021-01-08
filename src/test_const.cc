#include <iostream>

using namespace std;

void print1(int a) {
  cout << a << std::endl;
}

void print2(const int a) {
  cout << a << std::endl;
}

void print3(const int *const a) {
  cout << *a << std::endl;
}

int main() {
  int b = 42;
  const int c = 55;
  const int *d = &c;
  const int * const e = d;
  //int * const f = 88;

  print1(b);
  print1(c); // 顶层const作为实参被忽略

  print2(b); // 顶层const作为形参被忽略
  print2(c);

  print3(d); // 顶层const作为形参被忽略
  print3(e);
}
