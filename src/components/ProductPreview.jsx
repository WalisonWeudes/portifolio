import { useI18n } from '../i18n'
import './ProductPreview.css'

// Captura estática do exemplo (gerada em 1440x900), em vez de carregar o site inteiro num iframe.
const shotOf = (src) => {
  const slug = src.split('/').filter(Boolean).at(-2)
  return `/imagens/exemplos/${slug}`
}

/** Miniatura do site de exemplo; o clique abre o site numa aba nova. */
export function ProductThumb({ src, title }) {
  const { t } = useI18n()
  const shot = shotOf(src)

  return (
    <a
      className="pthumb"
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
      <span className="pthumb__screen">
        <img
          src={`${shot}-720.webp`}
          srcSet={`${shot}-720.webp 720w, ${shot}.webp 1440w`}
          sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 25vw"
          width="1440"
          height="900"
          alt={`${t('products.previewOf')} ${title}`}
          loading="lazy"
          decoding="async"
        />
      </span>
    </a>
  )
}
