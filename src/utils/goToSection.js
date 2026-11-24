import { scrollToTarget } from './smoothScroll'
import { sceneTop } from '../hooks/useScrollScenes'

// Rola até a seção do link. As seções usam content-visibility: auto, então as
// que ainda não foram desenhadas têm altura estimada; quando aparecem, a
// altura real empurra o destino. Por isso, ao chegar, a posição é conferida
// por alguns quadros e corrigida se a seção tiver saído do lugar.
// Com a rolagem em cenas, as seções ficam presas (sticky) e informam a posição
// presa; por isso o destino usa o topo "natural" delas (sceneTop).
export const goToSection = (event) => {
  const hash = event.currentTarget.getAttribute('href')
  const target = hash && hash.startsWith('#') ? document.querySelector(hash) : null
  if (!target) return
  event.preventDefault()
  history.pushState(null, '', hash)

  const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
  const destination = () => {
    const top = sceneTop(target)
    return top === null ? target.getBoundingClientRect().top + window.scrollY - pad : Math.max(0, top - pad)
  }

  const settle = () => {
    let frames = 30
    const stop = () => (frames = 0)
    const opts = { once: true, passive: true }
    ;['wheel', 'touchstart', 'keydown'].forEach((type) => window.addEventListener(type, stop, opts))
    const check = () => {
      if (frames <= 0) return
      const y = destination()
      if (Math.abs(window.scrollY - y) > 4) scrollToTarget(y, { immediate: true })
      if (--frames > 0) requestAnimationFrame(check)
      else ['wheel', 'touchstart', 'keydown'].forEach((type) => window.removeEventListener(type, stop))
    }
    requestAnimationFrame(check)
  }
  scrollToTarget(destination(), { onComplete: settle })
}
