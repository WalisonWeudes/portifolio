<template>
  <section id="ilustracoes" class="section illustrations" aria-labelledby="illustrations-title">
    <header class="illustrations__header reveal">
      <div>
        <span>{{ t('illustrations.label') }}</span>
        <h2 id="illustrations-title"><KineticText :text="t('illustrations.title1')" /><br /><KineticText :text="t('illustrations.title2')" /></h2>
      </div>
      <p>{{ t('illustrations.desc') }}</p>
    </header>
    <div class="illustration-grid">
      <button
        v-for="illustration in illustrations"
        :key="illustration.image"
        type="button"
        class="illustration-item"
        @click="open(illustration)"
      >
        <img
          :src="illustration.thumbnail"
          :alt="tr(illustration.alt)"
          loading="lazy"
          decoding="async"
          @error="$event.currentTarget.src = illustration.image"
        />
        <span>{{ tr(illustration.title) }} <i>↗</i></span>
      </button>
    </div>
  </section>

  <Teleport to="body">
    <div
      v-if="selected"
      class="lightbox"
      role="dialog"
      aria-modal="true"
      :aria-label="tr(selected.title)"
      @click.self="close"
    >
      <p class="lightbox__count">
        {{ String(index + 1).padStart(2, '0') }} / {{ String(illustrations.length).padStart(2, '0') }}
      </p>
      <button ref="closeButton" type="button" :aria-label="t('lightbox.closeAria')" @click="close">
        {{ t('lightbox.close') }}
      </button>
      <button class="lightbox__nav lightbox__nav--prev" type="button" :aria-label="t('lightbox.prev')" @click="step(-1)">←</button>
      <button class="lightbox__nav lightbox__nav--next" type="button" :aria-label="t('lightbox.next')" @click="step(1)">→</button>
      <img :key="selected.image" :src="selected.image" :alt="tr(selected.alt)" />
      <p>{{ tr(selected.title) }}</p>
    </div>
  </Teleport>
</template>

<script setup>
import KineticText from '../KineticText.vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { illustrations } from '../../data/content'
import { t, tr } from '../../i18n'

const selected = shallowRef(null)
const index = computed(() => illustrations.indexOf(selected.value))
const closeButton = ref(null)
let opener = null

const open = async (illustration) => {
  opener = document.activeElement
  selected.value = illustration
  await nextTick()
  closeButton.value?.focus()
}
const close = () => {
  selected.value = null
  opener?.focus?.()
}
const step = (direction) => {
  const total = illustrations.length
  selected.value = illustrations[(index.value + direction + total) % total]
}
const onKeydown = (event) => {
  if (!selected.value) return
  if (event.key === 'Escape') close()
  else if (event.key === 'ArrowRight') step(1)
  else if (event.key === 'ArrowLeft') step(-1)
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>
