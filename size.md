## Client js size

| File                       | Size    |
| -------------------------- | ------- |
| _source files_             | -       |
| client/jsx/dom.js          | 2.64 KB |
| client/index.js            | 1.37 KB |
| client/ws/ws-lite.js       | 851 B   |
| client/ws/ws-config.js     | 58 B    |
| _bundled + minified files_ | -       |
| build/index.js             | 4.91 KB |
| build/index.js.gz          | 1.92 KB |

## WebSocket Client Size Comparison

| Name            |  .js | min.js | .min.js.gz |
| --------------- | ---: | -----: | ---------: |
| **ws-native**   | 1.1K |   0.5K |       0.3K |
| **ws-lite**     | 2.5K |   1.4K |       0.6K |
| **ws-reliable** | 4.7K |   1.9K |       0.8K |
| primus.js       |  97K |    32K |        11K |
| socket.io.js    | 181K |    64K |        15K |

**Remark**: `ws-lite` is ready for usage; `ws-reliable` is still WIP.

Details refers to [client/ws/readme.md](./client/ws/readme.md)

### Reference

source: https://bundlephobia.com/

| Network     | Download Speed (kB/s) |
| ----------- | --------------------- |
| 2g edge     | 30                    |
| emerging 3g | 50                    |
