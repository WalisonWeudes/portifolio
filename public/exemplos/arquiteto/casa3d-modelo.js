// Modelo da Casa Jatobá para o visualizador 3D.
// Texturas: fotos do Unsplash carregadas direto de images.unsplash.com (repetidas em metros reais).
import * as THREE from 'three'

const UNSPLASH = (id, w = 1024) => `https://images.unsplash.com/photo-${id}?w=${w}&q=72&fm=jpg&fit=crop`
const IDS = {
  concrete: '1536566482680-fca31930a0bd', // concreto cinza
  concreteLight: '1787602525716-3c36be37d5fb', // concreto claro (lajes)
  burnt: '1525947088131-b701cd0f6dc3', // madeira queimada vertical (volume superior)
  cumaru: '1621295693450-080546d2ec8e', // cumaru avermelhado (brise)
  deck: '1506968430777-bf7784a87f23', // tábuas do deck
  floor: '1597113366853-fea190b6cd82', // piso de madeira clara
  grass: '1754339746358-7ac5741d3778', // grama vista de cima
  rock: '1776346515111-e40ec83505a7', // rocha (base da ilha)
  water: '1562016600-ece13e8ba570', // reflexos na água
  tiles: '1687160954681-230591e7b494', // pastilha da piscina
}

export function buildHouse(model, renderer, { lite = false } = {}) {
  const loader = new THREE.TextureLoader()
  loader.setCrossOrigin('anonymous')
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy())
  const cache = {}
  const tex = (key) => {
    if (cache[key]) return cache[key]
    const t = loader.load(UNSPLASH(IDS[key], lite ? 640 : 1024))
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = aniso
    return (cache[key] = t)
  }
  const textured = (key, opts = {}) => {
    const m = new THREE.MeshStandardMaterial({ map: tex(key), bumpMap: tex(key), bumpScale: opts.bump ?? 1.2, roughness: 0.9, ...opts.mat })
    m.userData.tile = opts.tile ?? 2 // metros por repetição
    return m
  }

  // gerador fixo: a ilha sai sempre igual
  let seed = 11
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)

  /* ---------- texturas desenhadas no canvas ---------- */
  const canvasTex = (w, h, draw) => {
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    draw(c.getContext('2d'), w, h)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }
  const radial = canvasTex(128, 128, (x) => {
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, 'rgba(0,0,0,1)')
    g.addColorStop(0.55, 'rgba(0,0,0,.55)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    x.fillStyle = g
    x.fillRect(0, 0, 128, 128)
  })
  const solarTex = canvasTex(256, 160, (x, w, h) => {
    x.fillStyle = '#16233a'
    x.fillRect(0, 0, w, h)
    x.strokeStyle = 'rgba(160,190,230,.35)'
    x.lineWidth = 2
    for (let i = 0; i <= 6; i++) { x.beginPath(); x.moveTo((i * w) / 6, 0); x.lineTo((i * w) / 6, h); x.stroke() }
    for (let i = 0; i <= 4; i++) { x.beginPath(); x.moveTo(0, (i * h) / 4); x.lineTo(w, (i * h) / 4); x.stroke() }
  })
  // interior aceso visto pela janela (quarto): parede quente, cabeceira e luminária
  const roomTex = (bed) => canvasTex(512, 320, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, '#5a3b22')
    g.addColorStop(0.45, '#f0b877')
    g.addColorStop(1, '#3a2617')
    x.fillStyle = g
    x.fillRect(0, 0, w, h)
    const s = x.createRadialGradient(w * 0.3, h * 0.35, 4, w * 0.3, h * 0.35, w * 0.35)
    s.addColorStop(0, 'rgba(255,236,200,.95)')
    s.addColorStop(1, 'rgba(255,200,140,0)')
    x.fillStyle = s
    x.fillRect(0, 0, w, h)
    x.fillStyle = 'rgba(30,20,14,.85)'
    if (bed) {
      x.fillRect(w * 0.42, h * 0.55, w * 0.42, h * 0.12) // cabeceira
      x.fillRect(w * 0.38, h * 0.67, w * 0.5, h * 0.33) // cama
      x.fillStyle = 'rgba(240,230,215,.9)'
      x.fillRect(w * 0.4, h * 0.66, w * 0.46, h * 0.06)
    } else {
      x.fillRect(w * 0.1, h * 0.7, w * 0.8, h * 0.06) // bancada
    }
    x.fillStyle = 'rgba(25,18,12,.9)'
    x.fillRect(w * 0.12, h * 0.1, 6, h * 0.62) // cortina/montante
  })

  /* ---------- materiais ---------- */
  const M = {
    concrete: textured('concrete', { tile: 2.4, mat: { color: 0xd8d4cd } }),
    concreteLight: textured('concreteLight', { tile: 3, mat: { color: 0xf2efe9 } }),
    burnt: textured('burnt', { tile: 1.6, bump: 2, mat: { color: 0x8c8c8c, roughness: 0.85 } }),
    cumaru: textured('cumaru', { tile: 1.4, mat: { color: 0xe0b08a, roughness: 0.7 } }),
    deck: textured('deck', { tile: 1.8, mat: { color: 0xd6b08f, roughness: 0.8 } }),
    floor: textured('floor', { tile: 2, bump: 0.4, mat: { color: 0xf3dcc0, roughness: 0.55 } }),
    grass: textured('grass', { tile: 2.2, bump: 2, mat: { color: 0xb7c99a, roughness: 1 } }),
    roofGrass: textured('grass', { tile: 1.6, bump: 2, mat: { color: 0xa9be8c, roughness: 1 } }),
    rock: textured('rock', { tile: 3, bump: 3, mat: { color: 0xb3a597, roughness: 1 } }),
    soil: textured('rock', { tile: 2, bump: 2, mat: { color: 0x7d6450, roughness: 1 } }),
    tiles: textured('tiles', { tile: 1.2, bump: 0.3, mat: { color: 0xffffff, roughness: 0.3 } }),
    water: new THREE.MeshStandardMaterial({ map: tex('water'), color: 0x9fe3f2, roughness: 0.05, metalness: 0.15, transparent: true, opacity: 0.72, emissive: 0x0b6a8a, emissiveIntensity: 0.55, envMapIntensity: 1.6 }),
    black: new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.45, metalness: 0.6 }),
    white: new THREE.MeshStandardMaterial({ color: 0xf1eee8, roughness: 0.6 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0xa9c6d2, roughness: 0.03, metalness: 0, transparent: true, opacity: 0.28, reflectivity: 0.9, envMapIntensity: 2.2, clearcoat: 1 }),
    frosted: new THREE.MeshPhysicalMaterial({ color: 0xf4f6f6, roughness: 0.55, transparent: true, opacity: 0.86, envMapIntensity: 0.8 }),
    warmWall: new THREE.MeshStandardMaterial({ color: 0xf2e6d6, emissive: 0xffb36b, emissiveIntensity: 0.28, roughness: 0.9 }),
    fabric: new THREE.MeshStandardMaterial({ color: 0xd9d0c3, roughness: 1 }),
    fabricDark: new THREE.MeshStandardMaterial({ color: 0x4b4540, roughness: 1 }),
    rug: new THREE.MeshStandardMaterial({ color: 0xbfae98, roughness: 1 }),
    orange: new THREE.MeshStandardMaterial({ color: 0xff5a1f, roughness: 0.5 }),
    bulb: new THREE.MeshStandardMaterial({ color: 0xfff1d6, emissive: 0xffd7a0, emissiveIntensity: 3 }),
    poolLight: new THREE.MeshStandardMaterial({ color: 0xcff6ff, emissive: 0x7fe7ff, emissiveIntensity: 3 }),
    roomBed: new THREE.MeshStandardMaterial({ map: roomTex(true), emissive: 0xffffff, emissiveMap: roomTex(true), emissiveIntensity: 0.75 }),
    roomKitchen: new THREE.MeshStandardMaterial({ map: roomTex(false), emissive: 0xffffff, emissiveMap: roomTex(false), emissiveIntensity: 0.6 }),
    solar: new THREE.MeshStandardMaterial({ map: solarTex, roughness: 0.18, metalness: 0.55, envMapIntensity: 1.8 }),
    trunk: new THREE.MeshStandardMaterial({ color: 0x4e3a2c, roughness: 1 }),
    leaves: [0x4f6f35, 0x5d7d3d, 0x3f5d2b, 0x6a8645].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95 })),
    ao: new THREE.MeshBasicMaterial({ map: radial, transparent: true, opacity: 0.5, depthWrite: false, color: 0x000000 }),
    plant: new THREE.MeshStandardMaterial({ color: 0x3f6a34, roughness: 0.9 }),
    pot: new THREE.MeshStandardMaterial({ color: 0x2d2b29, roughness: 0.8 }),
  }

  // caixa com UV em metros reais, para a textura não esticar
  const geoCache = new Map()
  const boxGeo = (w, h, d, tile) => {
    const k = `${w}|${h}|${d}|${tile}`
    if (geoCache.has(k)) return geoCache.get(k)
    const g = new THREE.BoxGeometry(w, h, d)
    if (tile) {
      const uv = g.attributes.uv
      const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]] // +x -x +y -y +z -z
      for (let f = 0; f < 6; f++) {
        for (let v = 0; v < 4; v++) {
          const i = f * 4 + v
          uv.setXY(i, (uv.getX(i) * dims[f][0]) / tile, (uv.getY(i) * dims[f][1]) / tile)
        }
      }
    }
    geoCache.set(k, g)
    return g
  }
  const noShadow = new Set([M.glass, M.water, M.ao, M.frosted])
  const box = (w, h, d, mat, x, y, z, parent = model) => {
    const m = new THREE.Mesh(boxGeo(w, h, d, mat.userData?.tile), mat)
    m.position.set(x, y, z)
    m.castShadow = !noShadow.has(mat)
    m.receiveShadow = mat !== M.ao
    parent.add(m)
    return m
  }
  const aoDecal = (x, z, w, d, y = 0.012, opacity = 0.5) => {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, d), M.ao.clone())
    p.material.opacity = opacity
    p.rotation.x = -Math.PI / 2
    p.position.set(x, y, z)
    p.renderOrder = 1
    model.add(p)
  }

  /* ---------- ilha flutuante ---------- */
  const R = 7.2
  {
    const top = new THREE.CylinderGeometry(R + 0.05, R, 0.18, 72)
    // UV do topo em metros
    const uv = top.attributes.uv
    const pos = top.attributes.position
    for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / M.grass.userData.tile, pos.getZ(i) / M.grass.userData.tile)
    const grass = new THREE.Mesh(top, M.grass)
    grass.position.y = -0.09
    grass.receiveShadow = true
    model.add(grass)

    const band = new THREE.CylinderGeometry(R, R - 0.3, 0.7, 72, 2)
    const bp = band.attributes.position
    for (let i = 0; i < bp.count; i++) {
      const y = bp.getY(i)
      if (y < 0.3) { const k = 1 + (rnd() - 0.5) * 0.05; bp.setX(i, bp.getX(i) * k); bp.setZ(i, bp.getZ(i) * k) }
    }
    band.computeVertexNormals()
    const bu = band.attributes.uv
    for (let i = 0; i < bu.count; i++) bu.setXY(i, bu.getX(i) * 14, bu.getY(i) * 0.6)
    const soil = new THREE.Mesh(band, M.soil)
    soil.position.y = -0.53
    soil.receiveShadow = true
    model.add(soil)

    const cone = new THREE.ConeGeometry(R - 0.3, 5.6, 40, 8)
    const cp = cone.attributes.position
    const v = new THREE.Vector3()
    for (let i = 0; i < cp.count; i++) {
      v.fromBufferAttribute(cp, i)
      if (v.y < 2.75) {
        const ang = Math.atan2(v.z, v.x)
        const k = 1 + Math.sin(ang * 5 + v.y) * 0.06 + (rnd() - 0.5) * 0.22
        v.x *= k
        v.z *= k
        v.y += (rnd() - 0.5) * 0.45
      }
      cp.setXYZ(i, v.x, v.y, v.z)
    }
    cone.computeVertexNormals()
    const cu = cone.attributes.uv
    for (let i = 0; i < cu.count; i++) cu.setXY(i, cu.getX(i) * 6, cu.getY(i) * 2.2)
    const rock = new THREE.Mesh(cone, M.rock)
    rock.rotation.x = Math.PI
    rock.position.y = -0.88 - 2.8
    rock.castShadow = true
    model.add(rock)

    // pedras soltas flutuando embaixo
    for (let i = 0; i < 6; i++) {
      const s = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22 + rnd() * 0.4, 1), M.rock)
      const a = rnd() * Math.PI * 2
      s.position.set(Math.cos(a) * (2 + rnd() * 3.5), -6.6 - rnd() * 1.8, Math.sin(a) * (2 + rnd() * 3.5))
      s.scale.y = 0.7
      s.userData.bob = rnd() * Math.PI * 2
      model.add(s)
    }
    // pedras na borda da grama
    for (let i = 0; i < 7; i++) {
      const a = rnd() * Math.PI * 2
      const s = new THREE.Mesh(new THREE.DodecahedronGeometry(0.25 + rnd() * 0.35, 1), M.rock)
      s.position.set(Math.cos(a) * (R - 0.5), 0.05, Math.sin(a) * (R - 0.5))
      s.scale.y = 0.55
      s.castShadow = s.receiveShadow = true
      model.add(s)
    }
  }

  /* ---------- árvores mais orgânicas ---------- */
  const tree = (x, z, s) => {
    const g = new THREE.Group()
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * s, 0.16 * s, 2.2 * s, 8), M.trunk)
    trunk.position.y = 1.1 * s
    trunk.rotation.z = (rnd() - 0.5) * 0.12
    trunk.castShadow = true
    g.add(trunk)
    const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.04 * s, 0.07 * s, 1 * s, 6), M.trunk)
    branch.position.set(0.25 * s, 1.7 * s, 0)
    branch.rotation.z = -0.7
    branch.castShadow = true
    g.add(branch)
    const blobs = 5 + Math.floor(rnd() * 3)
    for (let i = 0; i < blobs; i++) {
      const r = (0.55 + rnd() * 0.45) * s
      const c = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), M.leaves[Math.floor(rnd() * M.leaves.length)])
      const a = rnd() * Math.PI * 2
      c.position.set(Math.cos(a) * 0.6 * s, (2.2 + rnd() * 1.1) * s, Math.sin(a) * 0.6 * s)
      c.scale.set(1, 0.85, 1)
      c.castShadow = c.receiveShadow = true
      g.add(c)
    }
    g.position.set(x, 0, z)
    g.rotation.y = rnd() * Math.PI * 2
    model.add(g)
    aoDecal(x, z, 2.6 * s, 2.6 * s, 0.014, 0.45)
  }
  tree(-5.4, -3.7, 1.15)
  tree(5.2, -4.4, 1)
  tree(-5.9, 2.9, 0.8)
  tree(6.1, 1.4, 0.72)
  tree(-3.1, -5.8, 0.78)
  tree(1.6, -6.3, 0.62)

  // arbustos
  const shrub = (x, y, z, r) => {
    const b = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), M.leaves[Math.floor(rnd() * M.leaves.length)])
    b.position.set(x, y + r * 0.6, z)
    b.scale.y = 0.75
    b.castShadow = b.receiveShadow = true
    model.add(b)
  }
  for (let i = 0; i < 12; i++) {
    const a = -0.6 + rnd() * 3.2
    const rr = 5.6 + rnd() * 1
    shrub(Math.cos(a) * rr, 0, -Math.sin(a) * rr, 0.25 + rnd() * 0.25)
  }

  /* ---------- casa ---------- */
  aoDecal(0, 0.2, 13, 9.5, 0.011, 0.55) // sombra de contato da casa

  // base
  box(10.2, 0.3, 6.6, M.concreteLight, 0, 0.15, 0)

  // térreo: x -4.5..4.5, z -2.5..2.5, y 0.3..3.3
  box(9, 3, 0.3, M.concrete, 0, 1.8, -2.35)
  box(0.3, 3, 5, M.concrete, -4.35, 1.8, 0)
  box(0.06, 2.4, 1.1, M.orange, -4.53, 1.5, -1.1) // porta pivotante laranja
  box(0.05, 0.6, 0.05, M.black, -4.58, 1.4, -0.65) // puxador
  box(0.08, 2.9, 4.6, M.frosted, 4.46, 1.8, 0) // vidro jateado
  for (const z of [-2.35, 0, 2.35]) box(0.1, 3, 0.1, M.black, 4.44, 1.8, z)
  box(8.8, 2.9, 0.05, M.glass, 0, 1.8, 2.45) // pano de vidro frontal
  for (let i = 0; i <= 6; i++) box(0.05, 2.95, 0.09, M.black, -4.2 + i * 1.4, 1.8, 2.47)
  box(8.9, 0.07, 0.1, M.black, 0, 0.34, 2.47)
  box(8.9, 0.07, 0.1, M.black, 0, 3.26, 2.47)

  // interior do térreo
  box(8.6, 0.04, 4.6, M.floor, 0, 0.32, 0)
  box(8.6, 2.8, 0.02, M.warmWall, 0, 1.8, -2.19)
  box(3.2, 0.02, 2, M.rug, 1.4, 0.35, -0.6)
  box(2.6, 0.42, 0.95, M.fabric, 1.4, 0.56, -1.25) // sofá
  box(2.6, 0.5, 0.22, M.fabric, 1.4, 0.98, -1.66)
  box(0.22, 0.6, 0.95, M.fabric, 0.15, 0.62, -1.25)
  box(0.22, 0.6, 0.95, M.fabric, 2.65, 0.62, -1.25)
  box(1.2, 0.3, 0.7, M.cumaru, 1.4, 0.48, 0.1) // mesa de centro
  box(0.9, 0.5, 0.9, M.fabricDark, 3.3, 0.6, 0.3) // poltrona
  box(2.4, 0.92, 0.9, M.white, -2.5, 0.78, -0.3) // ilha da cozinha
  box(2.5, 0.05, 1, M.black, -2.5, 1.26, -0.3)
  box(3, 2.2, 0.4, M.cumaru, -2.5, 1.4, -1.98) // armário
  box(1.5, 0.85, 0.04, M.black, 3.1, 1.75, -2.17) // TV
  for (const x of [-3.1, -2.5, -1.9]) { // pendentes
    box(0.01, 0.9, 0.01, M.black, x, 2.85, -0.3)
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 12), M.bulb)
    b.position.set(x, 2.35, -0.3)
    model.add(b)
  }
  for (const [x, z] of [[-3, 1.2], [-0.6, 1.2], [1.8, 1.2], [3.8, 1.2], [-0.6, -1], [3.8, -1]]) { // spots no forro
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 12), M.bulb)
    s.position.set(x, 3.29, z)
    model.add(s)
  }
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.17, 0.5, 16), M.pot)
  pot.position.set(4, 0.57, -1.7)
  model.add(pot)
  shrub(4, 0.8, -1.7, 0.35)

  // laje do térreo, laje jardim e guarda-corpo de vidro
  box(10, 0.35, 6.2, M.concreteLight, 0, 3.475, 0.1)
  box(4.1, 0.2, 5.6, M.roofGrass, 2.75, 3.75, 0.1)
  for (let i = 0; i < 10; i++) shrub(1.2 + rnd() * 3.3, 3.85, -2.3 + rnd() * 4.8, 0.16 + rnd() * 0.16)
  box(4.3, 1, 0.03, M.glass, 2.75, 4.15, 3.18)
  box(0.03, 1, 6.1, M.glass, 4.98, 4.15, 0.1)
  box(4.3, 0.05, 0.06, M.black, 2.75, 4.66, 3.18)
  box(0.06, 0.05, 6.1, M.black, 4.98, 4.66, 0.1)

  // volume superior em balanço: x -3.5..0.5, z -3..5.5, y 3.65..6.45, revestido de madeira queimada
  // parte de trás maciça + casca do quarto na ponta do balanço (z 3.5..5.5), aberta para a janela
  box(4, 2.8, 6.5, M.burnt, -1.5, 5.05, 0.25)
  box(4, 0.15, 2, M.burnt, -1.5, 3.725, 4.5) // piso
  box(4, 0.15, 2, M.burnt, -1.5, 6.375, 4.5) // teto
  for (const x of [-3.425, 0.425]) box(0.15, 2.8, 2, M.burnt, x, 5.05, 4.5) // laterais
  box(4, 0.3, 0.15, M.burnt, -1.5, 6.3, 5.43) // moldura da janela
  box(4, 0.3, 0.15, M.burnt, -1.5, 3.8, 5.43)
  for (const x of [-3.35, 0.35]) box(0.3, 2.2, 0.15, M.burnt, x, 5.05, 5.43)
  box(3.4, 2.2, 0.04, M.glass, -1.5, 5.05, 5.53)

  // quarto por dentro
  box(3.7, 0.02, 1.95, M.floor, -1.5, 3.81, 4.5)
  box(3.7, 2.35, 0.02, M.warmWall, -1.5, 4.98, 3.51) // parede da cabeceira
  for (const x of [-3.34, 0.34]) box(0.02, 2.35, 1.95, M.warmWall, x, 4.98, 4.5)
  box(3.7, 0.02, 1.95, M.white, -1.5, 6.29, 4.5) // forro
  box(2.6, 0.02, 1.4, M.rug, -1.5, 3.83, 4.4)
  box(1.75, 0.3, 1.25, M.cumaru, -1.5, 3.97, 4.15) // cama
  box(1.65, 0.16, 1.15, M.white, -1.5, 4.2, 4.15)
  box(1.66, 0.06, 0.55, M.fabricDark, -1.5, 4.29, 4.45) // manta
  for (const x of [-1.95, -1.05]) box(0.6, 0.12, 0.3, M.fabric, x, 4.34, 3.72) // travesseiros
  box(2, 0.8, 0.07, M.cumaru, -1.5, 4.35, 3.56) // cabeceira
  for (const x of [-2.75, -0.25]) {
    box(0.45, 0.42, 0.4, M.white, x, 4.03, 3.75) // criado-mudo
    box(0.03, 0.3, 0.03, M.black, x, 4.39, 3.75)
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 0.18, 16), M.bulb) // abajur
    shade.position.set(x, 4.6, 3.75)
    model.add(shade)
  }
  box(1.1, 0.75, 0.03, M.black, -1.5, 5.45, 3.53) // quadro
  box(1, 0.65, 0.01, M.orange, -1.5, 5.45, 3.545)
  const potUp = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.38, 14), M.pot)
  potUp.position.set(0.05, 4.01, 5.1)
  model.add(potUp)
  shrub(0.05, 4.2, 5.1, 0.24)

  // cortinas de linho com pregas: abrem quando a janela fica de frente para quem olha
  const curtainMat = new THREE.MeshStandardMaterial({ color: 0xece3d6, roughness: 1, side: THREE.DoubleSide, emissive: 0xffc98f, emissiveIntensity: 0 })
  const pleated = (w, h, dir) => {
    const g = new THREE.PlaneGeometry(w, h, 40, 1)
    g.translate((dir * w) / 2, 0, 0) // pivô na borda de fora
    const p = g.attributes.position
    for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 30) * 0.035)
    g.computeVertexNormals()
    return g
  }
  const curtains = [1, -1].map((dir) => {
    const c = new THREE.Mesh(pleated(1.72, 2.12, dir), curtainMat)
    c.position.set(dir > 0 ? -3.2 : 0.2, 5.03, 5.36)
    c.castShadow = true
    model.add(c)
    return c
  })
  box(3.6, 0.03, 0.03, M.black, -1.5, 6.11, 5.36) // varão
  box(3.6, 0.1, 0.12, M.black, -1.5, 6.2, 5.54)
  box(3.6, 0.1, 0.12, M.black, -1.5, 3.9, 5.54)
  for (const x of [-3.25, 0.25]) box(0.1, 2.4, 0.12, M.black, x, 5.05, 5.54)
  box(0.02, 0.8, 6, M.roomKitchen, 0.515, 5.4, 1.4) // janela em fita (leste)
  box(0.04, 0.8, 6, M.glass, 0.535, 5.4, 1.4)
  box(0.08, 0.06, 6.1, M.black, 0.55, 5.82, 1.4)
  box(0.08, 0.06, 6.1, M.black, 0.55, 4.98, 1.4)
  for (let z = -2.8; z <= 5.31; z += 0.24) box(0.06, 2.6, 0.12, M.cumaru, -3.63, 5.05, z) // brise de cumaru
  box(0.1, 0.08, 8.3, M.black, -3.66, 6.38, 1.25)
  box(0.1, 0.08, 8.3, M.black, -3.66, 3.72, 1.25)
  box(4.12, 0.14, 8.62, M.black, -1.5, 6.52, 1.25) // platibanda
  // spots embutidos no balanço
  for (const [x, z] of [[-2.6, 4.2], [-0.4, 4.2], [-1.5, 5]]) {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.02, 12), M.bulb)
    s.position.set(x, 3.63, z)
    model.add(s)
  }

  // placas solares
  for (const [x, z] of [[-2.4, -2.2], [-0.6, -2.2], [-2.4, -0.75], [-0.6, -0.75]]) {
    const p = box(1.6, 0.05, 1.15, M.solar, x, 6.82, z)
    p.rotation.x = -0.26
    box(1.64, 0.03, 0.04, M.black, x, 6.68, z + 0.56)
    box(0.05, 0.3, 0.05, M.black, x - 0.7, 6.66, z + 0.4)
    box(0.05, 0.3, 0.05, M.black, x + 0.7, 6.66, z + 0.4)
  }

  // deck sob o balanço com degraus e mesa
  box(4.4, 0.12, 3.2, M.deck, -1.5, 0.36, 4.1)
  box(4.4, 0.12, 0.4, M.deck, -1.5, 0.2, 5.9)
  box(1.6, 0.05, 0.85, M.cumaru, -1.6, 1.08, 4.3) // mesa
  for (const [x, z] of [[-2.3, 3.95], [-0.9, 3.95], [-2.3, 4.65], [-0.9, 4.65]]) box(0.05, 0.7, 0.05, M.black, x, 0.77, z)
  for (const [x, z] of [[-2, 3.55], [-1.2, 3.55], [-2, 5.05], [-1.2, 5.05]]) box(0.45, 0.45, 0.45, M.fabricDark, x, 0.65, z)

  // piscina com pastilha, água e luz
  for (const z of [3.2, 5.6]) box(3.9, 0.34, 0.2, M.concreteLight, 2.75, 0.17, z) // borda
  for (const x of [0.9, 4.6]) box(0.2, 0.34, 2.6, M.concreteLight, x, 0.17, 4.4)
  box(3.5, 0.02, 2.2, M.tiles, 2.75, 0.02, 4.4) // fundo
  box(3.5, 0.32, 0.02, M.tiles, 2.75, 0.17, 3.31)
  box(3.5, 0.32, 0.02, M.tiles, 2.75, 0.17, 5.49)
  box(0.02, 0.32, 2.2, M.tiles, 1.01, 0.17, 4.4)
  box(0.02, 0.32, 2.2, M.tiles, 4.49, 0.17, 4.4)
  const water = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 2.2), M.water)
  water.rotation.x = -Math.PI / 2
  water.position.set(2.75, 0.3, 4.4)
  model.add(water)
  M.water.map.repeat.set(1.6, 1)
  const glow = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.06, 0.02), M.poolLight)
  glow.position.set(2.75, 0.14, 3.33)
  model.add(glow)
  // espreguiçadeiras
  for (const x of [5.3, 6]) {
    box(0.6, 0.18, 1.8, M.white, x - 0.6, 0.25, 4.2)
    const back = box(0.6, 0.08, 0.7, M.white, x - 0.6, 0.55, 3.45)
    back.rotation.x = 0.6
  }
  aoDecal(2.75, 4.4, 5, 3.6, 0.011, 0.35)

  // caminho de pisantes e balizadores até a porta laranja
  for (let i = 0; i < 5; i++) box(0.75, 0.05, 0.42, M.concreteLight, -5.25, 0.025, 0.55 - i * 0.62)
  for (const z of [0.8, -0.9]) {
    box(0.08, 0.5, 0.08, M.black, -5.85, 0.25, z)
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.1), M.bulb)
    l.position.set(-5.85, 0.47, z)
    model.add(l)
  }

  /* ---------- luzes que pertencem à casa (acendem à noite) ---------- */
  const lamps = [] // [luz, intensidade à noite]
  const addLamp = (light, night) => { light.intensity = 0; lamps.push([light, night]); model.add(light); return light }
  addLamp(new THREE.PointLight(0xffb36b, 0, 9, 2), 10).position.set(0, 2.7, 0)
  addLamp(new THREE.PointLight(0xffc887, 0, 5, 2), 5).position.set(-2.5, 2.2, -0.3)
  addLamp(new THREE.PointLight(0xffc28a, 0, 6, 2), 6).position.set(-1.5, 5.9, 4.6) // quarto
  for (const x of [-2.6, -0.4]) {
    const s = addLamp(new THREE.SpotLight(0xffc78f, 0, 6, 0.75, 0.8, 2), 26)
    s.position.set(x, 3.6, 4.4)
    s.target.position.set(x, 0, 4.4)
    model.add(s.target)
  }
  for (const z of [0.8, -0.9]) addLamp(new THREE.PointLight(0xffd29a, 0, 2.2, 2), 1.6).position.set(-5.85, 0.55, z)
  const pool = addLamp(new THREE.PointLight(0x6fe2ff, 0, 3.5, 2), 6)
  pool.position.set(2.75, 0.2, 4.4)

  // materiais que brilham mais à noite: [material, dia, noite]
  const glowMats = [
    [M.bulb, 0, 3.2],
    [M.poolLight, 0.2, 3.5],
    [M.warmWall, 0.02, 0.45],
    [M.roomBed, 0, 1],
    [M.roomKitchen, 0, 0.85],
    [M.water, 0.12, 0.9],
    [curtainMat, 0, 0.3], // à noite a cortina fica iluminada por dentro
  ]
  // de dia o interior fica escuro atrás do vidro; à noite aparece aceso
  let curtainOpen = 0
  const tintMats = [M.roomKitchen].map((m) => [m, new THREE.Color(0x4a4744), m.color.clone()])

  /* ---------- cachorro caramelo ---------- */
  const dog = (() => {
    const fur = new THREE.MeshStandardMaterial({ color: 0xc98a4b, roughness: 0.95 })
    const furLight = new THREE.MeshStandardMaterial({ color: 0xead2b2, roughness: 0.95 })
    const furDark = new THREE.MeshStandardMaterial({ color: 0x8f5a2c, roughness: 0.95 })
    const nose = new THREE.MeshStandardMaterial({ color: 0x1a1412, roughness: 0.35 })
    const sph = (r, mat, x, y, z, sx = 1, sy = 1, sz = 1, parent) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), mat)
      m.position.set(x, y, z)
      m.scale.set(sx, sy, sz)
      m.castShadow = m.receiveShadow = true
      parent.add(m)
      return m
    }
    const cyl = (r, h, mat, x, y, z, parent) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.9, h, 10), mat)
      m.position.set(x, y, z)
      m.castShadow = true
      parent.add(m)
      return m
    }
    const collar = (parent, x, y, z, rx, ry) => {
      const c = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.016, 8, 24), M.orange)
      c.position.set(x, y, z)
      c.rotation.set(rx, ry, 0)
      parent.add(c)
    }

    // sentado (dia)
    const sit = new THREE.Group()
    const body = sph(0.17, fur, 0, 0.3, -0.02, 1, 1.35, 0.95, sit)
    body.rotation.x = -0.3
    sph(0.12, furLight, 0, 0.33, 0.08, 0.9, 1.1, 0.6, sit) // peito
    sph(0.15, fur, 0, 0.14, -0.1, 1.15, 0.8, 1.25, sit) // quadril
    for (const x of [-0.07, 0.07]) {
      cyl(0.032, 0.26, fur, x, 0.14, 0.1, sit)
      sph(0.042, furLight, x, 0.025, 0.13, 1, 0.6, 1.3, sit)
      sph(0.06, fur, x * 1.9, 0.06, -0.02, 1, 0.7, 1.6, sit) // patas de trás
    }
    const head = new THREE.Group()
    head.position.set(0, 0.56, 0.06)
    sit.add(head)
    sph(0.115, fur, 0, 0, 0, 1, 0.95, 1, head)
    sph(0.06, furLight, 0, -0.035, 0.1, 1, 0.8, 1.25, head) // focinho
    sph(0.02, nose, 0, -0.01, 0.17, 1.2, 0.9, 1, head)
    for (const x of [-0.045, 0.045]) sph(0.016, nose, x, 0.03, 0.098, 1, 1, 0.6, head)
    for (const s of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.1, 10), furDark)
      ear.position.set(s * 0.075, 0.1, -0.01)
      ear.rotation.z = -s * 0.35
      ear.castShadow = true
      head.add(ear)
    }
    collar(sit, 0, 0.45, 0.05, Math.PI / 2 - 0.35, 0)
    const tail = new THREE.Group()
    tail.position.set(0, 0.12, -0.24)
    sit.add(tail)
    const tailMesh = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.022, 8, 16, Math.PI * 0.9), fur)
    tailMesh.rotation.set(0, Math.PI / 2, 0.2)
    tailMesh.position.y = 0.08
    tailMesh.castShadow = true
    tail.add(tailMesh)

    // deitado dormindo na caminha (noite)
    const lie = new THREE.Group()
    const bed = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.42, 0.08, 28), M.fabricDark)
    bed.position.y = 0.04
    bed.receiveShadow = bed.castShadow = true
    lie.add(bed)
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.06, 10, 28), M.fabricDark)
    rim.rotation.x = Math.PI / 2
    rim.position.y = 0.1
    rim.castShadow = true
    lie.add(rim)
    const sleepBody = sph(0.2, fur, 0, 0.17, 0, 1.25, 0.62, 0.95, lie)
    sph(0.12, fur, -0.15, 0.14, -0.05, 1, 0.75, 1.1, lie) // quadril
    const sleepHead = new THREE.Group()
    sleepHead.position.set(0.2, 0.15, 0.1)
    sleepHead.rotation.set(0, -0.6, -0.15)
    lie.add(sleepHead)
    sph(0.105, fur, 0, 0, 0, 1, 0.85, 1, sleepHead)
    sph(0.055, furLight, 0.09, -0.03, 0.02, 1.25, 0.75, 1, sleepHead)
    sph(0.018, nose, 0.155, -0.015, 0.02, 1, 0.9, 1, sleepHead)
    for (const z of [-0.04, 0.05]) {
      const eye = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.006, 0.03), nose) // olhos fechados
      eye.position.set(0.085, 0.03, z)
      sleepHead.add(eye)
    }
    for (const s of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.042, 0.09, 10), furDark)
      ear.position.set(-0.03, 0.06, s * 0.07)
      ear.rotation.set(s * 1.1, 0, 0.5)
      sleepHead.add(ear)
    }
    for (const z of [0.1, 0.16]) sph(0.04, furLight, 0.22, 0.06, z, 1.4, 0.6, 1, lie) // patas da frente
    const sleepTail = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.024, 8, 18, Math.PI * 0.7), fur)
    sleepTail.rotation.set(Math.PI / 2, 0, Math.PI * 0.55)
    sleepTail.position.set(-0.02, 0.1, 0.02)
    lie.add(sleepTail)
    collar(lie, 0.13, 0.17, 0.08, 0, Math.PI / 2 - 0.5)

    // "z" flutuando
    const zTex = canvasTex(64, 64, (x) => {
      x.font = '700 48px Archivo, sans-serif'
      x.fillStyle = '#ffffff'
      x.textAlign = 'center'
      x.textBaseline = 'middle'
      x.fillText('z', 32, 34)
    })
    const zs = [0, 1, 2].map((i) => {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: zTex, transparent: true, depthWrite: false, opacity: 0 }))
      s.userData.phase = i / 3
      lie.add(s)
      return s
    })

    const g = new THREE.Group()
    g.add(sit, lie)
    g.position.set(0.5, 0.02, 6.25) // na grama, em frente à casa, entre o deck e a piscina
    g.rotation.y = 0.15
    g.scale.setScalar(1.55)
    model.add(g)
    aoDecal(0.5, 6.25, 1.4, 1.4, 0.013, 0.55)

    return {
      update(t, night) {
        const asleep = night > 0.5
        sit.visible = !asleep
        lie.visible = asleep
        if (!asleep) {
          tail.rotation.y = Math.sin(t * 9) * 0.55
          head.rotation.z = Math.sin(t * 0.9) * 0.12
          head.rotation.x = Math.sin(t * 0.7 + 1) * 0.05
        } else {
          sleepBody.scale.y = 0.62 + Math.sin(t * 1.8) * 0.025
          zs.forEach((s) => {
            const p = (t * 0.35 + s.userData.phase) % 1
            s.position.set(0.3 + p * 0.15, 0.32 + p * 0.5, 0.1)
            s.scale.setScalar(0.08 + p * 0.09)
            s.material.opacity = Math.sin(p * Math.PI) * Math.min(1, (night - 0.5) * 4)
          })
        }
      },
    }
  })()

  return {
    // night: 0 = dia, 1 = noite
    // front: quanto a fachada do quarto está de frente para a câmera (-1 a 1)
    update(dt, t, night = 1, front = 0) {
      const want = front > 0.72 ? 1 : 0
      curtainOpen += (want - curtainOpen) * Math.min(1, dt * 2.4)
      const s = 1 - curtainOpen * 0.84
      curtains.forEach((c) => { c.scale.x = s })
      const m = M.water.map
      m.offset.x = Math.sin(t * 0.18) * 0.06
      m.offset.y += dt * 0.012
      lamps.forEach(([l, n]) => { l.intensity = n * night * (l === pool ? 1 + Math.sin(t * 2.3) * 0.08 : 1) })
      glowMats.forEach(([mat, d, n]) => { mat.emissiveIntensity = d + (n - d) * night })
      tintMats.forEach(([mat, d, n]) => mat.color.lerpColors(d, n, night))
      dog.update(t, night)
    },
  }
}
