# Changelog

## [v2](https://github.com/beenotung/ts-liveview/tree/v2-rc3-jsx-with-context)

2021 - Present (2022)

- Removed dependency on s-js, morphdom, and primus
- Switched content format from template-string to JSX/AST with out-of-the-box html-injection protection
- Switched DOM update approach from generic template-string static-dynamic-diffing based patching to application-specific (direct) dom updates
- Support html streaming for initial GET request

## [v1](https://github.com/beenotung/ts-liveview/tree/v1)

2020 - 2021

- Made API more concise (especially for usage with s-js)
- Support repeated components (e.g. map on array with shared template)

## [v0](https://github.com/beenotung/ts-liveview/tree/v0)

2020

- Support pre-rendering
- Support live-update with diff-based patching with morphdom and primus
