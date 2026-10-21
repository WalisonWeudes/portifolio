import { useEffect } from 'react'

/**
 * Publica a velocidade do scroll como a variável CSS --kv no <html>
 * (-1 a 1, suavizada, volta a 0 quando o scroll para). Usada pela tipografia cinética.
 */
export function useScrollVelocity() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = null
    let lastY = window.scrollY
    let lastT = 0
    let kv = 0
    let target = 0
    const root = document.documentElement

    const tick = (now) => {
      const dt = Math.max(1, now - lastT)
      const y = window.scrollY
      const v = (y - lastY) / dt // px/ms
      lastY = y
      lastT = now
      target = Math.max(-1, Math.min(1, v / 2.6))
      // mola: segue o alvo e relaxa até zero
      kv += (target - kv) * 0.18
      if (Math.abs(kv) < 0.002 && Math.abs(target) < 0.002) {
        kv = 0
        root.style.setProperty('--kv', '0')
        frame = null
        return
      }
      root.style.setProperty('--kv', kv.toFixed(3))
      frame = requestAnimationFrame(tick)
    }

    const onScroll = () => {
      if (frame) return
      lastT = performance.now()
      frame = requestAnimationFrame(tick)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
      root.style.removeProperty('--kv')
    }
  }, [])
}
