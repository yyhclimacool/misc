#pragma once

#define AERO_TO_STR(...) #__VA_ARGS__
#define AERO_CAT(a, b) a##b

#define AERO_TRACE                                                             \
  std::cerr << "func[" << __func__ << "], lineno[" << __LINE__ << "], tid["    \
            << gettid() << "], thread_id[" << std::this_thread::get_id()       \
            << "]" << std::endl;
