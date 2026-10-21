// Texto-manifesto que "acende" palavra por palavra conforme o scroll.
import { useMemo, useRef, useState } from 'react'
import { useI18n } from '../../i18n'
import { stickyProgress, useScrollFrame } from '../../hooks/useScrollProgress'
import './ManifestoSection.css'

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const pad = (n) => String(n).padStart(2, '0')

export default function ManifestoSection() {
  const { t, locale } = useI18n()
  const root = useRef(null)
  const [lit, setLit] = useState(0)

  // *palavra* = destaque vermelho, _palavra_ = destaque azul
  const text = t('manifesto.text')
  const words = useMemo(
    () =>
      text.split(' ').map((raw) => {
        if (raw.startsWith('*')) return { text: raw.replace(/\*/g, ''), accent: true }
        if (raw.startsWith('_')) return { text: raw.replace(/_/g, ''), blue: true }
        return { text: raw }
      }),
    [text],
  )

  useScrollFrame(() => {
    const el = root.current
    if (!el) return
    const p = reduce ? 1 : stickyProgress(el)
    el.style.setProperty('--sp', p.toFixed(4))
    setLit(Math.min(words.length, Math.round(p * 1.15 * words.length)))
  })

  return (
    <section ref={root} className="manifesto" aria-labelledby="manifesto-title">
      <div className="manifesto__sticky">
        <p className="manifesto__label">
          <span>{t('manifesto.label')}</span>
          <span>
            {pad(lit)} / {pad(words.length)}
          </span>
        </p>
        <h2 id="manifesto-title" className="manifesto__text" style={{ '--n': words.length }}>
          {words.map((word, i) => (
            <span
              key={`${locale}-${i}`}
              className={`manifesto__word${word.accent ? ' is-accent' : ''}${word.blue ? ' is-blue' : ''}`}
              style={{ '--i': i }}
            >
              {word.text}
            </span>
          ))}
        </h2>
        <div className="manifesto__bar" aria-hidden="true">
          <i></i>
        </div>
      </div>
    </section>
  )
}
