// Spider Rush — jogo escondido do portfólio.
// Estilo "One Finger Death Punch": o lutador fica no centro e só ataca para a
// esquerda ou para a direita; as aranhas vêm dos dois lados. Atacar sem aranha
// ao alcance é um erro e deixa o lutador vulnerável por um instante.
//
// Tempos separados: o do jogo (aranhas, partículas) pode ficar lento ou parar
// (câmera lenta no especial, "hit-stop" no impacto) enquanto o lutador segue
// no tempo real, então os controles nunca travam.

import { WEAPONS, WEAPON_POOL, METER_MAX, MAX_WLV, weaponStats } from './weapons'
import {
  IDLE, ATTACKS, CHARGE, HURT, MISS, SHEATHE, HIT_AT,
  attackPose, mixPose, withIdle, bones, trailPoints, drawFighter,
  idlePose, smoothPose, hitReach, holdPose,
} from './fighter'
import { TYPES, drawSpider, drawGib } from './spiders'

const TAU = Math.PI * 2
const rand = (a, b) => a + Math.random() * (b - a)
const pick = (list) => list[Math.floor(Math.random() * list.length)]
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const eo = (t) => 1 - (1 - t) ** 3
const ei = (t) => t * t * t
const eio = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
const RED = '#e62429'
const BLUE = '#3157ff'
const WHITE = '#f5f5f2'
const INK = '#08090d'
const DISPLAY = 'Chetta, Impact, "Arial Narrow", sans-serif'
const MONO = '"JetBrains Mono", "Courier New", monospace'
const BEST_KEY = 'ww-spider-best'
const FIG = 1.15 // escala do lutador em relação ao resto
// Fúria: golpes perfeitos em sequência (sem errar nem levar dano) aceleram o lutador
const FURY_AT = [0, 8, 20, 40] // combo para entrar em cada nível
const FURY_SPEED = [1, 0.85, 0.72, 0.6] // duração dos golpes
const FURY_RATE = [0, 45, 100, 170] // faíscas por segundo
const FURY_COLORS = [[], ['#9fb8ff', '#f5f5f2'], ['#3157ff', '#9fb8ff', '#e62429'], ['#e62429', '#ff8a8e', '#f5f5f2', '#3157ff']]

export const isPt = () => (document.documentElement.lang || '').startsWith('pt')
export const tr = (o) => (isPt() ? o.pt : o.en)
const TXT = {
  score: { pt: 'PONTOS', en: 'SCORE' },
  best: { pt: 'RECORDE', en: 'BEST' },
  level: { pt: 'NÍVEL', en: 'LEVEL' },
  combo: { pt: 'COMBO', en: 'COMBO' },
  miss: { pt: 'ERROU!', en: 'MISS!' },
  clear: { pt: 'NÍVEL COMPLETO', en: 'LEVEL CLEAR' },
  space: { pt: 'ESPAÇO', en: 'SPACE' },
  ready: { pt: 'ESPECIAL PRONTO', en: 'SPECIAL READY' },
  fury: { pt: 'FÚRIA', en: 'FURY' },
  wlv: { pt: 'NV', en: 'LV' },
}

const readBest = () => {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0
  } catch {
    return 0
  }
}
const writeBest = (v) => {
  try {
    localStorage.setItem(BEST_KEY, String(v))
  } catch {
    /* sem armazenamento */
  }
}

