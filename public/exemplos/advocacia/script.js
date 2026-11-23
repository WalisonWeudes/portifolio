const $ = (s, root = document) => root.querySelector(s)
const $$ = (s, root = document) => [...root.querySelectorAll(s)]
const calm = () => document.documentElement.classList.contains('calm')
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const wait = (ms) => new Promise((r) => setTimeout(r, calm() ? 0 : ms))
const photo = (id, w = 1100, h) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ''}&q=72`
const check = '<svg aria-hidden="true"><use href="#i-check"/></svg>'

const AREAS = {
  trabalho: {
    name: 'Trabalhista', img: '1787672357797-f5fa35bb0d18', alt: 'Operário de uniforme azul e boné, de braços cruzados',
    text: 'Demissão, horas extras, assédio, acidente e verbas que não foram pagas.',
    when: ['Saiu da empresa e tem dúvida sobre o acerto', 'Trabalhou sem carteira assinada', 'Sofreu acidente ou assédio no trabalho'],
    docs: ['Carteira de trabalho e contrato', 'Holerites e termo de rescisão', 'Conversas, escalas e nomes de testemunhas'],
  },
  familia: {
    name: 'Família', img: '1529180979161-06b8b6d6f2be', alt: 'Silhueta de uma família de mãos dadas ao pôr do sol',
    text: 'Divórcio, guarda, pensão, partilha e inventário, buscando acordo sempre que possível.',
    when: ['Decidiu se separar e não sabe por onde começar', 'A pensão parou de ser paga ou precisa mudar', 'Há bens para dividir depois de um falecimento'],
    docs: ['Certidões de casamento e nascimento', 'Comprovantes de renda e despesas dos filhos', 'Documentos dos bens do casal ou da família'],
  },
  consumidor: {
    name: 'Consumidor', img: '1626207887298-da2fc1f50e82', alt: 'Mão segurando um comprovante de compra',
    text: 'Cobrança indevida, negativação, plano de saúde, voo, banco e produto com defeito.',
    when: ['Seu nome foi negativado sem motivo', 'O plano de saúde negou um atendimento', 'Pagou e não recebeu o que foi combinado'],
    docs: ['Contrato, nota fiscal ou fatura', 'Protocolos de atendimento', 'Prints, e-mails e comprovantes de pagamento'],
  },
  imobiliario: {
    name: 'Imobiliário', img: '1759428679273-11d914866394', alt: 'Mão segurando chaves de casa sobre casas em miniatura',
    text: 'Compra e venda, aluguel, despejo, usucapião e regularização de imóvel.',
    when: ['Vai comprar e quer conferir a documentação', 'Há conflito com inquilino ou proprietário', 'Mora há anos em um imóvel sem escritura'],
    docs: ['Matrícula do imóvel, se houver', 'Contrato de compra ou de aluguel', 'Comprovantes de pagamento e de IPTU'],
  },
  empresarial: {
    name: 'Empresarial', img: '1758519288905-38b7b00c1023', alt: 'Dois empresários apertando as mãos em uma mesa',
    text: 'Contratos, sociedade, cobrança de clientes e prevenção de conflitos para pequenas empresas.',
    when: ['Precisa de um contrato que proteja de verdade', 'Os sócios não estão mais de acordo', 'Clientes devem e a cobrança não avança'],
    docs: ['Contrato social e CNPJ', 'Contratos com clientes e fornecedores', 'Notas, boletos e histórico da negociação'],
  },
}
const areaKeys = Object.keys(AREAS)

const QUESTIONS = [
  { id: 'area', q: 'Qual assunto pesa mais agora?', pics: true, opts: areaKeys.map((value) => ({ value, label: AREAS[value].name, img: AREAS[value].img })) },
  { id: 'quando', q: 'Quando isso começou?', opts: [
    { label: 'Nos últimos dias', u: 2 },
    { label: 'Neste mês', u: 2 },
    { label: 'Há alguns meses', u: 1 },
    { label: 'Há mais de um ano', u: 3 },
    { label: 'Ainda não aconteceu, quero prevenir', u: 0 },
  ] },
  { id: 'papel', q: 'Você recebeu algum documento oficial?', opts: [
    { label: 'Sim, uma citação ou intimação da Justiça', u: 3 },
    { label: 'Sim, uma notificação ou cobrança', u: 2 },
    { label: 'Não recebi nada', u: 0 },
    { label: 'Recebi algo, mas não entendi o que é', u: 3 },
  ] },
  { id: 'provas', q: 'Quanto da documentação você já tem?', opts: [
    { label: 'Quase tudo', p: 4 },
    { label: 'Uma parte', p: 2 },
    { label: 'Quase nada', p: 0 },
  ] },
  { id: 'tentou', q: 'Já tentou resolver diretamente?', opts: [
    { label: 'Sim, e guardei os registros', p: 2 },
    { label: 'Sim, mas só por conversa', p: 1 },
    { label: 'Ainda não', p: 0 },
  ] },
]

const VERDICTS = {
  hh: ['A balança pede prioridade', 'Existe sinal de prazo correndo, e você já tem material para uma análise. Vale marcar a conversa nos próximos dias.'],
  hl: ['Não espere ter tudo em mãos', 'O tempo pesa mais do que a papelada agora. Procure orientação logo e leve o que tiver. O restante pode ser reunido depois.'],
  lh: ['Seu caso está bem preparado', 'Não há sinal de pressa imediata, e a documentação ajuda. É um bom momento para avaliar as opções com calma.'],
  ll: ['Você tem tempo para se organizar', 'Nada indica urgência pelo que você respondeu. Reúna os documentos abaixo antes da conversa para aproveitar melhor a consulta.'],
}

/* ---------- entrada: balança, portas e nome ---------- */
const hero = $('.hero')
const intro = $('#intro')
const last = $('#heroLast')
last.innerHTML = [...last.textContent].map((c, i) => `<span class="ltr" style="--i:${i}">${c}</span>`).join('')

let introDone = false
function openDoors() {
  if (introDone) return
  introDone = true
  intro.classList.add('open')
  setTimeout(() => hero.classList.add('go'), 260)
  setTimeout(() => { intro.remove(); document.body.classList.remove('is-locked') }, 1300)
}
if (calm()) { hero.classList.add('go'); intro.remove() }
else {
  document.body.classList.add('is-locked')
  const start = () => setTimeout(openDoors, 2300)
  ;(document.fonts?.ready ?? Promise.resolve()).then(start)
  intro.addEventListener('click', openDoors)
  addEventListener('keydown', (e) => { if (e.key === 'Escape') openDoors() }, { once: true })
  setTimeout(openDoors, 4500)
}

/* recorta a estátua da própria foto para o nome passar por trás dela */
function cutStatue() {
  const img = $('#heroImg')
  const canvas = $('#heroCut')
  const W = img.naturalWidth
  const H = img.naturalHeight
  if (!W || matchMedia('(max-width: 640px)').matches) return
  const scale = Math.min(1, 1000 / W)
  const w = (canvas.width = Math.round(W * scale))
  const h = (canvas.height = Math.round(H * scale))
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, w, h)
  let data
  try { data = ctx.getImageData(0, 0, w, h) } catch { return }
  const px = data.data
  // o vestido tem reflexos azuis: esta área do corpo nunca entra na chave de cor
  const body = [[.655, .38], [.79, .38], [.81, .58], [.835, .76], [.86, 1], [.63, 1], [.655, .76], [.675, .58]]
  const inBody = (fx, fy) => {
    let inside = false
    for (let i = 0, j = body.length - 1; i < body.length; j = i++) {
      const [xi, yi] = body[i]
      const [xj, yj] = body[j]
      if (yi > fy !== yj > fy && fx < ((xj - xi) * (fy - yi)) / (yj - yi) + xi) inside = !inside
    }
    return inside
  }
  const seen = new Uint8Array(w * h)
  for (let y = 0, n = 0; y < h; y++) {
    for (let x = 0; x < w; x++, n++) {
      const fx = x / w
      const i = n * 4
      if (fx < 0.385) seen[n] = 1
      else if (px[i + 2] - px[i] > 60 && px[i + 1] > 70 && px[i + 2] > 105 && !inBody(fx, y / h)) seen[n] = 1
    }
  }
  for (let n = 0; n < w * h; n++) {
    if (!seen[n]) { px[n * 4 + 3] = 255; continue }
    let solid = 0
    const x = n % w
    if (x > 0 && !seen[n - 1]) solid++
    if (x < w - 1 && !seen[n + 1]) solid++
    if (n >= w && !seen[n - w]) solid++
    if (n < w * (h - 1) && !seen[n + w]) solid++
    px[n * 4 + 3] = solid * 48
  }
  ctx.putImageData(data, 0, 0)
  $('#heroFront').classList.add('ready')
}
const heroImg = $('#heroImg')
if (heroImg.complete) cutStatue()
else heroImg.addEventListener('load', cutStatue, { once: true })

/* ---------- faixa ---------- */
const tickerGroup = areaKeys.map((k) => `<span>${AREAS[k].name}<svg aria-hidden="true"><use href="#i-gem"/></svg></span>`).join('')
const ticker = $('#ticker')
ticker.innerHTML = tickerGroup.repeat(6)

/* ---------- balança com física ---------- */
const beam = $('#beam')
const panL = $('#panL')
const panR = $('#panR')
const svg = $('#scaleSvg')
const PIVOT = [340, 90]
const ARM = 280
const sim = { angle: 0, speed: 0, goal: 0, swingL: 0, vL: 0, swingR: 0, vR: 0, drag: false, seen: false, t: 0 }
let raf = null

function drawScale() {
  const r = (sim.angle * Math.PI) / 180
  const dy = Math.sin(r) * ARM
  const dx = ARM * (1 - Math.cos(r))
  beam.setAttribute('transform', `rotate(${sim.angle.toFixed(3)} ${PIVOT[0]} ${PIVOT[1]})`)
  panL.setAttribute('transform', `translate(${dx.toFixed(2)} ${(-dy).toFixed(2)}) rotate(${sim.swingL.toFixed(2)} 60 90)`)
  panR.setAttribute('transform', `translate(${(-dx).toFixed(2)} ${dy.toFixed(2)}) rotate(${sim.swingR.toFixed(2)} 620 90)`)
}
function stepScale(now) {
  raf = null
  if (!sim.seen || calm()) return
  sim.t = now / 1000
  const breathe = Math.sin(sim.t * 1.05) * 0.85 + Math.sin(sim.t * 0.47) * 0.45
  const before = sim.speed
  if (!sim.drag) {
    sim.speed += (sim.goal + breathe - sim.angle) * 0.026
    sim.speed *= 0.955
    sim.angle += sim.speed
  }
  const push = (sim.speed - before) * 3.4 + sim.speed * 0.24
  sim.vL += -sim.swingL * 0.022 - push
  sim.vR += -sim.swingR * 0.024 - push
  sim.vL *= 0.972
  sim.vR *= 0.972
  sim.swingL = clamp(sim.swingL + sim.vL, -17, 17)
  sim.swingR = clamp(sim.swingR + sim.vR, -17, 17)
  drawScale()
  raf = requestAnimationFrame(stepScale)
}
const wake = () => { if (!raf && sim.seen && !calm()) raf = requestAnimationFrame(stepScale) }
function tilt(deg) {
  sim.goal = deg
  if (calm()) { sim.angle = deg; sim.speed = 0; drawScale() }
  wake()
}
function kick(side, force = 1) {
  sim.speed += (side === 'R' ? 1 : -1) * 0.95 * force
  sim[`v${side}`] += (Math.random() > 0.5 ? 1 : -1) * 1.5 * force
  wake()
}
new IntersectionObserver(([e]) => {
  sim.seen = e.isIntersecting
  if (e.isIntersecting && !sim.intro && !calm()) {
    sim.intro = true
    sim.angle = -15
    sim.speed = 1.3
  }
  wake()
}, { rootMargin: '60px' }).observe($('#scaleFigure'))

/* arrastar ou tocar nos pratos */
const hint = $('#scaleHint')
if (matchMedia('(hover: none)').matches) hint.textContent = 'Toque nos pratos'
let press = null
const pointerAngle = (e) => {
  const b = svg.getBoundingClientRect()
  const k = b.width / 720
  const dx = e.clientX - (b.left + 360 * k)
  const dy = e.clientY - (b.top + PIVOT[1] * k)
  const reach = Math.max(70 * k, Math.abs(dx))
  return clamp((Math.atan2(dy, reach) * 180) / Math.PI * Math.sign(dx || 1), -24, 24)
}
svg.addEventListener('pointerdown', (e) => {
  hint.classList.add('off')
  press = { x: e.clientX, y: e.clientY, type: e.pointerType }
  if (e.pointerType === 'mouse') {
    sim.drag = true
    svg.classList.add('is-drag')
    svg.setPointerCapture(e.pointerId)
  }
})
svg.addEventListener('pointermove', (e) => {
  if (!sim.drag) return
  const next = pointerAngle(e)
  sim.speed = clamp(next - sim.angle, -5, 5)
  sim.angle = next
  wake()
})
const release = (e) => {
  if (!press) return
  const moved = Math.hypot(e.clientX - press.x, e.clientY - press.y)
  if (moved < 6) {
    const b = svg.getBoundingClientRect()
    kick(e.clientX < b.left + b.width / 2 ? 'L' : 'R', 2.8)
  }
  sim.drag = false
  svg.classList.remove('is-drag')
  press = null
}
svg.addEventListener('pointerup', release)
svg.addEventListener('pointercancel', () => { sim.drag = false; press = null; svg.classList.remove('is-drag') })

/* pesos, moedas e faíscas */
const ns = 'http://www.w3.org/2000/svg'
const shown = { L: 0, R: 0 }
function setDiscs(side, value, landed) {
  const group = $(`#weights${side}`)
  const cx = side === 'L' ? 60 : 620
  while (group.children.length > value) group.lastChild.remove()
  for (let i = group.children.length; i < value; i++) {
    const disc = document.createElementNS(ns, 'ellipse')
    disc.setAttribute('class', landed ? 's-weight land' : 's-weight')
    disc.setAttribute('cx', cx + (i % 2 ? 4 : -4))
    disc.setAttribute('cy', 261 - i * 11)
    disc.setAttribute('rx', 38 - i * 1.3)
    disc.setAttribute('ry', 8.5)
    group.append(disc)
  }
  shown[side] = value
  const num = $(`#num${side}`)
  num.textContent = value
}
function retrigger(el, cls) { el.classList.remove(cls); void el.getBoundingClientRect(); el.classList.add(cls) }
function sparks(x, y) {
  for (let i = 0; i < 12; i++) {
    const s = document.createElement('i')
    s.className = 'spark'
    document.body.append(s)
    const a = -Math.PI * (0.08 + Math.random() * 0.84)
    const d = 44 + Math.random() * 74
    s.animate([
      { transform: `translate(${x}px, ${y}px) rotate(45deg) scale(1)`, opacity: 1 },
      { transform: `translate(${x + Math.cos(a) * d}px, ${y + Math.sin(a) * d + 24}px) rotate(225deg) scale(.1)`, opacity: 0 },
    ], { duration: 520 + Math.random() * 300, easing: 'cubic-bezier(.16,1,.3,1)' }).onfinish = () => s.remove()
  }
}
function land(side, value) {
  hint.classList.add('off')
  setDiscs(side, value, true)
  retrigger($(`#num${side}`), 'bump')
  retrigger($(`#ring${side}`), 'go')
  kick(side)
  const b = $(`#plate${side}`).getBoundingClientRect()
  sparks(b.left + b.width / 2, b.top + 4)
  syncTilt()
}
function flyCoin(from, side, value, delay) {
  const end = $(`#plate${side}`).getBoundingClientRect()
  const ex = end.left + end.width / 2
  const ey = end.top - 8
  const coin = document.createElement('i')
  coin.className = 'coin'
  document.body.append(coin)
  const midX = (from.x + ex) / 2
  const midY = Math.min(from.y, ey) - 110
  return new Promise((done) => {
    const a = coin.animate([
      { transform: `translate(${from.x}px, ${from.y}px) rotateY(0deg) scale(.5)`, opacity: 0 },
      { transform: `translate(${from.x}px, ${from.y - 16}px) rotateY(120deg) scale(1)`, opacity: 1, offset: .12 },
      { transform: `translate(${midX}px, ${midY}px) rotateY(620deg) scale(1.2)`, opacity: 1, offset: .55, easing: 'cubic-bezier(.55,0,.9,.5)' },
      { transform: `translate(${ex}px, ${ey}px) rotateY(1080deg) scale(.8)`, opacity: 1 },
    ], { duration: 640, delay, fill: 'backwards', easing: 'ease-out' })
    a.onfinish = () => { coin.remove(); land(side, value); done() }
    a.oncancel = () => { coin.remove(); done() }
  })
}

