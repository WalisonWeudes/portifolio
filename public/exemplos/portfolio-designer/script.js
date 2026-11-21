// Davi Ferraz — portfólio de designer (site de exemplo, pessoa e projetos fictícios)
const $ = (s, el = document) => el.querySelector(s)
const $$ = (s, el = document) => [...el.querySelectorAll(s)]
const root = document.documentElement
const calm = root.classList.contains('calm')
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches
const U = (id, w, h) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=72`

/* ---------- toast ---------- */
const toastEl = $('#toast')
let toastTimer
const toast = (text) => {
  toastEl.textContent = text
  toastEl.classList.add('is-on')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 3200)
}

/* ---------- cabeçalho e menu ---------- */
const header = $('#header')
const nav = $('#nav')
const burger = $('#burger')
const onScroll = () => header.classList.toggle('is-stuck', scrollY > 10)
addEventListener('scroll', onScroll, { passive: true })
onScroll()
const setMenu = (open) => {
  burger.setAttribute('aria-expanded', String(open))
  burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu')
  nav.classList.toggle('is-open', open)
}
burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'))
$$('a', nav).forEach((a) => a.addEventListener('click', () => setMenu(false)))
addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false) })

// link do menu acompanha a seção visível
const navLinks = $$('a', nav)
const navObs = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return
    navLinks.forEach((a) => a.classList.toggle('is-here', a.hash === `#${en.target.id}`))
  })
}, { rootMargin: '-45% 0px -50% 0px' })
$$('main section[id]').forEach((s) => navObs.observe(s))

/* ---------- relógio de Teresina ---------- */
const clocks = [$('#clock'), $('#clock2')]
const fmt = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Fortaleza' })
const tick = () => { const t = fmt.format(new Date()); clocks.forEach((c) => c && (c.textContent = t)) }
tick()
setInterval(tick, 15000)

/* ---------- hero: letras separadas e entrada ---------- */
let d = 0
$$('.hero__title .split').forEach((w) => {
  w.innerHTML = [...w.textContent].map((c) => `<span class="ch" style="--d:${d++}">${c}</span>`).join('')
  w.setAttribute('aria-hidden', 'true')
})
$('#hero-title').setAttribute('aria-label', 'Design que faz sentido')
const hero = $('.hero')
const ready = () => requestAnimationFrame(() => hero.classList.add('is-ready'))
if (calm) hero.classList.add('is-ready')
else (document.fonts ? document.fonts.ready : Promise.resolve()).then(ready)
setTimeout(ready, 1500)

// a foto acompanha o mouse de leve
const photo = $('#heroPhoto img')
if (finePointer && !calm) {
  hero.addEventListener('pointermove', (e) => {
    const x = e.clientX / innerWidth - 0.5
    const y = e.clientY / innerHeight - 0.5
    photo.style.setProperty('--px', `${(x * -16).toFixed(1)}px`)
    photo.style.setProperty('--py', `${(y * -10).toFixed(1)}px`)
  })
}

/* ---------- faixa que acelera com a rolagem ---------- */
const strip = $('#strip')
if (strip) {
  strip.innerHTML += strip.innerHTML
  let x = 0
  let lastY = scrollY
  let boost = 0
  let visible = true
  new IntersectionObserver(([en]) => { visible = en.isIntersecting }).observe(strip)
  const run = () => {
    const dy = scrollY - lastY
    lastY = scrollY
    boost += (Math.min(40, Math.abs(dy)) - boost) * 0.1
    if (visible && !calm) {
      x -= 0.6 + boost * 0.5
      const half = strip.scrollWidth / 2
      if (-x >= half) x += half
      strip.style.transform = `translate3d(${x}px, 0, 0)`
    }
    requestAnimationFrame(run)
  }
  requestAnimationFrame(run)
}


/* ---------- revelar e contar ---------- */
const countUp = (el) => {
  const to = +el.dataset.to
  if (calm) { el.textContent = to; return }
  const t0 = performance.now()
  const step = (t) => {
    const p = Math.min(1, (t - t0) / 1400)
    el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)))
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return
    en.target.classList.add('is-in')
    $$('.count', en.target).forEach(countUp)
    revealObs.unobserve(en.target)
  })
}, { threshold: 0.2 })
$$('.reveal').forEach((el) => revealObs.observe(el))