export function createGame(canvas, cb = {}) {
  const ctx = canvas.getContext('2d')
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const touch = window.matchMedia('(hover: none)').matches

  let W = 0
  let H = 0
  let S = 1
  let dpr = 1
  let G = 0 // linha do chão
  let CX = 0

  // estado da partida
  let mode = 'title' // title | play | special | clear | choose | dying | over
  let weapon = 'fists'
  let wLevels = {} // nível de cada arma nesta partida
  let level = 1
  let score = 0
  let best = readBest()
  let combo = 0
  let maxCombo = 0
  let comboPop = 0
  let fury = 0
  let kills = 0
  let quota = 0
  let meter = 0
  let lives = 3
  let options = []
  let spawnT = 0
  let modeT = 0
  let pendingClear = false
  let special = null
  let banner = null

  // mundo e efeitos
  let enemies = []
  let parts = []
  let gibs = []
  let stains = []
  let slashes = []
  let ghosts = []
  let popups = []
  let trail = []
  let waves = []
  let projs = []
  let webs = []
  let voidLines = []

  // câmera e tempo
  let timeScale = 1
  let tsTarget = 1
  let hitStop = 0
  let shake = 0
  let flashA = 0
  let flashC = WHITE
  let zoom = 1
  let zoomT = 1
  let bars = 0
  let barsT = 0
  let clock = 0
  let last = 0
  let raf = 0
  let meterWasFull = false
  let lastHit = null
  let scroll = 0 // quanto o cenário já andou (para o chão e o fundo acompanharem)

  const player = {
    x: 0, air: 0, facing: 1, anim: null, queued: null, stun: 0, invuln: 0, hurt: 0,
    variant: 0, dashFrom: 0, dashTo: 0, ghostT: 0, override: null, trailKey: null, b: null, pose: null, hold: null,
  }

  const style = () => WEAPONS[weapon].style
  const wlv = (id = weapon) => wLevels[id] || 1
  const ws = () => weaponStats(weapon, wlv())
  const idle = () => IDLE[style()]
  const clampX = (x) => clamp(x, 34 * S, W - 34 * S) // o avanço sempre alcança a aranha
  const toWorld = (p) => ({ x: player.x + p.x * player.facing * S * FIG, y: G - player.air + p.y * S * FIG })

  /* ---------- tela ---------- */

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.75)
    W = window.innerWidth
    H = window.innerHeight
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    S = clamp(Math.min(W / 1000, H / 640), 0.7, 1.5)
    G = H * 0.74
    const oldCX = CX
    CX = W / 2
    player.x = oldCX ? clamp(player.x + (CX - oldCX), 60 * S, W - 60 * S) : CX
  }

  /* ---------- efeitos ---------- */

  const addShake = (v) => {
    if (!reduce) shake = Math.max(shake, v)
  }
  const flash = (c, a) => {
    flashC = c
    flashA = Math.max(flashA, reduce ? a * 0.4 : a)
  }
  const popup = (x, y, text, c = WHITE, size = 1, kind = 'text') =>
    popups.push({ x, y, text, c, size, kind, life: kind === 'sfx' ? 620 : 800, max: kind === 'sfx' ? 620 : 800, rot: kind === 'sfx' ? rand(-0.25, 0.25) : 0 })

  const sparks = (x, y, dir, n, colors = [WHITE, RED, BLUE], speed = 1) => {
    for (let i = 0; i < n; i += 1) {
      const a = (dir > 0 ? 0 : Math.PI) + rand(-1.1, 1.1)
      const v = rand(260, 760) * S * speed
      parts.push({ k: 'spark', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - rand(0, 200) * S, life: rand(220, 460), max: 460, c: pick(colors), w: rand(1.4, 2.8) })
    }
  }
  const ring = (x, y, r0, r1, c = WHITE, life = 260, w = 3) =>
    parts.push({ k: 'ring', x, y, r0, r1, c, life, max: life, w })
  const burst = (x, y, r, c = WHITE, life = 160) => parts.push({ k: 'burst', x, y, r, c, life, max: life, rot: Math.random() * TAU })
  const dust = (x, n) => {
    for (let i = 0; i < n; i += 1) {
      parts.push({ k: 'dust', x: x + rand(-20, 20) * S, y: G - rand(0, 6) * S, vx: rand(-90, 90) * S, vy: -rand(20, 90) * S, life: rand(380, 700), max: 700, r: rand(4, 10) * S })
    }
  }
  const slash = (x, y, dir, opts = {}) =>
    slashes.push({ x, y, dir, r: (opts.r || 70) * S, rot: opts.rot ?? rand(-0.5, 0.5), c: opts.c || WHITE, life: opts.life || 200, max: opts.life || 200, kind: opts.kind || 'arc', len: (opts.len || 160) * S })
  const ghost = (c = 'rgba(49, 87, 255, 0.55)') => {
    if (!player.b) return
    ghosts.push({ x: player.x, air: player.air, facing: player.facing, b: player.b, c, life: 220, max: 220 })
  }
  const bolt = (x1, y1, x2, y2) => parts.push({ k: 'bolt', x1, y1, x2, y2, life: 160, max: 160, seed: Math.random() * 100 })

  /* ---------- partida ---------- */

  const resetLevel = () => {
    kills = 0
    quota = 10 + level * 6
    enemies = []
    projs = []
    webs = []
    waves = []
    voidLines = []
    spawnT = 350
    player.x = CX
    player.air = 0
    player.anim = null
    player.queued = null
    player.stun = 0
    player.invuln = 0
    player.override = null
    player.hold = null
  }

  const start = () => {
    weapon = 'fists'
    wLevels = {}
    level = 1
    score = 0
    combo = 0
    fury = 0
    maxCombo = 0
    meter = 0
    lives = 3
    gibs = []
    stains = []
    parts = []
    resetLevel()
    mode = 'play'
    tsTarget = 1
    barsT = 0
    zoomT = 1
    cb.onScreen?.(null)
    banner = { title: `${tr(TXT.level)} 01`, sub: tr(WEAPONS[weapon].name).toUpperCase(), t: 0, dur: 1700 }
  }

  const levelClear = () => {
    mode = 'clear'
    modeT = 0
    tsTarget = 0.18
    flash(WHITE, 0.35)
    addShake(8)
    let i = 0
    for (const e of enemies) if (e.alive) e.chainAt = 220 + i++ * 90
    banner = { title: tr(TXT.clear), sub: `${tr(TXT.level)} ${String(level).padStart(2, '0')}`, t: 0, dur: 1500 }
  }

  const choose = (id) => {
    if (mode !== 'choose' || !WEAPONS[id]) return
    const upgrade = id === weapon
    if (upgrade) wLevels[id] = Math.min(MAX_WLV, wlv(id) + 1)
    weapon = id
    level += 1
    resetLevel()
    mode = 'play'
    tsTarget = 1
    cb.onScreen?.(null)
    const name = `${tr(WEAPONS[weapon].name).toUpperCase()} · ${tr(TXT.wlv)} ${wlv()}`
    banner = { title: `${tr(TXT.level)} ${String(level).padStart(2, '0')}`, sub: upgrade ? `▲ ${name}` : name, t: 0, dur: 1700 }
    if (upgrade) {
      flash(WEAPONS[weapon].color, 0.3)
      ring(player.x, G - 50 * S, 10 * S, 240 * S, WHITE, 600, 4)
    }
    ring(player.x, G - 50 * S, 10 * S, 160 * S, WEAPONS[weapon].color, 500, 3)
  }

  const gameOver = () => {
    mode = 'dying'
    modeT = 0
    tsTarget = 0.2
    player.anim = null
    if (score > best) {
      best = score
      writeBest(best)
    }
  }

  /* ---------- aranhas ---------- */

  const typeFor = () => {
    const r = Math.random()
    if (level === 1) return r < 0.82 ? 'normal' : 'fast'
    if (level === 2) return r < 0.55 ? 'normal' : r < 0.8 ? 'fast' : 'big'
    return r < 0.36 ? 'normal' : r < 0.62 ? 'fast' : r < 0.8 ? 'big' : 'jumper'
  }

  const spawn = (side, type, offset = 0) => {
    const t = TYPES[type]
    enemies.push({
      x: side < 0 ? -40 * S - offset : W + 40 * S + offset,
      type, hp: t.hp, mark: t.mark, size: t.size, score: t.score,
      speed: (138 + level * 15) * t.speed * S,
      dir: -side, phase: Math.random() * TAU, air: 0, flash: 0, squash: 0,
      kb: 0, stagger: 0, locked: false, alive: true, jumped: false, leap: null,
      wrapped: false, moving: true, r: 30 * S * t.size, chainAt: 0,
    })
  }

  const alive = () => enemies.filter((e) => e.alive)

  const updateSpawn = (gdt) => {
    spawnT -= gdt
    const living = alive()
    const pending = quota - kills - living.length
    if (spawnT > 0 || pending <= 0) return
    const left = living.filter((e) => e.x < player.x).length
    const right = living.length - left
    const side = left - right > 2 ? 1 : right - left > 2 ? -1 : Math.random() < 0.5 ? -1 : 1
    spawn(side, typeFor())
    if (pending > 1 && Math.random() < 0.16 + level * 0.03) spawn(side, typeFor(), rand(70, 130) * S)
    spawnT = Math.max(340, 950 - level * 85) * rand(0.7, 1.3)
  }

  const updateEnemies = (gdt) => {
    for (const e of enemies) {
      if (!e.alive) continue
      e.flash = Math.max(0, e.flash - gdt * 0.006)
      e.squash *= Math.exp(-gdt * 0.012)
      if (e.leap) {
        e.leap.t += gdt
        const p = Math.min(1, e.leap.t / e.leap.dur)
        e.x = e.leap.from + (e.leap.to - e.leap.from) * p
        e.air = Math.sin(Math.PI * p) * 95 * S
        e.moving = false
        if (p >= 1) {
          e.leap = null
          e.air = 0
          e.squash = 1
          dust(e.x, 4)
        }
        continue
      }
      if (special?.phase === 'action' && special.w === 'staff') continue // o tornado controla
      const toP = Math.sign(player.x - e.x) || 1
      e.dir = toP
      if (e.locked && !e.wrapped) {
        // alvo do golpe: espera o impacto parado (o avanço não erra)
        e.moving = false
        e.stagger = 0
        continue
      }
      if (e.stagger > 0) {
        e.stagger -= gdt
        e.x -= toP * e.kb * (gdt / 1000)
        e.kb *= Math.exp(-gdt * 0.008)
        e.moving = false
        continue
      }
      if (e.air > 0 && !e.wrapped) e.air = Math.max(0, e.air - gdt * 0.4 * S)
      if (e.locked || e.wrapped) {
        e.moving = false
        continue
      }
      e.moving = true
      e.x += toP * e.speed * (gdt / 1000)
      e.phase += gdt * 0.016 * (e.speed / (110 * S))
      if (mode === 'play' && player.invuln <= 0 && Math.abs(e.x - player.x) < e.r + 14 * S) bite(e)
    }
    if (enemies.length > 40) enemies = enemies.filter((e) => e.alive)
  }

  const bite = (e) => {
    player.hold = null
    lives -= 1
    combo = 0
    player.invuln = 1400
    player.hurt = 380
    player.anim = null
    player.queued = null
    player.stun = 0
    hitStop = 120
    addShake(16)
    flash(RED, 0.45)
    sparks(player.x, G - 50 * S, -e.dir, 14, [RED, WHITE])
    popup(player.x, G - 140 * S, '-1', RED, 1.4)
    for (const o of enemies) {
      if (o.alive && Math.abs(o.x - player.x) < 320 * S) {
        o.stagger = 380
        o.kb = 380 * S
        o.locked = false
      }
    }
    if (lives <= 0) gameOver()
  }

  /* ---------- golpes ---------- */

  const comboMult = () => 1 + Math.floor(combo / 10) * 0.5

  const kill = (e, dir, kind = 'normal') => {
    if (!e.alive) return
    e.alive = false
    e.locked = false
    const k = S * e.size
    const y = G - e.air - 24 * k
    const power = kind === 'launch' ? 2 : kind === 'fling' ? 1.6 : 1
    const base = { size: e.size, dir: e.dir, mark: e.mark, type: e.type, rot: 0 }
    if (kind === 'split') {
      gibs.push({ ...base, shape: 'abd', half: 1, x: e.x, y: y - 2, vx: dir * rand(40, 120) * S, vy: -rand(380, 520) * S, vr: rand(-6, 6), life: 1100 })
      gibs.push({ ...base, shape: 'abd', half: -1, x: e.x, y: y + 2, vx: dir * rand(60, 160) * S, vy: -rand(80, 180) * S, vr: rand(-6, 6), life: 1100 })
    } else {
      gibs.push({ ...base, shape: 'abd', x: e.x - dir * 8 * k, y, vx: dir * rand(140, 340) * S * power, vy: -rand(260, 460) * S * power, vr: rand(-14, 14), life: 1000 })
      gibs.push({ ...base, shape: 'ceph', x: e.x + dir * 6 * k, y, vx: dir * rand(220, 420) * S * power, vy: -rand(200, 380) * S * power, vr: rand(-16, 16), life: 1000 })
    }
    for (let i = 0; i < 6; i += 1) {
      gibs.push({ ...base, shape: 'leg', x: e.x + rand(-14, 14) * k, y: y + rand(-6, 6) * k, vx: (dir * rand(60, 360) + rand(-120, 120)) * S * power, vy: -rand(150, 520) * S * power, vr: rand(-20, 20), life: rand(450, 750) })
    }
    sparks(e.x, y, dir, kind === 'normal' ? 10 : 16, [WHITE, BLUE, e.mark])
    ring(e.x, y, 6 * S, 70 * S * e.size, WHITE, 240, 2.5)
    stains.push({ x: e.x, w: rand(18, 30) * k, life: 5000, max: 5000 })
    kills += 1
    const gain = e.score * comboMult()
    score += Math.round(gain)
    popup(e.x, y - 30 * k, `+${Math.round(gain)}`, WHITE, 0.8)
    meter = Math.min(METER_MAX, meter + ws().meter)
    if (kills >= quota) {
      if (mode === 'special') pendingClear = true
      else if (mode === 'play') levelClear()
    }
  }

  const damage = (e, dmg, dir) => {
    e.hp -= dmg
    e.flash = 1.2
    e.squash = 0.8
    e.locked = false
    if (e.hp <= 0) {
      kill(e, dir)
      return true
    }
    if (e.type === 'jumper' && !e.jumped) {
      // salta por cima do lutador e volta pelo outro lado
      e.jumped = true
      const dist = Math.abs(e.x - player.x)
      e.leap = { from: e.x, to: player.x + dir * Math.max(dist, 120 * S), t: 0, dur: 520 }
    } else {
      e.stagger = 260
      e.kb = 520 * S
    }
    return false
  }

  const startAttack = (dir) => {
    const w = ws()
    const st = w.style
    const range = w.range * S
    const side = alive()
      .filter((e) => !e.leap && Math.sign(e.x - player.x) === dir && Math.abs(e.x - player.x) <= range + e.r)
      .sort((a, b) => Math.abs(a.x - player.x) - Math.abs(b.x - player.x))
    const target = side[0] || null
    player.facing = dir
    const n = ATTACKS[st].length
    let v = Math.floor(Math.random() * n)
    for (let i = 0; i < 8 && n > 2 && (v === player.variant || v === player.prevVariant); i += 1) v = Math.floor(Math.random() * n)
    player.prevVariant = player.variant
    player.variant = v
    const extra = []
    if (target && w.cleave) extra.push(...side.slice(1, w.cleave))
    if (target && w.splash) extra.push(...side.filter((e) => e !== target && Math.abs(e.x - target.x) < w.splash * S))
    const from = player.pose ? { ...player.pose } : idle()
    player.anim = { variant: player.variant, u: 0, dur: w.dur * FURY_SPEED[fury] * (target ? 1 : 1.3), dir, target, extra, miss: !target, hitDone: false, from }
    player.hold = null
    player.trailKey = ATTACKS[st][player.variant].trail
    if (target) {
      target.locked = true
      player.dashFrom = player.x
      // para onde a ponta do golpe encosta no corpo da aranha
      player.anim.reachOff = hitReach(st, player.variant) * S * FIG + 14 * S * target.size
      player.dashTo = w.ranged ? player.x : clampX(target.x - dir * player.anim.reachOff)
    } else {
      player.stun = 380
      combo = 0
      popup(player.x + dir * 40 * S, G - 150 * S, tr(TXT.miss), '#9aa0ad', 0.9)
    }
  }

  const attack = (dir) => {
    if (mode !== 'play' || player.stun > 0 || player.hurt > 0) return
    if (player.anim && player.anim.u < 0.55) {
      player.queued = dir
      return
    }
    startAttack(dir)
  }

  const handWorld = () => toWorld(player.b ? player.b.hF : { x: 20, y: -60 })

  const resolveHit = (a) => {
    const w = ws()
    const st = w.style
    const e = a.target
    const heavy = st === 'smash'
    const hy = G - e.air - 24 * S * e.size
    const hx = e.x - a.dir * e.r * 0.5
    if (w.ranged) {
      const h = handWorld()
      webs.push({ x1: h.x, y1: h.y, x2: hx, y2: hy, life: 160, max: 160 })
    }
    const killed = damage(e, w.dmg, a.dir)
    for (const o of a.extra) if (o.alive) damage(o, 1, a.dir)
    combo += 1 + a.extra.length
    maxCombo = Math.max(maxCombo, combo)
    comboPop = 1
    score += 5
    hitStop = killed ? (heavy ? 95 : 65) : 45
    addShake(heavy ? 11 : killed ? 6 : 4)
    sparks(hx, hy, a.dir, heavy ? 16 : 9, [WHITE, w.color, RED])
    ring(hx, hy, 4 * S, (heavy ? 90 : 55) * S, WHITE, 220, heavy ? 4 : 2.5)
    if (st === 'punch' || st === 'smash') burst(hx, hy, (heavy ? 60 : 40) * S, WHITE)
    if (st === 'slash' || st === 'dual' || st === 'spin') {
      slash(hx, hy, a.dir, { r: st === 'slash' ? 85 : st === 'spin' ? 95 : 55, c: w.color, rot: st === 'spin' ? rand(-1.2, 1.2) : rand(-0.7, 0.4) })
    }
    if (heavy) dust(hx, 8)
    if (killed && (Math.random() < 0.4 || e.type === 'big')) popup(hx, hy - 60 * S, pick(w.sfx), WHITE, 1.1, 'sfx')
  }

  const updatePlayer = (pdt) => {
    player.stun = Math.max(0, player.stun - pdt)
    player.invuln = Math.max(0, player.invuln - pdt)
    player.hurt = Math.max(0, player.hurt - pdt)
    const a = player.anim
    if (a) {
      a.u += pdt / a.dur
      if (a.target && a.u <= HIT_AT + 0.02 && !WEAPONS[weapon].ranged) {
        if (a.target.alive) player.dashTo = clampX(a.target.x - a.dir * a.reachOff)
        player.x = player.dashFrom + (player.dashTo - player.dashFrom) * eo(Math.min(1, a.u / (HIT_AT - 0.04)))
        player.ghostT -= pdt
        if (player.ghostT <= 0) {
          ghost(fury ? FURY_COLORS[fury][0] + '99' : undefined)
          player.ghostT = fury >= 2 ? 12 : 18
        }
      }
      if (!a.hitDone && a.u >= HIT_AT) {
        a.hitDone = true
        if (a.target && a.target.alive) resolveHit(a)
        else if (!a.target) {
          // golpe no vazio: só o deslocamento de ar
          ring(player.x + a.dir * 60 * S, G - 60 * S, 4 * S, 34 * S, 'rgba(245,245,242,0.5)', 180, 1.5)
        }
      }
      if (player.queued && a.u >= 0.55 && player.stun <= 0) {
        const d = player.queued
        player.queued = null
        startAttack(d)
        return
      }
      if (a.u >= 1) {
        player.anim = null
        player.trailKey = null
        player.hold = a.miss ? null : { variant: a.variant, since: clock }
      }
    }
  }

  /* ---------- especiais ---------- */

  const trySpecial = () => {
    if (mode !== 'play' || meter < METER_MAX || player.hurt > 0) return
    mode = 'special'
    player.hold = null
    meter = 0
    player.anim = null
    player.queued = null
    player.stun = 0
    player.trailKey = null
    const targets = alive()
      .filter((e) => e.x > -30 * S && e.x < W + 30 * S)
      .sort((a, b) => a.x - b.x)
    for (const e of targets) e.locked = true
    special = { w: weapon, t: 0, act: 0, out: 0, phase: 'intro', targets, d: {} }
    tsTarget = 0.04
    barsT = 1
    zoomT = 1.14
    flash(WHITE, 0.25)
    addShake(6)
  }

  const sideOf = (e) => Math.sign(e.x - player.x) || 1

  const ACTIONS = {
    // teleporta até cada aranha e soca
    fists(sp) {
      const step = 125
      const n = sp.targets.length
      const t = sp.act
      const d = sp.d
      if (!n) {
        if (!d.blast) {
          d.blast = true
          for (const s of [-1, 1]) ring(player.x + s * 60 * S, G - 60 * S, 10 * S, 240 * S, RED, 420, 5)
          addShake(14)
        }
        player.override = attackPose('punch', 0, Math.min(1, t / 320), idle())
        return t > 450
      }
      const i = Math.min(n - 1, Math.floor(t / step))
      const e = sp.targets[i]
      if (d.i !== i) {
        const from = { x: player.x, y: G - 60 * S }
        ghost('rgba(230, 36, 41, 0.6)')
        const dir = Math.sign(e.x - player.x) || 1
        player.facing = dir
        player.x = clamp(e.x - dir * (hitReach('punch', i % 4) * S * FIG + 14 * S * e.size), 30 * S, W - 30 * S)
        bolt(from.x, from.y, player.x, G - 60 * S)
        d.i = i
        d.hit = false
        d.v = i % 4
      }
      const u = (t - i * step) / step
      player.trailKey = d.v === 2 ? 'fF' : d.v === 1 ? 'hB' : 'hF'
      player.override = attackPose('punch', d.v, Math.min(1, u * 1.2), idle())
      if (!d.hit && u >= 0.38 && t < n * step) {
        d.hit = true
        if (e.alive) {
          const hy = G - e.air - 24 * S * e.size
          burst(e.x, hy, 60 * S, WHITE)
          ring(e.x, hy, 6 * S, 120 * S, RED, 300, 4)
          addShake(9)
          hitStop = 40
          if (i % 2 === 0) popup(e.x, hy - 70 * S, pick(WEAPONS.fists.sfx), WHITE, 1.2, 'sfx')
          kill(e, player.facing, 'fling')
        }
      }
      if (t >= n * step) {
        player.trailKey = null
        const r = Math.min(1, (t - n * step) / 220)
        player.x += (CX - player.x) * eo(r)
        return r >= 1
      }
      return false
    },

    // atravessa a tela e corta tudo ao meio
    katana(sp) {
      const t = sp.act
      const d = sp.d
      const y = G - 50 * S
      const L = 50 * S
      const R = W - 50 * S
      if (!d.init) {
        d.init = true
        d.x0 = player.x
        d.line = { x1: player.x, x2: player.x, y, life: 1, fade: false }
        voidLines.push(d.line)
      }
      const dashPose = withIdle('slash', ATTACKS.slash[1].hit)
      if (t < 170) {
        player.facing = -1
        player.x = d.x0 + (L - d.x0) * eo(t / 170)
        d.line.x1 = Math.min(d.line.x1, player.x)
        player.override = dashPose
        ghost('rgba(159, 184, 255, 0.55)')
      } else if (t < 440) {
        player.facing = 1
        player.x = L + (R - L) * eio((t - 170) / 270)
        d.line.x2 = Math.max(d.line.x2, player.x)
        player.override = dashPose
        ghost('rgba(159, 184, 255, 0.55)')
      } else if (t < 780) {
        player.override = mixPose(player.override, withIdle('slash', SHEATHE), 0.15)
        if (t >= 720 && !d.cut) {
          d.cut = true
          flash(WHITE, 0.85)
          addShake(24)
          hitStop = 90
          for (const e of sp.targets) {
            if (!e.alive) continue
            const hy = G - e.air - 24 * S * e.size
            slash(e.x, hy, 1, { kind: 'line', rot: rand(-0.75, -0.45), len: 190, life: 420, c: '#9fb8ff' })
            kill(e, sideOf(e), 'split')
          }
          d.line.fade = true
        }
      } else {
        const p = Math.min(1, (t - 780) / 260)
        player.x += (CX - player.x) * eo(p)
        player.override = mixPose(player.override, idle(), 0.12)
        return p >= 1
      }
      return false
    },

    // salta e afunda o chão
    hammer(sp) {
      const t = sp.act
      const d = sp.d
      const raised = withIdle('smash', ATTACKS.smash[0].wind)
      if (t < 300) {
        player.air = Math.sin((t / 300) * Math.PI * 0.5) * 160 * S
        player.override = mixPose(idle(), raised, eo(Math.min(1, t / 160)))
      } else if (t < 380) {
        const p = (t - 300) / 80
        player.air = 160 * S * (1 - ei(p))
        player.trailKey = 'tF'
        player.override = mixPose(raised, withIdle('smash', ATTACKS.smash[0].hit), eo(p))
      } else {
        player.air = 0
        player.trailKey = null
        if (!d.slam) {
          d.slam = true
          addShake(28)
          flash(WHITE, 0.6)
          hitStop = 90
          d.wave = { x: player.x, r: 0, life: 1, cracks: Array.from({ length: 14 }, () => ({ x: rand(-1, 1), len: rand(30, 110) })) }
          waves.push(d.wave)
          dust(player.x, 22)
          ring(player.x, G - 4 * S, 10 * S, 260 * S, WHITE, 480, 5)
          popup(player.x, G - 190 * S, 'BOOM!', WHITE, 1.8, 'sfx')
        }
        player.override = withIdle('smash', ATTACKS.smash[0].hit)
        for (const e of sp.targets) {
          if (e.alive && Math.abs(e.x - d.wave.x) <= d.wave.r) kill(e, sideOf(e), 'launch')
        }
        return t > 1150
      }
      return false
    },

    // tornado que puxa e arremessa
    staff(sp, rdt) {
      const t = sp.act
      const d = sp.d
      d.spin = t * 0.045
      player.trailKey = 'staff'
      player.override = withIdle('spin', { lean: 0.15 * Math.sin(t * 0.02), aF1: 1.57 + Math.sin(t * 0.03) * 0.3, aF2: 0, w: d.spin, aB1: 1.3, aB2: 0.3, lF1: 0.6, lF2: -0.5 })
      if (t > 120) {
        for (const e of sp.targets) {
          if (!e.alive) continue
          e.x += (player.x - e.x) * (1 - Math.exp(-rdt * 0.0045))
          e.air = Math.min(80 * S, e.air + rdt * 0.12 * S)
          e.phase += rdt * 0.05
          e.moving = true
          if (Math.abs(e.x - player.x) < 70 * S) {
            kill(e, sideOf(e), 'fling')
            addShake(6)
          }
        }
      }
      if (t > 1100) for (const e of sp.targets) if (e.alive) kill(e, sideOf(e), 'fling')
      if (t > 1250) {
        player.trailKey = null
        return true
      }
      return false
    },

    // teias em todas e casulos explodindo
    web(sp) {
      const t = sp.act
      const d = sp.d
      const n = sp.targets.length
      const step = 70
      const i = Math.floor(t / step)
      if (i < n && d.i !== i) {
        d.i = i
        const e = sp.targets[i]
        if (e.alive) {
          player.facing = sideOf(e)
          const h = handWorld()
          webs.push({ x1: h.x, y1: h.y, e, life: 99999, max: 99999 })
          e.wrapped = true
          e.flash = 1
          sparks(e.x, G - 26 * S, -player.facing, 5, [WHITE])
          popup(e.x, G - 80 * S, 'THWIP!', WHITE, 0.8, 'sfx')
        }
      }
      player.override = attackPose('shoot', (d.i || 0) % 2, 0.5, idle())
      const T2 = n * step + 280
      if (t >= T2) {
        const k = Math.floor((t - T2) / 45)
        for (let j = 0; j <= Math.min(k, n - 1); j += 1) {
          const e = sp.targets[j]
          if (e.alive) {
            ring(e.x, G - 26 * S, 8 * S, 110 * S, WHITE, 320, 4)
            burst(e.x, G - 26 * S, 56 * S, WHITE, 200)
            addShake(7)
            kill(e, sideOf(e), 'launch')
            webs = webs.filter((wb) => wb.e !== e)
          }
        }
        return t >= T2 + n * 45 + 300
      }
      return n === 0 && t > 420
    },

    // salta e lança adagas em todas
    daggers(sp) {
      const t = sp.act
      const d = sp.d
      const up = withIdle('dual', { ...CHARGE.dual, aF1: 2.9, aB1: 2.8 })
      if (t < 260) {
        player.air = eo(t / 260) * 130 * S
        player.override = mixPose(idle(), up, eo(t / 260))
      } else {
        if (!d.thrown) {
          d.thrown = true
          const h = handWorld()
          sp.targets.forEach((e, i) => projs.push({ x: h.x, y: h.y, sx: h.x, sy: h.y, e, t: -i * 25, dur: 280, rot: 0 }))
          for (let i = 0; i < 6; i += 1) projs.push({ x: h.x, y: h.y, sx: h.x, sy: h.y, e: null, tx: h.x + rand(-1, 1) * W * 0.5, ty: G, t: -i * 30, dur: 320, rot: 0 })
          flash(WHITE, 0.3)
        }
        player.override = mixPose(player.override, withIdle('dual', ATTACKS.dual[0].hit), 0.25)
        const p = Math.min(1, (t - 260) / 520)
        player.air = 130 * S * (1 - ei(p))
        return t > 900 + sp.targets.length * 25 && projs.length === 0
      }
      return false
    },
  }

  const updateSpecial = (rdt) => {
    const sp = special
    sp.t += rdt
    if (sp.phase === 'intro') {
      player.override = mixPose(idle(), withIdle(style(), CHARGE[style()]), eo(Math.min(1, sp.t / 260)))
      if (Math.random() < 0.7) {
        parts.push({ k: 'aura', x: player.x + rand(-40, 40) * S, y: G - rand(0, 30) * S, vy: -rand(120, 260) * S, life: rand(300, 600), max: 600, c: pick([WEAPONS[weapon].color, WHITE, RED]), s: rand(2, 5) * S })
      }
      if (sp.t >= 520) {
        sp.phase = 'action'
        tsTarget = 0.22
        zoomT = 1.04
        flash(WHITE, 0.45)
        addShake(10)
        ring(player.x, G - 60 * S, 20 * S, 300 * S, WEAPONS[weapon].color, 420, 4)
      }
    } else if (sp.phase === 'action') {
      sp.act += rdt
      if (ACTIONS[sp.w](sp, rdt)) {
        sp.phase = 'outro'
        tsTarget = 1
        barsT = 0
        zoomT = 1
      }
    } else {
      sp.out += rdt
      player.override = mixPose(player.override || idle(), idle(), Math.min(1, sp.out / 250))
      player.air = Math.max(0, player.air - rdt * 0.6 * S)
      if (sp.out >= 380) {
        mode = 'play'
        special = null
        player.override = null
        player.trailKey = null
        player.air = 0
        for (const e of enemies) {
          e.locked = false
          e.wrapped = false
        }
        webs = []
        if (pendingClear) {
          pendingClear = false
          levelClear()
        }
      }
    }
  }

  /* ---------- atualização ---------- */

  const updateFx = (gdt, rdt) => {
    const g = 1400 * S
    for (const p of parts) {
      p.life -= p.k === 'aura' || p.k === 'bolt' || p.k === 'ember' ? rdt : gdt
      if (p.k === 'spark') {
        p.x += p.vx * (gdt / 1000)
        p.y += p.vy * (gdt / 1000)
        p.vy += g * 0.6 * (gdt / 1000)
        p.vx *= Math.exp(-gdt * 0.002)
      } else if (p.k === 'dust') {
        p.x += p.vx * (gdt / 1000)
        p.y += p.vy * (gdt / 1000)
        p.r += gdt * 0.012 * S
      } else if (p.k === 'aura') {
        p.y += p.vy * (rdt / 1000)
      } else if (p.k === 'ember') {
        p.x += p.vx * (rdt / 1000)
        p.y += p.vy * (rdt / 1000)
        p.vx += Math.sin(clock * 0.02 + p.y * 0.05) * 12 * S
        p.vy *= Math.exp(-rdt * 0.0015)
      }
    }
    parts = parts.filter((p) => p.life > 0)
    if (parts.length > 500) parts.splice(0, parts.length - 500)

    for (const b of gibs) {
      b.life -= gdt
      b.x += b.vx * (gdt / 1000)
      b.y += b.vy * (gdt / 1000)
      b.vy += g * (gdt / 1000)
      b.rot += b.vr * (gdt / 1000)
      if (b.y > G - 4 * S) {
        b.y = G - 4 * S
        b.vy *= -0.32
        b.vx *= 0.55
        b.vr *= 0.5
      }
    }
    gibs = gibs.filter((b) => b.life > 0)
    if (gibs.length > 260) gibs.splice(0, gibs.length - 260)

    for (const s of stains) s.life -= rdt
    stains = stains.filter((s) => s.life > 0).slice(-40)
    for (const s of slashes) s.life -= rdt
    slashes = slashes.filter((s) => s.life > 0)
    for (const gh of ghosts) gh.life -= rdt
    ghosts = ghosts.filter((gh) => gh.life > 0)
    for (const p of popups) {
      p.life -= rdt
      p.y -= (p.kind === 'sfx' ? 25 : 55) * S * (rdt / 1000)
    }
    popups = popups.filter((p) => p.life > 0)
    for (const wb of webs) wb.life -= rdt
    webs = webs.filter((wb) => wb.life > 0 && (!wb.e || wb.e.alive))
    for (const wv of waves) {
      wv.r += rdt * 1.6 * S
      if (wv.r > W) wv.life -= rdt / 400
    }
    waves = waves.filter((wv) => wv.life > 0)
    for (const vl of voidLines) if (vl.fade) vl.life -= rdt / 450
    voidLines = voidLines.filter((vl) => vl.life > 0)

    for (const p of projs) {
      p.t += rdt
      if (p.t < 0) continue
      const u = Math.min(1, p.t / p.dur)
      const tx = p.e ? p.e.x : p.tx
      const ty = p.e ? G - p.e.air - 24 * S * p.e.size : p.ty
      p.x = p.sx + (tx - p.sx) * u
      p.y = p.sy + (ty - p.sy) * u - Math.sin(Math.PI * u) * 60 * S
      p.rot += rdt * 0.04
      if (u >= 1) {
        p.done = true
        if (p.e && p.e.alive) {
          slash(p.x, p.y, 1, { kind: 'x', r: 46, life: 260, c: RED })
          addShake(5)
          kill(p.e, sideOf(p.e), 'normal')
        } else if (!p.e) sparks(p.x, p.y, 1, 4, [WHITE])
      }
    }
    projs = projs.filter((p) => !p.done)

    if (banner) {
      banner.t += rdt
      if (banner.t > banner.dur) banner = null
    }
    comboPop = Math.max(0, comboPop - rdt * 0.004)
  }

  const romans = ['', 'I', 'II', 'III']
  const updateFury = (rdt) => {
    const f = combo >= FURY_AT[3] ? 3 : combo >= FURY_AT[2] ? 2 : combo >= FURY_AT[1] ? 1 : 0
    if (f > fury) {
      const c = FURY_COLORS[f][0]
      flash(c, 0.22)
      addShake(7)
      hitStop = Math.max(hitStop, 55)
      ring(player.x, G - 60 * S * FIG, 10 * S, 190 * S, c, 420, 4)
      ring(player.x, G - 60 * S * FIG, 10 * S, 120 * S, WHITE, 300, 2)
      popup(player.x, G - 170 * S * FIG, `${tr(TXT.fury)} ${romans[f]}!`, c, 1.15, 'sfx')
    } else if (f < fury && player.b) {
      // a energia se apaga
      for (let i = 0; i < 14; i += 1) parts.push({ k: 'ember', x: player.x + rand(-30, 30) * S, y: G - rand(20, 110) * S, vx: rand(-60, 60) * S, vy: rand(30, 120) * S, life: rand(250, 450), max: 450, c: '#6b7080', s: rand(1.5, 3) * S })
    }
    fury = f
    if (!fury || (mode !== 'play' && mode !== 'special') || !player.b) return
    // faíscas de energia saindo do corpo
    const n = FURY_RATE[fury] * (rdt / 1000)
    const pts = [player.b.hip, player.b.sh, player.b.head, player.b.hF, player.b.hB, player.b.kF, player.b.fF]
    for (let i = 0; i < Math.floor(n) + (Math.random() < n % 1 ? 1 : 0); i += 1) {
      const p = toWorld(pick(pts))
      parts.push({
        k: 'ember', x: p.x + rand(-6, 6) * S, y: p.y + rand(-6, 6) * S,
        vx: rand(-70, 70) * S, vy: -rand(90, 240) * S * (0.7 + fury * 0.25),
        life: rand(300, 620), max: 620, c: pick(FURY_COLORS[fury]), s: rand(1.6, 3.4) * S * (0.8 + fury * 0.2),
      })
    }
    if (fury === 3 && Math.random() < rdt / 140) {
      const a = toWorld(pick(pts))
      bolt(a.x, a.y, a.x + rand(-50, 50) * S, a.y + rand(-60, 20) * S)
    }
  }

  // Câmera: o lutador fica sempre perto do centro; quem anda é o cenário.
  // Desloca o mundo inteiro (aranhas, pedaços, efeitos) na direção oposta.
  const recenter = (rdt) => {
    const dx = (CX - player.x) * (1 - Math.exp(-rdt * 0.007))
    if (Math.abs(dx) < 0.01) return
    scroll += dx
    player.x += dx
    player.dashFrom += dx
    player.dashTo += dx
    for (const e of enemies) {
      e.x += dx
      if (e.leap) {
        e.leap.from += dx
        e.leap.to += dx
      }
    }
    for (const list of [parts, gibs, stains, slashes, popups, ghosts]) for (const o of list) if (o.x !== undefined) o.x += dx
    for (const p of parts) if (p.x1 !== undefined) { p.x1 += dx; p.x2 += dx }
    for (const t of trail) for (const pt of t.pts) pt.x += dx
    for (const w of webs) { w.x1 += dx; if (w.x2 !== undefined) w.x2 += dx }
    for (const w of waves) w.x += dx
    for (const v of voidLines) { v.x1 += dx; v.x2 += dx }
    for (const p of projs) { p.x += dx; p.sx += dx; if (p.tx !== undefined) p.tx += dx }
  }

  const update = (rdt, gdt, pdt) => {
    if (mode !== 'title' && mode !== 'over') recenter(rdt)
    shake *= Math.exp(-rdt * 0.012)
    flashA = Math.max(0, flashA - rdt * 0.0032)
    zoom += (zoomT - zoom) * (1 - Math.exp(-rdt * 0.01))
    bars += (barsT - bars) * (1 - Math.exp(-rdt * 0.014))

    if (mode === 'play') {
      updateSpawn(gdt)
      updatePlayer(pdt)
    } else if (mode === 'special') {
      updateSpecial(rdt)
    } else if (mode === 'clear') {
      modeT += rdt
      updatePlayer(pdt)
      for (const e of enemies) {
        if (e.alive && modeT >= e.chainAt) {
          ring(e.x, G - 26 * S, 6 * S, 90 * S, WHITE, 260, 3)
          kill(e, sideOf(e), 'launch')
        }
      }
      if (modeT > 1600) {
        mode = 'choose'
        tsTarget = 1
        // a arma atual (para melhorar, se ainda não está no máximo) + outras sorteadas
        const others = WEAPON_POOL.filter((id) => id !== weapon).sort(() => Math.random() - 0.5)
        options = wlv() < MAX_WLV ? [weapon, ...others.slice(0, 2)] : others.slice(0, 3)
        const levels = Object.fromEntries(options.map((id) => [id, wlv(id)]))
        cb.onScreen?.('choose', { level, options, current: weapon, levels, max: MAX_WLV })
      }
    } else if (mode === 'dying') {
      modeT += rdt
      player.hurt = 999
      if (modeT > 1300) {
        mode = 'over'
        tsTarget = 1
        cb.onScreen?.('over', { score, best, level, maxCombo })
      }
    }
    updateEnemies(gdt)
    updateFury(rdt)
    updateFx(gdt, rdt)

    const full = meter >= METER_MAX && mode === 'play'
    if (full !== meterWasFull) {
      meterWasFull = full
      cb.onMeter?.(full)
    }
  }

  /* ---------- desenho ---------- */

  const strip = (pts, wMax, color, alpha) => {
    const n = pts.length
    if (n < 2) return
    const left = []
    const right = []
    for (let i = 0; i < n; i += 1) {
      const a = pts[Math.max(0, i - 1)]
      const b = pts[Math.min(n - 1, i + 1)]
      const dx = b.x - a.x
      const dy = b.y - a.y
      const len = Math.hypot(dx, dy) || 1
      const w = wMax * (i / (n - 1))
      left.push([pts[i].x - (dy / len) * w, pts[i].y + (dx / len) * w])
      right.push([pts[i].x + (dy / len) * w, pts[i].y - (dx / len) * w])
    }
    ctx.globalAlpha = alpha
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(left[0][0], left[0][1])
    for (const p of left) ctx.lineTo(p[0], p[1])
    for (let i = right.length - 1; i >= 0; i -= 1) ctx.lineTo(right[i][0], right[i][1])
    ctx.closePath()
    ctx.fill()
    ctx.globalAlpha = 1
  }

  const drawBackground = () => {
    ctx.fillStyle = INK
    ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = 'rgba(245, 245, 242, 0.045)'
    ctx.lineWidth = 1
    for (let i = 1; i < 6; i += 1) {
      ctx.beginPath()
      const gx = ((((W * i) / 6 + scroll * 0.35) % W) + W) % W
      ctx.moveTo(gx, 0)
      ctx.lineTo(gx, H)
      ctx.stroke()
    }
    ctx.save()
    ctx.font = `${Math.round(Math.min(W * 0.21, 280))}px ${DISPLAY}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    ctx.strokeStyle = 'rgba(245, 245, 242, 0.06)'
    ctx.lineWidth = 1.5
    ctx.strokeText('SPIDER', CX + ((((scroll * 0.2) % W) + W * 1.5) % W) - W / 2, G - 110 * S)
    ctx.restore()
    const floor = ctx.createLinearGradient(0, G, 0, H)
    floor.addColorStop(0, '#14161d')
    floor.addColorStop(1, INK)
    ctx.fillStyle = floor
    ctx.fillRect(0, G, W, H - G)
    ctx.strokeStyle = 'rgba(245, 245, 242, 0.05)'
    const off = (((scroll % (46 * S)) + 46 * S) % (46 * S))
    for (let i = -10; i <= 10; i += 1) {
      ctx.beginPath()
      ctx.moveTo(CX + i * 46 * S + off, G)
      ctx.lineTo(CX + (i * 46 * S + off) * 6.5, H)
      ctx.stroke()
    }
    const glow = ctx.createRadialGradient(player.x, G, 0, player.x, G, 220 * S)
    glow.addColorStop(0, 'rgba(230, 36, 41, 0.22)')
    glow.addColorStop(1, 'rgba(230, 36, 41, 0)')
    ctx.fillStyle = glow
    ctx.fillRect(player.x - 220 * S, G - 220 * S, 440 * S, 440 * S)
    ctx.strokeStyle = 'rgba(245, 245, 242, 0.4)'
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.moveTo(0, G)
    ctx.lineTo(W, G)
    ctx.stroke()
  }

  const drawPlayerAt = (x, air, facing, b, opts) => {
    ctx.save()
    ctx.translate(x, G - air)
    ctx.scale(facing * S * FIG, S * FIG)
    drawFighter(ctx, b, style(), opts)
    ctx.restore()
  }

  const currentPose = () => {
    const base = idle()
    if (player.override) return player.override
    if (player.hurt > 0) return mixPose(base, withIdle(style(), HURT), Math.min(1, player.hurt / 120))
    const a = player.anim
    if (a) {
      let p = attackPose(style(), a.variant, Math.min(1, a.u), base, a.from, !a.miss)
      if (a.miss && a.u > 0.5) p = mixPose(p, withIdle(style(), MISS), Math.min(1, (a.u - 0.5) * 2.5) * (1 - Math.max(0, a.u - 0.85) * 6))
      return p
    }
    if (player.hold) return holdPose(style(), player.hold.variant, (clock - player.hold.since) / 1000)
    return idlePose(style(), clock / 1000)
  }

  const drawSlashes = () => {
    for (const s of slashes) {
      const a = s.life / s.max
      ctx.save()
      ctx.translate(s.x, s.y)
      ctx.rotate(s.rot)
      if (s.kind === 'line' || s.kind === 'x') {
        const lines = s.kind === 'x' ? [0.8, -0.8] : [0]
        for (const r of lines) {
          ctx.save()
          ctx.rotate(r)
          const len = s.kind === 'x' ? s.r : s.len * (0.6 + (1 - a) * 0.6)
          const w = (s.kind === 'x' ? 5 : 7) * S * a
          for (const [c, k] of [[s.c, 2.4], [WHITE, 1]]) {
            ctx.globalAlpha = a * (k > 1 ? 0.45 : 1)
            ctx.fillStyle = c
            ctx.beginPath()
            ctx.moveTo(-len, 0)
            ctx.lineTo(0, -w * k)
            ctx.lineTo(len, 0)
            ctx.lineTo(0, w * k)
            ctx.closePath()
            ctx.fill()
          }
          ctx.restore()
        }
      } else {
        ctx.scale(s.dir, 1)
        const r = s.r * (0.85 + (1 - a) * 0.3)
        for (const [c, k, al] of [[s.c, 1.15, 0.45], [WHITE, 1, 0.95]]) {
          ctx.globalAlpha = a * al
          ctx.fillStyle = c
          ctx.beginPath()
          ctx.arc(0, 0, r * k, -1.15, 1.15)
          ctx.arc(r * 0.22, 0, r * 0.84 * k, 1.05, -1.05, true)
          ctx.closePath()
          ctx.fill()
        }
      }
      ctx.restore()
    }
    ctx.globalAlpha = 1
  }

  const drawParts = () => {
    ctx.lineCap = 'round'
    ctx.globalCompositeOperation = 'lighter'
    for (const p of parts) {
      if (p.k !== 'ember') continue
      const a = clamp(p.life / p.max, 0, 1)
      ctx.globalAlpha = a * 0.35
      ctx.fillStyle = p.c
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.s * 2.4, 0, TAU)
      ctx.fill()
      ctx.globalAlpha = a
      ctx.strokeStyle = p.c
      ctx.lineWidth = p.s
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(p.x - p.vx * 0.03, p.y - p.vy * 0.03)
      ctx.stroke()
    }
    ctx.globalCompositeOperation = 'source-over'
    for (const p of parts) {
      const a = clamp(p.life / p.max, 0, 1)
      if (p.k === 'spark') {
        ctx.globalAlpha = a
        ctx.strokeStyle = p.c
        ctx.lineWidth = p.w * S
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(p.x - p.vx * 0.025, p.y - p.vy * 0.025)
        ctx.stroke()
      } else if (p.k === 'ring') {
        const t = 1 - a
        ctx.globalAlpha = a
        ctx.strokeStyle = p.c
        ctx.lineWidth = p.w * a * S + 0.5
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r0 + (p.r1 - p.r0) * eo(t), 0, TAU)
        ctx.stroke()
      } else if (p.k === 'burst') {
        const t = 1 - a
        ctx.globalAlpha = a
        ctx.strokeStyle = p.c
        ctx.lineWidth = 3 * S * a + 1
        for (let i = 0; i < 10; i += 1) {
          const ang = p.rot + (i / 10) * TAU
          const r0 = p.r * (0.25 + t * 0.6)
          const r1 = p.r * (0.55 + t * 0.7) * (i % 2 ? 0.7 : 1)
          ctx.beginPath()
          ctx.moveTo(p.x + Math.cos(ang) * r0, p.y + Math.sin(ang) * r0)
          ctx.lineTo(p.x + Math.cos(ang) * r1, p.y + Math.sin(ang) * r1)
          ctx.stroke()
        }
      } else if (p.k === 'dust') {
        ctx.globalAlpha = a * 0.35
        ctx.fillStyle = '#9aa0ad'
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, TAU)
        ctx.fill()
      } else if (p.k === 'aura') {
        ctx.globalAlpha = a
        ctx.fillStyle = p.c
        ctx.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s * 2.4)
      } else if (p.k === 'bolt') {
        ctx.globalAlpha = a
        ctx.strokeStyle = WHITE
        ctx.lineWidth = 2.2 * S
        ctx.beginPath()
        const n = 7
        for (let i = 0; i <= n; i += 1) {
          const t = i / n
          const jitter = i === 0 || i === n ? 0 : Math.sin(p.seed + i * 12.9) * 16 * S
          const x = p.x1 + (p.x2 - p.x1) * t
          const y = p.y1 + (p.y2 - p.y1) * t + jitter
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
        ctx.strokeStyle = RED
        ctx.globalAlpha = a * 0.5
        ctx.lineWidth = 6 * S
        ctx.stroke()
      }
    }
    ctx.globalAlpha = 1
  }

  const drawSpecialFx = () => {
    // linha do corte da katana
    for (const vl of voidLines) {
      const y = vl.y
      ctx.globalAlpha = vl.life * 0.5
      ctx.fillStyle = '#9fb8ff'
      ctx.fillRect(vl.x1, y - 5 * S, vl.x2 - vl.x1, 10 * S)
      ctx.globalAlpha = vl.life
      ctx.fillStyle = WHITE
      ctx.fillRect(vl.x1, y - 1.2 * S, vl.x2 - vl.x1, 2.4 * S)
    }
    ctx.globalAlpha = 1
    // onda de choque do martelo
    for (const wv of waves) {
      ctx.globalAlpha = Math.max(0, wv.life) * clamp(1 - wv.r / (W * 0.9), 0.15, 1)
      ctx.strokeStyle = WHITE
      ctx.lineWidth = 4 * S
      for (const s of [-1, 1]) {
        ctx.beginPath()
        ctx.ellipse(wv.x + s * 0, G, wv.r, 26 * S, 0, s > 0 ? -Math.PI / 2 : Math.PI / 2, s > 0 ? Math.PI / 2 : (3 * Math.PI) / 2, s < 0)
        ctx.stroke()
      }
      ctx.strokeStyle = 'rgba(245, 245, 242, 0.5)'
      ctx.lineWidth = 1.5
      for (const c of wv.cracks) {
        const x0 = wv.x + c.x * Math.min(wv.r, 200 * S)
        ctx.beginPath()
        ctx.moveTo(x0, G)
        ctx.lineTo(x0 + c.x * c.len * 0.4 * S, G + c.len * 0.5 * S)
        ctx.stroke()
      }
    }
    ctx.globalAlpha = 1
    // tornado do bastão
    if (special?.w === 'staff' && special.phase === 'action') {
      const s = special.d.spin || 0
      ctx.strokeStyle = 'rgba(49, 87, 255, 0.55)'
      ctx.lineWidth = 2 * S
      for (let i = 0; i < 6; i += 1) {
        const r = (60 + i * 26) * S
        ctx.globalAlpha = 0.7 - i * 0.1
        ctx.beginPath()
        ctx.ellipse(player.x, G - 60 * S - i * 14 * S, r, r * 0.28, 0, s + i, s + i + 4.2)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }
    // teias
    ctx.strokeStyle = 'rgba(245, 245, 242, 0.85)'
    ctx.lineWidth = 1.4 * S
    for (const wb of webs) {
      const x2 = wb.e ? wb.e.x : wb.x2
      const y2 = wb.e ? G - wb.e.air - 24 * S : wb.y2
      ctx.globalAlpha = wb.e ? 1 : wb.life / wb.max
      ctx.beginPath()
      ctx.moveTo(wb.x1, wb.y1)
      ctx.quadraticCurveTo((wb.x1 + x2) / 2, (wb.y1 + y2) / 2 + 10 * S, x2, y2)
      ctx.stroke()
      for (let i = 0; i < 6; i += 1) {
        const a = (i / 6) * TAU
        ctx.beginPath()
        ctx.moveTo(x2, y2)
        ctx.lineTo(x2 + Math.cos(a) * 14 * S, y2 + Math.sin(a) * 14 * S)
        ctx.stroke()
      }
    }
    ctx.globalAlpha = 1
    // adagas voando
    for (const p of projs) {
      if (p.t < 0) continue
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.strokeStyle = 'rgba(230, 36, 41, 0.45)'
      ctx.lineWidth = 7 * S
      ctx.beginPath()
      ctx.moveTo(-12 * S, 0)
      ctx.lineTo(12 * S, 0)
      ctx.stroke()
      ctx.strokeStyle = WHITE
      ctx.lineWidth = 2.4 * S
      ctx.stroke()
      ctx.restore()
    }
  }

  const drawIndicators = () => {
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    for (const e of enemies) {
      if (!e.alive || e.wrapped) continue
      const top = G - e.air - 64 * S * e.size
      if (e.hp > 1) {
        for (let i = 0; i < e.hp; i += 1) {
          ctx.fillStyle = WHITE
          ctx.fillRect(e.x - (e.hp * 9 * S) / 2 + i * 9 * S, top, 6 * S, 6 * S)
        }
      }
      if (e.type === 'jumper' && !e.jumped) {
        ctx.font = `700 ${Math.round(13 * S + 3)}px ${MONO}`
        ctx.fillStyle = RED
        ctx.fillText('⇄', e.x, top - 14 * S)
      }
    }
  }

  const drawPopups = () => {
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    for (const p of popups) {
      const a = clamp(p.life / 260, 0, 1)
      const born = 1 - p.life / p.max
      const pop = born < 0.12 ? 1.5 - born * 4 : 1
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.scale(pop, pop)
      ctx.globalAlpha = a
      if (p.kind === 'sfx') {
        // onomatopeia em estilo HQ: estrela vermelha e letra branca contornada
        const r = 34 * S * p.size
        ctx.fillStyle = RED
        ctx.beginPath()
        for (let i = 0; i < 20; i += 1) {
          const ang = (i / 20) * TAU
          const rr = i % 2 ? r * 0.62 : r
          ctx.lineTo(Math.cos(ang) * rr * 1.5, Math.sin(ang) * rr)
        }
        ctx.closePath()
        ctx.fill()
        ctx.font = `${Math.round(30 * S * p.size)}px ${DISPLAY}`
        ctx.lineWidth = 5 * S
        ctx.strokeStyle = INK
        ctx.strokeText(p.text, 0, 0)
        ctx.fillStyle = WHITE
        ctx.fillText(p.text, 0, 0)
      } else {
        ctx.font = `${Math.round(22 * S * p.size)}px ${DISPLAY}`
        ctx.fillStyle = p.c
        ctx.fillText(p.text, 0, 0)
      }
      ctx.restore()
    }
    ctx.globalAlpha = 1
  }

  const chamfer = (x, y, w, h, c) => {
    ctx.beginPath()
    ctx.moveTo(x + c, y)
    ctx.lineTo(x + w, y)
    ctx.lineTo(x + w, y + h - c)
    ctx.lineTo(x + w - c, y + h)
    ctx.lineTo(x, y + h)
    ctx.lineTo(x, y + c)
    ctx.closePath()
  }

  const drawHUD = () => {
    if (mode === 'title' || mode === 'over') return
    const pad = Math.max(16, 30 * S)
    const small = Math.round(Math.max(10, 11 * S))
    ctx.textBaseline = 'top'
    // pontos
    ctx.textAlign = 'left'
    ctx.fillStyle = WHITE
    ctx.font = `${Math.round(Math.max(30, 50 * S))}px ${DISPLAY}`
    ctx.fillText(String(score), pad, pad)
    ctx.font = `600 ${small}px ${MONO}`
    ctx.fillStyle = 'rgba(245, 245, 242, 0.55)'
    ctx.fillText(`${tr(TXT.score)} · ${tr(TXT.best)} ${Math.max(best, score)}`, pad, pad + Math.max(34, 54 * S))
    // nível e progresso
    ctx.textAlign = 'center'
    ctx.fillStyle = WHITE
    ctx.font = `600 ${small + 1}px ${MONO}`
    ctx.fillText(`${tr(TXT.level)} ${String(level).padStart(2, '0')}`, CX, pad)
    const bw = Math.min(260 * S, W * 0.32)
    ctx.fillStyle = 'rgba(245, 245, 242, 0.14)'
    ctx.fillRect(CX - bw / 2, pad + small + 10, bw, 3)
    ctx.fillStyle = RED
    ctx.fillRect(CX - bw / 2, pad + small + 10, bw * clamp(kills / quota, 0, 1), 3)
    // vidas
    const lw = Math.max(16, 22 * S)
    for (let i = 0; i < 3; i += 1) {
      const x = W - pad - (i + 1) * (lw + 8)
      chamfer(x, pad + 4, lw, lw, lw * 0.3)
      if (i < lives) {
        ctx.fillStyle = RED
        ctx.fill()
      } else {
        ctx.strokeStyle = 'rgba(245, 245, 242, 0.35)'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
    }
    // combo
    if (combo >= 3) {
      ctx.textAlign = 'right'
      const sz = Math.max(40, 74 * S) * (1 + comboPop * 0.35)
      ctx.font = `${Math.round(sz)}px ${DISPLAY}`
      ctx.fillStyle = BLUE
      ctx.fillText(String(combo), W - pad + 3, H * 0.2 + 3)
      ctx.fillStyle = WHITE
      ctx.fillText(String(combo), W - pad, H * 0.2)
      ctx.font = `600 ${small}px ${MONO}`
      ctx.fillStyle = RED
      ctx.fillText(`${tr(TXT.combo)} ×${comboMult()}`, W - pad, H * 0.2 + sz * 0.95)
      if (fury) {
        ctx.font = `${Math.round(Math.max(18, 26 * S))}px ${DISPLAY}`
        ctx.fillStyle = FURY_COLORS[fury][Math.floor(clock / 90) % FURY_COLORS[fury].length]
        ctx.fillText(`${tr(TXT.fury)} ${romans[fury]}`, W - pad, H * 0.2 + sz * 0.95 + small + 8)
      }
    }
    // arma atual
    ctx.textAlign = 'left'
    ctx.textBaseline = 'bottom'
    ctx.font = `600 ${small}px ${MONO}`
    ctx.fillStyle = 'rgba(245, 245, 242, 0.55)'
    ctx.fillText(`${tr(WEAPONS[weapon].name).toUpperCase()} · ${tr(TXT.wlv)} ${wlv()}`, pad, H - pad)
    for (let i = 0; i < MAX_WLV; i += 1) {
      ctx.fillStyle = i < wlv() ? WEAPONS[weapon].color : 'rgba(245, 245, 242, 0.15)'
      ctx.fillRect(pad + i * 9, H - pad - Math.max(14, 16 * S) - 8, 6, 6)
    }
    // medidor do especial
    const mw = Math.min(320 * S, W * 0.6)
    const mh = Math.max(9, 12 * S)
    const mx = CX - mw / 2
    const my = H - pad - mh
    const full = meter >= METER_MAX
    const seg = mw / METER_MAX
    for (let i = 0; i < METER_MAX; i += 1) {
      chamfer(mx + i * seg + 2, my, seg - 4, mh, 3)
      if (i < meter) {
        ctx.fillStyle = full ? (Math.sin(clock * 0.012) > 0 ? WHITE : BLUE) : RED
        ctx.fill()
      } else {
        ctx.fillStyle = 'rgba(245, 245, 242, 0.12)'
        ctx.fill()
      }
    }
    if (full && mode === 'play') {
      ctx.textAlign = 'center'
      ctx.font = `700 ${small + 1}px ${MONO}`
      ctx.fillStyle = WHITE
      const label = touch ? tr(TXT.ready) : `${tr(TXT.space)} — ${tr(WEAPONS[weapon].special.name)}`
      ctx.fillText(label, CX, my - 8)
    }
  }

  const drawBanner = () => {
    // nome do especial
    if (special && special.t < 1400) {
      const t = special.t
      const inA = eo(clamp(t / 260, 0, 1))
      const outA = 1 - clamp((t - 1050) / 350, 0, 1)
      const name = tr(WEAPONS[special.w].special.name)
      const size = Math.min(W * 0.11, 120 * S)
      ctx.save()
      ctx.globalAlpha = outA
      ctx.translate(CX + (1 - inA) * -W * 0.4, H * 0.3)
      ctx.transform(1, 0, -0.18, 1, 0, 0)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = `${Math.round(size)}px ${DISPLAY}`
      ctx.fillStyle = RED
      ctx.fillText(name, 5, 5)
      ctx.fillStyle = BLUE
      ctx.fillText(name, -4, 2)
      ctx.fillStyle = WHITE
      ctx.fillText(name, 0, 0)
      ctx.restore()
    }
    if (!banner) return
    const t = banner.t
    const a = Math.min(1, t / 160) * (1 - clamp((t - banner.dur + 300) / 300, 0, 1))
    ctx.save()
    ctx.globalAlpha = a
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `${Math.round(Math.min(W * 0.09, 92 * S))}px ${DISPLAY}`
    ctx.fillStyle = WHITE
    ctx.fillText(banner.title, CX, H * 0.36)
    ctx.font = `700 ${Math.round(Math.max(11, 13 * S))}px ${MONO}`
    ctx.fillStyle = RED
    ctx.fillText(banner.sub, CX, H * 0.36 + Math.min(W * 0.06, 62 * S))
    ctx.restore()
  }

  const render = (rdt = 16) => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    drawBackground()

    const sx = shake ? rand(-shake, shake) : 0
    const sy = shake ? rand(-shake, shake) : 0
    const fx = player.x
    const fy = G - 70 * S
    ctx.save()
    ctx.translate(sx, sy)
    ctx.translate(fx, fy)
    ctx.scale(zoom, zoom)
    ctx.translate(-fx, -fy)

    // manchas no chão
    for (const s of stains) {
      ctx.globalAlpha = (s.life / s.max) * 0.5
      ctx.fillStyle = BLUE
      ctx.beginPath()
      ctx.ellipse(s.x, G + 2 * S, s.w, s.w * 0.18, 0, 0, TAU)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    drawSpecialFx()
    for (const e of enemies) if (e.alive) drawSpider(ctx, e, G, S)
    for (const g of gibs) drawGib(ctx, g, S)
    drawIndicators()

    // rastro dos golpes
    const target = currentPose()
    const a = player.anim
    // suaviza as transições, mas o golpe em si (preparo → impacto) é exato
    if (a && a.u > 0.2 && a.u < 0.66) player.pose = { ...target }
    else {
      const rate = a ? 70 : player.override ? 40 : player.hurt > 0 ? 26 : 16
      player.pose = smoothPose(player.pose, target, hitStop > 0 ? 0 : rdt, rate)
    }
    const b = bones(player.pose, style())
    player.b = b
    if (import.meta.env.DEV && a && a.target && !a.measured && a.u >= HIT_AT && player.trailKey) {
      // distância entre a ponta do golpe e a frente da aranha no quadro do impacto
      a.measured = true
      const tip = trailPoints(b, style(), player.trailKey).map(toWorld)
      const reachX = Math.max(...tip.map((p) => p.x * a.dir)) * a.dir
      lastHit = { gap: Math.round((a.target.x - a.dir * 23 * S * a.target.size - reachX) * a.dir), weapon, dash: Math.round(Math.abs(player.x - player.dashFrom)) }
    }
    if (player.trailKey) trail.push({ t: clock, pts: trailPoints(b, style(), player.trailKey).map(toWorld) })
    trail = trail.filter((tp) => clock - tp.t < 120)
    const lanes = Math.max(0, ...trail.map((tp) => tp.pts.length))
    for (let j = 0; j < lanes; j += 1) {
      const pts = trail.filter((tp) => tp.pts[j]).map((tp) => tp.pts[j])
      strip(pts, 9 * S * (1 + fury * 0.3), fury ? FURY_COLORS[fury][0] : WEAPONS[weapon].color, 0.4 + fury * 0.1)
      strip(pts, 3.5 * S * (1 + fury * 0.15), WHITE, 0.95)
    }

    for (const gh of ghosts) {
      ctx.globalAlpha = (gh.life / gh.max) * 0.6
      drawPlayerAt(gh.x, gh.air, gh.facing, gh.b, { tint: gh.c })
    }
    ctx.globalAlpha = 1

    // sombra do lutador
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'
    ctx.beginPath()
    ctx.ellipse(player.x, G + 2 * S, 38 * S * (1 - Math.min(0.6, player.air / (300 * S))), 6 * S, 0, 0, TAU)
    ctx.fill()

    if (fury > 0) {
      const c = FURY_COLORS[fury][0]
      const r = (70 + fury * 22 + Math.sin(clock * 0.012) * 8) * S
      const cy = G - player.air - 55 * S * FIG
      const au = ctx.createRadialGradient(player.x, cy, 4, player.x, cy, r)
      au.addColorStop(0, c + '55')
      au.addColorStop(1, c + '00')
      ctx.globalCompositeOperation = 'lighter'
      ctx.fillStyle = au
      ctx.fillRect(player.x - r, cy - r, r * 2, r * 2)
      ctx.globalCompositeOperation = 'source-over'
    }

    const blink = player.invuln > 0 && Math.floor(clock / 70) % 2 === 0
    if (hitStop > 0 || (special && special.phase !== 'outro')) {
      ctx.globalAlpha = 0.55
      drawPlayerAt(player.x - 3, player.air, player.facing, b, { tint: RED })
      drawPlayerAt(player.x + 3, player.air, player.facing, b, { tint: BLUE })
      ctx.globalAlpha = 1
    }
    ctx.globalAlpha = blink ? 0.4 : 1
    drawPlayerAt(player.x, player.air, player.facing, b)
    ctx.globalAlpha = 1

    // tontura depois de errar
    if (player.stun > 0 && mode === 'play') {
      const hy = G - player.air - 128 * S * FIG
      for (let i = 0; i < 3; i += 1) {
        const a = clock * 0.008 + (i / 3) * TAU
        ctx.fillStyle = i === 1 ? RED : WHITE
        ctx.beginPath()
        ctx.arc(player.x + Math.cos(a) * 16 * S, hy + Math.sin(a) * 4 * S, 2.6 * S, 0, TAU)
        ctx.fill()
      }
    }

    drawSlashes()
    drawParts()
    drawPopups()
    ctx.restore()

    // câmera lenta: linhas de velocidade e vinheta
    const slow = clamp((0.7 - timeScale) / 0.6, 0, 1)
    if (slow > 0.02 && !reduce) {
      ctx.save()
      ctx.globalAlpha = slow * 0.35
      ctx.strokeStyle = WHITE
      ctx.lineWidth = 1
      for (let i = 0; i < 26; i += 1) {
        const a = (i / 26) * TAU + clock * 0.0004
        const r0 = Math.max(W, H) * rand(0.32, 0.42)
        ctx.beginPath()
        ctx.moveTo(fx + Math.cos(a) * r0, fy + Math.sin(a) * r0)
        ctx.lineTo(fx + Math.cos(a) * r0 * 1.6, fy + Math.sin(a) * r0 * 1.6)
        ctx.stroke()
      }
      ctx.restore()
      const vg = ctx.createRadialGradient(CX, H / 2, Math.min(W, H) * 0.3, CX, H / 2, Math.max(W, H) * 0.75)
      vg.addColorStop(0, 'rgba(8, 9, 13, 0)')
      vg.addColorStop(1, `rgba(8, 9, 13, ${0.75 * slow})`)
      ctx.fillStyle = vg
      ctx.fillRect(0, 0, W, H)
    }

    // faixas de cinema no especial
    if (bars > 0.01) {
      const bh = H * 0.11 * bars
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, W, bh)
      ctx.fillRect(0, H - bh, W, bh)
      ctx.fillStyle = RED
      ctx.fillRect(0, bh - 2, W * bars, 2)
      ctx.fillRect(W * (1 - bars), H - bh, W * bars, 2)
    }

    if (flashA > 0.01) {
      ctx.globalAlpha = flashA
      ctx.fillStyle = flashC
      ctx.fillRect(0, 0, W, H)
      ctx.globalAlpha = 1
    }

    drawHUD()
    drawBanner()
  }

  /* ---------- loop e entrada ---------- */

  const frame = (now) => {
    raf = requestAnimationFrame(frame)
    const rdt = Math.min(50, now - last || 16)
    last = now
    clock += rdt
    timeScale += (tsTarget - timeScale) * (1 - Math.exp(-rdt * 0.012))
    let gdt = rdt * timeScale
    let pdt = rdt
    if (hitStop > 0) {
      hitStop -= rdt
      gdt = 0
      pdt = 0
    }
    if (mode !== 'choose') update(rdt, gdt, pdt)
    render(rdt)
  }

  const onKey = (e) => {
    const k = e.key
    if (k === 'Escape') {
      e.preventDefault()
      cb.onClose?.()
      return
    }
    if (mode === 'title' || mode === 'over') {
      if (k === 'Enter' || k === ' ') {
        e.preventDefault()
        start()
      }
      return
    }
    if (mode === 'choose') {
      const n = Number(k)
      if (n >= 1 && n <= options.length) {
        e.preventDefault()
        choose(options[n - 1])
      }
      return
    }
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') {
      e.preventDefault()
      if (!e.repeat) attack(-1)
    } else if (k === 'ArrowRight' || k === 'd' || k === 'D') {
      e.preventDefault()
      if (!e.repeat) attack(1)
    } else if (k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W') {
      e.preventDefault()
      if (!e.repeat) trySpecial()
    }
  }
  const onPointer = (e) => {
    if (mode !== 'play') return
    attack(e.clientX < W / 2 ? -1 : 1)
  }

  resize()
  window.addEventListener('resize', resize)
  window.addEventListener('keydown', onKey)
  canvas.addEventListener('pointerdown', onPointer)
  raf = requestAnimationFrame((now) => {
    last = now
    frame(now)
  })

  const api = {
    start,
    choose,
    special: trySpecial,
    attack,
    destroy() {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('keydown', onKey)
      canvas.removeEventListener('pointerdown', onPointer)
    },
  }
  // atalhos para testes em desenvolvimento
  if (import.meta.env.DEV) {
    api.debug = {
      fillMeter: () => (meter = METER_MAX),
      setWeapon: (id) => (weapon = id),
      setLevel: (id, n) => (wLevels[id] = n),
      winLevel: () => {
        kills = quota - 1
      },
      state: () => ({ mode, weapon, level, score, combo, lives, kills, quota, meter, enemies: alive().length }),
      peek: () => ({ px: player.x, range: ws().range * S, es: alive().map((e) => [e.x, e.r, !!e.leap]) }),
      god: () => (lives = 99),
      lastHit: () => lastHit,
      setCombo: (n) => (combo = n),
      poseAt: (st, v) => {
        weapon = Object.keys(WEAPONS).find((k) => WEAPONS[k].style === st)
        player.anim = null
        player.hold = { variant: v, since: 1e12 }
        player.pose = null
      },
      calm: () => {
        enemies = []
        spawnT = 1e9
      },
    }
  }
  return api
}
