// Teia orbicular "de verdade", tecida em volta do cursor capturado.
// O que a deixa orgânica (em vez de um desenho geométrico):
//  1. fios-âncora longos que cedem com a gravidade, presos aos cantos da moldura,
//     com um fio de reforço em "Y" perto de cada canto;
//  2. moldura feita de fios curvos (cada lado cede um pouco), mais funda embaixo:
//     teias reais são assimétricas, com o centro acima do meio;
//  3. raios levemente curvos, com ângulos irregulares; alguns bifurcam perto da moldura;
//  4. centro emaranhado (fios cruzados ao acaso), e não uma espiral perfeita;
//  5. espiral de captura de fora para dentro, cedendo entre os raios,
//     com espaçamento irregular e algumas falhas;
//  6. gotas de orvalho de tamanhos variados e um brilho que corre pelos fios
//     conforme o ângulo em relação à luz;
//  7. vento suave e vibração que cresce quando a presa (o cursor) se debate.
// A aranha percorre o caminho real da construção (raios → centro → espiral).

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

const ORIGIN = { x: 0, y: 0 }

// controle da curva de um fio frouxo entre a e b: cede para baixo (gravidade)
// e um pouco para fora em relação ao centro da teia
const sagControl = (a, b, hub, sag, outward = 0) => {
  const len = Math.hypot(b.x - a.x, b.y - a.y)
  const mx = (a.x + b.x) / 2
  const my = (a.y + b.y) / 2
  const ox = mx - hub.x
  const oy = my - hub.y
  const ol = Math.hypot(ox, oy) || 1
  return { x: mx + (ox / ol) * len * outward, y: my + (oy / ol) * len * outward + len * sag }
}
const quadAt = (a, c, b, t) => {
  const k = 1 - t
  return { x: k * k * a.x + 2 * k * t * c.x + t * t * b.x, y: k * k * a.y + 2 * k * t * c.y + t * t * b.y }
}

