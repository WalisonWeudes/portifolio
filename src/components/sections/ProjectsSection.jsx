import { useEffect, useRef } from 'react'
import KineticText from '../KineticText'
import { projects } from '../../data/content'
import { useI18n } from '../../i18n'
import { useScrollFrame } from '../../hooks/useScrollProgress'
import './ProjectsSection.css'

export default function ProjectsSection() {
  const { t, tr } = useI18n()
  const stack = useRef(null)

  // Quando o próximo cartão sobe, o atual recua (escala + escurece).
  useScrollFrame(() => {
    const el = stack.current
    if (!el || window.innerWidth <= 900) return
    const shots = el.querySelectorAll('.shot')
    const vh = window.innerHeight
    shots.forEach((shot, i) => {
      const next = shots[i + 1]
      let cover = 0
      if (next) cover = Math.min(1, Math.max(0, 1 - next.getBoundingClientRect().top / vh))
      shot.style.setProperty('--cover', cover.toFixed(4))
    })
  })

  // Revelação da imagem (corte em triângulo) ao entrar na tela.
  useEffect(() => {
    const shots = stack.current.querySelectorAll('.shot')
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      shots.forEach((s) => s.classList.add('is-in'))
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-in')
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.25 },
    )
    shots.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="projetos" className="section work" aria-labelledby="projects-title">
      <header className="section-heading reveal">
        <div>
          <span>01</span>
          <p>{t('projects.label')}</p>
        </div>
        <h2 id="projects-title">
          <KineticText text={t('projects.title1')} />
          <br />
          <em>
            <KineticText text={t('projects.title2')} />
          </em>
        </h2>
        <p>{t('projects.desc')}</p>
      </header>

      {/* Cartões empilhados: cada projeto fica preso no topo e o próximo desliza por cima. */}
      <div ref={stack} className="shots">
        {projects.map((project, index) => (
          <article key={project.url} className="shot" style={{ '--k': index }}>
            <div className="shot__inner">
              <div className="shot__head">
                <span className="shot__count">
                  {String(index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
                </span>
                <span className="shot__line" aria-hidden="true"></span>
                <span>{tr(project.category)}</span>
              </div>

              <div className={`case__visual shot__media case__visual--${index + 1}`}>
                <a
                  className="case__preview"
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${t('projects.openAria')} ${tr(project.title)}`}
                >
                  <img
                    src={project.preview}
                    alt={`${t('projects.previewAlt')} ${tr(project.title)}`}
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="case__open">
                    {t('projects.open')} <i>↗</i>
                  </span>
                </a>
              </div>

              <div className="case__info shot__info">
                <span className="shot__index" aria-hidden="true">
                  0{index + 1}
                </span>
                <div className="case__meta">
                  <span>{tr(project.status)}</span>
                  <span>{project.year}</span>
                </div>
                <h3>{tr(project.title)}</h3>
                <p>{tr(project.description)}</p>
                <ul>
                  {project.tags.map((tag, i) => (
                    <li key={i}>{tr(tag)}</li>
                  ))}
                </ul>
                <a className="text-link" href={project.url} target="_blank" rel="noreferrer">
                  {t('projects.open')} <span>↗</span>
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
