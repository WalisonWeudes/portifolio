// Vértice Arquitetura — interações da página de exemplo.
(() => {
  const $ = (s, el = document) => el.querySelector(s)
  const $$ = (s, el = document) => [...el.querySelectorAll(s)]
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches
  const img = (id, w) => `https://images.unsplash.com/photo-${id}?w=${w}&q=68&auto=format&fit=crop`
  const nf = new Intl.NumberFormat('pt-BR')

  /* ---------- header e menu ---------- */
  const header = $('#header')
  const onScroll = () => header.classList.toggle('is-solid', scrollY > 40)
  onScroll()
  addEventListener('scroll', onScroll, { passive: true })

  const menu = $('#menu')
  const menuBtn = $('#menuBtn')
  const setMenu = (open) => {
    menu.classList.toggle('is-open', open)
    menuBtn.setAttribute('aria-expanded', open)
    document.body.style.overflow = open ? 'hidden' : ''
  }
  menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')))
  menu.addEventListener('click', (e) => e.target.closest('a') && setMenu(false))
  addEventListener('keydown', (e) => e.key === 'Escape' && menu.classList.contains('is-open') && setMenu(false))

  // link ativo no menu conforme a seção visível
  const navLinks = $$('.nav a[href^="#"]')
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return
      navLinks.forEach((a) => a.toggleAttribute('aria-current', a.getAttribute('href') === '#' + en.target.id))
    })
  }, { rootMargin: '-45% 0px -50% 0px' })
  navLinks.forEach((a) => { const s = $(a.getAttribute('href')); s && spy.observe(s) })

  /* ---------- revelar ao rolar + contadores ---------- */
  const countUp = (el) => {
    const end = +el.dataset.count
    const suf = el.dataset.suffix || ''
    const fmt = (n) => (el.dataset.format ? nf.format(n) : n) + suf
    if (calm) { el.textContent = fmt(end); return }
    const t0 = performance.now()
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / 1600)
      el.textContent = fmt(Math.round(end * (1 - Math.pow(1 - p, 4))))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return
      en.target.classList.add('is-in')
      const c = en.target.matches('[data-count]') ? en.target : $('[data-count]', en.target)
      if (c) countUp(c)
      io.unobserve(en.target)
    })
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' })
  $$('.reveal').forEach((el, i) => {
    el.style.transitionDelay = (el.parentElement.matches('.stats, .services__list') ? (i % 4) * 90 : 0) + 'ms'
    io.observe(el)
  })

  /* ---------- projetos ---------- */
  const works = [
    { id: '1783125127229-0850d689e014', name: 'Casa Pedra Alta', cat: 'residencial', place: 'Sobral, CE', year: 2024, area: '320 m²', status: 'Concluída',
      text: 'Pedra local na base e grandes panos de vidro voltados para o nascente. A cobertura avança para sombrear a varanda nas tardes de calor.' },
    { id: '1766603636562-531bb3e1dda8', name: 'Casa Ipê', cat: 'residencial', place: 'Teresina, PI', year: 2023, area: '260 m²', status: 'Concluída',
      text: 'Fachada em ripado de madeira que filtra o sol do poente e deixa a ventilação cruzar a casa inteira.' },
    { id: '1780362507424-a624df756101', name: 'Galeria Penumbra', cat: 'interiores', place: 'Fortaleza, CE', year: 2025, area: '140 m²', status: 'Concluída',
      text: 'Reforma de um antigo depósito em galeria de arte. Concreto aparente, luz rasante e uma única abertura para a rua.' },
    { id: '1706164971302-e30c0640cc3b', name: 'Residência Lago', cat: 'residencial', place: 'Parnaíba, PI', year: 2022, area: '410 m²', status: 'Concluída',
      text: 'Térrea, comprida e aberta para a piscina. Todos os quartos têm saída para o jardim e janela para o vento dominante.' },
    { id: '1759378060310-05aa140ad202', name: 'Estúdio Degrau', cat: 'interiores', place: 'Teresina, PI', year: 2024, area: '85 m²', status: 'Concluída',
      text: 'Escada em concreto moldado com iluminação embutida no rodapé: a circulação vira o elemento principal do estúdio.' },
    { id: '1785681856854-a08e10c6ff3f', name: 'Edifício Âmbar', cat: 'comercial', place: 'São Luís, MA', year: 2023, area: '2.800 m²', status: 'Concluído',
      text: 'Escritórios com varandas recuadas que sombreiam as fachadas e reduzem o uso de ar-condicionado em 30%.' },
    { id: '1564078516393-cf04bd966897', name: 'Apartamento Horizonte', cat: 'interiores', place: 'Recife, PE', year: 2025, area: '120 m²', status: 'Concluído',
      text: 'Paredes derrubadas para abrir a vista do mar. Marcenaria escura e piso claro contínuo do estar à varanda.' },
    { id: '1788956766888-912549a5b892', name: 'Sede Bloco Norte', cat: 'comercial', place: 'Natal, RN', year: 2021, area: '4.200 m²', status: 'Concluída',
      text: 'Sede administrativa em concreto aparente com pátios internos que levam luz natural a todas as salas.' },
  ]
  const label = { residencial: 'Residencial', interiores: 'Interiores', comercial: 'Comercial' }

  const grid = $('#works')
  grid.innerHTML = works.map((w, i) => `
    <li class="work" data-cat="${w.cat}">
      <button class="work__btn" type="button" data-i="${i}" aria-haspopup="dialog">
        <span class="work__img">
          <img src="${img(w.id, 900)}" alt="${w.name}, ${label[w.cat].toLowerCase()} em ${w.place}" loading="lazy" decoding="async" />
          <span class="work__more" aria-hidden="true">Ver projeto<svg viewBox="0 0 24 24"><use href="#i-arrow"/></svg></span>
        </span>
        <span class="work__row">
          <span class="work__name">${w.name}</span>
          <span class="work__meta">${label[w.cat]} · ${w.year}</span>
        </span>
      </button>
    </li>`).join('')

  let visible = works.map((_, i) => i)
  const count = $('#worksCount')
  $$('.chip').forEach((chip) => chip.addEventListener('click', () => {
    const f = chip.dataset.filter
    $$('.chip').forEach((c) => { c.classList.toggle('is-on', c === chip); c.setAttribute('aria-pressed', c === chip) })
    visible = []
    $$('.work', grid).forEach((li, i) => {
      const show = f === 'all' || li.dataset.cat === f
      li.classList.toggle('is-hidden', !show)
      li.classList.remove('is-in')
      if (show) { visible.push(i); void li.offsetWidth; li.classList.add('is-in'); li.style.animationDelay = (visible.length - 1) * 60 + 'ms' }
    })
    count.textContent = `${visible.length} ${visible.length === 1 ? 'projeto' : 'projetos'}${f === 'all' ? '' : ' em ' + label[f].toLowerCase()}`
  }))

  // detalhe do projeto
  const modal = $('#modal')
  let open = 0
  const fill = (i) => {
    open = i
    const w = works[i]
    $('#modalImg').innerHTML = `<img src="${img(w.id, 1400)}" alt="${w.name}" />`
    $('#modalType').textContent = `${label[w.cat]} · ${w.year}`
    $('#modalTitle').textContent = w.name
    $('#modalText').textContent = w.text
    $('#modalSpecs').innerHTML = [['Local', w.place], ['Área', w.area], ['Ano', w.year], ['Situação', w.status]]
      .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')
    const pos = visible.indexOf(i)
    $('#modalPos').textContent = `${String(pos + 1).padStart(2, '0')} / ${String(visible.length).padStart(2, '0')}`
  }
  const step = (d) => fill(visible[(visible.indexOf(open) + d + visible.length) % visible.length])
  let opener
  grid.addEventListener('click', (e) => {
    const b = e.target.closest('.work__btn')
    if (!b) return
    opener = b
    fill(+b.dataset.i)
    modal.showModal()
    document.body.style.overflow = 'hidden'
  })
  $('#modalPrev').addEventListener('click', () => step(-1))
  $('#modalNext').addEventListener('click', () => step(1))
  $('#modalClose').addEventListener('click', () => modal.close())
  modal.addEventListener('click', (e) => e.target === modal && modal.close())
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') step(1)
    if (e.key === 'ArrowLeft') step(-1)
  })
  modal.addEventListener('close', () => { document.body.style.overflow = ''; opener && opener.focus() })

  /* ---------- planta interativa (1 m = 50 unidades) ---------- */
  const rooms = [
    { k: 'sala', n: 'Sala de estar', m2: '21,0', r: [0, 0, 250, 210], d: 'Pé-direito duplo e porta de correr que abre o estar inteiro para a varanda.' },
    { k: 'jantar', n: 'Jantar', m2: '9,3', r: [250, 0, 150, 155], d: 'Mesa para oito sob um rasgo zenital: luz natural o dia todo.' },
    { k: 'cozinha', n: 'Cozinha', m2: '9,6', r: [400, 0, 200, 120], d: 'Integrada ao jantar por uma ilha de 2,4 m com cuba e cooktop.' },
    { k: 'suite', n: 'Suíte master', m2: '15,6', r: [400, 120, 200, 195], d: 'Closet de passagem e janela de canto voltada para o nascente.' },
    { k: 'hall', n: 'Hall e rouparia', m2: '7,4', r: [250, 155, 150, 125], d: 'Distribui os quartos sem corredor longo; armários embutidos dos dois lados.' },
    { k: 'lounge', n: 'Lounge TV', m2: '9,0', r: [0, 210, 105, 215], d: 'Canto mais fechado da casa, pensado para cinema e leitura.' },
    { k: 'hospedes', n: 'Quarto de hóspedes', m2: '11,1', r: [105, 210, 130, 215], d: 'Vira escritório quando não há visita: bancada fixa sob a janela.' },
    { k: 'banho', n: 'Banheiro', m2: '8,9', r: [250, 280, 150, 145], d: 'Ventilação natural, box de 1,60 m e bancada em concreto polido.' },
  ]
  const svg = $('#planSvg')
  const gRooms = $('#planRooms')
  gRooms.innerHTML = rooms.map((o) => {
    const [x, y, w, h] = o.r
    const cx = x + w / 2, cy = y + h / 2
    const short = o.n.replace('Quarto de ', '').replace(' e rouparia', '')
    return `<g class="room" data-k="${o.k}" tabindex="0" role="button" aria-label="${o.n}, ${o.m2} metros quadrados">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" />
      <text x="${cx}" y="${cy - 2}">${short}</text>
      <text class="m2" x="${cx}" y="${cy + 15}">${o.m2} m²</text>
    </g>`
  }).join('') +
    `<rect x="400" y="315" width="200" height="110" fill="none" stroke="#9d9d98" stroke-dasharray="6 5" stroke-width="1.5" />
     <text x="500" y="375" fill="#9d9d98" style="font:500 11px Archivo,sans-serif;letter-spacing:.1em;text-anchor:middle">VARANDA</text>`

  const rows = $('#planRows')
  rows.innerHTML = rooms.map((o) => `<tr data-k="${o.k}" tabindex="0"><td>${o.n}</td><td>${o.m2} m²</td></tr>`).join('')
  const cap = $('#planCaption')
  let pinned = null
  const mark = (k) => {
    svg.classList.toggle('has-on', !!k)
    $$('.room', svg).forEach((g) => g.classList.toggle('is-on', g.dataset.k === k))
    $$('tr', rows).forEach((tr) => tr.classList.toggle('is-on', tr.dataset.k === k))
    const o = rooms.find((r) => r.k === k)
    cap.innerHTML = o ? `<b>${o.n} · ${o.m2} m²</b>${o.d}` : 'Escolha um cômodo'
  }
  const bind = (el) => {
    el.addEventListener('mouseenter', () => mark(el.dataset.k))
    el.addEventListener('mouseleave', () => mark(pinned))
    el.addEventListener('focus', () => mark(el.dataset.k))
    el.addEventListener('click', () => { pinned = pinned === el.dataset.k ? null : el.dataset.k; mark(pinned || el.dataset.k) })
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click() } })
  }
  $$('.room', svg).forEach(bind)
  $$('tr', rows).forEach(bind)
  pinned = 'sala'; mark('sala')

  /* ---------- comparação estudo × obra ---------- */
  const cmp = $('#cmp')
  const range = $('#cmpRange')
  range.addEventListener('input', () => cmp.style.setProperty('--pos', range.value + '%'))

  /* ---------- processo: Accordion Gallery (React Bits, recriado sem React) ---------- */
  {
    const root = $('#steps')
    const panels = $$('.ag-panel', root)
    const count = panels.length
    const opt = { expandRatio: 0.52, duration: 0.6, ease: 'power3.out', parallax: 0.5, tilt: 8, stagger: 0.06, grayscale: true, gap: 10 }
    const g = window.gsap
    const narrow = matchMedia('(max-width: 640px)')
    const hover = matchMedia('(hover: hover)')
    let active = 2
    let mediaSize = 640
    let first = true
    let tl

    const apply = (animate) => {
      const r = Math.min(Math.max(opt.expandRatio, 0.2), 0.9)
      const grow = count > 1 ? (r * (count - 1)) / (1 - r) : 1
      const dur = animate && !calm ? opt.duration : 0
      const v = narrow.matches

      panels.forEach((p, i) => {
        const on = i === active
        p.classList.toggle('ag-panel--active', on)
        if (on) p.setAttribute('aria-current', 'step')
        else p.removeAttribute('aria-current')
      })

      // sem GSAP (CDN fora do ar): aplica o estado final direto
      if (!g) {
        panels.forEach((p, i) => {
          const on = i === active
          p.style.flexGrow = on ? grow : 1
          $('.ag-panel__media', p).style.setProperty('--ag-gray', on ? 0 : 1)
          $('.ag-panel__overlay', p).style.setProperty('--ag-dim', on ? 0 : 0.35)
          $('.ag-panel__bar', p).style.opacity = on ? 1 : 0
          $('.ag-panel__text', p).style.opacity = on ? 1 : 0
          $('.ag-panel__tag', p).style.opacity = on ? 0 : 1
        })
        return
      }

      if (tl) tl.kill()
      tl = g.timeline()
      panels.forEach((p, i) => {
        const on = i === active
        const rot = v || on ? 0 : i < active ? opt.tilt : -opt.tilt
        tl.to(p, { flexGrow: on ? grow : 1, rotateY: rot, duration: dur, ease: opt.ease }, 0)

        const drift = Math.max(-1.5, Math.min(1.5, active - i))
        const shift = drift * opt.parallax * mediaSize * 0.06
        tl.to($('.ag-panel__media', p), {
          xPercent: -50,
          yPercent: -50,
          x: v ? 0 : on ? 0 : shift,
          y: v ? (on ? 0 : shift) : 0,
          '--ag-gray': opt.grayscale ? (on ? 0 : 1) : 0,
          duration: dur,
          ease: opt.ease,
        }, 0)
        tl.to($('.ag-panel__overlay', p), { '--ag-dim': on ? 0 : 0.35, duration: dur, ease: opt.ease }, 0)

        const parts = [$('.ag-panel__bar', p), $('.ag-panel__text', p)]
        const tag = $('.ag-panel__tag', p)
        if (on) {
          tl.to(parts, { opacity: 1, x: 0, duration: dur, ease: opt.ease, stagger: calm ? 0 : opt.stagger }, dur * 0.25)
          tl.to(tag, { opacity: 0, duration: dur * 0.4, ease: opt.ease }, 0)
        } else {
          tl.to(parts, { opacity: 0, x: -14, duration: dur * 0.6, ease: opt.ease }, 0)
          tl.to(tag, { opacity: 1, duration: dur, ease: opt.ease }, 0)
        }
      })
    }

    const measure = () => {
      const rect = root.getBoundingClientRect()
      const total = narrow.matches ? rect.height : rect.width
      const usable = Math.max(total - opt.gap * (count - 1), 120)
      mediaSize = Math.max(140, usable * Math.min(Math.max(opt.expandRatio, 0.2), 0.9) * 1.22)
      root.style.setProperty('--ag-media-size', mediaSize + 'px')
      apply(!first)
    }
    const setActive = (i) => {
      if (i === active) return
      active = i
      apply(true)
    }

    panels.forEach((p, i) => {
      p.addEventListener('mouseenter', () => hover.matches && setActive(i))
      p.addEventListener('focus', () => setActive(i))
      p.addEventListener('click', () => setActive(i))
      p.addEventListener('keydown', (e) => {
        let n = null
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % count
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + count) % count
        if (n !== null) { e.preventDefault(); panels[n].focus() }
      })
    })
    measure()
    first = false
    new ResizeObserver(measure).observe(root)
  }

  /* ---------- simulador de orçamento ---------- */
  const form = $('#sim')
  const area = $('#area')
  const rate = { residencial: 95, interiores: 140, comercial: 110 }
  const brl = (n) => 'R$ ' + nf.format(Math.round(n / 500) * 500)
  const calc = () => {
    const tipo = form.tipo.value
    const m2 = +area.value
    const extras = $$('input[name="extra"]:checked', form).map((c) => c.value)
    const inter = $('input[value="interiores"][name="extra"]', form)
    inter.disabled = tipo === 'interiores'
    inter.closest('.check').style.opacity = inter.disabled ? .4 : 1
    let base = m2 * rate[tipo]
    if (extras.includes('obra')) base *= 1.18
    if (extras.includes('interiores') && !inter.disabled) base *= 1.3
    if (extras.includes('paisagismo')) base += m2 * 22
    $('#areaOut').textContent = m2 + ' m²'
    area.style.setProperty('--fill', ((m2 - area.min) / (area.max - area.min)) * 100 + '%')
    $('#simPrice').textContent = `${brl(base * 0.9)} a ${brl(base * 1.1)}`
    const wk = Math.round(10 + m2 / 22 + (tipo === 'comercial' ? 4 : 0))
    $('#simTime').textContent = `Prazo de projeto: ${wk} a ${wk + 4} semanas`
  }
  form.addEventListener('input', calc)
  calc()

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const msg = $('#simMsg')
    const fields = [form.nome, form.tel]
    let ok = true
    fields.forEach((f) => {
      const bad = f === form.tel ? f.value.replace(/\D/g, '').length < 10 : f.value.trim().length < 2
      f.setAttribute('aria-invalid', bad)
      if (bad && ok) { f.focus(); ok = false }
    })
    if (!ok) { msg.textContent = 'Confira seu nome e um WhatsApp com DDD.'; return }
    const first = form.nome.value.trim().split(' ')[0]
    msg.textContent = `Obrigado, ${first}! Num site real, a Helena chamaria você no WhatsApp para marcar a visita ao terreno.`
    form.nome.value = ''; form.tel.value = ''
  })
})()
