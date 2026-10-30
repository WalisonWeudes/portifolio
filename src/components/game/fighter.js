// Lutador do Spider Rush, desenhado em canvas (vista lateral, virado para a direita;
// o motor espelha para a esquerda). Inspirado no autor: cabelo cacheado com mechas
// verde-azuladas, óculos e camiseta com a aranha vermelha.
//
// Pose = ângulos dos braços + posição dos pés (as pernas se ajustam sozinhas por
// cinemática inversa, então os joelhos dobram quando o corpo abaixa). Armas de duas
// mãos levam a mão de trás até o cabo (grip). Ângulo 0 aponta para baixo, PI/2 para
// a frente, PI para cima. aX1 = ombro (absoluto), aX2 = cotovelo (relativo).
// Cada golpe: postura → preparo → impacto (HIT_AT) → leve exagero → volta.

const TAU = Math.PI * 2
const SEG = { T: 34, UA: 16, FA: 15, TH: 22, SH: 22, HEAD: 11 }
const HIP_H = 40 // altura do quadril com as pernas quase esticadas
export const HIT_AT = 0.42
const KEYS = ['x', 'y', 'hop', 'lean', 'aF1', 'aF2', 'aB1', 'aB2', 'fFx', 'fFy', 'fBx', 'fBy', 'w', 'wB', 'grip']

const BASE = {
  x: 0, y: 0, hop: 0, lean: 0.1, aF1: 0.7, aF2: 1.9, aB1: 0.4, aB2: 2.1,
  fFx: 13, fFy: 0, fBx: -15, fBy: 0, w: 0, wB: 0, grip: 0,
}
const LUNGE = { fFx: 28, fBx: -20, y: 4 }

// onde a mão de trás segura a arma (distância ao longo da arma a partir da mão da frente)
const GRIP = { slash: -8, smash: -10, spin: -28, shoot: -9 }

// postura de combate de cada arma
export const IDLE = {
  // guarda de boxe: punhos perto do queixo
  punch: { ...BASE, lean: 0.2, y: 4.5, aF1: 0.95, aF2: 2.35, aB1: 0.6, aB2: 2.5, fFx: 17, fBx: -17 },
  // katana com as duas mãos, lâmina apontada para a frente e para cima
  slash: { ...BASE, lean: 0.12, y: 6, aF1: 0.85, aF2: 1.15, w: 0.75, aB1: 0.5, aB2: 1.6, grip: 1, fFx: 22, fBx: -19 },
  // martelo apoiado no ombro
  smash: { ...BASE, lean: 0.02, y: 5, aF1: 0.2, aF2: 2.2, w: 1.6, aB1: 0.3, aB2: 1.9, grip: 1, fFx: 20, fBx: -18 },
  // bastão segurado com as duas mãos, na diagonal
  spin: { ...BASE, lean: 0.16, y: 5.5, aF1: 1.0, aF2: 0.85, w: -0.45, aB1: 0.6, aB2: 1.2, grip: 1, fFx: 21, fBx: -18 },
  // braço estendido mirando, a outra mão apoiando o pulso
  shoot: { ...BASE, lean: 0.06, y: 3.5, aF1: 1.42, aF2: 0.12, aB1: 0.9, aB2: 1.5, grip: 1, fFx: 17, fBx: -17 },
  // agachado, adagas em pegada invertida
  dual: { ...BASE, lean: 0.32, y: 8, aF1: 1.15, aF2: 1.7, w: Math.PI, aB1: 0.75, aB2: 2.1, wB: Math.PI, fFx: 23, fBx: -19 },
}

