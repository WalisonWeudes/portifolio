import { useEffect, useRef } from 'react'

/**
 * Chama `onProgress` a cada frame de scroll (via rAF, só quando há scroll/resize).
 * Útil para cenas "presas" (sticky) cujo estado depende da posição na página.
 */
export function useScrollFrame(onProgress) {
  // guarda sempre a versão mais nova do callback sem re-registrar os listeners
  const callback = useRef(onProgress)
  useEffect(() => {
    callback.current = onProgress
  })

  useEffect(() => {
    let ticking = false
    let frame = null

    const run = () => {
      ticking = false
      callback.current()
    }
    const request = () => {
      if (ticking) return
      ticking = true
      frame = requestAnimationFrame(run)
    }

    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', request, { passive: true })
    request()
    return () => {
      window.removeEventListener('scroll', request)
      window.removeEventListener('resize', request)
      cancelAnimationFrame(frame)
    }
  }, [])
}

/** Progresso 0–1 de um contêiner alto com conteúdo sticky (do topo até o fim). */
export const stickyProgress = (el) => {
  const rect = el.getBoundingClientRect()
  const span = rect.height - window.innerHeight
  if (span <= 0) return rect.top <= 0 ? 1 : 0
  return Math.min(1, Math.max(0, -rect.top / span))
}
