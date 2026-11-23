// Rola até a seção do link. As seções usam content-visibility: auto, então as
// que ainda não foram desenhadas têm altura estimada; quando aparecem, a
// altura real empurra o destino. Por isso, ao chegar, a posição é conferida
// por alguns quadros e corrigida se a seção tiver saído do lugar.
export const goToSection = (event) => {
  const hash = event.currentTarget.getAttribute('href')
  const target = document.querySelector(hash)
  if (!target) return
  event.preventDefault()
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  history.pushState(null, '', hash)
  target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })

  const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
  let fallback
  const settle = () => {
    window.removeEventListener('scrollend', settle)
    clearTimeout(fallback)
    let frames = 30
    const stop = () => (frames = 0)
    const opts = { once: true, passive: true }
    ;['wheel', 'touchstart', 'keydown'].forEach((type) => window.addEventListener(type, stop, opts))
    const check = () => {
      if (frames <= 0) return
      if (Math.abs(target.getBoundingClientRect().top - pad) > 4) target.scrollIntoView({ behavior: 'instant' })
      if (--frames > 0) requestAnimationFrame(check)
      else ['wheel', 'touchstart', 'keydown'].forEach((type) => window.removeEventListener(type, stop))
    }
    requestAnimationFrame(check)
  }
  if (reduce) return settle()
  window.addEventListener('scrollend', settle)
  fallback = setTimeout(settle, 2500) // navegadores sem o evento scrollend
}
