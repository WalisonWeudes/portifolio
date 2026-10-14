<template>
  <section id="projetos" class="section work" aria-labelledby="projects-title">
    <header class="section-heading reveal">
      <div><span>01</span><p>{{ t('projects.label') }}</p></div>
      <h2 id="projects-title">{{ t('projects.title1') }}<br /><em>{{ t('projects.title2') }}</em></h2>
      <p>{{ t('projects.desc') }}</p>
    </header>
    <div class="cases">
      <article
        v-for="(project, index) in projects"
        :key="project.url"
        class="case reveal"
        :class="[`case--${index + 1}`, { 'case--reverse': index === 1 }]"
      >
        <div class="case__visual" :class="`case__visual--${index + 1}`">
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
          <span class="case__index">0{{ index + 1 }}</span>
        </div>
        <div class="case__info">
          <div class="case__meta">
            <span>{{ tr(project.category) }}</span><span>{{ project.year }}</span>
          </div>
          <h3>{{ tr(project.title) }}</h3>
          <p>{{ tr(project.description) }}</p>
          <ul><li v-for="(tag, i) in project.tags" :key="i">{{ tr(tag) }}</li></ul>
          <span class="case__status">{{ tr(project.status) }}</span>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { projects } from '../../data/content'
import { t, tr } from '../../i18n'
</script>
