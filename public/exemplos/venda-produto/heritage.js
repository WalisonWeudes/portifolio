// Cerejal: camada "heritage". Rolagem suave, efeitos inspirados no React Bits e as seções da fazenda.
;(function () {
  var html = document.documentElement
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches
  var $ = function (s, r) { return (r || document).querySelector(s) }
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)) }
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)) }

  // ---------- rolagem suave (Lenis), parada enquanto a abertura roda ----------
  var lenis = null
  if (window.Lenis && fine && !reduce) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.95 })
    window.__lenis = lenis
    ;(function raf (t) { lenis.raf(t); requestAnimationFrame(raf) })(0)
    var syncIntro = function () { html.classList.contains('is-intro') ? lenis.stop() : lenis.start() }
    syncIntro()
    new MutationObserver(syncIntro).observe(html, { attributes: true, attributeFilter: ['class'] })
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]')
      if (!a || a.getAttribute('href').length < 2) return
      var t = document.querySelector(a.getAttribute('href'))
      if (!t) return
      e.preventDefault()
      lenis.scrollTo(t, { offset: -70 })
    })
  }

  // ---------- títulos: palavras sobem de trás de uma máscara ----------
  if (!reduce) {
    var heads = $$('main h2')
    heads.forEach(function (h) {
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
    var ho = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-words'); ho.unobserve(e.target) } })
    }, { rootMargin: '0px 0px -12% 0px' })
    heads.forEach(function (h) { ho.observe(h) })
  }

  // ---------- rolagem: fazenda, processo, selos ----------
  var farm = $('.farm')
  var proc = $('.proc')
  var track = proc && $('.proc__track', proc)
  var chaps = proc ? $$('.chap', proc) : []
  var steps = proc ? $$('.proc__steps li', proc) : []
  var stamps = $$('.stamp')
  var wide = matchMedia('(min-width: 901px)')
  var travel = 0

  function measure () {
    if (!proc) return
    if (wide.matches && !reduce) {
      travel = Math.max(0, track.scrollWidth - innerWidth)
      proc.style.height = (innerHeight + travel) + 'px'
    } else {
      travel = 0
      proc.style.height = ''
      track.style.removeProperty('--tx')
    }
  }

  function update () {
    var vh = innerHeight
    if (farm) {
      var r = farm.getBoundingClientRect()
      // 0 quando a fazenda entra por baixo, 1 quando está centralizada
      var fp = clamp((vh - r.top) / (vh * 0.9), 0, 1)
      farm.style.setProperty('--fp', fp.toFixed(3))
    }
    if (proc && travel > 0) {
      var pr = proc.getBoundingClientRect()
      var p = clamp(-pr.top / travel, 0, 1)
      track.style.setProperty('--tx', (-p * travel).toFixed(1) + 'px')
      proc.style.setProperty('--pp', p.toFixed(3))
      var on = Math.round(p * (chaps.length - 1))
      steps.forEach(function (s, i) { s.classList.toggle('is-on', i === on) })
      // cada foto desliza um pouco por dentro da moldura (parallax horizontal)
      chaps.forEach(function (c, i) {
        var cr = c.getBoundingClientRect()
        var d = (cr.left + cr.width / 2 - innerWidth / 2) / innerWidth
        c.style.setProperty('--ix', (d * -8).toFixed(2) + '%')
        c.style.setProperty('--rr', (d * 10).toFixed(2) + 'deg')
      })
    }
    var y = scrollY
    stamps.forEach(function (s) { s.style.setProperty('--rot', (y * 0.08).toFixed(1) + 'deg') })
  }

  if (!reduce) {
    measure(); update()
    addEventListener('scroll', update, { passive: true })
    addEventListener('resize', function () { measure(); update() })
    addEventListener('load', function () { measure(); update() })
    wide.addEventListener && wide.addEventListener('change', function () { measure(); update() })
  } else if (farm) {
    farm.style.setProperty('--fp', 1)
  }

  if (!fine || reduce) return

  // ---------- botões magnéticos (React Bits: Magnet) ----------
  $$('.btn').forEach(function (el) {
    var PAD = 14, S = 0.22
    var host = el.parentElement
    host.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect()
      var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2)
      if (Math.abs(dx) > r.width / 2 + PAD || Math.abs(dy) > r.height / 2 + PAD) { el.style.translate = ''; return }
      el.style.translate = (dx * S).toFixed(1) + 'px ' + (dy * S).toFixed(1) + 'px'
    })
    host.addEventListener('pointerleave', function () { el.style.translate = '' })
  })

  // ---------- cursor: ponto + anel que cresce sobre o que é clicável ----------
  var dot = document.createElement('div'); dot.className = 'cur-dot'; dot.setAttribute('aria-hidden', 'true')
  var ring = document.createElement('div'); ring.className = 'cur-ring'; ring.setAttribute('aria-hidden', 'true')
  document.body.appendChild(ring); document.body.appendChild(dot)
  var mx = -100, my = -100, rx = -100, ry = -100
  addEventListener('pointermove', function (e) {
    mx = e.clientX; my = e.clientY
    dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)'
    var t = e.target.closest && e.target.closest('a, button, label, summary, select, input, .dial, #cup-canvas')
    ring.classList.toggle('is-hover', !!t)
    ring.classList.toggle('is-dark', !!(e.target.closest && e.target.closest('.proc, .footer, .section--green, .farm')))
  }, { passive: true })
  document.addEventListener('pointerleave', function () { ring.classList.add('cur-gone'); dot.classList.add('cur-gone') })
  document.addEventListener('pointerenter', function () { ring.classList.remove('cur-gone'); dot.classList.remove('cur-gone') })
  ;(function follow () {
    rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18
    ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)'
    requestAnimationFrame(follow)
  })()

  // ---------- rastro de fotos na fazenda (React Bits: Image Trail) ----------
  if (farm && farm.dataset.trail) {
    var srcs = farm.dataset.trail.split(' ')
    srcs.forEach(function (s) { var i = new Image(); i.src = s })
    var layer = document.createElement('div'); layer.className = 'trail-layer'; layer.setAttribute('aria-hidden', 'true')
    farm.insertBefore(layer, farm.querySelector('.farm__card'))
    var lx = 0, ly = 0, n = 0
    farm.addEventListener('pointermove', function (e) {
      if (e.target.closest('.farm__card')) return
      var r = farm.getBoundingClientRect()
      var x = e.clientX - r.left, y = e.clientY - r.top
      if (Math.hypot(x - lx, y - ly) < 110) return
      lx = x; ly = y
      var im = document.createElement('img')
      im.src = srcs[n++ % srcs.length]; im.alt = ''
      im.style.left = x + 'px'; im.style.top = y + 'px'
      layer.appendChild(im)
      var rot = (Math.random() * 16 - 8).toFixed(1)
      im.animate([
        { transform: 'translate(-50%,-50%) scale(.5) rotate(' + (rot * 2) + 'deg)', opacity: 0 },
        { transform: 'translate(-50%,-50%) scale(1) rotate(' + rot + 'deg)', opacity: 1, offset: 0.16 },
        { transform: 'translate(-50%,-40%) scale(.92) rotate(' + rot + 'deg)', opacity: 0 }
      ], { duration: 1300, easing: 'cubic-bezier(.16,1,.3,1)' }).onfinish = function () { im.remove() }
    })
  }
})()

// ---------- abertura da fazenda: quando a cortina sobe, a abertura da loja continua ----------
;(function () {
  var html = document.documentElement
  var curtain = document.querySelector('.intro-farm')
  var done = function () {
    if (!html.classList.contains('is-farm')) return
    html.classList.remove('is-farm')
  }
  if (!curtain || !html.classList.contains('is-farm')) { done(); return }
  curtain.addEventListener('animationend', function (e) { if (e.animationName === 'ifOut') done() })
  // pular a abertura (rolar, tocar, teclar) também tira a cortina
  new MutationObserver(function () { if (!html.classList.contains('is-play')) done() }).observe(html, { attributes: true, attributeFilter: ['class'] })
  if (document.hidden) done()
  setTimeout(done, 3600) // garantia
})()
