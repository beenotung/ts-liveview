# Changelog

## [v4](https://github.com/beenotung/ts-liveview/tree/v4)

2022 - Present

- Changed signature of component function

  - Move `children?: NodeList` from 2nd argument into optional property of attrs (1st argument)
  - Pass context to component function explicitly as 2nd argument

  The signature of component function is now: `(attrs, context) => Node`

- Make transpiled jsx expression more compact

  Now using `o` as jsxFactory and `null` as jsxFragmentFactory.
  Previous version use of `JSX.createElement` and `JSX.Fragment` responsively

- Support async routing

  This enables responding contentful payload for pages that require async resources.
  This update may results in better SEO.

  Previous version requires each route to return directly, which force the application to display a loading screen if the resource is not ready.
  Now the application developer can choose to delay the response or to show a loading screen immediately.

## [v3](https://github.com/beenotung/ts-liveview/tree/v3)

2022 - 2022

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
