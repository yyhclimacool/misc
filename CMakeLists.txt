cmake_minimum_required(VERSION 3.10 FATAL_ERROR)

project(misc VERSION 0.1.1 LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_EXTENSIONS OFF)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(use_glog use_glog.cc)
target_link_libraries(use_glog libglog.a)
install(TARGETS use_glog DESTINATION bin COMPONENT binaries)
