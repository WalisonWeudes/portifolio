// "Em campo": fotos de eventos, palestras e minicursos (dados em src/data/content.js → fieldwork).
// Cada registro é um painel com foto recortada; clicar abre a foto inteira no lightbox do site.
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import KineticText from '../KineticText'
import { fieldwork } from '../../data/content'
import { useI18n } from '../../i18n'
import './FieldSection.css'

export default function FieldSection() {
  const { t, tr } = useI18n()
  const [index, setIndex] = useState(-1) // -1 = lightbox fechado
  const closeButton = useRef(null)
  const opener = useRef(null)

  const selected = index >= 0 ? fieldwork[index] : null
  const total = fieldwork.length

  const open = (i) => {
    opener.current = document.activeElement
    setIndex(i)
  }
  const close = useCallback(() => {
    setIndex(-1)
    opener.current?.focus?.()
  }, [])
  const step = useCallback((direction) => setIndex((i) => (i + direction + total) % total), [total])

  useEffect(() => {
    if (!selected) return
    closeButton.current?.focus()
    const onKeydown = (event) => {
      if (event.key === 'Escape') close()
      else if (total > 1 && event.key === 'ArrowRight') step(1)
      else if (total > 1 && event.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKeydown)
    return () => window.removeEventListener('keydown', onKeydown)
  }, [selected, total, close, step])

  if (!total) return null

  return (
    <section id="em-campo" className="field" aria-labelledby="field-title">
      <header className="field__heading reveal">
        <span>{t('field.label')}</span>
        <h3 id="field-title">
          <KineticText text={t('field.title1')} />
          <br />
          <em>
            <KineticText text={t('field.title2')} />
          </em>
        </h3>
        <p>{t('field.desc')}</p>
      </header>

      <ol className={`field__list${total === 1 ? ' field__list--single' : ''}`}>
        {fieldwork.map((item, i) => (
          <li key={item.image} className="field__item reveal" style={{ '--k': i }}>
            <button
              type="button"
              className="field__photo"
              onClick={() => open(i)}
              aria-label={`${t('field.open')}: ${tr(item.title)}`}
            >
              <img src={item.card || item.image} alt={tr(item.alt)} loading="lazy" decoding="async" />
              <span className="field__tag" aria-hidden="true">
                ● {t('field.tag')}
              </span>
              <span className="field__zoom" aria-hidden="true">
                {t('field.open')} ↗
              </span>
            </button>

            <div className="field__info">
              <span className="field__index" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="field__meta">
                <span>{tr(item.event)}</span>
                {item.date && <span>{tr(item.date)}</span>}
              </div>
              <h4>{tr(item.title)}</h4>
              <span className="field__role">{tr(item.role)}</span>
              <p>{tr(item.description)}</p>
            </div>
          </li>
        ))}
      </ol>

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
            {total > 1 && (
              <p className="lightbox__count">
                {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </p>
            )}
            <button ref={closeButton} type="button" aria-label={t('lightbox.closeAria')} onClick={close}>
              {t('lightbox.close')}
            </button>
            {total > 1 && (
              <>
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
              </>
            )}
            <img key={selected.image} src={selected.image} alt={tr(selected.alt)} />
            <p>
              {tr(selected.title)} · {tr(selected.event)}
            </p>
          </div>,
          document.body,
        )}
    </section>
  )
}
