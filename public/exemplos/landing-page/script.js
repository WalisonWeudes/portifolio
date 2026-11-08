// Raia Energia Solar — landing page de exemplo (empresa fictícia)
// Efeitos inspirados no React Bits (RotatingText, CountUp, SpotlightCard, GlareHover, Magnet),
// reescritos em JS puro para uma página estática.
document.documentElement.classList.add('js')

const $ = (s, el = document) => el.querySelector(s)
const $$ = (s, el = document) => [...el.querySelectorAll(s)]
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches
const brl = (n) => 'R$ ' + Math.round(n).toLocaleString('pt-BR') // espaço que não quebra linha
const num = (n, d = 0) => n.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d })

/* ---------- cabeçalho e menu ---------- */
const header = $('.header')
const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 40)
addEventListener('scroll', onScroll, { passive: true })
onScroll()

const toggle = $('.menu-toggle')
const menu = $('#menu')
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true'
  toggle.setAttribute('aria-expanded', String(open))
  toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu')
  menu.classList.toggle('is-open', open)
})
$$('a', menu).forEach((a) =>
  a.addEventListener('click', () => {
    toggle.setAttribute('aria-expanded', 'false')
    toggle.setAttribute('aria-label', 'Abrir menu')
    menu.classList.remove('is-open')
  }),
)

// link do menu da seção visível
const navLinks = $$('a', menu)
const sectionObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return
      navLinks.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === '#' + e.target.id))
    })
  },
  { rootMargin: '-45% 0px -50% 0px' },
)
// observa todas as seções: nas que não têm link no menu, nenhum item fica marcado
$$('main > section').forEach((s) => sectionObs.observe(s))

/* ---------- palavra que gira (RotatingText) ---------- */
const word = $('.rotator__word')
const words = word.dataset.words.split('|')
let wordIndex = 0
let rotating = !reduce

function setWord(next) {
  if (word.textContent === next) return
  if (reduce) {
    word.textContent = next
    return
  }
  word.classList.add('is-out')
  setTimeout(() => {
    word.textContent = next
    word.classList.remove('is-out')
    word.classList.add('is-in')
    word.getBoundingClientRect()
    word.classList.remove('is-in')
  }, 380)
}

// gira uma volta (casa → loja → fazenda → casa) e para em "casa", a opção marcada no simulador
const rotateTimer = setInterval(() => {
  if (!rotating || document.hidden) return
  wordIndex = (wordIndex + 1) % words.length
  setWord(words[wordIndex])
  if (wordIndex === 0) clearInterval(rotateTimer)
}, 2200)

/* ---------- dígitos de relógio de luz ---------- */
function meterRender(el, text) {
  const prev = el.dataset.text || ''
  el.dataset.text = text
  el.setAttribute('aria-label', text)
  const sameShape = prev.length === text.length && [...prev].every((c, i) => /\d/.test(c) === /\d/.test(text[i]))
  if (!sameShape) {
    el.innerHTML = [...text]
      .map((c, i) => {
        if (i < 3 && text.startsWith('R$ ')) return i === 0 ? '<span class="meter__cur" aria-hidden="true">R$</span>' : ''
        if (!/\d/.test(c)) return `<span class="meter__s" aria-hidden="true">${c}</span>`
        const col = Array.from({ length: 10 }, (_, n) => `<span>${n}</span>`).join('')
        return `<span class="meter__d" aria-hidden="true"><span class="meter__col" data-d="0">${col}</span></span>`
      })
      .join('')
  }
  const digits = [...text].filter((c) => /\d/.test(c))
  const cols = $$('.meter__col', el)
  requestAnimationFrame(() => {
    cols.forEach((col, i) => {
      col.style.transform = `translateY(${-Number(digits[i]) * 10}%)`
    })
  })
}

/* ---------- linha do tempo de 25 anos ---------- */
// Barras por ano: laranja = conta sem solar (tarifa sobe 7% ao ano);
// limão = com a Raia (parcela fixa nos 6 primeiros anos + taxa mínima, que também sobe).
const ANOS = 25
const REAJUSTE = 1.07
const FIM_PARCELA = 6 // 72 parcelas
const ANO_BASE = new Date().getFullYear()
const NS = 'http://www.w3.org/2000/svg'
const yrSvg = $('#yr-svg')
const yrPlot = $('#yr-plot')
const yrRange = $('#yr-range')
const yrMarks = $$('.years__mark')
const yrStory = $('.years__story')
let yrData = []
let yrCurrent = 1
let yrPhase = ''

