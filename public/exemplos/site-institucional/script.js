// Ventura Contabilidade (exemplo) — comportamento das páginas.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const onScreen = (el) => el.getBoundingClientRect().top < window.innerHeight

// Menu do celular
const toggle = document.querySelector('.menu-toggle')
const nav = document.querySelector('.nav')
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open')
    toggle.setAttribute('aria-expanded', String(open))
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu')
  })
}

// CountUp — adaptado do componente CountUp do React Bits (reactbits.dev) para JS puro.
// O número final já está no HTML; a contagem só roda uma vez, quando o campo entra na tela.
const countUp = (el) => {
  const to = Number(el.dataset.count)
  const duration = 1400
  const start = performance.now()
  const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))
  const tick = (now) => {
    const t = Math.min(1, (now - start) / duration)
    el.textContent = Math.round(to * easeOutExpo(t)).toLocaleString('pt-BR')
    if (t < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}
const counters = [...document.querySelectorAll('[data-count]')].filter((el) => !onScreen(el))
if (!reduceMotion && counters.length && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        io.unobserve(entry.target)
        countUp(entry.target)
      })
    },
    { threshold: 0.6 },
  )
  counters.forEach((el) => {
    el.textContent = '0'
    io.observe(el)
  })
}

// (calendário de prazos: ver o bloco "Calendário interativo" no fim do arquivo)

// Formulários de exemplo: validam, mas não enviam nada.
const showError = (field, message) => {
  field.classList.add('is-invalid')
  let err = field.querySelector('.field__error')
  if (!err) {
    err = document.createElement('span')
    err.className = 'field__error'
    field.appendChild(err)
  }
  err.textContent = message
}
const clearError = (field) => {
  field.classList.remove('is-invalid')
  field.querySelector('.field__error')?.remove()
}
document.querySelectorAll('.lead').forEach((form) => {
  form.addEventListener('input', (event) => {
    const field = event.target.closest('.field')
    if (field) clearError(field)
  })
  form.addEventListener('submit', (event) => {
    event.preventDefault()
    let firstInvalid = null
    form.querySelectorAll('input[required]').forEach((input) => {
      const field = input.closest('.field')
      const value = input.value.trim()
      let message = ''
      if (!value) message = input.type === 'tel' ? 'Informe um WhatsApp para retorno.' : 'Informe o seu nome.'
      else if (input.type === 'tel' && value.replace(/\D/g, '').length < 10) message = 'Número incompleto: use DDD e número.'
      if (message) {
        showError(field, message)
        firstInvalid ??= input
      }
    })
    if (firstInvalid) {
      firstInvalid.focus()
      return
    }
    const button = form.querySelector('button[type="submit"]')
    button.disabled = true
    button.textContent = 'Registrando…'
    setTimeout(() => {
      form.querySelector('.lead__ok').hidden = false
      button.textContent = 'Solicitação registrada'
      form.reset()
    }, 600)
  })
})

document.querySelectorAll('.newsletter').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault()
    form.querySelector('.newsletter__ok').hidden = false
    form.reset()
  })
})

document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = new Date().getFullYear()
})

// LogoLoop — adaptado do componente LogoLoop do React Bits: a lista é duplicada
// para a faixa rolar sem emenda (a cópia fica escondida dos leitores de tela).
document.querySelectorAll('[data-logoloop] .logoloop__track').forEach((track) => {
  if (reduceMotion) return
  ;[...track.children].forEach((li) => {
    const clone = li.cloneNode(true)
    clone.setAttribute('aria-hidden', 'true')
    track.appendChild(clone)
  })
})

// SpotlightCard — adaptado do React Bits: o brilho do cartão segue o cursor.
if (window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.spot').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const r = card.getBoundingClientRect()
      card.style.setProperty('--mx', `${event.clientX - r.left}px`)
      card.style.setProperty('--my', `${event.clientY - r.top}px`)
    })
  })
}

