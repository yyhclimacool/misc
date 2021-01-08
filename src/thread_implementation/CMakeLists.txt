cmake_minimum_required(VERSION 3.10 FATAL_ERROR)
project(thread LANGUAGES C CXX)
set(CMAKE_CXX_STANDARD 14)
set(CMAKE_CXX_EXTENSIONS OFF)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_library(thread STATIC Thread.h Thread.cc)
add_library(thread_shared SHARED Thread.h Thread.cc)
set_target_properties(thread_shared PROPERTIES OUTPUT_NAME "thread")
target_link_libraries(thread pthread)
target_link_libraries(thread_shared pthread)

add_executable(thread_test thread_unittest.cc)
target_link_libraries(thread_test thread)

install(TARGETS thread thread_shared thread_test
  RUNTIME DESTINATION bin
  ARCHIVE DESTINATION lib
  LIBRARY DESTINATION lib
)
