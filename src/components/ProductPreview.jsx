import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n'
import './ProductPreview.css'

// Largura em que o site de exemplo é desenhado dentro da miniatura (depois é reduzido para caber no card).
const BASE_W = 1440
const BASE_H = 900

/** Miniatura do site de exemplo, como uma imagem; o clique abre o site numa aba nova. */
export function ProductThumb({ src, title }) {
  const { t } = useI18n()
  const boxRef = useRef(null)
  const [scale, setScale] = useState(0.25)
  const [visivel, setVisivel] = useState(false)
  const [pronto, setPronto] = useState(false)

  // só carrega o site quando o card aparece na tela
  useEffect(() => {
    const el = boxRef.current
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisivel(true)
          io.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    io.observe(el)
    const ro = new ResizeObserver(() => setScale(el.clientWidth / BASE_W))
    ro.observe(el)
    return () => {
      io.disconnect()
      ro.disconnect()
    }
  }, [])

  return (
    <a
      className={`pthumb${pronto ? ' is-ready' : ''}`}
      href={src}
      target="_blank"
      rel="noreferrer"
      aria-label={`${t('products.view')}: ${title} (${t('products.newTab')})`}
    >
      <span className="pthumb__bar" aria-hidden="true">
        <i></i>
        <i></i>
        <i></i>
        <span>{src.replace(/^\//, 'walison.dev/')}</span>
      </span>
      <span className="pthumb__screen" ref={boxRef} style={{ height: BASE_H * scale }}>
        {visivel && (
          <iframe
            src={src}
            title={`${t('products.previewOf')} ${title}`}
            tabIndex={-1}
            aria-hidden="true"
            loading="lazy"
            onLoad={() => setPronto(true)}
            style={{ width: BASE_W, height: BASE_H, transform: `scale(${scale})` }}
          />
        )}
      </span>
    </a>
  )
}
