import { onBeforeUnmount, onMounted } from 'vue'

/**
 * Chama `onProgress` a cada frame de scroll (via rAF, só quando há scroll/resize).
 * Útil para cenas "presas" (sticky) cujo estado depende da posição na página.
 */
export function useScrollFrame(onProgress) {
  let ticking = false

  const run = () => {
    ticking = false
    onProgress()
  }
  const request = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(run)
  }

  onMounted(() => {
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', request, { passive: true })
    request()
  })
  onBeforeUnmount(() => {
    window.removeEventListener('scroll', request)
    window.removeEventListener('resize', request)
  })

  return request
}

/** Progresso 0–1 de um contêiner alto com conteúdo sticky (do topo até o fim). */
export const stickyProgress = (el) => {
  const rect = el.getBoundingClientRect()
  const span = rect.height - window.innerHeight
  if (span <= 0) return rect.top <= 0 ? 1 : 0
  return Math.min(1, Math.max(0, -rect.top / span))
}
