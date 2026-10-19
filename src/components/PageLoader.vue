<template>
  <div
    v-if="visible"
    class="loader"
    :class="[`is-${phase}`, { 'is-glitching': glitching }]"
    :style="{ '--p': shown, '--cols': grid.cols, '--rows': grid.rows }"
    role="progressbar"
    :aria-label="t('loader.aria')"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="percent"
  >
    <!-- O fundo vermelho é formado por triângulos: na saída eles somem em mosaico. -->
    <div class="loader__pixels" aria-hidden="true">
      <span v-for="cell in cells" :key="cell.i" :class="{ 'is-flip': cell.flip }">
        <i
          v-for="(tri, k) in cell.tris"
          :key="k"
          :class="[`tri--${k}`, { 'is-dark': tri.dark }]"
          :style="{ '--d': `${tri.delay}ms` }"
        ></i>
      </span>
    </div>

    <div class="loader__hud">
      <!-- moldura HUD com entalhes -->
      <div class="hud__frame" aria-hidden="true"></div>
      <svg class="hud__notch hud__notch--top" viewBox="0 0 120 14" aria-hidden="true"><path d="M0 0 L18 13 L102 13 L120 0" /></svg>
      <svg class="hud__notch hud__notch--bottom" viewBox="0 0 120 14" aria-hidden="true"><path d="M0 14 L18 1 L102 1 L120 14" /></svg>
      <svg class="hud__notch hud__notch--left" viewBox="0 0 14 120" aria-hidden="true"><path d="M0 0 L13 18 L13 102 L0 120" /></svg>
      <svg class="hud__notch hud__notch--right" viewBox="0 0 14 120" aria-hidden="true"><path d="M14 0 L1 18 L1 102 L14 120" /></svg>
      <i class="hud__tick hud__tick--tl" aria-hidden="true"></i>
      <i class="hud__tick hud__tick--tr" aria-hidden="true"></i>
      <i class="hud__tick hud__tick--bl" aria-hidden="true"></i>
      <i class="hud__tick hud__tick--br" aria-hidden="true"></i>

      <p class="hud__label hud__label--tl">WW / PORTFOLIO</p>
      <p class="hud__label hud__label--tr">PICOS, PI — BR<br />{{ clock }}</p>
      <p class="hud__label hud__label--bl">{{ universe }}</p>
      <p class="hud__label hud__label--br" aria-live="polite">{{ statusText }}</p>

      <div class="hud__center">
        <div class="mark" :style="{ '--mark': `url(${spiderMark})` }" aria-hidden="true">
          <i class="mark__layer mark__base"></i>
          <i class="mark__layer mark__fill"></i>
          <i class="mark__layer mark__ghost mark__ghost--r"></i>
          <i class="mark__layer mark__ghost mark__ghost--b"></i>
          <i class="mark__scan"></i>
        </div>
        <p class="hud__percent">{{ percent }}%</p>
      </div>

      <div class="hud__progress" aria-hidden="true"><i></i></div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { usePreloader } from '../composables/usePreloader'
import { t } from '../i18n'
import spiderMark from '../assets/aranha-loader.svg'

const emit = defineEmits(['loaded'])

const universes = ['TERRA-1610', 'TERRA-616', 'TERRA-65', 'TERRA-928', 'TERRA-42', 'TERRA-138', 'TERRA-8311', 'TERRA-90214']
const STATUS = ['loader.s1', 'loader.s2', 'loader.s3', 'loader.s4']

// Aranha do carregamento (arte em spray). Usada como máscara para poder colorir as camadas.
// Grade de blocos proporcional à tela (blocos ~quadrados).
const COLS = window.innerWidth < 600 ? 7 : 14
const grid = {
  cols: COLS,
  rows: Math.max(4, Math.round((COLS * window.innerHeight) / window.innerWidth)),
}
// Cada bloco vira dois triângulos; a diagonal alterna para formar o padrão.
const cells = Array.from({ length: grid.cols * grid.rows }, (_, i) => {
  const row = Math.floor(i / grid.cols)
  const col = i % grid.cols
  const base = Math.random() * 420
  return {
    i,
    flip: (row + col) % 2 === 1,
    tris: [0, 1].map(() => ({
      delay: Math.round(base + Math.random() * 160),
      dark: Math.random() < 0.28,
    })),
  }
})

