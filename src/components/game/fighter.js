// Lutador do Spider Rush, desenhado em canvas (vista lateral, virado para a direita;
// o motor espelha para a esquerda). Inspirado no autor: cabelo cacheado com mechas
// verde-azuladas, óculos e camiseta com a aranha vermelha.
//
// Poses são ângulos de articulações. Ângulo 0 aponta para baixo, PI/2 para a frente,
// PI para cima. Braços: aX1 = ombro (absoluto), aX2 = cotovelo (relativo).
// Pernas: lX1 = quadril (absoluto), lX2 = joelho (relativo). w/wB = arma na mão.
// Cada golpe: repouso → preparo → impacto (HIT_AT) → segura → volta.

const TAU = Math.PI * 2
const SEG = { T: 36, UA: 17, FA: 16, TH: 21, SH: 21, HEAD: 11 }
export const HIT_AT = 0.42
const KEYS = ['x', 'y', 'lean', 'aF1', 'aF2', 'aB1', 'aB2', 'lF1', 'lF2', 'lB1', 'lB2', 'w', 'wB']

const BASE = { x: 0, y: 0, lean: 0.12, aF1: 0.7, aF2: 1.9, aB1: 0.35, aB2: 2.1, lF1: 0.38, lF2: -0.55, lB1: -0.3, lB2: -0.45, w: 0, wB: 0 }
// pernas de quem avança no golpe
const LUNGE = { lF1: 0.78, lF2: -0.28, lB1: -0.58, lB2: -0.18 }

export const IDLE = {
  punch: BASE,
  slash: { ...BASE, w: 0.15 },
  smash: { ...BASE, aF1: 0.55, aF2: 1.7, w: 0.25 },
  spin: { ...BASE, w: 1.4 },
  shoot: { ...BASE, aF1: 0.9, aF2: 1.5 },
  dual: { ...BASE, w: Math.PI, wB: Math.PI },
}

