## Client js size

| File                       | Size   |
| -------------------------- | ------ |
| _source files_             | -      |
| client/jsx/dom.js          | 6.5 KB |
| client/index.js            | 3.8 KB |
| client/ws/ws-lite.js       | 2.5 KB |
| client/ws/ws-config.js     | 280 B  |
| _bundled + minified files_ | -      |
| build/index.js             | 6.2 KB |
| build/index.js.gz          | 2.2 KB |

## WebSocket Client Size Comparison

| Name          |  .js | min.js | .min.js.gz |
| ------------- | ---: | -----: | ---------: |
| **ws-native** | 1.1K |   0.5K |       0.3K |
| **ws-lite**   | 2.5K |   1.4K |       0.6K |
| primus.js     |  97K |    32K |        11K |
| socket.io.js  | 181K |    64K |        15K |

Details refers to [client/ws/readme.md](./client/ws/readme.md)

### Reference

source: https://bundlephobia.com/

| Network     | Download Speed (kB/s) |
| ----------- | --------------------- |
| 2g edge     | 30                    |
| emerging 3g | 50                    |
