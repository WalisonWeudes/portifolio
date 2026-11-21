// Dra. Helena Duarte — site de exemplo (médica fictícia)
;(function () {
  var calm = document.documentElement.classList.contains('calm')

  // ---------- cabeçalho e menu ----------
  var header = document.getElementById('header')
  var onScroll = function () { header.classList.toggle('is-scrolled', scrollY > 8) }
  addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  var menuBtn = document.getElementById('menuBtn')
  var menu = document.getElementById('menu')
  var setMenu = function (open) {
    menuBtn.setAttribute('aria-expanded', String(open))
    menu.classList.toggle('is-open', open)
    menuBtn.querySelector('.sr').textContent = open ? 'Fechar menu' : 'Abrir menu'
  }
  menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true') })
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false) })
  addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false) })

  // ---------- mapa do rosto ----------
  var zones = {
    olhar: {
      name: 'Olhar', tag: 'olhar', box: [26, 40, 47, 10],
      lead: 'Linhas ao redor dos olhos, olheiras fundas e aquele ar de cansaço que não passa com uma boa noite de sono.',
      cta: 'Quero avaliar o olhar',
      procs: [
        ['Toxina botulínica', 'Suaviza as linhas da testa e dos “pés de galinha” sem congelar a expressão.', '~20 min · efeito de 4 a 6 meses'],
        ['Preenchimento de olheiras', 'Ácido hialurônico em pouca quantidade para tirar a sombra do sulco.', '~40 min · dura de 9 a 12 meses'],
        ['Skinbooster na região dos olhos', 'Hidratação profunda da pele fina abaixo dos olhos.', '3 sessões · a cada 30 dias'],
      ],
    },
    labios: {
      name: 'Lábios', tag: 'lábios', box: [37, 58, 26, 10],
      lead: 'Contorno pouco definido, lábios finos ou ressecados e as linhas finas que aparecem acima da boca.',
      cta: 'Quero avaliar os lábios',
      procs: [
        ['Preenchimento labial', 'Contorno e volume na medida do seu rosto, com ácido hialurônico.', '~45 min · dura de 9 a 12 meses'],
        ['Hidratação labial', 'Ácido hialurônico mais fluido para lábios ressecados, sem aumentar o volume.', '~30 min · 2 a 3 sessões'],
        ['Linhas acima do lábio', 'Tratamento do “código de barras” com toxina e preenchimento bem fino.', '~40 min · conforme avaliação'],
      ],
    },
    pele: {
      name: 'Pele', tag: 'pele', box: [24, 48, 16, 11],
      lead: 'Perda de firmeza, manchas, poros dilatados e textura irregular: a qualidade da pele muda o rosto inteiro.',
      cta: 'Quero avaliar a pele',
      procs: [
        ['Bioestimulador de colágeno', 'Estimula a produção natural de colágeno para devolver firmeza aos poucos.', '2 a 3 sessões · resultado em 60 a 90 dias'],
        ['Peeling químico', 'Renova a superfície da pele e trata manchas, poros e textura.', '~30 min · série conforme a pele'],
        ['Tratamento de melasma', 'Protocolo combinado de ativos, peelings e cuidados diários.', 'acompanhamento mensal'],
      ],
    },
    contorno: {
      name: 'Contorno', tag: 'contorno', box: [25, 60, 50, 15],
      lead: 'Mandíbula pouco marcada, queixo recuado ou a flacidez que começa a aparecer na linha do rosto.',
      cta: 'Quero avaliar o contorno',
      procs: [
        ['Preenchimento de mandíbula e mento', 'Define o ângulo da mandíbula e equilibra o perfil.', '~60 min · dura de 12 a 18 meses'],
        ['Fios de PDO', 'Fios absorvíveis que dão sustentação e estimulam colágeno.', '~50 min · absorvidos em cerca de 6 meses'],
        ['Bioestimulador no contorno', 'Trata a flacidez inicial da linha da mandíbula.', '2 sessões · intervalo de 60 dias'],
      ],
    },
  }
  var order = ['olhar', 'labios', 'pele', 'contorno']
  var mapLens = document.getElementById('mapLens')
  var lensTag = document.getElementById('lensTag')
  var panel = document.getElementById('zonePanel')
  var panelBody = document.getElementById('panelBody')
  var zoneCta = document.getElementById('zoneCta')
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.zone'))
  var pins = Array.prototype.slice.call(document.querySelectorAll('.pin'))
  var current = 'olhar'
  var swapTimer

  var esc = function (s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] }) }
  var render = function (z) {
    return '<h3 class="panel__title">' + z.name + '</h3>' +
      '<p class="panel__lead">' + esc(z.lead) + '</p>' +
      '<ul class="procs">' + z.procs.map(function (p) {
        return '<li><b>' + esc(p[0]) + '</b><p>' + esc(p[1]) + '</p><span class="meta">' + esc(p[2]) + '</span></li>'
      }).join('') + '</ul>'
  }

  var selectZone = function (key, focus) {
    if (!zones[key]) return
    var z = zones[key]
    var changed = key !== current
    current = key
    mapLens.style.setProperty('--x', z.box[0] + '%')
    mapLens.style.setProperty('--y', z.box[1] + '%')
    mapLens.style.setProperty('--w', z.box[2] + '%')
    mapLens.style.setProperty('--h', z.box[3] + '%')
    lensTag.textContent = z.tag
    tabs.forEach(function (t) {
      var on = t.dataset.zone === key
      t.setAttribute('aria-selected', String(on))
      t.tabIndex = on ? 0 : -1
      if (on) { panel.setAttribute('aria-labelledby', t.id); if (focus) t.focus() }
    })
    pins.forEach(function (p) { p.classList.toggle('is-active', p.dataset.zone === key) })
    zoneCta.firstChild.textContent = z.cta
    zoneCta.dataset.zone = key
    if (!changed) return
    clearTimeout(swapTimer)
    if (calm) { panelBody.innerHTML = render(z); return }
    panelBody.classList.add('is-swapping')
    swapTimer = setTimeout(function () {
      panelBody.innerHTML = render(z)
      panelBody.classList.remove('is-swapping')
    }, 220)
  }

  tabs.forEach(function (t) {
    t.addEventListener('click', function () { selectZone(t.dataset.zone) })
    t.addEventListener('keydown', function (e) {
      var i = order.indexOf(current)
      var next = null
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = order[(i + 1) % order.length]
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = order[(i + order.length - 1) % order.length]
      else if (e.key === 'Home') next = order[0]
      else if (e.key === 'End') next = order[order.length - 1]
      if (next) { e.preventDefault(); selectZone(next, true) }
    })
  })
  pins.forEach(function (p) { p.addEventListener('click', function () { selectZone(p.dataset.zone) }) })
  pins.forEach(function (p) { p.classList.toggle('is-active', p.dataset.zone === current) })

  // o botão do painel já marca a área no formulário
  zoneCta.addEventListener('click', function () {
    var box = document.querySelector('#areaChips input[value="' + (zoneCta.dataset.zone || current) + '"]')
    if (box) box.checked = true
  })


  // ---------- consultório: as fotos abrem em leque ao entrar na tela ----------
  var fan = document.getElementById('fan')
  if ('IntersectionObserver' in window && !calm) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { fan.classList.add('is-in'); io.disconnect() } })
    }, { threshold: .25 })
    io.observe(fan)
  } else fan.classList.add('is-in')

  // ---------- agendamento: monta a mensagem do WhatsApp ----------
  var form = document.getElementById('bookForm')
  var nameInput = document.getElementById('fName')
  var nameErr = document.getElementById('fNameErr')
  var preview = document.getElementById('preview')
  var previewText = document.getElementById('previewText')
  var copyBtn = document.getElementById('copyBtn')
  var copyStatus = document.getElementById('copyStatus')
  var areaNames = { olhar: 'do olhar', labios: 'dos lábios', pele: 'da pele', contorno: 'do contorno do rosto' }

  var joinPt = function (arr) {
    if (arr.length < 2) return arr.join('')
    return arr.slice(0, -1).join(', ') + ' e ' + arr[arr.length - 1]
  }

  nameInput.addEventListener('input', function () {
    if (nameInput.value.trim()) { nameInput.removeAttribute('aria-invalid'); nameErr.hidden = true }
  })

  form.addEventListener('submit', function (e) {
    e.preventDefault()
    var name = nameInput.value.trim()
    if (!name) {
      nameInput.setAttribute('aria-invalid', 'true')
      nameErr.hidden = false
      nameInput.focus()
      return
    }
    var picked = Array.prototype.slice.call(form.querySelectorAll('input[name="area"]:checked')).map(function (i) { return i.value })
    var unsure = picked.indexOf('nao-sei') > -1
    var areas = picked.filter(function (v) { return areaNames[v] }).map(function (v) { return areaNames[v] })
    var period = form.querySelector('input[name="periodo"]:checked').value
    var what = areas.length
      ? 'Gostaria de agendar uma avaliação para cuidar ' + joinPt(areas) + '.'
      : 'Gostaria de agendar uma avaliação.'
    if (unsure && areas.length) what += ' Também quero ouvir sua opinião sobre o que mais vale a pena.'
    if (unsure && !areas.length) what = 'Gostaria de agendar uma avaliação. Ainda não sei bem o que fazer e queria a sua opinião.'
    var msg = 'Olá, Dra. Helena! Meu nome é ' + name + '.\n' + what + '\nPrefiro horários ' + period + '. Quais datas vocês têm?'
    previewText.textContent = msg
    copyStatus.textContent = ''
    preview.hidden = false
    preview.style.animation = 'none'
    void preview.offsetWidth
    preview.style.animation = ''
    preview.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'nearest' })
  })

  copyBtn.addEventListener('click', function () {
    var text = previewText.textContent
    var done = function () { copyStatus.textContent = 'Mensagem copiada.' }
    var fail = function () { copyStatus.textContent = 'Não deu para copiar. Selecione o texto e copie manualmente.' }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fail)
    else fail()
  })
})()

