import KineticText from '../KineticText'
import { useI18n } from '../../i18n'

export default function AboutSection() {
  const { t } = useI18n()

  return (
    <section id="sobre" className="section about" aria-labelledby="about-title">
      <span className="section-number" aria-hidden="true">
        02
      </span>
      <header className="about__title reveal">
        <p>{t('about.label')}</p>
        <h2 id="about-title">
          <KineticText text={t('about.title1')} />
          <br />
          <em>
            <KineticText text={t('about.title2')} />
          </em>
          <br />
          <KineticText text={t('about.title3')} />
        </h2>
      </header>
      <div className="about__media">
        <img
          className="about__campus-main"
          src="/imagens/ufpi_picos.webp"
          alt={t('about.mainAlt')}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.src = '/imagens/UFPI-Picos.webp'
          }}
        />
        <img
          className="about__campus-detail"
          src="/imagens/UFPI-Picos.webp"
          alt={t('about.detailAlt')}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.hidden = true
          }}
        />
        <span>{t('about.badge')}</span>
      </div>
      <div className="about__copy reveal">
        <p className="about__lead">{t('about.lead')}</p>
        <p>{t('about.p1')}</p>
        <p>{t('about.p2')}</p>
      </div>
    </section>
  )
}