export function makeOrb(hub, radius, { turns = 5, speed = 0.2, spokeCount, anchors = true } = {}) {
  const rot = Math.random() * TAU

  // 1. moldura: 5–7 cantos, mais longe embaixo (sin > 0 = para baixo na tela)
  const nFrame = 5 + Math.floor(Math.random() * 3)
  const frame = Array.from({ length: nFrame }, (_, i) => {
    const a = rot + (i / nFrame) * TAU + rand(-0.25, 0.25)
    const r = radius * rand(1.06, 1.32) * (1 + 0.16 * Math.sin(a))
    return { x: Math.cos(a) * r, y: Math.sin(a) * r, f: 1, a }
  })
  // cada lado da moldura cede um pouco (fio frouxo); os raios terminam na curva
  const frameSag = frame.map(() => rand(0.025, 0.06))
  const frameCurve = []
  frame.forEach((a, i) => {
    const b = frame[(i + 1) % nFrame]
    const c = sagControl(a, b, ORIGIN, frameSag[i], 0.02)
    for (let k = 0; k < 10; k += 1) frameCurve.push(quadAt(a, c, b, k / 10))
  })

  // 2. raios: ângulos irregulares, leve curvatura, alguns bifurcam
  const n = spokeCount ?? 15 + Math.floor(Math.random() * 6)
  const spokes = Array.from({ length: n }, (_, j) => {
    const a = rot + (j / n) * TAU + rand(-0.11, 0.11)
    const dx = Math.cos(a)
    const dy = Math.sin(a)
    const len = rayToFrame(frameCurve, dx, dy)
    const bend = rand(-0.03, 0.03) // desvio lateral no meio do raio
    const c = { x: (dx * len) / 2 - dy * len * bend, y: (dy * len) / 2 + dx * len * bend }
    let fork = null
    if (Math.random() < 0.3) {
      const fa = a + (Math.random() < 0.5 ? -1 : 1) * rand(0.1, 0.2)
      const fl = rayToFrame(frameCurve, Math.cos(fa), Math.sin(fa))
      fork = { from: rand(0.68, 0.82), x: Math.cos(fa) * fl, y: Math.sin(fa) * fl }
    }
    return { a, dx, dy, len, c, end: { x: dx * len, y: dy * len }, fork }
  })
  // ponto do raio j na fração f do comprimento (sobre a curva do raio)
  const onSpoke = (j, f) => {
    const s = spokes[((j % n) + n) % n]
    const k = 2 * f * (1 - f)
    return { x: k * s.c.x + f * f * s.end.x, y: k * s.c.y + f * f * s.end.y, f, a: s.a }
  }

  // 3. centro emaranhado: caminho aleatório de fios curtos que se cruzam
  const hubPts = []
  const hubSteps = Math.round(n * 1.5)
  for (let k = 0; k <= hubSteps; k += 1) {
    const a = Math.random() * TAU
    const r = radius * rand(0.03, 0.13)
    hubPts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, f: r / radius, a })
  }

  // 4. espiral de captura (de fora para dentro): mais apertada embaixo, com falhas
  const spiral = []
  const total = turns * n
  const outer = 0.94
  const inner = 0.24
  let f = outer
  const dir = Math.random() < 0.5 ? 1 : -1
  for (let k = 0; k <= total; k += 1) {
    const s = spokes[((dir * k) % n + n) % n]
    const base = (outer - inner) / total
    const below = 0.85 + 0.3 * (1 - Math.sin(s.a)) * 0.5 // passo menor na parte de baixo
    f = Math.max(inner, f - base * rand(0.7, 1.35) * below)
    const p = onSpoke(dir * k, clamp01(f + rand(-0.012, 0.012)))
    p.gap = k > 0 && Math.random() < 0.04 // fio que se rompeu
    spiral.push(p)
  }

  // gotas de orvalho espalhadas pela espiral
  const drops = []
  for (let i = 1; i < spiral.length; i += 1) {
    if (spiral[i].gap || Math.random() > 0.3) continue
    drops.push({ i, t: rand(0.2, 0.8), r: rand(0.7, 1.9) })
  }

  // 5. fios-âncora: saem dos cantos da moldura para longe, cedendo com a gravidade
  const tethers = anchors
    ? frame.map((p, i) => {
        const out = Math.atan2(p.y, p.x) + rand(-0.25, 0.25)
        const reach = radius * rand(1.4, 2.6)
        const to = { x: p.x + Math.cos(out) * reach, y: p.y + Math.sin(out) * reach * 0.9 }
        const nb = frame[(i + 1) % frame.length]
        return {
          from: p,
          to,
          sag: rand(0.06, 0.14),
          // reforço em "Y": do fio-âncora até o meio do lado vizinho
          brace: { t: rand(0.18, 0.3), to: { x: (p.x + nb.x) / 2, y: (p.y + nb.y) / 2 } },
        }
      })
    : []

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
  pushPath([center, ...hubPts], 'hub', 14)
  const hubEnd = t
  pushPath([hubPts[hubPts.length - 1], onSpoke(0, outer)], 'move', 0)
  const spiralStart = t
  pushPath(spiral, 'spiral', 45)
  pushPath([spiral[spiral.length - 1], center], 'move', 0)

  return {
    hub,
    radius,
    frame,
    frameSag,
    spokes,
    hubPts,
    spiral,
    drops,
    tethers,
    timeline,
    radiusTime: RADIUS_TIME,
    radiiEnd,
    hubEnd,
    spiralStart,
    duration: t + 200,
    phase: Math.random() * TAU,
  }
}

// Ponto local → tela. Vento (mais forte longe do centro), ondulação que corre
// pela teia, vibração quando a presa se debate e o centro puxado pelo cursor.
const mapper = (orb, now, offset, shake) => {
  const wx = Math.sin(now / 1700 + orb.phase) * 2.4
  const wy = Math.cos(now / 2300 + orb.phase) * 1.6
  const wave = 1.1 + shake * 3.5
  const speed = 520 - shake * 330
  return (p) => {
    const f = p.f ?? 1
    const a = p.a ?? 0
    const ripple = Math.sin(now / speed + a * 3 + f * 5 + orb.phase) * wave * f
    const jitter = shake > 0.05 ? (Math.random() - 0.5) * shake * 1.6 * f : 0
    return {
      x: orb.hub.x + p.x + (wx + Math.cos(a) * ripple + jitter) * f + offset.x * (1 - f),
      y: orb.hub.y + p.y + (wy + Math.sin(a) * ripple + jitter) * f + offset.y * (1 - f),
    }
  }
}

