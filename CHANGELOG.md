# Changelog

## [v5](https://github.com/beenotung/ts-liveview/tree/v5)

2022 - Present

- Enhanced support on html streaming to both static parts in template file and dynamic parts in typescript

  - The template file is pre-generated with response streaming enabled

  The signature of generated template function is now: `(stream, options) => void`, and the options is an object of string or "html chunk sink" (a.k.a. stream consumer function)

- Moved db/docs/erd.txt to db/erd.txt for easier access
- Update quick-erd with diagram position inlined

- Speedup dev mode restart update source file changes with esbuild (instead of tsc)

  Previous version was using tsc and nodemon in dev mode, which takes more time to load. Current version is using go-built esbuild without type checking, hence it load much faster.

  You can still get type hints from the IDE or by running `npm run type-check`, which will run tsc in watch mode without saving the built files.

## [v4](https://github.com/beenotung/ts-liveview/tree/v4)

2022

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

2022

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
