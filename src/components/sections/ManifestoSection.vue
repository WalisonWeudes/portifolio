<template>
  <section ref="root" class="manifesto" aria-labelledby="manifesto-title">
    <div class="manifesto__sticky">
      <p class="manifesto__label">
        <span>{{ t('manifesto.label') }}</span>
        <span>{{ String(lit).padStart(2, '0') }} / {{ String(words.length).padStart(2, '0') }}</span>
      </p>
      <h2 id="manifesto-title" class="manifesto__text" :style="{ '--n': words.length }">
        <span
          v-for="(word, i) in words"
          :key="`${locale}-${i}`"
          class="manifesto__word"
          :class="{ 'is-accent': word.accent, 'is-blue': word.blue }"
          :style="{ '--i': i }"
        >{{ word.text }}</span>
      </h2>
      <div class="manifesto__bar" aria-hidden="true"><i></i></div>
    </div>
  </section>
</template>

<script setup>
// Texto-manifesto que "acende" palavra por palavra conforme o scroll.
import { computed, ref } from 'vue'
import { locale, t } from '../../i18n'
import { stickyProgress, useScrollFrame } from '../../composables/useScrollProgress'

const root = ref(null)
const lit = ref(0)

// *palavra* = destaque vermelho, _palavra_ = destaque azul
const words = computed(() =>
  t('manifesto.text')
    .split(' ')
    .map((raw) => {
      if (raw.startsWith('*')) return { text: raw.replace(/\*/g, ''), accent: true }
      if (raw.startsWith('_')) return { text: raw.replace(/_/g, ''), blue: true }
      return { text: raw }
    }),
)

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

useScrollFrame(() => {
  const el = root.value
  if (!el) return
  const p = reduce ? 1 : stickyProgress(el)
  el.style.setProperty('--sp', p.toFixed(4))
  lit.value = Math.min(words.value.length, Math.round(p * 1.15 * words.value.length))
})
</script>

<style scoped>
.manifesto {
  --sp: 0;
  position: relative;
  height: 240vh;
  background: var(--bg);
  border-bottom: 1px solid var(--line);
}

.manifesto__sticky {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: clamp(1.5rem, 4vh, 3rem);
  height: 100vh;
  height: 100svh;
  max-width: var(--container);
  margin: 0 auto;
  padding: 6rem var(--gutter) 3rem;
  overflow: hidden;
}

.manifesto__label {
  display: flex;
  justify-content: space-between;
  margin: 0;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.manifesto__text {
  margin: 0;
  font-family: var(--display);
  font-size: clamp(2.3rem, 6.2vw, 7.4rem);
  font-weight: 400;
  line-height: 0.95;
  letter-spacing: -0.01em;
  text-align: justify;
  text-align-last: justify;
  text-transform: uppercase;
}

.manifesto__word {
  display: inline-block;
  margin-right: 0.22em;
  /* cada palavra acende quando o progresso passa pela sua posição */
  --on: clamp(0, calc(var(--sp) * var(--n) * 1.15 - var(--i)), 1);
  opacity: calc(0.12 + 0.88 * var(--on));
  transform: translateY(calc((1 - var(--on)) * 0.12em));
  transition: color 0.3s ease;
}
.manifesto__word.is-accent {
  color: var(--red);
}
.manifesto__word.is-blue {
  color: var(--blue);
  font-family: Georgia, serif;
  font-style: italic;
  text-transform: none;
}

.manifesto__bar {
  height: 2px;
  background: var(--line);
}
.manifesto__bar i {
  display: block;
  height: 100%;
  background: var(--red);
  transform: scaleX(var(--sp));
  transform-origin: left;
}

@media (max-width: 760px) {
  .manifesto {
    height: 200vh;
  }
  .manifesto__text {
    font-size: clamp(2rem, 10.5vw, 3.6rem);
    text-align: left;
    text-align-last: left;
  }
}
</style>
