// Aranhas do Spider Rush em vista lateral: 8 pernas (4 de cada lado) com passada
// alternada, contorno claro para destacar no fundo escuro e marca colorida por tipo.

const TAU = Math.PI * 2

export const TYPES = {
  normal: { hp: 1, speed: 1, size: 1, mark: '#e62429', score: 10 },
  fast: { hp: 1, speed: 1.7, size: 0.8, mark: '#ff6b6f', score: 15 },
  big: { hp: 2, speed: 0.68, size: 1.45, mark: '#3157ff', score: 25 },
  jumper: { hp: 2, speed: 1.05, size: 1.05, mark: '#f5f5f2', score: 25 },
}

const RIM = 'rgba(245, 245, 242, 0.9)'
const HIP_X = [-1, 2, 5, 8]
const FOOT_X = [-27, -11, 12, 27]

function legs(ctx, e, far, rim) {
  for (let i = 0; i < 4; i += 1) {
    const ph = e.phase + i * (Math.PI / 2) + (far ? Math.PI : 0)
    const hip = { x: HIP_X[i] + (far ? 1 : 0), y: -14 }
    const swing = e.moving ? Math.sin(ph) * 5 : 0
    const lift = e.moving ? Math.max(0, Math.cos(ph)) * 4 : 0
    const foot = { x: FOOT_X[i] + swing + (far ? 3 : 0), y: e.air > 1 ? -4 : -lift }
    const knee = {
      x: (hip.x + foot.x) / 2 + (foot.x > hip.x ? 4 : -4),
      y: Math.min(hip.y, foot.y) - 13 + (far ? 2 : 0),
    }
    ctx.strokeStyle = rim ? RIM : far ? '#1d1e27' : '#0b0b10'
    ctx.lineWidth = rim ? 4.4 : 2.4
    ctx.beginPath()
    ctx.moveTo(hip.x, hip.y)
    ctx.lineTo(knee.x, knee.y)
    ctx.lineTo(foot.x, foot.y)
    ctx.stroke()
  }
}

function body(ctx, ex, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.ellipse(-13, -17, 15 + ex, 11.5 + ex, -0.08, 0, TAU)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(6, -14, 9 + ex, 7.2 + ex, 0, 0, TAU)
  ctx.fill()
}

/** Desenha a aranha `e` com os pés em `groundY`. */
export function drawSpider(ctx, e, groundY, S) {
  const k = S * e.size
  ctx.save()
  ctx.translate(e.x, groundY - e.air)
  ctx.scale(e.dir * k, k)
  if (e.squash) ctx.scale(1 + e.squash * 0.18, 1 - e.squash * 0.18)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // contorno de tudo primeiro; depois o preenchimento por cima
  legs(ctx, e, true, true)
  body(ctx, 1.9, RIM)
  legs(ctx, e, false, true)
  legs(ctx, e, true, false)
  body(ctx, 0, '#0b0b10')
  legs(ctx, e, false, false)

  // marca em ampulheta no abdômen
  ctx.fillStyle = e.mark
  ctx.beginPath()
  ctx.moveTo(-17, -24)
  ctx.lineTo(-9, -24)
  ctx.lineTo(-13, -19)
  ctx.closePath()
  ctx.moveTo(-17, -14)
  ctx.lineTo(-9, -14)
  ctx.lineTo(-13, -19)
  ctx.closePath()
  ctx.fill()
  // olhos e presas
  ctx.fillStyle = '#ff3b42'
  for (const [x, y] of [[12, -16.5], [13.6, -14.6], [10.8, -14]]) {
    ctx.beginPath()
    ctx.arc(x, y, 1.15, 0, TAU)
    ctx.fill()
  }
  ctx.strokeStyle = '#f5f5f2'
  ctx.lineWidth = 1.3
  ctx.beginPath()
  ctx.moveTo(14, -11)
  ctx.lineTo(15.6, -7.5)
  ctx.stroke()

  // casulo de teia (especial do lança-teia)
  if (e.wrapped) {
    ctx.fillStyle = 'rgba(245, 245, 242, 0.88)'
    ctx.beginPath()
    ctx.ellipse(-4, -16, 26, 15, 0, 0, TAU)
    ctx.fill()
    ctx.strokeStyle = 'rgba(8, 9, 13, 0.35)'
    ctx.lineWidth = 0.8
    for (let i = -3; i <= 3; i += 1) {
      ctx.beginPath()
      ctx.moveTo(-26, -16 + i * 3.5)
      ctx.quadraticCurveTo(-4, -16 + i * 3.5 + (i % 2 ? 5 : -5), 20, -16 + i * 3.5)
      ctx.stroke()
    }
  }

  // clarão ao levar golpe
  if (e.flash > 0) {
    ctx.globalAlpha = Math.min(1, e.flash)
    body(ctx, 1, '#ffffff')
    ctx.globalAlpha = 1
  }
  ctx.restore()
}

/** Pedaços da aranha voando depois do golpe final. */
export function drawGib(ctx, g, S) {
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
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(-6, 0)
    ctx.lineTo(0, -6)
    ctx.lineTo(7, 2)
    ctx.stroke()
    ctx.strokeStyle = '#0b0b10'
    ctx.lineWidth = 2.2
    ctx.stroke()
  } else {
    const [rx, ry] = g.shape === 'abd' ? [15, 11.5] : [9, 7.2]
    const half = g.half // corte da katana: só meia elipse
    ctx.fillStyle = RIM
    ctx.beginPath()
    if (half) ctx.ellipse(0, 0, rx + 1.9, ry + 1.9, 0, half > 0 ? Math.PI : 0, half > 0 ? TAU : Math.PI)
    else ctx.ellipse(0, 0, rx + 1.9, ry + 1.9, 0, 0, TAU)
    ctx.fill()
    ctx.fillStyle = '#0b0b10'
    ctx.beginPath()
    if (half) ctx.ellipse(0, 0, rx, ry, 0, half > 0 ? Math.PI : 0, half > 0 ? TAU : Math.PI)
    else ctx.ellipse(0, 0, rx, ry, 0, 0, TAU)
    ctx.fill()
    if (g.shape === 'abd') {
      ctx.fillStyle = g.mark
      ctx.fillRect(-3, -4, 6, 8)
    }
  }
  ctx.restore()
}
