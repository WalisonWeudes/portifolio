import { useEffect, useRef, useState } from 'react'
import KineticText from '../KineticText'
import { EMAIL, RESUME_URL, socials } from '../../data/content'
import { useI18n } from '../../i18n'

const currentYear = new Date().getFullYear()

// copia o e-mail; fallback para navegadores sem a API de área de transferência
const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const field = document.createElement('textarea')
    field.value = text
    field.setAttribute('readonly', '')
    field.style.position = 'fixed'
    field.style.opacity = '0'
    document.body.appendChild(field)
    field.select()
    const ok = document.execCommand('copy')
    field.remove()
    return ok
  }
}

export default function ContactSection() {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])

  const copyEmail = async () => {
    if (!(await copyText(EMAIL))) return
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 2200)
  }

  return (
    <section id="contato" className="contact" aria-labelledby="contact-title">
      <div className="contact__top reveal">
        <span>{t('contact.label')}</span>
        <p>
          {t('hero.location')}
          <br />
          {t('contact.available')}
        </p>
      </div>
      <h2 id="contact-title" className="reveal">
        <KineticText text={t('contact.title1')} />
        <br />
        <em>
          <KineticText text={t('contact.title2')} />
        </em>
        <br />
        <KineticText text={t('contact.title3')} /> <span className="contact__arrow">↗</span>
      </h2>
      <div className="contact__bottom reveal">
        {/* e-mail em destaque: clicar copia */}
        <button
          type="button"
          className={`contact__copy${copied ? ' is-copied' : ''}`}
          onClick={copyEmail}
          aria-label={`${t('contact.copyAria')} ${EMAIL}`}
        >
          <span className="contact__copy-email">{EMAIL}</span>
          <span className="contact__copy-action" aria-live="polite">
            {copied ? t('contact.copied') : t('contact.copy')}
          </span>
        </button>

        <ul className="contact__channels">
          <li>
            <a href={RESUME_URL} download="Curriculo Walison Weudes.pdf">
              <span>{t('resume.short')}</span>
              <i aria-hidden="true">↓</i>
            </a>
          </li>
          {socials.map((social) => (
            <li key={social.name}>
              <a href={social.href} target="_blank" rel="noreferrer">
                <span>{social.name}</span>
                <i aria-hidden="true">↗</i>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <footer>
        <span>© {currentYear} WALISON WEUDES</span>
        <a href="#inicio">{t('footer.top')}</a>
        <span>DESIGN + CODE</span>
      </footer>
    </section>
  )
}
