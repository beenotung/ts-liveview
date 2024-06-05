/**
 * @reference RouteParameters in @types/express-serve-static-core.
 * Modified to allow passing number in params
 * */

type ParamValue = string | number

interface ParamsDictionary {
  [key: string]: ParamValue
}

type RemoveTail<
  S extends string,
  Tail extends string,
> = S extends `${infer P}${Tail}` ? P : S

type GetRouteParameter<S extends string> = RemoveTail<
  RemoveTail<RemoveTail<S, `/${string}`>, `-${string}`>,
  `.${string}`
>

export type RouteParameters<Route extends string> = string extends Route
  ? ParamsDictionary
  : Route extends `${string}(${string}`
    ? ParamsDictionary // TODO: handling for regex parameters
    : Route extends `${string}:${infer Rest}`
      ? (GetRouteParameter<Rest> extends never
          ? ParamsDictionary
          : GetRouteParameter<Rest> extends `${infer ParamName}?`
            ? { [P in ParamName]?: ParamValue }
            : { [P in GetRouteParameter<Rest>]: ParamValue }) &
          (Rest extends `${GetRouteParameter<Rest>}${infer Next}`
            ? RouteParameters<Next>
            : unknown)
      : {}
