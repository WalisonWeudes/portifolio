<template>
  <span
    ref="root"
    class="kt"
    :class="[`kt--${state}`]"
    @pointerenter="onEnter"
    @pointermove="onMove"
    @pointerleave="onLeave"
  >
    <span class="kt__sr">{{ text }}</span>
    <span class="kt__glyphs" aria-hidden="true">
      <span v-for="(word, w) in words" :key="`${text}-${w}`" class="kt__word">
        <span
          v-for="(ch, c) in word.chars"
          :key="c"
          class="kt__char"
          :style="{ '--i': ch.i, '--wv': ch.wave }"
        >{{ ch.c }}</span>
      </span>
    </span>
  </span>
</template>

<script setup>
// Tipografia cinética: cada letra é um elemento próprio que
//  1. entra em cascata de trás de uma máscara quando o texto aparece na tela;
//  2. inclina e ondula com a velocidade do scroll (variável --kv do <html>);
//  3. estica e sobe perto do cursor.
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  text: { type: String, required: true },
  entrance: { type: Boolean, default: true },
})

const root = ref(null)
// hidden → in (entrando) → live (reagindo a scroll/cursor)
const state = ref(props.entrance ? 'hidden' : 'live')

const words = computed(() => {
  let i = 0
  return props.text.split(' ').map((word, w, all) => ({
    chars: [...word + (w < all.length - 1 ? ' ' : '')].map((c) => {
      const ch = { c, i, wave: Math.sin(i * 1.7) } // padrão de onda por letra
      i += 1
      return ch
    }),
  }))
})

let observer
let liveTimer
let frame = null
let chars = []
let pointer = null

const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

const enter = () => {
  state.value = 'in'
  clearTimeout(liveTimer)
  liveTimer = setTimeout(() => (state.value = 'live'), 900 + words.value.flatMap((w) => w.chars).length * 22)
}

// Proximidade do cursor → --p (0 a 1) em cada letra
const paint = () => {
  frame = null
  if (!pointer) return
  for (const el of chars) {
    const r = el.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const d = Math.hypot(pointer.x - cx, (pointer.y - cy) * 1.4)
    const radius = Math.max(90, r.height * 1.6)
    const p = Math.max(0, 1 - d / radius)
    el.style.setProperty('--p', (p * p * (3 - 2 * p)).toFixed(3))
  }
}
const onEnter = () => {
  if (reduce() || !window.matchMedia('(hover: hover)').matches) return
  chars = [...root.value.querySelectorAll('.kt__char')]
}
const onMove = (event) => {
  if (!chars.length || state.value !== 'live') return
  pointer = { x: event.clientX, y: event.clientY }
  if (!frame) frame = requestAnimationFrame(paint)
}
const onLeave = () => {
  pointer = null
  for (const el of chars) el.style.setProperty('--p', '0')
}

onMounted(() => {
  if (!props.entrance) return
  if (reduce() || !('IntersectionObserver' in window)) {
    state.value = 'live'
    return
  }
  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return
      enter()
      observer.disconnect()
    },
    { threshold: 0.35 },
  )
  observer.observe(root.value)
})

// troca de idioma: novas letras entram de novo
watch(
  () => props.text,
  () => {
    if (props.entrance && state.value === 'live' && !reduce()) {
      state.value = 'hidden'
      requestAnimationFrame(() => requestAnimationFrame(enter))
    }
  },
)

onBeforeUnmount(() => {
  observer?.disconnect()
  clearTimeout(liveTimer)
  cancelAnimationFrame(frame)
})
</script>

<style scoped>
.kt {
  display: inline;
}
.kt__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
.kt__word {
  display: inline-block;
  white-space: nowrap;
  /* máscara da entrada (folga em cima/baixo para acentos e o esticar) */
  clip-path: inset(-0.35em -0.1em -0.12em -0.1em);
}
.kt__char {
  --p: 0;
  --in: 0;
  display: inline-block;
  transform-origin: 50% 100%;
  transform:
    translateY(calc(var(--in) * 110% + var(--kv, 0) * var(--wv) * 0.12em - var(--p) * 0.07em))
    skewX(calc(var(--kv, 0) * -7deg))
    scaleY(calc(1 + var(--p) * 0.22));
  transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

/* antes de entrar: letras escondidas abaixo da linha, levemente giradas */
.kt--hidden .kt__char {
  --in: 1;
  transition: none;
  rotate: 8deg;
}
/* entrada em cascata */
.kt--in .kt__char {
  --in: 0;
  rotate: 0deg;
  transition:
    transform 0.9s cubic-bezier(0.16, 1, 0.3, 1),
    rotate 0.9s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: calc(var(--i) * 22ms);
}
.kt--live .kt__word {
  clip-path: none;
}

@media (prefers-reduced-motion: reduce) {
  .kt__char {
    transform: none !important;
    rotate: none !important;
    transition: none !important;
  }
}
</style>
