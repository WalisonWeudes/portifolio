// Bem-te-vi Pediatria — interações do site de exemplo
const $ = (s, el = document) => el.querySelector(s)
const $$ = (s, el = document) => [...el.querySelectorAll(s)]
const root = document.documentElement
const calm = root.classList.contains('calm')
const finePointer = matchMedia('(pointer: fine)').matches

/* ---------- entrada ---------- */
const intro = $('#intro')
const goLive = () => root.classList.add('is-live')
if (root.classList.contains('intro-play')) {
  root.style.overflow = 'hidden'
  // a trilha desenhada é esticada para a tela (caixa de 1000x400); o voo do
  // bem-te-vi usa pixels, então o caminho é convertido para o tamanho da tela
  const bird = $('.intro__bird')
  if (bird) {
    const sx = innerWidth / 1000
    const sy = innerHeight / 400
    const d = $('#introPath').getAttribute('d').replace(/(-?\d+(?:\.\d+)?)\s*,?\s*(-?\d+(?:\.\d+)?)/g, (_, x, y) => `${(x * sx).toFixed(1)} ${(y * sy).toFixed(1)}`)
    bird.style.offsetPath = `path('${d}')`
  }
  // a cortina sobe em 4,3 s (CSS); o site entra logo depois
  const end = () => {
    root.style.overflow = ''
    root.classList.remove('intro-play')
    intro?.remove()
  }
  const liveTimer = setTimeout(goLive, 4450)
  const endTimer = setTimeout(end, 5400)
  // clique, tecla ou toque pula a entrada
  const skip = () => {
    if (!intro?.isConnected || intro.classList.contains('is-skipping')) return
    clearTimeout(liveTimer)
    clearTimeout(endTimer)
    intro.classList.add('is-skipping')
    setTimeout(goLive, 150)
    setTimeout(end, 750)
  }
  intro?.addEventListener('click', skip)
  addEventListener('keydown', skip, { once: true })
} else {
  intro?.remove()
  requestAnimationFrame(() => requestAnimationFrame(goLive))
}

/* ---------- cabeçalho e menu ---------- */
const header = $('#header')
const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 10)
addEventListener('scroll', onScroll, { passive: true })
onScroll()

const burger = $('#burger')
const menu = $('#menu')
const setMenu = (open) => {
  burger.setAttribute('aria-expanded', String(open))
  burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu')
  menu.classList.toggle('is-open', open)
}
burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'))
menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false) })
addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false) })

