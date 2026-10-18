<template>
  <div ref="progressRef" class="scroll-progress" aria-hidden="true"></div>

  <header class="topbar" :class="{ 'is-scrolled': isScrolled }">
    <a class="brand" href="#inicio" :aria-label="t('brand.aria')">W<span>W</span></a>
    <p class="topbar__role topbar__hud">
      <span>PICOS, PI — BR</span><span>{{ clock }}</span>
    </p>
    <div class="topbar__right">
      <nav class="topbar__links" :aria-label="t('nav.main')">
        <a
          v-for="link in topbarLinks"
          :key="link.href"
          :href="link.href"
          :class="{ 'is-active': active === link.href }"
        >{{ t(link.key) }}</a>
      </nav>
      <a class="topbar__cv" :href="RESUME_URL" download="Curriculo Walison Weudes.pdf">
        <span class="topbar__cv-long">{{ t('resume.download') }}</span><span class="topbar__cv-short">CV</span> ↓
      </a>
      <div class="lang-switch" role="group" :aria-label="t('lang.switch')">
        <button
          v-for="code in LOCALES"
          :key="code"
          type="button"
          :class="{ 'is-active': locale === code }"
          :aria-pressed="locale === code"
          @click="setLocale(code)"
        >{{ code.toUpperCase() }}</button>
      </div>
    </div>
  </header>

  <a
    class="to-top"
    :class="{ 'is-visible': showTop }"
    href="#inicio"
    :aria-label="t('nav.top')"
    :tabindex="showTop ? 0 : -1"
    @click.prevent="toTop"
  >
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
  </a>

  <nav class="dock" :aria-label="t('nav.quick')">
    <a
      v-for="item in dockItems"
      :key="item.href"
      :href="item.href"
      :class="{ 'is-active': active === item.href }"
      :aria-current="active === item.href ? 'true' : undefined"
    >
      <b>{{ item.number }}</b>{{ t(item.key) }}
    </a>
  </nav>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { RESUME_URL, dockItems, topbarLinks } from '../data/content'
import { LOCALES, locale, setLocale, t } from '../i18n'

const isScrolled = ref(false)
const active = ref('')
const progressRef = ref(null)
const clock = ref('')
const showTop = ref(false)
const toTop = () => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
}

const updateClock = () => {
  clock.value = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Fortaleza',
  }).format(new Date())
}
let clockTimer

let observer
let ticking = false

const update = () => {
  ticking = false
  const y = window.scrollY
  isScrolled.value = y > 32
  showTop.value = y > window.innerHeight * 1.2
  const max = document.documentElement.scrollHeight - window.innerHeight
  if (progressRef.value) progressRef.value.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`
}
const onScroll = () => {
  if (ticking) return
  ticking = true
  requestAnimationFrame(update)
}

onMounted(() => {
  update()
  updateClock()
  clockTimer = setInterval(updateClock, 20000)
  window.addEventListener('scroll', onScroll, { passive: true })

  // Seção ativa: a que cruza a faixa central da viewport.
  const ids = ['#inicio', ...dockItems.map((d) => d.href), ...topbarLinks.map((l) => l.href)]
  const sections = [...new Set(ids)].map((id) => document.querySelector(id)).filter(Boolean)
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) active.value = `#${entry.target.id}`
      }
    },
    { rootMargin: '-45% 0px -50% 0px' },
  )
  sections.forEach((section) => observer.observe(section))
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  observer?.disconnect()
  clearInterval(clockTimer)
})
</script>