/* ---------- perguntas ---------- */
const answers = {}
let step = 0
let busy = false
const quiz = $('#quiz')
const quizForm = $('#quizForm')
const verdict = $('#verdict')
const optsBox = $('#quizOpts')

const score = () => {
  let u = 0
  let p = 0
  QUESTIONS.forEach((q) => {
    const a = answers[q.id]
    if (a == null || !q.opts[a]) return
    u += q.opts[a].u || 0
    p += q.opts[a].p || 0
  })
  return { u: Math.min(u, 6), p: Math.min(p, 6) }
}
const syncTilt = () => tilt(clamp((shown.R - shown.L) * 3.1, -18, 18))

async function applyScore(fromEl) {
  const { u, p } = score()
  const box = fromEl?.getBoundingClientRect()
  const from = box ? { x: box.left + box.width / 2, y: box.top + box.height / 2 } : null
  const jobs = []
  if (u < shown.L) setDiscs('L', u)
  if (p < shown.R) setDiscs('R', p)
  if (calm() || !from) { setDiscs('L', u); setDiscs('R', p); syncTilt(); return }
  let d = 0
  for (let v = shown.L + 1; v <= u; v++) { jobs.push(flyCoin(from, 'L', v, d)); d += 130 }
  for (let v = shown.R + 1; v <= p; v++) { jobs.push(flyCoin(from, 'R', v, d)); d += 130 }
  syncTilt()
  await Promise.all(jobs)
}