// =================== movimento (v3) ===================
;(function () {
  var html = document.documentElement
  var calm = html.classList.contains('calm')
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches

  // ---------- entrada + abertura da página ----------
  var ready = function () { html.classList.add('is-ready') }
  if (html.classList.contains('intro-play')) {
    var intro = document.getElementById('intro')
    var done = false
    var finish = function (fast) {
      if (done) return
      done = true
      html.classList.add('intro-out')
      ready()
      setTimeout(function () {
        html.classList.remove('intro-play', 'intro-out')
        if (intro) intro.remove()
      }, fast ? 700 : 1300)
      ;['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (t) { removeEventListener(t, skip) })
    }
    var skip = function () { finish(true) }
    setTimeout(finish, 3100)
    ;['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (t) { addEventListener(t, skip, { passive: true }) })
  } else if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { requestAnimationFrame(ready) })
    setTimeout(ready, 1200)
  } else ready()

  // ---------- revelações ao rolar ----------
  var reveals = document.querySelectorAll('[data-reveal]')
  if ('IntersectionObserver' in window && !calm) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target) } })
    }, { threshold: .18, rootMargin: '0px 0px -6% 0px' })
    reveals.forEach(function (el) { io.observe(el) })
  } else reveals.forEach(function (el) { el.classList.add('is-in') })

  // ---------- parallax + trilho do processo ----------
  var heroWord = document.querySelector('.hero__word')
  var heroFig = document.querySelector('.hero__figure')
  var clouds = document.querySelectorAll('.hero__cloud')
  var frames = document.querySelectorAll('.pill, .oval, .steps__art, .faq__art, .about__photo, .footer__art, .about__bg, .quotes')
  var stepsList = document.getElementById('stepsList')
  var rail = document.querySelector('.steps__rail')
  var steps = stepsList ? stepsList.querySelectorAll('li') : []
  var ticking = false
  var update = function () {
    ticking = false
    var vh = innerHeight
    var y = scrollY
    if (!calm) {
      if (y < vh * 1.2) {
        if (heroWord) heroWord.style.setProperty('--py', (y * .18).toFixed(1) + 'px')
        if (heroFig) heroFig.style.setProperty('--py', (y * -.22).toFixed(1) + 'px')
        clouds.forEach(function (cl, k) { cl.style.setProperty('--py', (y * [-.08, -.32, -.16][k]).toFixed(1) + 'px') })
      }
      frames.forEach(function (f) {
        var r = f.getBoundingClientRect()
        if (r.bottom < -100 || r.top > vh + 100) return
        var d = (r.top + r.height / 2 - vh / 2) / vh
        f.style.setProperty('--py', (d * -26).toFixed(1) + 'px')
      })
    }
    if (stepsList && rail) {
      var r2 = stepsList.getBoundingClientRect()
      var p = Math.min(1, Math.max(0, (vh * .78 - r2.top) / (r2.height + vh * .25)))
      if (calm) p = 1
      rail.style.setProperty('--p', p.toFixed(3))
      steps.forEach(function (li, i) { li.classList.toggle('is-on', p >= i / steps.length + .02) })
    }
  }
  var onScroll = function () { update() }
  addEventListener('scroll', onScroll, { passive: true })
  addEventListener('resize', onScroll)
  update()

  // ---------- especialidades: o nome escolhido troca a imagem ----------
  var specBtns = document.querySelectorAll('.spec')
  var specImgs = document.querySelectorAll('.specs__frame img, .specs__bgs img')
  var specDesc = document.getElementById('specsDesc')
  var specData = []
  try { specData = JSON.parse(document.getElementById('specsData').textContent) } catch (e) {}
  var showSpec = function (i) {
    specBtns.forEach(function (b) { var on = +b.dataset.i === i; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', String(on)) })
    specImgs.forEach(function (im) { im.classList.toggle('is-active', +im.dataset.i === i) })
    if (specDesc && specData[i]) specDesc.textContent = specData[i]
  }
  specBtns.forEach(function (b) {
    var i = +b.dataset.i
    b.addEventListener('click', function () { showSpec(i) })
    b.addEventListener('focus', function () { showSpec(i) })
    if (finePointer) b.addEventListener('pointerenter', function () { showSpec(i) })
  })
  // carrega as outras imagens da galeria quando a seção se aproxima
  specImgs.forEach(function (im) { im.loading = 'eager' })

  // ---------- inclinação 3D nas molduras ----------
  if (finePointer && !calm) {
    document.querySelectorAll('.tilt').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect()
        var x = (e.clientX - r.left) / r.width - .5
        var y = (e.clientY - r.top) / r.height - .5
        el.style.setProperty('--ry', (x * 8).toFixed(2) + 'deg')
        el.style.setProperty('--rx', (y * -8).toFixed(2) + 'deg')
      })
      el.addEventListener('pointerleave', function () { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg') })
    })
  }
})()

