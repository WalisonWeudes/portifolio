import GlitchHeroTitle from '../GlitchHeroTitle'
import HeroPortrait from '../HeroPortrait'
import ManifestoSection from './ManifestoSection'
import ShinyText from '../reactbits/ShinyText/ShinyText'
import { RESUME_URL } from '../../data/content'
import { useI18n } from '../../i18n'

const currentYear = new Date().getFullYear()

export default function HeroSection() {
  const { t } = useI18n()

  return (
    <>
      <section id="inicio" className="hero" aria-labelledby="hero-title">
        <div className="hero__halftone" aria-hidden="true"></div>
        <p className="hero__background" aria-hidden="true">
          WALISON
        </p>
        <div className="hero__meta hero__meta--left">
          <span>00 / HOME</span>
          <span>{t('hero.location')}</span>
        </div>
        <div className="hero__meta hero__meta--right">
          <span>{currentYear}</span>
          <span className="availability">
            <i></i>{' '}
            <ShinyText text={t('hero.available')} color="#f5f5f2" shineColor="#e62429" speed={3} delay={1.5} shineWidth={30} />
          </span>
        </div>
        <div className="hero__content">
          <div className="hero__headline reveal">
            <p className="eyebrow">{t('hero.eyebrow')}</p>
            <GlitchHeroTitle />
            <div className="hero__intro">
              <p>{t('hero.intro')}</p>
              <div className="hero__actions">
                <a className="text-link" href="#projetos">
                  {t('hero.cta')} <span>↗</span>
                </a>
                <a className="text-link text-link--ghost" href={RESUME_URL} download="Curriculo Walison Weudes.pdf">
                  {t('resume.download')} <span>↓</span>
                </a>
              </div>
            </div>
          </div>
          <div className="hero__portrait">
            <div className="hero__portrait-frame">
              {/* Retrato de camisa; no hover, a versão com a camiseta de aranha aparece por baixo */}
              <HeroPortrait
                base="/imagens/retrato-social.webp"
                reveal="/imagens/retrato.webp"
                alt={t('hero.portraitAlt')}
              />
            </div>
            <span className="portrait-mark">+</span>
            <span className="portrait-caption">FULL STACK / UI DESIGN</span>
          </div>
        </div>
        <a className="scroll-cue" href="#projetos">
          {t('hero.scroll')} <span>↓</span>
        </a>
      </section>

      <ManifestoSection />
    </>
  )
}