function renderStep() {
  const q = QUESTIONS[step]
  $('#quizCount').textContent = `Pergunta ${step + 1} de ${QUESTIONS.length}`
  $('#quizLegend').textContent = q.q
  $('#quizBar').style.transform = `scaleX(${step / QUESTIONS.length})`
  $('#quizBack').hidden = step === 0
  optsBox.classList.toggle('quiz__opts--pics', !!q.pics)
  optsBox.innerHTML = q.opts.map((o, i) => {
    const on = answers[q.id] === i ? ' checked' : ''
    if (o.img) return `<label class="opt opt--pic" style="--i:${i}"><input type="radio" name="${q.id}" value="${i}"${on} /><span><img src="${photo(o.img, 320, 240)}" alt="" width="320" height="240" /><b>${esc(o.label)}</b></span></label>`
    return `<label class="opt" style="--i:${i}"><input type="radio" name="${q.id}" value="${i}"${on} /><span>${esc(o.label)}</span></label>`
  }).join('')
  retrigger(optsBox, 'in')
}

const scene = $('.scale__scene')
const sceneB = $('#sceneB')
function setScene(key) {
  if (!key) { scene.classList.remove('b'); return }
  const url = photo(AREAS[key].img, 1600)
  if (sceneB.src === url) { scene.classList.add('b'); return }
  scene.classList.remove('b')
  const pre = new Image()
  pre.onload = () => { sceneB.src = url; requestAnimationFrame(() => scene.classList.add('b')) }
  pre.src = url
}