// Horário: mostra ontem, hoje e amanhã, com o dia de hoje em destaque.
const hours = document.querySelector('[data-hours]')
if (hours) {
  const names = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  const today = new Date().getDay()
  hours.innerHTML = [-1, 0, 1]
    .map((offset) => {
      const d = (today + offset + 7) % 7
      const open = d >= 1 && d <= 5
      return `<li${offset === 0 ? ' class="is-today"' : ''}><span>${names[d]}${offset === 0 ? '<em>hoje</em>' : ''}</span><span>${open ? '08:00 – 18:00' : 'Fechado'}</span></li>`
    })
    .join('')
}

// Links com âncora vindos de outra página (ex.: index.html#duvidas): depois que tudo carrega,
// a posição pode ter mudado; rola de novo até a seção certa.
window.addEventListener('load', () => {
  if (!location.hash) return
  try {
    document.querySelector(location.hash)?.scrollIntoView({ behavior: 'instant' })
  } catch {
    /* hash inválido como seletor */
  }
})

// Calendário interativo de prazos: grade do mês, navegação, troca de regime (Simples/MEI),
// detalhes do dia clicado e contagem regressiva até o próximo vencimento.
const cal = document.querySelector('[data-cal]')
if (cal) {
  const DAY = 86400000
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const isWeekend = (d) => d.getDay() === 0 || d.getDay() === 6
  // vencimento em fim de semana é antecipado para o dia útil anterior
  const dueOn = (y, m, day) => {
    const d = new Date(y, m, day)
    while (isWeekend(d)) d.setDate(d.getDate() - 1)
    return d
  }
  // salário: 5º dia útil (para a CLT, o sábado conta como dia útil)
  const fifthBusinessDay = (y, m) => {
    const d = new Date(y, m, 1)
    let n = 0
    while (true) {
      if (d.getDay() !== 0) n += 1
      if (n === 5) return d
      d.setDate(d.getDate() + 1)
    }
  }
  const rules = {
    simples: (y, m) => [
      { name: 'Pagamento de salários', note: 'Até o 5º dia útil do mês', date: fifthBusinessDay(y, m) },
      { name: 'eSocial: eventos da folha', note: 'Envio dos eventos do mês anterior', date: dueOn(y, m, 15) },
      { name: 'DAS do Simples Nacional', note: 'Guia única de impostos', date: dueOn(y, m, 20) },
      { name: 'FGTS Digital', note: 'Depósito do FGTS dos funcionários', date: dueOn(y, m, 20) },
      { name: 'INSS pela DCTFWeb', note: 'Contribuição previdenciária', date: dueOn(y, m, 20) },
      ...(m === 2 ? [{ name: 'DEFIS', note: 'Declaração anual do Simples', date: dueOn(y, 2, 31) }] : []),
    ],
    mei: (y, m) => [
      { name: 'DAS-MEI', note: 'Guia mensal do MEI', date: dueOn(y, m, 20) },
      ...(m === 4 ? [{ name: 'DASN-SIMEI', note: 'Declaração anual do MEI', date: dueOn(y, 4, 31) }] : []),
    ],
  }

  let regime = 'simples'
  let view = new Date(today.getFullYear(), today.getMonth(), 1)
  let selected = null

  const grid = cal.querySelector('[data-cal-grid]')
  const title = cal.querySelector('[data-cal-title]')
  const detail = cal.querySelector('[data-cal-detail]')
  const monthName = (d) => {
    const s = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    return s.charAt(0).toUpperCase() + s.slice(1)
  }
  const ddmm = (d) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  const sameDay = (a, b) => a.getTime() === b.getTime()
  const status = (d) => (d < today ? 'done' : 'open')
  const inDays = (d) => {
    const n = Math.round((d - today) / DAY)
    return n === 0 ? 'vence hoje' : n === 1 ? 'vence amanhã' : n > 0 ? `faltam ${n} dias` : 'cumprido'
  }

  const nextDeadline = () => {
    for (let k = 0; k < 14; k += 1) {
      const y = today.getFullYear()
      const m = today.getMonth() + k
      const list = rules[regime](new Date(y, m, 1).getFullYear(), new Date(y, m, 1).getMonth())
        .filter((o) => o.date >= today)
        .sort((a, b) => a.date - b.date)
      if (list.length) return list[0]
    }
    return null
  }

  const renderCountdown = () => {
    const next = nextDeadline()
    if (!next) return
    const days = Math.round((next.date - today) / DAY)
    document.querySelector('[data-days]').textContent = days
    document.querySelector('[data-days-label]').textContent = days === 1 ? 'dia' : 'dias'
    document.querySelector('[data-next-name]').textContent = next.name
    document.querySelector('[data-next-date]').textContent = next.date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
    const ring = document.querySelector('[data-ring]')
    const length = 2 * Math.PI * 52
    ring.style.strokeDasharray = String(length)
    ring.style.strokeDashoffset = String(length * Math.min(1, days / 31))
  }

  const renderDetail = (list) => {
    if (selected) {
      const items = list.filter((o) => sameDay(o.date, selected))
      const label = selected.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
      detail.innerHTML = items.length
        ? `<b>${label}</b><ul>${items
            .map((o) => `<li class="is-${status(o.date)}"><span><strong>${o.name}</strong>${o.note}</span><em>${inDays(o.date)}</em></li>`)
            .join('')}</ul>`
        : `<b>${label}</b><p>Nenhuma obrigação neste dia.</p>`
      return
    }
    detail.innerHTML = `<b>Obrigações de ${monthName(view).toLowerCase()}</b><ul>${list
      .slice()
      .sort((a, b) => a.date - b.date)
      .map((o) => `<li class="is-${status(o.date)}"><span><strong>${ddmm(o.date)} · ${o.name}</strong>${o.note}</span><em>${inDays(o.date)}</em></li>`)
      .join('')}</ul>`
  }

  const render = () => {
    const y = view.getFullYear()
    const m = view.getMonth()
    const list = rules[regime](y, m)
    title.textContent = monthName(view)
    const first = new Date(y, m, 1).getDay()
    const total = new Date(y, m + 1, 0).getDate()
    let html = ''
    for (let i = 0; i < first; i += 1) html += '<span class="cal__pad"></span>'
    for (let day = 1; day <= total; day += 1) {
      const d = new Date(y, m, day)
      const due = list.filter((o) => sameDay(o.date, d))
      const cls = [
        due.length ? 'is-due' : '',
        due.length && d < today ? 'is-done' : '',
        sameDay(d, today) ? 'is-today' : '',
        selected && sameDay(d, selected) ? 'is-selected' : '',
      ].join(' ')
      const label = `${day} de ${monthName(view)}${due.length ? `: ${due.map((o) => o.name).join(', ')}` : ''}`
      html += `<button type="button" class="cal__day ${cls}" data-day="${day}" aria-label="${label}"${selected && sameDay(d, selected) ? ' aria-pressed="true"' : ''}>${day}${due.length ? `<i>${due.length}</i>` : ''}</button>`
    }
    grid.innerHTML = html
    renderDetail(list)
  }

  grid.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-day]')
    if (!btn) return
    const d = new Date(view.getFullYear(), view.getMonth(), Number(btn.dataset.day))
    selected = selected && sameDay(selected, d) ? null : d
    render()
    grid.querySelector(`[data-day="${btn.dataset.day}"]`)?.focus()
  })
  cal.querySelector('[data-cal-prev]').addEventListener('click', () => {
    view = new Date(view.getFullYear(), view.getMonth() - 1, 1)
    selected = null
    render()
  })
  cal.querySelector('[data-cal-next]').addEventListener('click', () => {
    view = new Date(view.getFullYear(), view.getMonth() + 1, 1)
    selected = null
    render()
  })
  document.querySelectorAll('[data-regime]').forEach((btn) => {
    btn.addEventListener('click', () => {
      regime = btn.dataset.regime
      document.querySelectorAll('[data-regime]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)))
      selected = null
      render()
      renderCountdown()
    })
  })

  render()
  renderCountdown()
}