const visible = ref(true)
const phase = ref('loading') // loading → done → leaving
const shown = ref(0)
const glitching = ref(false)
const stageIndex = ref(0)
const clock = ref('')

let seen = false
try {
  seen = sessionStorage.getItem('ww-loader-seen') === '1'
} catch {
  /* sessionStorage indisponível */
}
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const MIN_DURATION = reduceMotion ? 700 : seen ? 1500 : 3000
// Em desenvolvimento, ?noloader pula a tela de carregamento.
const skipLoader = import.meta.env.DEV && new URLSearchParams(location.search).has('noloader')

const { progress: realProgress, start: startPreload } = usePreloader({
  fonts: ['Chetta', 'Odeto'],
  images: ['/imagens/retrato.webp'],
})

const percent = computed(() => Math.round(shown.value * 100))
const universe = computed(() => `// ${universes[stageIndex.value % universes.length]}`)
const statusText = computed(() => {
  if (phase.value === 'leaving') return t('loader.enter')
  if (phase.value === 'done') return t('loader.done')
  return t(STATUS[stageIndex.value % STATUS.length])
})

const updateClock = () => {
  clock.value = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Fortaleza',
  }).format(new Date())
}

let frame
let lastTime = 0
let startTime = 0
let glitchUntil = 0
let finishedAt = 0
let previousOverflow = ''

const unlockScroll = () => {
  document.documentElement.style.overflow = previousOverflow
}

const leave = () => {
  phase.value = 'leaving'
  unlockScroll()
  document.documentElement.classList.add('is-ready')
  window.dispatchEvent(new CustomEvent('site:ready'))
  setTimeout(() => {
    visible.value = false
    emit('loaded')
  }, reduceMotion ? 200 : 1100)
}

const tick = (now) => {
  const dt = Math.min(0.05, (now - lastTime) / 1000 || 0.016)
  lastTime = now

  // Avança suavemente até o menor entre o progresso real e a linha do tempo mínima.
  const timeline = Math.min(1, (now - startTime) / MIN_DURATION)
  const target = Math.min(realProgress.value, timeline)
  let next = shown.value + (target - shown.value) * (1 - Math.exp(-dt * 6))
  if (target === 1 && next > 0.997) next = 1
  shown.value = next

  const nextStage = Math.min(universes.length - 1, Math.floor(next * universes.length))
  if (nextStage !== stageIndex.value) {
    stageIndex.value = nextStage
    glitchUntil = now + 140
  }
  if (!reduceMotion) {
    const active = now < glitchUntil && phase.value === 'loading'
    if (active !== glitching.value) glitching.value = active
  }

  if (next === 1) {
    if (!finishedAt) {
      finishedAt = now
      phase.value = 'done'
      glitching.value = false
    } else if (now - finishedAt > (reduceMotion ? 150 : 550)) {
      try {
        sessionStorage.setItem('ww-loader-seen', '1')
      } catch {
        /* ignore */
      }
      leave()
      return
    }
  }

  frame = requestAnimationFrame(tick)
}

onMounted(() => {
  if (skipLoader) {
    leave()
    return
  }
  updateClock()
  previousOverflow = document.documentElement.style.overflow
  document.documentElement.style.overflow = 'hidden'
  startPreload()
  frame = requestAnimationFrame((now) => {
    startTime = lastTime = now
    tick(now)
  })
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  unlockScroll()
})
</script>