export const ATTACKS = {
  punch: [
    { trail: 'hF', wind: { aF1: 1.0, aF2: 2.6, x: -2, lean: 0.1 }, hit: { aF1: 1.57, aF2: 0.04, aB1: 0.5, aB2: 2.6, lean: 0.34, x: 8, ...LUNGE } },
    { trail: 'hB', wind: { aB1: 0.4, aB2: 2.7, lean: 0.08 }, hit: { aB1: 1.62, aB2: 0.04, aF1: 0.7, aF2: 2.4, lean: 0.45, x: 10, ...LUNGE } },
    { trail: 'fF', wind: { fFx: 6, fFy: 14, lean: -0.05, aF1: 0.6, aF2: 2.2 }, hit: { fFx: 40, fFy: 34, lean: -0.42, x: -4, aF1: 0.3, aF2: 1.6, aB1: -0.4, aB2: 1.4, fBx: -10 } },
    { trail: 'hF', wind: { lean: 0.3, y: 10, aF1: 0.4, aF2: 1.2 }, hit: { lean: -0.08, y: -3, aF1: 2.7, aF2: 0.3, x: 6, fFx: 18, fBx: -12 } },
  ],
  slash: [
    { trail: 'tF', wind: { aF1: 2.95, aF2: 0.35, w: 0.15, lean: -0.08, y: 2 }, hit: { aF1: 1.2, aF2: 0.05, w: 0.1, lean: 0.4, x: 10, ...LUNGE } },
    { trail: 'tF', wind: { aF1: 0.4, aF2: 1.3, w: 1.6, lean: -0.05 }, hit: { aF1: 1.65, aF2: 0, w: 0, lean: 0.32, x: 10, ...LUNGE } },
    { trail: 'tF', wind: { aF1: 0.25, aF2: 0.15, w: -0.5, lean: 0.3, y: 10 }, hit: { aF1: 2.55, aF2: 0.1, w: 0.25, lean: -0.1, y: -2, x: 6, fFx: 23, fBx: -14 } },
  ],
  smash: [
    { trail: 'tF', wind: { aF1: 3.05, aF2: 0.2, w: 0.1, lean: -0.25, y: -1 }, hit: { aF1: 1.05, aF2: 0, w: 0, lean: 0.55, y: 11, x: 8, fFx: 31, fBx: -27 } },
    { trail: 'tF', wind: { aF1: -0.5, aF2: 0.8, w: 0.6, lean: -0.05 }, hit: { aF1: 1.8, aF2: 0, w: 0, lean: 0.38, x: 10, ...LUNGE } },
  ],
  spin: [
    { trail: 'staff', wind: { aF1: 0.5, aF2: 1.3, w: 0.6 }, hit: { aF1: 1.6, aF2: 0.05, w: -4.1, grip: 0, lean: 0.32, x: 10, ...LUNGE } },
    { trail: 'staff', wind: { aF1: 2.4, aF2: 0.4, w: 0.5, y: 3 }, hit: { aF1: 1.25, aF2: 0, w: 3.8, grip: 0, lean: 0.25, x: 8, fFx: 34, fFy: 16, fBx: -18 } },
  ],
  shoot: [
    { trail: null, wind: { aF1: 1.3, aF2: 0.5 }, hit: { aF1: 1.6, aF2: 0, lean: 0.14, x: -4 } },
    { trail: null, wind: { aF1: 1.8, aF2: 0.4 }, hit: { aF1: 1.72, aF2: -0.08, lean: 0.18, x: -4, fFx: 18 } },
  ],
  dual: [
    { trail: 'tF', wind: { aF1: 2.6, aF2: 0.7, lean: 0.15 }, hit: { aF1: 1.25, aF2: -0.15, aB1: 0.4, aB2: 2.4, lean: 0.42, x: 9, ...LUNGE } },
    { trail: 'tB', wind: { aB1: 2.5, aB2: 0.7 }, hit: { aB1: 1.45, aB2: -0.15, aF1: 0.8, aF2: 2.0, lean: 0.45, x: 10, ...LUNGE } },
  ],
}

