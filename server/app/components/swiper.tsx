import { o } from '../jsx/jsx.js'
import { NodeList } from '../jsx/types.js'
import { mapArray } from './fragment.js'
import { Raw } from './raw.js'
import Style from './style.js'

export function Swiper(
  attrs: {
    id: string
    initialSlide?: number // default 0
    style?: string
    themeColor?: string
    width?: string | number
    height?: string | number
    interval?: number
    showArrow?: boolean
    showPagination?: boolean
    keepTallest?: boolean
    maxHeight?: string // default "unset !important"
  } & (
    | {
        slides: NodeList
        images?: never
      }
    | {
        slides?: never
        images: NodeList
      }
  ),
) {
  let css = /* css */ `
.swiper {
  transition: max-height 0.3s;
  --swiper-theme-color: var(--ion-color-primary);
}
.swiper-wrapper {
  transition: transform 0.3s;
}
.swiper-pagination-bullet {
  cursor: pointer;
}
`
  let maxHeight = attrs.maxHeight ?? 'unset !important'
  if (maxHeight) {
    css += /* css */ `
#${attrs.id} {
  max-height: ${maxHeight};
}
`
  }
  if (attrs.images) {
    css += /* css */ `
.swiper-slide {
  display: flex;
}
.swiper-pagination-images {
  display: flex;
  position: static;
}
.swiper-pagination-images img {
  width: var(--swiper-pagination-image-size,3rem);
  height: var(--swiper-pagination-image-size,3rem);
}
.swiper-pagination-image {
  display: flex;
}
`
  }
  let styles: string[] = []
  if (attrs.width) styles.push('width:' + toSize(attrs.width))
  if (attrs.height) styles.push('height:' + toSize(attrs.height))
  if (attrs.themeColor) styles.push('--swiper-theme-color:' + attrs.themeColor)
  if (attrs.style) styles.push(attrs.style)

  let setupArgs: (string | number)[] = [
    `document.getElementById('${attrs.id}')`,
    attrs.initialSlide || 0,
  ]
  if (attrs.interval) {
    setupArgs.push(attrs.interval)
  }

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"
      />
      {Style(css)}
      <div id={attrs.id} class="swiper" style={styles.join(';')}>
        <div class="swiper-wrapper">
          {mapArray(attrs.slides || attrs.images, content => (
            <div class="swiper-slide">{content}</div>
          ))}
        </div>
        {attrs.showPagination ? (
          attrs.images ? (
            <div class="swiper-pagination swiper-pagination-images swiper-pagination-horizontal">
              {mapArray(attrs.images, (slide, i) => (
                <span
                  class="swiper-pagination-image"
                  onclick={`swiperSlide(this, '${i}')`}
                >
                  {slide}
                </span>
              ))}
            </div>
          ) : (
            <div class="swiper-pagination swiper-pagination-bullets swiper-pagination-horizontal">
              {mapArray(attrs.slides, (slide, i) => (
                <span
                  class="swiper-pagination-bullet"
                  onclick={`swiperSlide(this, '${i}')`}
                ></span>
              ))}
            </div>
          )
        ) : null}
        {attrs.showArrow ? (
          <>
            <div
              class="swiper-button-prev"
              onclick="swiperSlide(this, -1)"
            ></div>
            <div
              class="swiper-button-next"
              onclick="swiperSlide(this, +1)"
            ></div>
          </>
        ) : null}
      </div>
      {Raw(/* html */ `
<script>
function swiperSlide(swiper, dir) {
  swiper = swiper.closest('.swiper')
  let wrapper = swiper.querySelector('.swiper-wrapper')
  let slides = swiper.querySelectorAll('.swiper-slide')
  let n = slides.length
  let index = typeof dir === 'string'
    ? +dir
    : ((+wrapper.dataset.index || 0) + dir)
  index = (index + n) % n
  wrapper.dataset.index = index
  wrapper.style.transform = 'translateX(-' + index + '00%)'
  if (${!(attrs.keepTallest || false)}) {
    let slide = slides[index]
    swiper.style.maxHeight = 'auto'
    let rect = slide.getBoundingClientRect()
    swiper.style.maxHeight = rect.height + 'px'
  }
  swiper.querySelectorAll('.swiper-pagination-bullet').forEach((e, i) => {
    if (i == index) {
      e.setAttribute('aria-current', 'true')
      e.classList.add('swiper-pagination-bullet-active')
    } else {
      e.removeAttribute('aria-current')
      e.classList.remove('swiper-pagination-bullet-active')
    }
  })
}
function swiperSetup(swiper, index, interval) {
  swiperSlide(swiper, String(index))
  if (!interval) return
  function autoSlide() {
    swiperSlide(swiper, +1)
  }
  let timer
  function start() {
    timer = setInterval(autoSlide, interval)
  }
  function pause() {
    clearInterval(timer)
  }
  swiper.addEventListener('mouseover', pause)
  swiper.addEventListener('mouseout', start)
  window.addEventListener('mousedown', pause)
  window.addEventListener('mouseup', start)
  window.addEventListener('touchstart', pause)
  window.addEventListener('touchend', start)
  window.addEventListener('touchcancel', start)
  start()
}
swiperSetup(${setupArgs})
</script>
`)}
    </>
  )
}

function toSize(size: number | string): string {
  return typeof size === 'number' ? size + 'px' : size
}
