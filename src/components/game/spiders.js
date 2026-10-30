// Aranhas do Spider Rush em vista lateral, desenhadas com anatomia de verdade:
// cefalotórax e abdômen com brilho, 8 pernas de três segmentos (fêmur alto,
// tíbia e tarso), pedipalpos, quelíceras e grupo de olhos. Passada em tetrápode
// (pernas alternadas, como aranhas reais). Cada tipo lembra uma espécie:
//   normal  → viúva-negra (preta brilhante, ampulheta vermelha)
//   fast    → aranha-lobo esguia (listras vermelhas)
//   big     → caranguejeira (marrom, peluda, reflexo azul)
//   jumper  → saltadora (felpuda, olhos grandes, divisas brancas)

const TAU = Math.PI * 2

export const TYPES = {
  normal: { hp: 1, speed: 1, size: 1.1, mark: '#e62429', score: 10 },
  fast: { hp: 1, speed: 1.7, size: 0.88, mark: '#ff4a50', score: 15 },
  big: { hp: 2, speed: 0.68, size: 1.55, mark: '#3157ff', score: 25 },
  jumper: { hp: 2, speed: 1.05, size: 1.08, mark: '#f5f5f2', score: 25 },
}

const LOOK = {
  normal: { body: ['#2e2a30', '#060507'], leg: '#0c0b0d', legFar: '#1f1d22', gloss: 0.32, hair: 0 },
  fast: { body: ['#3a2a26', '#0b0807'], leg: '#1a120f', legFar: '#2c211d', gloss: 0.18, hair: 0.3 },
  big: { body: ['#6b4a35', '#1a110b'], leg: '#3a2719', legFar: '#4c3524', gloss: 0.08, hair: 1 },
  jumper: { body: ['#45403d', '#0e0c0b'], leg: '#24201e', legFar: '#36302d', gloss: 0.15, hair: 0.7 },
}

const RIM = 'rgba(245, 245, 242, 0.62)'
const HIP_X = [15, 11, 7, 3]
const FOOT_X = [38, 18, -8, -32]
const KNEE_H = [-40, -46, -46, -42]

const legGeometry = (e, i, far) => {
  // tetrápode: pernas 1 e 3 de um lado andam junto com 2 e 4 do outro
  const ph = e.phase + (i % 2 ? Math.PI : 0) + (far ? Math.PI : 0)
  const swing = e.moving ? Math.sin(ph) : 0
  const lift = e.moving ? Math.max(0, Math.cos(ph)) * 7 : 0
  const hip = { x: HIP_X[i] + (far ? 2 : 0), y: -21 }
  const fx = FOOT_X[i] + swing * 8 + (far ? 4 : 0)
  const footY = e.air > 1 ? -10 + i * 1.5 : -lift
  const foot = { x: fx, y: footY }
  const knee = { x: hip.x + (fx - hip.x) * 0.38, y: KNEE_H[i] - lift * 0.35 + (far ? 3 : 0) + (e.air > 1 ? 8 : 0) }
  const ankle = { x: hip.x + (fx - hip.x) * 0.88, y: -13 + footY * 0.8 + (far ? 1 : 0) }
  return { hip, knee, ankle, foot }
}

function drawLegs(ctx, e, far, pass, look) {
  for (let i = 0; i < 4; i += 1) {
    const g = legGeometry(e, i, far)
    const scale = far ? 0.85 : 1
    const seg = [
      [g.hip, g.knee, 4.2 * scale],
      [g.knee, g.ankle, 3.1 * scale],
      [g.ankle, g.foot, 1.9 * scale],
    ]
    for (const [a, b, w] of seg) {
      ctx.strokeStyle = pass === 'rim' ? RIM : far ? look.legFar : look.leg
      ctx.lineWidth = pass === 'rim' ? w + 2.2 : w
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.stroke()
    }
    if (pass !== 'rim') {
      // articulações claras e pelos nas pernas
      ctx.fillStyle = e.type === 'big' ? 'rgba(49, 87, 255, 0.55)' : 'rgba(245, 245, 242, 0.18)'
      ctx.beginPath()
      ctx.arc(g.knee.x, g.knee.y, 1.8 * scale, 0, TAU)
      ctx.fill()
      if (look.hair && !far) {
        ctx.strokeStyle = 'rgba(200, 170, 140, 0.45)'
        ctx.lineWidth = 0.7
        for (let t = 0.2; t < 1; t += 0.25) {
          const x = g.hip.x + (g.knee.x - g.hip.x) * t
          const y = g.hip.y + (g.knee.y - g.hip.y) * t
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x - 2, y - 2.5)
          ctx.stroke()
          const x2 = g.knee.x + (g.ankle.x - g.knee.x) * t
          const y2 = g.knee.y + (g.ankle.y - g.knee.y) * t
          ctx.beginPath()
          ctx.moveTo(x2, y2)
          ctx.lineTo(x2 + 2.4, y2 - 1.5)
          ctx.stroke()
        }
      }
    }
  }
}

