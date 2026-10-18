// Teia orbicular construída como as aranhas reais fazem:
//  1. moldura irregular (fios de ponte presos em 5–7 pontos)
//  2. raios saindo do centro até a moldura (comprimentos diferentes)
//  3. "cubo" central: alguns fios bem juntos ao redor do centro
//  4. espiral de captura de FORA para DENTRO, com espaçamento irregular,
//     fios cedendo entre os raios, e uma zona livre perto do centro.
// A aranha percorre o caminho real da construção em velocidade de aranha
// (sem saltos), parando um instante em cada raio para prender o fio.

const TAU = Math.PI * 2
const rand = (a, b) => a + Math.random() * (b - a)
const clamp01 = (v) => Math.max(0, Math.min(1, v))

// distância do centro até a borda do polígono da moldura na direção (dx, dy)
const rayToFrame = (frame, dx, dy) => {
  let best = Infinity
  for (let i = 0; i < frame.length; i += 1) {
    const a = frame[i]
    const b = frame[(i + 1) % frame.length]
    const ex = b.x - a.x
    const ey = b.y - a.y
    const den = dx * ey - dy * ex
    if (Math.abs(den) < 1e-6) continue
    const t = (a.x * ey - a.y * ex) / den
    const u = (a.x * dy - a.y * dx) / den
    if (t > 0 && u >= 0 && u <= 1) best = Math.min(best, t)
  }
  return Number.isFinite(best) ? best : 60
}

export function makeOrb(hub, radius, { turns = 5, speed = 0.2, spokeCount } = {}) {
  const rot = Math.random() * TAU

  // 1. moldura
  const nFrame = 5 + Math.floor(Math.random() * 3)
  const frame = Array.from({ length: nFrame }, (_, i) => {
    const a = rot + (i / nFrame) * TAU + rand(-0.22, 0.22)
    const r = radius * rand(1.08, 1.38)
    return { x: Math.cos(a) * r, y: Math.sin(a) * r * 1.06 }
  })

  // 2. raios
  const n = spokeCount ?? 15 + Math.floor(Math.random() * 6)
  const spokes = Array.from({ length: n }, (_, j) => {
    const a = rot + (j / n) * TAU + rand(-0.07, 0.07)
    const dx = Math.cos(a)
    const dy = Math.sin(a)
    return { a, dx, dy, len: rayToFrame(frame, dx, dy) }
  })
  const onSpoke = (j, f) => {
    const s = spokes[((j % n) + n) % n]
    return { x: s.dx * s.len * f, y: s.dy * s.len * f, f }
  }

  // 3. cubo central (pequena espiral apertada)
  const hubPts = []
  const hubSteps = Math.round(n * 2.2)
  for (let k = 0; k <= hubSteps; k += 1) {
    hubPts.push(onSpoke(k, 0.035 + 0.09 * (k / hubSteps) + rand(-0.006, 0.006)))
  }

  // 4. espiral de captura (de fora para dentro), espaçamento irregular
  const spiral = []
  const total = turns * n
  const outer = 0.93
  const inner = 0.25
  let f = outer
  const dir = Math.random() < 0.5 ? 1 : -1
  for (let k = 0; k <= total; k += 1) {
    // espaçamento um pouco maior por fora, com pequenas falhas
    const base = (outer - inner) / total
    f = Math.max(inner, f - base * rand(0.75, 1.3) * (1.1 - 0.2 * (k / total)))
    spiral.push(onSpoke(dir * k, f + rand(-0.01, 0.01)))
  }

  // linha do tempo da construção (ms) — a aranha anda em velocidade constante
  const RADIUS_TIME = Math.max(70, 1600 / n / (speed / 0.2))
  const timeline = []
  let t = RADIUS_TIME * n + 250 // raios + pequena pausa no centro
  const radiiEnd = t
  const pushPath = (pts, kind, pause) => {
    for (let i = 1; i < pts.length; i += 1) {
      const a = pts[i - 1]
      const b = pts[i]
      const len = Math.hypot(b.x - a.x, b.y - a.y)
      const dur = len / speed
      timeline.push({ kind, i, a, b, t0: t, t1: t + dur })
      t += dur + pause
    }
  }
  const center = { x: 0, y: 0, f: 0 }
  pushPath([center, ...hubPts], 'hub', 18)
  const hubEnd = t
  // sai pelo raio até o início da espiral, tece para dentro e volta ao centro
  pushPath([hubPts[hubPts.length - 1], onSpoke(0, outer)], 'move', 0)
  const spiralStart = t
  pushPath(spiral, 'spiral', 55)
  pushPath([spiral[spiral.length - 1], center], 'move', 0)

  return {
    hub,
    radius,
    frame,
    spokes,
    hubPts,
    spiral,
    timeline,
    radiusTime: RADIUS_TIME,
    radiiEnd,
    hubEnd,
    spiralStart,
    duration: t + 200,
    phase: Math.random() * TAU,
  }
}

// Mapeia um ponto local para o mundo, com vento (mais forte longe do centro)
// e o deslocamento opcional do centro (cursor preso puxando a teia).
const mapper = (orb, now, offset) => {
  const wx = Math.sin(now / 1700 + orb.phase) * 2.2
  const wy = Math.cos(now / 2300 + orb.phase) * 1.4
  return (p) => {
    const f = p.f ?? 1
    return {
      x: orb.hub.x + p.x + wx * f + offset.x * (1 - f),
      y: orb.hub.y + p.y + wy * f + offset.y * (1 - f),
    }
  }
}

const ZERO = { x: 0, y: 0 }