// concentração antes do especial
export const CHARGE = {
  punch: { lean: 0.28, y: 12, aF1: 0.4, aF2: 2.4, aB1: 0.5, aB2: 2.5, fFx: 22, fBx: -24 },
  slash: { lean: 0.35, y: 12, aF1: 0.2, aF2: 0.5, w: 2.5, grip: 0, aB1: 0.3, aB2: 1.0, fFx: 26, fBx: -26 },
  smash: { lean: -0.1, y: 2, aF1: 3.0, aF2: 0.2, w: 0.1 },
  spin: { lean: 0.1, y: 6, aF1: 1.57, aF2: 0, w: 1.57, grip: 0, aB1: 1.4, aB2: 0.2 },
  shoot: { lean: 0.1, y: 6, aF1: 1.57, aF2: 0, aB1: 1.45, aB2: 0.15 },
  dual: { lean: 0.2, y: 12, aF1: 2.5, aF2: 0.5, aB1: 2.4, aB2: 0.6, fFx: 24, fBx: -26 },
}
export const SHEATHE = { lean: 0.05, aF1: 0.3, aF2: 0.6, w: 2.6, aB1: 0.3, aB2: 0.9, grip: 0 }
export const HURT = { lean: -0.45, x: -8, y: 5, aF1: -0.2, aF2: 1.2, aB1: -0.5, aB2: 1.0, fFx: 8, fBx: -22, grip: 0 }
export const MISS = { lean: 0.6, x: 8, y: 9, aF1: 1.4, aF2: 0.3, aB1: -0.3, aB2: 1.2, fFx: 30, fBx: -14, grip: 0 }

export const withIdle = (style, partial) => ({ ...IDLE[style], ...partial })

export const mixPose = (a, b, t) => {
  const o = {}
  for (const k of KEYS) o[k] = a[k] + (b[k] - a[k]) * t
  return o
}

/** Aproxima a pose `cur` da `target` de forma suave (taxa por segundo). */
export const smoothPose = (cur, target, dt, rate) => {
  if (!cur) return { ...target }
  const k = 1 - Math.exp(-(dt / 1000) * rate)
  const o = {}
  for (const key of KEYS) o[key] = cur[key] + (target[key] - cur[key]) * k
  return o
}

const eo = (t) => 1 - (1 - t) ** 3
const ei = (t) => t * t
const eio = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

/** Postura viva: cada arma respira, quica ou balança do seu jeito. */
export function idlePose(style, t) {
  const p = { ...IDLE[style] }
  const s = Math.sin
  if (style === 'punch') {
    const b = Math.abs(s(t * 6.2))
    p.hop = b * 3
    p.y += (1 - b) * 1.5
    p.aF1 += s(t * 6.2) * 0.05
    p.aB1 += s(t * 6.2 + 1) * 0.05
    p.lean += s(t * 3.1) * 0.03
  } else if (style === 'slash') {
    p.y += s(t * 2) * 1.2
    p.w += s(t * 1.6) * 0.05
    p.aF1 += s(t * 2) * 0.03
  } else if (style === 'smash') {
    p.y += s(t * 2.4) * 1.6
    p.lean += s(t * 1.2) * 0.03
    p.w += s(t * 2.4) * 0.04
  } else if (style === 'spin') {
    p.hop = Math.abs(s(t * 4)) * 1.5
    p.w += s(t * 2.2) * 0.14
    p.aF1 += s(t * 2.2) * 0.05
  } else if (style === 'shoot') {
    p.y += s(t * 2.2) * 1
    p.aF1 += s(t * 1.4) * 0.03
    p.lean += s(t * 1.1) * 0.02
  } else if (style === 'dual') {
    p.x += s(t * 3) * 2.5
    p.lean += s(t * 3) * 0.05
    p.y += Math.abs(s(t * 3)) * 2
    p.w += s(t * 4) * 0.12
    p.wB += s(t * 4 + 1.5) * 0.12
  }
  return p
}