// =================== texto em arco (inspirado no "Curved Loop" do React Bits) ===================
// Corre sozinho sobre a curva; arrastar faz girar com inércia; a rolagem da página acelera.
;(function () {
  var root = document.getElementById('loop')
  var tp = document.getElementById('loopTP')
  var measure = root && root.querySelector('.loop__measure')
  if (!root || !tp || !measure) return
  var calm = document.documentElement.classList.contains('calm')
  var unitHTML = tp.innerHTML
  var unit = 0
  var offset = 0
  var dir = -1          // -1 = para a esquerda
  var base = 22         // velocidade em unidades do SVG por segundo
  var last = 0
  var boost = 0         // ganho vindo da rolagem ou do arrasto
  var dragging = false
  var lastX = 0
  var vx = 0
  var hover = false
  var raf = 0

  var build = function () {
    unit = measure.getComputedTextLength()
    if (!unit) return false
    var path = document.getElementById('loopPath')
    var len = path.getTotalLength ? path.getTotalLength() : 2000
    var copies = Math.ceil(len / unit) + 2
    var html = ''
    for (var i = 0; i < copies; i++) html += unitHTML
    tp.innerHTML = html
    offset = -unit
    tp.setAttribute('startOffset', offset)
    return true
  }

  var wrap = function () {
    if (offset > 0) offset -= unit
    if (offset < -unit) offset += unit
  }

  var tick = function (t) {
    raf = requestAnimationFrame(tick)
    var dt = last ? Math.min(.05, (t - last) / 1000) : 0   // segundos desde o último quadro
    last = t
    if (!dragging) {
      var speed = hover ? base * .3 : base
      offset += (dir * speed + boost) * dt
      boost *= Math.pow(.2, dt)                             // o empurrão some em ~1 s
      if (Math.abs(boost) < .5) boost = 0
    }
    wrap()
    tp.setAttribute('startOffset', offset.toFixed(2))
  }

  // a escala entre pixels da tela e unidades do SVG
  var scale = function () { var r = root.querySelector('svg').getBoundingClientRect(); return 1440 / (r.width || 1440) }

  root.addEventListener('pointerdown', function (e) {
    dragging = true
    lastX = e.clientX
    vx = 0
    root.classList.add('is-drag')
    root.setPointerCapture && root.setPointerCapture(e.pointerId)
  })
  root.addEventListener('pointermove', function (e) {
    if (!dragging) return
    var dx = (e.clientX - lastX) * scale()
    lastX = e.clientX
    offset += dx
    vx = dx
  })
  var release = function () {
    if (!dragging) return
    dragging = false
    root.classList.remove('is-drag')
    if (Math.abs(vx) > .3) { dir = vx > 0 ? 1 : -1; boost = Math.max(-260, Math.min(260, vx * 22)) }
  }
  root.addEventListener('pointerup', release)
  root.addEventListener('pointercancel', release)
  root.addEventListener('pointerenter', function () { hover = true })
  root.addEventListener('pointerleave', function () { hover = false; release() })

  // rolar a página dá um empurrão no texto, na direção atual
  var lastY = scrollY
  addEventListener('scroll', function () {
    var dy = scrollY - lastY
    lastY = scrollY
    if (!dragging) boost = Math.max(-120, Math.min(120, boost + dir * Math.min(40, Math.abs(dy) * .5)))
  }, { passive: true })

  var start = function () {
    if (!build()) return
    if (calm) return  // movimento reduzido: o texto fica parado no arco
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(tick)
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start)
  else start()
  var rt
  addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { tp.innerHTML = unitHTML; start() }, 200) })
})()

