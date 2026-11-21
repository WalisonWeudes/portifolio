// Cerejal: xícara em 3D (three.js). Gira com a rolagem e com o mouse/dedo; o preparo muda o café dentro.
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

const section = document.getElementById('xicara')
const canvas = document.getElementById('cup-canvas')
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

const DRINKS = {
  coado: { level: 0.84, color: '#3b1f0f', art: 'coado', vol: '180 ml', moa: 'Média', agua: '92 °C', nota: 'Corpo leve, doçura de caramelo e final de laranja.' },
  espresso: { level: 0.42, color: '#2a160b', art: 'crema', vol: '40 ml', moa: 'Fina', agua: '93 °C', nota: 'Encorpado, crema avelã e final de chocolate amargo.' },
  cappuccino: { level: 0.92, color: '#e9d6b8', art: 'coracao', vol: '160 ml', moa: 'Fina', agua: '65 °C no leite', nota: 'Espresso com leite vaporizado e espuma cremosa por cima.' },
  leite: { level: 0.88, color: '#9a6a43', art: 'leite', vol: '200 ml', moa: 'Média', agua: '92 °C', nota: 'Coado com leite quente, doce e redondo, para a tarde.' },
}

function start () {
  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  } catch (e) {
    document.documentElement.classList.add('no-webgl')
    return
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50)
  camera.position.set(0, 2.25, 3.3)
  camera.lookAt(0, 0.36, 0)

  // luz quente de janela + preenchimento suave
  const sun = new THREE.DirectionalLight(0xfff1dc, 2.4)
  sun.position.set(-2.4, 4, 2.2)
  sun.castShadow = true
  sun.shadow.mapSize.set(1024, 1024)
  sun.shadow.camera.left = -2; sun.shadow.camera.right = 2
  sun.shadow.camera.top = 2; sun.shadow.camera.bottom = -2
  sun.shadow.radius = 6
  sun.shadow.bias = -0.0005
  scene.add(sun)
  scene.add(new THREE.HemisphereLight(0xfff6e6, 0x5a4a32, 0.55))

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.ShadowMaterial({ opacity: 0.2 }))
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  const rig = new THREE.Group()
  scene.add(rig)

  // ---------- perfil da xícara (torno) ----------
  const outerR = (y) => 0.3 + 0.2 * Math.pow(y, 0.85) - 0.03 * Math.pow(1 - y, 6)
  const innerR = (y) => outerR(y) - 0.028
  const BASE = 0.07
  const pts = [new THREE.Vector2(0, 0), new THREE.Vector2(0.27, 0)]
  const NO = 44
  for (let k = 0; k <= NO; k++) { const y = 0.012 + (k / NO) * 0.988; pts.push(new THREE.Vector2(outerR(y), y)) }
  pts.push(new THREE.Vector2(outerR(1) - 0.014, 1.006))
  const NI = 30
  for (let k = 0; k <= NI; k++) { const y = 1 - (k / NI) * (1 - BASE); pts.push(new THREE.Vector2(innerR(y), y)) }
  pts.push(new THREE.Vector2(0, BASE))
  const vOf = (idx) => idx / (pts.length - 1)
  const vOuter = (y) => vOf(2 + ((y - 0.012) / 0.988) * NO)

  // pintura da porcelana: faixa verde, filetes dourados e o nome da marca
  const tex = document.createElement('canvas')
  tex.width = 2048; tex.height = 1024
  const g = tex.getContext('2d')
  g.fillStyle = '#f4eee1'; g.fillRect(0, 0, 2048, 1024)
  const yPx = (v) => (1 - v) * 1024
  const band = (y0, y1, color) => { const a = yPx(vOuter(y1)), b = yPx(vOuter(y0)); g.fillStyle = color; g.fillRect(0, a, 2048, b - a) }
  band(0.8, 0.9, '#2f3d2b')
  band(0.93, 0.945, '#b08f4f')
  band(0.765, 0.775, '#b08f4f')
  band(0.1, 0.112, '#b08f4f')
  // borda dourada no lábio
  g.fillStyle = '#b08f4f'; const lipA = yPx(vOf(2 + NO + 3)), lipB = yPx(vOuter(0.985)); g.fillRect(0, lipA, 2048, lipB - lipA)
  // nome da marca na frente e no verso
  g.fillStyle = '#2f3d2b'; g.textAlign = 'center'; g.textBaseline = 'middle'
  const ty = yPx(vOuter(0.5))
  ;[0.25, 0.75].forEach((u) => {
    g.font = '400 96px Gloock, Georgia, serif'
    g.fillText('CEREJAL', u * 2048, ty - 18)
    g.font = '500 30px Jost, Arial, sans-serif'
    g.fillText('C A F É S   E S P E C I A I S', u * 2048, ty + 60)
    g.font = '400 26px Jost, Arial, sans-serif'
    g.fillText('—  DESDE 1962  —', u * 2048, ty - 100)
  })
  const cupTex = new THREE.CanvasTexture(tex)
  cupTex.colorSpace = THREE.SRGBColorSpace
  cupTex.anisotropy = 8
  const porcelain = new THREE.MeshPhysicalMaterial({ map: cupTex, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.12, side: THREE.DoubleSide })

  const cup = new THREE.Mesh(new THREE.LatheGeometry(pts, 128), porcelain)
  cup.castShadow = true
  cup.position.y = 0.065
  rig.add(cup)
  // as fontes do canvas podem chegar depois: redesenha o rótulo quando carregarem
  document.fonts && document.fonts.ready.then(() => {
    g.fillStyle = '#f4eee1'; g.fillRect(0, ty - 140, 2048, 230)
    g.fillStyle = '#2f3d2b'
    ;[0.25, 0.75].forEach((u) => {
      g.font = '400 96px Gloock, Georgia, serif'; g.fillText('CEREJAL', u * 2048, ty - 18)
      g.font = '500 30px Jost, Arial, sans-serif'; g.fillText('C A F É S   E S P E C I A I S', u * 2048, ty + 60)
      g.font = '400 26px Jost, Arial, sans-serif'; g.fillText('—  DESDE 1962  —', u * 2048, ty - 100)
    })
    cupTex.needsUpdate = true
  })

  // alça
  const handlePath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.46, 0.84, 0),
    new THREE.Vector3(0.66, 0.86, 0),
    new THREE.Vector3(0.76, 0.66, 0),
    new THREE.Vector3(0.66, 0.42, 0),
    new THREE.Vector3(0.4, 0.32, 0),
  ])
  const handle = new THREE.Mesh(new THREE.TubeGeometry(handlePath, 64, 0.04, 20, false), new THREE.MeshPhysicalMaterial({ color: 0xf4eee1, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.12 }))
  handle.scale.z = 1.5
  handle.castShadow = true
  handle.position.y = 0.065
  rig.add(handle)

  // pires com filete dourado
  const sp = [[0, 0], [0.5, 0], [0.62, 0.012], [0.8, 0.045], [0.9, 0.075], [0.905, 0.088], [0.89, 0.09], [0.78, 0.06], [0.42, 0.05], [0.36, 0.062], [0, 0.062]].map(([x, y]) => new THREE.Vector2(x, y))
  const sTex = document.createElement('canvas'); sTex.width = 16; sTex.height = 512
  const sg = sTex.getContext('2d'); sg.fillStyle = '#f4eee1'; sg.fillRect(0, 0, 16, 512)
  sg.fillStyle = '#b08f4f'; sg.fillRect(0, (1 - 6 / 10) * 512 - 14, 16, 22)
  const saucerTex = new THREE.CanvasTexture(sTex); saucerTex.colorSpace = THREE.SRGBColorSpace
  const saucer = new THREE.Mesh(new THREE.LatheGeometry(sp, 128), new THREE.MeshPhysicalMaterial({ map: saucerTex, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.15 }))
  saucer.castShadow = true; saucer.receiveShadow = true
  rig.add(saucer)

  // ---------- o café ----------
  const art = document.createElement('canvas'); art.width = art.height = 512
  const ag = art.getContext('2d')
  const artTex = new THREE.CanvasTexture(art); artTex.colorSpace = THREE.SRGBColorSpace
  function paint (kind) {
    const c = 256
    ag.clearRect(0, 0, 512, 512)
    if (kind === 'coado') {
      const gr = ag.createRadialGradient(c, c, 20, c, c, 256)
      gr.addColorStop(0, '#5a3218'); gr.addColorStop(0.8, '#3a1d0d'); gr.addColorStop(1, '#6b4325')
      ag.fillStyle = gr; ag.fillRect(0, 0, 512, 512)
    } else if (kind === 'crema') {
      const gr = ag.createRadialGradient(c, c, 10, c, c, 256)
      gr.addColorStop(0, '#c98a4f'); gr.addColorStop(0.55, '#a8673a'); gr.addColorStop(0.9, '#7a4222'); gr.addColorStop(1, '#5a2f16')
      ag.fillStyle = gr; ag.fillRect(0, 0, 512, 512)
      for (let i = 0; i < 260; i++) { ag.fillStyle = 'rgba(255,230,190,' + (Math.random() * 0.25) + ')'; ag.beginPath(); ag.arc(Math.random() * 512, Math.random() * 512, Math.random() * 3, 0, 7); ag.fill() }
    } else if (kind === 'coracao') {
      const gr = ag.createRadialGradient(c, c, 60, c, c, 256)
      gr.addColorStop(0, '#b0703f'); gr.addColorStop(0.7, '#9a5a2e'); gr.addColorStop(0.9, '#e9d4b2'); gr.addColorStop(1, '#c9a27a')
      ag.fillStyle = gr; ag.fillRect(0, 0, 512, 512)
      // coração de espuma (latte art)
      ag.fillStyle = "#f8eedc"
      ag.beginPath()
      ag.moveTo(c, c + 120)
      ag.bezierCurveTo(c - 40, c + 70, c - 150, c + 10, c - 140, c - 70)
      ag.bezierCurveTo(c - 130, c - 140, c - 40, c - 150, c, c - 80)
      ag.bezierCurveTo(c + 40, c - 150, c + 130, c - 140, c + 140, c - 70)
      ag.bezierCurveTo(c + 150, c + 10, c + 40, c + 70, c, c + 120)
      ag.fill()
      ag.strokeStyle = "#b07a4c"; ag.lineWidth = 5
      ag.beginPath(); ag.moveTo(c, c - 70); ag.quadraticCurveTo(c + 6, c + 20, c, c + 118); ag.stroke()
    } else {
      const gr = ag.createRadialGradient(c, c, 20, c, c, 256)
      gr.addColorStop(0, '#c08a5c'); gr.addColorStop(0.75, '#a06f47'); gr.addColorStop(1, '#7c5132')
      ag.fillStyle = gr; ag.fillRect(0, 0, 512, 512)
      ag.strokeStyle = 'rgba(240,220,190,.35)'; ag.lineWidth = 6
      ag.beginPath(); for (let a = 0; a < 18; a += 0.1) { const r = 10 + a * 12; ag.lineTo(c + Math.cos(a) * r, c + Math.sin(a) * r) } ag.stroke()
    }
    artTex.needsUpdate = true
  }
  const liquid = new THREE.Mesh(new THREE.CircleGeometry(1, 96), new THREE.MeshPhysicalMaterial({ map: artTex, roughness: 0.18, clearcoat: 0.8, clearcoatRoughness: 0.05 }))
  liquid.rotation.x = -Math.PI / 2
  cup.add(liquid)
  let level = DRINKS.coado.level, levelTo = level
  const placeLiquid = () => {
    const r = innerR(level) - 0.002
    liquid.position.y = level
    liquid.scale.set(r, r, 1)
  }
  paint('coado'); placeLiquid()

  // ---------- grãos espalhados no pires e na mesa ----------
  const beanGeo = new THREE.SphereGeometry(0.05, 20, 14)
  beanGeo.scale(1, 0.62, 1.35)
  const beanMat = new THREE.MeshStandardMaterial({ color: 0x3b2112, roughness: 0.45, metalness: 0.05 })
  ;[[1.05, 0.03, 0.25, 0.6], [1.18, 0.03, -0.1, 2.1], [-1.1, 0.03, 0.35, 1.2], [0.72, 0.1, 0.42, 0.3], [-0.95, 0.03, -0.3, 2.8], [-0.7, 0.1, 0.5, 1.9]].forEach(([x, y, z, r]) => {
    const b = new THREE.Mesh(beanGeo, beanMat)
    b.position.set(x, y, z); b.rotation.set(0.2, r, 0.1); b.castShadow = true
    rig.add(b)
  })

  // ---------- vapor ----------
  const puff = document.createElement('canvas'); puff.width = puff.height = 128
  const pg = puff.getContext('2d')
  const pgr = pg.createRadialGradient(64, 64, 0, 64, 64, 64)
  pgr.addColorStop(0, 'rgba(255,255,255,.55)'); pgr.addColorStop(1, 'rgba(255,255,255,0)')
  pg.fillStyle = pgr; pg.fillRect(0, 0, 128, 128)
  const puffTex = new THREE.CanvasTexture(puff)
  const steam = []
  for (let i = 0; i < 26; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, transparent: true, depthWrite: false, opacity: 0, color: 0xfffaf0 }))
    s.userData = { t: Math.random(), sp: 0.12 + Math.random() * 0.1, ph: Math.random() * 6, x: (Math.random() - 0.5) * 0.3 }
    scene.add(s); steam.push(s)
  }

  // ---------- interação ----------
  let dragging = false, lastX = 0, vel = 0, spin = 0, tiltTo = 0, tilt = 0, scrollP = 0
  canvas.addEventListener('pointerdown', (e) => {
    dragging = true; lastX = e.clientX; vel = 0
    canvas.setPointerCapture(e.pointerId)
    section.classList.add('is-dragged')
  })
  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect()
    tiltTo = ((e.clientY - r.top) / r.height - 0.5) * 0.25
    if (!dragging) return
    const dx = e.clientX - lastX; lastX = e.clientX
    vel = dx * 0.012
    spin += vel
  })
  const up = () => { dragging = false }
  canvas.addEventListener('pointerup', up)
  canvas.addEventListener('pointercancel', up)
  canvas.addEventListener('pointerleave', () => { tiltTo = 0 })

  const facts = (d) => {
    section.querySelectorAll('[data-f]').forEach((el) => { el.textContent = d[el.dataset.f] })
  }
  section.querySelectorAll('.drink').forEach((b) => b.addEventListener('click', () => {
    section.querySelectorAll('.drink').forEach((o) => { o.classList.toggle('is-on', o === b); o.setAttribute('aria-pressed', o === b) })
    const d = DRINKS[b.dataset.drink]
    levelTo = d.level
    paint(d.art)
    facts(d)
    vel += 0.18 // um giro curto ao trocar
  }))

  function resize () {
    const w = canvas.clientWidth, h = canvas.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    // em telas estreitas afasta a câmera para a xícara caber
    camera.position.z = w / h < 0.9 ? 4.2 : 3.3
    camera.position.y = w / h < 0.9 ? 2.8 : 2.25
    camera.lookAt(0, 0.36, 0)
    camera.updateProjectionMatrix()
  }
  addEventListener('resize', resize)
  resize()


  if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas)

  const isNear = () => { const r = section.getBoundingClientRect(); return r.bottom > -200 && r.top < innerHeight + 200 }
  function onScroll () {
    const r = section.getBoundingClientRect()
    const range = Math.max(1, r.height - innerHeight)
    scrollP = Math.min(1, Math.max(0, -r.top / range))
  }

  const clock = new THREE.Clock()
  let last = 0
  // desenha um quadro; chamado pela animação e também direto na rolagem,
  // para a xícara aparecer mesmo quando o navegador segura os quadros de animação
  function draw () {
    if (!isNear()) return
    const now = performance.now()
    if (now - last < 8) return
    last = now
    const dt = Math.min(clock.getDelta(), 0.05)
    const t = clock.elapsedTime
    if (!dragging) { spin += vel; vel *= 0.94 }
    tilt += (tiltTo - tilt) * 0.08
    rig.rotation.y = -0.6 + scrollP * Math.PI * 1.6 + spin + (reduce ? 0 : Math.sin(t * 0.5) * 0.05)
    rig.rotation.x = tilt * 0.4
    rig.position.y = reduce ? 0 : Math.sin(t * 1.1) * 0.012
    if (Math.abs(levelTo - level) > 0.001) { level += (levelTo - level) * 0.08; placeLiquid() }
    steam.forEach((s) => {
      const u = s.userData
      u.t += dt * u.sp
      if (u.t > 1) { u.t = 0; u.x = (Math.random() - 0.5) * 0.3 }
      const k = u.t
      s.position.set(u.x + Math.sin(t * 1.3 + u.ph) * 0.08 * k, 0.065 + level + 0.05 + k * 1.0, Math.cos(t + u.ph) * 0.05)
      const sc = 0.18 + k * 0.5
      s.scale.set(sc, sc, 1)
      s.material.opacity = Math.sin(k * Math.PI) * 0.22
    })
    renderer.render(scene, camera)
  }
  addEventListener('scroll', () => { onScroll(); draw() }, { passive: true })
  canvas.addEventListener('webglcontextlost', () => document.documentElement.classList.add('no-webgl'))
  onScroll()
  ;(function loop () { requestAnimationFrame(loop); draw() })()
  last = 0; draw()
  window.__cup3d = true
}

if (section && canvas) {
  // só carrega a cena quando a seção chega perto da tela
  const io = new IntersectionObserver((es) => {
    if (es[0].isIntersecting) {
      io.disconnect()
      try { start() } catch (e) { console.warn('xícara 3D:', e); document.documentElement.classList.add('no-webgl') }
    }
  }, { rootMargin: '600px' })
  io.observe(section)
}
