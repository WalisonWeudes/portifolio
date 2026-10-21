// Números do currículo com contagem animada quando entram na tela.
import { useEffect, useRef } from 'react'
import { stats } from '../data/content'
import { useI18n } from '../i18n'

export default function StatsStrip() {
  const { tr, t } = useI18n()
  const root = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame
    const countUp = (el) => {
      const target = Number(el.dataset.count)
      const duration = 1400
      const start = performance.now()
      const tick = (now) => {
        const p = Math.min(1, (now - start) / duration)
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)))
        if (p < 1) frame = requestAnimationFrame(tick)
      }
      el.textContent = '0'
      frame = requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.querySelectorAll('[data-count]').forEach(countUp)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.4 },
    )
    observer.observe(root.current)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <ul ref={root} className="stats" aria-label={t('stats.label')}>
      {stats.map((stat, index) => (
        <li key={index} className="stats__item reveal">
          <strong className="stats__value">
            {stat.value !== undefined ? (
              <span data-count={stat.value}>{stat.value}</span>
            ) : (
              <span>{tr(stat.text)}</span>
            )}
          </strong>
          <span className="stats__label">{tr(stat.label)}</span>
        </li>
      ))}
    </ul>
  )
}
