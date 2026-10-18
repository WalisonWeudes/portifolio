// Aranha procedural desenhada em canvas (vista de cima).
//
// - Corpo: prosoma (cefalotórax) + opistossoma (abdômen) com gradientes, pelos,
//   padrão dorsal, quelíceras, pedipalpos e 8 olhos com brilho.
// - Pernas: 8 pernas de 3 segmentos (fêmur, tíbia/metatarso, tarso) resolvidas
//   por cinemática inversa a partir de pés "plantados" no chão.
// - Marcha: cada pé só levanta quando fica longe da posição ideal, e nunca junto
//   com os vizinhos (marcha alternada em tetrápode, como aranhas reais).

const TAU = Math.PI * 2
const DEG = Math.PI / 180

// Por perna (da frente para trás): ângulo do quadril, ângulo/raio do pé em repouso,
// comprimento do fêmur e da parte distal.
// Proporções de uma aranha-de-teia comum: pernas ~2x o comprimento do corpo,
// pares I e IV mais longos; pés em repouso a ~80% do alcance (pernas quase esticadas).
const LEGS = [
  { hip: 40, foot: 30, femur: 25, distal: 37 },
  { hip: 68, foot: 68, femur: 21, distal: 30 },
  { hip: 104, foot: 118, femur: 19, distal: 26 },
  { hip: 138, foot: 154, femur: 24, distal: 35 },
].map((leg) => ({ ...leg, reach: (leg.femur + leg.distal) * 0.8 }))

const lerp = (a, b, t) => a + (b - a) * t
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

// gerador pseudoaleatório estável por aranha (pelos sempre no mesmo lugar)
const seeded = (seed) => () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

export function createRig(x, y, heading, scale = 1, seed = 1) {
  const random = seeded(Math.floor(seed * 9973) + 7)
  const legs = []
  for (const side of [-1, 1]) {
    LEGS.forEach((spec, k) => {
      legs.push({
        side,
        k,
        spec,
        foot: { x, y },
        from: { x, y },
        stepping: false,
        t0: 0,
        dur: 120,
        lift: 0,
        // pelos (setas) ao longo da perna: posição relativa + lado + comprimento
        hairs: Array.from({ length: 9 }, () => ({
          seg: random() < 0.45 ? 0 : 1,
          at: 0.15 + random() * 0.75,
          dir: random() < 0.5 ? -1 : 1,
          len: 0.8 + random() * 1.2,
        })),
      })
    })
  }
  const rig = {
    x,
    y,
    heading,
    scale,
    legs,
    vx: 0,
    vy: 0,
    lastX: x,
    lastY: y,
    breath: random() * TAU,
    bodyHairs: Array.from({ length: 26 }, () => ({ a: random() * TAU, len: 1.2 + random() * 1.6 })),
    tone: 0.85 + random() * 0.3,
    idleSince: 0,
  }
  snapFeet(rig)
  return rig
}

/* ---------- geometria local ---------- */

const toWorld = (rig, lx, ly) => {
  const c = Math.cos(rig.heading)
  const s = Math.sin(rig.heading)
  const S = rig.scale
  return { x: rig.x + (lx * c - ly * s) * S, y: rig.y + (lx * s + ly * c) * S }
}

const hipOf = (rig, leg) => {
  const a = leg.spec.hip * DEG
  return toWorld(rig, 2 + Math.cos(a) * 7, leg.side * Math.sin(a) * 6)
}

const restOf = (rig, leg) => {
  const a = leg.spec.foot * DEG
  return toWorld(rig, 2 + Math.cos(a) * leg.spec.reach, leg.side * Math.sin(a) * leg.spec.reach)
}

const snapFeet = (rig) => {
  for (const leg of rig.legs) {
    const r = restOf(rig, leg)
    leg.foot = { x: r.x, y: r.y }
    leg.stepping = false
    leg.lift = 0
  }
}

/* ---------- marcha ---------- */

const neighbours = (rig, leg) =>
  rig.legs.filter(
    (o) => o !== leg && ((o.side === leg.side && Math.abs(o.k - leg.k) === 1) || (o.side !== leg.side && o.k === leg.k)),
  )