// monta o gráfico uma vez: 25 pares de barras, linha guia e marca do fim da parcela
const GW = 1000 / ANOS
const yrBars = []
const endLine = document.createElementNS(NS, 'line')
endLine.setAttribute('class', 'yr-end')
endLine.setAttribute('x1', FIM_PARCELA * GW)
endLine.setAttribute('x2', FIM_PARCELA * GW)
endLine.setAttribute('y1', 28)
endLine.setAttribute('y2', 400)
yrSvg.appendChild(endLine)
$('#yr-tag-end').style.left = (FIM_PARCELA / ANOS) * 100 + '%'
for (let i = 0; i < ANOS; i++) {
  const pair = ['sem', 'com'].map((k, j) => {
    const r = document.createElementNS(NS, 'rect')
    r.setAttribute('class', `yb yb--${k}`)
    r.setAttribute('x', i * GW + 6 + j * 15)
    r.setAttribute('width', 13)
    r.setAttribute('rx', 3)
    r.style.setProperty('--d', i)
    yrSvg.appendChild(r)
    return r
  })
  yrBars.push(pair)
}
const guide = document.createElementNS(NS, 'line')
guide.setAttribute('class', 'yr-guide')
guide.setAttribute('y1', 0)
guide.setAttribute('y2', 400)
yrSvg.appendChild(guide)

function updateYears() {
  let total = 0
  yrData = Array.from({ length: ANOS }, (_, i) => {
    const f = Math.pow(REAJUSTE, i)
    const sem = sim.bill * f
    const com = (i < FIM_PARCELA ? sim.parcela : 0) + sim.nova * f
    total += (sem - com) * 12
    return { sem, com, total }
  })
  const max = yrData[ANOS - 1].sem * 1.04
  yrData.forEach((d, i) => {
    ;[d.sem, d.com].forEach((v, j) => {
      const h = Math.max(4, (v / max) * 370)
      const r = yrBars[i][j]
      r.setAttribute('y', 400 - h)
      r.setAttribute('height', h)
    })
  })
  setYear(yrCurrent, true)
}

const stories = {
  troca: ['Troca, não gasto', 'Parcela e taxa mínima, somadas, já ficam abaixo da conta de hoje. Você não tira dinheiro do bolso: só muda para onde ele vai.'],
  empate: ['Quase empate no começo', 'Nos primeiros anos, parcela e conta ficam parecidas. A diferença cresce porque a tarifa sobe e a parcela não.'],
  fim: ['A parcela acabou', 'Daqui em diante você paga só a taxa mínima da distribuidora. A energia que o telhado gera é sua.'],
  imovel: ['Seu imóvel vale mais', 'Casa ou comércio com energia própria é mais fácil de vender e de alugar. E o app mostra quanto o sistema gerou em cada dia.'],
  ainda: ['25 anos, ainda gerando', 'As placas têm garantia de 80% de eficiência aos 25 anos. A essa altura, o sistema já se pagou várias vezes.'],
}

function setYear(y, silent = false) {
  yrCurrent = y
  const d = yrData[y - 1]
  yrRange.value = y
  yrRange.style.setProperty('--p', ((y - 1) / (ANOS - 1)) * 100 + '%')
  yrBars.forEach((pair, i) => pair.forEach((r) => r.classList.toggle('is-dim', i !== y - 1)))
  const cx = (y - 0.5) * GW
  guide.setAttribute('x1', cx)
  guide.setAttribute('x2', cx)

  $('#yr-label').textContent = `Ano ${y}`
  $('#yr-num').textContent = ANO_BASE + y
  $('#yr-sem').innerHTML = `${brl(d.sem)}<small>/mês</small>`
  $('#yr-com').innerHTML = `${brl(d.com)}<small>/mês</small>`
  $('#yr-total').textContent = (d.total < 0 ? '−' : '') + brl(Math.abs(d.total))

  const phase =
    y <= FIM_PARCELA ? (yrData[0].com < yrData[0].sem * 0.92 ? 'troca' : 'empate') : y < 15 ? 'fim' : y < ANOS ? 'imovel' : 'ainda'
  if (phase !== yrPhase) {
    yrPhase = phase
    $('#yr-title').textContent = stories[phase][0]
    $('#yr-text').textContent = stories[phase][1]
    if (!silent && !reduce) {
      yrStory.classList.remove('is-swap')
      void yrStory.offsetWidth
      yrStory.classList.add('is-swap')
    }
  }
  const markYear = y <= FIM_PARCELA ? 1 : y < 15 ? 7 : y < ANOS ? 15 : 25
  yrMarks.forEach((m) => m.classList.toggle('is-active', Number(m.dataset.year) === markYear))
}

