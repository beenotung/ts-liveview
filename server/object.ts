// auto infer the types of keys and values
export function toEntries<T extends object>(
  object: T,
): [keyof T, T[keyof T]][] {
  return Object.entries(object) as [keyof T, T[keyof T]][]
}

export function toKeys<T extends object>(object: T): (keyof T)[] {
  return Object.keys(object) as (keyof T)[]
}