/* ---------- trabalhos ---------- */
const works = [
  {
    name: 'Pulso', cat: 'produto', label: 'App de finanças · Produto digital', year: 2026, tone: 'ink',
    img: 'photo-1782328525381-45db8b20bb59', alt: 'Celular com o app Pulso sobre um pedestal, fundo azul',
    lead: 'Um app de controle financeiro para quem nunca abriu uma planilha na vida.',
    problem: 'Metade dos usuários abandonava o cadastro e o suporte recebia 900 ligações por mês com dúvidas sobre o saldo.',
    did: 'Entrevistei 22 clientes, cortei o cadastro de 7 para 3 telas e criei um painel que mostra só o que sobra até o fim do mês.',
    results: [['-52%', 'ligações para o suporte'], ['3x', 'mais cadastros concluídos'], ['4,8', 'nota na loja de apps']],
  },
  {
    name: 'Fênix Café', cat: 'marca', label: 'Marca e embalagem', year: 2025, tone: 'accent',
    img: 'photo-1661313647610-de652aca54c5', alt: 'Pacote de café kraft da Fênix Café sobre uma pedra, fundo marrom',
    lead: 'Café torrado no Piauí com cara de café especial na prateleira do supermercado.',
    problem: 'A marca antiga se perdia entre os concorrentes e o preço parecia alto para o que a embalagem mostrava.',
    did: 'Nova marca com a fênix desenhada em uma linha só, pacote kraft com selo laranja e um expositor de balcão para as cafeterias.',
    results: [['11 dias', 'para esgotar o 1º lote'], ['+38%', 'de preço médio'], ['2', 'prêmios de embalagem']],
  },
  {
    name: 'One Arquitetura', cat: 'marca', label: 'Identidade visual', year: 2025, tone: 'paper',
    img: 'photo-1763705857736-2b4f16a33758', alt: 'Cartões, papel timbrado e um quadrado laranja com a marca ONE sobre a mesa',
    lead: 'Identidade para um escritório que desenha casas de uma janela só.',
    problem: 'O escritório crescia por indicação, mas a apresentação para novos clientes parecia improvisada.',
    did: 'Logo modular inspirado em plantas baixas, papelaria completa e um modelo de apresentação de projeto.',
    results: [['+45%', 'propostas aprovadas'], ['18', 'peças de papelaria'], ['1', 'manual de marca']],
  },
  {
    name: 'Lume Studio', cat: 'produto', label: 'Site e design system', year: 2024, tone: 'accent',
    img: 'photo-1507238691740-187a5b1d37b8', alt: 'Notebook aberto numa mesa de madeira mostrando o site do Lume Studio',
    lead: 'Site novo e uma biblioteca de componentes que o time mantém sozinho.',
    problem: 'Cada página nova levava duas semanas e nenhum botão era igual ao outro.',
    did: 'Design system com 64 componentes no Figma, documentação simples e o site refeito em cima dele.',
    results: [['2 dias', 'para lançar uma página'], ['64', 'componentes'], ['+27%', 'contatos pelo site']],
  },
  {
    name: 'Revista Quintal', cat: 'editorial', label: 'Projeto editorial', year: 2024, tone: 'paper',
    img: 'photo-1588775161074-a5a92eaa9a37', alt: 'Revista aberta numa página com a foto de uma mulher sorrindo',
    lead: 'Uma revista de comida e saúde que dá vontade de guardar na estante.',
    problem: 'A revista trocava de cara a cada edição e os anunciantes não sabiam o que estavam comprando.',
    did: 'Grade editorial, família tipográfica e regras de fotografia que qualquer diagramador consegue seguir.',
    results: [['6', 'edições no novo projeto'], ['+60%', 'assinaturas'], ['1', 'menção honrosa']],
  },
  {
    name: 'Solar Cosméticos', cat: 'marca', label: 'Embalagem e redes sociais', year: 2023, tone: 'ink',
    img: 'photo-1778665654058-dcd700142738', alt: 'Caixa branca e bisnaga de creme da Solar sobre fundo rosa',
    lead: 'Caixas que viram post sozinhas: a cliente abre e já quer fotografar.',
    problem: 'A loja vendia bem no Instagram, mas a entrega chegava num saco plástico sem nenhuma marca.',
    did: 'Caixa branca com relevo, cartão escrito à mão e um guia de fotos para as redes da marca.',
    results: [['+3 mil', 'fotos marcadas por clientes'], ['+22%', 'recompra'], ['9', 'produtos na linha']],
  },
]
const list = $('#works')
list.innerHTML = works.map((w, i) => `
  <li class="wcard wcard--${w.tone}" data-cat="${w.cat}">
    <button type="button" class="wcard__btn" data-i="${i}" aria-label="${w.name}, ${w.label}. Abrir estudo de caso">
      <span class="wcard__no">${String(i + 1).padStart(2, '0')}</span>
      <span class="wcard__title">${w.name}</span>
      <span class="wcard__cat">${w.label} · ${w.year}</span>
      <span class="wcard__img"><img src="${U(w.img, 720, 640)}" alt="" width="720" height="640" loading="lazy" /><span class="wcard__plus" aria-hidden="true">+</span></span>
    </button>
  </li>`).join('')
