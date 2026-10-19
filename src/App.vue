<template>
  <PageLoader />
  <main class="site-shell">
    <SpiderWalker />
    <SiteHeader />
    <HeroSection />
    <ProjectsSection />
    <FigmaSection />
    <AboutSection />
    <ExperienceSection />
    <StackSection />
    <IllustrationsSection />
    <ContactSection />
  </main>
</template>

<script setup>
import PageLoader from './components/PageLoader.vue'
import SpiderWalker from './components/SpiderWalker.vue'
import SiteHeader from './components/SiteHeader.vue'
import HeroSection from './components/sections/HeroSection.vue'
import ProjectsSection from './components/sections/ProjectsSection.vue'
import FigmaSection from './components/sections/FigmaSection.vue'
import AboutSection from './components/sections/AboutSection.vue'
import ExperienceSection from './components/sections/ExperienceSection.vue'
import StackSection from './components/sections/StackSection.vue'
import IllustrationsSection from './components/sections/IllustrationsSection.vue'
import ContactSection from './components/sections/ContactSection.vue'
import { useReveal } from './composables/useReveal'
import { useTitleGlitch } from './composables/useTitleGlitch'
import { usePointerEffects } from './composables/usePointerEffects'
import { useDecode } from './composables/useDecode'
import { useScrollVelocity } from './composables/useScrollVelocity'

useReveal()
useTitleGlitch()
usePointerEffects()
useDecode()
useScrollVelocity()
</script>
