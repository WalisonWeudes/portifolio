import { useEffect } from 'react'

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*/<>+=_'
const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]

const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Efeito "decodificar": cada letra passa por caracteres aleatórios até assentar,
 * da esquerda para a direita. Mexe só nos nós de texto (preserva <em>, <br>, etc).
 */
export function decode(el, { duration = 750 } = {}) {
  if (!el || el.dataset.decoding || reduce()) return
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  const nodes = []
  while (walker.nextNode()) {
    if (walker.currentNode.nodeValue.trim()) nodes.push(walker.currentNode)
  }
  if (!nodes.length) return

  const originals = nodes.map((n) => n.nodeValue)
  const total = originals.reduce((sum, s) => sum + s.length, 0)
  // cada caractere tem seu instante de "assentar", com um pouco de acaso
  const settleAt = originals.map((s, n) =>
    [...s].map((_, i) => {
      const before = originals.slice(0, n).reduce((sum, x) => sum + x.length, 0)
      return ((before + i) / total) * 0.75 + Math.random() * 0.25
    }),
  )

  el.dataset.decoding = '1'
  const start = performance.now()
  let lastSwap = 0

  const frame = (now) => {
    const p = Math.min(1, (now - start) / duration)
    if (now - lastSwap > 45 || p === 1) {
      lastSwap = now
      nodes.forEach((node, n) => {
        const src = originals[n]
        let out = ''
        for (let i = 0; i < src.length; i += 1) {
          const ch = src[i]
          out += ch === ' ' || ch === '\n' || p >= settleAt[n][i] ? ch : randomGlyph()
        }
        node.nodeValue = out
      })
    }
    if (p < 1) requestAnimationFrame(frame)
    else {
      nodes.forEach((node, n) => (node.nodeValue = originals[n]))
      delete el.dataset.decoding
    }
  }
  requestAnimationFrame(frame)
}

const HERO_SELECTOR = '.hero h1 .word, .hero .eyebrow, .hero__meta > span, .topbar__role span'
const SECTION_SELECTOR = [
  '.section-heading h2',
  '.section-heading > div p',
  '.compact-heading > span',
  '.compact-heading h2',
  '.about h2',
  '.about__title > p',
  '.illustrations h2',
  '.illustrations__header > div > span',
  '.contact h2',
  '.contact__top > span',
  '.case__info h3',
  '.stats__label',
  '.field__heading h3',
  '.field__heading > span',
  '.manifesto__label span:first-child',
].join(', ')

/** Decodifica o hero na entrada do site e os títulos quando entram na tela. */
export function useDecode() {
  useEffect(() => {
    let readyTimer
    const onReady = () => {
      readyTimer = setTimeout(() => {
        document.querySelectorAll(HERO_SELECTOR).forEach((el, i) => {
          setTimeout(() => decode(el, { duration: 900 }), i * 70)
        })
      }, 250)
    }
    window.addEventListener('site:ready', onReady)

    let observer
    if (!reduce() && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            decode(entry.target)
            observer.unobserve(entry.target)
          }
        },
        { threshold: 0.5 },
      )
      document.querySelectorAll(SECTION_SELECTOR).forEach((el) => observer.observe(el))
    }

    return () => {
      window.removeEventListener('site:ready', onReady)
      clearTimeout(readyTimer)
      observer?.disconnect()
    }
  }, [])
}
