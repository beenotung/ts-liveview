import { o } from '../jsx/jsx.js'
import { Script } from './script.js'

export let ChartScript = <script src="/npm/chart.js/dist/chart.umd.js"></script>

export function Chart(attrs: {
  canvas_id: string
  height?: number
  width?: number
  skip_canvas?: boolean
  datasets: {
    label: string
    data: number[]
    hidden?: boolean
    borderColor?: string
    backgroundColor?: string
  }[]
  data_labels: string[]
  type?: 'line' | 'bar' | 'radar'

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
      datasets: attrs.datasets.map(dataset => ({
        label: dataset.label,
        data: dataset.data,
        borderWidth: attrs.borderWidth,
        hidden: dataset.hidden,
        borderColor: dataset.borderColor,
        backgroundColor: dataset.backgroundColor,
      })),
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
      let canvas_id = ${JSON.stringify(attrs.canvas_id)}
      let canvas = document.getElementById(canvas_id)
      if (!canvas) {
        console.error('Chart: no element found with id: ', canvas_id)
        console.error('Failed to find chart element:', { canvas_id })
        return
      }
      let options = ${JSON.stringify(options)}
      let chart = new Chart(canvas, options)
      canvas.chart = chart
    })();
  `)
  return (
    <>
      {attrs.skip_canvas ? null : (
        <canvas
          id={attrs.canvas_id}
          height={attrs.height}
          width={attrs.width}
        />
      )}
      {script}
    </>
  )
}
