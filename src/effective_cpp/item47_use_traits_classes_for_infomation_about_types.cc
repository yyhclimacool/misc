#include <iostream>
#include <iterator>
#include <stdexcept>
#include <thread>

#define TRACE                                                                  \
  std::cout << "func[" << __func__ << "], lineno[" << __LINE__ << "], tid["    \
            << gettid() << "], thread_id[" << std::this_thread::get_id()       \
            << "]" << std::endl

class AeroInputIteratorType {
public:
  typedef std::input_iterator_tag iterator_type;
  AeroInputIteratorType operator++(int) {
    auto tmp = *this;
    idx++;
    return tmp;
  }

private:
  int idx = 0;
};
class AeroOutputIteratorType {
public:
  using iterator_type = std::output_iterator_tag;
  AeroOutputIteratorType operator++(int) {
    auto tmp = *this;
    idx++;
    return tmp;
  }

private:
  int idx = 0;
};
class AeroForwardIteratorType {
public:
  using iterator_type = std::forward_iterator_tag;
  AeroForwardIteratorType operator++(int d) {
    auto tmp = *this;
    idx++;
    return tmp;
  }

private:
  int idx = 0;
};
class AeroBidrectionalIteratorType {
public:
  using iterator_type = std::bidirectional_iterator_tag;
  AeroBidrectionalIteratorType operator++(int d) {
    auto tmp = *this;
    idx++;
    return tmp;
  }
  AeroBidrectionalIteratorType operator--(int d) {
    auto tmp = *this;
    idx--;
    return tmp;
  }
  int index() const { return idx; }

private:
  int idx = 0;
};
std::ostream &operator<<(std::ostream &os,
                         const AeroBidrectionalIteratorType &iter) {
  return os << iter.index();
}
class AeroRandomAccessIteratorType {
public:
  using iterator_type = std::random_access_iterator_tag;
  AeroRandomAccessIteratorType &operator+=(int d) {
    idx = +d;
    return *this;
  }

private:
  int idx = 0;
};

template <typename It> struct AeroIteratorTraits {
  using iterator_type = typename It::iterator_type;
};

// also work for std::forward_iterator_tag
template <typename I, typename D>
void aero_advance(I &iter, D d, std::input_iterator_tag) {
  TRACE;
  if (d < 0) {
    throw std::logic_error("distance must >= 0");
  }
  while (d--) {
    iter++;
  }
}
template <typename I, typename D>
void aero_advance(I &iter, D d, std::output_iterator_tag) {
  TRACE;
  if (d < 0) {
    throw std::logic_error("distance must >= 0");
  }
  while (d--) {
    iter++;
  }
}

template <typename I, typename D>
void aero_advance(I &iter, D d, std::bidirectional_iterator_tag) {
  TRACE;
  if (d >= 0) {
    while (d--) {
      iter++;
    }
  } else {
    while (d++) {
      iter--;
    }
  }
}
template <typename I, typename D>
void aero_advance(I &iter, D d, std::random_access_iterator_tag) {
  TRACE;
  iter += d;
}

template <typename IterT, typename DistT>
void aero_advance(IterT &iter, DistT d) {
  TRACE;
  aero_advance(iter, d, typename AeroIteratorTraits<IterT>::iterator_type());
}

int main() {
  AeroRandomAccessIteratorType aero_random_access_iter;
  aero_advance(aero_random_access_iter, 1);

  AeroBidrectionalIteratorType aero_bidirectional_iter;
  std::cout << "bidrectional iterator index before advance: "
            << aero_bidirectional_iter << std::endl;
  aero_advance(aero_bidirectional_iter, -1);
  std::cout << "bidrectional iterator index after advance: "
            << aero_bidirectional_iter << std::endl;

  AeroForwardIteratorType aero_forward_iter;
  aero_advance(aero_forward_iter, 1);
  // aero_advance(aero_forward_iter, -1); // this will core dump
}