export function updateRig(rig, x, y, heading, dt, clock) {
  const jump = Math.hypot(x - rig.x, y - rig.y)
  rig.x = x
  rig.y = y
  rig.heading = heading
  if (jump > 80 * rig.scale) snapFeet(rig) // teleporte (nascimento, troca de cena)

  // velocidade suavizada (px/ms)
  const k = Math.min(1, dt / 60)
  rig.vx = lerp(rig.vx, (x - rig.lastX) / Math.max(dt, 1), k)
  rig.vy = lerp(rig.vy, (y - rig.lastY) / Math.max(dt, 1), k)
  rig.lastX = x
  rig.lastY = y
  const speed = Math.hypot(rig.vx, rig.vy)
  if (speed > 0.01) rig.idleSince = clock

  const S = rig.scale
  const dur = clamp(150 - speed * 160, 60, 150)
  const idle = clock - rig.idleSince > 350
  const threshold = (idle ? 5 : 14) * S

  // pés em passo: avançam em arco até o alvo (que acompanha o corpo)
  for (const leg of rig.legs) {
    if (!leg.stepping) continue
    const p = clamp((clock - leg.t0) / leg.dur, 0, 1)
    const target = restOf(rig, leg)
    const lead = leg.dur * 0.55
    const to = { x: target.x + rig.vx * lead, y: target.y + rig.vy * lead }
    const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2
    leg.foot = { x: lerp(leg.from.x, to.x, e), y: lerp(leg.from.y, to.y, e) }
    leg.lift = Math.sin(Math.PI * p)
    if (p >= 1) {
      leg.stepping = false
      leg.lift = 0
    }
  }

  // decide quais pés levantam: maior erro primeiro, sem vizinhos no ar
  const candidates = rig.legs
    .filter((leg) => !leg.stepping)
    .map((leg) => {
      const r = restOf(rig, leg)
      return { leg, err: Math.hypot(leg.foot.x - r.x, leg.foot.y - r.y) }
    })
    .filter((c) => c.err > threshold)
    .sort((a, b) => b.err - a.err)

  let inAir = rig.legs.filter((l) => l.stepping).length
  for (const { leg, err } of candidates) {
    // pé quase no limite do alcance: passo de emergência, ignorando a regra dos vizinhos
    const hip = hipOf(rig, leg)
    const reachMax = (leg.spec.femur + leg.spec.distal) * S
    const urgent = Math.hypot(leg.foot.x - hip.x, leg.foot.y - hip.y) > reachMax * 0.92
    if (!urgent) {
      if (inAir >= 4) break
      if (neighbours(rig, leg).some((n) => n.stepping)) continue
    }
    leg.stepping = true
    leg.t0 = clock
    leg.dur = dur * (urgent ? 0.6 : err > threshold * 3 ? 0.8 : 1)
    leg.from = { ...leg.foot }
    inAir += 1
  }

  // nunca deixar uma perna esticar além do comprimento real: o pé escorrega junto
  for (const leg of rig.legs) {
    const hip = hipOf(rig, leg)
    const maxD = (leg.spec.femur + leg.spec.distal) * S * 0.97
    const dx = leg.foot.x - hip.x
    const dy = leg.foot.y - hip.y
    const d = Math.hypot(dx, dy)
    if (d > maxD) {
      leg.foot = { x: hip.x + (dx / d) * maxD, y: hip.y + (dy / d) * maxD }
      if (leg.stepping) leg.from = { ...leg.foot }
    }
  }
}

/* ---------- desenho ---------- */

// segmento cônico (largura w1 → w2) preenchido
const taper = (ctx, ax, ay, bx, by, w1, w2) => {
  const dx = bx - ax
  const dy = by - ay
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len
  ctx.beginPath()
  ctx.moveTo(ax + nx * w1, ay + ny * w1)
  ctx.lineTo(bx + nx * w2, by + ny * w2)
  ctx.lineTo(bx - nx * w2, by - ny * w2)
  ctx.lineTo(ax - nx * w1, ay - ny * w1)
  ctx.closePath()
  ctx.moveTo(bx + w2, by)
  ctx.arc(bx, by, w2, 0, TAU)
  ctx.moveTo(ax + w1, ay)
  ctx.arc(ax, ay, w1, 0, TAU)
  ctx.fill()
}

