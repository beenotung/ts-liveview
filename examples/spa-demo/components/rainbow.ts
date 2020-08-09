// reference: https://github.com/chrismccord/phoenix_live_view_example/blob/master/lib/demo_web/live/rainbow_live.ex

import { makeArray } from '@beenotung/tslib/array'
import { format_byte } from '@beenotung/tslib/format'
import { MB } from '@beenotung/tslib/size'
import S from 's-js'
import { c, h, s } from '../lib'
import { State } from '../state'
import Timer = NodeJS.Timer

const max_tps = 100
export type RainbowBar = {
  id: string
  x: number
  translate_y: number
  rotation: number
  width: number
  hue: number
}

export class RainbowState {
  bg = 'white'
  fps = S.value(1)
  step = S.value(0.5)
  count = S.value(0)
  inner_window_width = S.value(1200)

  bar_count = S(() => Math.min(200, Math.floor(this.inner_window_width() / 15)))

  bar_width = S(() => 100 / this.bar_count())

  last_tick = Date.now()
  tps = S.value(0)

  timer?: Timer
  quota = this.state.local ? 100 * MB : 10 * MB

  constructor(public state: State) {
    S.cleanup(() => this.cleanup())
    this.timer = setTimeout(this.update, 1000 / S.sample(this.fps))
    state.events.on('rainbow', ([name, value]: [string, string]) => {
      switch (name) {
        case 'fps': {
          const fps = +value
          if (fps) {
            console.log('set fps:', S.sample(this.fps))
            this.fps(fps)
          }
          break
        }
        case 'switch':
          S.sample(() => {
            this.step(this.step() * -1)
          })
          break
      }
    })
  }
  get quota_left() {
    return this.quota - S.sample(this.state.init.sent)
  }

  update = () => {
    const count = S.sample(this.count)
    const step = S.sample(this.step)
    const newCount = count + step
    this.count(newCount)
    const now = Date.now()
    const dT = now - this.last_tick
    const tps = 1000 / dT
    this.last_tick = now
    this.tps(tps)
    if (this.quota_left > 0) {
      this.timer = setTimeout(this.update, 1000 / this.fps())
    }
  }

  cleanup() {
    if (this.timer) {
      clearTimeout(this.timer)
    }
  }
}

export function renderRainbow(session: State) {
  const state = session.rainbow
  const fps = state.fps()
  const tps = Math.ceil(state.tps())
  const bar_count = state.bar_count()
  const bar_width = state.bar_width()
  const count = state.count()
  const quota = state.quota
  const quota_left = state.quota_left

  return c(
    '.rainbow',
    h`<div class="rainbow">
<style>
.animated-sin-wave {
  position: relative;
  height: 150px;
  width: 100%;
  overflow: hidden;
}

.animated-sin-wave > .bar {
  position: absolute;
  height: 100%;
  border-radius: 50%;
  max-width:10px;
}

.animated-sin-wave-description {
  width:100%;
  text-align:center;
  font-size:0.8em;
  color:#747678;
  padding: 2em
}

.container.rainbow {
  max-width: 100%;
  text-align: center;
}
</style>
  <h2>Silky Smooth SSR</h2>
  <p>Quota: ${format_byte(quota_left)}/${format_byte(quota)}</p>
  <p>Fast enough to power animations <em>[on the server]</em> at ${fps} FPS?</p>
  <p>TPS: ${tps}</p>
  <div>
    <label>Target FPS</label>
    <input type="number" min="1" max="${max_tps}" value="${fps}" name="fps" onchange="send('rainbow','fps',this.value)"/>
    <br>
    <input type="range" min="1" max="${max_tps}" value="${fps}" name="fps" onchange="send('rainbow','fps',this.value)"/>
  </div>
  <div class="animated-sin-wave" onclick="send('rainbow','switch')" style="background: ${
    state.bg
  };">
  ${makeArray(state.bar_count(), i => {
    const bar: RainbowBar = {
      id: `bar${i}`,
      x: bar_width * i,
      translate_y: Math.sin(count / 10 + i / 5) * 100 * 0.5,
      rotation: (count + 1) % 360,
      width: bar_width,
      hue: Math.trunc((360 / bar_count) * i - count) % 360,
    }
    return c(
      '#' + bar.id,
      h`
      <div
        class="bar"
        id="${bar.id}"
        style="width: ${bar.width}%;
               left: ${bar.x}%;
               transform: scale(0.8,.5) translateY(${bar.translate_y}%) rotate(${bar.rotation}deg);
               background-color: hsl(${bar.hue},95%,55%);">
      </div>
    `,
    )
  })}
  </div>
  <br/>
  <p>
    The above animation is ${state.bar_count()} ${s('<div>')} tags.
    <br/>
    No SVG, no CSS transitions/animations.
    It's all powered by <em>TS LiveView</em> which does a full re-render every frame.
  </p>
  <p>
    Inspired by
    <a href="https://github.com/chrismccord/phoenix_live_view_example/blob/master/lib/demo_web/live/rainbow_live.ex">
      Phoenix LiveView Example
    </a>
  </p>
</div>`,
  )
}