// =================== rolagem que conduz a leitura ===================
// abertura que se abre, frases que acendem palavra por palavra,
// leque do consultório comandado pela rolagem e fio de leitura dourado
;(function () {
  var html = document.documentElement
  var calm = html.classList.contains('calm')
  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v }

  // separa as frases em palavras, preservando o itálico
  var wordBlocks = []
  document.querySelectorAll('[data-words]').forEach(function (el) {
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment()
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return }
            var s = document.createElement('span')
            s.className = 'w'
            s.textContent = part
            frag.appendChild(s)
          })
          n.parentNode.replaceChild(frag, n)
        } else if (n.nodeType === 1) walk(n)
      })
    }
    walk(el)
    wordBlocks.push({ el: el, words: el.querySelectorAll('.w'), lit: -1 })
  })
  if (calm) wordBlocks.forEach(function (b) { b.words.forEach(function (w) { w.classList.add('on') }) })

  var hero = document.querySelector('.hero')
  var fan = document.getElementById('fan')
  var thread = document.querySelector('.thread')
  var wide = matchMedia('(min-width: 861px)')

  var ticking = false
  var update = function () {
    ticking = false
    var vh = innerHeight
    var y = scrollY

    // abertura: as letras se afastam como cortina
    if (hero && !calm) {
      var hp = clamp(y / (vh * .8))
      hero.style.setProperty('--hp', hp.toFixed(3))
    }

    // frases: acendem conforme passam pela tela
    if (!calm) wordBlocks.forEach(function (b) {
      var r = b.el.getBoundingClientRect()
      var p = clamp((vh * .88 - r.top) / (vh * .55))
      var n = Math.round(p * b.words.length)
      if (n === b.lit) return
      b.lit = n
      b.words.forEach(function (w, i) { w.classList.toggle('on', i < n) })
    })

    // leque: empilhado no centro, abre com a rolagem
    if (fan) {
      if (calm || !wide.matches) fan.style.setProperty('--p', 1)
      else {
        var fr = fan.getBoundingClientRect()
        fan.style.setProperty('--p', clamp((vh - fr.top) / (vh * .75)).toFixed(3))
      }
    }

    // fio de leitura
    if (thread) {
      var max = document.documentElement.scrollHeight - vh
      thread.style.setProperty('--t', clamp(max > 0 ? y / max : 0).toFixed(4))
    }
  }
  var onScroll = function () { update() }
  addEventListener('scroll', onScroll, { passive: true })
  addEventListener('resize', onScroll)
  update()
})()

