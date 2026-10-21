import { useState } from 'react'
import KineticText from '../KineticText'
import { EMAIL, RESUME_URL, socials } from '../../data/content'
import { useI18n } from '../../i18n'

const currentYear = new Date().getFullYear()

export default function ContactSection() {
  const { t } = useI18n()
  const [form, setForm] = useState({ email: '', subject: '', message: '' })

  const update = (field) => (event) => setForm((f) => ({ ...f, [field]: event.target.value }))

  const sendEmail = (event) => {
    event.preventDefault()
    // equivalente ao v-model.trim: aparar os espaços no envio
    const email = form.email.trim()
    const subject = form.subject.trim()
    const message = form.message.trim()
    const body = `${t('contact.replyTo')} ${email}\n\n${message}`
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
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
      <div className="contact__bottom">
        <div className="contact__links reveal">
          <a href={`mailto:${EMAIL}`}>{EMAIL} ↗</a>
          <div>
            <a href={RESUME_URL} download="Curriculo Walison Weudes.pdf">
              {t('resume.short')} ↓
            </a>
            {socials.map((social) => (
              <a key={social.name} href={social.href} target="_blank" rel="noreferrer">
                {social.name} ↗
              </a>
            ))}
          </div>
        </div>
        <form className="contact__form reveal" onSubmit={sendEmail}>
          <label htmlFor="contact-email">{t('contact.email')}</label>
          <input
            id="contact-email"
            value={form.email}
            onChange={update('email')}
            type="email"
            autoComplete="email"
            placeholder={t('contact.emailPh')}
            required
          />
          <label htmlFor="contact-subject">{t('contact.subject')}</label>
          <input
            id="contact-subject"
            value={form.subject}
            onChange={update('subject')}
            type="text"
            placeholder={t('contact.subjectPh')}
            required
          />
          <label htmlFor="contact-message">{t('contact.message')}</label>
          <textarea
            id="contact-message"
            value={form.message}
            onChange={update('message')}
            rows={3}
            placeholder={t('contact.messagePh')}
            required
          ></textarea>
          <button className="text-link" type="submit">
            {t('contact.send')} <span>↗</span>
          </button>
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
