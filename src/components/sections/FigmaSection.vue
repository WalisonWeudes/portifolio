<template>
  <section id="figma" class="section figma-section" aria-labelledby="figma-title">
    <header class="compact-heading reveal">
      <span>{{ t('figma.label') }}</span>
      <h2 id="figma-title">{{ t('figma.title1') }}<br />{{ t('figma.title2') }}</h2>
    </header>
    <div class="figma-list">
      <a
        v-for="(project, index) in figmaProjects"
        :key="project.file"
        class="figma-row reveal"
        :href="project.file"
        download
      >
        <span>0{{ index + 1 }}</span>
        <div><small>{{ tr(project.type) }}</small><h3>{{ tr(project.title) }}</h3></div>
        <p>{{ tr(project.description) }}</p>
        <strong>{{ t('figma.download') }} <i>↗</i></strong>
      </a>
    </div>
  </section>
</template>

<script setup>
import { figmaProjects } from '../../data/content'
import { t, tr } from '../../i18n'
</script>