// IK de 2 ossos: joelho sempre para fora do eixo do corpo
const solveKnee = (rig, hip, foot, l1, l2, side) => {
  const dx = foot.x - hip.x
  const dy = foot.y - hip.y
  const d = clamp(Math.hypot(dx, dy), Math.abs(l1 - l2) * 1.05 + 0.1, (l1 + l2) * 0.985)
  const base = Math.atan2(dy, dx)
  const off = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1))
  const a1 = { x: hip.x + Math.cos(base + off) * l1, y: hip.y + Math.sin(base + off) * l1 }
  const a2 = { x: hip.x + Math.cos(base - off) * l1, y: hip.y + Math.sin(base - off) * l1 }
  // lado "de fora" = mais longe do eixo central do corpo
  const rx = -Math.sin(rig.heading)
  const ry = Math.cos(rig.heading)
  const lat = (p) => ((p.x - rig.x) * rx + (p.y - rig.y) * ry) * side
  return lat(a1) > lat(a2) ? a1 : a2
}

const legGeometry = (rig, leg) => {
  const S = rig.scale
  const hip = hipOf(rig, leg)
  const l1 = leg.spec.femur * S
  const l2 = leg.spec.distal * S
  // pé levantado: recua um pouco para dentro (perspectiva de cima)
  const foot = leg.lift
    ? {
        x: lerp(leg.foot.x, hip.x, leg.lift * 0.12),
        y: lerp(leg.foot.y, hip.y, leg.lift * 0.12),
      }
    : leg.foot
  const knee = solveKnee(rig, hip, foot, l1, l2 * (1 - leg.lift * 0.05), leg.side)
  // articulação intermediária (tíbia → metatarso), levemente para fora
  const mx = (knee.x + foot.x) / 2
  const my = (knee.y + foot.y) / 2
  const ox = mx - hip.x
  const oy = my - hip.y
  const ol = Math.hypot(ox, oy) || 1
  const bend = 2.2 * S
  const mid = { x: mx + (ox / ol) * bend, y: my + (oy / ol) * bend }
  // tarso: pequeno prolongamento após o pé
  const fx = foot.x - mid.x
  const fy = foot.y - mid.y
  const fl = Math.hypot(fx, fy) || 1
  const tip = { x: foot.x + (fx / fl) * 4 * S, y: foot.y + (fy / fl) * 4 * S }
  return { hip, knee, mid, foot, tip }
}

const drawLeg = (ctx, rig, leg, palette, tint) => {
  const S = rig.scale
  const g = legGeometry(rig, leg)
  const w = S * (leg.k === 0 || leg.k === 3 ? 1.08 : 1)

  ctx.fillStyle = tint || palette.leg
  taper(ctx, g.hip.x, g.hip.y, g.knee.x, g.knee.y, 1.75 * w, 1.45 * w)
  taper(ctx, g.knee.x, g.knee.y, g.mid.x, g.mid.y, 1.3 * w, 0.95 * w)
  taper(ctx, g.mid.x, g.mid.y, g.foot.x, g.foot.y, 0.85 * w, 0.55 * w)
  ctx.fillStyle = tint || palette.tarsus
  taper(ctx, g.foot.x, g.foot.y, g.tip.x, g.tip.y, 0.55 * w, 0.25 * w)
  if (tint) return

  // anéis claros nas articulações (bandas típicas de pernas de aranha)
  ctx.fillStyle = palette.band
  for (const p of [g.knee, g.mid]) {
    ctx.beginPath()
    ctx.arc(p.x, p.y, 1.1 * w, 0, TAU)
    ctx.fill()
  }
  // brilho ao longo do fêmur
  ctx.strokeStyle = palette.sheen
  ctx.lineWidth = 0.7 * S
  ctx.beginPath()
  ctx.moveTo(lerp(g.hip.x, g.knee.x, 0.15), lerp(g.hip.y, g.knee.y, 0.15) - 0.6 * S)
  ctx.lineTo(lerp(g.hip.x, g.knee.x, 0.8), lerp(g.hip.y, g.knee.y, 0.8) - 0.6 * S)
  ctx.stroke()

  // pelos (setas)
  ctx.strokeStyle = palette.hair
  ctx.lineWidth = 0.5 * S
  ctx.beginPath()
  for (const h of leg.hairs) {
    const a = h.seg === 0 ? g.hip : g.knee
    const b = h.seg === 0 ? g.knee : g.foot
    const px = lerp(a.x, b.x, h.at)
    const py = lerp(a.y, b.y, h.at)
    const dx = b.x - a.x
    const dy = b.y - a.y
    const l = Math.hypot(dx, dy) || 1
    const nx = (-dy / l) * h.dir
    const ny = (dx / l) * h.dir
    const len = h.len * S
    ctx.moveTo(px + nx * 1.2 * S, py + ny * 1.2 * S)
    ctx.lineTo(px + nx * (1.2 * S + len) + (dx / l) * len * 0.6, py + ny * (1.2 * S + len) + (dy / l) * len * 0.6)
  }
  ctx.stroke()
}

