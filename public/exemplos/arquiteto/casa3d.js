// Casa em 3D — visualizador no espírito do "Model Viewer" (React Bits), feito com three.js puro.
// A casa é modelada aqui mesmo (sem arquivo .glb), então cada ponto de destaque tem posição exata.
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { buildHouse } from './casa3d-modelo.js'

const root = document.getElementById('mv')
if (root) start(root)

function start(root) {
  const lite = matchMedia('(max-width: 640px)').matches
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches
  const opt = {
    autoRotateSpeed: 0.22, // rad/s
    autoRotateDelay: 2, // s depois de soltar
    startAngle: -30, // graus
    tilt: 16, // graus de elevação da câmera
    fit: 1,
    minZoom: 0.7,
    maxZoom: 2,
    hoverTilt: 0.15,
    float: 0.3,
    shadowOpacity: 0.45,
  }

  /* ---------- palco ---------- */
  const canvas = root.querySelector('canvas')
  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: location.search.includes('mvshot') })
  } catch {
    root.classList.add('no-webgl')
    return
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, lite ? 1.5 : 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environmentIntensity = 0.35

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 400)
  const target = new THREE.Vector3(0, 0.3, 0)

  const hemi = new THREE.HemisphereLight(0xb9c6dd, 0x3a2c22, 0.45)
  scene.add(hemi)
  const sun = new THREE.DirectionalLight(0xffc28c, 3.1) // sol de dia, lua à noite
  sun.position.set(-13, 9.5, 10)
  sun.castShadow = true
  sun.shadow.mapSize.set(lite ? 2048 : 4096, lite ? 2048 : 4096)
  Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 50 })
  sun.shadow.bias = -0.0004
  sun.shadow.normalBias = 0.02
  scene.add(sun)
  const fill = new THREE.DirectionalLight(0x9fb4d8, 0.35) // preenchimento frio do céu
  fill.position.set(10, 6, -6)
  scene.add(fill)
  const rim = new THREE.DirectionalLight(0xff8a4c, 0.6) // luz de contorno laranja, discreta
  rim.position.set(12, 6, -10)
  scene.add(rim)

  // hierarquia: float (sobe e desce) > tiltG (inclina pro cursor) > model (gira)
  const floatG = new THREE.Group()
  const tiltG = new THREE.Group()
  const model = new THREE.Group()
  floatG.add(tiltG)
  tiltG.add(model)
  scene.add(floatG)

  /* ---------- casa (modelada em casa3d-modelo.js) ---------- */
  const house = buildHouse(model, renderer, { lite })

  /* ---------- dia e noite ---------- */
  // cada valor: [dia, noite]
  const SKY = {
    sunColor: [new THREE.Color(0xfff0dc), new THREE.Color(0x9db4ff)],
    sunPos: [new THREE.Vector3(-9, 17, 10), new THREE.Vector3(10, 13, 8)],
    sun: [3.4, 0.32],
    hemiSky: [new THREE.Color(0xd4e6ff), new THREE.Color(0x1d2b4d)],
    hemiGround: [new THREE.Color(0x5e4c3a), new THREE.Color(0x0b0907)],
    hemi: [1.05, 0.24],
    fill: [0.45, 0.1],
    fillColor: [new THREE.Color(0xc9d8f0), new THREE.Color(0x3b5288)],
    rim: [0.15, 0.12],
    env: [0.6, 0.05],
    exposure: [1.02, 1.05],
  }
  const lerp = (a, b, n) => a + (b - a) * n
  let night = 0
  let nightTo = 0
  const stars = (() => {
    const n = 500
    const pos = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const u = Math.random() * Math.PI * 2
      const v = Math.random() * 0.9 + 0.08
      const r = 70
      pos.set([Math.cos(u) * Math.cos(v) * r, Math.sin(v) * r - 8, Math.sin(u) * Math.cos(v) * r], i * 3)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const p = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 0.28, transparent: true, opacity: 0, depthWrite: false }))
    scene.add(p)
    return p
  })()
  const applySky = (n) => {
    sun.color.lerpColors(SKY.sunColor[0], SKY.sunColor[1], n)
    sun.position.lerpVectors(SKY.sunPos[0], SKY.sunPos[1], n)
    sun.intensity = lerp(SKY.sun[0], SKY.sun[1], n)
    hemi.color.lerpColors(SKY.hemiSky[0], SKY.hemiSky[1], n)
    hemi.groundColor.lerpColors(SKY.hemiGround[0], SKY.hemiGround[1], n)
    hemi.intensity = lerp(SKY.hemi[0], SKY.hemi[1], n)
    fill.intensity = lerp(SKY.fill[0], SKY.fill[1], n)
    fill.color.lerpColors(SKY.fillColor[0], SKY.fillColor[1], n)
    rim.intensity = lerp(SKY.rim[0], SKY.rim[1], n)
    scene.environmentIntensity = lerp(SKY.env[0], SKY.env[1], n)
    renderer.toneMappingExposure = lerp(SKY.exposure[0], SKY.exposure[1], n)
    stars.material.opacity = Math.max(0, n - 0.3) * 1.2
  }
  const timeBtns = [...root.querySelectorAll('[data-time]')]
  const setTime = (t) => {
    nightTo = t === 'night' ? 1 : 0
    if (calm) night = nightTo
    root.dataset.time = t
    timeBtns.forEach((b) => b.setAttribute('aria-pressed', b.dataset.time === t))
  }
  timeBtns.forEach((b) => b.addEventListener('click', () => setTime(b.dataset.time)))
  setTime(new URLSearchParams(location.search).get('mvtime') || 'day')
  night = nightTo

  /* ---------- sombra de contato ---------- */
  const shadowTex = (() => {
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const x = c.getContext('2d')
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, 'rgba(0,0,0,1)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    x.fillStyle = g
    x.fillRect(0, 0, 128, 128)
    return new THREE.CanvasTexture(c)
  })()
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(13, 13),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: opt.shadowOpacity, depthWrite: false })
  )
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = -9.2
  scene.add(shadow)

  /* ---------- pontos de destaque ---------- */
  const features = [...root.querySelectorAll('[data-feature]')].map((el) => {
    const [ax, ay, az] = el.dataset.anchor.split(',').map(Number)
    const [nx, ny, nz] = el.dataset.normal.split(',').map(Number)
    return {
      el,
      chip: document.querySelector(`[data-goto="${el.dataset.feature}"]`),
      anchor: new THREE.Vector3(ax, ay, az),
      normal: new THREE.Vector3(nx, ny, nz).normalize(),
      on: false,
      facing: 0,
    }
  })
  const svg = root.querySelector('.mv__lines')
  const NS = 'http://www.w3.org/2000/svg'
  features.forEach((f) => {
    const g = document.createElementNS(NS, 'g')
    g.innerHTML = '<line pathLength="1" /><circle class="mv__ring" r="9" /><circle class="mv__dot" r="3.5" />'
    svg.appendChild(g)
    f.g = g
    f.line = g.querySelector('line')
    f.dots = g.querySelectorAll('circle')
  })
  const detail = document.getElementById('mvDetail')

  /* ---------- tamanho e enquadramento ---------- */
  let W = 1, H = 1, baseDist = 40
  const resize = () => {
    const r = root.getBoundingClientRect()
    W = Math.max(1, r.width)
    H = Math.max(1, r.height)
    renderer.setSize(W, H, false)
    camera.aspect = W / H
    const v = THREE.MathUtils.degToRad(camera.fov)
    const h = 2 * Math.atan(Math.tan(v / 2) * camera.aspect)
    const radius = 9.6
    baseDist = radius / Math.sin(Math.min(v, h) / 2) / (opt.fit * 1.25)
    camera.updateProjectionMatrix()
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
    features.forEach((f) => { f.bw = f.bh = 0 })
  }
  new ResizeObserver(resize).observe(root)
  resize()

  /* ---------- controles (arrastar, inércia, zoom, inclinação) ---------- */
  const startYaw = THREE.MathUtils.degToRad(opt.startAngle)
  let yaw = startYaw
  let vel = 0
  let zoom = 1
  let zoomTarget = 1
  let lastInput = -Infinity
  let goal = null // yaw alvo quando o usuário clica num destaque
  const tiltNow = new THREE.Vector2()
  const tiltTo = new THREE.Vector2()
  const pointers = new Map()
  let pinch = 0
  let dragX = 0
  let dragging = false

  root.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button, a')) return
    pointers.set(e.pointerId, e)
    root.setPointerCapture(e.pointerId)
    dragging = pointers.size === 1
    dragX = e.clientX
    vel = 0
    goal = null
    root.classList.add('is-drag')
  })
  root.addEventListener('pointermove', (e) => {
    const r = root.getBoundingClientRect()
    tiltTo.set(((e.clientY - r.top) / r.height - 0.5) * 2, ((e.clientX - r.left) / r.width - 0.5) * 2)
    if (!pointers.has(e.pointerId)) return
    pointers.set(e.pointerId, e)
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()]
      const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
      if (pinch) zoomTarget = THREE.MathUtils.clamp(zoomTarget * (d / pinch), opt.minZoom, opt.maxZoom)
      pinch = d
      return
    }
    if (!dragging) return
    const dx = e.clientX - dragX
    dragX = e.clientX
    const d = (dx / W) * Math.PI * 1.6
    yaw += d
    vel = d * 60
    lastInput = performance.now()
  })
  const release = (e) => {
    pointers.delete(e.pointerId)
    if (pointers.size < 2) pinch = 0
    if (!pointers.size) {
      dragging = false
      root.classList.remove('is-drag')
      lastInput = performance.now()
    }
  }
  root.addEventListener('pointerup', release)
  root.addEventListener('pointercancel', release)
  root.addEventListener('pointerleave', () => tiltTo.set(0, 0))
  root.addEventListener('wheel', (e) => {
    if (!(e.ctrlKey || e.metaKey)) return // rolagem normal continua rolando a página
    e.preventDefault()
    zoomTarget = THREE.MathUtils.clamp(zoomTarget * Math.exp(-e.deltaY * 0.0015), opt.minZoom, opt.maxZoom)
    lastInput = performance.now()
  }, { passive: false })
  root.addEventListener('dblclick', () => {
    goal = startYaw + Math.round((yaw - startYaw) / (Math.PI * 2)) * Math.PI * 2
    zoomTarget = 1
    lastInput = performance.now()
  })
  root.addEventListener('keydown', (e) => {
    if (e.target !== root) return
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault()
      goal = (goal ?? yaw) + (e.key === 'ArrowLeft' ? 0.5 : -0.5)
      lastInput = performance.now()
    }
  })

  // clicar num destaque gira a casa até ele ficar de frente
  features.forEach((f) => {
    f.chip?.addEventListener('click', () => {
      const a = Math.atan2(f.normal.x, f.normal.z)
      const want = -a
      const diff = Math.atan2(Math.sin(want - yaw), Math.cos(want - yaw))
      goal = yaw + diff
      vel = 0
      lastInput = performance.now() + 2500
      detail && (detail.textContent = f.el.querySelector('p').textContent)
    })
  })

  /* ---------- laço de animação ---------- */
  const clock = new THREE.Clock()
  let introT = location.search.includes('mvshot') ? 1 : 0
  let visible = true
  const v3 = new THREE.Vector3()
  const n3 = new THREE.Vector3()
  const q = new THREE.Quaternion()
  const toCam = new THREE.Vector3()
  const roomN = new THREE.Vector3()
  const roomP = new THREE.Vector3()
  const proj = (p) => { v3.copy(p).project(camera); return [(v3.x * 0.5 + 0.5) * W, (-v3.y * 0.5 + 0.5) * H] }
  const ease = (t) => 1 - Math.pow(1 - t, 3)

  const frame = () => {
    const dt = Math.min(clock.getDelta(), 0.05)
    const t = clock.elapsedTime
    const now = performance.now()

    // entrada "rise"
    introT = Math.min(1, introT + dt / (calm ? 0.01 : 1.4))
    const rise = (1 - ease(introT)) * -3

    // giro: alvo > inércia > giro automático
    if (goal !== null) {
      yaw += (goal - yaw) * Math.min(1, dt * 4)
      if (Math.abs(goal - yaw) < 0.002) goal = null
    } else if (!dragging) {
      vel *= Math.pow(0.04, dt)
      yaw += vel * dt
      const idle = (now - lastInput) / 1000 - opt.autoRotateDelay
      if (!calm && idle > 0) yaw += opt.autoRotateSpeed * Math.min(1, idle / 1.5) * dt
    }
    model.rotation.y = yaw

    // inclinação pro cursor e flutuação
    tiltNow.lerp(dragging ? tiltTo.clone().set(0, 0) : tiltTo, Math.min(1, dt * 3))
    tiltG.rotation.x = tiltNow.x * opt.hoverTilt * 0.5
    tiltG.rotation.z = -tiltNow.y * opt.hoverTilt * 0.35
    const bob = calm ? 0 : Math.sin(t * 1.1) * opt.float
    floatG.position.y = rise + bob
    shadow.material.opacity = opt.shadowOpacity * (1 - bob * 0.6) * ease(introT)
    shadow.scale.setScalar(1 - bob * 0.08)
    model.children.forEach((c) => { if (c.userData.bob !== undefined) c.position.y += Math.sin(t * 1.6 + c.userData.bob) * 0.003 })

    // câmera
    zoom += (zoomTarget - zoom) * Math.min(1, dt * 6)
    const el = THREE.MathUtils.degToRad(opt.tilt)
    const d = baseDist / zoom
    camera.position.set(0, target.y + Math.sin(el) * d, Math.cos(el) * d)
    camera.lookAt(target)

    night += (nightTo - night) * Math.min(1, dt * 2.2)
    applySky(night)
    // a fachada do quarto (normal +z) está de frente para a câmera?
    model.getWorldQuaternion(q)
    roomN.set(0, 0, 1).applyQuaternion(q)
    roomP.set(-1.5, 5.05, 5.5)
    model.localToWorld(roomP)
    toCam.copy(camera.position).sub(roomP).normalize()
    house.update(dt, t, night, roomN.dot(toCam))
    renderer.render(scene, camera)

    // linhas e etiquetas
    model.getWorldQuaternion(q)
    let best = null
    const mobile = W < 640
    features.forEach((f) => {
      const a = model.localToWorld(f.anchor.clone())
      n3.copy(f.normal).applyQuaternion(q)
      toCam.copy(camera.position).sub(a).normalize()
      f.facing = n3.dot(toCam)
      const want = f.on ? f.facing > 0.22 : f.facing > 0.42
      if (want !== f.on) {
        f.on = want
        f.el.classList.toggle('is-on', want)
        f.g.classList.toggle('is-on', want)
        f.chip?.classList.toggle('is-on', want)
      }
      if (f.on && (!best || f.facing > best.facing)) best = f

      // etiqueta vai para fora da casa, na direção em que aquele lado "olha"
      const [sx, sy] = proj(a)
      const [ox, oy] = proj(a.clone().add(n3.multiplyScalar(3)))
      let dx = ox - sx
      let dy = oy - sy
      const len = Math.hypot(dx, dy)
      if (len < 8) { dx = sx < W / 2 ? -1 : 1; dy = -0.4 } else { dx /= len; dy /= len }
      const reach = mobile ? 46 : 150
      const bw = f.bw || (f.bw = f.el.offsetWidth)
      const bh = f.bh || (f.bh = f.el.offsetHeight)
      const right = dx >= 0
      const lx = sx + dx * reach
      const ly = sy + dy * reach * 0.8 - (mobile ? 10 : 18)
      f.box = { sx, sy, right, bw, bh, left: right ? lx : lx - bw, top: ly - bh / 2 }
    })

    // afasta etiquetas que se sobrepõem (só as visíveis), depois prende dentro do palco
    const pad = 12
    const shown = features.filter((f) => f.on).sort((a, b) => a.box.top - b.box.top)
    features.forEach((f) => {
      f.box.left = THREE.MathUtils.clamp(f.box.left, pad, W - f.box.bw - pad)
      f.box.top = THREE.MathUtils.clamp(f.box.top, pad, H - f.box.bh - pad)
    })
    for (let i = 1; i < shown.length; i++) {
      for (let j = 0; j < i; j++) {
        const A = shown[j].box
        const B = shown[i].box
        const overlapX = B.left < A.left + A.bw + 8 && A.left < B.left + B.bw + 8
        if (overlapX && B.top < A.top + A.bh + 8) B.top = A.top + A.bh + 8
      }
    }
    // se empurrou para fora por baixo, sobe o grupo
    const last = shown[shown.length - 1]
    if (last && last.box.top + last.box.bh > H - pad) {
      const lift = last.box.top + last.box.bh - (H - pad)
      shown.forEach((f) => { f.box.top = Math.max(pad, f.box.top - lift) })
    }

    features.forEach((f) => {
      const { sx, sy, right, bw, bh, left, top } = f.box
      const lx = right ? left : left + bw
      const ly = top + Math.min(bh / 2, 22)
      f.el.style.transform = `translate3d(${left.toFixed(1)}px, ${top.toFixed(1)}px, 0)`
      f.line.setAttribute('x1', sx.toFixed(1))
      f.line.setAttribute('y1', sy.toFixed(1))
      f.line.setAttribute('x2', lx.toFixed(1))
      f.line.setAttribute('y2', ly.toFixed(1))
      f.dots.forEach((c) => { c.setAttribute('cx', sx.toFixed(1)); c.setAttribute('cy', sy.toFixed(1)) })
    })
    if (detail && best && best !== frame.best && !goal) {
      frame.best = best
      detail.textContent = best.el.querySelector('p').textContent
    }

    if (visible) requestAnimationFrame(frame)
  }

  // só anima quando a seção está na tela
  const io = new IntersectionObserver(([en]) => {
    const was = visible
    visible = en.isIntersecting
    if (visible && !was) { clock.getDelta(); requestAnimationFrame(frame) }
  }, { rootMargin: '120px' })
  io.observe(root)
  root.classList.add('is-ready')
  requestAnimationFrame(frame)
}
