import confetti, { Options } from 'canvas-confetti'

declare module 'canvas-confetti' {
  export interface Options {
    flat?: boolean
  }
}

export let confettiConfig = {
  rate: 1,
}

export function fireConfetti(count = 200) {
  let defaults: Options = {
    origin: { y: 0.9 },
  }
  function fire(particleRatio: number, opts: Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio * confettiConfig.rate),
    })
  }
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  })
  fire(0.2, {
    spread: 60,
  })
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  })
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  })
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  })
}

export function fireStar() {
  var defaults = {
    spread: 360,
    ticks: 150,
    gravity: 0,
    decay: 0.94,
    startVelocity: 15,
    colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8'],
  }

  function shoot() {
    confetti({
      ...defaults,
      particleCount: 60 * confettiConfig.rate,
      scalar: 1.2,
      shapes: ['star'],
    })

    confetti({
      ...defaults,
      particleCount: 20 * confettiConfig.rate,
      scalar: 0.75,
      shapes: ['circle'],
    })
  }

  setTimeout(shoot, 0)
  setTimeout(shoot, 150)
  setTimeout(shoot, 300)
}

function splitEmoji(emoji: string) {
  let chars: string[] = []
  for (let char of emoji) {
    chars.push(char)
  }
  return chars
}

export function fireEmoji(emoji: string = '🦄🤩🪅') {
  var scalar = 2
  var emojiShapes = splitEmoji(emoji).map(text =>
    confetti.shapeFromText({ text, scalar }),
  )

  var defaults = {
    spread: 360,
    ticks: 300,
    gravity: 0,
    decay: 0.9,
    startVelocity: 15,
    scalar,
  }

  function shoot() {
    function show(shapes: Options['shapes']) {
      confetti({
        ...defaults,
        shapes,
        particleCount: Math.ceil(30 / emojiShapes.length) * confettiConfig.rate,
      })

      confetti({
        ...defaults,
        shapes,
        particleCount: 2 * confettiConfig.rate,
        flat: true,
      })
    }
    for (let emojiShape of emojiShapes) {
      show([emojiShape])
    }

    confetti({
      ...defaults,
      particleCount: 15 * confettiConfig.rate,
      scalar: scalar / 2,
      shapes: ['circle'],
    })
  }

  setTimeout(shoot, 0)
  setTimeout(shoot, 100)
  setTimeout(shoot, 200)
}

Object.assign(window, {
  fireConfetti,
  fireStar,
  fireEmoji,
})
