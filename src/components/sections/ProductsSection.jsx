import KineticText from '../KineticText'
import SpotlightCard from '../reactbits/SpotlightCard/SpotlightCard'
import { products } from '../../data/content'
import { useI18n } from '../../i18n'
import './ProductsSection.css'

export default function ProductsSection() {
  const { t, tr } = useI18n()

  return (
    <section id="produtos" className="section products" aria-labelledby="products-title">
      <header className="compact-heading reveal">
        <span>{t('products.label')}</span>
        <h2 id="products-title">
          <KineticText text={t('products.title1')} />
          <br />
          <KineticText text={t('products.title2')} />
        </h2>
      </header>
      <p className="products__desc reveal">{t('products.desc')}</p>

      <div className="products__grid">
        {products.map((product, index) => (
          <SpotlightCard
            key={product.title.pt}
            className="product-card reveal"
            spotlightColor="#e62429"
            intensity={0.2}
            spotlightSize={300}
            borderGlow={0.8}
            proximity={60}
          >
            <span className="product-card__num">{String(index + 1).padStart(2, '0')}</span>
            <small className="product-card__tag">{tr(product.tag)}</small>
            <h3>{tr(product.title)}</h3>
            <p>{tr(product.description)}</p>
            <ul aria-label={t('products.includes')}>
              {product.items.map((item) => (
                <li key={item.pt}>{tr(item)}</li>
              ))}
            </ul>
            {product.preview && <img className="product-card__img" src={product.preview} alt="" loading="lazy" />}
            <footer className="product-card__foot">
              {product.href ? (
                <a className="product-card__view" href={product.href} target="_blank" rel="noreferrer">
                  {t('products.view')} ↗
                </a>
              ) : (
                <span className="product-card__soon">
                  <i aria-hidden="true"></i>
                  {t('products.soon')}
                </span>
              )}
              <a href="#contato" className="product-card__cta">
                {t('products.cta')} →
              </a>
            </footer>
          </SpotlightCard>
        ))}
      </div>
    </section>
  )
}
