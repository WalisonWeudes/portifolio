<template>
  <div class="spider-layer" aria-hidden="true">
    <canvas ref="canvasRef" class="spider-webs"></canvas>
    <img
      v-for="spider in spiderList"
      :key="spider.id"
      :ref="(el) => (spider.el = el)"
      class="spider"
      :src="spiderFrames[0]"
      alt=""
      draggable="false"
      @click.stop="spawnFrom(spider)"
    />
  </div>
</template>

<script setup>
// Comportamento das aranhas:
//  1. Caminham de uma borda à outra soltando um fio de seda que cai com a gravidade.
//  2. Em alguns trajetos, param no meio e tecem uma teia orbicular: raios primeiro,
//     depois a espiral, do centro para fora.
//  3. A teia pronta balança de leve ao vento, ganha gotas de orvalho e some devagar.
// Tudo é animado direto no canvas/DOM (sem reatividade por frame).
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { spiderFrames } from '../data/content'
import { t } from '../i18n'

const MAX_SPIDERS = 8
const MAX_WEBS = 8
const WEB_LIFETIME = 42000
const EDGE_PADDING = 18
const RAD = 180 / Math.PI
const SPOKES = 9
const TURNS = 6

const canvasRef = ref(null)
const spiderList = shallowRef([])

const webs = []
let nextId = 1
let ctx
let rafId = null
let resizeTimer
let pixelRatio = 1
let viewport = { width: 0, height: 0 }
let reducedMotion
let layerObserver
let visibilityObserver
let isIntersecting = true
let isDocumentVisible = true
let clock = 0 // relógio próprio (ms): pausa junto com a aba, sem "saltos"
let lastNow = 0

const rand = (min, max) => min + Math.random() * (max - min)
const clamp01 = (v) => Math.max(0, Math.min(1, v))
const easeOut = (t) => 1 - Math.pow(1 - t, 3)

/* ---------- geometria ---------- */

const edgePoint = (edge) => {
  const { width, height } = viewport
  const insetX = Math.max(70, width * 0.12)
  const insetY = Math.max(70, height * 0.12)
  const alongX = insetX + Math.random() * Math.max(1, width - insetX * 2)
  const alongY = insetY + Math.random() * Math.max(1, height - insetY * 2)
  if (edge === 0) return { x: alongX, y: EDGE_PADDING, edge }
  if (edge === 1) return { x: width - EDGE_PADDING, y: alongY, edge }
  if (edge === 2) return { x: alongX, y: height - EDGE_PADDING, edge }
  return { x: EDGE_PADDING, y: alongY, edge }
}

// Fio de seda: curva quadrática que "cai" (y positivo) no meio.
const linePoint = (a, b, sag, t) => {
  const cx = (a.x + b.x) / 2
  const cy = (a.y + b.y) / 2 + sag * 2
  const k = 1 - t
  return {
    x: k * k * a.x + 2 * k * t * cx + t * t * b.x,
    y: k * k * a.y + 2 * k * t * cy + t * t * b.y,
  }
}
const lineTangent = (a, b, sag, t) => {
  const cx = (a.x + b.x) / 2
  const cy = (a.y + b.y) / 2 + sag * 2
  return {
    x: 2 * (1 - t) * (cx - a.x) + 2 * t * (b.x - cx),
    y: 2 * (1 - t) * (cy - a.y) + 2 * t * (b.y - cy),
  }
}

// Ease in-out com um leve "tremor" de aranha correndo.
const organicEase = (t) => {
  const base = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
  return clamp01(base + Math.sin(base * Math.PI * 8) * 0.012)
}

/* ---------- teia orbicular ---------- */

const makeOrb = (hub, radius) => {
  const baseRot = Math.random() * Math.PI * 2
  const spokes = []
  for (let i = 0; i < SPOKES; i += 1) {
    const angle = baseRot + (i / SPOKES) * Math.PI * 2 + rand(-0.16, 0.16)
    spokes.push({ dx: Math.cos(angle), dy: Math.sin(angle), len: radius * rand(0.82, 1.12) })
  }
  const total = SPOKES * TURNS
  const spiral = []
  for (let j = 0; j <= total; j += 1) {
    const spoke = spokes[j % SPOKES]
    const f = 0.1 + 0.9 * (j / total)
    spiral.push({ x: spoke.dx * spoke.len * f, y: spoke.dy * spoke.len * f, f })
  }
  return { hub, radius, spokes, spiral, phase: Math.random() * 6.28 }
}

