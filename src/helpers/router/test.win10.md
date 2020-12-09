Time needed for first-run.

(Add some spaces in file to invalid the cache before running tests)

## On Windows 10

### Spec
```
Processor: Intel(R) Core(TM) i7-8550U CPU @ 1.80GHz 1.99 GHz
Ram: 16.0 GB
System Type: 64-bit operating system, x64-based processor
```

### Test with ts-mocha
```bash
  √ should handle 404
  √ should handle root route
  √ should handle multiple direct match routes
  √ should handle multiple level of direct match route
  √ should handle single route with params
  √ should handle single route with multiple params
  √ should handle multiple routes with params
  √ should handle mixed routes w/wo params
  √ should handle routes with query

  9 passing (12ms)


real    0m1.086s
user    0m0.030s
sys     0m0.227s
```

### Test with jest
```bash
 PASS  core.spec.ts (7.039 s)
  √ should handle 404 (2 ms)
  √ should handle root route
  √ should handle multiple direct match routes (1 ms)
  √ should handle multiple level of direct match route
  √ should handle single route with params (1 ms)
  √ should handle single route with multiple params (1 ms)
  √ should handle multiple routes with params
  √ should handle mixed routes w/wo params (1 ms)
  √ should handle routes with query (1 ms)

Test Suites: 1 passed, 1 total
Tests:       9 passed, 9 total
Snapshots:   0 total
Time:        7.14 s
Ran all test suites matching /src\\helpers\\router\\core.spec.ts/i.

real    0m8.315s
user    0m0.076s
sys     0m0.122s
```
