<template>
  <div
    v-if="visible"
    class="loader"
    :class="[`is-${phase}`, { 'is-glitching': glitching }]"
    :style="{ '--p': shown }"
    role="progressbar"
    :aria-label="t('loader.aria')"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="percent"
  >
    <div class="loader__main">
      <div class="loader__halftone" aria-hidden="true"></div>
      <div class="loader__glow" aria-hidden="true"></div>
      <div class="loader__rings" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="loader__scan" aria-hidden="true"></div>
      <div class="loader__crt" aria-hidden="true"></div>
      <div class="loader__vignette" aria-hidden="true"></div>
      <i class="loader__corner loader__corner--tl" aria-hidden="true"></i>
      <i class="loader__corner loader__corner--tr" aria-hidden="true"></i>
      <i class="loader__corner loader__corner--bl" aria-hidden="true"></i>
      <i class="loader__corner loader__corner--br" aria-hidden="true"></i>

      <svg width="0" height="0" class="loader__defs" aria-hidden="true">
        <defs>
          <g id="spider-mark" fill="currentColor">
            <g id="spider-half">
              <path d="M-34,-42 Q-40,-80 -26,-116 Q-24,-80 -20,-46 Z" />
              <path d="M-62,-30 Q-66,-56 -56,-74 Q-50,-54 -50,-38 Z" />
              <path d="M-8,-32 L-66,-30 L-84,-10 L-60,-21 L-8,-23 Z" />
              <path d="M-8,-12 L-70,-6 Q-86,-2 -84,8 Q-72,60 -26,112 Q-60,54 -72,10 L-8,-3 Z" />
              <path d="M-8,6 L-52,10 Q-62,12 -60,24 Q-56,62 -42,94 Q-52,62 -54,26 L-8,14 Z" />
            </g>
            <use href="#spider-half" transform="scale(-1 1)" />
            <path d="M0,-36 L17,-14 L15,10 L0,28 L-15,10 L-17,-14 Z" />
            <path d="M0,-54 L5,-47 L9,-54 L8,-43 L0,-39 L-8,-43 L-9,-54 L-5,-47 Z" />
            <path
              fill-rule="evenodd"
              d="M0,-44 L27,-14 L25,20 L0,54 L-25,20 L-27,-14 Z M0,-39 L22,-13 L20,18 L0,47 L-20,18 L-22,-13 Z"
            />
          </g>
        </defs>
      </svg>

      <div class="loader__content">
        <div class="loader__stage" aria-hidden="true">
          <div class="emblem">
            <div class="emblem__spin">
              <svg
                v-for="(layer, i) in layers"
                :key="i"
                class="emblem__layer"
                viewBox="-125 -125 250 250"
                :style="{ transform: `translateZ(${layer.z}px)`, color: layer.color }"
              >
                <use href="#spider-mark" />
              </svg>
              <svg class="emblem__layer emblem__layer--ghost-r" viewBox="-125 -125 250 250" :style="{ transform: `translateZ(${frontZ + 1}px)` }">
                <use href="#spider-mark" />
              </svg>
              <svg class="emblem__layer emblem__layer--ghost-b" viewBox="-125 -125 250 250" :style="{ transform: `translateZ(${frontZ + 2}px)` }">
                <use href="#spider-mark" />
              </svg>
            </div>
          </div>
          <div class="emblem__shadow"></div>
        </div>

        <div class="loader__info">
          <p class="loader__universe">{{ universe }}</p>
          <div class="loader__bar">
            <div class="loader__fill"></div>
          </div>
          <div class="loader__row">
            <p class="loader__status" aria-live="polite">{{ statusText }}</p>
            <strong class="loader__percent">{{ percentLabel }}<small>%</small></strong>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { usePreloader } from '../composables/usePreloader'
import { spiderFrames } from '../data/content'
import { t } from '../i18n'

const emit = defineEmits(['loaded'])

const universes = [
  'TERRA-1610',
  'TERRA-616',
  'TERRA-65',
  'TERRA-928',
  'TERRA-42',
  'TERRA-138',
  'TERRA-8311',
  'TERRA-90214',
]
const STATUS = ['loader.s1', 'loader.s2', 'loader.s3', 'loader.s4']

// Extrusão 3D: várias cópias do símbolo empilhadas em Z, escurecendo para trás.
const LAYER_COUNT = 16
const GAP = 1.7
const frontZ = (LAYER_COUNT / 2) * GAP
const layers = Array.from({ length: LAYER_COUNT }, (_, i) => {
  const t = i / (LAYER_COUNT - 1) // 0 = fundo, 1 = frente
  const lightness = 14 + t * t * 38
  return {
    z: (i - LAYER_COUNT / 2) * GAP,
    color: i === LAYER_COUNT - 1 ? '#ff3a40' : `hsl(357 ${70 + t * 20}% ${lightness}%)`,
  }
})