// Simulador de imposto (Simples Nacional, estimativa ilustrativa).
// Alíquota efetiva = (RBT12 × alíquota nominal − parcela a deduzir) ÷ RBT12, faixas da LC 123/2006.
const sim = document.querySelector('[data-sim]')
if (sim) {
  // [limite da faixa (receita em 12 meses), alíquota nominal, parcela a deduzir]
  const ANEXO_I = [[180000, 0.04, 0], [360000, 0.073, 5940], [720000, 0.095, 13860], [1800000, 0.107, 22500], [3600000, 0.143, 87300], [4800000, 0.19, 378000]]
  const ANEXO_III = [[180000, 0.06, 0], [360000, 0.112, 9360], [720000, 0.135, 17640], [1800000, 0.16, 35640], [3600000, 0.21, 125640], [4800000, 0.33, 648000]]
  const ANEXO_V = [[180000, 0.155, 0], [360000, 0.18, 4500], [720000, 0.195, 9900], [1800000, 0.205, 17100], [3600000, 0.23, 62100], [4800000, 0.305, 540000]]
  const effective = (table, rbt12) => {
    const [, rate, ded] = table.find(([limit]) => rbt12 <= limit) || table[table.length - 1]
    return Math.max(0, (rbt12 * rate - ded) / rbt12)
  }
  const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
  const pct = (v) => (v * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%'

  const range = sim.querySelector('[data-sim-range]')
  const out = (k) => sim.querySelector(`[data-sim-${k}]`)
  let act = 'servicos'

  const update = () => {
    const monthly = Number(range.value)
    const rbt12 = monthly * 12
    let a, b, labelA, labelB, how
    if (act === 'servicos') {
      // serviços intelectuais: Anexo V; com folha ≥ 28% da receita (Fator R) passam ao Anexo III
      const ra = effective(ANEXO_V, rbt12)
      const rb = effective(ANEXO_III, rbt12)
      a = monthly * ra
      b = monthly * rb
      labelA = `Anexo V · ${pct(ra)}`
      labelB = `Anexo III com Fator R · ${pct(rb)}`
      how = 'Como: organizando o pró-labore e a folha para atingir o Fator R (28% da receita), a empresa passa do Anexo V para o Anexo III.'
    } else {
      // comércio: PIS/COFINS de produtos monofásicos já foram pagos na indústria e saem do DAS
      const r = effective(ANEXO_I, rbt12)
      a = monthly * r
      // PIS + COFINS ≈ 15,5% do DAS no Anexo I; exemplo com 35% das vendas em produtos monofásicos
      b = a - a * 0.155 * 0.35
      labelA = `Sem segregar · ${pct(r)}`
      labelB = `Segregando monofásicos · ${pct(b / monthly)}`
      how = 'Como: produtos monofásicos (bebidas, cosméticos, autopeças…) já pagaram PIS/COFINS na indústria. Separados na apuração, esses tributos saem do DAS. Exemplo com 35% das vendas.'
    }
    const save = Math.max(0, a - b)
    out('rev').textContent = brl(monthly)
    out('a').textContent = brl(a) + '/mês'
    out('b').textContent = brl(b) + '/mês'
    out('label-a').textContent = labelA
    out('label-b').textContent = labelB
    out('save').textContent = brl(save) + '/mês'
    out('year').textContent = `${brl(save * 12)} por ano`
    out('how').textContent = how
    out('bar-a').style.width = '100%'
    out('bar-b').style.width = `${Math.max(4, (b / a) * 100)}%`
    range.style.setProperty('--fill', `${((monthly - range.min) / (range.max - range.min)) * 100}%`)
    range.setAttribute('aria-valuetext', `${brl(monthly)} por mês`)
  }

  range.addEventListener('input', update)
  sim.querySelectorAll('[data-act]').forEach((btn) => {
    btn.addEventListener('click', () => {
      act = btn.dataset.act
      sim.querySelectorAll('[data-act]').forEach((x) => x.setAttribute('aria-pressed', String(x === btn)))
      update()
    })
  })
  sim.addEventListener('submit', (event) => event.preventDefault())
  update()
}