export const ATTACKS = {
  punch: [
    // jab
    { trail: 'hF', wind: { lean: 0.02, aF1: 0.95, aF2: 2.2, x: -2 }, hit: { lean: 0.32, aF1: 1.57, aF2: 0.05, aB1: 0.2, aB2: 2.3, x: 6, ...LUNGE } },
    // direto com a mão de trás
    { trail: 'hB', wind: { lean: 0.05, aB1: 0.3, aB2: 2.4 }, hit: { lean: 0.42, aB1: 1.6, aB2: 0.05, aF1: 0.5, aF2: 2.2, x: 8, ...LUNGE } },
    // chute
    { trail: 'fF', wind: { lean: -0.1, lF1: 0.9, lF2: -1.6 }, hit: { lean: -0.35, lF1: 1.75, lF2: -0.05, aF1: 0.2, aF2: 1.4, aB1: -0.5, aB2: 1.2, lB1: -0.15, lB2: -0.35, x: 4 } },
    // gancho para cima
    { trail: 'hF', wind: { lean: 0.22, aF1: 0.2, aF2: 1.0, y: 3 }, hit: { lean: -0.05, aF1: 2.75, aF2: 0.25, aB1: 0.4, aB2: 2.0, y: -8, lF1: 0.3, lF2: -0.2, lB1: -0.2, lB2: -0.2 } },
  ],
  slash: [
    // diagonal de cima
    { trail: 'tF', wind: { lean: -0.1, aF1: 2.9, aF2: 0.5, w: 0.4 }, hit: { lean: 0.38, aF1: 1.0, aF2: 0.05, w: 0.15, x: 8, ...LUNGE } },
    // horizontal
    { trail: 'tF', wind: { lean: -0.05, aF1: -0.4, aF2: 1.5, w: 1.2 }, hit: { lean: 0.3, aF1: 1.75, aF2: 0, w: 0, x: 8, ...LUNGE } },
    // de baixo para cima
    { trail: 'tF', wind: { lean: 0.25, aF1: 0.15, aF2: 0.2, w: -0.4, y: 3 }, hit: { lean: -0.1, aF1: 2.6, aF2: 0.1, w: 0.2, y: -6, lF1: 0.4, lF2: -0.3 } },
  ],
  smash: [
    { trail: 'tF', wind: { lean: -0.22, aF1: 3.05, aF2: 0.25, aB1: 2.9, aB2: 0.3, y: -3 }, hit: { lean: 0.5, aF1: 1.05, aF2: 0, aB1: 1.0, aB2: 0.1, y: 5, x: 6, lF1: 0.85, lF2: -0.6, lB1: -0.6, lB2: -0.3 } },
    { trail: 'tF', wind: { lean: 0, aF1: -0.6, aF2: 0.9, aB1: -0.5, aB2: 1.0 }, hit: { lean: 0.35, aF1: 1.8, aF2: 0, aB1: 1.6, aB2: 0.2, x: 8, ...LUNGE } },
  ],
  spin: [
    { trail: 'staff', wind: { lean: -0.05, aF1: 0.4, aF2: 1.4, w: 0.5 }, hit: { lean: 0.3, aF1: 1.65, aF2: 0.05, w: 3.9, x: 8, ...LUNGE } },
    { trail: 'staff', wind: { lean: 0.1, aF1: 2.4, aF2: 0.4, w: -0.5, y: 2 }, hit: { lean: 0.25, aF1: 1.2, aF2: 0, w: -3.6, x: 6, lF1: 1.4, lF2: -0.2, lB1: -0.3, lB2: -0.3 } },
  ],
  shoot: [
    { trail: null, wind: { lean: 0.05, aF1: 1.3, aF2: 0.6 }, hit: { lean: 0.15, aF1: 1.62, aF2: 0, aB1: 0.4, aB2: 2.0, x: -3 } },
    { trail: null, wind: { lean: 0.1, aF1: 1.9, aF2: 0.4 }, hit: { lean: 0.18, aF1: 1.75, aF2: -0.1, x: -3, lF1: 0.5, lF2: -0.4 } },
  ],
  dual: [
    { trail: 'tF', wind: { lean: 0.05, aF1: 2.6, aF2: 0.6 }, hit: { lean: 0.35, aF1: 1.2, aF2: -0.1, aB1: 0.2, aB2: 2.4, x: 6, ...LUNGE } },
    { trail: 'tB', wind: { lean: 0.05, aB1: 2.5, aB2: 0.6 }, hit: { lean: 0.38, aB1: 1.4, aB2: -0.1, aF1: 0.5, aF2: 2.0, x: 7, ...LUNGE } },
  ],
}

// pose de concentração antes do especial
export const CHARGE = {
  punch: { lean: 0.25, aF1: 0.4, aF2: 2.4, aB1: 0.5, aB2: 2.5, y: 3, lF1: 0.62, lF2: -0.95, lB1: -0.5, lB2: -0.65 },
  slash: { lean: 0.35, aF1: 0.15, aF2: 0.4, w: 2.6, y: 4, lF1: 0.75, lF2: -1.0, lB1: -0.6, lB2: -0.5 },
  smash: { lean: -0.1, aF1: 3.0, aF2: 0.2, aB1: 2.9, aB2: 0.3 },
  spin: { lean: 0.1, aF1: 1.57, aF2: 0, w: 1.57, aB1: 1.4, aB2: 0.2 },
  shoot: { lean: 0.1, aF1: 1.57, aF2: 0, aB1: 1.45, aB2: 0.15 },
  dual: { lean: 0.2, aF1: 2.5, aF2: 0.5, aB1: 2.4, aB2: 0.6, w: Math.PI, wB: Math.PI, y: 3 },
}
export const SHEATHE = { lean: 0.05, aF1: 0.25, aF2: 0.5, w: 2.7, aB1: 0.4, aB2: 1.2 }
export const HURT = { lean: -0.4, aF1: -0.3, aF2: 1.0, aB1: -0.6, aB2: 0.8, x: -6, y: 2, lF1: 0.6, lF2: -0.4, lB1: -0.1, lB2: -0.6 }
export const MISS = { lean: 0.55, x: 6, y: 3, aF1: 1.3, aF2: 0.3, aB1: -0.4, aB2: 1.0, lF1: 0.9, lF2: -1.1, lB1: -0.5, lB2: -0.3 }