/* ---------- revelar ao rolar ---------- */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return
    entry.target.classList.add('is-in')
    revealObs.unobserve(entry.target)
  })
}, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' })
$$('.reveal').forEach((el, i) => {
  // pequenos atrasos em sequência para itens lado a lado
  const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'))
  el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 5) * 90}ms`
  revealObs.observe(el)
})
// os títulos das seções também ganham o sublinhado ao aparecer
$$('.head').forEach((h) => revealObs.observe(h))

/* ---------- fita com texto correndo ---------- */
const ribbonText = $('#ribbonText')
const ribbonPath = $('#ribbonPath')
if (ribbonText && ribbonPath) {
  const unit = 'vacina em dia ✦ consulta sem pressa ✦ plantão no whatsapp ✦ brinquedoteca ✦ teste do pezinho ✦ de 0 a 18 anos ✦ '
  const pathLen = ribbonPath.getTotalLength()
  ribbonText.textContent = unit
  const unitLen = ribbonText.getComputedTextLength() || 1200
  const copies = Math.ceil(pathLen / unitLen) + 2
  ribbonText.textContent = unit.repeat(copies)
  let offset = 0
  let last = performance.now()
  let speed = 60 // px por segundo
  let visible = true
  new IntersectionObserver(([e]) => { visible = e.isIntersecting }).observe($('.ribbon'))
  // rolar a página acelera a fita por um instante
  let boost = 0
  let lastY = scrollY
  addEventListener('scroll', () => { boost = Math.min(500, boost + Math.abs(scrollY - lastY) * 2.2); lastY = scrollY }, { passive: true })
  const step = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    if (visible && !calm) {
      boost *= 0.92
      offset = (offset + (speed + boost) * dt) % unitLen
      ribbonText.setAttribute('startOffset', String(-offset))
    }
    requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

/* ---------- parallax da colagem do hero ---------- */
const art = $('#heroArt')
if (art && finePointer && !calm) {
  const layers = $$('[data-depth]', art)
  art.closest('.hero').addEventListener('pointermove', (e) => {
    const r = art.getBoundingClientRect()
    const x = (e.clientX - (r.left + r.width / 2)) / r.width
    const y = (e.clientY - (r.top + r.height / 2)) / r.height
    layers.forEach((l) => {
      const d = +l.dataset.depth
      l.style.translate = `${(-x * d).toFixed(1)}px ${(-y * d).toFixed(1)}px`
    })
  })
  art.closest('.hero').addEventListener('pointerleave', () => layers.forEach((l) => (l.style.translate = '')))
}

/* ---------- contadores ---------- */
const fmt = new Intl.NumberFormat('pt-BR')
const countObs = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return
    countObs.unobserve(entry.target)
    const el = entry.target
    const end = +el.dataset.count
    const suffix = el.dataset.suffix || ''
    if (calm) { el.textContent = fmt.format(end) + suffix; return }
    const t0 = performance.now()
    const dur = 1400
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur)
      const eased = 1 - Math.pow(1 - p, 4)
      el.textContent = fmt.format(Math.round(end * eased)) + suffix
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
}, { threshold: 0.6 })
$$('[data-count]').forEach((el) => countObs.observe(el))

/* ---------- régua do crescimento ---------- */
const IMG = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=200&h=200&q=70`
const stages = [
  {
    age: '0 a 28 dias', title: 'Bem-vindo ao mundo', cm: 50, img: IMG('photo-1632052999485-d748103abf98'),
    visits: 'Primeira consulta entre 3 e 5 dias de vida, depois uma por mês.',
    vax: 'BCG e hepatite B, ainda na maternidade.',
    marks: ['Teste do pezinho, da orelhinha e do olhinho', 'Pega e ganho de peso na amamentação', 'Umbigo cicatrizando bem'],
  },
  {
    age: '1 a 12 meses', title: 'O ano das primeiras vezes', cm: 72, img: IMG('photo-1632052999447-e542d08d4f7d'),
    visits: 'Uma consulta por mês no primeiro semestre, depois a cada dois meses.',
    vax: 'Doses aos 2, 3, 4, 5 e 6 meses, mais a gripe a partir dos 6 meses.',
    marks: ['Sustentar a cabeça, rolar e sentar', 'Início da introdução alimentar aos 6 meses', 'Balbucios e primeiras sílabas'],
  },
  {
    age: '1 a 3 anos', title: 'Pequeno explorador', cm: 92, img: IMG('photo-1706307121034-81829ec35a0d'),
    visits: 'Consultas a cada três meses até os 2 anos, depois a cada seis.',
    vax: 'Reforços do primeiro ano e a dose de 15 meses.',
    marks: ['Primeiros passos e primeiras frases', 'Comer sozinho e largar a mamadeira', 'Sono, birras e limites'],
  },
  {
    age: '4 a 6 anos', title: 'Hora da escola', cm: 112, img: IMG('photo-1686721800388-1c3bfea98d41'),
    visits: 'Uma consulta por ano, com avaliação de visão e audição.',
    vax: 'Reforço dos 4 anos e as vacinas da campanha do ano.',
    marks: ['Fala clara e desenho com detalhes', 'Coordenação para correr, pular e pedalar', 'Adaptação escolar e amizades'],
  },
  {
    age: '7 a 11 anos', title: 'Crescendo a mil', cm: 138, img: IMG('photo-1593183230686-69876b0cb240'),
    visits: 'Uma consulta por ano, de preferência antes das aulas começarem.',
    vax: 'HPV a partir dos 9 anos e atualização da caderneta.',
    marks: ['Postura e uso da mochila', 'Tempo de tela e qualidade do sono', 'Lanche da escola e atividade física'],
  },
  {
    age: '12 a 18 anos', title: 'Quase gente grande', cm: 165, img: IMG('photo-1601299124348-6a43706a155d'),
    visits: 'Uma consulta por ano, com um momento a sós com o adolescente.',
    vax: 'Meningite ACWY, reforços de dT e o que faltar na caderneta.',
    marks: ['Puberdade e mudanças no corpo', 'Saúde mental, sono e telas', 'Acne, alimentação e esporte'],
  },
]
const MIN_CM = 40
const MAX_CM = 180
const scale = $('#rulerScale')
if (scale) {
  let html = ''
  for (let cm = MIN_CM; cm <= MAX_CM; cm += 5) {
    const at = (cm - MIN_CM) / (MAX_CM - MIN_CM)
    const size = cm % 20 === 0 ? 'big' : cm % 10 === 0 ? 'mid' : 'sm'
    html += `<span class="${size}" style="--at:${at}"></span>`
    if (cm % 20 === 0) html += `<b style="--at:${at}">${cm}</b>`
  }
  scale.innerHTML = html
}
const tabs = $$('#ages [role="tab"]')
const range = $('#ageRange')
const stageEl = $('#stage')
const kid = $('#rulerKid')
const kidImg = $('#kidImg')
const kidCm = $('#kidCm')
// pré-carrega as fotos das idades para a troca não piscar
stages.forEach((s) => { const i = new Image(); i.src = s.img })
let current = 0
let cmAnim
const placeKid = (cm) => {
  const pos = (cm - MIN_CM) / (MAX_CM - MIN_CM)
  kid.style.setProperty('--pos', pos)
  kid.classList.toggle('is-up', pos < 0.5)
}
const setStage = (n, focus = false) => {
  if (n === current && stageEl.dataset.ready) return
  const prevCm = stages[current].cm
  current = n
  stageEl.dataset.ready = '1'
  const s = stages[n]
  tabs.forEach((t, i) => { t.setAttribute('aria-selected', String(i === n)); t.tabIndex = i === n ? 0 : -1 })
  if (focus) tabs[n].focus()
  range.value = n
  placeKid(s.cm)
  kidImg.style.opacity = 0
  setTimeout(() => { kidImg.src = s.img; kidImg.style.opacity = 1 }, 220)
  // altura conta até o novo valor
  cancelAnimationFrame(cmAnim)
  const t0 = performance.now()
  const anim = (now) => {
    const p = Math.min(1, (now - t0) / 800)
    kidCm.textContent = Math.round(prevCm + (s.cm - prevCm) * (1 - Math.pow(1 - p, 3)))
    if (p < 1) cmAnim = requestAnimationFrame(anim)
  }
  cmAnim = requestAnimationFrame(anim)
  stageEl.classList.add('is-swap')
  setTimeout(() => {
    $('#stageAge').textContent = s.age
    $('#stageTitle').textContent = s.title
    $('#stageVisits').textContent = s.visits
    $('#stageVax').textContent = s.vax
    $('#stageMilestones').innerHTML = s.marks.map((m) => `<li>${m}</li>`).join('')
    stageEl.classList.remove('is-swap')
  }, calm ? 0 : 230)
}
tabs.forEach((t, i) => {
  t.addEventListener('click', () => setStage(i))
  t.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); setStage((current + 1) % tabs.length, true) }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); setStage((current - 1 + tabs.length) % tabs.length, true) }
  })
})
range?.addEventListener('input', () => setStage(+range.value))
if (kid) {
  placeKid(stages[0].cm)
  stageEl.dataset.ready = '1'
}