// observa a grade (os cards começam recortados e o observador não os enxergaria)
const cardsObs = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return
    cardsObs.unobserve(en.target)
    $$('.wcard', en.target).forEach((c, i) => setTimeout(() => c.classList.add('is-in'), calm ? 0 : i * 110))
  })
}, { threshold: 0.05 })
cardsObs.observe(list)

// filtros: os outros ficam apagados em vez de sumir, para a grade não pular
$$('.filter').forEach((b) => b.addEventListener('click', () => {
  $$('.filter').forEach((f) => f.setAttribute('aria-pressed', String(f === b)))
  const cat = b.dataset.cat
  $$('.wcard').forEach((c) => {
    const dim = cat !== 'all' && c.dataset.cat !== cat
    c.classList.toggle('is-dim', dim)
    $('button', c).tabIndex = dim ? -1 : 0
  })
}))

// estudo de caso
const dlg = $('#case')
let current = 0
let opener = null
const openCase = (i) => {
  current = i
  const w = works[i]
  $('#caseImg').src = U(w.img, 1400, 780)
  $('#caseImg').alt = w.alt
  $('#caseMeta').textContent = `${String(i + 1).padStart(2, '0')} · ${w.label} · ${w.year}`
  $('#caseTitle').textContent = w.name
  $('#caseLead').textContent = w.lead
  $('#caseProblem').textContent = w.problem
  $('#caseDid').textContent = w.did
  $('#caseResults').innerHTML = w.results.map(([n, t]) => `<div><dt>${t}</dt><dd>${n}</dd></div>`).join('')
  $('#caseNext').firstChild.textContent = `Próximo: ${works[(i + 1) % works.length].name}`
  dlg.scrollTop = 0
  if (!dlg.open) dlg.showModal()
}
list.addEventListener('click', (e) => {
  const b = e.target.closest('.wcard__btn')
  if (!b) return
  opener = b
  openCase(+b.dataset.i)
})
$('#caseClose').addEventListener('click', () => dlg.close())
$('#caseNext').addEventListener('click', () => openCase((current + 1) % works.length))
dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close() })
dlg.addEventListener('close', () => opener?.focus())

// cursor "Ver caso" em cima dos cards
const cursor = $('.cursor')
if (finePointer && !calm) {
  addEventListener('pointermove', (e) => {
    cursor.style.setProperty('--cx', `${e.clientX}px`)
    cursor.style.setProperty('--cy', `${e.clientY}px`)
    const on = !!e.target.closest?.('.wcard:not(.is-dim) .wcard__btn')
    cursor.classList.toggle('is-on', on)
  }, { passive: true })
  document.addEventListener('pointerleave', () => cursor.classList.remove('is-on'))
}