/** Pose final do golpe, onde o lutador fica congelado até o próximo comando. */
export function holdPose(style, variant, t = 0) {
  const v = ATTACKS[style][variant % ATTACKS[style].length]
  const p = { ...IDLE[style], ...v.hit }
  // só a respiração, bem de leve
  p.y += Math.sin(t * 2.4) * 0.8
  p.lean += Math.sin(t * 1.2) * 0.012
  return p
}

/**
 * `from` é a pose de onde o golpe parte (a postura ou a pose congelada do golpe
 * anterior). Com `hold`, o golpe termina parado na pose de impacto, sem voltar.
 */
export function attackPose(style, variant, u, idle = IDLE[style], from = idle, hold = false) {
  const v = ATTACKS[style][variant % ATTACKS[style].length]
  const wind = { ...idle, ...v.wind }
  const hit = { ...idle, ...v.hit }
  if (u < 0.3) return mixPose(from, wind, eo(u / 0.3))
  if (u < HIT_AT) return mixPose(wind, hit, ei((u - 0.3) / (HIT_AT - 0.3)))
  if (u < 0.62) {
    // um pouco além do impacto e volta (follow-through)
    const over = Math.sin(Math.PI * ((u - HIT_AT) / (0.62 - HIT_AT))) * 0.09
    return mixPose(hit, mixPose(wind, hit, 1 + 1), over)
  }
  if (hold) return hit
  return mixPose(hit, idle, eio(Math.min(1, (u - 0.62) / 0.38)))
}

const V = (a, l) => ({ x: Math.sin(a) * l, y: Math.cos(a) * l })
const add = (p, q) => ({ x: p.x + q.x, y: p.y + q.y })
const along = (p, d, l) => ({ x: p.x + d.x * l, y: p.y + d.y * l })
const lerpP = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })

// cinemática inversa de dois ossos; `pick` escolhe entre as duas soluções
function ik(a, t, l1, l2, pick) {
  const dx = t.x - a.x
  const dy = t.y - a.y
  const d = Math.min(l1 + l2 - 0.01, Math.max(Math.abs(l1 - l2) + 0.01, Math.hypot(dx, dy)))
  const base = Math.atan2(dy, dx)
  const ang = Math.acos((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))
  const j1 = { x: a.x + Math.cos(base - ang) * l1, y: a.y + Math.sin(base - ang) * l1 }
  const j2 = { x: a.x + Math.cos(base + ang) * l1, y: a.y + Math.sin(base + ang) * l1 }
  const joint = pick(j1, j2)
  const end = { x: joint.x + Math.cos(Math.atan2(t.y - joint.y, t.x - joint.x)) * l2, y: joint.y + Math.sin(Math.atan2(t.y - joint.y, t.x - joint.x)) * l2 }
  return { joint, end }
}

/** Posições das articulações (coordenadas locais; chão em y = 0). */
export function bones(p, style) {
  const hip = { x: p.x, y: -HIP_H + p.y - p.hop }
  const legF = ik(hip, { x: p.fFx, y: -p.fFy - p.hop }, SEG.TH, SEG.SH, (a, b) => (a.x > b.x ? a : b))
  const legB = ik(hip, { x: p.fBx, y: -p.fBy - p.hop }, SEG.TH, SEG.SH, (a, b) => (a.x > b.x ? a : b))
  const up = V(Math.PI - p.lean, 1)
  const neck = along(hip, up, SEG.T)
  const sh = along(hip, up, SEG.T - 5)
  const head = add(along(hip, up, SEG.T + SEG.HEAD + 3), { x: 1.5, y: 0 })
  const eF = add(sh, V(p.aF1, SEG.UA))
  const hF = add(eF, V(p.aF1 + p.aF2, SEG.FA))
  const waF = p.aF1 + p.aF2 + p.w
  let eB = add(sh, V(p.aB1, SEG.UA))
  let hB = add(eB, V(p.aB1 + p.aB2, SEG.FA))
  const g = GRIP[style]
  if (g && p.grip > 0.01) {
    // mão de trás vai até o cabo da arma
    const target = along(hF, V(waF, 1), g)
    const arm = ik(sh, target, SEG.UA, SEG.FA, (a, b) => (a.y > b.y ? a : b))
    eB = lerpP(eB, arm.joint, p.grip)
    hB = lerpP(hB, arm.end, p.grip)
  }
  return {
    hip, neck, sh, head, eF, hF, eB, hB, up,
    kF: legF.joint, fF: legF.end, kB: legB.joint, fB: legB.end,
    waF, waB: p.aB1 + p.aB2 + p.wB,
  }
}

