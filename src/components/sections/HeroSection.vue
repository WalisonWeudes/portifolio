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
          <a class="text-link" href="#projetos">{{ t('hero.cta') }} <span>↗</span></a>
        </div>
      </div>
      <div class="hero__portrait">
        <div class="hero__portrait-frame">
          <HeroPortrait base="/imagens/foro%20porti.png" :alt="t('hero.portraitAlt')" />
        </div>
        <span class="portrait-mark">+</span><span class="portrait-caption">FULL STACK / UI DESIGN</span>
      </div>
    </div>
    <a class="scroll-cue" href="#projetos">{{ t('hero.scroll') }} <span>↓</span></a>
  </section>

  <div class="marquee" aria-hidden="true">
    <div>DESIGN ✦ DEVELOPMENT ✦ UI/UX ✦ FRONT-END ✦ DESIGN ✦ DEVELOPMENT ✦ UI/UX ✦ FRONT-END ✦</div>
  </div>
</template>

<script setup>
import GlitchHeroTitle from '../GlitchHeroTitle.vue'
import HeroPortrait from '../HeroPortrait.vue'
import { t } from '../../i18n'

const currentYear = new Date().getFullYear()
</script>
