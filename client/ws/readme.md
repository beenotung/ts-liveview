| Implementation | HeartBeat        | Auto Reconnect | Message Delivery |
| -------------- | ---------------- | -------------- | ---------------- |
| ws-native      | ping from server | supported      | best-effort      |
| ws-lite        | ping from client | supported      | best-effort      |

## Todo

- introduce min uptime to count as successful reconnection
- introduce random back-off time before reconnect
- introduce max retry for reconnection

reference: https://www.npmjs.com/package/reconnecting-websocket
