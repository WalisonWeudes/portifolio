// Tipografia cinética: cada letra é um elemento próprio que
//  1. entra em cascata de trás de uma máscara quando o texto aparece na tela;
//  2. inclina e ondula com a velocidade do scroll (variável --kv do <html>);
//  3. estica e sobe perto do cursor.
import { useEffect, useMemo, useRef, useState } from 'react'
import './KineticText.css'

const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

const splitWords = (text) => {
  let i = 0
  return text.split(' ').map((word, w, all) => ({
    chars: [...(word + (w < all.length - 1 ? ' ' : ''))].map((c) => {
      const ch = { c, i, wave: Math.sin(i * 1.7) } // padrão de onda por letra
      i += 1
      return ch
    }),
  }))
}

export default function KineticText({ text, entrance = true }) {
  const root = useRef(null)
  // hidden → in (entrando) → live (reagindo a scroll/cursor)
  const [state, setState] = useState(entrance ? 'hidden' : 'live')
  const words = useMemo(() => splitWords(text), [text])
  const charCount = words.reduce((sum, w) => sum + w.chars.length, 0)

  // valores mutáveis que não precisam de re-render
  const live = useRef({ chars: [], pointer: null, frame: null, liveTimer: null, state })
  live.current.state = state

  const enter = () => {
    setState('in')
    clearTimeout(live.current.liveTimer)
    live.current.liveTimer = setTimeout(() => setState('live'), 600 + charCount * 12)
  }

  // Proximidade do cursor → --p (0 a 1) em cada letra
  const paint = () => {
    const ctx = live.current
    ctx.frame = null
    if (!ctx.pointer) return
    for (const el of ctx.chars) {
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      const d = Math.hypot(ctx.pointer.x - cx, (ctx.pointer.y - cy) * 1.4)
      const radius = Math.max(90, r.height * 1.6)
      const p = Math.max(0, 1 - d / radius)
      el.style.setProperty('--p', (p * p * (3 - 2 * p)).toFixed(3))
    }
  }
  const onEnter = () => {
    if (reduce() || !window.matchMedia('(hover: hover)').matches) return
    live.current.chars = [...root.current.querySelectorAll('.kt__char')]
  }
  const onMove = (event) => {
    const ctx = live.current
    if (!ctx.chars.length || ctx.state !== 'live') return
    ctx.pointer = { x: event.clientX, y: event.clientY }
    if (!ctx.frame) ctx.frame = requestAnimationFrame(paint)
  }
  const onLeave = () => {
    live.current.pointer = null
    for (const el of live.current.chars) el.style.setProperty('--p', '0')
  }

  // entrada quando o texto aparece na tela
  useEffect(() => {
    if (!entrance) return
    if (reduce() || !('IntersectionObserver' in window)) {
      setState('live')
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        enter()
        observer.disconnect()
      },
      // dispara um pouco antes do texto aparecer, para a animação não ficar atrás do scroll
      { rootMargin: '0px 0px 15% 0px', threshold: 0 },
    )
    observer.observe(root.current)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // troca de idioma: novas letras entram de novo
  const firstText = useRef(true)
  useEffect(() => {
    if (firstText.current) {
      firstText.current = false
      return
    }
    live.current.chars = []
    if (entrance && live.current.state === 'live' && !reduce()) {
      setState('hidden')
      requestAnimationFrame(() => requestAnimationFrame(enter))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])

  useEffect(
    () => () => {
      clearTimeout(live.current.liveTimer)
      cancelAnimationFrame(live.current.frame)
    },
    [],
  )

  return (
    <span
      ref={root}
      className={`kt kt--${state}`}
      onPointerEnter={onEnter}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <span className="kt__sr">{text}</span>
      <span className="kt__glyphs" aria-hidden="true">
        {words.map((word, w) => (
          <span key={`${text}-${w}`} className="kt__word">
            {word.chars.map((ch, c) => (
              <span key={c} className="kt__char" style={{ '--i': ch.i, '--wv': ch.wave }}>
                {ch.c === ' ' ? ' ' : ch.c /* espaço comum some no fim do inline-block */}
              </span>
            ))}
          </span>
        ))}
      </span>
    </span>
  )
}
