## Client js size

### Bundled File Size

| File                   | Size |
| ---------------------- | ---- |
| build/bundle.js        | 13K  |
| build/bundle.min.js    | 6.5K |
| build/bundle.min.js.gz | 2.3K |

### Source Files Size

| File                   | Size |
| ---------------------- | ---- |
| client/index.js        | 4.2K |
| client/jsx/dom.js      | 6.9K |
| client/ws/ws-lite.js   | 2.5K |
| client/ws/ws-config.js | 280B |

## WebSocket Client Size Comparison

| Name          | bundled | + minified | + gzipped |
| ------------- | ------: | ---------: | --------: |
| **ws-native** |    1.0K |       0.4K |      0.3K |
| **ws-lite**   |    2.3K |       0.9K |      0.5K |
| primus.js     |   98.9K |      32.5K |     10.7K |
| socket.io.js  |    104K |      40.8K |     12.4K |

Details of ws-\* refers to [client/ws/readme.md](./client/ws/readme.md)

| WebSocket Client | Way to get websocket client file                |
| ---------------- | ----------------------------------------------- |
| primus.js        | fs.writeFileSync('primus.js', primus.library()) |
| socket.io.js     | wget $origin/socket.io/socket.io.js             |

| Size Type                        | Command                                                       |
| -------------------------------- | ------------------------------------------------------------- |
| bundled of ws-{native,lite}      | npx esbuild $file --bundle \| pv > /dev/null                  |
| bundled of {primus,socket.io}.js | cat $file \| pv > /dev/null                                   |
| + minified                       | npx esbuild $file --bundle --minify \| pv > /dev/null         |
| + gzipped                        | npx esbuild $file --bundle --minify \| gzip \| pv > /dev/null |

### Reference

source: https://bundlephobia.com/

| Network     | Download Speed (kB/s) |
| ----------- | --------------------- |
| 2g edge     | 30                    |
| emerging 3g | 50                    |