function bodyPath(ctx, ex, bob, type) {
  const abdR = type === 'fast' ? [19, 12] : type === 'jumper' ? [17, 14] : [21, 16]
  ctx.beginPath()
  ctx.ellipse(-17, -27 + bob, abdR[0] + ex, abdR[1] + ex, -0.18, 0, TAU)
  ctx.moveTo(23 + ex, -23 + bob)
  ctx.ellipse(10, -23 + bob, 13 + ex, 9.5 + ex, 0.05, 0, TAU)
}

/** Desenha a aranha `e` com os pés em `groundY`. */
export function drawSpider(ctx, e, groundY, S) {
  const look = LOOK[e.type] || LOOK.normal
  const k = S * e.size
  const bob = e.moving ? Math.sin(e.phase * 2) * 1.2 : 0
  ctx.save()
  ctx.translate(e.x, groundY - e.air)
  ctx.scale(e.dir * k, k)
  if (e.squash) ctx.scale(1 + e.squash * 0.18, 1 - e.squash * 0.18)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // contorno de tudo primeiro (destaca no fundo escuro)
  drawLegs(ctx, e, true, 'rim', look)
  ctx.fillStyle = RIM
  bodyPath(ctx, 1.6, bob, e.type)
  ctx.fill()
  drawLegs(ctx, e, false, 'rim', look)

  // pernas do lado de lá, corpo, pernas do lado de cá
  drawLegs(ctx, e, true, 'fill', look)
  const grad = ctx.createRadialGradient(-6, -40 + bob, 2, -6, -26 + bob, 34)
  grad.addColorStop(0, look.body[0])
  grad.addColorStop(1, look.body[1])
  ctx.fillStyle = grad
  bodyPath(ctx, 0, bob, e.type)
  ctx.fill()

  // pedicelo (cintura entre as duas partes)
  ctx.fillStyle = look.body[1]
  ctx.fillRect(-4, -27 + bob, 6, 6)

  // pelos (caranguejeira e saltadora)
  if (look.hair) {
    ctx.strokeStyle = e.type === 'big' ? 'rgba(214, 170, 120, 0.5)' : 'rgba(230, 230, 225, 0.35)'
    ctx.lineWidth = 0.8
    for (let i = 0; i < 26; i += 1) {
      const a = (i / 26) * TAU
      const x = -17 + Math.cos(a) * 20
      const y = -27 + bob + Math.sin(a) * 15
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + Math.cos(a) * 3.5, y + Math.sin(a) * 3.5)
      ctx.stroke()
    }
  }

  // marcas de cada espécie
  ctx.fillStyle = e.mark
  if (e.type === 'normal') {
    // ampulheta vermelha na barriga
    ctx.beginPath()
    ctx.moveTo(-23, -14 + bob)
    ctx.lineTo(-13, -14 + bob)
    ctx.lineTo(-18, -18.5 + bob)
    ctx.closePath()
    ctx.moveTo(-23, -23 + bob)
    ctx.lineTo(-13, -23 + bob)
    ctx.lineTo(-18, -18.5 + bob)
    ctx.closePath()
    ctx.fill()
  } else if (e.type === 'fast') {
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath()
      ctx.ellipse(-26 + i * 8, -33 + bob + i * 1.2, 3.2, 1.6, -0.2, 0, TAU)
      ctx.fill()
    }
  } else if (e.type === 'big') {
    ctx.globalAlpha = 0.35
    ctx.beginPath()
    ctx.ellipse(8, -28 + bob, 7, 3, 0, 0, TAU)
    ctx.fill()
    ctx.globalAlpha = 1
  } else if (e.type === 'jumper') {
    ctx.strokeStyle = e.mark
    ctx.lineWidth = 1.6
    for (let i = 0; i < 3; i += 1) {
      const x = -28 + i * 7
      ctx.beginPath()
      ctx.moveTo(x - 3, -34 + bob)
      ctx.lineTo(x, -30 + bob)
      ctx.lineTo(x + 3, -34 + bob)
      ctx.stroke()
    }
  }

  // brilho do exoesqueleto
  if (look.gloss) {
    ctx.fillStyle = `rgba(255, 255, 255, ${look.gloss})`
    ctx.beginPath()
    ctx.ellipse(-20, -37 + bob, 8, 3, -0.25, 0, TAU)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(8, -29 + bob, 4.5, 1.8, 0, 0, TAU)
    ctx.fill()
  }

  drawLegs(ctx, e, false, 'fill', look)

  // pedipalpos e quelíceras
  ctx.strokeStyle = look.leg
  ctx.lineWidth = 2.4
  ctx.beginPath()
  ctx.moveTo(20, -20 + bob)
  ctx.lineTo(27, -17 + bob)
  ctx.lineTo(29, -11)
  ctx.stroke()
  ctx.fillStyle = look.body[1]
  ctx.beginPath()
  ctx.ellipse(21.5, -16 + bob, 3, 4.5, 0.3, 0, TAU)
  ctx.fill()
  ctx.strokeStyle = '#e8e2d6'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(22.5, -12.5 + bob)
  ctx.quadraticCurveTo(23.5, -9.5 + bob, 21.5, -8.5 + bob)
  ctx.stroke()

  // olhos
  if (e.type === 'jumper') {
    ctx.fillStyle = '#050505'
    ctx.beginPath()
    ctx.arc(20.5, -25 + bob, 3.4, 0, TAU)
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(21.6, -26.2 + bob, 1, 0, TAU)
    ctx.fill()
  }
  for (const [x, y, r] of [[19, -28.5, 1.4], [21.4, -27, 1.2], [17, -29.5, 1], [20.4, -30.5, 0.9]]) {
    ctx.fillStyle = e.type === 'normal' || e.type === 'fast' ? '#ff2f38' : '#0a0a0a'
    ctx.beginPath()
    ctx.arc(x, y + bob, r, 0, TAU)
    ctx.fill()
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
    ctx.beginPath()
    ctx.arc(x + 0.4, y + bob - 0.4, r * 0.35, 0, TAU)
    ctx.fill()
  }

  // casulo de teia (especial do lança-teia)
  if (e.wrapped) {
    ctx.fillStyle = 'rgba(245, 245, 242, 0.9)'
    ctx.beginPath()
    ctx.ellipse(-4, -24, 34, 20, 0, 0, TAU)
    ctx.fill()
    ctx.strokeStyle = 'rgba(8, 9, 13, 0.3)'
    ctx.lineWidth = 0.9
    for (let i = -4; i <= 4; i += 1) {
      ctx.beginPath()
      ctx.moveTo(-36, -24 + i * 4)
      ctx.quadraticCurveTo(-4, -24 + i * 4 + (i % 2 ? 6 : -6), 30, -24 + i * 4)
      ctx.stroke()
    }
  }

  // clarão ao levar golpe
  if (e.flash > 0) {
    ctx.globalAlpha = Math.min(1, e.flash)
    ctx.fillStyle = '#ffffff'
    bodyPath(ctx, 1, bob, e.type)
    ctx.fill()
    ctx.globalAlpha = 1
  }
  ctx.restore()
}

