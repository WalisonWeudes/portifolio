<template>
  <section id="contato" class="contact" aria-labelledby="contact-title">
    <div class="contact__top reveal">
      <span>{{ t('contact.label') }}</span>
      <p>{{ t('hero.location') }}<br />{{ t('contact.available') }}</p>
    </div>
    <h2 id="contact-title" class="reveal">
      <KineticText :text="t('contact.title1')" /><br /><em><KineticText :text="t('contact.title2')" /></em><br /><KineticText :text="t('contact.title3')" /> <span class="contact__arrow">↗</span>
    </h2>
    <div class="contact__bottom">
      <div class="contact__links reveal">
        <a :href="`mailto:${EMAIL}`">{{ EMAIL }} ↗</a>
        <div>
          <a :href="RESUME_URL" download="Curriculo Walison Weudes.pdf">{{ t('resume.short') }} ↓</a>
          <a v-for="social in socials" :key="social.name" :href="social.href" target="_blank" rel="noreferrer">
            {{ social.name }} ↗
          </a>
        </div>
      </div>
      <form class="contact__form reveal" @submit.prevent="sendEmail">
        <label for="contact-email">{{ t('contact.email') }}</label>
        <input
          id="contact-email"
          v-model.trim="form.email"
          type="email"
          autocomplete="email"
          :placeholder="t('contact.emailPh')"
          required
        />
        <label for="contact-subject">{{ t('contact.subject') }}</label>
        <input
          id="contact-subject"
          v-model.trim="form.subject"
          type="text"
          :placeholder="t('contact.subjectPh')"
          required
        />
        <label for="contact-message">{{ t('contact.message') }}</label>
        <textarea
          id="contact-message"
          v-model.trim="form.message"
          rows="3"
          :placeholder="t('contact.messagePh')"
          required
        ></textarea>
        <button class="text-link" type="submit">{{ t('contact.send') }} <span>↗</span></button>
      </form>
    </div>
    <footer>
      <span>© {{ currentYear }} WALISON WEUDES</span>
      <a href="#inicio">{{ t('footer.top') }}</a>
      <span>DESIGN + CODE</span>
    </footer>
  </section>
</template>

<script setup>
import KineticText from '../KineticText.vue'
import { ref } from 'vue'
import { EMAIL, RESUME_URL, socials } from '../../data/content'
import { t } from '../../i18n'

const currentYear = new Date().getFullYear()
const form = ref({ email: '', subject: '', message: '' })

const sendEmail = () => {
  const body = `${t('contact.replyTo')} ${form.value.email}\n\n${form.value.message}`
  window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(form.value.subject)}&body=${encodeURIComponent(body)}`
}
</script>
