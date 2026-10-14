<template>
  <div ref="progressRef" class="scroll-progress" aria-hidden="true"></div>

  <header class="topbar" :class="{ 'is-scrolled': isScrolled }">
    <a class="brand" href="#inicio" :aria-label="t('brand.aria')">W<span>W</span></a>
    <p class="topbar__role">Designer + Developer</p>
    <div class="topbar__right">
      <nav class="topbar__links" :aria-label="t('nav.main')">
        <a
          v-for="link in topbarLinks"
          :key="link.href"
          :href="link.href"
          :class="{ 'is-active': active === link.href }"
        >{{ t(link.key) }}</a>
      </nav>
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
import { dockItems, topbarLinks } from '../data/content'
import { LOCALES, locale, setLocale, t } from '../i18n'

const isScrolled = ref(false)
const active = ref('')
const progressRef = ref(null)

let observer
let ticking = false

const update = () => {
  ticking = false
  const y = window.scrollY
  isScrolled.value = y > 32
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
})
</script>
