export function Raw(props: { html: string }): JSX.Element {
  return ['raw', props.html] as any
}
