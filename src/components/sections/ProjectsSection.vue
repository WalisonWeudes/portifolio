<template>
  <section id="projetos" class="section work" aria-labelledby="projects-title">
    <header class="section-heading reveal">
      <div><span>01</span><p>{{ t('projects.label') }}</p></div>
      <h2 id="projects-title"><KineticText :text="t('projects.title1')" /><br /><em><KineticText :text="t('projects.title2')" /></em></h2>
      <p>{{ t('projects.desc') }}</p>
    </header>

    <!-- Cartões empilhados: cada projeto fica preso no topo e o próximo desliza por cima. -->
    <div ref="stack" class="shots">
      <article
        v-for="(project, index) in projects"
        :key="project.url"
        class="shot"
        :style="{ '--k': index }"
      >
        <div class="shot__inner">
          <div class="shot__head">
            <span class="shot__count">{{ String(index + 1).padStart(2, '0') }} / {{ String(projects.length).padStart(2, '0') }}</span>
            <span class="shot__line" aria-hidden="true"></span>
            <span>{{ tr(project.category) }}</span>
          </div>

          <div class="case__visual shot__media" :class="`case__visual--${index + 1}`">
            <a
              class="case__preview"
              :href="project.url"
              target="_blank"
              rel="noreferrer"
              :aria-label="`${t('projects.openAria')} ${tr(project.title)}`"
            >
              <img
                :src="project.preview"
                :alt="`${t('projects.previewAlt')} ${tr(project.title)}`"
                loading="lazy"
                decoding="async"
              />
              <span class="case__open">{{ t('projects.open') }} <i>↗</i></span>
            </a>
          </div>

          <div class="case__info shot__info">
            <span class="shot__index" aria-hidden="true">0{{ index + 1 }}</span>
            <div class="case__meta"><span>{{ tr(project.status) }}</span><span>{{ project.year }}</span></div>
            <h3>{{ tr(project.title) }}</h3>
            <p>{{ tr(project.description) }}</p>
            <ul><li v-for="(tag, i) in project.tags" :key="i">{{ tr(tag) }}</li></ul>
            <a class="text-link" :href="project.url" target="_blank" rel="noreferrer">
              {{ t('projects.open') }} <span>↗</span>
            </a>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import KineticText from '../KineticText.vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { projects } from '../../data/content'
import { t, tr } from '../../i18n'
import { useScrollFrame } from '../../composables/useScrollProgress'

const stack = ref(null)
let observer

// Quando o próximo cartão sobe, o atual recua (escala + escurece).
useScrollFrame(() => {
  const el = stack.value
  if (!el || window.innerWidth <= 900) return
  const shots = el.querySelectorAll('.shot')
  const vh = window.innerHeight
  shots.forEach((shot, i) => {
    const next = shots[i + 1]
    let cover = 0
    if (next) cover = Math.min(1, Math.max(0, 1 - next.getBoundingClientRect().top / vh))
    shot.style.setProperty('--cover', cover.toFixed(4))
  })
})

// Revelação da imagem (corte em triângulo) ao entrar na tela.
onMounted(() => {
  const shots = stack.value.querySelectorAll('.shot')
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    shots.forEach((s) => s.classList.add('is-in'))
    return
  }
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-in')
        observer.unobserve(entry.target)
      }
    },
    { threshold: 0.25 },
  )
  shots.forEach((s) => observer.observe(s))
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<style scoped>
.shots {
  position: relative;
}

.shot {
  --cover: 0;
  position: sticky;
  top: 0;
  height: 100vh;
  height: 100svh;
  padding: 5.5rem 0 2rem;
  background: var(--bg);
}

.shot__inner {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(18rem, 0.75fr);
  grid-template-rows: auto 1fr;
  gap: 1.5rem clamp(2rem, 4vw, 5rem);
  height: 100%;
  padding-top: 1.25rem;
  border-top: 1px solid var(--line-strong);
  transform: scale(calc(1 - var(--cover) * 0.08));
  transform-origin: 50% 0;
  filter: brightness(calc(1 - var(--cover) * 0.6));
  will-change: transform;
}

.shot__head {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 0.66rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.shot__count {
  color: var(--text);
}
.shot__line {
  flex: 1;
  height: 1px;
  background: var(--line);
}

/* mídia: imagem grande revelada por um triângulo que cresce do canto */
.shot__media {
  aspect-ratio: auto;
  min-height: 0;
  height: 100%;
  clip-path: polygon(0 0, 0 0, 0 0);
  transition: clip-path 1.2s cubic-bezier(0.7, 0, 0.2, 1);
}
.shot.is-in .shot__media {
  clip-path: polygon(0 0, 200% 0, 0 200%);
}
.shot__media img {
  transform: scale(1.12);
  transition:
    transform 1.6s cubic-bezier(0.16, 1, 0.3, 1),
    filter 0.7s ease;
}
.shot.is-in .shot__media img {
  transform: scale(1);
}

.shot__info {
  position: relative;
  align-self: end;
  padding-bottom: 1rem;
}
.shot__info > * {
  opacity: 0;
  transform: translateY(1.5rem);
  transition:
    opacity 0.8s ease,
    transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}
.shot.is-in .shot__info > * {
  opacity: 1;
  transform: none;
}
.shot.is-in .shot__info > :nth-child(2) { transition-delay: 0.35s; }
.shot.is-in .shot__info > :nth-child(3) { transition-delay: 0.45s; }
.shot.is-in .shot__info > :nth-child(4) { transition-delay: 0.55s; }
.shot.is-in .shot__info > :nth-child(5) { transition-delay: 0.65s; }
.shot.is-in .shot__info > :nth-child(6) { transition-delay: 0.75s; }

.shot__index {
  position: absolute;
  top: -0.35em;
  right: 0;
  color: transparent;
  -webkit-text-stroke: 1px rgba(245, 245, 242, 0.25);
  font-family: var(--display);
  font-size: clamp(6rem, 12vw, 13rem);
  line-height: 1;
  pointer-events: none;
}
.shot.is-in .shot__info > .shot__index {
  opacity: 1;
}
.shot__info h3 {
  position: relative;
}
.shot__info .text-link {
  margin-top: 0.5rem;
}

/* Mobile/tablet: sem empilhamento, só a revelação */
@media (max-width: 900px) {
  .shot {
    position: relative;
    height: auto;
    padding: 2rem 0 4rem;
  }
  .shot__inner {
    display: flex;
    flex-direction: column;
    transform: none;
    filter: none;
  }
  .shot__media {
    height: auto;
    aspect-ratio: 1.25;
  }
  .shot__index {
    font-size: 5.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .shot__media,
  .shot__media img,
  .shot__info > * {
    transition: none;
  }
}
</style>