const visible = ref(true)
const phase = ref('loading') // loading → done → leaving
const shown = ref(0)
const glitching = ref(false)
const stageIndex = ref(0)

// Visitas repetidas na mesma sessão carregam mais rápido.
let seen = false
try {
  seen = sessionStorage.getItem('ww-loader-seen') === '1'
} catch {
  /* sessionStorage indisponível */
}
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const MIN_DURATION = reduceMotion ? 700 : seen ? 1500 : 3200

const { progress: realProgress, start: startPreload } = usePreloader({
  fonts: ['Chetta', 'Odeto'],
  images: ['/imagens/foro%20porti.png', ...spiderFrames],
})

const percent = computed(() => Math.round(shown.value * 100))
const percentLabel = computed(() => String(percent.value).padStart(3, '0'))
const universe = computed(() => `// ${universes[stageIndex.value % universes.length]}`)
const statusText = computed(() => {
  if (phase.value === 'leaving') return t('loader.enter')
  if (phase.value === 'done') return t('loader.done')
  return t(STATUS[stageIndex.value % STATUS.length])
})

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
  setTimeout(() => {
    visible.value = false
    emit('loaded')
  }, 1500)
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
    glitchUntil = now + 160
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
    } else if (now - finishedAt > (reduceMotion ? 150 : 700)) {
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
  --red-dark: #a90f19;
  --blue: #3157ff;
  position: fixed;
  inset: 0;
  z-index: 99999;
  color: var(--red);
  font-family: 'Courier New', Courier, 'Lucida Console', Monaco, monospace;
  user-select: none;
  cursor: progress;
}

/* ---------- camadas da transição de saída ---------- */
.loader__main {
  position: absolute;
  inset: 0;
}
.loader__main {
  display: grid;
  place-items: center;
  padding: 1.5rem;
  overflow: hidden;
  background: #030306;
}
.loader__defs {
  position: absolute;
}

.loader.is-leaving {
  pointer-events: none;
}
.loader.is-leaving .loader__info {
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 0.4s ease,
    transform 0.5s var(--ease, ease);
}
.loader.is-leaving .emblem {
  animation: emblemOut 0.9s cubic-bezier(0.5, 0, 0.2, 1) forwards;
}
.loader.is-leaving .loader__main {
  animation: loaderFade 0.95s cubic-bezier(0.4, 0, 0.2, 1) 0.35s forwards;
}
.loader.is-leaving .emblem__spin {
  animation-duration: 2.2s;
}

@keyframes emblemOut {
  60% {
    opacity: 1;
  }
  to {
    transform: scale(1.35);
    opacity: 0;
    filter: blur(6px);
  }
}
@keyframes loaderFade {
  to {
    opacity: 0;
    transform: scale(1.04);
    filter: blur(10px);
  }
}

/* ---------- fundo ---------- */
.loader__halftone {
  position: absolute;
  inset: 0;
  opacity: 0.3;
  background-image: radial-gradient(circle, rgba(230, 36, 41, 0.6) 0 1px, transparent 1.6px);
  background-size: 9px 9px;
  mask-image: radial-gradient(ellipse at 50% 45%, transparent 18%, #000 85%);
  animation: halftoneDrift 16s linear infinite;
}
@keyframes halftoneDrift {
  to {
    background-position: 9px 18px;
  }
}
.loader__glow {
  position: absolute;
  top: 44%;
  left: 50%;
  width: min(90vmin, 760px);
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(230, 36, 41, 0.38), rgba(169, 15, 25, 0.14) 40%, transparent 68%);
  animation: glowPulse 2.6s ease-in-out infinite;
}
@keyframes glowPulse {
  50% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1.08);
  }
}
.loader__rings {
  position: absolute;
  top: 44%;
  left: 50%;
  width: 0;
  height: 0;
}
.loader__rings i {
  position: absolute;
  top: 0;
  left: 0;
  width: min(46vmin, 380px);
  aspect-ratio: 1;
  border: 1px solid rgba(230, 36, 41, 0.35);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0.4);
  opacity: 0;
  animation: ringOut 3.6s cubic-bezier(0.2, 0.6, 0.3, 1) infinite;
}
.loader__rings i:nth-child(2) {
  animation-delay: 1.2s;
}
.loader__rings i:nth-child(3) {
  animation-delay: 2.4s;
}
@keyframes ringOut {
  15% {
    opacity: 0.9;
  }
  to {
    transform: translate(-50%, -50%) scale(2.4);
    opacity: 0;
    border-color: rgba(49, 87, 255, 0.4);
  }
}

.loader__scan {
  position: absolute;
  inset: 0 0 auto;
  height: 20vh;
  pointer-events: none;
  background: linear-gradient(transparent, rgba(230, 36, 41, 0.08) 70%, rgba(230, 36, 41, 0.22));
  border-bottom: 1px solid rgba(255, 90, 94, 0.4);
  animation: scan 3.8s linear infinite;
}
@keyframes scan {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(560%);
  }
}
.loader__crt {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.8;
  background:
    linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%),
    linear-gradient(90deg, rgba(255, 0, 0, 0.05), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.05));
  background-size:
    100% 3px,
    6px 100%;
}
.loader__vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.9));
}