export const withIdle = (style, partial) => ({ ...IDLE[style], ...partial })

export const mixPose = (a, b, t) => {
  const o = {}
  for (const k of KEYS) o[k] = a[k] + (b[k] - a[k]) * t
  return o
}

const eo = (t) => 1 - (1 - t) ** 3
const ei = (t) => t * t
const eio = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

export function attackPose(style, variant, u, idle = IDLE[style]) {
  const v = ATTACKS[style][variant % ATTACKS[style].length]
  const wind = { ...idle, ...v.wind }
  const hit = { ...idle, ...v.hit }
  if (u < 0.3) return mixPose(idle, wind, eo(u / 0.3))
  if (u < HIT_AT) return mixPose(wind, hit, ei((u - 0.3) / (HIT_AT - 0.3)))
  if (u < 0.62) return hit
  return mixPose(hit, idle, eio(Math.min(1, (u - 0.62) / 0.38)))
}

const V = (a, l) => ({ x: Math.sin(a) * l, y: Math.cos(a) * l })
const add = (p, q) => ({ x: p.x + q.x, y: p.y + q.y })
const along = (p, d, l) => ({ x: p.x + d.x * l, y: p.y + d.y * l })

/** Posições das articulações (coordenadas locais; chão em y = 0). */
export function bones(p) {
  const kF = V(p.lF1, SEG.TH)
  const fF = add(kF, V(p.lF1 + p.lF2, SEG.SH))
  const kB = V(p.lB1, SEG.TH)
  const fB = add(kB, V(p.lB1 + p.lB2, SEG.SH))
  const hip = { x: p.x, y: -Math.max(fF.y, fB.y) + p.y }
  const up = V(Math.PI - p.lean, 1)
  const neck = along(hip, up, SEG.T)
  const sh = along(hip, up, SEG.T - 5)
  const head = add(along(hip, up, SEG.T + SEG.HEAD + 3), { x: 1.5, y: 0 })
  const eF = add(sh, V(p.aF1, SEG.UA))
  const hF = add(eF, V(p.aF1 + p.aF2, SEG.FA))
  const eB = add(sh, V(p.aB1, SEG.UA))
  const hB = add(eB, V(p.aB1 + p.aB2, SEG.FA))
  return {
    hip, neck, sh, head, eF, hF, eB, hB, up,
    kF: add(hip, kF), fF: add(hip, fF), kB: add(hip, kB), fB: add(hip, fB),
    waF: p.aF1 + p.aF2 + p.w,
    waB: p.aB1 + p.aB2 + p.wB,
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
  if (key === 'tF') {
    const len = style === 'slash' ? 62 : style === 'smash' ? 48 : 24
    return [along(b.hF, d, len)]
  }
  return []
}

const C = {
  skin: '#c58a5c', skinD: '#a06a44', shirt: '#24327f', shirtD: '#18225c',
  pants: '#16171e', pantsD: '#0e0f14', shoe: '#f2f2ee', shoeD: '#cfcfca',
  hair: '#0b0c10', teal: '#22a3a3', rim: 'rgba(245, 245, 242, 0.95)', red: '#e62429', blue: '#3157ff',
}
const HAIR = [[-3, -9, 8], [4, -10, 7], [-9, -4, 6], [8, -7, 5], [0, -13, 6], [-6, -12, 5], [-10, -9, 4.5], [10, -11, 3.5]]

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

export const weaponKind = (style) =>
  ({ punch: 'fist', slash: 'katana', smash: 'hammer', spin: 'staff', shoot: 'web', dual: 'dagger' })[style]

function drawWeapon(ctx, h, wa, kind, col, ex) {
  const d = V(wa, 1)
  const n = { x: -d.y, y: d.x }
  if (kind === 'fist') {
    dot(ctx, h, 4.4 + ex / 2, col || C.red)
  } else if (kind === 'katana') {
    line(ctx, along(h, d, -7), along(h, d, 5), 3.4 + ex, col || '#1d2029')
    line(ctx, add(along(h, d, 5), { x: n.x * 4.5, y: n.y * 4.5 }), add(along(h, d, 5), { x: -n.x * 4.5, y: -n.y * 4.5 }), 2.4 + ex, col || '#c9ccd6')
    const a = along(h, d, 6)
    const b = along(h, d, 62)
    const c = add(along(h, d, 34), { x: n.x * 2.6, y: n.y * 2.6 })
    ctx.strokeStyle = col || '#e9edf7'
    ctx.lineWidth = 3.2 + ex
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.quadraticCurveTo(c.x, c.y, b.x, b.y)
    ctx.stroke()
    if (!col) line(ctx, add(a, { x: n.x, y: n.y }), add(b, { x: n.x * 0.6, y: n.y * 0.6 }), 0.9, '#9fbaff')
  } else if (kind === 'hammer') {
    line(ctx, along(h, d, -8), along(h, d, 42), 3.8 + ex, col || '#4a3426')
    const c = along(h, d, 46)
    const hw = 13 + ex / 2
    const hl = 7 + ex / 2
    ctx.fillStyle = col || '#2b2e38'
    ctx.beginPath()
    ctx.moveTo(c.x + n.x * hw + d.x * hl, c.y + n.y * hw + d.y * hl)
    ctx.lineTo(c.x - n.x * hw + d.x * hl, c.y - n.y * hw + d.y * hl)
    ctx.lineTo(c.x - n.x * hw - d.x * hl, c.y - n.y * hw - d.y * hl)
    ctx.lineTo(c.x + n.x * hw - d.x * hl, c.y + n.y * hw - d.y * hl)
    ctx.closePath()
    ctx.fill()
    if (!col) line(ctx, add(c, { x: n.x * 12, y: n.y * 12 }), add(c, { x: -n.x * 12, y: -n.y * 12 }), 2.2, C.red)
  } else if (kind === 'staff') {
    line(ctx, along(h, d, -42), along(h, d, 58), 3.6 + ex, col || '#2b2e38')
    if (!col) {
      line(ctx, along(h, d, 50), along(h, d, 58), 3.8, C.red)
      line(ctx, along(h, d, -34), along(h, d, -42), 3.8, C.red)
    }
  } else if (kind === 'web') {
    // lançador preso no pulso
    line(ctx, along(h, d, -7), along(h, d, -1.5), 5.5 + ex, col || C.blue)
    if (!col) dot(ctx, along(h, d, -1.5), 1.4, '#f5f5f2')
  } else if (kind === 'dagger') {
    line(ctx, along(h, d, -5), along(h, d, 3), 3 + ex, col || '#1d2029')
    line(ctx, along(h, d, 3), along(h, d, 24), 2.6 + ex, col || '#e9edf7')
  }
}

function drawHair(ctx, h, col, ex) {
  for (const [x, y, r] of HAIR) dot(ctx, { x: h.x + x, y: h.y + y }, r + ex / 2, col || C.hair)
  if (col) return
  ctx.strokeStyle = C.teal
  ctx.lineWidth = 1.6
  for (const [x, y, r] of HAIR.slice(0, 6)) {
    ctx.beginPath()
    ctx.arc(h.x + x, h.y + y, r * 0.6, -2.6, -1.2)
    ctx.stroke()
  }
}

function drawFace(ctx, b) {
  const h = b.head
  dot(ctx, { x: h.x - 2, y: h.y + 1 }, 2.3, C.skinD) // orelha
  ctx.strokeStyle = '#0b0b10'
  ctx.lineWidth = 1.3
  ctx.strokeRect(h.x + 3.5, h.y - 2.6, 7, 4.2) // óculos
  line(ctx, { x: h.x + 3.5, y: h.y - 1.2 }, { x: h.x - 2.5, y: h.y - 1.8 }, 1, '#0b0b10')
  dot(ctx, { x: h.x + 7.5, y: h.y - 0.5 }, 0.95, '#0b0b10')
  line(ctx, { x: h.x + 7, y: h.y + 5.2 }, { x: h.x + 10, y: h.y + 4.8 }, 1.2, '#2a1a12') // bigode
}

function drawEmblem(ctx, b) {
  const c = {
    x: b.hip.x + (b.neck.x - b.hip.x) * 0.62 + 4,
    y: b.hip.y + (b.neck.y - b.hip.y) * 0.62,
  }
  ctx.strokeStyle = C.red
  ctx.lineWidth = 0.9
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i += 1) {
      const a = -0.6 + i * 0.6
      line(ctx, c, { x: c.x + s * Math.cos(a) * 4.4, y: c.y + Math.sin(a) * 4.4 - 0.5 }, 0.9, C.red)
    }
  }
  dot(ctx, c, 2.3, C.red)
}

