// Comportamento das aranhas:
//  1. Caminham de uma borda à outra soltando um fio de seda que cai com a gravidade.
//  2. Só andam pela página (sem soltar fio). A teia orbicular aparece apenas
//     quando uma delas caça o cursor (ver spider/orb.js).
//  4. A aranha é desenhada em código (src/components/spider/rig.js): pernas com
//     cinemática inversa e marcha alternada, sem sprites.
// Tudo é animado direto no canvas (sem estado do React por frame).
import { useEffect, useRef } from 'react'
import { useI18n } from '../i18n'
import { createRig, drawRig, updateRig } from './spider/rig'
import { drawOrb as drawOrbOn, makeOrb, orbSegments } from './spider/orb'
import './SpiderWalker.css'

const MAX_SPIDERS = 8
const GAME_CLICKS = 5 // cliques nas aranhas, em sequência, para abrir o jogo
const GAME_CLICK_WINDOW = 4000 // ms
const EDGE_PADDING = 18
const RAD = 180 / Math.PI

const rand = (min, max) => min + Math.random() * (max - min)
const clamp01 = (v) => Math.max(0, Math.min(1, v))

export default function SpiderWalker() {
  const canvasRef = useRef(null)
  const { t } = useI18n()
  // o loop lê sempre a tradução atual, sem reiniciar a animação ao trocar o idioma
  const tRef = useRef(t)
  tRef.current = t

  useEffect(() => {
    // toda a animação vive neste fechamento (StrictMode monta/desmonta limpo)
    let spiders = []
    let nextId = 1
    let ctx
    let rafId = null
    let resizeTimer
    let pixelRatio = 1
    let viewport = { width: 0, height: 0 }
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let isIntersecting = true
    let isDocumentVisible = true
    let clock = 0 // relógio próprio (ms): pausa junto com a aba, sem "saltos"
    let lastNow = 0

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

    /* ---------- teia orbicular (ver spider/orb.js) ---------- */

    const drawOrb = (orb, progress, alpha, now, offset, shake) =>
      drawOrbOn(ctx, orb, progress, alpha, now, offset, shake)

    /* ---------- aranhas ---------- */

    const newJourney = (spider, from) => {
      const startEdge = from?.edge ?? Math.floor(Math.random() * 4)
      spider.start = from ?? edgePoint(startEdge)
      spider.end = edgePoint((startEdge + 2) % 4)
      const length = Math.hypot(spider.end.x - spider.start.x, spider.end.y - spider.start.y)
      spider.sag = Math.min(70, length * 0.08) + rand(0, 14)
      spider.t = 0
      spider.duration = rand(11000, 15000)
      spider.mode = 'walk'
    }

    // ângulo (graus, convenção "para cima") → direção do corpo em radianos
    const headingOf = (spider) => ((spider.angle - 90) * Math.PI) / 180
    const spiderScale = () => (window.innerWidth < 600 ? 0.62 : 0.8)

    const createSpider = (from) => {
      const spider = {
        id: nextId++,
        rig: null,
        x: 0,
        y: 0,
        lastX: 0,
        lastY: 0,
        traveled: Math.random() * 100,
        angle: 0,
        pauseUntil: clock,
        glitchUntil: 0,
        gx: 0,
        gy: 0,
      }
      newJourney(spider, from)
      spider.x = spider.lastX = spider.start.x
      spider.y = spider.lastY = spider.start.y
      const tan = lineTangent(spider.start, spider.end, spider.sag, 0)
      spider.angle = Math.atan2(tan.y, tan.x) * RAD + 90
      spider.rig = createRig(spider.x, spider.y, headingOf(spider), spiderScale(), spider.id + Math.random())
      return spider
    }

    const spawnFrom = (spider) => {
      spider.glitchUntil = clock + 520
      const born = createSpider({ x: spider.x, y: spider.y, edge: Math.floor(Math.random() * 4) })
      born.glitchUntil = clock + 520
      const list = spiders.length >= MAX_SPIDERS ? spiders.slice(1) : spiders
      spiders = [...list, born]
    }

    // Atualiza o esqueleto (pernas/marcha) e o tremor do glitch. O desenho acontece em drawSpiders().
    const render = (spider, dt = 16) => {
      const glitching = clock < spider.glitchUntil
      spider.gx = glitching ? (Math.random() - 0.5) * 9 : 0
      spider.gy = glitching ? (Math.random() - 0.5) * 9 : 0
      if (spider.rig) updateRig(spider.rig, spider.x, spider.y, headingOf(spider), dt, clock)
    }

    let hovered = null
    const drawSpiders = () => {
      for (const spider of spiders) {
        if (!spider.rig) continue
        if (clock < spider.glitchUntil) {
          // camadas deslocadas em vermelho e azul + fatias, como o glitch antigo
          ctx.globalAlpha = 0.5
          drawRig(ctx, spider.rig, { clock, tint: '#e62429', dx: spider.gx - 3, dy: spider.gy })
          drawRig(ctx, spider.rig, { clock, tint: '#3157ff', dx: spider.gx + 3, dy: spider.gy })
          ctx.globalAlpha = 1
          ctx.save()
          const cut = Math.random() * 40 - 20
          ctx.beginPath()
          ctx.rect(spider.x - 60, spider.y - 60, 120, 60 + cut)
          ctx.clip()
          drawRig(ctx, spider.rig, { clock, dx: spider.gx, dy: spider.gy })
          ctx.restore()
        } else {
          drawRig(ctx, spider.rig, { clock, hover: spider === hovered })
        }
      }
    }

    // Clique/hover por proximidade (o canvas não recebe eventos)
    const spiderAt = (x, y) => {
      let best = null
      let bestD = 26 * spiderScale() + 8
      for (const spider of spiders) {
        const d = Math.hypot(spider.x - x, spider.y - y)
        if (d < bestD) {
          best = spider
          bestD = d
        }
      }
      return best
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
    }

    const step = (spider, dt) => {
      if (spider.mode === 'trap') return
      if (clock < spider.pauseUntil) {
        render(spider, dt)
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

        if (spider.t >= 1) {
          spider.pauseUntil = clock + rand(900, 1800)
          newJourney(spider, { ...spider.end })
        }
      }
      render(spider, dt)
    }

    /* ---------- captura do cursor ---------- */

    // A aranha caça o cursor, tece uma teia em volta dele e o prende. Só solta
    // quando o usuário sacode o mouse rápido: aí a teia se despedaça.
    let trapCapable = false
    let gaming = false // jogo Spider Rush aberto
    let spiderClicks = []
    const pointer = { x: -999, y: -999, speed: 0, lastT: 0, lastMove: 0 }
    let trap = null // { phase, spider, orb, c, energy, phaseAt, shards, offset }
    let nextTrapAt = 0

    const TRAP_RADIUS = 88
    const FREE_SPEED = 1.9 // px/ms
    const FREE_ENERGY = 520 // ms acumulados em alta velocidade (~0,5s de sacudida)
    const LEAP_RANGE = 230 // px: a esta distância a aranha salta no cursor
    const LEAP_TIME = 170 // ms do salto

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

    const onClickCapture = (event) => {
      if (trap && (trap.phase === 'weave' || trap.phase === 'caught')) {
        event.preventDefault()
        event.stopPropagation()
        return
      }
      const spider = spiderAt(event.clientX, event.clientY)
      if (spider) {
        event.preventDefault()
        event.stopPropagation()
        // várias cliques seguidos nas aranhas abrem o jogo escondido
        const now = performance.now()
        spiderClicks = spiderClicks.filter((t) => now - t < GAME_CLICK_WINDOW)
        spiderClicks.push(now)
        if (spiderClicks.length >= GAME_CLICKS) {
          spiderClicks = []
          window.dispatchEvent(new CustomEvent('spider:game'))
          return
        }
        spawnFrom(spider)
      }
    }

    const onHoverMove = (event) => {
      const spider = spiderAt(event.clientX, event.clientY)
      if (spider !== hovered) {
        hovered = spider
        document.documentElement.classList.toggle('is-over-spider', !!spider)
      }
    }

    const canStartTrap = () =>
      trapCapable &&
      !gaming &&
      !trap &&
      !document.hidden &&
      isIntersecting &&
      spiders.length > 0 &&
      clock - pointer.lastMove < 2500 &&
      !document.querySelector('.lightbox') &&
      !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)

    const startTrap = () => {
      const spider = spiders[Math.floor(Math.random() * spiders.length)]
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
      for (const seg of orbSegments(orb, offset)) add(...seg)

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

    // Prende o cursor na hora: a teia começa a ser tecida já com ele preso.
    const capture = () => {
      trap.phase = 'weave'
      trap.phaseAt = clock
      trap.caughtAt = clock
      trap.energy = 0
      trap.c = { x: pointer.x, y: pointer.y }
      trap.orb = makeOrb(trap.c, TRAP_RADIUS, { turns: 5, speed: 2.2, spokeCount: 16, pauses: 0.12, radiusTime: 26 })
      // fios de suporte esticados até a borda da tela
      for (const th of trap.orb.tethers) {
        const sx = trap.c.x + th.from.x
        const sy = trap.c.y + th.from.y
        let dx = th.to.x - th.from.x
        let dy = th.to.y - th.from.y
        const dl = Math.hypot(dx, dy) || 1
        dx /= dl
        dy /= dl
        const tx = dx > 0 ? (viewport.width - sx) / dx : dx < 0 ? -sx / dx : Infinity
        const ty = dy > 0 ? (viewport.height - sy) / dy : dy < 0 ? -sy / dy : Infinity
        const len = Math.max(20, Math.min(tx, ty)) + 4
        th.to = { x: th.from.x + dx * len, y: th.from.y + dy * len }
        th.sag = rand(0.015, 0.04) // fio longo e esticado
        th.brace.t = Math.min(0.3, rand(45, 75) / len)
      }
      setTrappedUI(true)
    }

    // Cursor preso: só se afasta um pouco, puxado elasticamente de volta.
    // Sacudir rápido acumula energia (devolve 0–1); devagar ela se dissipa.
    const holdPrey = (dt) => {
      const pullX = pointer.x - trap.c.x
      const pullY = pointer.y - trap.c.y
      const mag = Math.hypot(pullX, pullY)
      const reach = Math.min(mag, 70) * 0.5
      const ox = mag ? (pullX / mag) * reach : 0
      const oy = mag ? (pullY / mag) * reach : 0
      trap.offset.x += (ox - trap.offset.x) * 0.3
      trap.offset.y += (oy - trap.offset.y) * 0.3
      if (pointer.speed > FREE_SPEED) trap.energy += dt
      else trap.energy = Math.max(0, trap.energy - dt * 0.6)
      return clamp01(trap.energy / FREE_ENERGY)
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
        if (clock - trap.phaseAt > 6000 || pointer.x < 0) {
          spider.mode = 'walk'
          giveUp()
          return
        }
        // perto o bastante: salta em cima do cursor soltando um fio
        if (dist < LEAP_RANGE) {
          trap.phase = 'leap'
          trap.phaseAt = clock
          trap.from = { x: spider.x, y: spider.y }
          return
        }
        // corre rápido em direção ao cursor
        const stepLen = Math.min(dist * 5 + 500, 1500) * (dt / 1000)
        moveTo(spider, spider.x + (dx / dist) * stepLen, spider.y + (dy / dist) * stepLen)
        render(spider, dt)
        return
      }

      if (trap.phase === 'leap') {
        const p = clamp01((clock - trap.phaseAt) / LEAP_TIME)
        const e = 1 - (1 - p) ** 3
        const x = trap.from.x + (pointer.x - trap.from.x) * e
        // arco do salto
        const y = trap.from.y + (pointer.y - trap.from.y) * e - Math.sin(p * Math.PI) * 28
        ctx.strokeStyle = 'rgba(225, 232, 248, 0.55)'
        ctx.lineWidth = 0.9
        ctx.beginPath()
        ctx.moveTo(trap.from.x, trap.from.y)
        ctx.lineTo(x, y)
        ctx.stroke()
        moveTo(spider, x, y)
        render(spider, dt)
        if (p >= 1) capture()
        return
      }

      if (trap.phase === 'weave' || trap.phase === 'caught') {
        const strain = holdPrey(dt)
        if (trap.phase === 'weave') {
          // o cursor já está preso; a teia é tecida em volta dele
          const progress = clamp01((clock - trap.phaseAt) / trap.orb.duration)
          const head = drawOrb(trap.orb, progress, 1, clock, trap.offset, strain)
          moveTo(spider, head.x, head.y)
          if (progress >= 1) trap.phase = 'caught'
        } else {
          // quanto mais a presa se debate, mais a teia vibra
          drawOrb(trap.orb, 1, 1, clock, trap.offset, strain)
          // a aranha vigia a presa, balançando no alto da teia
          moveTo(spider, trap.c.x + 6, trap.c.y - TRAP_RADIUS * 0.55 + Math.sin(clock / 260) * 3, false)
          spider.angle += (180 - spider.angle) * 0.05
        }
        drawCursor(trap.c.x + trap.offset.x, trap.c.y + trap.offset.y)
        if (clock - trap.caughtAt > 2500) {
          ctx.font = '600 10px "Courier New", monospace'
          ctx.fillStyle = 'rgba(245, 245, 242, 0.75)'
          ctx.textAlign = 'center'
          ctx.fillText(tRef.current('spider.hint'), trap.c.x, trap.c.y + TRAP_RADIUS + 36)
        }
        render(spider, dt)

        const timedOut = clock - trap.caughtAt > 25000 // rede de segurança
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


      for (const spider of spiders) step(spider, dt)
      updateTrap(dt)
      // aranha presa no "break" volta a andar normalmente
      drawSpiders()
    }

    const updateLoop = () => {
      const run = isIntersecting && isDocumentVisible && !reducedMotion.matches && !gaming
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
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.parentElement.getBoundingClientRect()
      viewport = { width: rect.width || window.innerWidth, height: rect.height || window.innerHeight }
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.round(viewport.width * pixelRatio)
      canvas.height = Math.round(viewport.height * pixelRatio)
      ctx = canvas.getContext('2d')
      if (!spiders.length && viewport.width > 0) {
        spiders = [createSpider(null)]
      }
    }


    // Enquanto o jogo está aberto: apaga as aranhas extras (geradas pelos cliques),
    // desfaz a teia e para a animação, para o jogo rodar leve. Ao sair, retoma.
    const onGameState = (event) => {
      gaming = !!event.detail?.open
      if (gaming) {
        if (trap) {
          trap.spider.mode = 'walk'
          trap = null
        }
        setTrappedUI(false)
        hovered = null
        document.documentElement.classList.remove('is-over-spider')
        spiders = viewport.width > 0 ? [createSpider(null)] : []
        ctx?.setTransform(1, 0, 0, 1, 0, 0)
        ctx?.clearRect(0, 0, canvasRef.current?.width || 0, canvasRef.current?.height || 0)
      } else {
        nextTrapAt = clock + rand(20000, 35000)
      }
      updateLoop()
    }

    const onVisibility = () => {
      isDocumentVisible = !document.hidden
      updateLoop()
    }

    // inspeção em desenvolvimento (mesmo formato do antigo shallowRef: __spiders.value)
    const devHandle = {
      get value() {
        return spiders
      },
    }
    if (import.meta.env.DEV) window.__spiders = devHandle
    reducedMotion.addEventListener?.('change', updateLoop)
    resize()

    trapCapable =
      window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reducedMotion.matches
    if (trapCapable) {
      nextTrapAt = clock + rand(18000, 32000)
      window.addEventListener('mousemove', onPointerMove, { passive: true })
    }
    window.addEventListener('click', onClickCapture, true)
    window.addEventListener('mousemove', onHoverMove, { passive: true })

    const layer = canvasRef.current?.parentElement
    const layerObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(resize, 120)
    })
    const visibilityObserver = new IntersectionObserver(
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
    window.addEventListener('spider:game-state', onGameState)
    updateLoop()

    return () => {
      cancelAnimationFrame(rafId)
      rafId = null
      clearTimeout(resizeTimer)
      layerObserver.disconnect()
      visibilityObserver.disconnect()
      reducedMotion.removeEventListener?.('change', updateLoop)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('spider:game-state', onGameState)
      window.removeEventListener('mousemove', onPointerMove)
      window.removeEventListener('click', onClickCapture, true)
      window.removeEventListener('mousemove', onHoverMove)
      document.documentElement.classList.remove('is-over-spider')
      setTrappedUI(false)
      if (import.meta.env.DEV && window.__spiders === devHandle) delete window.__spiders
    }
  }, [])

  return (
    <div className="spider-layer" aria-hidden="true">
      <canvas ref={canvasRef} className="spider-webs"></canvas>
    </div>
  )
}
