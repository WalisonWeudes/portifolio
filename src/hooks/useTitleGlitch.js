import { useEffect } from 'react'

const TITLE_SELECTOR = [
  '.section-heading h2',
  '.compact-heading h2',
  '.about h2',
  '.illustrations h2',
  '.contact h2',
  '.case__info h3',
  '.figma-row h3',
  '.stack__group h3',
  '.experience-list h3',
].join(', ')

const ACTIVE_CLASS = 'subtle-title-glitch-active'

/**
 * Glitch discreto: só ao passar o mouse, um breve split de cor no texto.
 * Sem troca de fonte, sem tremor e sem disparos aleatórios.
 */
export function useTitleGlitch() {
  useEffect(() => {
    if (!window.matchMedia('(hover: hover)').matches) return

    let current = null
    let timer

    const onOver = (event) => {
      const title = event.target.closest?.(TITLE_SELECTOR)
      if (!title || title === current) return
      current?.classList.remove(ACTIVE_CLASS)
      current = title
      title.classList.add(ACTIVE_CLASS)
      clearTimeout(timer)
      timer = setTimeout(() => {
        title.classList.remove(ACTIVE_CLASS)
        current = null
      }, 260)
    }

    document.addEventListener('mouseover', onOver, { passive: true })
    return () => {
      document.removeEventListener('mouseover', onOver)
      clearTimeout(timer)
    }
  }, [])
}