// =================== processo: a etapa ativa segue a rolagem ===================
;(function () {
  var pin = document.getElementById('stepsPin')
  if (!pin) return
  var wide = matchMedia('(min-width: 861px)')
  var groups = ['.steps__big', '.steps__story li', '.steps__frame img', '.steps__dot'].map(function (s) { return pin.querySelectorAll(s) })
  var progress = pin.querySelector('.steps__progress')
  var imgs = Array.prototype.slice.call(pin.querySelectorAll('.steps__frame img'))
  var HEADER = 72
  var current = -1
  var total = function () { return pin.offsetHeight - (innerHeight - HEADER) }
  var setActive = function (i) {
    if (i === current) return
    current = i
    groups.forEach(function (list) { list.forEach(function (el) { el.classList.toggle('is-on', +el.dataset.i === i); el.classList.toggle('is-past', +el.dataset.i < i) }) })
  }
  var update = function () {
    if (!wide.matches) return
    var r = pin.getBoundingClientRect()
    var p = Math.min(1, Math.max(0, (HEADER - r.top) / total()))
    progress.style.setProperty('--p', p.toFixed(3))
    setActive(Math.min(3, Math.floor(p * 4)))
    // fotos: a seguinte desliza da direita no ritmo da rolagem; a anterior recua um pouco
    var x = p * 4, W = .45
    imgs.forEach(function (img, i) {
      var tIn = i === 0 ? 1 : Math.min(1, Math.max(0, (x - (i - W / 2)) / W))
      var tOut = i === imgs.length - 1 ? 0 : Math.min(1, Math.max(0, (x - (i + 1 - W / 2)) / W))
      img.style.transform = 'translate3d(' + ((1 - tIn) * 100 - tOut * 22).toFixed(2) + '%,0,0) scale(1.04)'
    })
  }
  addEventListener('scroll', update, { passive: true })
  addEventListener('resize', update)
  update()
  pin.querySelectorAll('.steps__dot').forEach(function (b) {
    b.addEventListener('click', function () {
      var i = +b.dataset.i
      var top = pin.getBoundingClientRect().top + scrollY - HEADER
      var y = top + total() * (i + .5) / 4
      if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.2 })
      else scrollTo({ top: y, behavior: document.documentElement.classList.contains('calm') ? 'auto' : 'smooth' })
    })
  })
})()

