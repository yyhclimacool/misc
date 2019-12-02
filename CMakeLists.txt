cmake_minimum_required(VERSION 3.10 FATAL_ERROR)

project(code_snippets VERSION 0.1 LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_EXTENSIONS OFF)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(test_preprocessor_macros test_preprocessor_macros.cc)
add_executable(test_const test_const.cc)