/**
 * Desenha a teia até `progress` (0–1 da construção) e devolve
 * { x, y } — onde a aranha está naquele instante.
 */
export function drawOrb(ctx, orb, progress, alpha, now, offset = ZERO) {
  const at = mapper(orb, now, offset)
  const e = progress * orb.duration
  const hubW = at({ x: 0, y: 0, f: 0 })
  const n = orb.spokes.length
  let head = hubW

  // moldura (aparece junto com os primeiros raios)
  const frameA = clamp01(e / (orb.radiiEnd * 0.5))
  if (frameA > 0) {
    ctx.strokeStyle = `rgba(190, 200, 225, ${0.38 * alpha * frameA})`
    ctx.lineWidth = 0.9
    ctx.beginPath()
    orb.frame.forEach((p, i) => {
      const w = at({ ...p, f: 1 })
      if (i === 0) ctx.moveTo(w.x, w.y)
      else ctx.lineTo(w.x, w.y)
    })
    ctx.closePath()
    ctx.stroke()
  }

  // raios: um por vez, "disparados" do centro
  ctx.strokeStyle = `rgba(205, 212, 235, ${0.42 * alpha})`
  ctx.lineWidth = 0.8
  ctx.beginPath()
  orb.spokes.forEach((s, j) => {
    const g = clamp01((e - j * orb.radiusTime) / orb.radiusTime)
    if (g <= 0) return
    const end = at({ x: s.dx * s.len * g, y: s.dy * s.len * g, f: g })
    ctx.moveTo(hubW.x, hubW.y)
    ctx.lineTo(end.x, end.y)
    if (g < 1) {
      // aranha no centro, virada para o raio que está lançando
      head = at({ x: s.dx * 5, y: s.dy * 5, f: 0.05 })
    }
  })
  ctx.stroke()

  // cubo + espiral, desenhados atrás da aranha
  const drawPath = (pts, kind, width, color) => {
    let last = -1
    let partial = null
    for (const seg of orb.timeline) {
      if (seg.kind !== kind) continue
      if (e >= seg.t1) last = seg.i
      else if (e >= seg.t0) {
        const p = clamp01((e - seg.t0) / (seg.t1 - seg.t0))
        partial = { a: seg.a, b: seg.b, p }
        break
      }
    }
    if (last < 0 && !partial) return
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.beginPath()
    let prev = at(pts[0])
    ctx.moveTo(prev.x, prev.y)
    for (let i = 1; i <= last; i += 1) {
      const cur = at(pts[i])
      // o fio cede entre os raios (gravidade + leve curva para fora)
      const len = Math.hypot(cur.x - prev.x, cur.y - prev.y)
      const mx = (prev.x + cur.x) / 2 - hubW.x
      const my = (prev.y + cur.y) / 2 - hubW.y
      const ml = Math.hypot(mx, my) || 1
      ctx.quadraticCurveTo(
        (prev.x + cur.x) / 2 + (mx / ml) * len * 0.07,
        (prev.y + cur.y) / 2 + (my / ml) * len * 0.07 + len * 0.06,
        cur.x,
        cur.y,
      )
      prev = cur
    }
    if (partial) {
      const a = at(partial.a)
      const b = at(partial.b)
      ctx.lineTo(a.x + (b.x - a.x) * partial.p, a.y + (b.y - a.y) * partial.p)
    }
    ctx.stroke()
  }
  if (e > orb.radiiEnd) drawPath([{ x: 0, y: 0, f: 0 }, ...orb.hubPts], 'hub', 0.7, `rgba(215, 222, 242, ${0.4 * alpha})`)
  if (e > orb.spiralStart) drawPath(orb.spiral, 'spiral', 0.6, `rgba(222, 228, 246, ${0.34 * alpha})`)

  // posição da aranha ao longo do caminho de construção
  if (e >= orb.radiiEnd) {
    for (const seg of orb.timeline) {
      if (e < seg.t0) {
        head = at(seg.a) // pausa no ponto (prendendo o fio)
        break
      }
      if (e <= seg.t1) {
        const p = (e - seg.t0) / (seg.t1 - seg.t0)
        const a = at(seg.a)
        const b = at(seg.b)
        head = { x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p }
        break
      }
      head = at(seg.b)
    }
  }

  // gotas de orvalho na teia pronta
  if (progress >= 1) {
    ctx.fillStyle = `rgba(190, 215, 255, ${0.5 * alpha})`
    for (let i = 2; i < orb.spiral.length; i += 5) {
      const d = at(orb.spiral[i])
      ctx.beginPath()
      ctx.arc(d.x, d.y, 1, 0, TAU)
      ctx.fill()
    }
  }
  return head
}

/** Todos os fios da teia (em coordenadas de tela) — usado para despedaçá-la. */
export function orbSegments(orb, offset = ZERO) {
  const at = mapper(orb, 0, offset)
  const segs = []
  const hubW = at({ x: 0, y: 0, f: 0 })
  for (const s of orb.spokes) {
    const end = at({ x: s.dx * s.len, y: s.dy * s.len, f: 1 })
    segs.push([hubW.x, hubW.y, end.x, end.y])
  }
  const chain = (pts) => {
    for (let i = 1; i < pts.length; i += 1) {
      const a = at(pts[i - 1])
      const b = at(pts[i])
      segs.push([a.x, a.y, b.x, b.y])
    }
  }
  chain(orb.spiral)
  chain(orb.hubPts)
  const fr = orb.frame.map((p) => ({ ...p, f: 1 }))
  chain([...fr, fr[0]])
  return segs
}
