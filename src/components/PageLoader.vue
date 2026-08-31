<template>
  <Transition name="glitch-fade">
    <div v-if="isLoading" class="retro-loader" :class="{ 'is-glitching': isSystemGlitching }" role="dialog" aria-label="Carregando">
      <!-- CRT & Noise Overlay -->
      <div class="crt-overlay" aria-hidden="true"></div>

      <div class="retro-container">
        <!-- Terminal Header with Glitch Tag -->
        <div class="terminal-top">
          <span class="anomaly-tag">[ ANOMALIA DE SISTEMA DETECTADA ]</span>
          <h1 class="retro-title">CARREGANDO<span class="blinking-dots">{{ dots }}</span></h1>
        </div>

        <!-- Overall Progress Bar in ASCII -->
        <div class="retro-progress-section">
          <div class="ascii-bar">
            [{{ asciiBar }}] {{ Math.round(overallProgress) }}%
          </div>
        </div>

        <!-- Terminal Output Lines with Glitch Corruption -->
        <div class="retro-logs">
          <div
            v-for="(item, index) in items"
            :key="item.name"
            class="log-line"
            :class="{
              'is-active': index === currentItemIndex,
              'is-done': item.progress === 100,
              'is-glitched': item.isCorrupted
            }"
          >
            <span class="log-prefix">{{ item.progress === 100 ? '[ OK ]' : '[...]' }}</span>
            <span class="log-name">{{ item.isCorrupted ? glitchText(item.name) : item.name }}</span>
            <span class="log-dots"></span>
            <span class="log-percent">{{ item.progress }}%</span>
          </div>
        </div>

        <!-- Completion Prompt -->
        <div v-if="isComplete" class="retro-footer">
          <p class="blink-text">> INICIALIZAÇÃO CONCLUÍDA. ENTRANDO...</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

const isLoading = ref(true)
const isComplete = ref(false)
const overallProgress = ref(0)
const dots = ref('...')
const currentItemIndex = ref(0)
const isSystemGlitching = ref(false)

const emit = defineEmits(['loaded'])

const items = ref([
  { name: 'PROJETO DISLEXIA (TCC UFPI)', progress: 0, isCorrupted: false },
  { name: 'PREMAUT — UFPI', progress: 0, isCorrupted: false },
  { name: 'TB-KOCH (WEB E MOBILE)', progress: 0, isCorrupted: false },
  { name: 'ARQUIVOS FIGMA (BARBEARIA, FINANCEIRO)', progress: 0, isCorrupted: false },
  { name: 'SOBRE E UFPI PICOS', progress: 0, isCorrupted: false },
  { name: 'HABILIDADES E TECNOLOGIAS', progress: 0, isCorrupted: false },
  { name: 'ILUSTRAÇÕES E DESIGN DE PERSONAGENS', progress: 0, isCorrupted: false },
  { name: 'MOTOR DE ARANHAS E TEIAS', progress: 0, isCorrupted: false },
])

const asciiBar = computed(() => {
  const totalLength = 22
  const filledLength = Math.round((overallProgress.value / 100) * totalLength)
  return '█'.repeat(filledLength) + '-'.repeat(totalLength - filledLength)
})

const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'

const glitchText = (originalText) => {
  return originalText
    .split('')
    .map((char) => (Math.random() < 0.3 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : char))
    .join('')
}

const triggerSystemGlitch = () => {
  isSystemGlitching.value = true
  setTimeout(() => {
    isSystemGlitching.value = false
  }, 220)
}

const dismiss = () => {
  isLoading.value = false
  emit('loaded')
}