/* ---------- equipe: cartões que viram ---------- */
$$('.doc').forEach((card) => {
  card.addEventListener('click', () => card.setAttribute('aria-pressed', String(card.getAttribute('aria-pressed') !== 'true')))
})

/* ---------- dúvidas: uma aberta por vez ---------- */
const faqs = $$('.faq details')
faqs.forEach((d) => d.addEventListener('toggle', () => { if (d.open) faqs.forEach((o) => o !== d && (o.open = false)) }))

/* ---------- formulário de agendamento (demonstração) ---------- */
const form = $('#bookForm')
const msg = $('#formMsg')
const fieldNames = { parent: 'seu nome', kid: 'o nome da criança', age: 'a idade da criança' }
const tevi = $('#formMascot')
// deixa a pose apaixonada pronta antes do envio
new Image().src = 'img/bemtevi-apaixonado.webp'

// o Tevi leva o pedido voando e volta apaixonado
const teviDelivers = () => {
  if (!tevi) return
  const celebrate = () => {
    tevi.src = 'img/bemtevi-apaixonado.webp'
    tevi.classList.remove('is-away', 'is-love')
    void tevi.offsetWidth
    tevi.classList.add('is-love')
  }
  if (calm) return celebrate()
  const r = tevi.getBoundingClientRect()
  const flyer = document.createElement('div')
  flyer.className = 'flyer'
  flyer.style.left = `${r.left + r.width / 2 - 60}px`
  flyer.style.top = `${r.top - 10}px`
  document.body.append(flyer)
  tevi.classList.add('is-away')
  const dx = innerWidth - r.left + 80
  const dy = -(r.top + 220)
  flyer.animate(
    [
      { transform: 'translate(0, 0) scale(1)' },
      { transform: `translate(${dx * 0.35}px, ${dy * 0.15 - 60}px) scale(1.15)`, offset: 0.35 },
      { transform: `translate(${dx}px, ${dy}px) scale(.8)` },
    ],
    { duration: 1500, easing: 'cubic-bezier(.45, .05, .5, 1)', fill: 'forwards' },
  ).onfinish = () => {
    flyer.remove()
    setTimeout(celebrate, 350)
  }
}

