<template>
  <section id="figma" class="section figma-section" aria-labelledby="figma-title">
    <header class="compact-heading reveal">
      <span>{{ t('figma.label') }}</span>
      <h2 id="figma-title"><KineticText :text="t('figma.title1')" /><br /><KineticText :text="t('figma.title2')" /></h2>
    </header>
    <div class="figma-list" :class="{ 'has-hover': hover !== null }" @mouseleave="hover = null">
      <a
        v-for="(project, index) in figmaProjects"
        :key="project.file"
        class="figma-row reveal"
        :data-active="hover === index"
        :href="project.file"
        download
        @mouseenter="hover = index"
        @focus="hover = index"
        @blur="hover = null"
      >
        <span>0{{ index + 1 }}</span>
        <div><small>{{ tr(project.type) }}</small><h3>{{ tr(project.title) }}</h3></div>
        <p>{{ tr(project.description) }}</p>
        <strong>{{ t('figma.download') }} <i>↗</i></strong>
        <!-- no toque (mobile) o esquema aparece dentro da linha -->
        <span class="figma-row__wire" aria-hidden="true">
          <img v-if="project.preview" class="figma-card__img" :src="project.preview" alt="" loading="lazy" />
          <FigmaWireframe v-else :kind="project.kind" />
        </span>
      </a>
    </div>

    <!-- Cartão flutuante que segue o cursor com o esquema da tela -->
    <Teleport to="body">
    <div
      ref="card"
      class="figma-card"
      :class="{ 'is-visible': hover !== null }"
      aria-hidden="true"
    >
      <div class="figma-card__bar">
        <span>{{ hover !== null ? tr(figmaProjects[hover].title) : '' }}.fig</span>
        <span>{{ hover !== null && figmaProjects[hover].preview ? t('figma.preview') : t('figma.wire') }}</span>
      </div>
      <template v-for="(project, index) in figmaProjects" :key="project.file">
        <img
          v-if="project.preview"
          v-show="hover === index"
          class="figma-card__img"
          :src="project.preview"
          alt=""
          loading="lazy"
        />
        <FigmaWireframe v-else v-show="hover === index" :kind="project.kind" :drawn="hover === index" />
      </template>
    </div>
    </Teleport>
  </section>
</template>

<script setup>
import KineticText from '../KineticText.vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import FigmaWireframe from '../FigmaWireframe.vue'
import { figmaProjects } from '../../data/content'
import { t, tr } from '../../i18n'

const hover = ref(null)
const card = ref(null)

let frame = null
let running = false
const target = { x: 0, y: 0 }
const pos = { x: 0, y: 0, tilt: 0 }

const loop = () => {
  if (!running) return
  const dx = target.x - pos.x
  pos.x += dx * 0.16
  pos.y += (target.y - pos.y) * 0.16
  pos.tilt += (Math.max(-8, Math.min(8, dx * 0.06)) - pos.tilt) * 0.12
  if (card.value) {
    card.value.style.transform = `translate3d(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px, 0) rotate(${pos.tilt.toFixed(2)}deg)`
  }
  frame = requestAnimationFrame(loop)
}

const onMove = (event) => {
  target.x = event.clientX + 28
  target.y = event.clientY - 90
  if (hover.value === null) {
    pos.x = target.x
    pos.y = target.y
  }
}

onMounted(() => {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
  window.addEventListener('mousemove', onMove, { passive: true })
  running = true
  frame = requestAnimationFrame(loop)
})
onBeforeUnmount(() => {
  running = false
  cancelAnimationFrame(frame)
  window.removeEventListener('mousemove', onMove)
})
</script>

<style scoped>
.figma-row {
  position: relative;
  transition:
    background 0.35s,
    color 0.35s,
    padding 0.35s var(--ease),
    opacity 0.35s ease;
}
.figma-list.has-hover .figma-row.is-visible[data-active='false'] {
  opacity: 0.35;
}
.figma-row__wire {
  display: none;
}

.figma-card {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 60;
  width: 300px;
  padding: 0.6rem 0.75rem 0.85rem;
  background: var(--bg);
  color: var(--text);
  clip-path: var(--chamfer);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
  pointer-events: none;
  opacity: 0;
  scale: 0.85;
  transition:
    opacity 0.25s ease,
    scale 0.35s var(--ease);
}
.figma-card.is-visible {
  opacity: 1;
  scale: 1;
}
.figma-card__img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  object-position: top center;
}
.figma-card__bar {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.6rem;
  font-family: var(--mono);
  font-size: 0.56rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.figma-card__bar span:last-child {
  color: var(--red);
}

@media (hover: none), (pointer: coarse) {
  .figma-card {
    display: none;
  }
  .figma-row__wire {
    display: block;
    grid-column: 1 / -1;
    max-width: 18rem;
    color: var(--bg);
    opacity: 0.85;
  }
}
</style>
