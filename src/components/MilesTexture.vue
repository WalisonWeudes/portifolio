<template>
  <div
    class="miles-texture"
    :class="{ 'is-animated': animated }"
    :style="{
      '--texture-size': `${textureSize}px`,
      '--animation-speed': `${animationSpeed}s`,
    }"
  >
    <div class="texture-details" aria-hidden="true"></div>
    <div class="texture-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  animated: {
    type: Boolean,
    default: true,
  },
  textureSize: {
    type: Number,
    default: 64,
  },
  animationSpeed: {
    type: Number,
    default: 18,
  },
})
</script>

<style scoped>
.miles-texture {
  --black: #020309;
  --dark-blue: #080d1d;
  --navy: #101a3d;

  position: relative;
  isolation: isolate;
  overflow: hidden;
  min-height: 100vh;
  color: #e5e9f7;
  background:
    radial-gradient(circle at 20% 10%, rgba(41, 66, 151, 0.25), transparent 35%),
    radial-gradient(circle at 80% 90%, rgba(16, 32, 84, 0.3), transparent 40%),
    var(--black);
}

.miles-texture::before,
.miles-texture::after {
  content: '';
  position: absolute;
  inset: -10%;
  background-size: var(--texture-size) var(--texture-size);
  filter: blur(7px);
  transform: scale(1.025);
}

.miles-texture::before {
  z-index: -3;
  background: repeating-linear-gradient(
    90deg,
    var(--navy) 0%,
    #14204b 34%,
    var(--black) 36%,
    var(--black) 48%,
    #091027 50%,
    var(--navy) 84%,
    var(--black) 86%,
    var(--black) 100%
  );
  background-size: var(--texture-size) var(--texture-size);
  mask-image: conic-gradient(
    from 90deg,
    #000 0deg 90deg,
    transparent 90deg 180deg,
    #000 180deg 270deg,
    transparent 270deg 360deg
  );
  mask-size: var(--texture-size) var(--texture-size);
  opacity: 0.42;
}

.miles-texture::after {
  z-index: -2;
  background: repeating-linear-gradient(
    0deg,
    #070b18 0%,
    var(--dark-blue) 32%,
    var(--black) 36%,
    var(--black) 48%,
    #101a3d 50%,
    #18265a 82%,
    var(--black) 86%,
    var(--black) 100%
  );
  background-size: var(--texture-size) var(--texture-size);
  mask-image: conic-gradient(
    from 90deg,
    transparent 0deg 90deg,
    #000 90deg 180deg,
    transparent 180deg 270deg,
    #000 270deg 360deg
  );
  mask-size: var(--texture-size) var(--texture-size);
  opacity: 0.38;
}

.texture-details {
  position: absolute;
  inset: -60px;
  z-index: -1;
  pointer-events: none;
  background-image:
    radial-gradient(circle, rgba(80, 107, 215, 0.45) 0 1px, transparent 1.6px),
    repeating-linear-gradient(
      155deg,
      transparent 0 9px,
      rgba(79, 103, 190, 0.08) 10px 11px,
      transparent 12px 20px
    ),
    linear-gradient(115deg, transparent 20%, rgba(76, 102, 205, 0.08) 45%, transparent 70%);
  background-size: 7px 7px, 24px 24px, 100% 100%;
  mix-blend-mode: screen;
  opacity: 0.26;
  filter: blur(1.2px);
  will-change: transform, opacity;
}

.texture-content {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  background:
    radial-gradient(circle at 50% 18%, rgba(2, 3, 9, 0.26), rgba(2, 3, 9, 0.4) 58%, rgba(2, 3, 9, 0.66)),
    rgba(2, 3, 9, 0.34);
  box-shadow: inset 0 0 200px rgba(0, 0, 0, 0.56);
}

.is-animated .texture-details {
  animation:
    moveTexture var(--animation-speed) linear infinite,
    pulseTexture 6s ease-in-out infinite alternate;
}

@keyframes moveTexture {
  from {
    transform: translate3d(0, 0, 0);
  }

  to {
    transform: translate3d(35px, 21px, 0);
  }
}

@keyframes pulseTexture {
  from {
    opacity: 0.2;
  }

  to {
    opacity: 0.32;
  }
}

@media (prefers-reduced-motion: reduce) {
  .is-animated .texture-details {
    animation: none;
  }
}

@media (max-width: 940px) {
  .is-animated .texture-details {
    animation: none;
  }
}
</style>