async function strike() {
  if (calm()) return
  const g = $('#gavel')
  const a = g.animate([
    { opacity: 0, transform: 'translate(30px,-46px) rotate(38deg)' },
    { opacity: 1, transform: 'translate(0,-34px) rotate(46deg)', offset: .44, easing: 'cubic-bezier(.7,0,1,.6)' },
    { opacity: 1, transform: 'translate(0,0) rotate(-14deg)', offset: .62 },
    { opacity: 1, transform: 'translate(0,-6px) rotate(0deg)', offset: .78 },
    { opacity: 0, transform: 'translate(16px,-26px) rotate(22deg)' },
  ], { duration: 920 })
  await wait(570)
  retrigger(quiz, 'shake')
  kick('L', 2.4)
  kick('R', 2.4)
  const b = quiz.getBoundingClientRect()
  sparks(b.right - 90, b.top + 30)
  await a.finished.catch(() => {})
}

async function finish() {
  const { u, p } = score()
  const key = (u >= 3 ? 'h' : 'l') + (p >= 3 ? 'h' : 'l')
  const areaKey = QUESTIONS[0].opts[answers.area].value
  const area = AREAS[areaKey]
  $('#quizBar').style.transform = 'scaleX(1)'
  await strike()
  $('#vPhoto').src = photo(area.img, 760, 300)
  $('#vPhoto').alt = area.alt
  $('#vArea').textContent = area.name
  $('#vTitle').textContent = VERDICTS[key][0]
  $('#vText').textContent = VERDICTS[key][1]
  $('#vDocs').innerHTML = area.docs.map((d) => `<li>${esc(d)}</li>`).join('')
  quizForm.hidden = true
  verdict.hidden = false
  verdict.focus({ preventScroll: true })
  if (matchMedia('(max-width: 1120px)').matches) verdict.scrollIntoView({ block: 'nearest', behavior: calm() ? 'auto' : 'smooth' })
}
async function advance(keepFocus) {
  if (step < QUESTIONS.length - 1) {
    step += 1
    renderStep()
    if (keepFocus) $('#quizOpts input')?.focus({ preventScroll: true })
  } else await finish()
}
async function choose(input, keepFocus) {
  if (busy) return
  busy = true
  const q = QUESTIONS[step]
  const value = Number(input.value)
  answers[q.id] = value
  if (q.id === 'area') setScene(q.opts[value].value)
  const job = applyScore(input.closest('.opt'))
  await Promise.all([job, wait(300)])
  await wait(150)
  await advance(keepFocus)
  busy = false
}
let viaKeys = false
quizForm.addEventListener('keydown', (e) => {
  if (e.key.startsWith('Arrow')) viaKeys = true
  if (e.key === 'Enter' || e.key === ' ') {
    const input = e.target.closest('input[type=radio]')
    if (!input) return
    e.preventDefault()
    input.checked = true
    viaKeys = false
    choose(input, true)
  }
})
quizForm.addEventListener('submit', (e) => e.preventDefault())
optsBox.addEventListener('change', (e) => {
  if (viaKeys) { viaKeys = false; return } // com as setas, só avança ao confirmar com Enter ou espaço
  choose(e.target, false)
})
$('#quizBack').addEventListener('click', () => {
  if (busy || step === 0) return
  delete answers[QUESTIONS[step - 1].id]
  step -= 1
  if (step === 0) setScene(null)
  renderStep()
  applyScore(null)
})
function resetQuiz(area) {
  Object.keys(answers).forEach((k) => delete answers[k])
  busy = false
  step = 0
  verdict.hidden = true
  quizForm.hidden = false
  setDiscs('L', 0)
  setDiscs('R', 0)
  syncTilt()
  setScene(area)
  if (area) {
    answers.area = QUESTIONS[0].opts.findIndex((o) => o.value === area)
    step = 1
  }
  renderStep()
}
$('#vRedo').addEventListener('click', () => { resetQuiz(); $('#quizOpts input')?.focus({ preventScroll: true }) })
$('#vTake').addEventListener('click', () => {
  $('#fArea').value = QUESTIONS[0].opts[answers.area].value
  $('#fMsg').value = QUESTIONS.slice(1).map((x) => `${x.q} ${x.opts[answers[x.id]]?.label ?? ''}`).join('\n')
})
function startCase(area) {
  resetQuiz(area)
  $('.scale__stage').scrollIntoView({ behavior: calm() ? 'auto' : 'smooth' })
}
$$('[data-start]').forEach((b) => b.addEventListener('click', () => startCase(b.dataset.start)))