/** Pedaços da aranha voando depois do golpe final. */
export function drawGib(ctx, g, S) {
  const look = LOOK[g.type] || LOOK.normal
  const a = Math.min(1, g.life / 300)
  ctx.save()
  ctx.globalAlpha = a
  ctx.translate(g.x, g.y)
  ctx.rotate(g.rot)
  const k = S * g.size
  ctx.scale(g.dir * k, k)
  ctx.lineCap = 'round'
  if (g.shape === 'leg') {
    ctx.strokeStyle = RIM
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.moveTo(-9, 2)
    ctx.lineTo(0, -9)
    ctx.lineTo(10, 3)
    ctx.stroke()
    ctx.strokeStyle = look.leg
    ctx.lineWidth = 2.8
    ctx.stroke()
  } else {
    const [rx, ry] = g.shape === 'abd' ? [21, 16] : [13, 9.5]
    const half = g.half // corte da katana: só meia elipse
    const arc = (r1, r2) => {
      ctx.beginPath()
      if (half) ctx.ellipse(0, 0, r1, r2, 0, half > 0 ? Math.PI : 0, half > 0 ? TAU : Math.PI)
      else ctx.ellipse(0, 0, r1, r2, 0, 0, TAU)
    }
    ctx.fillStyle = RIM
    arc(rx + 1.6, ry + 1.6)
    ctx.fill()
    ctx.fillStyle = look.body[1]
    arc(rx, ry)
    ctx.fill()
    if (half) {
      // interior exposto no corte
      ctx.fillStyle = g.mark
      ctx.fillRect(-rx * 0.8, -1.2, rx * 1.6, 2.4)
    } else if (g.shape === 'abd') {
      ctx.fillStyle = g.mark
      ctx.fillRect(-3, 4, 6, 6)
    }
  }
  ctx.restore()
}
