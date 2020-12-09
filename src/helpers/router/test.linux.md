Time needed for first-run.

(Add some spaces in file to invalid the cache before running tests)

## On Linux

### Spec
```
Processor: Intel(R) Core(TM) i7-6700HQ CPU @ 2.60GHz
Ram: 16.0 GB
Architecture: x86_64
```

### Test with ts-mocha
```bash
  ✓ should handle 404
  ✓ should handle root route
  ✓ should handle multiple direct match routes
  ✓ should handle multiple level of direct match route
  ✓ should handle single route with params
  ✓ should handle single route with multiple params
  ✓ should handle multiple routes with params
  ✓ should handle mixed routes w/wo params
  ✓ should handle routes with query

  9 passing (9ms)


real    0m0.520s
user    0m0.509s
sys     0m0.061s
```

### Test with jest
```bash
 PASS  src/helpers/router/core.spec.ts (7.666 s)
  ✓ should handle 404 (3 ms)
  ✓ should handle root route (1 ms)
  ✓ should handle multiple direct match routes (1 ms)
  ✓ should handle multiple level of direct match route
  ✓ should handle single route with params (2 ms)
  ✓ should handle single route with multiple params
  ✓ should handle multiple routes with params (1 ms)
  ✓ should handle mixed routes w/wo params (1 ms)
  ✓ should handle routes with query

Test Suites: 1 passed, 1 total
Tests:       9 passed, 9 total
Snapshots:   0 total
Time:        7.715 s, estimated 8 s
Ran all test suites matching /src\/helpers\/router\/core.spec.ts/i.

real    0m8.439s
user    0m9.133s
sys     0m0.388s
```
