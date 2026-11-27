import { useEffect, useRef } from 'react'
import KineticText from '../KineticText'
import GlareHover from '../reactbits/GlareHover/GlareHover'
import { projects } from '../../data/content'
import { useI18n } from '../../i18n'
import { useScrollFrame } from '../../hooks/useScrollProgress'
import './ProjectsSection.css'

// Cada prévia tem uma versão de 800 px (celular) ao lado da de 1440 px.
const PREVIEW_SIZES = '(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw'
const previewSrcSet = (src) => `${src.replace(/\.webp$/, '-800.webp')} 800w, ${src} 1440w`

export default function ProjectsSection() {
  const { t, tr } = useI18n()
  const grid = useRef(null)

  // Cada cartão aparece (imagem + texto) quando entra na tela.
  useEffect(() => {
    const cards = grid.current.querySelectorAll('.pcard')
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      cards.forEach((c) => c.classList.add('is-in'))
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
      { threshold: 0.15 },
    )
    cards.forEach((c) => observer.observe(c))
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

      {/* Grade de 3 colunas: prévia inteira (16:10, proporção de monitor) + resumo de cada projeto. */}
      <div ref={grid} className="pgrid">
        {projects.map((project, index) => (
          <article key={project.url} className="pcard" style={{ '--k': index % 3 }}>
            <div className="pcard__head">
              <span className="pcard__count">
                {String(index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
              </span>
              <span className="pcard__line" aria-hidden="true"></span>
              <span>{tr(project.category)}</span>
            </div>

            <div className="pcard__media">
              <a
                className="case__preview"
                href={project.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`${t('projects.openAria')} ${tr(project.title)}`}
              >
                <GlareHover
                  className="case__glare"
                  width="100%"
                  height="100%"
                  borderRadius="0"
                  glareColor="#ffffff"
                  glareOpacity={0.28}
                  glareSize={60}
                  transitionDuration={900}
                >
                  {project.video ? (
                    // Projetos de motion: prévia em vídeo curto, mudo e em loop.
                    <video
                      src={project.video}
                      poster={project.preview}
                      width="1440"
                      height="900"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      aria-label={`${t('projects.previewAlt')} ${tr(project.title)}`}
                    />
                  ) : (
                    <img
                      src={project.preview}
                      srcSet={previewSrcSet(project.preview)}
                      sizes={PREVIEW_SIZES}
                      width="1440"
                      height="900"
                      alt={`${t('projects.previewAlt')} ${tr(project.title)}`}
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                </GlareHover>
                <span className="case__open">
                  {t('projects.open')} <i>↗</i>
                </span>
              </a>
            </div>

            <div className="pcard__info">
              <div className="pcard__meta">
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
          </article>
        ))}
      </div>
    </section>
  )
}
