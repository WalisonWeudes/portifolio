<template>
  <ul ref="root" class="stats" :aria-label="t('stats.label')">
    <li v-for="(stat, index) in stats" :key="index" class="stats__item reveal">
      <strong class="stats__value">
        <span v-if="stat.value !== undefined" :data-count="stat.value">{{ stat.value }}</span>
        <span v-else>{{ tr(stat.text) }}</span>
      </strong>
      <span class="stats__label">{{ tr(stat.label) }}</span>
    </li>
  </ul>
</template>

<script setup>
// Números do currículo com contagem animada quando entram na tela.
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { stats } from '../data/content'
import { t, tr } from '../i18n'

const root = ref(null)
let observer
let frame

const countUp = (el) => {
  const target = Number(el.dataset.count)
  const duration = 1400
  const start = performance.now()
  const tick = (now) => {
    const p = Math.min(1, (now - start) / duration)
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)))
    if (p < 1) frame = requestAnimationFrame(tick)
  }
  el.textContent = '0'
  frame = requestAnimationFrame(tick)
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.querySelectorAll('[data-count]').forEach(countUp)
        observer.unobserve(entry.target)
      }
    },
    { threshold: 0.4 },
  )
  observer.observe(root.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  cancelAnimationFrame(frame)
})
</script>
