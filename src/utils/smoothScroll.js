// Rolagem suave com inércia (Lenis), no estilo de sites de produtora.
// Só liga com mouse/trackpad e sem "reduzir movimento"; no toque o navegador rola nativo.
// O Lenis continua usando a rolagem nativa da janela, então os hooks que escutam
// `scroll` e o IntersectionObserver seguem funcionando sem mudança.
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

let lenis = null

export const getLenis = () => lenis

export function startSmoothScroll() {
  if (lenis || typeof window === 'undefined') return null
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null

  lenis = new Lenis({
    lerp: 0.09,
    wheelMultiplier: 0.95,
    // overlays com rolagem própria (lightbox, menu, jogo) não são sequestrados
    prevent: (node) => Boolean(node.closest?.('.lightbox, .mobile-menu, .spider-game, [data-lenis-prevent]')),
  })

  // Quando algo trava a página (overflow: hidden no <html>, ex.: jogo ou menu aberto),
  // o Lenis pausa junto.
  const root = document.documentElement
  const syncLock = () => (root.style.overflow === 'hidden' ? lenis.stop() : lenis.start())
  new MutationObserver(syncLock).observe(root, { attributes: true, attributeFilter: ['style'] })

  const raf = (time) => {
    lenis?.raf(time)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)
  return lenis
}

// Rola até um alvo (elemento, seletor ou número), com ou sem Lenis.
export function scrollToTarget(target, { offset = 0, immediate = false, onComplete } = {}) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (lenis) {
    lenis.scrollTo(target, { offset, immediate: immediate || reduce, duration: 1.3, onComplete, force: true })
    return
  }
  const el = typeof target === 'string' ? document.querySelector(target) : target
  const top = typeof el === 'number' ? el : el.getBoundingClientRect().top + window.scrollY + offset
  window.scrollTo({ top, behavior: immediate || reduce ? 'instant' : 'smooth' })
  if (onComplete) {
    if (immediate || reduce) onComplete()
    else {
      const done = () => {
        clearTimeout(t)
        window.removeEventListener('scrollend', done)
        onComplete()
      }
      const t = setTimeout(done, 2500)
      window.addEventListener('scrollend', done, { once: true })
    }
  }
}
