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
