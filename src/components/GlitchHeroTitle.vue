<template>
  <h1
    id="hero-title"
    class="glitch-hero-title"
    :class="{ 'is-glitching': isGlitching }"
    :style="titleStyle"
    @mouseenter="triggerGlitch"
    @click="triggerGlitch"
  >
    <span class="title-line line-1">
      <span class="word" :style="{ fontFamily: wordFonts[0] }">DESIGNER</span>
      <em class="ampersand" :style="{ fontFamily: wordFonts[1] }">&</em>
    </span>
    <span class="title-line line-2">
      <span class="word" :style="{ fontFamily: wordFonts[2] }">FRONT-END</span>
    </span>
    <span class="title-line line-3">
      <span class="word" :style="{ fontFamily: wordFonts[3] }">DEVELOPER</span>
    </span>
  </h1>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const isGlitching = ref(false)
const mousePos = ref({ x: 0, y: 0 })

const fontPool = [
  "Chetta, Impact, 'Arial Narrow', sans-serif",
  "Odeto, 'Courier New', monospace",
  "Georgia, 'Times New Roman', serif",
  "'Courier New', Monaco, monospace",
  "Impact, 'Arial Black', sans-serif",
  "Inter, 'Segoe UI', sans-serif",
]

const wordFonts = ref([
  fontPool[0],
  fontPool[2],
  fontPool[0],
  fontPool[0],
])

let glitchTimer = null
let fontShiftTimer = null
let mouseListener = null

const titleStyle = computed(() => {
  const rx = (mousePos.value.y * -12).toFixed(2)
  const ry = (mousePos.value.x * 14).toFixed(2)
  return {
    transform: `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg)`,
  }
})

const triggerGlitch = () => {
  if (isGlitching.value) return
  isGlitching.value = true

  // Randomize fonts rapidly during glitch
  const tempInterval = setInterval(() => {
    wordFonts.value = wordFonts.value.map(() => fontPool[Math.floor(Math.random() * fontPool.length)])
  }, 70)

  setTimeout(() => {
    clearInterval(tempInterval)
    isGlitching.value = false
    // Reset to base font with occasional random accent
    wordFonts.value = [
      fontPool[0],
      fontPool[Math.random() > 0.5 ? 2 : 1],
      fontPool[0],
      fontPool[0],
    ]
  }, 450)
}

const handleMouseMove = (event) => {
  const { innerWidth, innerHeight } = window
  const x = (event.clientX / innerWidth) - 0.5
  const y = (event.clientY / innerHeight) - 0.5
  mousePos.value = { x, y }
}

onMounted(() => {
  mouseListener = (e) => handleMouseMove(e)
  window.addEventListener('mousemove', mouseListener, { passive: true })

  // Trigger initial glitch effect on load
  setTimeout(() => {
    triggerGlitch()
  }, 800)

  // Periodic random glitch & font change every 2.5 - 4.5 seconds
  const scheduleNextGlitch = () => {
    const delay = 2500 + Math.random() * 2000
    glitchTimer = setTimeout(() => {
      triggerGlitch()
      scheduleNextGlitch()
    }, delay)
  }
  scheduleNextGlitch()
})

onBeforeUnmount(() => {
  if (mouseListener) window.removeEventListener('mousemove', mouseListener)
  if (glitchTimer) clearTimeout(glitchTimer)
  if (fontShiftTimer) clearTimeout(fontShiftTimer)
})
</script>

<style scoped>
.glitch-hero-title {
  position: relative;
  z-index: 2;
  margin: 0;
  font-family: Chetta, Impact, 'Arial Narrow', sans-serif;
  font-size: clamp(4.35rem, 9.7vw, 11.5rem);
  font-weight: 400;
  line-height: 0.72;
  letter-spacing: -0.045em;
  text-transform: uppercase;
  transform-style: preserve-3d;
  transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
  user-select: none;
}

.title-line {
  display: block;
  position: relative;
  transition: font-family 0.1s ease;
}

.line-1 .word {
  color: #f5f5f2;
}

.line-2 {
  margin-left: clamp(1rem, 7vw, 9rem);
  color: #e62429;
}

.line-3 {
  margin-left: clamp(0rem, 2vw, 3rem);
  color: #f5f5f2;
}

.ampersand {
  font-family: Georgia, serif;
  font-size: 0.72em;
  font-style: normal;
  font-weight: 400;
  color: #3157ff;
  margin-left: 0.2em;
}

/* Glitch Animation & RGB Offset Effects */
.glitch-hero-title.is-glitching {
  animation: glitchShake 0.45s infinite ease-in-out;
}

.glitch-hero-title.is-glitching .word,
.glitch-hero-title.is-glitching .ampersand {
  text-shadow:
    -3px 0 #e62429,
    3px 0 #3157ff,
    0 0 12px rgba(230, 36, 41, 0.8);
}

.glitch-hero-title::before,
.glitch-hero-title::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0;
}

.glitch-hero-title.is-glitching::before {
  opacity: 0.8;
  color: #e62429;
  left: -4px;
  clip-path: inset(20% 0 30% 0);
  animation: glitchSlice 0.2s infinite linear alternate-reverse;
}

.glitch-hero-title.is-glitching::after {
  opacity: 0.8;
  color: #3157ff;
  left: 4px;
  clip-path: inset(50% 0 10% 0);
  animation: glitchSlice 0.15s infinite linear alternate;
}

@keyframes glitchShake {
  0% { transform: perspective(600px) translate3d(0, 0, 0) skewX(0deg); }
  20% { transform: perspective(600px) translate3d(-3px, 2px, 5px) skewX(2deg); }
  40% { transform: perspective(600px) translate3d(3px, -2px, -4px) skewX(-2deg); }
  60% { transform: perspective(600px) translate3d(-2px, -1px, 8px) skewX(1deg); }
  80% { transform: perspective(600px) translate3d(2px, 3px, 2px) skewX(-1deg); }
  100% { transform: perspective(600px) translate3d(0, 0, 0) skewX(0deg); }
}

@keyframes glitchSlice {
  0% { clip-path: inset(10% 0 60% 0); transform: translate(-2px, 1px); }
  20% { clip-path: inset(40% 0 20% 0); transform: translate(3px, -2px); }
  40% { clip-path: inset(70% 0 10% 0); transform: translate(-3px, -1px); }
  60% { clip-path: inset(25% 0 50% 0); transform: translate(2px, 3px); }
  80% { clip-path: inset(5% 0 80% 0); transform: translate(-1px, -3px); }
  100% { clip-path: inset(80% 0 5% 0); transform: translate(2px, 1px); }
}

@media (max-width: 760px) {
  .glitch-hero-title {
    font-size: clamp(4.05rem, 20vw, 7rem);
    line-height: 0.76;
  }
  .line-2 {
    margin-left: 5vw;
  }
}

@media (max-width: 430px) {
  .glitch-hero-title {
    font-size: 12.8vw;
    line-height: 0.8;
  }
}
</style>