// =================== foto em arco que se abre com a rolagem ===================
;(function () {
  var pin = document.getElementById('unveil')
  if (!pin) return
  var calm = document.documentElement.classList.contains('calm')
  var update = function () {
    var r = pin.getBoundingClientRect()
    var total = pin.offsetHeight - innerHeight
    var q = calm ? 1 : Math.min(1, Math.max(0, -r.top / (total || 1)))
    pin.style.setProperty('--q', q.toFixed(3))
  }
  addEventListener('scroll', update, { passive: true })
  addEventListener('resize', update)
  update()
})()

// =================== depoimentos: foto e cartão entram com a rolagem ===================
;(function () {
  var sec = document.getElementById('depoimentos')
  if (!sec) return
  var calm = document.documentElement.classList.contains('calm')
  var update = function () {
    if (calm) { sec.style.setProperty('--qp', 1); return }
    var r = sec.getBoundingClientRect()
    var vh = innerHeight
    var qp = Math.min(1, Math.max(0, (vh - r.top) / (vh * .8)))
    sec.style.setProperty('--qp', qp.toFixed(3))
  }
  addEventListener('scroll', update, { passive: true })
  addEventListener('resize', update)
  update()
})()

// =================== depoimentos: a rolagem move a galeria para o lado ===================
;(function () {
  var pin = document.getElementById('quotesPin')
  if (!pin) return
  var wide = matchMedia('(min-width: 861px)')
  var HEADER = 72
  var update = function () {
    if (!wide.matches) { pin.style.setProperty('--hq', 0); return }
    var r = pin.getBoundingClientRect()
    var total = pin.offsetHeight - (innerHeight - HEADER)
    var p = Math.min(1, Math.max(0, (HEADER - r.top) / (total || 1)))
    // pausa curta no começo e no fim para ler o título e o último depoimento parados
    var hq = Math.min(1, Math.max(0, (p - .1) / .8))
    pin.style.setProperty('--hq', hq.toFixed(4))
  }
  addEventListener('scroll', update, { passive: true })
  addEventListener('resize', update)
  update()
})()