form?.addEventListener('submit', (e) => {
  e.preventDefault()
  const missing = $$('[required]', form).filter((f) => {
    const bad = !f.value.trim()
    f.classList.toggle('is-bad', bad)
    if (bad) f.setAttribute('aria-invalid', 'true')
    else f.removeAttribute('aria-invalid')
    return bad
  })
  if (missing.length) {
    const names = missing.map((f) => fieldNames[f.name])
    const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} e ${names.at(-1)}` : names[0]
    msg.className = 'form__msg is-err'
    msg.textContent = `Falta preencher ${list}.`
    missing[0].focus()
    return
  }
  const kidName = form.kid.value.trim().split(' ')[0]
  msg.className = 'form__msg is-ok'
  msg.textContent = `O Tevi levou o pedido! A recepção chama no WhatsApp para marcar a consulta de ${kidName}. (Site de exemplo: nada foi enviado.)`
  form.reset()
  teviDelivers()
})
form?.addEventListener('input', (e) => {
  if (e.target.classList.contains('is-bad') && e.target.value.trim()) {
    e.target.classList.toggle('is-bad', false)
    e.target.removeAttribute('aria-invalid')
  }
})

/* ---------- laços parados fora da tela ---------- */
const offObs = new IntersectionObserver((entries) => entries.forEach((en) => en.target.classList.toggle('is-off', !en.isIntersecting)))
$$('.hero, .words, .faq, .book, .stats').forEach((s) => offObs.observe(s))

/* ---------- Tevi do hero: cada toque, uma dica ---------- */
const teviBtn = $('#tevi')
const teviSays = $('#teviSays')
const tips = [
  'Água é o melhor suco do mundo!',
  'Já lavou as mãos hoje?',
  'Dormir cedo ajuda a crescer!',
  'Vacina em dia, coração tranquilo.',
  'Fruta colorida deixa o prato feliz!',
  'Brincar lá fora também é remédio.',
  'Protetor solar antes de sair!',
]
let tipIndex = -1
teviBtn?.addEventListener('click', () => {
  tipIndex = (tipIndex + 1) % tips.length
  teviSays.textContent = tips[tipIndex]
  teviSays.classList.toggle('is-new', false)
  teviBtn.classList.toggle('is-jump', false)
  void teviBtn.offsetWidth
  teviSays.classList.add('is-new')
  teviBtn.classList.add('is-jump')
})

/* ---------- depoimentos: "digitando…" e depois o texto ---------- */
const msgs = $$('.msg')
const sayObs = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return
    sayObs.unobserve(en.target)
    const i = msgs.indexOf(en.target)
    setTimeout(() => en.target.classList.add('is-said'), calm ? 0 : 900 + i * 650)
  })
}, { threshold: 0.5 })
msgs.forEach((m) => sayObs.observe(m))

// partículas que saem de um ponto (corações do curtir, confete do balão)
const burst = (x, y, count, make) => {
  for (let i = 0; i < count; i++) {
    const el = make(i)
    el.style.left = `${x}px`
    el.style.top = `${y}px`
    document.body.append(el)
    const a = (Math.PI * 2 * i) / count + Math.random() * 0.5
    const d = 46 + Math.random() * 40
    el.animate(
      [
        { transform: 'translate(-50%, -50%) scale(.4)', opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d - 20}px)) scale(1) rotate(${(Math.random() - 0.5) * 120}deg)`, opacity: 0 },
      ],
      { duration: 700 + Math.random() * 300, easing: 'cubic-bezier(.16, 1, .3, 1)' },
    ).onfinish = () => el.remove()
  }
}
const heartEl = () => {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  s.setAttribute('viewBox', '0 0 48 48')
  s.classList.add('love-burst')
  s.innerHTML = '<use href="#i-heart"/>'
  return s
}
// curtir: o contador sobe e corações estouram do botão
$$('.msg__love').forEach((b) => {
  b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true'
    b.setAttribute('aria-pressed', String(on))
    const n = $('span', b)
    n.textContent = +n.textContent + (on ? 1 : -1)
    if (on && !calm) {
      const r = b.getBoundingClientRect()
      burst(r.left + 20, r.top + r.height / 2, 7, heartEl)
    }
  })
})