/* ---------- pílulas com física (matter.js, carregado só perto da seção) ---------- */
const box = $('#pillsBox')
const startPhysics = () => {
  const { Engine, Bodies, Composite, Runner, Mouse, MouseConstraint, Body, Events } = window.Matter
  const pills = $$('.pill', box)
  const sizes = pills.map((p) => ({ w: p.offsetWidth, h: p.offsetHeight }))
  box.classList.add('is-live')
  const engine = Engine.create({ gravity: { y: 1.1 } })
  let W = box.clientWidth
  let H = box.clientHeight
  const wall = { isStatic: true, render: { visible: false } }
  const walls = [
    Bodies.rectangle(W / 2, H + 50, W * 3, 100, wall),
    Bodies.rectangle(-50, H / 2 - 400, 100, H * 3, wall),
    Bodies.rectangle(W + 50, H / 2 - 400, 100, H * 3, wall),
  ]
  const bodies = pills.map((p, i) => {
    const { w, h } = sizes[i]
    const b = Bodies.rectangle(
      w / 2 + Math.random() * Math.max(1, W - w),
      -h - i * (h * 0.9) - Math.random() * 60,
      w, h,
      { chamfer: { radius: h / 2 - 1 }, restitution: 0.35, friction: 0.25, density: 0.002 },
    )
    Body.setAngle(b, (Math.random() - 0.5) * 0.8)
    return b
  })
  Composite.add(engine.world, [...walls, ...bodies])

  // arrastar com o mouse (no celular, tocar dá um pulinho na pílula)
  if (finePointer) {
    const mouse = Mouse.create(box)
    mouse.element.removeEventListener('wheel', mouse.mousewheel)
    mouse.element.removeEventListener('DOMMouseScroll', mouse.mousewheel)
    const mc = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, render: { visible: false } } })
    Composite.add(engine.world, mc)
    Events.on(mc, 'startdrag', () => box.classList.add('is-grab'))
    Events.on(mc, 'enddrag', () => box.classList.remove('is-grab'))
  } else {
    box.addEventListener('pointerdown', (e) => {
      const i = pills.indexOf(e.target.closest('.pill'))
      if (i < 0) return
      Body.setVelocity(bodies[i], { x: (Math.random() - 0.5) * 10, y: -14 })
      Body.setAngularVelocity(bodies[i], (Math.random() - 0.5) * 0.3)
    })
  }

  const runner = Runner.create()
  Runner.run(runner, engine)
  const draw = () => {
    bodies.forEach((b, i) => {
      const { w, h } = sizes[i]
      pills[i].style.transform = `translate(${b.position.x - w / 2}px, ${b.position.y - h / 2}px) rotate(${b.angle}rad)`
    })
    requestAnimationFrame(draw)
  }
  draw()
  // para quando sai da tela
  new IntersectionObserver(([en]) => { runner.enabled = en.isIntersecting }).observe(box)
  // ajusta as paredes quando a largura muda
  addEventListener('resize', () => {
    const nw = box.clientWidth
    const nh = box.clientHeight
    if (nw === W && nh === H) return
    W = nw; H = nh
    Body.setPosition(walls[0], { x: W / 2, y: H + 50 })
    Body.setPosition(walls[2], { x: W + 50, y: H / 2 - 400 })
    bodies.forEach((b) => { if (b.position.x > W) Body.setPosition(b, { x: W - 60, y: -80 }) })
  })
}
if (box && !calm) {
  const pillObs = new IntersectionObserver(([en]) => {
    if (!en.isIntersecting) return
    pillObs.disconnect()
    const s = document.createElement('script')
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js'
    s.onload = () => (document.fonts ? document.fonts.ready : Promise.resolve()).then(startPhysics)
    s.onerror = () => box.classList.add('is-static')
    document.head.append(s)
  }, { rootMargin: '0px 0px -35% 0px' })
  pillObs.observe(box)
}

