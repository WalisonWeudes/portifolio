import { onBeforeUnmount, onMounted } from 'vue'

const HOVER_SELECTOR = 'a, button, .case__preview, .illustration-item, input, textarea'
const MAGNETIC_SELECTOR = '.text-link, .brand'
const TILT_SELECTOR = '.case__visual'

/**
 * Interações só para mouse (pointer: fine): cursor em anel, efeito magnético,
 * tilt 3D nos cards e parallax no hero. Tudo via rAF e sem re-render do Vue.
 */
export function usePointerEffects() {
  let ring
  let frame = null
  let pos = { x: -100, y: -100 }
  let ringPos = { x: -100, y: -100 }
  let magnetic = null
  let tilt = null
  let lastEvent = null
  let running = false

  const reset = (el) => {
    if (el) el.style.transform = ''
  }

  const paint = () => {
    frame = null
    if (!lastEvent) return
    const { clientX: x, clientY: y, target } = lastEvent
    pos = { x, y }

    // Parallax do hero
    const root = document.documentElement.style
    root.setProperty('--mx', (x / window.innerWidth - 0.5).toFixed(3))
    root.setProperty('--my', (y / window.innerHeight - 0.5).toFixed(3))

    ring?.classList.toggle('is-hover', !!target.closest?.(HOVER_SELECTOR))

    // Magnético
    const mag = target.closest?.(MAGNETIC_SELECTOR) || null
    if (mag !== magnetic) {
      reset(magnetic)
      magnetic = mag
    }
    if (mag) {
      const r = mag.getBoundingClientRect()
      const dx = (x - (r.left + r.width / 2)) * 0.22
      const dy = (y - (r.top + r.height / 2)) * 0.3
      mag.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`
    }

    // Tilt
    const card = target.closest?.(TILT_SELECTOR) || null
    if (card !== tilt) {
      reset(tilt)
      tilt = card
    }
    if (card) {
      const r = card.getBoundingClientRect()
      const px = (x - r.left) / r.width - 0.5
      const py = (y - r.top) / r.height - 0.5
      card.style.transform = `perspective(1100px) rotateX(${(py * -4).toFixed(2)}deg) rotateY(${(px * 5).toFixed(2)}deg)`
    }
  }

  const loop = () => {
    if (!running) return
    ringPos.x += (pos.x - ringPos.x) * 0.2
    ringPos.y += (pos.y - ringPos.y) * 0.2
    if (ring) ring.style.transform = `translate3d(${ringPos.x.toFixed(1)}px, ${ringPos.y.toFixed(1)}px, 0)`
    requestAnimationFrame(loop)
  }

  const onMove = (event) => {
    lastEvent = event
    if (!ring.classList.contains('is-visible')) {
      ringPos = { x: event.clientX, y: event.clientY }
      ring.classList.add('is-visible')
    }
    if (!frame) frame = requestAnimationFrame(paint)
  }
  const onLeave = () => ring?.classList.remove('is-visible')
  const onDown = () => ring?.classList.add('is-down')
  const onUp = () => ring?.classList.remove('is-down')

  onMounted(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduce) return

    ring = document.createElement('div')
    ring.className = 'cursor-ring'
    ring.setAttribute('aria-hidden', 'true')
    document.body.appendChild(ring)

    document.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('mouseup', onUp)
    running = true
    requestAnimationFrame(loop)
  })

  onBeforeUnmount(() => {
    running = false
    cancelAnimationFrame(frame)
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseleave', onLeave)
    document.removeEventListener('mousedown', onDown)
    document.removeEventListener('mouseup', onUp)
    ring?.remove()
  })
}
