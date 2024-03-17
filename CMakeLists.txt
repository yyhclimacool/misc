cmake_minimum_required(VERSION 3.20 FATAL_ERROR)

project(misc VERSION 0.1.1 LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_EXTENSIONS ON)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

set(COMMON_LIBRARIES
    glog
    gflags
    gtest
    pthread
)

set(AERO_SRCS
    src/aero/plugin.cc
    src/aero/dynamic_loader.cc
)

add_compile_options(-mavx2 -mfma)

find_package(benchmark REQUIRED)

# add_executable(use_glog src/use_glog.cc)
# target_link_libraries(use_glog libglog.a)
# install(TARGETS use_glog DESTINATION bin COMPONENT binaries)

add_library(aero STATIC ${AERO_SRCS})
install(TARGETS aero DESTINATION lib COMPONENT libraries)

add_executable(plugin_ut src/aero/plugin_ut.cc)
target_link_libraries(plugin_ut aero ${COMMON_LIBRARIES})
install(TARGETS plugin_ut DESTINATION bin COMPONENT binaries)

add_executable(avx_benchmark src/simd/avx_benchmark.cc)

add_executable(item47 src/effective_cpp/item47_use_traits_classes_for_infomation_about_types.cc)
install(TARGETS item47 DESTINATION bin COMPONENT binaries)

target_link_libraries(avx_benchmark benchmark::benchmark)
install(TARGETS avx_benchmark DESTINATION bin COMPONENT binaries)