/** Pontos que deixam rastro (ponta da arma, punho ou pé). */
export function trailPoints(b, style, key) {
  const d = V(b.waF, 1)
  const dB = V(b.waB, 1)
  if (key === 'hF') return [b.hF]
  if (key === 'hB') return [b.hB]
  if (key === 'fF') return [b.fF]
  if (key === 'tB') return [along(b.hB, dB, 24)]
  if (key === 'staff') return [along(b.hF, d, 58), along(b.hF, d, -42)]
  if (key === 'tF') return [along(b.hF, d, style === 'slash' ? 62 : style === 'smash' ? 48 : 24)]
  return []
}

/** Até onde o golpe alcança à frente do lutador (para o avanço parar no ponto certo). */
export function hitReach(style, variant) {
  const v = ATTACKS[style][variant % ATTACKS[style].length]
  const b = bones({ ...IDLE[style], ...v.hit }, style)
  const pts = trailPoints(b, style, v.trail)
  if (!pts.length) return 0
  return Math.max(...pts.map((p) => p.x))
}

const C = {
  skin: '#c58a5c', skinD: '#a06a44', shirt: '#24327f', shirtD: '#18225c', shirtL: '#33449e',
  pants: '#17181f', pantsD: '#0e0f14', shoe: '#f2f2ee', shoeD: '#cfcfca', sole: '#e62429',
  hair: '#0b0c10', teal: '#22a3a3', rim: 'rgba(245, 245, 242, 0.95)', red: '#e62429', blue: '#3157ff',
}
const HAIR = [[-3, -9, 8], [4, -10, 7], [-9, -4, 6], [8, -7, 5], [0, -13, 6], [-6, -12, 5], [-10, -9, 4.5], [10, -11, 3.5], [-12, -2, 3.5], [3, -15, 4]]

const line = (ctx, a, b, w, c) => {
  ctx.strokeStyle = c
  ctx.lineWidth = w
  ctx.beginPath()
  ctx.moveTo(a.x, a.y)
  ctx.lineTo(b.x, b.y)
  ctx.stroke()
}
const dot = (ctx, p, r, c) => {
  ctx.fillStyle = c
  ctx.beginPath()
  ctx.arc(p.x, p.y, r, 0, TAU)
  ctx.fill()
}
// membro afinando do começo ao fim
const limb = (ctx, a, b, w1, w2, c) => {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len
  ctx.fillStyle = c
  ctx.beginPath()
  ctx.moveTo(a.x + nx * w1 / 2, a.y + ny * w1 / 2)
  ctx.lineTo(b.x + nx * w2 / 2, b.y + ny * w2 / 2)
  ctx.arc(b.x, b.y, w2 / 2, Math.atan2(ny, nx), Math.atan2(ny, nx) + Math.PI)
  ctx.lineTo(a.x - nx * w1 / 2, a.y - ny * w1 / 2)
  ctx.arc(a.x, a.y, w1 / 2, Math.atan2(-ny, -nx), Math.atan2(-ny, -nx) + Math.PI)
  ctx.closePath()
  ctx.fill()
}

export const weaponKind = (style) =>
  ({ punch: 'fist', slash: 'katana', smash: 'hammer', spin: 'staff', shoot: 'web', dual: 'dagger' })[style]

