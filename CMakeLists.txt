cmake_minimum_required(VERSION 3.10 FATAL_ERROR)

project(code_snippets VERSION 0.1.1 LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_EXTENSIONS OFF)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

set(include_path ${PROJECT_SOURCE_DIR}/third_party/glog-0.4.0/include)
set(link_path ${PROJECT_SOURCE_DIR}/third_party/glog-0.4.0/lib)
include_directories(${include_path})
link_directories(${link_path})

#add_executable(test_preprocessor_macros test_preprocessor_macros.cc)
#add_executable(test_const test_const.cc)
add_executable(use_glog use_glog.cc)
target_link_libraries(use_glog libglog.a)
install(TARGETS use_glog DESTINATION bin COMPONENT binaries)