onMounted(() => {
  // Dots animation
  let dotCount = 0
  const dotInterval = setInterval(() => {
    dotCount = (dotCount + 1) % 4
    dots.value = '.'.repeat(dotCount)
  }, 250)

  // Periodic random glitch bursts during boot
  const glitchBurstInterval = setInterval(() => {
    if (Math.random() > 0.4) {
      triggerSystemGlitch()
    }
  }, 450)

  const totalItems = items.value.length
  let itemIdx = 0
  let itemProgress = 0

  const progressInterval = setInterval(() => {
    if (itemIdx < totalItems) {
      itemProgress += 10
      if (itemProgress > 100) itemProgress = 100

      items.value[itemIdx].progress = itemProgress
      currentItemIndex.value = itemIdx

      // Randomly corrupt active line text during load
      if (Math.random() < 0.25) {
        items.value[itemIdx].isCorrupted = true
        setTimeout(() => {
          if (items.value[itemIdx]) items.value[itemIdx].isCorrupted = false
        }, 120)
      }

      const completedCount = itemIdx + (itemProgress / 100)
      overallProgress.value = Math.min(100, Math.round((completedCount / totalItems) * 100))

      if (itemProgress >= 100) {
        items.value[itemIdx].isCorrupted = false
        itemIdx += 1
        itemProgress = 0
      }
    } else {
      overallProgress.value = 100
      isComplete.value = true
      clearInterval(progressInterval)
      clearInterval(dotInterval)
      clearInterval(glitchBurstInterval)

      setTimeout(() => {
        dismiss()
      }, 550)
    }
  }, 55)
})
</script>

<style scoped>
.retro-loader {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #000000;
  color: #e62429;
  font-family: 'Courier New', Courier, 'Lucida Console', Monaco, monospace;
  padding: 1.5rem;
  user-select: none;
  overflow: hidden;
}

.crt-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
  background-size: 100% 3px, 6px 100%;
  opacity: 0.85;
}

.retro-container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 620px;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.terminal-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}

.anomaly-tag {
  font-size: 0.68rem;
  letter-spacing: 0.2em;
  color: #ff3338;
  text-shadow: 0 0 8px rgba(255, 51, 56, 0.8);
  animation: blinkFast 0.6s infinite alternate;
}

.retro-title {
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.1em;
  color: #e62429;
  text-shadow: 0 0 10px rgba(230, 36, 41, 0.7);
  text-align: center;
}

.blinking-dots {
  display: inline-block;
  min-width: 2em;
}

.retro-progress-section {
  border: 1px solid #e62429;
  padding: 0.75rem 1rem;
  background: rgba(230, 36, 41, 0.05);
  box-shadow: 0 0 12px rgba(230, 36, 41, 0.2);
}

.ascii-bar {
  font-size: clamp(0.85rem, 2vw, 1.05rem);
  letter-spacing: 0.05em;
  color: #e62429;
  text-shadow: 0 0 6px rgba(230, 36, 41, 0.5);
}

.retro-logs {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  font-size: clamp(0.72rem, 1.7vw, 0.9rem);
}

.log-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.35;
  transition: opacity 0.15s ease;
}

.log-line.is-active {
  opacity: 1;
  color: #ffffff;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.9);
}

.log-line.is-done {
  opacity: 0.95;
  color: #e62429;
}

.log-line.is-glitched {
  color: #3157ff;
  text-shadow: -2px 0 #e62429, 2px 0 #3157ff;
}

.log-prefix {
  font-weight: 700;
}

.log-name {
  white-space: nowrap;
}

.log-dots {
  flex: 1;
  border-bottom: 1px dotted rgba(230, 36, 41, 0.35);
  margin: 0 0.2rem;
  height: 1em;
}

.log-percent {
  font-weight: 700;
  min-width: 3.5em;
  text-align: right;
}

.retro-footer {
  margin-top: 0.4rem;
  text-align: center;
}

.blink-text {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
  animation: blink 0.8s infinite alternate;
}

/* System Glitch Jitter */
.retro-loader.is-glitching {
  animation: screenGlitch 0.2s infinite ease-in-out;
  filter: contrast(1.4) brightness(1.2);
}

@keyframes screenGlitch {
  0% { transform: translate(0, 0) skewX(0deg); }
  25% { transform: translate(-3px, 2px) skewX(1deg); }
  50% { transform: translate(3px, -2px) skewX(-1deg); }
  75% { transform: translate(-1px, 1px) skewX(0.5deg); }
  100% { transform: translate(0, 0) skewX(0deg); }
}

@keyframes blinkFast {
  from { opacity: 1; }
  to { opacity: 0.3; }
}

@keyframes blink {
  from { opacity: 1; }
  to { opacity: 0.25; }
}

.glitch-fade-enter-active,
.glitch-fade-leave-active {
  transition: opacity 0.45s ease, filter 0.45s ease;
}

.glitch-fade-leave-to {
  opacity: 0;
  filter: contrast(2) brightness(2) blur(8px);
}
</style>
