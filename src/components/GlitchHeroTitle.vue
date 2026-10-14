<template>
  <h1
    id="hero-title"
    class="glitch-hero-title"
    ref="titleRef"
    :class="{ 'is-glitching': isGlitching }"
    @mouseenter="triggerGlitch"
    @click="triggerGlitch"
  >
    <span class="title-line line-1">
      <span class="word">DESIGNER</span>
      <em class="ampersand">&</em>
    </span>
    <span class="title-line line-2">
      <span class="word">FRONT-END</span>
    </span>
    <span class="title-line line-3">
      <span class="word">DEVELOPER</span>
    </span>
  </h1>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const titleRef = ref(null)
const isGlitching = ref(false)

let endTimer
let glitchTimer
let frame = null
let tilt = { x: 0, y: 0 }

const triggerGlitch = () => {
  if (isGlitching.value) return
  isGlitching.value = true
  endTimer = setTimeout(() => {
    isGlitching.value = false
  }, 260)
}

// Inclinação 3D que segue o mouse — escrita direto no DOM, sem re-render.
const applyTilt = () => {
  frame = null
  const el = titleRef.value
  if (!el) return
  el.style.transform = `perspective(600px) rotateX(${(tilt.y * -6).toFixed(2)}deg) rotateY(${(tilt.x * 7).toFixed(2)}deg)`
}

const onMouseMove = (event) => {
  tilt = { x: event.clientX / window.innerWidth - 0.5, y: event.clientY / window.innerHeight - 0.5 }
  if (!frame) frame = requestAnimationFrame(applyTilt)
}

// De vez em quando (a cada ~6–10s) um glitch curto e leve.
const scheduleGlitch = () => {
  glitchTimer = setTimeout(() => {
    if (!document.hidden) triggerGlitch()
    scheduleGlitch()
  }, 6000 + Math.random() * 4000)
}

onMounted(() => {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    glitchTimer = setTimeout(() => {
      triggerGlitch()
      scheduleGlitch()
    }, 4500)
  }
  window.addEventListener('mousemove', onMouseMove, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onMouseMove)
  cancelAnimationFrame(frame)
  clearTimeout(endTimer)
  clearTimeout(glitchTimer)
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
  transition: none;
}

.glitch-hero-title.is-glitching .line-1 .word {
  animation: glitchNudge 0.26s steps(3) 1;
}
.glitch-hero-title.is-glitching .line-2 {
  animation: glitchNudge 0.26s steps(3) 0.04s 1 reverse;
}
.glitch-hero-title.is-glitching .line-3 .word {
  animation: glitchNudge 0.26s steps(3) 0.08s 1;
}

@keyframes glitchNudge {
  0%,
  100% {
    transform: translateX(0);
  }
  33% {
    transform: translateX(-3px) skewX(-1deg);
  }
  66% {
    transform: translateX(2px) skewX(0.8deg);
  }
}

.glitch-hero-title.is-glitching .word,
.glitch-hero-title.is-glitching .ampersand {
  text-shadow:
    -2px 0 rgba(230, 36, 41, 0.7),
    2px 0 rgba(49, 87, 255, 0.7);
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
