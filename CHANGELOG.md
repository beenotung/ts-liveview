# Changelog

## [v3](https://github.com/beenotung/ts-liveview/tree/v3)

2022 - Present
- Setup eslint
- Harden type definition and usage on Context (e.g. avoid non-null assertions and explicit-any)
- Move 3rd party libraries from `/public` to `/public/lib`
- Move ServerMessage and ClientMessage from `/client/index.ts` to `/client/types.ts`
- Remove generic types extending to ServerMessage and ClientMessage, refer to the exact type instead

## [v2](https://github.com/beenotung/ts-liveview/tree/v2)

2021 - 2022

- Removed dependency on s-js, morphdom, and primus
- Switched content format from template-string to JSX/AST with out-of-the-box html-injection protection
- Switched DOM update approach from generic template-string static-dynamic-diffing based patching to application-specific (direct) dom updates
- Support html streaming for initial GET request
- Support setting document title via websocket events

## [v1](https://github.com/beenotung/ts-liveview/tree/v1)

2020 - 2021

- Made API more concise (especially for usage with s-js)
- Support repeated components (e.g. map on array with shared template)

## [v0](https://github.com/beenotung/ts-liveview/tree/v0)

2020

- Support pre-rendering
- Support live-update with diff-based patching with morphdom and primus
