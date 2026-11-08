// Gera public/exemplos/venda-produto/img/pacote.png (pacote recortado do fundo).
// Foto: Unsplash photo-1651761483492-7d2e26dd3455 (licença gratuita).
// Uso: npm i jpeg-js pngjs (numa pasta à parte) e node recorte.mjs foto.jpg pacote.png
// Recorta o pacote kraft do fundo cinza da foto e salva um PNG transparente.
// Uso: node recorte.mjs <entrada.jpg> <saida.png>
import { readFileSync, writeFileSync } from 'node:fs'
import jpeg from 'jpeg-js'
import { PNG } from 'pngjs'

const [, , entrada, saida] = process.argv
const img = jpeg.decode(readFileSync(entrada), { useTArray: true })
const { width: W, height: H, data } = img

// cor do fundo: mediana da borda
const borda = []
for (let x = 0; x < W; x += 4) borda.push([x, 2], [x, H - 3])
for (let y = 0; y < H; y += 4) borda.push([2, y], [W - 3, y])
const canal = (c) => borda.map(([x, y]) => data[(y * W + x) * 4 + c]).sort((a, b) => a - b)[borda.length >> 1]
const bg = [canal(0), canal(1), canal(2)]

const clamp = (v) => Math.max(0, Math.min(1, v))
const alpha = new Float32Array(W * H)
for (let i = 0; i < W * H; i++) {
  const r = data[i * 4]
  const g = data[i * 4 + 1]
  const b = data[i * 4 + 2]
  const croma = Math.max(r, g, b) - Math.min(r, g, b)
  const dist = Math.hypot(r - bg[0], g - bg[1], b - bg[2])
  // kraft tem cor (croma alto); fundo e sombra são cinzas
  alpha[i] = clamp((croma - 14) / 12) * (dist > 20 ? 1 : 0)
}

// mantém só a peça ligada ao centro (o pacote), apagando ruído solto
const dentro = new Uint8Array(W * H)
const pilha = [((H * 0.5) | 0) * W + ((W * 0.5) | 0)]
while (pilha.length) {
  const i = pilha.pop()
  if (dentro[i] || alpha[i] < 0.35) continue
  dentro[i] = 1
  const x = i % W
  const y = (i / W) | 0
  if (x > 0) pilha.push(i - 1)
  if (x < W - 1) pilha.push(i + 1)
  if (y > 0) pilha.push(i - W)
  if (y < H - 1) pilha.push(i + W)
}
// fecha buracos internos: linha a linha, preenche entre a primeira e a última parte do pacote
for (let y = 0; y < H; y++) {
  let a = -1
  let b = -1
  for (let x = 0; x < W; x++) if (dentro[y * W + x]) (a < 0 && (a = x), (b = x))
  for (let x = a; x >= 0 && x <= b; x++) dentro[y * W + x] = 1
}

// afina o contorno em 1 px (some a linha cinza da borda)
const afinado = new Uint8Array(W * H)
for (let y = 1; y < H - 1; y++)
  for (let x = 1; x < W - 1; x++) {
    const i = y * W + x
    afinado[i] = dentro[i] && dentro[i - 1] && dentro[i + 1] && dentro[i - W] && dentro[i + W] ? 1 : 0
  }

// borda suave: média 3x3 do recorte
const final = new Float32Array(W * H)
for (let y = 1; y < H - 1; y++)
  for (let x = 1; x < W - 1; x++) {
    let s = 0
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) s += afinado[(y + dy) * W + x + dx]
    final[y * W + x] = s / 9
  }

// recorta na caixa do pacote, com folga
let x0 = W, y0 = H, x1 = 0, y1 = 0
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++)
    if (final[y * W + x] > 0.5) {
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y)
    }
const m = 6
x0 = Math.max(0, x0 - m); y0 = Math.max(0, y0 - m); x1 = Math.min(W - 1, x1 + m); y1 = Math.min(H - 1, y1 + m)
const png = new PNG({ width: x1 - x0 + 1, height: y1 - y0 + 1 })
for (let y = y0; y <= y1; y++)
  for (let x = x0; x <= x1; x++) {
    const i = y * W + x
    const o = ((y - y0) * png.width + (x - x0)) * 4
    png.data[o] = data[i * 4]
    png.data[o + 1] = data[i * 4 + 1]
    png.data[o + 2] = data[i * 4 + 2]
    png.data[o + 3] = Math.round(final[i] * 255)
  }
writeFileSync(saida, PNG.sync.write(png, { colorType: 6 }))
console.log('fundo', bg, 'recorte', png.width, 'x', png.height, 'caixa', { x0, y0, x1, y1 })
