<template>
  <section id="sobre" class="section about" aria-labelledby="about-title">
    <span class="section-number" aria-hidden="true">02</span>
    <header class="about__title reveal">
      <p>{{ t('about.label') }}</p>
      <h2 id="about-title">
        {{ t('about.title1') }}<br /><em>{{ t('about.title2') }}</em><br />{{ t('about.title3') }}
      </h2>
    </header>
    <div class="about__media">
      <img
        class="about__campus-main"
        src="/imagens/ufpi_picos.jpg"
        :alt="t('about.mainAlt')"
        loading="lazy"
        decoding="async"
        @error="$event.currentTarget.src = '/imagens/UFPI-Picos.jpg'"
      />
      <img
        class="about__campus-detail"
        src="/imagens/UFPI-Picos.jpg"
        :alt="t('about.detailAlt')"
        loading="lazy"
        decoding="async"
        @error="$event.currentTarget.hidden = true"
      />
      <span>{{ t('about.badge') }}</span>
    </div>
    <div class="about__copy reveal">
      <p class="about__lead">{{ t('about.lead') }}</p>
      <p>{{ t('about.p1') }}</p>
      <p>{{ t('about.p2') }}</p>
    </div>
  </section>
</template>

<script setup>
import { t } from '../../i18n'
</script>