// Desenha a teia até `progress` (0–1) e devolve a posição da "cabeça" da aranha.
const ZERO = { x: 0, y: 0 }
const drawOrb = (orb, progress, alpha, now, offset = ZERO) => {
  const { hub, radius, spokes, spiral } = orb
  const windX = Math.sin(now / 1700 + orb.phase) * 2.2
  const windY = Math.cos(now / 2300 + orb.phase) * 1.4
  const hx = hub.x + offset.x
  const hy = hub.y + offset.y
  const at = (x, y, f) => ({
    x: hub.x + x + windX * f + offset.x * (1 - f),
    y: hub.y + y + windY * f + offset.y * (1 - f),
  })

  const SPOKE_PHASE = 0.2
  const grow = easeOut(clamp01(progress / SPOKE_PHASE))
  let head = { x: hx, y: hy }

  // raios (crescem juntos a partir do centro)
  ctx.strokeStyle = `rgba(200, 208, 232, ${0.42 * alpha})`
  ctx.lineWidth = 0.9
  ctx.beginPath()
  for (const s of spokes) {
    const end = at(s.dx * s.len * grow, s.dy * s.len * grow, grow)
    ctx.moveTo(hx, hy)
    ctx.quadraticCurveTo(
      hx + s.dx * s.len * grow * 0.5,
      hy + s.dy * s.len * grow * 0.5 + 3 * grow,
      end.x,
      end.y,
    )
  }
  ctx.stroke()

  // espiral: do centro para fora, segmentos com leve caimento
  const spiralProgress = clamp01((progress - SPOKE_PHASE) / (1 - SPOKE_PHASE))
  const segments = spiral.length - 1
  const exact = spiralProgress * segments
  const whole = Math.floor(exact)
  const frac = exact - whole

  if (spiralProgress > 0) {
    ctx.strokeStyle = `rgba(219, 225, 244, ${0.3 * alpha})`
    ctx.lineWidth = 0.6
    ctx.beginPath()
    let p = at(spiral[0].x, spiral[0].y, spiral[0].f)
    ctx.moveTo(p.x, p.y)
    for (let i = 0; i < Math.min(whole, segments); i += 1) {
      const next = at(spiral[i + 1].x, spiral[i + 1].y, spiral[i + 1].f)
      const sag = Math.hypot(next.x - p.x, next.y - p.y) * 0.16
      ctx.quadraticCurveTo((p.x + next.x) / 2, (p.y + next.y) / 2 + sag, next.x, next.y)
      p = next
    }
    head = p
    if (whole < segments) {
      const target = at(spiral[whole + 1].x, spiral[whole + 1].y, spiral[whole + 1].f)
      const partial = { x: p.x + (target.x - p.x) * frac, y: p.y + (target.y - p.y) * frac }
      ctx.lineTo(partial.x, partial.y)
      head = partial
    }
    ctx.stroke()

    // gotas de orvalho nas interseções já prontas
    if (progress >= 1) {
      ctx.fillStyle = `rgba(190, 215, 255, ${0.55 * alpha})`
      for (let i = 3; i <= segments; i += 4) {
        const d = at(spiral[i].x, spiral[i].y, spiral[i].f)
        ctx.beginPath()
        ctx.arc(d.x, d.y, 1.1, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  } else {
    head = at(0, 0, 0)
  }
  return head
}

/* ---------- fio (dragline) ---------- */

const drawLine = (a, b, sag, upTo, alpha, width = 1.2) => {
  const steps = Math.max(4, Math.ceil(upTo * 18))
  ctx.strokeStyle = `rgba(160, 172, 200, ${0.5 * alpha})`
  ctx.lineWidth = width
  ctx.beginPath()
  for (let i = 0; i <= steps; i += 1) {
    const p = linePoint(a, b, sag, (i / steps) * upTo)
    if (i === 0) ctx.moveTo(p.x, p.y)
    else ctx.lineTo(p.x, p.y)
  }
  ctx.stroke()
}

/* ---------- aranhas ---------- */

const newJourney = (spider, from) => {
  const startEdge = from?.edge ?? Math.floor(Math.random() * 4)
  spider.start = from ?? edgePoint(startEdge)
  spider.end = edgePoint((startEdge + 2) % 4)
  const length = Math.hypot(spider.end.x - spider.start.x, spider.end.y - spider.start.y)
  spider.sag = Math.min(70, length * 0.08) + rand(0, 14)
  spider.t = 0
  spider.duration = rand(11000, 15000)
  spider.willBuild = Math.random() < 0.6
  spider.orb = null
  spider.mode = 'walk'
}

const createSpider = (from) => {
  const spider = {
    id: nextId++,
    el: null,
    x: 0,
    y: 0,
    lastX: 0,
    lastY: 0,
    frame: 0,
    shownFrame: -1,
    traveled: Math.random() * 100,
    angle: 0,
    pauseUntil: clock,
    glitchUntil: 0,
    wasGlitching: false,
    buildStart: 0,
    buildDuration: 0,
  }
  newJourney(spider, from)
  spider.x = spider.lastX = spider.start.x
  spider.y = spider.lastY = spider.start.y
  const tan = lineTangent(spider.start, spider.end, spider.sag, 0)
  spider.angle = Math.atan2(tan.y, tan.x) * RAD + 90
  return spider
}

const spawnFrom = (spider) => {
  spider.glitchUntil = clock + 520
  const born = createSpider({ x: spider.x, y: spider.y, edge: Math.floor(Math.random() * 4) })
  born.glitchUntil = clock + 520
  const list = spiderList.value.length >= MAX_SPIDERS ? spiderList.value.slice(1) : spiderList.value
  spiderList.value = [...list, born]
}

const render = (spider) => {
  const el = spider.el
  if (!el) return

  const glitching = clock < spider.glitchUntil
  let gx = 0
  let gy = 0
  let ga = 0
  if (glitching) {
    gx = (Math.random() - 0.5) * 9
    gy = (Math.random() - 0.5) * 9
    ga = (Math.random() - 0.5) * 16
  }
  if (glitching !== spider.wasGlitching) {
    el.classList.toggle('is-glitching', glitching)
    spider.wasGlitching = glitching
  }

  el.style.transform = `translate3d(${(spider.x + gx).toFixed(1)}px, ${(spider.y + gy).toFixed(1)}px, 0) translate(-50%, -50%) rotate(${(spider.angle + ga).toFixed(1)}deg)`
  if (spider.frame !== spider.shownFrame) {
    spider.shownFrame = spider.frame
    el.src = spiderFrames[spider.frame]
  }
}

const moveTo = (spider, x, y, face = true) => {
  const dist = Math.hypot(x - spider.lastX, y - spider.lastY)
  spider.traveled += dist
  if (face && dist > 0.05) {
    const target = Math.atan2(y - spider.lastY, x - spider.lastX) * RAD + 90
    const diff = ((target - spider.angle + 540) % 360) - 180
    spider.angle += diff * 0.18
  }
  spider.lastX = x
  spider.lastY = y
  spider.x = x
  spider.y = y
  // 3.4px por frame de animação: as pernas acompanham o deslocamento real
  spider.frame = Math.floor((spider.traveled / 3.4) % spiderFrames.length)
}

const step = (spider, dt) => {
  if (spider.mode === 'trap') return
  if (clock < spider.pauseUntil) {
    render(spider)
    return
  }

  if (spider.mode === 'walk') {
    spider.t = Math.min(1, spider.t + dt / spider.duration)
    const eased = organicEase(spider.t)
    const p = linePoint(spider.start, spider.end, spider.sag, eased)
    const tan = lineTangent(spider.start, spider.end, spider.sag, eased)
    const len = Math.hypot(tan.x, tan.y) || 1
    const lateral = Math.sin(spider.traveled * 0.24) * 1.6
    moveTo(spider, p.x + (-tan.y / len) * lateral, p.y + (tan.x / len) * lateral, false)
    const target = Math.atan2(tan.y, tan.x) * RAD + 90 + Math.sin(spider.traveled * 0.24) * 3
    spider.angle += ((((target - spider.angle + 540) % 360) - 180)) * 0.2

    drawLine(spider.start, spider.end, spider.sag, eased, 1)

    // Meio do caminho: algumas aranhas param e tecem uma teia
    if (spider.willBuild && !spider.orb && spider.t >= 0.5) {
      const length = Math.hypot(spider.end.x - spider.start.x, spider.end.y - spider.start.y)
      const radius = Math.max(46, Math.min(95, length * 0.16))
      spider.orb = makeOrb({ x: p.x, y: p.y }, radius)
      spider.mode = 'build'
      spider.buildStart = clock
      spider.buildDuration = rand(4800, 6200)
    }

    if (spider.t >= 1) {
      webs.push({
        start: spider.start,
        end: spider.end,
        sag: spider.sag,
        orb: spider.orb,
        finishedAt: clock,
      })
      if (webs.length > MAX_WEBS) webs.shift()
      spider.pauseUntil = clock + rand(900, 1800)
      newJourney(spider, { ...spider.end })
    }
  } else {
    // construindo: dragline até o centro + teia progressiva
    const progress = clamp01((clock - spider.buildStart) / spider.buildDuration)
    const eased = organicEase(spider.t)
    drawLine(spider.start, spider.end, spider.sag, eased, 1)
    const head = drawOrb(spider.orb, progress, 1, clock)
    // a aranha "anda" na ponta do fio sendo tecido, com pequena inércia
    moveTo(spider, spider.x + (head.x - spider.x) * 0.35, spider.y + (head.y - spider.y) * 0.35)
    if (progress >= 1) {
      spider.mode = 'walk'
      spider.pauseUntil = clock + rand(500, 900) // descansa um instante no centro
    }
  }
  render(spider)
}

/* ---------- captura do cursor ---------- */

// A aranha caça o cursor, tece uma teia em volta dele e o prende. Só solta
// quando o usuário sacode o mouse rápido: aí a teia se despedaça.
let trapCapable = false
const pointer = { x: -999, y: -999, speed: 0, lastT: 0, lastMove: 0 }
let trap = null // { phase, spider, orb, c, energy, phaseAt, shards, offset }
let nextTrapAt = 0

const TRAP_RADIUS = 78
const FREE_SPEED = 1.9 // px/ms
const FREE_ENERGY = 520 // ms acumulados em alta velocidade (~0,5s de sacudida)

const setTrappedUI = (on) => {
  document.documentElement.classList.toggle('is-trapped', on)
}

const onPointerMove = (event) => {
  const now = event.timeStamp
  const dt = Math.max(1, now - pointer.lastT)
  const dist = Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y)
  const v = pointer.lastT ? dist / dt : 0
  pointer.speed = pointer.speed * 0.6 + v * 0.4
  pointer.x = event.clientX
  pointer.y = event.clientY
  pointer.lastT = now
  pointer.lastMove = clock
}

const swallowClick = (event) => {
  if (trap && trap.phase === 'caught') {
    event.preventDefault()
    event.stopPropagation()
  }
}

const canStartTrap = () =>
  trapCapable &&
  !trap &&
  !document.hidden &&
  isIntersecting &&
  spiderList.value.length > 0 &&
  clock - pointer.lastMove < 2500 &&
  !document.querySelector('.lightbox') &&
  !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)

const startTrap = () => {
  const spider = spiderList.value[Math.floor(Math.random() * spiderList.value.length)]
  trap = {
    phase: 'hunt',
    spider,
    orb: null,
    c: null,
    energy: 0,
    phaseAt: clock,
    shards: [],
    offset: { x: 0, y: 0 },
  }
  spider.mode = 'trap'
  spider.glitchUntil = clock + 350
}

const giveUp = () => {
  const s = trap.spider
  newJourney(s, { x: s.x, y: s.y, edge: Math.floor(Math.random() * 4) })
  s.pauseUntil = clock + 600
  trap = null
  nextTrapAt = clock + rand(20000, 35000)
}

// Quebra a teia em fiapos que voam, caem e somem.
const shatter = () => {
  const { orb, c, offset } = trap
  const shards = []
  const add = (x1, y1, x2, y2) => {
    const mx = (x1 + x2) / 2 - c.x
    const my = (y1 + y2) / 2 - c.y
    const d = Math.hypot(mx, my) || 1
    const force = rand(60, 220)
    shards.push({
      x1, y1, x2, y2,
      vx: (mx / d) * force + rand(-40, 40),
      vy: (my / d) * force + rand(-80, 10),
      spin: rand(-3, 3),
      life: rand(500, 1100),
      age: 0,
    })
  }
  const cx = c.x + offset.x
  const cy = c.y + offset.y
  for (const sp of orb.spokes) add(cx, cy, c.x + sp.dx * sp.len, c.y + sp.dy * sp.len)
  for (let i = 0; i < orb.spiral.length - 1; i += 1) {
    const a = orb.spiral[i]
    const b = orb.spiral[i + 1]
    add(
      c.x + a.x + offset.x * (1 - a.f),
      c.y + a.y + offset.y * (1 - a.f),
      c.x + b.x + offset.x * (1 - b.f),
      c.y + b.y + offset.y * (1 - b.f),
    )
  }
  for (const th of orb.tethers) add(c.x + th.x1, c.y + th.y1, c.x + th.x2, c.y + th.y2)

  trap.shards = shards
  trap.phase = 'break'
  setTrappedUI(false)

  // a aranha se assusta e foge
  const s = trap.spider
  s.glitchUntil = clock + 600
  newJourney(s, { x: s.x, y: s.y, edge: Math.floor(Math.random() * 4) })
  s.pauseUntil = clock + 900
  s.mode = 'walk'
}

const drawCursor = (cx, cy) => {
  ctx.fillStyle = '#fff'
  ctx.strokeStyle = '#08090d'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(cx, cy + 17)
  ctx.lineTo(cx + 4.5, cy + 13)
  ctx.lineTo(cx + 8, cy + 20)
  ctx.lineTo(cx + 10.5, cy + 19)
  ctx.lineTo(cx + 7, cy + 12)
  ctx.lineTo(cx + 12.5, cy + 12)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
}

const updateTrap = (dt) => {
  if (!trap) {
    if (clock >= nextTrapAt) {
      if (canStartTrap() && Math.random() < 0.6) startTrap()
      nextTrapAt = clock + rand(5000, 12000)
    }
    return
  }
  const spider = trap.spider

  if (trap.phase === 'hunt') {
    const dx = pointer.x - spider.x
    const dy = pointer.y - spider.y
    const dist = Math.hypot(dx, dy)
    if (clock - trap.phaseAt > 9000 || pointer.x < 0) {
      spider.mode = 'walk'
      giveUp()
      return
    }
    if (dist < 34) {
      trap.phase = 'weave'
      trap.phaseAt = clock
      trap.c = { x: pointer.x, y: pointer.y }
      trap.orb = makeOrb(trap.c, TRAP_RADIUS) // hub === trap.c (mesmo objeto)
      // fios-âncora longos que "prendem" a teia ao resto da tela
      trap.orb.tethers = Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2 + rand(-0.3, 0.3)
        return {
          x1: Math.cos(a) * TRAP_RADIUS,
          y1: Math.sin(a) * TRAP_RADIUS,
          x2: Math.cos(a) * rand(170, 260),
          y2: Math.sin(a) * rand(140, 230),
        }
      })
      return
    }
    const stepLen = Math.min(dist * 5 + 280, 620) * (dt / 1000)
    moveTo(spider, spider.x + (dx / dist) * stepLen, spider.y + (dy / dist) * stepLen)
    render(spider)
    return
  }

  if (trap.phase === 'weave') {
    const progress = clamp01((clock - trap.phaseAt) / 1700)
    // a teia acompanha o cursor enquanto é tecida
    trap.c.x += (pointer.x - trap.c.x) * 0.25
    trap.c.y += (pointer.y - trap.c.y) * 0.25
    const head = drawOrb(trap.orb, progress, 1, clock)
    moveTo(spider, spider.x + (head.x - spider.x) * 0.45, spider.y + (head.y - spider.y) * 0.45)
    render(spider)
    if (progress >= 1) {
      trap.phase = 'caught'
      trap.phaseAt = clock
      trap.energy = 0
      setTrappedUI(true)
    }
    return
  }

  if (trap.phase === 'caught') {
    // cursor preso: só se afasta um pouco, puxado elasticamente de volta
    const pullX = pointer.x - trap.c.x
    const pullY = pointer.y - trap.c.y
    const mag = Math.hypot(pullX, pullY)
    const reach = Math.min(mag, 70) * 0.5
    const ox = mag ? (pullX / mag) * reach : 0
    const oy = mag ? (pullY / mag) * reach : 0
    trap.offset.x += (ox - trap.offset.x) * 0.3
    trap.offset.y += (oy - trap.offset.y) * 0.3

    // sacudir rápido acumula energia; devagar ela se dissipa
    if (pointer.speed > FREE_SPEED) trap.energy += dt
    else trap.energy = Math.max(0, trap.energy - dt * 0.6)
    const strain = clamp01(trap.energy / FREE_ENERGY)

    drawOrb(trap.orb, 1, 1, clock + strain * 400, trap.offset)

    ctx.strokeStyle = `rgba(230, 236, 255, ${0.5 + strain * 0.4})`
    ctx.lineWidth = 1 + strain
    ctx.beginPath()
    for (const th of trap.orb.tethers) {
      const jitter = strain * rand(-2, 2)
      ctx.moveTo(trap.c.x + th.x1, trap.c.y + th.y1)
      ctx.lineTo(trap.c.x + th.x2 + jitter, trap.c.y + th.y2 + jitter)
    }
    ctx.stroke()

    drawCursor(trap.c.x + trap.offset.x, trap.c.y + trap.offset.y)

    if (clock - trap.phaseAt > 2500) {
      ctx.font = '600 10px "Courier New", monospace'
      ctx.fillStyle = 'rgba(245, 245, 242, 0.75)'
      ctx.textAlign = 'center'
      ctx.fillText(t('spider.hint'), trap.c.x, trap.c.y + TRAP_RADIUS + 36)
    }

    // a aranha vigia a presa, balançando no alto da teia
    moveTo(spider, trap.c.x + 6, trap.c.y - TRAP_RADIUS * 0.55 + Math.sin(clock / 260) * 3, false)
    spider.angle += (180 - spider.angle) * 0.05
    render(spider)

    const timedOut = clock - trap.phaseAt > 25000 // rede de segurança
    if (strain >= 1 || timedOut) shatter()
    return
  }

  if (trap.phase === 'break') {
    let alive = false
    ctx.lineWidth = 0.9
    const k = dt / 1000
    for (const sh of trap.shards) {
      sh.age += dt
      if (sh.age >= sh.life) continue
      alive = true
      sh.vy += 420 * k
      const dx = sh.vx * k
      const dy = sh.vy * k
      sh.x1 += dx
      sh.y1 += dy
      sh.x2 += dx + sh.spin * k * 10
      sh.y2 += dy
      ctx.strokeStyle = `rgba(225, 232, 255, ${0.7 * (1 - sh.age / sh.life)})`
      ctx.beginPath()
      ctx.moveTo(sh.x1, sh.y1)
      ctx.lineTo(sh.x2, sh.y2)
      ctx.stroke()
    }
    if (!alive) {
      trap = null
      nextTrapAt = clock + rand(30000, 55000)
    }
  }
}

