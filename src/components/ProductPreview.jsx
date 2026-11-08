import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n'
import './ProductPreview.css'

// Largura em que o site de exemplo é desenhado dentro da miniatura (depois é reduzido para caber no card).
const BASE_W = 1440
const BASE_H = 900

// Rola a página dentro do iframe até `alvo`, com velocidade constante (px por segundo).
function rolar(frame, alvo, pxPorSeg, ref) {
  cancelAnimationFrame(ref.current)
  const win = frame?.contentWindow
  if (!win) return
  let ultimo = performance.now()
  const passo = (agora) => {
    const dt = (agora - ultimo) / 1000
    ultimo = agora
    const atual = win.scrollY
    const dir = Math.sign(alvo - atual)
    if (!dir) return
    const prox = atual + dir * Math.min(Math.abs(alvo - atual), pxPorSeg * dt)
    win.scrollTo({ top: prox, behavior: 'instant' })
    ref.current = requestAnimationFrame(passo)
  }
  ref.current = requestAnimationFrame(passo)
}

/** Miniatura ao vivo do site de exemplo: rola sozinha ao passar o mouse e abre a prévia grande ao clicar. */
export function ProductThumb({ src, title, onOpen }) {
  const { t } = useI18n()
  const boxRef = useRef(null)
  const frameRef = useRef(null)
  const animRef = useRef(0)
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
      cancelAnimationFrame(animRef.current)
    }
  }, [])

  const descer = () => {
    const win = frameRef.current?.contentWindow
    if (!win) return
    const fim = win.document.documentElement.scrollHeight - BASE_H
    rolar(frameRef.current, fim, 520, animRef)
  }
  const subir = () => rolar(frameRef.current, 0, 2400, animRef)

  return (
    <button
      type="button"
      className={`pthumb${pronto ? ' is-ready' : ''}`}
      onMouseEnter={descer}
      onMouseLeave={subir}
      onFocus={descer}
      onBlur={subir}
      onClick={onOpen}
      aria-label={`${t('products.previewOpen')}: ${title}`}
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
            ref={frameRef}
            src={src}
            title={`${t('products.previewOf')} ${title}`}
            tabIndex={-1}
            aria-hidden="true"
            loading="lazy"
            onLoad={() => setPronto(true)}
            style={{ width: BASE_W, height: BASE_H, transform: `scale(${scale})` }}
          />
        )}
        <span className="pthumb__hint" aria-hidden="true">
          {t('products.previewHint')}
        </span>
      </span>
    </button>
  )
}

/** Janela grande com o site de exemplo funcionando, para navegar sem sair do portfólio. */
export function ProductPreviewDialog({ product, onClose }) {
  const { t, tr } = useI18n()
  const ref = useRef(null)
  const [modo, setModo] = useState('desktop')

  useEffect(() => {
    const d = ref.current
    if (product && !d.open) {
      setModo(window.innerWidth < 760 ? 'mobile' : 'desktop')
      d.showModal()
    }
    if (!product && d.open) d.close()
  }, [product])

  return (
    <dialog ref={ref} className="pview" onClose={onClose} onCancel={onClose} aria-labelledby="pview-title">
      {product && (
        <>
          <header className="pview__bar">
            <div className="pview__title">
              <small>{tr(product.tag)}</small>
              <b id="pview-title">{tr(product.title)}</b>
            </div>
            <div className="pview__modes" role="group" aria-label={t('products.previewDevice')}>
              <button type="button" aria-pressed={modo === 'desktop'} onClick={() => setModo('desktop')}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="12" rx="1.5" />
                  <path d="M8 20h8M12 16v4" />
                </svg>
                {t('products.previewDesktop')}
              </button>
              <button type="button" aria-pressed={modo === 'mobile'} onClick={() => setModo('mobile')}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="7" y="2.5" width="10" height="19" rx="2" />
                  <path d="M11 18.5h2" />
                </svg>
                {t('products.previewMobile')}
              </button>
            </div>
            <div className="pview__actions">
              <a href={product.href} target="_blank" rel="noreferrer">
                {t('products.previewNewTab')} ↗
              </a>
              <button type="button" className="pview__close" onClick={onClose} aria-label={t('products.previewClose')}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          </header>
          <div className={`pview__stage pview__stage--${modo}`}>
            <iframe key={product.href} src={product.href} title={`${t('products.previewOf')} ${tr(product.title)}`} />
          </div>
        </>
      )}
    </dialog>
  )
}