/* ---------- áreas em painéis de foto ---------- */
const panels = $('#panels')
panels.innerHTML = areaKeys.map((k) => {
  const a = AREAS[k]
  return `<article class="panel" data-area="${k}">
    <img src="${photo(a.img, 1100, 900)}" alt="${esc(a.alt)}" width="1100" height="900" loading="lazy" />
    <button class="panel__hit" type="button" aria-expanded="false" aria-controls="panel-${k}"><span>${esc(a.name)}</span></button>
    <div class="panel__body" id="panel-${k}">
      <h3>${esc(a.name)}</h3><p>${esc(a.text)}</p>
      <ul>${a.when.map((w) => `<li>${check}<span>${esc(w)}</span></li>`).join('')}</ul>
      <button class="btn btn--gold" type="button" data-case="${k}">Pesar este caso<svg aria-hidden="true"><use href="#i-arrow"/></svg></button>
    </div>
  </article>`
}).join('')
function selectArea(k) {
  $$('.panel', panels).forEach((p) => {
    const on = p.dataset.area === k
    p.classList.toggle('is-on', on)
    $('.panel__hit', p).setAttribute('aria-expanded', on)
    $('.panel__body', p).inert = !on
  })
}
panels.addEventListener('click', (e) => {
  const c = e.target.closest('[data-case]')
  if (c) return startCase(c.dataset.case)
  const p = e.target.closest('.panel')
  if (p) selectArea(p.dataset.area)
})
panels.addEventListener('focusin', (e) => { const h = e.target.closest('.panel__hit'); if (h) selectArea(h.closest('.panel').dataset.area) })
if (matchMedia('(hover: hover) and (min-width: 961px)').matches) {
  panels.addEventListener('pointerover', (e) => {
    const p = e.target.closest('.panel')
    if (p && !p.classList.contains('is-on')) selectArea(p.dataset.area)
  })
}