.loader__corner {
  position: absolute;
  width: 1.6rem;
  height: 1.6rem;
  border: 0 solid rgba(230, 36, 41, 0.7);
}
.loader__corner--tl {
  top: 1rem;
  left: 1rem;
  border-width: 2px 0 0 2px;
}
.loader__corner--tr {
  top: 1rem;
  right: 1rem;
  border-width: 2px 2px 0 0;
}
.loader__corner--bl {
  bottom: 1rem;
  left: 1rem;
  border-width: 0 0 2px 2px;
}
.loader__corner--br {
  right: 1rem;
  bottom: 1rem;
  border-width: 0 2px 2px 0;
}

/* ---------- conteúdo ---------- */
.loader__content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(1.5rem, 5vh, 3rem);
  width: 100%;
  max-width: 460px;
}

.loader__stage {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
}

.emblem {
  width: clamp(190px, 38vmin, 340px);
  aspect-ratio: 1;
  perspective: 900px;
  animation: float 3.2s ease-in-out infinite;
}
.emblem__spin {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  animation: spin 6.5s linear infinite;
}
.emblem__layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  backface-visibility: visible;
}
.emblem__layer--ghost-r,
.emblem__layer--ghost-b {
  opacity: 0;
  color: var(--red);
}
.emblem__layer--ghost-b {
  color: var(--blue);
}
.is-glitching .emblem__layer--ghost-r {
  opacity: 0.5;
  margin-left: -9px;
  animation: ghost 0.12s steps(2) infinite;
}
.is-glitching .emblem__layer--ghost-b {
  opacity: 0.5;
  margin-left: 9px;
  animation: ghost 0.1s steps(2) infinite reverse;
}
.emblem__shadow {
  position: absolute;
  bottom: -2.2rem;
  width: 52%;
  height: 1.4rem;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(230, 36, 41, 0.55), transparent 70%);
  filter: blur(4px);
  animation: shadow 3.2s ease-in-out infinite;
}

@keyframes spin {
  from {
    transform: rotateX(-14deg) rotateY(0deg);
  }
  to {
    transform: rotateX(-14deg) rotateY(360deg);
  }
}
@keyframes float {
  50% {
    transform: translateY(-14px);
  }
}
@keyframes shadow {
  50% {
    transform: scale(0.82);
    opacity: 0.6;
  }
}
@keyframes ghost {
  0% {
    transform: translateZ(40px) translate(-4px, 2px);
  }
  100% {
    transform: translateZ(40px) translate(5px, -3px);
  }
}

.loader__info {
  display: grid;
  gap: 0.7rem;
  width: min(100%, 360px);
  margin-top: 1rem;
}
.loader__universe {
  margin: 0;
  font-size: 0.68rem;
  letter-spacing: 0.3em;
  text-align: center;
  color: rgba(255, 255, 255, 0.55);
}
.loader__bar {
  height: 6px;
  background: rgba(230, 36, 41, 0.16);
  clip-path: polygon(0 0, 100% 0, calc(100% - 6px) 100%, 6px 100%);
}
.loader__fill {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: linear-gradient(90deg, var(--red-dark), var(--red) 70%, #ff5a5e);
  box-shadow: 0 0 14px var(--red);
  transform: scaleX(var(--p));
  transform-origin: left;
  will-change: transform;
}
.loader__fill::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  transform: translateX(-100%);
  animation: shimmer 1.2s linear infinite;
}
@keyframes shimmer {
  to {
    transform: translateX(100%);
  }
}
.loader__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}
.loader__status {
  margin: 0;
  font-size: 0.66rem;
  letter-spacing: 0.2em;
  color: #fff;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
}
.loader__percent {
  font-family: Chetta, Impact, 'Arial Narrow', sans-serif;
  font-size: 1.6rem;
  font-weight: 400;
  line-height: 1;
  color: #fff;
  font-variant-numeric: tabular-nums;
}
.loader__percent small {
  margin-left: 0.1em;
  font-size: 0.55em;
  color: var(--red);
}
.is-glitching .loader__percent {
  text-shadow:
    -2px 0 var(--red),
    2px 0 var(--blue);
}
.loader.is-done .loader__status {
  animation: blink 0.25s 3 alternate;
}
@keyframes blink {
  from {
    opacity: 1;
  }
  to {
    opacity: 0.3;
  }
}

@media (max-width: 520px) {
  .loader__status {
    font-size: 0.56rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .emblem,
  .emblem__spin,
  .emblem__shadow,
  .loader__halftone,
  .loader__glow,
  .loader__rings i,
  .loader__scan,
  .loader__fill::after {
    animation: none;
  }
  .emblem__spin {
    transform: rotateX(-14deg) rotateY(-20deg);
  }
}
</style>
