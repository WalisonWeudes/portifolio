<template>
  <div class="click-spark" @click="handleClick">
    <canvas ref="canvasRef" class="click-spark__canvas"></canvas>
    <slot />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import './ClickSpark.css'

const props = defineProps({
  sparkColor: {
    type: String,
    default: '#f00',
  },
  sparkSize: {
    type: Number,
    default: 30,
  },
  sparkRadius: {
    type: Number,
    default: 30,
  },
  sparkCount: {
    type: Number,
    default: 8,
  },
  duration: {
    type: Number,
    default: 660,
  },
  easing: {
    type: String,
    default: 'ease-out',
  },
  extraScale: {
    type: Number,
    default: 1,
  },
})

const canvasRef = ref(null)
const sparks = ref([])
let resizeObserver
let resizeTimeout
let animationId

const easeFunc = computed(() => {
  switch (props.easing) {
    case 'linear':
      return (t) => t
    case 'ease-in':
      return (t) => t * t
    case 'ease-in-out':
      return (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)
    default:
      return (t) => t * (2 - t)
  }
})

const resizeCanvas = () => {
  const canvas = canvasRef.value
  const parent = canvas?.parentElement
  if (!canvas || !parent) return

  const { width, height } = parent.getBoundingClientRect()
  const ratio = window.devicePixelRatio || 1
  const canvasWidth = Math.round(width * ratio)
  const canvasHeight = Math.round(height * ratio)

  if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
  }
}

const draw = (timestamp) => {
  const canvas = canvasRef.value
  const ctx = canvas?.getContext('2d')
  if (!canvas || !ctx) return

  const ratio = window.devicePixelRatio || 1
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.save()
  ctx.scale(ratio, ratio)

  sparks.value = sparks.value.filter((spark) => {
    const elapsed = timestamp - spark.startTime
    if (elapsed >= props.duration) {
      return false
    }

    const progress = elapsed / props.duration
    const eased = easeFunc.value(progress)
    const distance = eased * props.sparkRadius * props.extraScale
    const lineLength = props.sparkSize * (1 - eased)

    const x1 = spark.x + distance * Math.cos(spark.angle)
    const y1 = spark.y + distance * Math.sin(spark.angle)
    const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle)
    const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle)

    ctx.strokeStyle = props.sparkColor
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()

    return true
  })

  ctx.restore()
  animationId = requestAnimationFrame(draw)
}

const handleClick = (event) => {
  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const now = performance.now()

  const newSparks = Array.from({ length: props.sparkCount }, (_, index) => ({
    x,
    y,
    angle: (2 * Math.PI * index) / props.sparkCount,
    startTime: now,
  }))

  sparks.value.push(...newSparks)
}

onMounted(() => {
  const canvas = canvasRef.value
  const parent = canvas?.parentElement
  if (!canvas || !parent) return

  resizeObserver = new ResizeObserver(() => {
    clearTimeout(resizeTimeout)
    resizeTimeout = window.setTimeout(resizeCanvas, 100)
  })

  resizeObserver.observe(parent)
  resizeCanvas()
  animationId = requestAnimationFrame(draw)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  clearTimeout(resizeTimeout)
  cancelAnimationFrame(animationId)
})

watch(
  () => [props.sparkSize, props.sparkRadius, props.sparkCount, props.duration, props.extraScale],
  () => resizeCanvas(),
)
</script>
