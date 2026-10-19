<template>
  <section id="habilidades" class="section stack" aria-labelledby="stack-title">
    <header class="compact-heading reveal">
      <span>{{ t('stack.label') }}</span>
      <h2 id="stack-title"><KineticText :text="t('stack.title1')" /><br /><KineticText :text="t('stack.title2')" /></h2>
    </header>
    <div class="stack__groups">
      <div v-for="group in skillGroups" :key="group.number" class="stack__group reveal">
        <span>{{ group.number }}</span>
        <h3>{{ tr(group.title) }}</h3>
        <ul><li v-for="(item, i) in group.items" :key="i">{{ tr(item) }}</li></ul>
      </div>
    </div>
  </section>
</template>

<script setup>
import KineticText from '../KineticText.vue'
import { skillGroups } from '../../data/content'
import { t, tr } from '../../i18n'
</script>