/* ---------- juridiquês ---------- */
const TERMS = {
  citada: ['Citada', 'Avisada oficialmente de que existe um processo contra você.'],
  contestar: ['Contestar', 'Apresentar a sua defesa por escrito ao juiz.'],
  revelia: ['Revelia', 'Quando a pessoa não se defende no prazo. O juiz pode presumir verdadeiro o que a outra parte afirmou.'],
  tutela: ['Tutela de urgência', 'Decisão rápida, antes do fim do processo, para quando esperar pode causar um dano.'],
  transito: ['Trânsito em julgado', 'O momento em que não cabe mais recurso e a decisão se torna definitiva.'],
}
const note = $('#paperNote')
const setNote = (t, x) => { note.innerHTML = `<b>${esc(t)}</b><span>${esc(x)}</span>` }
$('#paperLegal').addEventListener('click', (e) => {
  const b = e.target.closest('[data-term]')
  if (!b) return
  $$('[data-term]').forEach((x) => x.classList.toggle('is-on', x === b))
  setNote(...TERMS[b.dataset.term])
})
$('#jargonSwitch').addEventListener('click', (e) => {
  const btn = e.currentTarget
  const on = btn.getAttribute('aria-pressed') !== 'true'
  btn.setAttribute('aria-pressed', on)
  $('.paper').classList.toggle('is-plain', on)
  $('#paperLegal').hidden = on
  $('#paperPlain').hidden = !on
  if (on) setNote('Em português claro', 'Se recebeu um documento assim, o prazo pode já estar correndo. Procure um advogado.')
  else {
    $$('[data-term]').forEach((x) => x.classList.remove('is-on'))
    setNote('Escolha um termo', 'A explicação aparece aqui, em português claro.')
  }
})