const ellipse = (ctx, x, y, rx, ry) => {
  ctx.beginPath()
  ctx.ellipse(x, y, rx, ry, 0, 0, TAU)
}

const drawBody = (ctx, rig, palette, tint, clock) => {
  const breath = Math.sin(clock / 700 + rig.breath) * 0.25
  ctx.save()
  ctx.translate(rig.x, rig.y)
  ctx.rotate(rig.heading)
  ctx.scale(rig.scale, rig.scale)

  // pedipalpos
  ctx.fillStyle = tint || palette.leg
  for (const s of [-1, 1]) {
    taper(ctx, 8.5, s * 3.2, 13.5, s * 5.6, 1.2, 1)
    taper(ctx, 13.5, s * 5.6, 17, s * 4.4, 1, 1.25)
  }

  // abdômen
  const ax = -15.5
  if (tint) {
    ctx.fillStyle = tint
    ellipse(ctx, ax, 0, 13.2 + breath, 10.2 + breath)
    ctx.fill()
  } else {
    const gA = ctx.createRadialGradient(ax + 3, -3.5, 1, ax, 0, 14)
    gA.addColorStop(0, palette.abdomenLight)
    gA.addColorStop(0.55, palette.abdomen)
    gA.addColorStop(1, palette.abdomenEdge)
    ctx.fillStyle = gA
    ellipse(ctx, ax, 0, 13.2 + breath, 10.2 + breath)
    ctx.fill()

    // padrão dorsal: faixa cardíaca + chevrons
    ctx.fillStyle = palette.mark
    ctx.beginPath()
    ctx.ellipse(ax + 4, 0, 5.5, 1.6, 0, 0, TAU)
    ctx.fill()
    ctx.strokeStyle = palette.chevron
    ctx.lineWidth = 1.1
    for (let i = 0; i < 4; i += 1) {
      const cx = ax - 1 - i * 3.1
      const wdt = 5.8 - i * 0.9
      ctx.beginPath()
      ctx.moveTo(cx + 1.6, -wdt)
      ctx.lineTo(cx - 0.6, 0)
      ctx.lineTo(cx + 1.6, wdt)
      ctx.stroke()
    }
    // pelos da borda do abdômen
    ctx.strokeStyle = palette.hair
    ctx.lineWidth = 0.45
    ctx.beginPath()
    for (const h of rig.bodyHairs) {
      const ex = ax + Math.cos(h.a) * 12.6
      const ey = Math.sin(h.a) * 9.6
      ctx.moveTo(ex, ey)
      ctx.lineTo(ex + Math.cos(h.a) * h.len, ey + Math.sin(h.a) * h.len)
    }
    ctx.stroke()
    // reflexo especular
    ctx.fillStyle = palette.spec
    ellipse(ctx, ax + 4.5, -4.2, 3.6, 1.6)
    ctx.fill()
  }

  // pedicelo
  ctx.fillStyle = tint || palette.abdomenEdge
  ellipse(ctx, -4.8, 0, 2.2, 2)
  ctx.fill()

  // prosoma (cefalotórax)
  if (tint) {
    ctx.fillStyle = tint
    ellipse(ctx, 2, 0, 8.6, 7.1)
    ctx.fill()
  } else {
    const gP = ctx.createRadialGradient(4, -2.5, 0.5, 2, 0, 9)
    gP.addColorStop(0, palette.prosomaLight)
    gP.addColorStop(0.6, palette.prosoma)
    gP.addColorStop(1, palette.prosomaEdge)
    ctx.fillStyle = gP
    ellipse(ctx, 2, 0, 8.6, 7.1)
    ctx.fill()
    // fóvea e sulcos radiais
    ctx.strokeStyle = palette.groove
    ctx.lineWidth = 0.6
    ctx.beginPath()
    ctx.moveTo(-0.5, 0)
    ctx.lineTo(2.5, 0)
    for (const a of [-60, -25, 25, 60, 120, -120]) {
      ctx.moveTo(1, 0)
      ctx.lineTo(1 + Math.cos(a * DEG) * 5.5, Math.sin(a * DEG) * 4.6)
    }
    ctx.stroke()
  }

  // quelíceras
  ctx.fillStyle = tint || palette.chelicera
  for (const s of [-1, 1]) {
    ellipse(ctx, 10.4, s * 2.1, 2.4, 1.9)
    ctx.fill()
  }

  if (!tint) {
    // 8 olhos: AME grandes à frente, demais em arco
    const eyes = [
      [8.3, 1.25, 1.05],
      [8.3, -1.25, 1.05],
      [7.7, 3.1, 0.72],
      [7.7, -3.1, 0.72],
      [6.6, 1.7, 0.6],
      [6.6, -1.7, 0.6],
      [6.1, 3.8, 0.62],
      [6.1, -3.8, 0.62],
    ]
    for (const [ex, ey, r] of eyes) {
      ctx.fillStyle = palette.eye
      ellipse(ctx, ex, ey, r, r)
      ctx.fill()
      ctx.fillStyle = palette.eyeShine
      ellipse(ctx, ex + r * 0.25, ey - r * 0.3, r * 0.35, r * 0.35)
      ctx.fill()
    }
  }
  ctx.restore()
}

