import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import KineticText from '../KineticText'
import { illustrations } from '../../data/content'
import { useI18n } from '../../i18n'

export default function IllustrationsSection() {
  const { t, tr } = useI18n()
  const [index, setIndex] = useState(-1) // -1 = lightbox fechado
  const closeButton = useRef(null)
  const opener = useRef(null)

  const selected = index >= 0 ? illustrations[index] : null
  const isOpen = selected !== null

  const open = (i) => {
    opener.current = document.activeElement
    setIndex(i)
  }
  const close = useCallback(() => {
    setIndex(-1)
    opener.current?.focus?.()
  }, [])
  const step = useCallback((direction) => {
    const total = illustrations.length
    setIndex((i) => (i + direction + total) % total)
  }, [])

  // foco no botão de fechar ao abrir
  useEffect(() => {
    if (isOpen) closeButton.current?.focus()
  }, [isOpen])

  // teclado: só escuta enquanto o lightbox está aberto
  useEffect(() => {
    if (!isOpen) return
    const onKeydown = (event) => {
      if (event.key === 'Escape') close()
      else if (event.key === 'ArrowRight') step(1)
      else if (event.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKeydown)
    return () => window.removeEventListener('keydown', onKeydown)
  }, [isOpen, close, step])

  return (
    <>
      <section id="ilustracoes" className="section illustrations" aria-labelledby="illustrations-title">
        <header className="illustrations__header reveal">
          <div>
            <span>{t('illustrations.label')}</span>
            <h2 id="illustrations-title">
              <KineticText text={t('illustrations.title1')} />
              <br />
              <KineticText text={t('illustrations.title2')} />
            </h2>
          </div>
          <p>{t('illustrations.desc')}</p>
        </header>
        <div className="illustration-grid">
          {illustrations.map((illustration, i) => (
            <button
              key={illustration.image}
              type="button"
              className="illustration-item"
              onClick={() => open(i)}
            >
              <img
                src={illustration.thumbnail}
                alt={tr(illustration.alt)}
                loading="lazy"
                decoding="async"
                onError={(event) => {
                  event.currentTarget.src = illustration.image
                }}
              />
              <span>
                {tr(illustration.title)} <i>↗</i>
              </span>
            </button>
          ))}
        </div>
      </section>

      {selected &&
        createPortal(
          <div
            className="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={tr(selected.title)}
            onClick={(event) => {
              if (event.target === event.currentTarget) close()
            }}
          >
            <p className="lightbox__count">
              {String(index + 1).padStart(2, '0')} / {String(illustrations.length).padStart(2, '0')}
            </p>
            <button ref={closeButton} type="button" aria-label={t('lightbox.closeAria')} onClick={close}>
              {t('lightbox.close')}
            </button>
            <button
              className="lightbox__nav lightbox__nav--prev"
              type="button"
              aria-label={t('lightbox.prev')}
              onClick={() => step(-1)}
            >
              ←
            </button>
            <button
              className="lightbox__nav lightbox__nav--next"
              type="button"
              aria-label={t('lightbox.next')}
              onClick={() => step(1)}
            >
              →
            </button>
            <img key={selected.image} src={selected.image} alt={tr(selected.alt)} />
            <p>{tr(selected.title)}</p>
          </div>,
          document.body,
        )}
    </>
  )
}