/* ---------- depoimentos ---------- */
const quotes = $$('.quote')
let q = 0
const showQuote = (i) => {
  q = (i + quotes.length) % quotes.length
  quotes.forEach((el, k) => el.classList.toggle('is-on', k === q))
  $('#qCount').textContent = `${String(q + 1).padStart(2, '0')} / ${String(quotes.length).padStart(2, '0')}`
}
$('#qPrev').addEventListener('click', () => { showQuote(q - 1); restart() })
$('#qNext').addEventListener('click', () => { showQuote(q + 1); restart() })
let qTimer
const restart = () => {
  clearInterval(qTimer)
  if (!calm) qTimer = setInterval(() => showQuote(q + 1), 7000)
}
restart()
$('#quotes').addEventListener('pointerenter', () => clearInterval(qTimer))
$('#quotes').addEventListener('pointerleave', restart)

/* ---------- briefing ---------- */
const brief = $('#brief')
const budget = $('#budget')
const budgetOut = $('#budgetOut')
const paintBudget = () => {
  const v = +budget.value
  budgetOut.textContent = v >= 60 ? 'R$ 60 mil ou mais' : `R$ ${v} mil`
  budget.style.setProperty('--fill', `${((v - budget.min) / (budget.max - budget.min)) * 100}%`)
}
budget.addEventListener('input', paintBudget)
paintBudget()
brief.addEventListener('submit', (e) => {
  e.preventDefault()
  const msg = $('#briefMsg')
  const email = brief.email
  const kinds = $$('input[name="tipo"]:checked', brief).map((c) => c.value.toLowerCase())
  const okMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())
  email.classList.toggle('is-bad', !okMail)
  if (!okMail) email.setAttribute('aria-invalid', 'true')
  else email.removeAttribute('aria-invalid')
  if (!kinds.length || !okMail) {
    msg.className = 'brief__msg is-err'
    msg.textContent = !kinds.length && !okMail
      ? 'Escolha pelo menos um tipo de projeto e escreva um e-mail válido.'
      : !kinds.length ? 'Escolha pelo menos um tipo de projeto.' : 'Escreva um e-mail válido, como voce@empresa.com.'
    if (!okMail) email.focus()
    return
  }
  const what = kinds.length > 1 ? `${kinds.slice(0, -1).join(', ')} e ${kinds.at(-1)}` : kinds[0]
  msg.className = 'brief__msg'
  msg.textContent = `Briefing de ${what} recebido. Respondo em até um dia útil. (Site de exemplo: nada foi enviado.)`
  toast('Briefing recebido. Obrigado!')
  brief.reset()
  paintBudget()
})
brief.email.addEventListener('input', () => {
  brief.email.classList.remove('is-bad')
  brief.email.removeAttribute('aria-invalid')
})

/* ---------- copiar e-mail ---------- */
const copyBtn = $('#copy')
copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(copyBtn.dataset.mail)
    toast('E-mail copiado. É só colar!')
  } catch {
    toast(copyBtn.dataset.mail)
  }
})

/* ---------- trocar a cor (com um círculo que se abre do botão) ---------- */
const colors = ['vermelho', 'cobalto', 'vinho']
const names = { vermelho: 'vermelho', cobalto: 'azul cobalto', vinho: 'vinho' }
const modeBtn = $('#mode')
const applyColor = (c) => {
  if (c === 'vermelho') delete root.dataset.cor
  else root.dataset.cor = c
  try { localStorage.setItem('df-cor', c) } catch {}
}
modeBtn.addEventListener('click', () => {
  const now = root.dataset.cor || 'vermelho'
  const next = colors[(colors.indexOf(now) + 1) % colors.length]
  const r = modeBtn.getBoundingClientRect()
  root.style.setProperty('--vx', `${r.left + r.width / 2}px`)
  root.style.setProperty('--vy', `${r.top + r.height / 2}px`)
  if (document.startViewTransition && !calm) document.startViewTransition(() => applyColor(next))
  else applyColor(next)
  toast(`Cor do site: ${names[next]}`)
})

/* ---------- laços parados fora da tela ---------- */
const offObs = new IntersectionObserver((entries) => entries.forEach((en) => en.target.classList.toggle('is-off', !en.isIntersecting)))
$$('.hero, .clients__track').forEach((s) => offObs.observe(s))