/* ---------- régua: arraste a criança até a idade ---------- */
const ruler = $('#ruler')
if (ruler && kid) {
  const lying = () => matchMedia('(max-width: 600px)').matches
  const stageFor = (e) => {
    const r = ruler.getBoundingClientRect()
    const p = lying()
      ? (e.clientX - r.left - 24) / (r.width - 48)
      : 1 - (e.clientY - r.top - 18) / (r.height - 36)
    const cm = MIN_CM + Math.max(0, Math.min(1, p)) * (MAX_CM - MIN_CM)
    let best = 0
    stages.forEach((s, i) => { if (Math.abs(s.cm - cm) < Math.abs(stages[best].cm - cm)) best = i })
    return best
  }
  let dragging = false
  const stop = () => { dragging = false; ruler.classList.toggle('is-dragging', false) }
  ruler.addEventListener('pointerdown', (e) => {
    dragging = true
    ruler.setPointerCapture(e.pointerId)
    ruler.classList.add('is-dragging', 'was-dragged')
    setStage(stageFor(e))
  })
  ruler.addEventListener('pointermove', (e) => { if (dragging) setStage(stageFor(e)) })
  ruler.addEventListener('pointerup', stop)
  ruler.addEventListener('pointercancel', stop)
  ruler.addEventListener('lostpointercapture', stop)
}

/* ---------- cards de cuidados inclinam seguindo o cursor ---------- */
if (finePointer && !calm) {
  $$('.card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      card.classList.add('is-tilting')
      card.style.setProperty('--ry', `${(x * 14).toFixed(2)}deg`)
      card.style.setProperty('--rx', `${(-y * 14).toFixed(2)}deg`)
    })
    card.addEventListener('pointerleave', () => {
      card.classList.toggle('is-tilting', false)
      card.style.setProperty('--ry', '0deg')
      card.style.setProperty('--rx', '0deg')
    })
  })
}

/* ---------- balões estouráveis ---------- */
const bitColors = ['#FF6B3D', '#FFC23D', '#8FCBF5', '#FF8FB3', '#17756D', '#6650D4']
$$('.pb').forEach((b) => {
  b.addEventListener('click', () => {
    const r = b.getBoundingClientRect()
    b.classList.toggle('is-back', false)
    b.classList.add('is-popped')
    if (!calm) {
      burst(r.left + r.width / 2, r.top + r.height / 2, 12, (i) => {
        const d = document.createElement('i')
        d.className = 'pop-bit'
        d.style.background = bitColors[i % bitColors.length]
        return d
      })
      const w = document.createElement('span')
      w.className = 'pop-word'
      w.textContent = 'POP!'
      w.style.left = `${r.left + r.width / 2}px`
      w.style.top = `${r.top + r.height / 2}px`
      document.body.append(w)
      w.animate([{ scale: 0.4, opacity: 1 }, { scale: 1.1, opacity: 1, offset: 0.4 }, { scale: 1, opacity: 0 }], { duration: 800, easing: 'ease-out' }).onfinish = () => w.remove()
    }
    // um balão novo sobe no lugar
    setTimeout(() => { b.classList.toggle('is-popped', false); b.classList.add('is-back') }, 2600)
  })
})

