import { useEffect } from 'react'

// Rolagem "em cenas", no estilo de site de produtora:
//  1. Seções empilhadas: cada seção rola normalmente até o fim dela encostar no
//     rodapé da tela; aí ela PARA (sticky) e a próxima sobe por cima, cobrindo-a.
//     A que está sendo coberta escurece (--cover 0→1).
//  2. Imagens que abrem com a rolagem: começam como uma faixa estreita no centro e
//     se abrem até a largura toda (--open 0→1), presas ao scroll.
//  3. Títulos que se preenchem: as letras dos títulos grandes vão de apagadas a
//     sólidas conforme a rolagem (--fill 0→1).
// Tudo é calculado num único requestAnimationFrame por quadro de scroll.

export const SCENE_IDS = ['inicio', 'produtos', 'projetos', 'figma', 'sobre', 'experiencia', 'habilidades', 'ilustracoes', 'contato']
const OPEN_SELECTOR = '.pcard__media, .reveal-image, .about__media img'
const FILL_SELECTOR = 'section h2'

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)

// Topo "natural" (sem sticky) de uma seção-cena: soma das alturas das anteriores.
// Necessário porque uma seção presa (sticky) informa a posição presa, não a real.
export function sceneTop(el) {
  const scenes = SCENE_IDS.map((id) => document.getElementById(id)).filter(Boolean)
  const index = scenes.indexOf(el)
  if (index < 0 || !document.documentElement.classList.contains('has-scenes')) return null
  // offsetTop de um sticky preso devolve a posição presa: parte do topo do
  // contêiner e soma tudo que vem antes no fluxo (os fixos do header não contam)
  const parent = scenes[0].parentElement
  let top = parent.getBoundingClientRect().top + window.scrollY
  for (const child of parent.children) {
    if (child === el) return top
    const pos = getComputedStyle(child).position
    if (pos !== 'fixed' && pos !== 'absolute') top += child.offsetHeight
  }
  return top
}

export function useScrollScenes() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const root = document.documentElement
    const scenes = SCENE_IDS.map((id) => document.getElementById(id)).filter(Boolean)
    if (scenes.length < 2) return

    // fundo opaco para cobrir a seção anterior: usa o fundo próprio da seção
    // (Figma e Contato são claros) e, se ela for transparente, o fundo do site
    const bgOf = (el) => {
      const bg = getComputedStyle(el).backgroundColor
      return bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)' ? getComputedStyle(document.body).backgroundColor : bg
    }
    const backgrounds = scenes.map(bgOf)

    root.classList.add('has-scenes')
    scenes.forEach((el, i) => {
      el.style.setProperty('--scene-bg', backgrounds[i])
      el.classList.add('scene')
      el.style.zIndex = String(i + 1)
    })

    let vh = window.innerHeight
    let frame = null

    // topo do sticky = vh - altura (negativo em seções altas): a seção só para
    // quando o fim dela chega ao rodapé da tela
    const layout = () => {
      vh = window.innerHeight
      for (const el of scenes) el.style.top = `${Math.min(0, vh - el.offsetHeight)}px`
      schedule()
    }

    const indexHeading = (h) => {
      const chars = h.querySelectorAll('.kt__char')
      if (!chars.length || Number(h.dataset.fillN) === chars.length && chars[0].style.getPropertyValue('--fi')) return
      chars.forEach((c, i) => c.style.setProperty('--fi', i))
      h.dataset.fillN = chars.length
      h.style.setProperty('--fn', chars.length)
      h.classList.add('scrub-fill')
    }

    const update = () => {
      frame = null

      // 1. cobertura: quanto a próxima seção já subiu sobre esta
      for (let i = 0; i < scenes.length - 1; i += 1) {
        const nextTop = scenes[i + 1].getBoundingClientRect().top
        const cover = clamp01(1 - nextTop / vh)
        const prev = scenes[i].style.getPropertyValue('--cover')
        const val = cover.toFixed(3)
        if (prev !== val) scenes[i].style.setProperty('--cover', val)
      }

      // 2. imagens que abrem (só as perto da tela)
      for (const el of document.querySelectorAll(OPEN_SELECTOR)) {
        const r = el.getBoundingClientRect()
        if (r.top > vh * 2) continue // abaixo da tela: ainda não importa (acima: termina em 1)
        // abre enquanto o topo vai de 100% a 35% da tela
        const open = clamp01((vh - r.top) / (vh * 0.65))
        el.style.setProperty('--open', (1 - (1 - open) ** 2).toFixed(3))
        el.classList.add('scrub-open')
      }

      // 3. títulos que se preenchem
      for (const h of document.querySelectorAll(FILL_SELECTOR)) {
        const r = h.getBoundingClientRect()
        if (r.top > vh * 2) continue // abaixo da tela: ainda não importa (acima: termina em 1)
        indexHeading(h)
        // preenche enquanto o título sobe de 90% a 30% da tela
        h.style.setProperty('--fill', clamp01((vh * 0.9 - r.top) / (vh * 0.6)).toFixed(3))
      }
    }

    function schedule() {
      if (frame === null) frame = requestAnimationFrame(update)
    }

    const ro = new ResizeObserver(layout)
    scenes.forEach((el) => ro.observe(el))
    window.addEventListener('resize', layout)
    window.addEventListener('scroll', schedule, { passive: true })
    // troca de idioma recria as letras dos títulos
    const mo = new MutationObserver(schedule)
    mo.observe(document.querySelector('.site-shell') || document.body, { childList: true, subtree: true })
    layout()

    return () => {
      ro.disconnect()
      mo.disconnect()
      window.removeEventListener('resize', layout)
      window.removeEventListener('scroll', schedule)
      if (frame !== null) cancelAnimationFrame(frame)
      root.classList.remove('has-scenes')
      scenes.forEach((el) => {
        el.classList.remove('scene')
        el.style.removeProperty('top')
        el.style.removeProperty('z-index')
        el.style.removeProperty('--cover')
        el.style.removeProperty('--scene-bg')
      })
    }
  }, [])
}
