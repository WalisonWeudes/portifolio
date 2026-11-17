import { useEffect, useRef, useState } from 'react'
import KineticText from '../KineticText'
import { EMAIL, RESUME_URL, socials } from '../../data/content'
import { useI18n } from '../../i18n'

const currentYear = new Date().getFullYear()

// Envio de verdade, sem depender do programa de e-mail de quem visita.
// FormSubmit: o primeiro envio manda um e-mail de ativação para o EMAIL;
// depois de confirmar, as mensagens chegam direto na caixa de entrada.
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${EMAIL}`
const EMPTY_FORM = { name: '', email: '', subject: '', message: '' }

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

  const [form, setForm] = useState(EMPTY_FORM)
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const update = (field) => (event) => setForm((f) => ({ ...f, [field]: event.target.value }))

  const sendMessage = async (event) => {
    event.preventDefault()
    if (status === 'sending') return
    // armadilha para robôs: campo escondido que pessoas não preenchem
    if (event.currentTarget.elements._honey?.value) return
    setStatus('sending')
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
          _subject: `Portfólio — ${form.subject.trim() || form.name.trim()}`,
          _replyto: form.email.trim(),
          _template: 'table',
          _captcha: 'false',
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || String(data.success) !== 'true') throw new Error(data.message || res.status)
      setForm(EMPTY_FORM)
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

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
        {/* esquerda: currículo/redes e, embaixo, o e-mail para copiar */}
        <div className="contact__side">
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
        </div>

        {/* direita: formulário de mensagem */}
        <form className="contact__form" onSubmit={sendMessage}>
          <div className="contact__form-head">
            <p className="contact__form-title">{t('contact.formTitle')}</p>
            <h3>{t('contact.formHeading')}</h3>
          </div>
          <div className="contact__fields">
            <label>
              <span>{t('contact.name')}</span>
              <input
                name="name"
                value={form.name}
                onChange={update('name')}
                type="text"
                autoComplete="name"
                placeholder={t('contact.namePh')}
                required
              />
            </label>
            <label>
              <span>{t('contact.email')}</span>
              <input
                name="email"
                value={form.email}
                onChange={update('email')}
                type="email"
                autoComplete="email"
                placeholder={t('contact.emailPh')}
                required
              />
            </label>
            <label className="contact__field--wide">
              <span>{t('contact.subject')}</span>
              <input
                name="subject"
                value={form.subject}
                onChange={update('subject')}
                type="text"
                placeholder={t('contact.subjectPh')}
                required
              />
            </label>
            <label className="contact__field--wide">
              <span>{t('contact.message')}</span>
              <textarea
                name="message"
                value={form.message}
                onChange={update('message')}
                rows={4}
                placeholder={t('contact.messagePh')}
                required
              ></textarea>
            </label>
            <input
              type="text"
              name="_honey"
              className="contact__honey"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
          </div>
          <div className="contact__form-foot">
            <button className="contact__send" type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? t('contact.sending') : t('contact.send')} <i aria-hidden="true">↗</i>
            </button>
            <p className={`contact__status contact__status--${status}`} role="status" aria-live="polite">
              {status === 'sent' && t('contact.sent')}
              {status === 'error' && t('contact.error')}
            </p>
          </div>
          <p className="contact__privacy">{t('contact.privacy')}</p>
        </form>
      </div>
      <footer>
        <span>© {currentYear} WALISON WEUDES</span>
        <a href="#inicio">{t('footer.top')}</a>
        <span>DESIGN + CODE</span>
      </footer>
    </section>
  )
}
