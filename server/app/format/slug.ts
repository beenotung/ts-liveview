/**
 * convert non-url safe characters to hyphen (-),
 * and turn into lowercase.
 *
 * e.g. "Hello World" -> "hello-world"
 */
export function toSlug(value: string): string {
  value = value.trim()
  if (value.startsWith('e.g. ')) {
    value = value.split(' ').pop()!
  }
  value = value
    .replaceAll(' ', '-')
    .replaceAll('#', '-')
    .replaceAll(':', '-')
    .replaceAll('/', '-')
    .replaceAll('\\', '-')
    .replaceAll('"', '-')
    .replaceAll('`', '-')
    .replaceAll("'", '-')
    .replaceAll('&', '-')
    .replaceAll('?', '-')
  return value
}
