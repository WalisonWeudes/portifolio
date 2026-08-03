<template>
  <div class="spider-layer" aria-hidden="true">
    <canvas ref="canvasRef" class="spider-webs"></canvas>
    <img ref="spiderRef" class="spider" src="/imagens/aranha-frames/frame-00.png" alt="" />
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const canvasRef = ref(null)
const spiderRef = ref(null)
const spiderFrames = Array.from(
  { length: 60 },
  (_, index) => `/imagens/aranha-frames/frame-${String(index).padStart(2, '0')}.png`,
)

const completedWebs = []
let animationFrame
let resizeTimer
let context
let pixelRatio = 1
let viewport = { width: 0, height: 0 }
let startPoint
let endPoint
let journeyStartedAt = 0
let pauseUntil = 0
let reducedMotionQuery
let boundaryObserver
let visibilityObserver
let lastRenderAt = 0
let currentFrameIndex = 0
let isIntersecting = true
let isDocumentVisible = true
let suspendedAt = 0

const journeyDuration = 14000
const edgePadding = 18

const edgePoint = (edge) => {
  const { width, height } = viewport
  const horizontalInset = Math.max(70, width * 0.12)
  const verticalInset = Math.max(70, height * 0.12)

  if (edge === 0) return { x: horizontalInset + Math.random() * (width - horizontalInset * 2), y: edgePadding, edge }
  if (edge === 1) return { x: width - edgePadding, y: verticalInset + Math.random() * (height - verticalInset * 2), edge }
  if (edge === 2) return { x: horizontalInset + Math.random() * (width - horizontalInset * 2), y: height - edgePadding, edge }
  return { x: edgePadding, y: verticalInset + Math.random() * (height - verticalInset * 2), edge }
}

const oppositeEdge = (edge) => (edge + 2) % 4

const beginJourney = (from, timestamp) => {
  startPoint = from || edgePoint(Math.floor(Math.random() * 4))
  endPoint = edgePoint(oppositeEdge(startPoint.edge))
  journeyStartedAt = timestamp
}

const resizeCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const boundary = canvas.parentElement?.getBoundingClientRect()
  viewport = {
    width: boundary?.width || window.innerWidth,
    height: boundary?.height || window.innerHeight,
  }
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.round(viewport.width * pixelRatio)
  canvas.height = Math.round(viewport.height * pixelRatio)
  canvas.style.width = `${viewport.width}px`
  canvas.style.height = `${viewport.height}px`
  context = canvas.getContext('2d')
  startPoint = null
}

const curveControl = (from, to, movement = 0) => {
  const distance = Math.hypot(to.x - from.x, to.y - from.y)
  return {
    x: (from.x + to.x) / 2 + movement,
    y: (from.y + to.y) / 2 + Math.min(92, distance * 0.12),
  }
}

const curvePoint = (from, control, to, progress) => {
  const inverse = 1 - progress
  return {
    x: inverse * inverse * from.x + 2 * inverse * progress * control.x + progress * progress * to.x,
    y: inverse * inverse * from.y + 2 * inverse * progress * control.y + progress * progress * to.y,
  }
}

const curveTangent = (from, control, to, progress) => ({
  x: 2 * (1 - progress) * (control.x - from.x) + 2 * progress * (to.x - control.x),
  y: 2 * (1 - progress) * (control.y - from.y) + 2 * progress * (to.y - control.y),
})

const drawThread = (from, to, alpha = 1, movement = 0, width = 1.15) => {
  const control = curveControl(from, to, movement)
  context.strokeStyle = `rgba(155, 166, 194, ${0.34 * alpha})`
  context.lineWidth = width
  context.beginPath()
  context.moveTo(from.x, from.y)
  context.quadraticCurveTo(control.x, control.y, to.x, to.y)
  context.stroke()
}

const drawFineThread = (from, to, alpha = 1) => {
  context.strokeStyle = `rgba(219, 225, 244, ${0.2 * alpha})`
  context.lineWidth = 0.7
  context.beginPath()
  context.moveTo(from.x, from.y)
  context.lineTo(to.x, to.y)
  context.stroke()
}

const drawFinishedWeb = (web, now) => {
  const age = now - web.finishedAt
  const alpha = Math.max(0, 1 - age / 26000)
  if (!alpha) return false

  const control = curveControl(web.start, web.end)
  drawThread(web.start, web.end, alpha, 0, 1.2)
  drawThread(web.start, web.end, alpha * 0.28, 5, 0.55)
  drawThread(web.start, web.end, alpha * 0.2, -4, 0.5)

  const length = Math.hypot(web.end.x - web.start.x, web.end.y - web.start.y) || 1
  let previousLeft
  let previousRight

  for (let step = 1; step < 9; step += 1) {
    const progress = step / 9
    const center = curvePoint(web.start, control, web.end, progress)
    const tangent = curveTangent(web.start, control, web.end, progress)
    const tangentLength = Math.hypot(tangent.x, tangent.y) || 1
    const normal = { x: -tangent.y / tangentLength, y: tangent.x / tangentLength }
    const radius = Math.sin(Math.PI * progress) * Math.min(50, length * 0.065)
    const left = { x: center.x + normal.x * radius, y: center.y + normal.y * radius }
    const right = { x: center.x - normal.x * radius, y: center.y - normal.y * radius }

    drawFineThread(left, right, alpha * 0.9)
    if (previousLeft && previousRight) {
      drawFineThread(previousLeft, left, alpha * 0.58)
      drawFineThread(previousRight, right, alpha * 0.58)
    }
    previousLeft = left
    previousRight = right
  }

  return true
}

