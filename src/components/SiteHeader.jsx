import { useEffect, useRef, useState } from 'react'
import { RESUME_URL, dockItems, topbarLinks } from '../data/content'
import { LOCALES, setLocale, useI18n } from '../i18n'

const formatClock = () =>
  new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Fortaleza',
  }).format(new Date())

const toTop = (event) => {
  event.preventDefault()
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
}

export default function SiteHeader() {
  const { t, locale } = useI18n()
  const [isScrolled, setIsScrolled] = useState(false)
  const [active, setActive] = useState('')
  const [clock, setClock] = useState('')
  const [showTop, setShowTop] = useState(false)
  const progressRef = useRef(null)

  useEffect(() => {
    let ticking = false
    let raf = null

    const update = () => {
      ticking = false
      const y = window.scrollY
      setIsScrolled(y > 32)
      setShowTop(y > window.innerHeight * 1.2)
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`
    }
    const onScroll = () => {
      if (ticking) return
      ticking = true
      raf = requestAnimationFrame(update)
    }

    const updateClock = () => setClock(formatClock())

    update()
    updateClock()
    const clockTimer = setInterval(updateClock, 20000)
    window.addEventListener('scroll', onScroll, { passive: true })

    // Seção ativa: a que cruza a faixa central da viewport.
    const ids = ['#inicio', ...dockItems.map((d) => d.href), ...topbarLinks.map((l) => l.href)]
    const sections = [...new Set(ids)].map((id) => document.querySelector(id)).filter(Boolean)
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`)
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    sections.forEach((section) => observer.observe(section))

    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
      observer.disconnect()
      clearInterval(clockTimer)
    }
  }, [])

  return (
    <>
      <div ref={progressRef} className="scroll-progress" aria-hidden="true"></div>

      <header className={`topbar${isScrolled ? ' is-scrolled' : ''}`}>
        <a className="brand" href="#inicio" aria-label={t('brand.aria')}>W<span>W</span></a>
        <p className="topbar__role topbar__hud">
          <span>PICOS, PI — BR</span><span>{clock}</span>
        </p>
        <div className="topbar__right">
          <nav className="topbar__links" aria-label={t('nav.main')}>
            {topbarLinks.map((link) => (
              <a key={link.href} href={link.href} className={active === link.href ? 'is-active' : undefined}>
                {t(link.key)}
              </a>
            ))}
          </nav>
          <a className="topbar__cv" href={RESUME_URL} download="Curriculo Walison Weudes.pdf">
            <span className="topbar__cv-long">{t('resume.download')}</span><span className="topbar__cv-short">{t('resume.short')}</span> ↓
          </a>
          <div className="lang-switch" role="group" aria-label={t('lang.switch')}>
            {LOCALES.map((code) => (
              <button
                key={code}
                type="button"
                className={locale === code ? 'is-active' : undefined}
                aria-pressed={locale === code}
                onClick={() => setLocale(code)}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      <a
        className={`to-top${showTop ? ' is-visible' : ''}`}
        href="#inicio"
        aria-label={t('nav.top')}
        tabIndex={showTop ? 0 : -1}
        onClick={toTop}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
      </a>

      <nav className="dock" aria-label={t('nav.quick')}>
        {dockItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={active === item.href ? 'is-active' : undefined}
            aria-current={active === item.href ? 'true' : undefined}
          >
            <b>{item.number}</b>{t(item.key)}
          </a>
        ))}
      </nav>
    </>
  )
}