<style scoped>
.loader {
  --red: #e62429;
  --ink: #0b0b10;
  position: fixed;
  inset: 0;
  z-index: 99999;
  color: var(--ink);
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  user-select: none;
  cursor: progress;
}

/* ---------- blocos (fundo) ---------- */
.loader__pixels {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(var(--cols), 1fr);
  grid-template-rows: repeat(var(--rows), 1fr);
  background: var(--red);
}
.loader__pixels span {
  position: relative;
}
.loader__pixels i {
  position: absolute;
  inset: -1px; /* leve sobreposição para não aparecerem frestas */
  background: var(--red);
}
/* diagonal "\" */
.loader__pixels .tri--0 {
  clip-path: polygon(0 0, 100% 0, 0 100%);
}
.loader__pixels .tri--1 {
  clip-path: polygon(100% 0, 100% 100%, 0 100%);
}
/* diagonal "/" nos blocos alternados */
.loader__pixels .is-flip .tri--0 {
  clip-path: polygon(0 0, 100% 100%, 0 100%);
}
.loader__pixels .is-flip .tri--1 {
  clip-path: polygon(0 0, 100% 0, 100% 100%);
}
.is-leaving .loader__pixels {
  background: transparent;
}
.is-leaving .loader__pixels i {
  animation: pixelOut 0.16s steps(1) var(--d) forwards;
}
.is-leaving .loader__pixels i.is-dark {
  animation: pixelOutDark 0.28s steps(1) var(--d) forwards;
}
@keyframes pixelOut {
  to {
    opacity: 0;
  }
}
@keyframes pixelOutDark {
  0% {
    background: var(--ink);
  }
  55% {
    background: #3157ff;
    opacity: 0.85;
  }
  100% {
    opacity: 0;
  }
}

/* ---------- HUD ---------- */
.loader__hud {
  position: absolute;
  inset: 0;
  transition:
    opacity 0.25s ease,
    transform 0.4s cubic-bezier(0.7, 0, 0.84, 0);
}
.is-leaving .loader__hud {
  opacity: 0;
  transform: scale(0.985);
}

.hud__frame {
  position: absolute;
  inset: 12px;
  border: 1px solid rgba(11, 11, 16, 0.35);
}
.hud__notch {
  position: absolute;
  overflow: visible;
}
.hud__notch path {
  fill: var(--red);
  stroke: rgba(11, 11, 16, 0.55);
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}
.hud__notch--top,
.hud__notch--bottom {
  left: 50%;
  width: 120px;
  height: 14px;
  margin-left: -60px;
}
.hud__notch--top {
  top: 12px;
}
.hud__notch--bottom {
  bottom: 12px;
}
.hud__notch--left,
.hud__notch--right {
  top: 50%;
  width: 14px;
  height: 120px;
  margin-top: -60px;
}
.hud__notch--left {
  left: 12px;
}
.hud__notch--right {
  right: 12px;
}
.hud__tick {
  position: absolute;
  width: 9px;
  height: 9px;
}
.hud__tick::before,
.hud__tick::after {
  content: '';
  position: absolute;
  background: var(--ink);
}
.hud__tick::before {
  top: 4px;
  left: 0;
  width: 9px;
  height: 1px;
}
.hud__tick::after {
  top: 0;
  left: 4px;
  width: 1px;
  height: 9px;
}
.hud__tick--tl {
  top: 8px;
  left: 8px;
}
.hud__tick--tr {
  top: 8px;
  right: 8px;
}
.hud__tick--bl {
  bottom: 8px;
  left: 8px;
}
.hud__tick--br {
  right: 8px;
  bottom: 8px;
}

.hud__label {
  position: absolute;
  margin: 0;
  font-size: 0.62rem;
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(11, 11, 16, 0.78);
}
.hud__label--tl {
  top: 2.1rem;
  left: 2.2rem;
}
.hud__label--tr {
  top: 2.1rem;
  right: 2.2rem;
  text-align: right;
}
.hud__label--bl {
  bottom: 2.1rem;
  left: 2.2rem;
}
.hud__label--br {
  right: 2.2rem;
  bottom: 2.1rem;
  max-width: 45vw;
  text-align: right;
}

