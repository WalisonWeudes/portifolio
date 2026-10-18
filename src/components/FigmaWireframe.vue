<template>
  <!-- Esquema (wireframe) desenhado em linhas: não é a tela real, é o "blueprint" do tipo de projeto. -->
  <svg class="wire" :class="{ 'is-drawn': drawn }" viewBox="0 0 320 200" aria-hidden="true">
    <rect class="wire__frame" x="1" y="1" width="318" height="198" rx="6" pathLength="1" />
    <line class="wire__l" x1="1" y1="22" x2="319" y2="22" pathLength="1" />
    <circle class="wire__dot" cx="12" cy="11.5" r="3" />
    <circle class="wire__dot" cx="22" cy="11.5" r="3" />
    <circle class="wire__dot" cx="32" cy="11.5" r="3" />

    <g v-if="kind === 'booking'">
      <rect class="wire__l" x="16" y="36" width="140" height="62" pathLength="1" />
      <line class="wire__l" x1="16" y1="112" x2="130" y2="112" pathLength="1" />
      <line class="wire__l" x1="16" y1="124" x2="100" y2="124" pathLength="1" />
      <rect class="wire__fill" x="16" y="140" width="70" height="18" />
      <g v-for="(d, i) in 15" :key="i">
        <rect class="wire__l" :x="176 + (i % 5) * 26" :y="40 + Math.floor(i / 5) * 26" width="20" height="20" pathLength="1" />
      </g>
      <rect class="wire__fill" x="202" y="66" width="20" height="20" />
      <rect class="wire__l" x="176" y="128" width="128" height="16" pathLength="1" />
      <rect class="wire__l" x="176" y="150" width="128" height="16" pathLength="1" />
    </g>

    <g v-else-if="kind === 'dashboard'">
      <line class="wire__l" x1="62" y1="22" x2="62" y2="199" pathLength="1" />
      <line v-for="i in 5" :key="i" class="wire__l" x1="14" :y1="30 + i * 16" x2="50" :y2="30 + i * 16" pathLength="1" />
      <rect v-for="i in 3" :key="`k${i}`" class="wire__l" :x="74 + (i - 1) * 80" y="34" width="70" height="36" pathLength="1" />
      <polyline class="wire__l wire__accent" points="76,160 110,132 140,146 176,104 210,118 246,86 300,96" pathLength="1" />
      <line class="wire__l" x1="74" y1="180" x2="306" y2="180" pathLength="1" />
      <rect v-for="i in 6" :key="`b${i}`" class="wire__fill" :x="80 + (i - 1) * 38" :y="180 - [12, 20, 9, 26, 16, 22][i - 1]" width="14" :height="[12, 20, 9, 26, 16, 22][i - 1]" />
    </g>

    <g v-else-if="kind === 'event'">
      <rect class="wire__fill wire__soft" x="16" y="34" width="288" height="70" />
      <line class="wire__l" x1="30" y1="56" x2="190" y2="56" pathLength="1" />
      <line class="wire__l" x1="30" y1="72" x2="150" y2="72" pathLength="1" />
      <rect class="wire__fill" x="30" y="84" width="60" height="12" />
      <rect v-for="i in 3" :key="i" class="wire__l" :x="16 + (i - 1) * 98" y="116" width="88" height="70" pathLength="1" />
      <circle v-for="i in 3" :key="`c${i}`" class="wire__l" :cx="60 + (i - 1) * 98" cy="142" r="12" pathLength="1" />
    </g>

    <g v-else>
      <rect class="wire__l" x="16" y="34" width="288" height="20" pathLength="1" />
      <line v-for="i in 6" :key="i" class="wire__l" x1="16" :y1="66 + i * 18" x2="304" :y2="66 + i * 18" pathLength="1" />
      <line v-for="i in 3" :key="`v${i}`" class="wire__l" :x1="16 + i * 72" y1="66" :x2="16 + i * 72" y2="174" pathLength="1" />
      <rect class="wire__fill" x="236" y="182" width="68" height="10" />
    </g>
  </svg>
</template>

<script setup>
defineProps({
  kind: { type: String, default: 'system' }, // booking | dashboard | event | system
  drawn: { type: Boolean, default: true },
})
</script>

<style scoped>
.wire {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}
.wire__frame,
.wire__l {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.2;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  vector-effect: non-scaling-stroke;
  transition: stroke-dashoffset 1.1s cubic-bezier(0.65, 0, 0.35, 1);
}
.wire__accent {
  stroke: var(--red);
  stroke-width: 2;
}
.wire__fill {
  fill: var(--red);
  opacity: 0;
  transition: opacity 0.4s ease 0.7s;
}
.wire__soft {
  fill: currentColor;
}
.wire__dot {
  fill: currentColor;
  opacity: 0.5;
}
.is-drawn .wire__frame,
.is-drawn .wire__l {
  stroke-dashoffset: 0;
}
.is-drawn .wire__fill {
  opacity: 1;
}
.is-drawn .wire__soft {
  opacity: 0.12;
}
@media (prefers-reduced-motion: reduce) {
  .wire__frame,
  .wire__l,
  .wire__fill {
    transition: none;
  }
}
</style>