/* ---------- galeria: visualizador de fotos (setas, teclado e deslizar) ---------- */
const viewer = $('#viewer')
const shotsBtns = $$('.polaroid__btn')
if (viewer && shotsBtns.length) {
  const img = $('#viewerImg')
  const cap = $('#viewerCap')
  const count = $('#viewerCount')
  let at = 0
  let opener = null
  const show = (i) => {
    at = (i + shotsBtns.length) % shotsBtns.length
    const b = shotsBtns[at]
    img.classList.add('is-loading')
    img.onload = () => img.classList.toggle('is-loading', false)
    img.src = b.dataset.full
    img.alt = $('img', b).alt
    cap.textContent = b.dataset.cap
    count.textContent = `${at + 1} de ${shotsBtns.length}`
    // a próxima já vem carregada
    new Image().src = shotsBtns[(at + 1) % shotsBtns.length].dataset.full
  }
  shotsBtns.forEach((b, i) => b.addEventListener('click', () => {
    opener = b
    show(i)
    viewer.showModal()
  }))
  $('#viewerPrev').addEventListener('click', () => show(at - 1))
  $('#viewerNext').addEventListener('click', () => show(at + 1))
  $('#viewerClose').addEventListener('click', () => viewer.close())
  viewer.addEventListener('close', () => opener?.focus())
  // clique fora da foto fecha
  viewer.addEventListener('click', (e) => { if (e.target === viewer) viewer.close() })
  viewer.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') show(at + 1)
    if (e.key === 'ArrowLeft') show(at - 1)
  })
  let x0 = null
  viewer.addEventListener('pointerdown', (e) => { x0 = e.clientX })
  viewer.addEventListener('pointerup', (e) => {
    if (x0 === null) return
    const dx = e.clientX - x0
    x0 = null
    if (Math.abs(dx) > 50) show(at + (dx < 0 ? 1 : -1))
  })
}

/* ---------- agenda: próximos / realizados, filtros e reserva de vaga ---------- */
const eventsList = $('#eventsList')
if (eventsList) {
  const items = $$('.event', eventsList)
  const empty = $('#eventsEmpty')
  let when = 'next'
  let tag = 'all'
  const apply = () => {
    let n = 0
    items.forEach((ev) => {
      const ok = ev.dataset.when === when && (tag === 'all' || ev.dataset.tags.split(' ').includes(tag))
      ev.classList.toggle('is-hidden', !ok)
      ev.classList.toggle('is-enter', false)
      if (ok) {
        void ev.offsetWidth
        ev.style.setProperty('--i', n++)
        ev.classList.add('is-enter')
      }
    })
    empty.hidden = n > 0
  }
  const press = (group, btn) => $$('button', group).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)))
  $$('.seg__btn').forEach((b) => b.addEventListener('click', () => { when = b.dataset.when; press(b.parentElement, b); apply() }))
  $$('.filter').forEach((b) => b.addEventListener('click', () => { tag = b.dataset.tag; press(b.parentElement, b); apply() }))
  apply()

  $$('.event__btn', eventsList).forEach((b) => {
    const spotsEl = b.nextElementSibling
    const total = +b.dataset.spots
    const paint = (left) => {
      spotsEl.textContent = left === 1 ? 'última vaga!' : `${left} vagas`
      spotsEl.classList.toggle('is-low', left <= 6)
    }
    paint(total)
    b.addEventListener('click', () => {
      const on = b.getAttribute('aria-pressed') !== 'true'
      b.setAttribute('aria-pressed', String(on))
      b.textContent = on ? 'Vaga reservada' : 'Quero participar'
      paint(on ? total - 1 : total)
      if (on && !calm) {
        const r = b.getBoundingClientRect()
        burst(r.left + r.width / 2, r.top + r.height / 2, 10, (i) => {
          const d = document.createElement('i')
          d.className = 'pop-bit'
          d.style.background = bitColors[i % bitColors.length]
          return d
        })
      }
    })
  })
}
