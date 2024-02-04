#include <stdio.h>

#define DEBUG(fmt, ...) fprintf(stderr, fmt, ##__VA_ARGS__)

int main() { DEBUG("%s tell %s to not to go there\n", "tom", "jerry"); }
