#include <benchmark/benchmark.h>
#include <immintrin.h>
#include <iostream>

// static void BM_StringCreation(benchmark::State& state) {
//   for (auto _ : state)
//     std::string empty_string;
// }
// // Register the function as a benchmark
// BENCHMARK(BM_StringCreation);
//
// // Define another benchmark
// static void BM_StringCopy(benchmark::State& state) {
//   std::string x = "hello";
//   for (auto _ : state)
//     std::string copy(x);
// }
// BENCHMARK(BM_StringCopy);

constexpr int N = 1 * 1000 * 1000;
static void normal(benchmark::State &state) {
  float *a = static_cast<float *>(_mm_malloc(sizeof(float) * N, 16));
  float *b = static_cast<float *>(_mm_malloc(sizeof(float) * N, 16));
  float *c = static_cast<float *>(_mm_malloc(sizeof(float) * N, 16));

  for (int i = 0; i < N; ++i) {
    a[i] = i;
    b[i] = i * 2;
  }

  for (auto _ : state) {
    for (int i = 0; i < N; ++i) {
      c[i] = a[i] + b[i];
    }
  }

  _mm_free(a);
  _mm_free(b);
  _mm_free(c);
}

BENCHMARK(normal);

static void sse128(benchmark::State &state) {
  float *a = static_cast<float *>(_mm_malloc(sizeof(float) * N, 16));
  float *b = static_cast<float *>(_mm_malloc(sizeof(float) * N, 16));
  float *c = static_cast<float *>(_mm_malloc(sizeof(float) * N, 16));

  for (int i = 0; i < N; ++i) {
    a[i] = i;
    b[i] = i * 2;
  }

  for (auto _ : state) {
    for (int i = 0; i < N; i += 4) {
      __m128 v1 = _mm_load_ps(a + i);
      __m128 v2 = _mm_load_ps(b + i);
      __m128 v3 = _mm_add_ps(v1, v2);
      _mm_store_ps(c + i, v3);
    }
  }

  _mm_free(a);
  _mm_free(b);
  _mm_free(c);
}
BENCHMARK(sse128);

static void avx256(benchmark::State &state) {
  float *a = static_cast<float *>(_mm_malloc(sizeof(float) * N, 16));
  float *b = static_cast<float *>(_mm_malloc(sizeof(float) * N, 16));
  float *c = static_cast<float *>(_mm_malloc(sizeof(float) * N, 16));

  for (int i = 0; i < N; ++i) {
    a[i] = i;
    b[i] = i * 2;
  }

  for (auto _ : state) {
    for (int i = 0; i < N; i += 8) {
      __m256 v1 = _mm256_load_ps(a + i);
      __m256 v2 = _mm256_load_ps(b + i);
      __m256 v3 = _mm256_add_ps(v1, v2);
      _mm256_store_ps(c + i, v3);
    }
  }

  _mm_free(a);
  _mm_free(b);
  _mm_free(c);
}
BENCHMARK(avx256);

inline double compute_pi_naive(size_t dt) {
  double pi = 0.0;
  double delta = 1.0 / dt;
  for (size_t i = 0; i < dt; ++i) {
    double x = (double)i / dt;
    pi += delta / (1.0 + x * x);
  }
  return pi * 4.0;
}

inline double compute_pi_avx256(size_t dt) {
  double pi = 0.0;
  double delta = 1.0 / dt;
  __m256d ymm0, ymm1, ymm2, ymm3, ymm4;
  ymm0 = _mm256_set1_pd(1.0);
  ymm1 = _mm256_set1_pd(delta);
  ymm2 = _mm256_set_pd(0.0, delta, delta * 2, delta * 3);
  ymm4 = _mm256_setzero_pd();
  for (size_t i = 0; i < dt; i += 4) {
    ymm3 = _mm256_set1_pd(i * delta);
    ymm3 = _mm256_add_pd(ymm3, ymm2);
    ymm3 = _mm256_mul_pd(ymm3, ymm3);
    ymm3 = _mm256_add_pd(ymm0, ymm3);
    ymm3 = _mm256_div_pd(ymm1, ymm3);
    ymm4 = _mm256_add_pd(ymm4, ymm3);
  }
  double tmp[4];
  _mm256_storeu_pd(tmp, ymm4);
  pi = (tmp[0] + tmp[1]) + (tmp[2] + tmp[3]);

  return pi * 4.0;
}

static void BM_compute_pi_naive(benchmark::State &state) {
  for (auto _ : state) {
    auto pi = compute_pi_naive(1000000);
    benchmark::DoNotOptimize(pi);
  }
}
BENCHMARK(BM_compute_pi_naive);
static void BM_compute_pi_avx256(benchmark::State &state) {
  for (auto _ : state) {
    auto pi = compute_pi_avx256(1000000);
    benchmark::DoNotOptimize(pi);
  }
}
BENCHMARK(BM_compute_pi_avx256);

BENCHMARK_MAIN();