function drawShoe(ctx, f, col, ex) {
  ctx.fillStyle = col
  ctx.beginPath()
  ctx.ellipse(f.x + 3, f.y - 2, 6.5 + ex / 2, 3.4 + ex / 2, 0, 0, TAU)
  ctx.fill()
}

/**
 * Desenha o lutador em coordenadas locais (o chamador já aplicou posição,
 * escala e espelhamento). `tint` pinta tudo de uma cor (rastros e fantasmas).
 */
export function drawFighter(ctx, b, style, { tint = null } = {}) {
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  const kind = weaponKind(style)
  const passes = tint ? [[tint, 0]] : [[C.rim, 2.6], [null, 0]]
  for (const [col, ex] of passes) {
    const c = (k) => col || C[k]
    // braço de trás (e a adaga ou a faixa dessa mão)
    if (kind === 'dagger') drawWeapon(ctx, b.hB, b.waB, 'dagger', col, ex)
    line(ctx, b.sh, b.eB, 7 + ex, c('shirtD'))
    line(ctx, b.eB, b.hB, 6.2 + ex, c('shirtD'))
    if (kind === 'fist') drawWeapon(ctx, b.hB, 0, 'fist', col ? col : '#b81d22', ex)
    else dot(ctx, b.hB, 3.4 + ex / 2, c('skinD'))
    // perna de trás
    line(ctx, b.hip, b.kB, 9 + ex, c('pantsD'))
    line(ctx, b.kB, b.fB, 8 + ex, c('pantsD'))
    drawShoe(ctx, b.fB, col || C.shoeD, ex)
    // tronco
    line(ctx, b.hip, b.neck, 20 + ex, c('shirt'))
    dot(ctx, b.hip, 9.5 + ex / 2, c('pants'))
    // perna da frente
    line(ctx, b.hip, b.kF, 9 + ex, c('pants'))
    line(ctx, b.kF, b.fF, 8 + ex, c('pants'))
    drawShoe(ctx, b.fF, col || C.shoe, ex)
    // pescoço e cabeça
    line(ctx, b.neck, b.head, 7 + ex, c('skin'))
    dot(ctx, b.head, SEG.HEAD + ex / 2, c('skin'))
    drawHair(ctx, b.head, col, ex)
    if (!col) {
      drawFace(ctx, b)
      drawEmblem(ctx, b)
    }
    // braço da frente e arma
    line(ctx, b.sh, b.eF, 7 + ex, c('shirt'))
    line(ctx, b.eF, b.hF, 6.2 + ex, c('shirt'))
    if (kind === 'web') drawWeapon(ctx, b.hF, b.waF, 'web', col, ex)
    if (kind !== 'fist' && kind !== 'web') drawWeapon(ctx, b.hF, b.waF, kind, col, ex)
    if (kind === 'fist') drawWeapon(ctx, b.hF, 0, 'fist', col, ex)
    else dot(ctx, b.hF, 3.6 + ex / 2, c('skin'))
  }
}