/* ---------- loop ---------- */

const frameLoop = (now) => {
  rafId = requestAnimationFrame(frameLoop)
  const dt = Math.min(50, now - lastNow || 16)
  lastNow = now
  clock += dt
  if (!ctx) return

  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
  ctx.clearRect(0, 0, viewport.width, viewport.height)

  // teias prontas (balançam ao vento e somem devagar)
  for (let i = webs.length - 1; i >= 0; i -= 1) {
    const web = webs[i]
    const age = clock - web.finishedAt
    const alpha = clamp01(1 - age / WEB_LIFETIME)
    if (!alpha) {
      webs.splice(i, 1)
      continue
    }
    drawLine(web.start, web.end, web.sag, 1, alpha)
    if (web.orb) drawOrb(web.orb, 1, alpha, clock)
  }

  for (const spider of spiderList.value) step(spider, dt)
  updateTrap(dt)
}

const updateLoop = () => {
  const run = isIntersecting && isDocumentVisible && !reducedMotion.matches
  if (!run) {
    if (rafId) cancelAnimationFrame(rafId)
    rafId = null
    return
  }
  if (!rafId) {
    lastNow = performance.now()
    rafId = requestAnimationFrame(frameLoop)
  }
}

const resize = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.parentElement.getBoundingClientRect()
  viewport = { width: rect.width || window.innerWidth, height: rect.height || window.innerHeight }
  pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
  canvas.width = Math.round(viewport.width * pixelRatio)
  canvas.height = Math.round(viewport.height * pixelRatio)
  ctx = canvas.getContext('2d')
  if (!spiderList.value.length && viewport.width > 0) {
    spiderList.value = [createSpider(null)]
  }
}