// =================== rolagem suave com inércia (Lenis), só com mouse ===================
;(function () {
  var html = document.documentElement
  if (html.classList.contains('calm') || !window.Lenis || !matchMedia('(hover: hover) and (pointer: fine)').matches) return
  var lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.95 })
  window.__lenis = lenis
  var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf) }
  requestAnimationFrame(raf)

  // parada enquanto a entrada está na tela
  if (html.classList.contains('intro-play')) {
    lenis.stop()
    var mo = new MutationObserver(function () {
      if (!html.classList.contains('intro-play')) { lenis.start(); mo.disconnect() }
    })
    mo.observe(html, { attributes: true, attributeFilter: ['class'] })
  }

  // links do menu e botões internos usam a mesma rolagem suave
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]')
    if (!a) return
    var id = a.getAttribute('href')
    if (id.length < 2) return
    var target = document.querySelector(id)
    if (!target) return
    e.preventDefault()
    lenis.scrollTo(target, { offset: -72, duration: 1.4 })
  })
})()

// =================== efeitos inspirados no React Bits (reactbits.dev), versões próprias ===================
;(function () {
  var html = document.documentElement
  var calm = html.classList.contains('calm')
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches
  var SPARK = 'M12 0c.6 6.6 4.4 10.9 12 12-7.6 1.1-11.4 5.4-12 12-.6-6.6-4.4-10.9-12-12 7.6-1.1 11.4-5.4 12-12z'

  // ---------- Masked Heading: palavras sobem de trás de uma máscara ----------
  if (!calm) {
    document.querySelectorAll('.h2[data-reveal]:not([data-words])').forEach(function (h) {
      var k = 0
      var walk = function (node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var frag = document.createDocumentFragment()
            n.textContent.split(/(\s+)/).forEach(function (part) {
              if (!part) return
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return }
              var o = document.createElement('span'); o.className = 'mw'
              var i = document.createElement('span'); i.className = 'mw__in'; i.style.setProperty('--wi', k++)
              i.textContent = part; o.appendChild(i); frag.appendChild(o)
            })
            n.parentNode.replaceChild(frag, n)
          } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n)
        })
      }
      walk(h)
      h.classList.add('is-split')
    })
  }

  if (calm || !fine) return

  // ---------- Magnet: botões puxados na direção do mouse ----------
  document.querySelectorAll('.btn, .nav__cta').forEach(function (el) {
    var PAD = 40, S = .28
    var move = function (e) {
      var r = el.getBoundingClientRect()
      var cx = r.left + r.width / 2, cy = r.top + r.height / 2
      var dx = e.clientX - cx, dy = e.clientY - cy
      if (Math.abs(dx) > r.width / 2 + PAD || Math.abs(dy) > r.height / 2 + PAD) { el.style.transform = ''; return }
      el.style.transform = 'translate3d(' + (dx * S).toFixed(1) + 'px,' + (dy * S).toFixed(1) + 'px,0)'
    }
    el.parentElement.addEventListener('pointermove', move)
    el.parentElement.addEventListener('pointerleave', function () { el.style.transform = '' })
  })

  // ---------- Click Spark: faíscas douradas no clique ----------
  addEventListener('click', function (e) {
    for (var i = 0; i < 8; i++) {
      var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('class', 'spark-fx')
      s.innerHTML = '<path d="' + SPARK + '"/>'
      var size = 7 + Math.random() * 7
      s.style.cssText = 'left:' + e.clientX + 'px;top:' + e.clientY + 'px;width:' + size + 'px;height:' + size + 'px'
      document.body.appendChild(s)
      var a = (Math.PI * 2 * i) / 8 + Math.random() * .4, d = 26 + Math.random() * 22
      s.animate([
        { transform: 'translate(-50%,-50%) scale(1) rotate(0deg)', opacity: 1 },
        { transform: 'translate(calc(-50% + ' + Math.cos(a) * d + 'px), calc(-50% + ' + Math.sin(a) * d + 'px)) scale(.2) rotate(90deg)', opacity: 0 }
      ], { duration: 620, easing: 'cubic-bezier(.16,1,.3,1)' }).onfinish = (function (el) { return function () { el.remove() } })(s)
    }
  })

  // ---------- Target Cursor: anel dourado que acompanha e cresce sobre o que é clicável ----------
  var ring = document.createElement('div'); ring.className = 'cursor-ring'; ring.setAttribute('aria-hidden', 'true')
  var dot = document.createElement('div'); dot.className = 'cursor-dot'; dot.setAttribute('aria-hidden', 'true')
  document.body.appendChild(ring); document.body.appendChild(dot)
  var mx = -100, my = -100, rx = -100, ry = -100
  addEventListener('pointermove', function (e) {
    mx = e.clientX; my = e.clientY
    dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)'
    var t = e.target.closest && e.target.closest('a, button, .spec, .zone, .pin, .tilt, label, summary, .loop, input')
    ring.classList.toggle('is-hover', !!t)
  }, { passive: true })
  document.addEventListener('pointerleave', function () { ring.classList.add('is-gone'); dot.classList.add('is-gone') })
  document.addEventListener('pointerenter', function () { ring.classList.remove('is-gone'); dot.classList.remove('is-gone') })
  ;(function follow () {
    rx += (mx - rx) * .18; ry += (my - ry) * .18
    ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)'
    requestAnimationFrame(follow)
  })()

  // ---------- Image Trail: rastro de fotos no consultório ----------
  var place = document.getElementById('consultorio')
  if (place) {
    var srcs = Array.prototype.map.call(place.querySelectorAll('.fan img'), function (i) { return i.currentSrc || i.src })
    var layer = document.createElement('div'); layer.className = 'trail'; layer.setAttribute('aria-hidden', 'true')
    place.insertBefore(layer, place.firstChild)
    var lx = 0, ly = 0, n = 0
    place.addEventListener('pointermove', function (e) {
      if (e.target.closest('.place__grid')) return   // não atrapalha endereço e mapa
      var r = place.getBoundingClientRect()
      var x = e.clientX - r.left, y = e.clientY - r.top
      if (Math.hypot(x - lx, y - ly) < 90) return
      lx = x; ly = y
      var im = document.createElement('img')
      im.src = srcs[n++ % srcs.length]; im.alt = ''
      im.style.left = x + 'px'; im.style.top = y + 'px'
      layer.appendChild(im)
      im.animate([
        { transform: 'translate(-50%,-50%) scale(.6) rotate(-6deg)', opacity: 0 },
        { transform: 'translate(-50%,-50%) scale(1) rotate(0deg)', opacity: 1, offset: .18 },
        { transform: 'translate(-50%,-50%) scale(.9) rotate(3deg)', opacity: 0 }
      ], { duration: 1100, easing: 'cubic-bezier(.16,1,.3,1)' }).onfinish = function () { im.remove() }
    })
  }
})()
