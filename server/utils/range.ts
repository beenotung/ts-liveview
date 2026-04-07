export function clamp(args: {
  min: number
  max: number
  value: number | null | undefined | string
  default: number
}) {
  let { min, max, default: defaultValue } = args
  if (args.value === '' || args.value === null || args.value === undefined) {
    return defaultValue
  }
  let value = +args.value!
  if (min <= value && value <= max) {
    return value
  }
  if (value < min) {
    return min
  }
  if (value > max) {
    return max
  }
  return defaultValue
}