const PALETTE = {
  leg: '#2a201b',
  tarsus: '#161110',
  band: 'rgba(150, 118, 92, 0.3)',
  sheen: 'rgba(255, 235, 215, 0.14)',
  hair: 'rgba(205, 180, 150, 0.3)',
  abdomenLight: '#6b5546',
  abdomen: '#3a2b23',
  abdomenEdge: '#17110e',
  mark: 'rgba(20, 13, 10, 0.75)',
  chevron: 'rgba(196, 160, 125, 0.32)',
  spec: 'rgba(255, 255, 255, 0.16)',
  prosomaLight: '#5f4b3f',
  prosoma: '#33261f',
  prosomaEdge: '#140f0c',
  groove: 'rgba(10, 6, 4, 0.55)',
  chelicera: '#1d1512',
  eye: '#050405',
  eyeShine: 'rgba(255, 255, 255, 0.85)',
}

/** Desenha a aranha. `tint` pinta tudo de uma cor (camadas do glitch). */
export function drawRig(ctx, rig, { clock = 0, tint = null, dx = 0, dy = 0, hover = false } = {}) {
  ctx.save()
  if (dx || dy) ctx.translate(dx, dy)

  if (!tint) {
    // sombra suave no chão (corpo + pernas)
    ctx.save()
    ctx.translate(3 * rig.scale, 5 * rig.scale)
    const sh = ctx.createRadialGradient(rig.x, rig.y, 2, rig.x, rig.y, 26 * rig.scale)
    sh.addColorStop(0, 'rgba(0, 0, 0, 0.42)')
    sh.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = sh
    ctx.beginPath()
    ctx.arc(rig.x, rig.y, 30 * rig.scale, 0, TAU)
    ctx.fill()
    ctx.globalAlpha = 0.22
    for (const leg of rig.legs) drawLeg(ctx, rig, leg, PALETTE, '#000')
    ctx.restore()
  }

  if (hover && !tint) {
    ctx.shadowColor = 'rgba(230, 36, 41, 0.75)'
    ctx.shadowBlur = 12
  }
  for (const leg of rig.legs) drawLeg(ctx, rig, leg, PALETTE, tint)
  drawBody(ctx, rig, PALETTE, tint, clock)
  ctx.restore()
}