const yearFromPointer = (ev) => {
  const r = yrPlot.getBoundingClientRect()
  return Math.min(ANOS, Math.max(1, Math.floor(((ev.clientX - r.left) / r.width) * ANOS) + 1))
}
yrPlot.addEventListener('pointermove', (ev) => {
  if (ev.pointerType === 'mouse' || ev.buttons) setYear(yearFromPointer(ev))
})
yrPlot.addEventListener('pointerdown', (ev) => setYear(yearFromPointer(ev)))
yrRange.addEventListener('input', () => setYear(Number(yrRange.value)))
yrMarks.forEach((m) => m.addEventListener('click', () => setYear(Number(m.dataset.year))))

/* ---------- simulador ---------- */
const range = $('#conta')
const out = $('#conta-out')
const tipos = {
  casa: { tarifa: 1.02, minimo: 55 },
  loja: { tarifa: 0.98, minimo: 110 },
  fazenda: { tarifa: 0.86, minimo: 120 },
}
let sim = {}

function calc() {
  const bill = Number(range.value)
  const tipo = $('input[name="tipo"]:checked').value
  const t = tipos[tipo]
  const kwh = bill / t.tarifa
  const placas = Math.max(4, Math.ceil(kwh / 78)) // placa de 585 W no Piauí ≈ 78 kWh/mês
  const kwp = placas * 0.585
  const custoKwp = kwp < 10 ? 4200 : kwp < 30 ? 3700 : 3300
  const novaConta = Math.max(t.minimo, bill * 0.1)
  const eco = Math.max(0, bill - novaConta)
  // parcela de um financiamento em 72x a 1,5% ao mês (tabela Price)
  const juros = 0.015
  const parcela = (kwp * custoKwp * juros) / (1 - Math.pow(1 + juros, -72))
  sim = { bill, tipo, eco, placas, kwp, parcela, nova: novaConta }

  out.textContent = brl(bill)
  range.style.setProperty('--p', ((bill - range.min) / (range.max - range.min)) * 100 + '%')
  meterRender($('#eco-mes'), brl(eco))
  $('#eco-25').textContent = brl(eco * 12 * 25)
  $('#sistema').textContent = `${placas} placas · ${num(kwp, 1)} kWp`
  $('#parcela').textContent = brl(parcela)
  $$('.js-bill').forEach((b) => (b.textContent = brl(bill)))
  updateYears()
}

let simTouched = false // depois que a pessoa simula, todo botão de WhatsApp leva o valor da conta
range.addEventListener('input', () => {
  rotating = false
  simTouched = true
  calc()
})
$$('input[name="tipo"]').forEach((r) =>
  r.addEventListener('change', () => {
    rotating = false
    simTouched = true
    clearInterval(rotateTimer)
    setWord(r.value)
    calc()
  }),
)
calc()