function drawWeapon(ctx, h, wa, kind, col, ex) {
  const d = V(wa, 1)
  const n = { x: -d.y, y: d.x }
  if (kind === 'katana') {
    line(ctx, along(h, d, -13), along(h, d, 5), 3.6 + ex, col || '#1d2029')
    if (!col) for (let i = -11; i < 4; i += 4) line(ctx, along(h, d, i), along(h, d, i + 1.5), 3.8, '#a3161b')
    line(ctx, add(along(h, d, 5), { x: n.x * 5, y: n.y * 5 }), add(along(h, d, 5), { x: -n.x * 5, y: -n.y * 5 }), 2.6 + ex, col || '#c9ccd6')
    const a = along(h, d, 6)
    const b = along(h, d, 64)
    const c = add(along(h, d, 35), { x: n.x * 3, y: n.y * 3 })
    ctx.strokeStyle = col || '#e9edf7'
    ctx.lineWidth = 3.4 + ex
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.quadraticCurveTo(c.x, c.y, b.x, b.y)
    ctx.stroke()
    if (!col) line(ctx, add(a, { x: n.x * 1.1, y: n.y * 1.1 }), add(b, { x: n.x * 0.6, y: n.y * 0.6 }), 0.9, '#9fbaff')
  } else if (kind === 'hammer') {
    line(ctx, along(h, d, -16), along(h, d, 42), 3.9 + ex, col || '#4a3426')
    const c = along(h, d, 46)
    const hw = 14 + ex / 2
    const hl = 8 + ex / 2
    ctx.fillStyle = col || '#2b2e38'
    ctx.beginPath()
    ctx.moveTo(c.x + n.x * hw + d.x * hl, c.y + n.y * hw + d.y * hl)
    ctx.lineTo(c.x - n.x * hw + d.x * hl, c.y - n.y * hw + d.y * hl)
    ctx.lineTo(c.x - n.x * hw - d.x * hl, c.y - n.y * hw - d.y * hl)
    ctx.lineTo(c.x + n.x * hw - d.x * hl, c.y + n.y * hw - d.y * hl)
    ctx.closePath()
    ctx.fill()
    if (!col) {
      line(ctx, add(c, { x: n.x * 13, y: n.y * 13 }), add(c, { x: -n.x * 13, y: -n.y * 13 }), 2.4, C.red)
      line(ctx, add(add(c, { x: n.x * 13, y: n.y * 13 }), { x: d.x * 6, y: d.y * 6 }), add(add(c, { x: -n.x * 13, y: -n.y * 13 }), { x: d.x * 6, y: d.y * 6 }), 1.2, '#4a4f5e')
    }
  } else if (kind === 'staff') {
    line(ctx, along(h, d, -44), along(h, d, 58), 3.7 + ex, col || '#2b2e38')
    if (!col) {
      line(ctx, along(h, d, 50), along(h, d, 58), 3.9, C.red)
      line(ctx, along(h, d, -36), along(h, d, -44), 3.9, C.red)
      line(ctx, along(h, d, -4), along(h, d, 4), 4.1, '#c9ccd6')
    }
  } else if (kind === 'dagger') {
    line(ctx, along(h, d, -5), along(h, d, 3), 3.1 + ex, col || '#1d2029')
    line(ctx, add(along(h, d, 3), { x: n.x * 3, y: n.y * 3 }), add(along(h, d, 3), { x: -n.x * 3, y: -n.y * 3 }), 1.8 + ex, col || '#c9ccd6')
    ctx.fillStyle = col || '#e9edf7'
    ctx.beginPath()
    const a = along(h, d, 4)
    const tip = along(h, d, 26)
    ctx.moveTo(a.x + n.x * (2 + ex / 2), a.y + n.y * (2 + ex / 2))
    ctx.lineTo(tip.x, tip.y)
    ctx.lineTo(a.x - n.x * (2 + ex / 2), a.y - n.y * (2 + ex / 2))
    ctx.closePath()
    ctx.fill()
  } else if (kind === 'web') {
    line(ctx, along(h, d, -8), along(h, d, -1.5), 6 + ex, col || C.blue)
    if (!col) dot(ctx, along(h, d, -1.5), 1.5, '#f5f5f2')
  }
}