const animate = (timestamp) => {
  if (!context || reducedMotionQuery?.matches) return
  if (timestamp - lastRenderAt < 32) {
    animationFrame = requestAnimationFrame(animate)
    return
  }
  lastRenderAt = timestamp
  if (!startPoint) beginJourney(null, timestamp)

  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
  context.clearRect(0, 0, viewport.width, viewport.height)

  for (let index = completedWebs.length - 1; index >= 0; index -= 1) {
    if (!drawFinishedWeb(completedWebs[index], timestamp)) completedWebs.splice(index, 1)
  }

  if (timestamp >= pauseUntil) {
    const nextFrameIndex = Math.floor((timestamp - pauseUntil) / 140) % spiderFrames.length
    if (nextFrameIndex !== currentFrameIndex) {
      currentFrameIndex = nextFrameIndex
      spiderRef.value.src = spiderFrames[currentFrameIndex]
    }
    const elapsed = timestamp - journeyStartedAt
    const progress = Math.min(1, elapsed / journeyDuration)
    const eased = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2
    const fullControl = curveControl(startPoint, endPoint)
    const current = curvePoint(startPoint, fullControl, endPoint, eased)
    const tangent = curveTangent(startPoint, fullControl, endPoint, eased)
    const movement = Math.sin(timestamp / 420) * Math.sin(Math.PI * eased) * 7

    drawThread(startPoint, current, 1, movement)

    const angle = Math.atan2(tangent.y, tangent.x) * (180 / Math.PI) + 90
    spiderRef.value.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%) rotate(${angle}deg)`

    if (progress === 1) {
      completedWebs.push({ start: startPoint, end: endPoint, finishedAt: timestamp })
      if (completedWebs.length > 5) completedWebs.shift()
      const nextStart = { ...endPoint }
      pauseUntil = timestamp + 900
      beginJourney(nextStart, pauseUntil)
    }
  }

  animationFrame = requestAnimationFrame(animate)
}

const updateAnimationState = () => {
  const shouldAnimate = isIntersecting && isDocumentVisible && !reducedMotionQuery?.matches

  if (!shouldAnimate) {
    if (!suspendedAt) suspendedAt = performance.now()
    cancelAnimationFrame(animationFrame)
    animationFrame = null
    return
  }

  if (suspendedAt) {
    const pausedFor = performance.now() - suspendedAt
    journeyStartedAt += pausedFor
    pauseUntil += pausedFor
    completedWebs.forEach((web) => { web.finishedAt += pausedFor })
    suspendedAt = 0
  }

  if (!animationFrame) animationFrame = requestAnimationFrame(animate)
}

const handleVisibilityChange = () => {
  isDocumentVisible = !document.hidden
  updateAnimationState()
}

onMounted(() => {
  reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  spiderFrames.forEach((source) => {
    const image = new Image()
    image.src = source
  })
  resizeCanvas()
  boundaryObserver = new ResizeObserver(() => {
    clearTimeout(resizeTimer)
    resizeTimer = window.setTimeout(resizeCanvas, 120)
  })
  if (canvasRef.value?.parentElement) boundaryObserver.observe(canvasRef.value.parentElement)

  visibilityObserver = new IntersectionObserver(
    ([entry]) => {
      isIntersecting = entry.isIntersecting
      updateAnimationState()
    },
    { threshold: 0.01 },
  )
  if (canvasRef.value?.parentElement) visibilityObserver.observe(canvasRef.value.parentElement)
  document.addEventListener('visibilitychange', handleVisibilityChange)

  updateAnimationState()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrame)
  clearTimeout(resizeTimer)
  boundaryObserver?.disconnect()
  visibilityObserver?.disconnect()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<style scoped>
.spider-layer,
.spider-webs {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.spider-layer {
  z-index: 9000;
  overflow: hidden;
}

.spider-webs {
  opacity: 0.8;
}

.spider {
  position: absolute;
  top: 0;
  left: 0;
  width: 72px;
  height: 72px;
  object-fit: contain;
  filter: drop-shadow(0 0 6px rgba(243, 4, 5, 0.34));
  will-change: transform;
}

@media (prefers-reduced-motion: reduce) {
  .spider-layer {
    display: none;
  }
}

@media (max-width: 480px) {
  .spider {
    width: 58px;
    height: 58px;
  }

  .spider-webs {
    opacity: 0.68;
  }
}
</style>
