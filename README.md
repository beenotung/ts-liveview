# TS LiveView

LiveView enables rich, real-time user experiences with server-rendered HTML.

Just like [Phoenix LiveView](https://github.com/phoenixframework/phoenix_live_view) but in Typescript!

[![npm Package Version](https://img.shields.io/npm/v/ts-liveview.svg?maxAge=2592000)](https://www.npmjs.com/package/ts-liveview)

## Why server-rendered?
- To make the PWA deliver initial meaningful paint as soon as possible
- To avoid over bloating the amount of javascript the client need to download
- To allow 'over-the-air' update of application deployment

## Features
- [x] Return rich layout on initial GET request in one-pass
- [x] Progressive enhancement for interactivity
- [x] Realtime Server side 'rendering' for incremental update
- [x] Bidirectional event push

## Todo
- [x] Auto reconnect the websocket
- [ ] Recover session when reconnect*

*: maybe [Primus](https://github.com/primus/primus) can helps

## LICENSE
[BSD-2-Clause LICENSE](./LICENSE)
(Free Open Source Software)
