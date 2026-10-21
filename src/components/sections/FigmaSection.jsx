import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import KineticText from '../KineticText'
import FigmaWireframe from '../FigmaWireframe'
import { figmaProjects } from '../../data/content'
import { useI18n } from '../../i18n'
import './FigmaSection.css'

export default function FigmaSection() {
  const { t, tr } = useI18n()
  const [hover, setHover] = useState(null)
  const card = useRef(null)
  // espelho do hover para o listener de mousemove (que não re-registra a cada render)
  const hoverRef = useRef(null)
  hoverRef.current = hover

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    let frame = null
    let running = true
    const target = { x: 0, y: 0 }
    const pos = { x: 0, y: 0, tilt: 0 }

    const loop = () => {
      if (!running) return
      const dx = target.x - pos.x
      pos.x += dx * 0.16
      pos.y += (target.y - pos.y) * 0.16
      pos.tilt += (Math.max(-8, Math.min(8, dx * 0.06)) - pos.tilt) * 0.12
      if (card.current) {
        card.current.style.transform = `translate3d(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px, 0) rotate(${pos.tilt.toFixed(2)}deg)`
      }
      frame = requestAnimationFrame(loop)
    }

    const onMove = (event) => {
      target.x = event.clientX + 28
      target.y = event.clientY - 90
      if (hoverRef.current === null) {
        pos.x = target.x
        pos.y = target.y
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    frame = requestAnimationFrame(loop)
    return () => {
      running = false
      cancelAnimationFrame(frame)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <section id="figma" className="section figma-section" aria-labelledby="figma-title">
      <header className="compact-heading reveal">
        <span>{t('figma.label')}</span>
        <h2 id="figma-title">
          <KineticText text={t('figma.title1')} />
          <br />
          <KineticText text={t('figma.title2')} />
        </h2>
      </header>
      <div className={`figma-list${hover !== null ? ' has-hover' : ''}`} onMouseLeave={() => setHover(null)}>
        {figmaProjects.map((project, index) => (
          <a
            key={project.file}
            className="figma-row reveal"
            data-active={hover === index}
            href={project.file}
            download
            onMouseEnter={() => setHover(index)}
            onFocus={() => setHover(index)}
            onBlur={() => setHover(null)}
          >
            <span>0{index + 1}</span>
            <div>
              <small>{tr(project.type)}</small>
              <h3>{tr(project.title)}</h3>
            </div>
            <p>{tr(project.description)}</p>
            <strong>
              {t('figma.download')} <i>↗</i>
            </strong>
            {/* no toque (mobile) o esquema aparece dentro da linha */}
            <span className="figma-row__wire" aria-hidden="true">
              {project.preview ? (
                <img className="figma-card__img" src={project.preview} alt="" loading="lazy" />
              ) : (
                <FigmaWireframe kind={project.kind} />
              )}
            </span>
          </a>
        ))}
      </div>

      {/* Cartão flutuante que segue o cursor com o esquema da tela */}
      {createPortal(
        <div ref={card} className={`figma-card${hover !== null ? ' is-visible' : ''}`} aria-hidden="true">
          <div className="figma-card__bar">
            <span>{hover !== null ? tr(figmaProjects[hover].title) : ''}.fig</span>
            <span>{hover !== null && figmaProjects[hover].preview ? t('figma.preview') : t('figma.wire')}</span>
          </div>
          {figmaProjects.map((project, index) =>
            project.preview ? (
              <img
                key={project.file}
                style={hover === index ? undefined : { display: 'none' }}
                className="figma-card__img"
                src={project.preview}
                alt=""
                loading="lazy"
              />
            ) : (
              <FigmaWireframe
                key={project.file}
                style={hover === index ? undefined : { display: 'none' }}
                kind={project.kind}
                drawn={hover === index}
              />
            ),
          )}
        </div>,
        document.body,
      )}
    </section>
  )
}
