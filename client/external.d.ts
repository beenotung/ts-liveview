declare module JSX {
  type Element = any
  interface IntrinsicElements {
    [elemName: string]: any
  }
}