.hud__center {
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  justify-items: center;
  gap: 1.1rem;
  transform: translate(-50%, -50%);
}
.hud__percent {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  font-variant-numeric: tabular-nums;
}
.is-glitching .hud__percent {
  text-shadow:
    -2px 0 rgba(49, 87, 255, 0.8),
    2px 0 rgba(255, 255, 255, 0.6);
}
.is-done .hud__percent {
  animation: blink 0.2s 3 alternate;
}

.hud__progress {
  position: absolute;
  right: 12px;
  bottom: 12px;
  left: 12px;
  height: 2px;
}
.hud__progress i {
  display: block;
  height: 100%;
  background: var(--ink);
  transform: scaleX(var(--p));
  transform-origin: left;
}

/* ---------- aranha (carregamento estilo jogo) ---------- */
.mark {
  position: relative;
  width: clamp(110px, 17vmin, 180px);
  aspect-ratio: 1289 / 1393;
  animation: breathe 2.6s ease-in-out infinite;
}
.mark__layer {
  position: absolute;
  inset: 0;
  -webkit-mask: var(--mark) center / contain no-repeat;
  mask: var(--mark) center / contain no-repeat;
}
/* silhueta apagada: o "vazio" que vai sendo preenchido */
.mark__base {
  background: rgba(11, 11, 16, 0.2);
}
/* preenchimento de baixo para cima conforme o progresso (--p) */
.mark__fill {
  background: var(--ink);
  clip-path: inset(calc((1 - var(--p)) * 100%) 0 0 0);
}
/* linha de varredura no nível do preenchimento */
.mark__scan {
  position: absolute;
  top: calc((1 - var(--p)) * 100%);
  left: -14%;
  right: -14%;
  height: 2px;
  margin-top: -1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.85) 25%, rgba(255, 255, 255, 0.85) 75%, transparent);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.55);
  opacity: 0.8;
  transition: opacity 0.4s ease;
}
.is-done .mark__scan,
.is-leaving .mark__scan {
  opacity: 0;
}
/* camadas do glitch (só na troca de universo) */
.mark__ghost {
  opacity: 0;
  clip-path: inset(calc((1 - var(--p)) * 100%) 0 0 0);
}
.mark__ghost--r {
  background: #fff;
}
.mark__ghost--b {
  background: #3157ff;
}
.is-glitching .mark__ghost--r {
  opacity: 0.3;
  transform: translate(-4px, 1px);
}
.is-glitching .mark__ghost--b {
  opacity: 0.4;
  transform: translate(4px, -1px);
}
.is-glitching .mark {
  animation: markJolt 0.14s steps(2) 1;
}
/* ao completar: um "pulso" de confirmação */
.is-done .mark {
  animation: markDone 0.6s cubic-bezier(0.16, 1, 0.3, 1) 1;
}
@keyframes breathe {
  50% {
    transform: scale(1.03);
  }
}
@keyframes markJolt {
  50% {
    transform: translateX(-3px) skewX(-3deg);
  }
}
@keyframes markDone {
  30% {
    transform: scale(1.1);
    filter: drop-shadow(0 0 14px rgba(255, 255, 255, 0.6));
  }
}
@keyframes blink {
  to {
    opacity: 0.3;
  }
}

@media (max-width: 600px) {
  .hud__label {
    font-size: 0.52rem;
  }
  .hud__label--tl,
  .hud__label--bl {
    left: 1.6rem;
  }
  .hud__label--tr,
  .hud__label--br {
    right: 1.6rem;
  }
  .hud__notch--left,
  .hud__notch--right {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mark {
    animation: none !important;
  }
  .is-leaving .loader__pixels i {
    animation: pixelOut 0.2s linear forwards;
  }
}
</style>