/* ---------- caminho preso na rolagem ---------- */
const STEPS = [
  ['Escuta', 'Você conta o que aconteceu, no seu ritmo e com sigilo profissional.', 'clareza sobre quais documentos importam.', '1775163024488-e88e4a71179f', 'Duas pessoas revisando documentos em uma mesa'],
  ['Análise', 'Leio os documentos, confiro prazos e identifico o que pode ser feito.', 'os caminhos possíveis e os riscos de cada um.', '1635859890085-ec8cb5466806', 'Papéis espalhados sobre uma mesa escura'],
  ['Estratégia', 'Decidimos juntos entre acordo, notificação ou ação judicial.', 'proposta de honorários e plano por escrito.', '1763729805496-b5dbf7f00c79', 'Mão assinando um documento com caneta'],
  ['Atuação', 'Negocio ou represento você. Cada movimento relevante é explicado.', 'atualizações em linguagem simples.', '1711003596872-aa68f08a4b8e', 'Sala de tribunal com painéis de madeira'],
  ['Encerramento', 'Fechamos o caso e explico o que muda na prática para você.', 'resumo final e toda a documentação organizada.', '1638262052640-82e94d64664a', 'Duas pessoas apertando as mãos sobre uma mesa'],
]
const pathSec = $('#caminho')
const stage = $('.path__stage')
const marks = $('#pathMarks')
const pics = $('#pathPhotos')
pics.innerHTML = STEPS.map((s, i) => `<img src="${photo(s[3], 1700, 1000)}" alt="" width="1700" height="1000" ${i ? 'loading="lazy"' : ''} />`).join('')
marks.innerHTML = STEPS.map((s, i) => `<button type="button" data-step="${i}">${s[0]}</button>`).join('')
const picEls = $$('img', pics)
let pathNow = -1
function setPath(i) {
  if (i === pathNow) return
  pathNow = i
  $('#pathBig').textContent = i + 1
  $('#pathName').textContent = STEPS[i][0]
  $('#pathText').textContent = STEPS[i][1]
  $('#pathGet').textContent = STEPS[i][2]
  $$('button', marks).forEach((b, n) => {
    b.classList.toggle('is-on', n === i)
    if (n === i) b.setAttribute('aria-current', 'step')
    else b.removeAttribute('aria-current')
  })
  picEls.forEach((p, n) => {
    p.classList.toggle('on', n === i)
    p.classList.toggle('past', n < i)
    p.style.zIndex = n === i ? 3 : n < i ? 1 : 2
  })
  retrigger(stage, 'is-swap')
}
marks.addEventListener('click', (e) => {
  const b = e.target.closest('[data-step]')
  if (!b) return
  const i = Number(b.dataset.step)
  const span = pathSec.offsetHeight - innerHeight
  scrollTo({ top: pathSec.offsetTop + span * ((i + 0.5) / STEPS.length), behavior: calm() ? 'auto' : 'smooth' })
})

/* ---------- texto que acende na rolagem ---------- */
const litBlocks = $$('[data-lit]').map((el) => {
  const words = el.textContent.trim().split(/\s+/)
  el.setAttribute('aria-label', el.textContent.trim())
  el.innerHTML = words.map((w) => `<span class="w" aria-hidden="true">${esc(w)}</span>`).join(' ')
  return { el, words: $$('.w', el) }
})