function drawHair(ctx, h, col, ex) {
  for (const [x, y, r] of HAIR) dot(ctx, { x: h.x + x, y: h.y + y }, r + ex / 2, col || C.hair)
  if (col) return
  ctx.strokeStyle = C.teal
  ctx.lineWidth = 1.6
  ctx.lineCap = 'round'
  for (const [x, y, r] of HAIR.slice(0, 7)) {
    ctx.beginPath()
    ctx.arc(h.x + x, h.y + y, r * 0.62, -2.7, -1.15)
    ctx.stroke()
  }
}

function drawFace(ctx, b) {
  const h = b.head
  dot(ctx, { x: h.x - 2, y: h.y + 1 }, 2.4, C.skinD) // orelha
  dot(ctx, { x: h.x - 2.2, y: h.y + 3.6 }, 0.8, '#d9d9d4') // brinco
  ctx.strokeStyle = '#0b0b10'
  ctx.lineWidth = 1.3
  ctx.strokeRect(h.x + 3.5, h.y - 2.6, 7, 4.2) // óculos
  line(ctx, { x: h.x + 3.5, y: h.y - 1.2 }, { x: h.x - 2.5, y: h.y - 1.8 }, 1, '#0b0b10')
  dot(ctx, { x: h.x + 7.6, y: h.y - 0.5 }, 1, '#0b0b10')
  line(ctx, { x: h.x + 5, y: h.y - 4.4 }, { x: h.x + 10, y: h.y - 4 }, 1.4, '#0b0b10') // sobrancelha decidida
  line(ctx, { x: h.x + 10.4, y: h.y + 0.5 }, { x: h.x + 11.6, y: h.y + 3 }, 1.1, C.skinD) // nariz
  line(ctx, { x: h.x + 7, y: h.y + 5.3 }, { x: h.x + 10.2, y: h.y + 4.9 }, 1.3, '#2a1a12') // bigode
}

function drawTorso(ctx, b, col, ex) {
  const n = { x: -b.up.y, y: b.up.x }
  const w0 = 8 + ex / 2 // cintura
  const w1 = 10.5 + ex / 2 // peito
  ctx.fillStyle = col || C.shirt
  ctx.beginPath()
  ctx.moveTo(b.hip.x + n.x * w0, b.hip.y + n.y * w0)
  ctx.lineTo(b.neck.x + n.x * w1, b.neck.y + n.y * w1)
  ctx.arc(b.neck.x, b.neck.y, w1, Math.atan2(n.y, n.x), Math.atan2(n.y, n.x) + Math.PI, true)
  ctx.lineTo(b.hip.x - n.x * w0, b.hip.y - n.y * w0)
  ctx.closePath()
  ctx.fill()
  if (col) return
  // dobra da camiseta e luz no peito
  ctx.strokeStyle = C.shirtD
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(b.hip.x - n.x * 4, b.hip.y - n.y * 4 - 2)
  ctx.lineTo(b.neck.x - n.x * 6, b.neck.y - n.y * 6 + 4)
  ctx.stroke()
  ctx.strokeStyle = C.shirtL
  ctx.beginPath()
  ctx.moveTo(b.hip.x + n.x * 6, b.hip.y + n.y * 6 - 6)
  ctx.lineTo(b.neck.x + n.x * 8, b.neck.y + n.y * 8 + 6)
  ctx.stroke()
  // aranha vermelha no peito
  const c = { x: b.hip.x + (b.neck.x - b.hip.x) * 0.62 + n.x * 3, y: b.hip.y + (b.neck.y - b.hip.y) * 0.62 + n.y * 3 }
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i += 1) {
      const a = -0.6 + i * 0.6
      line(ctx, c, { x: c.x + s * Math.cos(a) * 4.6, y: c.y + Math.sin(a) * 4.6 - 0.5 }, 0.9, C.red)
    }
  }
  dot(ctx, c, 2.4, C.red)
}

