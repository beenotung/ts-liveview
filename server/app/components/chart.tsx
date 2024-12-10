import { o } from '../jsx/jsx.js'
import { Script } from './script.js'

export let ChartScript = <script src="/npm/chart.js/dist/chart.umd.js"></script>

export function Chart(attrs: {
  canvas_id: string
  skip_canvas?: boolean
  dataset_labels: string
  data_labels: string[]
  data: number[]
  type?: 'line' | 'bar'

  /**
   * @description default: `false`
   *
   * If true, scale will include 0 if it is not already included.
   * */
  beginAtZero?: boolean

  /** @description will be scaled by `grace` if specified */
  min?: number

  /** @description will be scaled by `grace` if specified */
  max?: number

  /** @description default: `3` */
  borderWidth?: number

  /**
   * @description default: `0`
   *
   * If the value is a string ending with %, it's treated as a percentage.
   *
   * If a number, it's treated as a value.
   *
   * The value is added to the maximum data value and subtracted from the minimum data.
   *
   * This extends the scale range as if the data values were that much greater.
   *  */
  grace?: number | string
}) {
  let options = {
    type: attrs.type || 'line',
    data: {
      labels: attrs.data_labels,
      datasets: [
        {
          label: attrs.dataset_labels,
          data: attrs.data,
          borderWidth: attrs.borderWidth,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: attrs.beginAtZero,
          grace: attrs.grace,
          suggestedMin: attrs.min,
          suggestedMax: attrs.max,
        },
      },
    },
  }
  let script = Script(/* javascript */ `
    (function initChart (){
      if (typeof Chart === 'undefined') {
        // still loading
        setTimeout(initChart, 50)
        return
      }
      const canvas_id = ${JSON.stringify(attrs.canvas_id)}
      const ctx = document.getElementById(canvas_id)
      if (!ctx) {
        console.error('Chart: no element found with id: ', canvas_id)
        console.error('Failed to find chart element:', { canvas_id })
        return
      }
      const options = ${JSON.stringify(options)}
      const chart = new Chart(ctx, options)
    })();
  `)
  return (
    <>
      {attrs.skip_canvas ? null : <canvas id={attrs.canvas_id} />}
      {script}
    </>
  )
}
