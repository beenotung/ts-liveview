## Benchmark

| Test               | Speed     |
| ------------------ | --------- |
| string += 'foo'    | 3500k tps |
| innerHTML += 'foo' | 8k tps    |
| socket.io echo     | 3k tps    |
| primus.js echo     | 5k tps    |

### Observation

- string concat is >400x faster than innerHTML concat
- primus is 60% faster than socket.io