const onVisibility = () => {
  isDocumentVisible = !document.hidden
  updateLoop()
}

onMounted(() => {
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.addEventListener?.('change', updateLoop)
  resize()

  trapCapable =
    window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reducedMotion.matches
  if (trapCapable) {
    nextTrapAt = clock + rand(18000, 32000)
    window.addEventListener('mousemove', onPointerMove, { passive: true })
    window.addEventListener('click', swallowClick, true)
  }

  const layer = canvasRef.value?.parentElement
  layerObserver = new ResizeObserver(() => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(resize, 120)
  })
  visibilityObserver = new IntersectionObserver(
    ([entry]) => {
      isIntersecting = entry.isIntersecting
      updateLoop()
    },
    { threshold: 0.01 },
  )
  if (layer) {
    layerObserver.observe(layer)
    visibilityObserver.observe(layer)
  }
  document.addEventListener('visibilitychange', onVisibility)
  updateLoop()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  clearTimeout(resizeTimer)
  layerObserver?.disconnect()
  visibilityObserver?.disconnect()
  reducedMotion?.removeEventListener?.('change', updateLoop)
  document.removeEventListener('visibilitychange', onVisibility)
  window.removeEventListener('mousemove', onPointerMove)
  window.removeEventListener('click', swallowClick, true)
  setTrappedUI(false)
})
</script>

<style scoped>
.spider-layer {
  position: fixed;
  inset: 0;
  z-index: 45;
  overflow: hidden;
  pointer-events: none;
}

.spider-webs {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.85;
  pointer-events: none;
}

.spider {
  position: absolute;
  top: 0;
  left: 0;
  width: 72px;
  height: 72px;
  object-fit: contain;
  will-change: transform;
  pointer-events: auto;
  cursor: pointer;
  user-select: none;
  transition: filter 0.15s ease;
}

.spider:hover {
  filter: brightness(1.35);
}

.spider.is-glitching {
  filter: drop-shadow(-4px 0 #e62429) drop-shadow(4px 0 #3157ff) brightness(1.5) contrast(1.3);
  animation: spiderGlitch 0.1s steps(2) infinite alternate;
}

@keyframes spiderGlitch {
  0% { clip-path: inset(0 0 0 0); }
  35% { clip-path: inset(18% 0 12% 0); }
  70% { clip-path: inset(50% 0 6% 0); }
  100% { clip-path: inset(6% 0 40% 0); }
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
    opacity: 0.7;
  }
}
</style>