/* ---------- rolagem ---------- */
const header = $('#header')
const heroPhoto = $('#heroPhoto')
const heroFront = $('#heroFront')
const parallax = $$('[data-par]').map((el) => ({ el, k: Number(el.dataset.par) }))
let px = 0
let py = 0
let tick = false
function applyHero() {
  if (matchMedia('(max-width: 640px)').matches) return
  const t = `translate3d(${px}px, ${py + scrollY * 0.09}px, 0)`
  heroPhoto.style.transform = t
  heroFront.style.transform = t
}
function onFrame() {
  tick = false
  const vh = innerHeight
  header.classList.toggle('is-stuck', scrollY > 20)
  const r = pathSec.getBoundingClientRect()
  const span = r.height - vh
  const prog = clamp(-r.top / span, 0, 0.9999)
  setPath(Math.floor(prog * STEPS.length))
  $('#pathFill').style.transform = `scaleX(${prog})`
  if (calm()) return
  if (scrollY < vh * 1.2) applyHero()
  if (scrollY < vh * 2.4) ticker.style.transform = `translate3d(${(-scrollY * 0.42).toFixed(1)}px, 0, 0)`
  litBlocks.forEach(({ el, words }) => {
    const b = el.getBoundingClientRect()
    if (b.top > vh || b.bottom < 0) {
      if (b.bottom < 0) words.forEach((w) => w.classList.add('on'))
      return
    }
    const p = clamp((vh * 0.88 - b.top) / (b.height + vh * 0.3), 0, 1)
    const n = Math.round(p * words.length)
    words.forEach((w, i) => w.classList.toggle('on', i < n))
  })
  parallax.forEach(({ el, k }) => {
    const b = el.parentElement.getBoundingClientRect()
    if (b.bottom < 0 || b.top > vh) return
    el.style.transform = `translate3d(0, ${((b.top + b.height / 2 - vh / 2) * -k).toFixed(1)}px, 0)`
  })
}
const schedule = () => { if (!tick) { tick = true; requestAnimationFrame(onFrame) } }
addEventListener('scroll', schedule, { passive: true })
addEventListener('resize', schedule)
if (!calm() && matchMedia('(hover: hover) and (min-width: 961px)').matches) {
  hero.addEventListener('pointermove', (e) => {
    px = (e.clientX / innerWidth - 0.5) * -16
    py = (e.clientY / innerHeight - 0.5) * -10
    requestAnimationFrame(applyHero)
  })
}

const reveal = new IntersectionObserver((entries) => {
  entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); reveal.unobserve(en.target) } })
}, { rootMargin: '0px 0px -8% 0px' })
$$('.rv').forEach((el) => reveal.observe(el))

/* ---------- contato ---------- */
const form = $('#contactForm')
const phone = $('#fPhone')
phone.addEventListener('input', () => {
  const d = phone.value.replace(/\D/g, '').slice(0, 11)
  phone.value = d.length > 7 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : d.length > 2 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : d
})
function fieldError(input, errEl, msg) {
  errEl.textContent = msg
  if (msg) { input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', errEl.id) }
  else { input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby') }
  return !msg
}
form.addEventListener('submit', (e) => {
  e.preventDefault()
  const name = $('#fName')
  const okName = fieldError(name, $('#fNameErr'), name.value.trim().length < 2 ? 'Escreva seu nome para sabermos como chamar você.' : '')
  const digits = phone.value.replace(/\D/g, '')
  const okPhone = fieldError(phone, $('#fPhoneErr'), digits.length < 10 ? 'Informe o WhatsApp com DDD, por exemplo (86) 90000-0000.' : '')
  if (!okName) { name.focus(); return }
  if (!okPhone) { phone.focus(); return }
  const ok = $('#formOk')
  ok.hidden = false
  ok.innerHTML = `<b>Pedido pronto, ${esc(name.value.trim().split(' ')[0])}.</b>Como este site é um exemplo, nada foi enviado. Em um site real, a mensagem chegaria ao WhatsApp do advogado.`
})

/* ---------- menu ---------- */
const burger = $('#burger')
const nav = $('#nav')
const closeMenu = () => { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Abrir menu') }
burger.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open')
  burger.setAttribute('aria-expanded', open)
  burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu')
})
nav.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu() })
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('is-open')) { closeMenu(); burger.focus() } })
const links = $$('a', nav)
const spy = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) links.forEach((l) => l.classList.toggle('is-here', l.getAttribute('href') === `#${en.target.id}`))
  })
}, { rootMargin: '-45% 0px -50% 0px' })
links.forEach((l) => { const t = $(l.getAttribute('href')); if (t) spy.observe(t) })

renderStep()
drawScale()
selectArea('trabalho')
setPath(0)
stage.classList.remove('is-swap')
onFrame()