function drawShoe(ctx, f, k, col, ex) {
  // sapato acompanha o chão; inclina quando o pé sai do chão (chute)
  const tilt = Math.max(-0.9, Math.min(0.3, (f.y + 0) * 0.04))
  ctx.save()
  ctx.translate(f.x + 2, f.y - 2)
  ctx.rotate(tilt)
  ctx.fillStyle = col
  ctx.beginPath()
  ctx.ellipse(1.5, 0, 7 + ex / 2, 3.6 + ex / 2, 0, 0, TAU)
  ctx.fill()
  if (!ex && k) {
    ctx.fillStyle = C.sole
    ctx.fillRect(-5, 2.2, 13, 1.4)
  }
  ctx.restore()
}

/**
 * Desenha o lutador em coordenadas locais (o chamador já aplicou posição,
 * escala e espelhamento). `tint` pinta tudo de uma cor (rastros e fantasmas).
 */
export function drawFighter(ctx, b, style, { tint = null } = {}) {
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  const kind = weaponKind(style)
  const twoHand = !!GRIP[style]
  const passes = tint ? [[tint, 0]] : [[C.rim, 2.8], [null, 0]]
  for (const [col, ex] of passes) {
    const c = (k) => col || C[k]
    // perna de trás
    limb(ctx, b.hip, b.kB, 10 + ex, 8.5 + ex, c('pantsD'))
    limb(ctx, b.kB, b.fB, 8.5 + ex, 6.5 + ex, c('pantsD'))
    drawShoe(ctx, b.fB, false, col || C.shoeD, ex)
    // braço de trás (fica atrás do tronco, a menos que segure a arma de duas mãos)
    const backArm = () => {
      if (kind === 'dagger') drawWeapon(ctx, b.hB, b.waB, 'dagger', col, ex)
      limb(ctx, b.sh, b.eB, 7.5 + ex, 6.5 + ex, c('shirtD'))
      limb(ctx, b.eB, b.hB, 6.5 + ex, 5.5 + ex, c('shirtD'))
      dot(ctx, b.hB, 3.6 + ex / 2, kind === 'fist' ? col || '#b81d22' : c('skinD'))
    }
    if (!twoHand) backArm()
    // tronco e quadril
    drawTorso(ctx, b, col, ex)
    dot(ctx, b.hip, 9.5 + ex / 2, c('pants'))
    // perna da frente
    limb(ctx, b.hip, b.kF, 10.5 + ex, 9 + ex, c('pants'))
    limb(ctx, b.kF, b.fF, 9 + ex, 7 + ex, c('pants'))
    drawShoe(ctx, b.fF, true, col || C.shoe, ex)
    // pescoço e cabeça
    line(ctx, b.neck, b.head, 7 + ex, c('skin'))
    dot(ctx, b.head, SEG.HEAD + ex / 2, c('skin'))
    drawHair(ctx, b.head, col, ex)
    if (!col) drawFace(ctx, b)
    // arma e braço da frente
    if (kind !== 'fist' && kind !== 'web' && kind !== 'dagger') drawWeapon(ctx, b.hF, b.waF, kind, col, ex)
    if (twoHand) backArm()
    limb(ctx, b.sh, b.eF, 8 + ex, 7 + ex, c('shirt'))
    limb(ctx, b.eF, b.hF, 7 + ex, 6 + ex, c('shirt'))
    if (kind === 'web') drawWeapon(ctx, b.hF, b.waF, 'web', col, ex)
    if (kind === 'dagger') drawWeapon(ctx, b.hF, b.waF, 'dagger', col, ex)
    dot(ctx, b.hF, (kind === 'fist' ? 4.6 : 3.8) + ex / 2, kind === 'fist' ? col || C.red : c('skin'))
  }
}
