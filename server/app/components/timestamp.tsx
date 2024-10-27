import { format_relative_time, setLang } from '@beenotung/tslib/format.js'
import { o } from '../jsx/jsx.js'

setLang('zh-HK')

export function relative_timestamp(time: number) {
  return (
    <time datetime={new Date(time).toISOString()}>
      {format_relative_time(time - Date.now(), 0)}
    </time>
  )
}