/* ---------- etapas ---------- */
const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&h=640&q=70`
const etapas = [
  {
    img: img('photo-1660330589257-813305a4a383'),
    alt: 'Técnico avaliando o telhado',
    title: 'Visita técnica gratuita',
    text: 'Um técnico vai até você, mede o telhado, confere a estrutura e o padrão de energia, e entende quanto você consome em cada mês do ano.',
    list: ['Análise das últimas 12 contas', 'Verificação do telhado e da sombra', 'Sem compromisso'],
  },
  {
    img: img('photo-1648135327756-b606e2eb8caa'),
    alt: 'Capacete de segurança apoiado sobre uma placa solar',
    title: 'Projeto e financiamento',
    text: 'Você recebe o projeto com a quantidade de placas, a geração esperada mês a mês e a comparação entre parcela e conta. Se quiser financiar, a gente leva a proposta ao banco.',
    list: ['Projeto assinado por engenheiro', 'Até 72 parcelas', 'Até 120 dias de carência'],
  },
  {
    img: img('photo-1660330589505-9a433a742a7b'),
    alt: 'Dois instaladores fixando placas solares em um telhado',
    title: 'Instalação',
    text: 'Equipe própria, com uniforme e equipamento de segurança. Em casas, a instalação costuma levar um dia. No fim, a gente limpa tudo e explica o app.',
    list: ['Equipe própria, não terceirizada', 'Estrutura em alumínio', 'Treinamento no app'],
  },
  {
    img: img('photo-1698752821934-28bd5ce6fd42'),
    alt: 'Placas solares em campo aberto ao pôr do sol',
    title: 'Homologação e energia ligada',
    text: 'A gente pede a vistoria e a troca do medidor na distribuidora e acompanha até a aprovação. Quando o medidor novo chega, o sistema já começa a gerar crédito.',
    list: ['Toda a papelada com a gente', 'Troca do medidor inclusa', 'Acompanhamento por 12 meses'],
  },
]
// pré-carrega as fotos das etapas
etapas.forEach((e) => {
  const i = new Image()
  i.src = e.img
})

const tabs = $$('.step')
const panel = $('#painel-etapa')
function showStep(index, focus = false) {
  const e = etapas[index]
  tabs.forEach((t, i) => {
    const on = i === index
    t.classList.toggle('is-active', on)
    t.setAttribute('aria-selected', String(on))
    t.tabIndex = on ? 0 : -1
  })
  if (focus) tabs[index].focus()
  panel.setAttribute('aria-labelledby', tabs[index].id)
  panel.classList.add('is-swapping')
  setTimeout(
    () => {
      $('#step-img').src = e.img
      $('#step-img').alt = e.alt
      $('#step-title').textContent = e.title
      $('#step-text').textContent = e.text
      $('#step-list').innerHTML = e.list.map((l) => `<li>${l}</li>`).join('')
      panel.classList.remove('is-swapping')
    },
    reduce ? 0 : 260,
  )
}
tabs.forEach((t, i) => {
  t.addEventListener('click', () => showStep(i))
  t.addEventListener('keydown', (ev) => {
    const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }
    if (ev.key in keys) {
      ev.preventDefault()
      showStep((i + keys[ev.key] + tabs.length) % tabs.length, true)
    } else if (ev.key === 'Home') {
      ev.preventDefault()
      showStep(0, true)
    } else if (ev.key === 'End') {
      ev.preventDefault()
      showStep(tabs.length - 1, true)
    }
  })
})

/* ---------- contadores (CountUp) ---------- */
const countObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return
      countObs.unobserve(e.target)
      const el = e.target
      const to = Number(el.dataset.to)
      const dec = Number(el.dataset.dec || 0)
      if (reduce) return
      const start = performance.now()
      const dur = 1800
      const tick = (now) => {
        const p = Math.min(1, (now - start) / dur)
        const k = 1 - Math.pow(2, -10 * p) // ease-out exponencial
        el.textContent = num(to * (p === 1 ? 1 : k), dec)
        if (p < 1) requestAnimationFrame(tick)
      }
      el.textContent = num(0, dec)
      requestAnimationFrame(tick)
    })
  },
  { threshold: 0.6 },
)
$$('.count').forEach((c) => countObs.observe(c))

/* ---------- entrada ao rolar ---------- */
const groups = new Map()
$$('.reveal').forEach((el) => {
  const parent = el.parentElement
  const n = groups.get(parent) || 0
  el.style.setProperty('--i', n)
  groups.set(parent, n + 1)
})
const revealObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return
      e.target.classList.add('is-in')
      revealObs.unobserve(e.target)
    })
  },
  { rootMargin: '0px 0px -8% 0px' },
)
$$('.reveal').forEach((el) => revealObs.observe(el))

/* ---------- spotlight (SpotlightCard) e ímã (Magnet) ---------- */
if (finePointer && !reduce) {
  $$('.spot').forEach((card) => {
    card.addEventListener('pointermove', (ev) => {
      const r = card.getBoundingClientRect()
      card.style.setProperty('--sx', ev.clientX - r.left + 'px')
      card.style.setProperty('--sy', ev.clientY - r.top + 'px')
      card.style.setProperty('--spot-o', '1')
    })
    card.addEventListener('pointerleave', () => card.style.setProperty('--spot-o', '0'))
  })

  $$('.magnet').forEach((btn) => {
    const strength = 0.22
    btn.addEventListener('pointermove', (ev) => {
      const r = btn.getBoundingClientRect()
      const x = (ev.clientX - (r.left + r.width / 2)) * strength
      const y = (ev.clientY - (r.top + r.height / 2)) * strength
      btn.style.setProperty('--mx', x.toFixed(1) + 'px')
      btn.style.setProperty('--my', y.toFixed(1) + 'px')
    })
    btn.addEventListener('pointerleave', () => {
      btn.style.setProperty('--mx', '0px')
      btn.style.setProperty('--my', '0px')
    })
  })
}

/* ---------- WhatsApp ---------- */
// A empresa é fictícia: em vez de abrir um número, mostramos a mensagem que seria enviada.
const sheet = $('#wa-sheet')
const tipoNome = { casa: 'minha casa', loja: 'meu comércio', fazenda: 'minha propriedade rural' }

function simMessage() {
  return `Olá! Fiz a simulação no site.\nConta de luz: ${brl(sim.bill)} por mês, para ${tipoNome[sim.tipo]}.\nEconomia estimada: ${brl(sim.eco)} por mês, com ${sim.placas} placas e parcela de ${brl(sim.parcela)} em 72x.\nQuero agendar a visita técnica.`
}

$$('.js-wa').forEach((btn) =>
  btn.addEventListener('click', () => {
    let msg = btn.classList.contains('js-wa-sim') ? simMessage() : btn.dataset.msg
    if (simTouched && !btn.classList.contains('js-wa-sim')) msg += `\nConta de luz: ${brl(sim.bill)} por mês (simulei no site).`
    $('#wa-msg').textContent = msg
    if (typeof sheet.showModal === 'function') sheet.showModal()
    else sheet.setAttribute('open', '')
  }),
)
$$('[data-close]', sheet).forEach((b) => b.addEventListener('click', () => sheet.close()))
sheet.addEventListener('click', (ev) => {
  if (ev.target === sheet) sheet.close()
})

// botão flutuante aparece depois do primeiro bloco
const float = $('.wa-float')
const heroObs = new IntersectionObserver(([e]) => float.classList.toggle('is-on', !e.isIntersecting), {
  threshold: 0.1,
})
heroObs.observe($('.intro__ctas'))

/* ---------- caminho do sol na abertura ---------- */
// Posição do sol pela hora de Picos (UTC-3). Nascer ~5h40, pôr do sol ~17h50.
// Geração estimada: 1.240 sistemas, pico de ~5,4 MW ao meio-dia.
const sky = $('#sky')
const sun = $('#sky-sun')
const moon = $('#sky-moon')
const lit = $('#sky-lit')
const NASCER = 5 + 40 / 60
const POR = 17 + 50 / 60
const PICO_MW = 5.4
const intro = $('.intro')

function picosHour() {
  const parts = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Fortaleza', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date())
  const h = Number(parts.find((p) => p.type === 'hour').value) % 24
  const m = Number(parts.find((p) => p.type === 'minute').value)
  return h + m / 60
}
const hhmm = (h) => `${String(Math.floor(h)).padStart(2, '0')}:${String(Math.floor((h % 1) * 60)).padStart(2, '0')}`
const curve = (t) => Math.pow(Math.max(0, Math.sin(Math.PI * t)), 1.2)

function energiaAte(t) {
  // MWh gerados do nascer até a fração t do dia (soma em 60 passos)
  const horas = POR - NASCER
  let s = 0
  for (let i = 0; i < 60; i++) s += curve(((i + 0.5) / 60) * t)
  return (s / 60) * t * horas * PICO_MW
}

function setSky(hour, scrub = false) {
  const t = (hour - NASCER) / (POR - NASCER)
  const day = t >= 0 && t <= 1
  sky.classList.toggle('is-scrub', scrub)
  // fora do dia o sol fica parado no horizonte (nascente ou poente) e vai sumindo
  const tt = Math.min(1, Math.max(0, t))
  const a = Math.PI * (1 - tt)
  // mesmo arco do SVG: centro (600, 560), raio 540, numa caixa de 1200 x 600
  sun.style.left = ((600 + 540 * Math.cos(a)) / 1200) * 100 + '%'
  sun.style.top = ((560 - 540 * Math.sin(a)) / 600) * 100 + '%'
  lit.style.strokeDasharray = `${tt} 1`
  const noite = nightAmount(t)
  sun.style.opacity = (1 - noite).toFixed(3)
  moon.style.opacity = noite.toFixed(3)
  setLight(t)

  $('#live-time').textContent = `${scrub ? 'Às' : 'Agora em Picos ·'} ${hhmm(hour)}`
  $('#live-mw').textContent = `${num(day ? PICO_MW * curve(t) : 0, 1)} MW`
  if (day) {
    $('#live-text').textContent = `é o que os 1.240 sistemas da Raia ${scrub ? 'geram nesse horário' : 'estão gerando agora'}. ${scrub ? 'Até aqui' : 'Hoje já foram'} ${num(energiaAte(t), 1)} MWh.`
  } else if (t > 1) {
    $('#live-text').textContent = `O sol se pôs. Hoje foram ${num(energiaAte(1), 1)} MWh, e os créditos do dia pagam a energia da noite.`
  } else {
    $('#live-text').textContent = 'O sol ainda não nasceu. Até lá, os créditos de ontem pagam a energia que você usa.'
  }
}

// 0 durante o dia; sobe de 0 a 1 na primeira hora e meia depois do pôr do sol (e antes do nascer)
function nightAmount(t) {
  const edge = Math.min(t, 1 - t)
  return edge >= 0 ? 0 : Math.min(1, -edge / 0.12)
}

// Luz da foto conforme a hora: t = 0 no nascer, 1 no pôr do sol, fora disso é noite.
// Perto do horizonte a foto escurece e fica dourada; à noite fica escura, azulada e com estrelas.
const mix = (a, b, k) => a + (b - a) * k
function setLight(t) {
  const s = intro.style
  // distância (em fração do dia) até o nascer ou pôr do sol; negativa = noite
  const edge = Math.min(t, 1 - t)
  if (edge >= 0) {
    const sol = Math.min(1, edge / 0.22) // 0 no horizonte, 1 com o sol alto
    s.setProperty('--sky-b', mix(0.55, 1.04, sol).toFixed(3))
    s.setProperty('--sky-s', mix(1.25, 1, sol).toFixed(3))
    s.setProperty('--sky-h', mix(-12, 0, sol).toFixed(1) + 'deg')
    s.setProperty('--sky-tint', '#ff7a2f')
    s.setProperty('--sky-tint-o', mix(0.75, 0, sol).toFixed(3))
    s.setProperty('--sky-stars', '0')
  } else {
    const noite = nightAmount(t) // escurece aos poucos depois do pôr do sol
    s.setProperty('--sky-b', mix(0.55, 0.28, noite).toFixed(3))
    s.setProperty('--sky-s', mix(1.25, 0.7, noite).toFixed(3))
    s.setProperty('--sky-h', mix(-12, 18, noite).toFixed(1) + 'deg')
    // cor vai do dourado (255,122,47) ao azul da noite (29,42,107) em degradê
    s.setProperty('--sky-tint', `rgb(${mix(255, 29, noite).toFixed(0)}, ${mix(122, 42, noite).toFixed(0)}, ${mix(47, 107, noite).toFixed(0)})`)
    s.setProperty('--sky-tint-o', mix(0.75, 0.9, noite).toFixed(3))
    s.setProperty('--sky-stars', noite.toFixed(3))
  }
}

const skyNow = () => setSky(picosHour())
skyNow()
setInterval(skyNow, 60000)

// passe o mouse pela abertura para "arrastar o dia": da madrugada (4h) até a noite (20h)
if (finePointer && !reduce) {
  intro.addEventListener('pointermove', (ev) => {
    if (ev.target.closest('.btn, .glass, .rating')) return
    const r = intro.getBoundingClientRect()
    const x = Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width))
    intro.classList.add('is-scrub')
    setSky(4 + x * 16, true)
  })
  intro.addEventListener('pointerleave', () => {
    sky.classList.remove('is-scrub')
    intro.classList.remove('is-scrub')
    skyNow()
  })
}
