<template>
  <section id="inicio" class="hero" aria-labelledby="hero-title">
    <div class="hero__halftone" aria-hidden="true"></div>
    <p class="hero__background" aria-hidden="true">WALISON</p>
    <div class="hero__meta hero__meta--left"><span>00 / HOME</span><span>{{ t('hero.location') }}</span></div>
    <div class="hero__meta hero__meta--right">
      <span>{{ currentYear }}</span>
      <span class="availability"><i></i> {{ t('hero.available') }}</span>
    </div>
    <div class="hero__content">
      <div class="hero__headline reveal">
        <p class="eyebrow">{{ t('hero.eyebrow') }}</p>
        <GlitchHeroTitle />
        <div class="hero__intro">
          <p>{{ t('hero.intro') }}</p>
          <div class="hero__actions">
            <a class="text-link" href="#projetos">{{ t('hero.cta') }} <span>↗</span></a>
            <a class="text-link text-link--ghost" :href="RESUME_URL" download="Curriculo Walison Weudes.pdf">{{ t('resume.download') }} <span>↓</span></a>
          </div>
        </div>
      </div>
      <div class="hero__portrait">
        <div class="hero__portrait-frame">
          <HeroPortrait base="/imagens/retrato.webp" :alt="t('hero.portraitAlt')" />
        </div>
        <span class="portrait-mark">+</span><span class="portrait-caption">FULL STACK / UI DESIGN</span>
      </div>
    </div>
    <a class="scroll-cue" href="#projetos">{{ t('hero.scroll') }} <span>↓</span></a>
  </section>

  <ManifestoSection />
</template>

<script setup>
import GlitchHeroTitle from '../GlitchHeroTitle.vue'
import HeroPortrait from '../HeroPortrait.vue'
import ManifestoSection from './ManifestoSection.vue'
import { RESUME_URL } from '../../data/content'
import { t } from '../../i18n'

const currentYear = new Date().getFullYear()
</script>