const ZERO = { x: 0, y: 0 }

/**
 * Desenha a teia até `progress` (0–1 da construção) e devolve { x, y }:
 * onde a aranha está naquele instante. `shake` (0–1) = presa se debatendo.
 */
export function drawOrb(ctx, orb, progress, alpha, now, offset = ZERO, shake = 0) {
  const at = mapper(orb, now, offset, shake)
  const e = progress * orb.duration
  const hubW = at({ x: 0, y: 0, f: 0 })
  let head = hubW

  // brilho da seda: o fio reflete mais quando fica perpendicular à luz
  const light = now / 2600 + orb.phase
  const silk = (ax, ay, bx, by, base, width, cx, cy) => {
    const g = Math.abs(Math.sin(Math.atan2(by - ay, bx - ax) - light))
    const glint = g ** 8
    ctx.strokeStyle = `rgba(${226 + glint * 20}, ${231 + glint * 16}, 247, ${alpha * base * (0.72 + glint * 0.45)})`
    ctx.lineWidth = width + glint * 0.15
    ctx.beginPath()
    ctx.moveTo(ax, ay)
    if (cx === undefined) ctx.lineTo(bx, by)
    else ctx.quadraticCurveTo(cx, cy, bx, by)
    ctx.stroke()
  }

  // fios-âncora e moldura aparecem primeiro (fios de ponte)
  const frameA = clamp01(e / (orb.radiiEnd * 0.45))
  if (frameA > 0) {
    for (const th of orb.tethers) {
      const a = at(th.from)
      const b = at({ ...th.to, f: 1, a: th.from.a })
      const c = sagControl(a, b, hubW, th.sag)
      const end = quadAt(a, c, b, frameA)
      const ctl = { x: a.x + (c.x - a.x) * frameA, y: a.y + (c.y - a.y) * frameA }
      silk(a.x, a.y, end.x, end.y, 0.42, 1.05, ctl.x, ctl.y)
      if (frameA >= 1) {
        const p = quadAt(a, c, b, th.brace.t)
        const q = at(th.brace.to)
        const bc = sagControl(p, q, hubW, 0.05)
        silk(p.x, p.y, q.x, q.y, 0.32, 0.6, bc.x, bc.y)
      }
    }
    const nF = orb.frame.length
    const shown = frameA * nF
    for (let i = 0; i < nF; i += 1) {
      const part = clamp01(shown - i)
      if (part <= 0) break
      const a = at(orb.frame[i])
      const b = at(orb.frame[(i + 1) % nF])
      const c = sagControl(a, b, hubW, orb.frameSag[i], 0.02)
      const end = quadAt(a, c, b, part)
      const ctl = { x: a.x + (c.x - a.x) * part, y: a.y + (c.y - a.y) * part }
      silk(a.x, a.y, end.x, end.y, 0.46, 0.95, ctl.x, ctl.y)
    }
  }

  // raios: um por vez, "disparados" do centro, levemente curvos
  orb.spokes.forEach((s, j) => {
    const g = clamp01((e - j * orb.radiusTime) / orb.radiusTime)
    if (g <= 0) return
    // trecho [0, g] da curva do raio (divisão de De Casteljau)
    const k = 2 * g * (1 - g)
    const end = at({ x: k * s.c.x + g * g * s.end.x, y: k * s.c.y + g * g * s.end.y, f: g, a: s.a })
    const ctl = at({ x: s.c.x * g, y: s.c.y * g, f: g / 2, a: s.a })
    silk(hubW.x, hubW.y, end.x, end.y, 0.5, 0.8, ctl.x, ctl.y)
    if (g >= 1 && s.fork) {
      const ff = s.fork.from
      const kf = 2 * ff * (1 - ff)
      const p = at({ x: kf * s.c.x + ff * ff * s.end.x, y: kf * s.c.y + ff * ff * s.end.y, f: ff, a: s.a })
      const q = at({ x: s.fork.x, y: s.fork.y, f: 1, a: s.a })
      silk(p.x, p.y, q.x, q.y, 0.42, 0.65)
    }
    if (g < 1) head = at({ x: s.dx * 5, y: s.dy * 5, f: 0.05, a: s.a })
  })

  // centro emaranhado e espiral, desenhados atrás da aranha
  const drawPath = (pts, kind, base, width, sag) => {
    let last = -1
    let partial = null
    for (const seg of orb.timeline) {
      if (seg.kind !== kind) continue
      if (e >= seg.t1) last = seg.i
      else if (e >= seg.t0) {
        partial = { a: seg.a, b: seg.b, p: clamp01((e - seg.t0) / (seg.t1 - seg.t0)) }
        break
      }
    }
    if (last < 0 && !partial) return
    let prev = at(pts[0])
    for (let i = 1; i <= last; i += 1) {
      const cur = at(pts[i])
      if (!pts[i].gap) {
        const c = sagControl(prev, cur, hubW, sag, sag)
        silk(prev.x, prev.y, cur.x, cur.y, base, width, c.x, c.y)
      }
      prev = cur
    }
    if (partial) {
      const a = at(partial.a)
      const b = at(partial.b)
      silk(a.x, a.y, a.x + (b.x - a.x) * partial.p, a.y + (b.y - a.y) * partial.p, base, width)
    }
  }
  if (e > orb.radiiEnd) drawPath([{ x: 0, y: 0, f: 0 }, ...orb.hubPts], 'hub', 0.42, 0.5, 0.02)
  if (e > orb.spiralStart) drawPath(orb.spiral, 'spiral', 0.4, 0.55, 0.07)

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

  // orvalho: aparece na teia pronta; cada gota tem um ponto de luz
  const dew = clamp01((e - orb.duration * 0.92) / (orb.duration * 0.08))
  if (dew > 0) {
    for (const d of orb.drops) {
      const a = at(orb.spiral[d.i - 1])
      const b = at(orb.spiral[d.i])
      const p = quadAt(a, sagControl(a, b, hubW, 0.07, 0.07), b, d.t)
      ctx.fillStyle = `rgba(200, 220, 255, ${0.42 * alpha * dew})`
      ctx.beginPath()
      ctx.arc(p.x, p.y, d.r, 0, TAU)
      ctx.fill()
      ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * alpha * dew})`
      ctx.beginPath()
      ctx.arc(p.x - d.r * 0.35, p.y - d.r * 0.35, Math.max(0.35, d.r * 0.32), 0, TAU)
      ctx.fill()
    }
  }
  return head
}

/** Todos os fios da teia (em coordenadas de tela) — usado para despedaçá-la. */
export function orbSegments(orb, offset = ZERO) {
  const at = mapper(orb, 0, offset, 0)
  const segs = []
  const hubW = at({ x: 0, y: 0, f: 0 })
  for (const s of orb.spokes) {
    // raio quebrado em dois pedaços (fica mais natural ao despedaçar)
    const mid = at({ x: s.c.x / 2 + s.end.x / 4, y: s.c.y / 2 + s.end.y / 4, f: 0.5, a: s.a })
    const end = at({ ...s.end, f: 1, a: s.a })
    segs.push([hubW.x, hubW.y, mid.x, mid.y], [mid.x, mid.y, end.x, end.y])
  }
  const chain = (pts) => {
    for (let i = 1; i < pts.length; i += 1) {
      if (pts[i].gap) continue
      const a = at(pts[i - 1])
      const b = at(pts[i])
      segs.push([a.x, a.y, b.x, b.y])
    }
  }
  chain(orb.spiral)
  chain(orb.hubPts)
  chain([...orb.frame, orb.frame[0]])
  for (const th of orb.tethers) {
    const a = at(th.from)
    const b = at({ ...th.to, f: 1, a: th.from.a })
    const m = quadAt(a, sagControl(a, b, hubW, th.sag), b, 0.5)
    segs.push([a.x, a.y, m.x, m.y], [m.x, m.y, b.x, b.y])
  }
  return segs
}
