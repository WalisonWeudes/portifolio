<template>
  <section id="experiencia" class="section experience" aria-labelledby="experience-title">
    <header class="section-heading reveal">
      <div><span>03</span><p>{{ t('experience.label') }}</p></div>
      <h2 id="experience-title"><KineticText :text="t('experience.title1')" /><br /><em><KineticText :text="t('experience.title2')" /></em></h2>
      <p>{{ t('experience.desc') }}</p>
    </header>
    <StatsStrip />
    <ol class="experience-list">
      <li v-for="(activity, index) in activities" :key="index" class="reveal">
        <time>{{ tr(activity.year) }}</time>
        <div><h3>{{ tr(activity.title) }}</h3><span>{{ tr(activity.role) }}</span></div>
        <p>{{ tr(activity.description) }}</p>
        <i>↗</i>
      </li>
    </ol>
  </section>
</template>

<script setup>
import KineticText from '../KineticText.vue'
import StatsStrip from '../StatsStrip.vue'
import { activities } from '../../data/content'
import { t, tr } from '../../i18n'
</script>
