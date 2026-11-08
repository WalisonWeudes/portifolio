// Cerejal Cafés Especiais — página de venda de exemplo (loja fictícia)
document.documentElement.classList.add('js')

const $ = (s, el = document) => el.querySelector(s)
const $$ = (s, el = document) => [...el.querySelectorAll(s)]
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const brl = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const pic = (id, w = 600, h = 600) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=70`

/* ---------- dados ---------- */
const MOAGENS = {
  graos: 'Em grãos · para moer em casa',
  grossa: 'Moagem grossa · prensa francesa',
  mediagrossa: 'Moagem média-grossa · Chemex',
  media: 'Moagem média · coado',
  fina: 'Moagem fina · espresso e moka',
}

const PRODUTOS = [
  { id: 'mantiqueira', cat: 'cafe', nome: 'Cerejal Mantiqueira', notas: 'Caramelo, laranja e chocolate ao leite', info: '250 g · torra média · 86 pts', tag: 'Mais vendido', preco: 54.9, img: 'photo-1695245503558-5cdb37f49092', nota: 4.9, avaliacoes: 812 },
  { id: 'boavista', cat: 'cafe', nome: 'Sítio Boa Vista Natural', notas: 'Frutas vermelhas, mel e cacau', info: '250 g · torra clara · 88 pts', tag: 'Microlote', preco: 64.9, img: 'photo-1562051036-e0eea191d42f', nota: 4.9, avaliacoes: 301 },
  { id: 'cerrado', cat: 'cafe', nome: 'Cerrado Intenso', notas: 'Cacau, castanhas e açúcar mascavo', info: '250 g · torra escura · 84 pts', preco: 46.9, img: 'photo-1606791405792-1004f1718d0c', nota: 4.8, avaliacoes: 540 },
  { id: 'coado500', cat: 'cafe', nome: 'Coado do Dia', notas: 'Equilibrado, para o café de todo dia', info: '500 g · torra média · 83 pts', tag: 'Leva mais', preco: 69.9, img: 'photo-1521677446241-d182a96ec49f', nota: 4.7, avaliacoes: 960 },
  { id: 'v60', cat: 'acessorios', nome: 'Coador cerâmico tipo V60', notas: 'Tamanho 02, para até 4 xícaras', info: 'Acompanha 40 filtros', preco: 119, img: 'photo-1759259639356-7c6e74eed1ec', nota: 4.9, avaliacoes: 188 },
  { id: 'prensa', cat: 'acessorios', nome: 'Prensa francesa 600 ml', notas: 'Vidro resistente ao calor e filtro de aço', info: 'Para 3 xícaras', preco: 149, img: 'photo-1519082274554-1ca37fb8abb7', nota: 4.8, avaliacoes: 142 },
  { id: 'moedor', cat: 'acessorios', nome: 'Moedor elétrico de mós', notas: '31 pontos de moagem, do espresso à prensa', info: 'Garantia de 1 ano', preco: 489, img: 'photo-1461988279488-1dac181a78f9', nota: 4.7, avaliacoes: 96 },
  { id: 'kit', cat: 'kits', nome: 'Kit Presente Cerejal', notas: 'Dois cafés de 250 g e caneca de cerâmica', info: 'Vem em caixa para presente', tag: 'Presente', preco: 139.9, img: 'photo-1625206950954-b402705f836e', nota: 5.0, avaliacoes: 233 },
]
const EXTRA = {
  clube: { id: 'clube', nome: 'Clube Cerejal (1º mês)', preco: 93.3, img: 'photo-1782931171832-6227ac510e72' },
}
const porId = (id) => PRODUTOS.find((p) => p.id === id) || EXTRA[id]

/* ---------- seletor de moagem (substitui o menu padrão do navegador) ---------- */
// O <select> continua na página, escondido, guardando o valor; por cima vai um botão com lista.
// Cada opção mostra um desenho do tamanho do grão, o nome e o método de preparo.
const TAMANHO_ICONE = { grossa: [3.4, 3], mediagrossa: [2.6, 5], media: [1.9, 8], fina: [1.1, 16] }
function icone(valor) {
  if (valor === 'graos')
    return '<svg viewBox="0 0 28 28" aria-hidden="true"><ellipse cx="14" cy="14" rx="7" ry="9.5" fill="#6e4329" transform="rotate(-25 14 14)"/><path d="M11 6.5c-2.5 5-.5 10.5 5.5 15" fill="none" stroke="#fff4f0" stroke-width="1.6" stroke-linecap="round"/></svg>'
  const [r, n] = TAMANHO_ICONE[valor]
  let pts = ''
  for (let i = 0; i < n; i++) {
    const a = i * 2.4
    const d = 2.4 * Math.sqrt(i + 0.5) * (r + 0.6)
    pts += `<circle cx="${(14 + Math.cos(a) * d).toFixed(1)}" cy="${(14 + Math.sin(a) * d).toFixed(1)}" r="${r}" fill="${i % 2 ? '#5a3622' : '#7d4e2f'}"/>`
  }
  return `<svg viewBox="0 0 28 28" aria-hidden="true">${pts}</svg>`
}

let ddId = 0
function seletor(select) {
  if (select.dataset.dd) return
  select.dataset.dd = '1'
  const id = `dd-${++ddId}`
  const box = document.createElement('div')
  box.className = 'dd'
  select.after(box)
  box.appendChild(select)
  select.classList.add('dd__native')
  select.tabIndex = -1
  select.setAttribute('aria-hidden', 'true')

  const parte = (o) => {
    const [titulo, metodo] = o.textContent.split(' · ')
    return { titulo, metodo: metodo || '' }
  }
  const nomeAcessivel = select.labels?.[0]?.textContent.trim() || 'Moagem'

  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'dd__btn'
  btn.setAttribute('aria-haspopup', 'listbox')
  btn.setAttribute('aria-expanded', 'false')
  btn.setAttribute('aria-controls', id)
  const lista = document.createElement('ul')
  lista.className = 'dd__list'
  lista.id = id
  lista.setAttribute('role', 'listbox')
  lista.setAttribute('aria-label', nomeAcessivel)
  lista.tabIndex = -1
  lista.hidden = true
  lista.innerHTML = [...select.options]
    .map((o, i) => {
      const { titulo, metodo } = parte(o)
      return `<li role="option" id="${id}-${i}" data-value="${o.value}" aria-selected="false">${icone(o.value)}<span><b>${titulo}</b>${metodo ? `<small>${metodo}</small>` : ''}</span><svg class="dd__check" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-check"/></svg></li>`
    })
    .join('')
  box.append(btn, lista)
  const itens = $$('[role="option"]', lista)
  let ativo = 0

  function pintar() {
    const o = select.selectedOptions[0]
    const { titulo, metodo } = parte(o)
    btn.innerHTML = `${icone(o.value)}<span><b>${titulo}</b>${metodo ? `<small>${metodo}</small>` : ''}</span><svg class="dd__chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
    btn.setAttribute('aria-label', `${nomeAcessivel}: ${o.textContent}`)
    itens.forEach((li) => li.setAttribute('aria-selected', String(li.dataset.value === select.value)))
  }
  function marcar(i) {
    ativo = (i + itens.length) % itens.length
    itens.forEach((li, k) => li.classList.toggle('is-active', k === ativo))
    lista.setAttribute('aria-activedescendant', itens[ativo].id)
    itens[ativo].scrollIntoView({ block: 'nearest' })
  }
  function abrir() {
    // abre para cima quando não há espaço embaixo na tela
    const r = btn.getBoundingClientRect()
    // no cartão do produto em destaque a lista sempre abre para cima, para não ser cortada pelo palco
    box.classList.toggle('dd--up', !!box.closest('.stage') || (innerHeight - r.bottom < 300 && r.top > 300))
    lista.hidden = false
    box.classList.add('is-open')
    btn.setAttribute('aria-expanded', 'true')
    marcar(select.selectedIndex)
    lista.focus()
  }
  function fechar(foco = true) {
    lista.hidden = true
    box.classList.remove('is-open')
    btn.setAttribute('aria-expanded', 'false')
    if (foco) btn.focus()
  }
  function escolher(i) {
    select.selectedIndex = i
    select.dispatchEvent(new Event('change', { bubbles: true }))
    pintar()
    fechar()
  }

  btn.addEventListener('click', () => (lista.hidden ? abrir() : fechar()))
  btn.addEventListener('keydown', (ev) => {
    if (['ArrowDown', 'ArrowUp'].includes(ev.key)) {
      ev.preventDefault()
      abrir()
    }
  })
  lista.addEventListener('keydown', (ev) => {
    const teclas = { ArrowDown: 1, ArrowUp: -1 }
    if (ev.key in teclas) {
      ev.preventDefault()
      marcar(ativo + teclas[ev.key])
    } else if (ev.key === 'Home' || ev.key === 'End') {
      ev.preventDefault()
      marcar(ev.key === 'Home' ? 0 : itens.length - 1)
    } else if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault()
      escolher(ativo)
    } else if (ev.key === 'Escape') {
      ev.preventDefault()
      ev.stopPropagation()
      fechar()
    } else if (ev.key === 'Tab') {
      fechar(false)
    }
  })
  lista.addEventListener('click', (ev) => {
    const li = ev.target.closest('[role="option"]')
    if (li) escolher(itens.indexOf(li))
  })
  lista.addEventListener('pointermove', (ev) => {
    const li = ev.target.closest('[role="option"]')
    if (li) marcar(itens.indexOf(li))
  })
  document.addEventListener('pointerdown', (ev) => {
    if (!lista.hidden && !box.contains(ev.target)) fechar(false)
  })
  select.addEventListener('change', pintar)
  pintar()
}

const FRETE = 19.9
const FRETE_GRATIS = 150

/* ---------- cabeçalho e menu ---------- */
const header = $('.header')
const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 10)
addEventListener('scroll', onScroll, { passive: true })
onScroll()

const toggle = $('.menu-toggle')
const menu = $('#menu')
function setMenu(open) {
  toggle.setAttribute('aria-expanded', String(open))
  toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu')
  menu.classList.toggle('is-open', open)
}
toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'))
$$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)))

/* ---------- carrinho ---------- */
// guardado só no navegador de quem visita, para não perder ao recarregar
let cart = []
try {
  cart = JSON.parse(localStorage.getItem('cerejal-cart') || '[]')
} catch {
  cart = []
}
const save = () => {
  try {
    localStorage.setItem('cerejal-cart', JSON.stringify(cart))
  } catch {
    /* sem armazenamento: o carrinho vale só nesta visita */
  }
}

function addToCart(id, opts = {}) {
  const p = porId(id)
  const key = [id, opts.moagem || '', opts.torra || ''].join('|')
  const line = cart.find((l) => l.key === key)
  if (line) line.qtd += 1
  else cart.push({ key, id, moagem: opts.moagem || '', torra: opts.torra || '', qtd: 1 })
  save()
  renderCart()
  const btn = $('.cart-btn')
  btn.classList.remove('is-bump')
  void btn.offsetWidth
  btn.classList.add('is-bump')
  toast(`${p.nome} no carrinho`)
}

function lineLabel(l) {
  const parts = []
  if (l.torra) parts.push(`Torra ${l.torra === 'media' ? 'média' : l.torra}`)
  if (l.moagem) parts.push(MOAGENS[l.moagem].split(' · ')[0])
  return parts.join(' · ')
}

function renderCart() {
  const items = $('#cart-items')
  const count = cart.reduce((s, l) => s + l.qtd, 0)
  const sub = cart.reduce((s, l) => s + porId(l.id).preco * l.qtd, 0)
  const frete = sub === 0 || sub >= FRETE_GRATIS ? 0 : FRETE
  const total = sub + frete

  $('#cart-count').textContent = count
  $('.cart-btn').setAttribute('aria-label', `Abrir carrinho, ${count} ${count === 1 ? 'item' : 'itens'}`)
  $('#cart-empty').hidden = count > 0
  $('#cart-foot').hidden = count === 0
  items.hidden = count === 0

  items.innerHTML = cart
    .map((l) => {
      const p = porId(l.id)
      return `<li class="line">
        <img src="${pic(p.img, 160, 160)}" width="72" height="72" alt="" />
        <div class="line__info">
          <b>${p.nome}</b>
          ${lineLabel(l) ? `<span>${lineLabel(l)}</span>` : ''}
          <div class="qty" role="group" aria-label="Quantidade de ${p.nome}">
            <button type="button" data-qty="-1" data-key="${l.key}" aria-label="Diminuir"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-minus"/></svg></button>
            <output>${l.qtd}</output>
            <button type="button" data-qty="1" data-key="${l.key}" aria-label="Aumentar"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-plus"/></svg></button>
          </div>
        </div>
        <div class="line__end">
          <span class="line__price">${brl(p.preco * l.qtd)}</span>
          <button type="button" class="line__rm" data-rm="${l.key}" aria-label="Remover ${p.nome}"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-trash"/></svg></button>
        </div>
      </li>`
    })
    .join('')

  // barra do frete grátis
  const falta = Math.max(0, FRETE_GRATIS - sub)
  $('#ship').classList.toggle('is-free', falta === 0 && sub > 0)
  $('#ship-text').innerHTML =
    sub === 0 ? `Frete grátis em compras acima de <b>${brl(FRETE_GRATIS)}</b>` : falta === 0 ? 'Você ganhou frete grátis' : `Faltam <b>${brl(falta)}</b> para o frete grátis`
  $('#ship-bar').style.width = Math.min(100, (sub / FRETE_GRATIS) * 100) + '%'

  $('#cart-sub').textContent = brl(sub)
  $('#cart-ship').textContent = frete === 0 ? 'Grátis' : brl(frete)
  $('#cart-total').textContent = brl(total)
  $('#cart-pix').textContent = brl(total * 0.95)
}

$('#cart-items').addEventListener('click', (ev) => {
  const q = ev.target.closest('[data-qty]')
  const rm = ev.target.closest('[data-rm]')
  if (q) {
    const l = cart.find((x) => x.key === q.dataset.key)
    l.qtd += Number(q.dataset.qty)
    if (l.qtd <= 0) cart = cart.filter((x) => x !== l)
  } else if (rm) {
    cart = cart.filter((x) => x.key !== rm.dataset.rm)
  } else return
  save()
  renderCart()
  if (!cart.length) $('[data-close-cart].btn', drawer)?.focus()
})

const drawer = $('#carrinho')
let lastFocus = null
function openCart() {
  lastFocus = document.activeElement
  drawer.hidden = false
  document.body.classList.add('is-locked')
  $('.drawer__head .icon-btn').focus()
}
function closeCart() {
  drawer.hidden = true
  document.body.classList.remove('is-locked')
  lastFocus?.focus()
}
$$('[data-open-cart]').forEach((b) => b.addEventListener('click', openCart))
$$('[data-close-cart]').forEach((b) => b.addEventListener('click', closeCart))
addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape' && !drawer.hidden) closeCart()
})

const demo = $('#demo-dialog')
$('#checkout').addEventListener('click', () => demo.showModal())
$('[data-close-demo]').addEventListener('click', () => demo.close())

/* aviso curto ao adicionar */
const toastEl = $('#toast')
let toastTimer
function toast(msg) {
  toastEl.innerHTML = `<span>${msg}</span><button type="button">Ver carrinho</button>`
  $('button', toastEl).addEventListener('click', () => {
    toastEl.classList.remove('is-on')
    openCart()
  })
  toastEl.classList.add('is-on')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 3200)
}

/* ---------- produto em destaque: torra ---------- */
const TORRAS = {
  clara: { palavra: 'FRUTADO', banda: 'Torra clara', notas: 'laranja · mel · frutas amarelas', texto: 'Laranja, mel e frutas amarelas' },
  media: { palavra: 'CARAMELO', banda: 'Torra média', notas: 'caramelo · laranja · chocolate ao leite', texto: 'Caramelo, laranja e chocolate ao leite' },
  escura: { palavra: 'CHOCOLATE', banda: 'Torra escura', notas: 'chocolate amargo · castanhas · melaço', texto: 'Chocolate amargo, castanhas e melaço' },
}
const hero = $('.hero')
$$('input[name="torra"]').forEach((r) =>
  r.addEventListener('change', () => {
    const t = TORRAS[r.value]
    hero.dataset.roast = r.value
    $('#label-band').textContent = t.banda
    $('#label-notes').textContent = t.notas
    $('#buy-notes').textContent = t.texto
    // as palavras gigantes somem, trocam e voltam
    hero.classList.add('is-swap')
    setTimeout(
      () => {
        $$('.hw__t', hero).forEach((w) => (w.textContent = `${t.palavra} ${t.palavra} ${t.palavra}`))
        hero.classList.remove('is-swap')
      },
      reduce ? 0 : 350,
    )
  }),
)

/* ---------- abertura: o pacote cai, os grãos se espalham e só depois a loja aparece ---------- */
const html = document.documentElement
const FIM_ABERTURA = 2600
$$('.ui', hero).forEach((el, i) => el.style.setProperty('--ui', i))
$$('.bean', hero).forEach((b, i) => b.style.setProperty('--n', i))

function liberar() {
  if (!html.classList.contains('is-intro')) return
  html.classList.remove('is-intro')
  removeEventListener('wheel', pular)
  removeEventListener('touchmove', pular)
  removeEventListener('keydown', pular)
  removeEventListener('pointerdown', pular)
}
// qualquer tentativa de rolar, tocar ou teclar durante a abertura pula direto para o fim
function pular() {
  html.classList.remove('is-play')
  liberar()
}

if (reduce) {
  // sem animação para quem pediu menos movimento
} else {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  scrollTo(0, 0)
  html.classList.add('is-intro', 'is-play')
  addEventListener('wheel', pular, { passive: true })
  addEventListener('touchmove', pular, { passive: true })
  addEventListener('keydown', pular)
  addEventListener('pointerdown', pular)
  if (document.hidden) {
    // aberta em segundo plano: mostra tudo pronto em vez de rodar a abertura sem ninguém ver
    pular()
  } else {
    // os controles aparecem quando o rótulo termina de "carimbar" o pacote
    $('.label', hero).addEventListener('animationend', liberar, { once: true })
    setTimeout(pular, FIM_ABERTURA + 2500) // garantia, caso a animação não termine
  }
}

// o pacote e os grãos acompanham o mouse
if (matchMedia('(hover: hover) and (pointer: fine)').matches && !reduce) {
  hero.addEventListener('pointermove', (ev) => {
    const r = hero.getBoundingClientRect()
    hero.style.setProperty('--mx', (((ev.clientX - r.left) / r.width) * 2 - 1).toFixed(3))
    hero.style.setProperty('--my', (((ev.clientY - r.top) / r.height) * 2 - 1).toFixed(3))
  })
  hero.addEventListener('pointerleave', () => {
    hero.style.setProperty('--mx', 0)
    hero.style.setProperty('--my', 0)
  })
}
seletor($('#buy-grind'))
$('#buy-add').addEventListener('click', () => {
  const torra = $('input[name="torra"]:checked').value
  addToCart('mantiqueira', { torra, moagem: $('#buy-grind').value })
})

/* ---------- vitrine ---------- */
let filtro = 'todos'
function cardHTML(p, i) {
  const cafe = p.cat === 'cafe'
  const padrao = filtro === 'graos' ? 'graos' : 'media'
  const opcoes = Object.entries(MOAGENS)
    .map(([v, t]) => `<option value="${v}"${v === padrao ? ' selected' : ''}>${t}</option>`)
    .join('')
  return `<article class="card" style="--i:${i}">
    <div class="card__img">
      <img src="${pic(p.img)}" width="600" height="600" alt="" loading="lazy" />
      ${p.tag ? `<span class="card__tag${p.tag === 'Microlote' ? ' card__tag--orange' : ''}">${p.tag}</span>` : ''}
    </div>
    <div class="card__body">
      <h3>${p.nome}</h3>
      <p class="card__notes">${p.notas}</p>
      <p class="card__rate"><span class="stars" aria-hidden="true">${'<svg viewBox="0 0 24 24"><use href="#i-star"/></svg>'.repeat(5)}</span><span><b>${p.nota.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}</b> (${p.avaliacoes})</span></p>
      ${cafe ? `<label class="sr-only" for="g-${p.id}">Moagem do ${p.nome}</label><select id="g-${p.id}" data-grind="${p.id}">${opcoes}</select>` : ''}
      <div class="card__foot">
        <p class="card__price">${brl(p.preco)}<small>${p.info}</small></p>
        <button class="card__add" type="button" data-add="${p.id}" aria-label="Adicionar ${p.nome} ao carrinho"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-plus"/></svg></button>
      </div>
    </div>
  </article>`
}
function renderShop() {
  const lista = PRODUTOS.filter((p) => {
    if (filtro === 'todos') return true
    if (filtro === 'graos' || filtro === 'moido') return p.cat === 'cafe'
    return p.cat === filtro
  })
  $('#shop-grid').innerHTML = lista.map(cardHTML).join('')
  $$('select', $('#shop-grid')).forEach(seletor)
}
function setFiltro(f) {
  filtro = f
  $$('.chip').forEach((c) => {
    const on = c.dataset.filter === f
    c.classList.toggle('is-on', on)
    c.setAttribute('aria-pressed', String(on))
  })
  renderShop()
}
$$('.chip').forEach((c) => c.addEventListener('click', () => setFiltro(c.dataset.filter)))
$$('.cat').forEach((c) => c.addEventListener('click', () => setFiltro(c.dataset.filter)))

document.addEventListener('click', (ev) => {
  const btn = ev.target.closest('[data-add]')
  if (!btn) return
  const id = btn.dataset.add
  const sel = $(`[data-grind="${id}"]`)
  addToCart(id, sel ? { moagem: sel.value } : {})
  if (btn.classList.contains('card__add')) {
    const use = btn.querySelector('use')
    use.setAttribute('href', '#i-check')
    btn.classList.add('is-done')
    setTimeout(() => {
      use.setAttribute('href', '#i-plus')
      btn.classList.remove('is-done')
    }, 1400)
  }
})
renderShop()
renderCart()

/* ---------- guia de moagem ---------- */
// O círculo mostra 3 cm de largura; o tamanho de cada grão é desenhado em escala.
const GUIA = [
  { valor: 'grossa', nome: 'Grossa', metodo: 'Prensa francesa', texto: 'Parece sal grosso. Água a 94 °C, 4 minutos de infusão e depois é só descer o êmbolo.', mm: 1.2, tamanho: '~1,2 mm', tempo: '4 min', prop: '1 : 15', foto: 'photo-1519082274554-1ca37fb8abb7', alt: 'Prensa francesa com café pronto' },
  { valor: 'mediagrossa', nome: 'Média-grossa', metodo: 'Chemex e coador de pano', texto: 'Parece açúcar cristal. Combina com filtros grossos, em que a água precisa passar mais devagar.', mm: 0.9, tamanho: '~0,9 mm', tempo: '4 min', prop: '1 : 16', foto: 'photo-1541469406036-71229832e06e', alt: 'Cafeteira Chemex com café coado' },
  { valor: 'media', nome: 'Média', metodo: 'Coado no filtro de papel', texto: 'V60, Melitta ou coador de pano. Parece areia de praia. Água a 92 °C e uns 3 minutos de preparo.', mm: 0.6, tamanho: '~0,6 mm', tempo: '3 min', prop: '1 : 16', foto: 'photo-1759259639356-7c6e74eed1ec', alt: 'Café sendo coado em um coador V60' },
  { valor: 'fina', nome: 'Fina', metodo: 'Espresso e cafeteira italiana', texto: 'Parece açúcar refinado. Para moka e máquinas de espresso, que passam a água com pressão.', mm: 0.3, tamanho: '~0,3 mm', tempo: '30 s a 5 min', prop: '1 : 2 no espresso', foto: 'photo-1511920170033-f8396924c348', alt: 'Porta-filtros de espresso com café moído fino' },
]
GUIA.forEach((g) => {
  const i = new Image()
  i.src = pic(g.foto)
})

const canvas = $('#grind-canvas')
const ctx = canvas.getContext('2d')
const LADO = 560 // o círculo mostra 3 cm, então 1 cm = LADO / 3
const CM = LADO / 3
const RES = 2 // desenha em 2x para ficar nítido em telas boas
canvas.width = LADO * RES
canvas.height = LADO * RES

// o desenho é feito uma vez em uma tela escondida e depois aparece com um fade
const tela = () => {
  const c = document.createElement('canvas')
  c.width = c.height = LADO * RES
  return c
}
let pronta = tela()
let anterior = tela()
let anim

// distribuição normal simples (Box-Muller) para variar o tamanho dos grãos
const gauss = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random())
const rnd = (a, b) => a + Math.random() * (b - a)

function papel(c) {
  // papel de filtro: creme com fibras e manchinhas bem leves
  c.fillStyle = '#f2e9df'
  c.fillRect(0, 0, LADO, LADO)
  for (let i = 0; i < 5000; i++) {
    c.fillStyle = Math.random() < 0.5 ? 'rgba(120, 90, 60, 0.05)' : 'rgba(255, 255, 255, 0.35)'
    c.fillRect(Math.random() * LADO, Math.random() * LADO, rnd(0.4, 1.4), rnd(0.4, 1.4))
  }
  c.strokeStyle = 'rgba(150, 120, 90, 0.07)'
  c.lineWidth = 0.6
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * LADO
    const y = Math.random() * LADO
    const a = Math.random() * Math.PI
    const l = rnd(8, 30)
    c.beginPath()
    c.moveTo(x, y)
    c.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + rnd(-4, 4), y + Math.sin(a) * l * 0.5 + rnd(-4, 4), x + Math.cos(a) * l, y + Math.sin(a) * l)
    c.stroke()
  }
}

function forma(r) {
  // contorno quebrado: 7 a 11 pontos, com algumas faces retas de fratura
  const n = 7 + Math.floor(Math.random() * 5)
  const pts = []
  let rr = r
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2 + rnd(-0.25, 0.25)
    rr = Math.random() < 0.3 ? rr : r * rnd(0.6, 1.08)
    pts.push([Math.cos(a) * rr, Math.sin(a) * rr * rnd(0.75, 1)])
  }
  return pts
}

function grao(c, x, y, r) {
  const pts = forma(r)
  const rot = Math.random() * Math.PI * 2
  const L = rnd(13, 30) // luminosidade do marrom: mais escuro = torra mais forte
  const H = rnd(18, 28)
  const S = rnd(42, 62)
  c.save()
  c.translate(x, y)
  c.rotate(rot)
  const caminho = () => {
    c.beginPath()
    pts.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py)))
    c.closePath()
  }
  // sombra no papel
  if (r > 1.6) {
    c.save()
    c.rotate(-rot)
    c.translate(r * 0.16, r * 0.24)
    c.rotate(rot)
    caminho()
    c.fillStyle = 'rgba(70, 40, 20, 0.22)'
    c.fill()
    c.restore()
  }
  caminho()
  if (r > 2.4) {
    // luz vindo de cima à esquerda
    c.rotate(-rot)
    const g = c.createRadialGradient(-r * 0.35, -r * 0.4, 0, 0, 0, r * 1.25)
    g.addColorStop(0, `hsl(${H}, ${S}%, ${L + 16}%)`)
    g.addColorStop(0.55, `hsl(${H}, ${S}%, ${L}%)`)
    g.addColorStop(1, `hsl(${H}, ${S}%, ${Math.max(6, L - 9)}%)`)
    c.fillStyle = g
    c.fill()
    c.rotate(rot)
    c.strokeStyle = 'rgba(25, 12, 5, 0.35)'
    c.lineWidth = 0.5
    c.stroke()
    // brilho de óleo em alguns grãos
    if (r > 4 && Math.random() < 0.35) {
      c.rotate(-rot)
      c.fillStyle = 'rgba(255, 236, 210, 0.2)'
      c.beginPath()
      c.ellipse(-r * 0.3, -r * 0.35, r * 0.28, r * 0.14, -0.6, 0, Math.PI * 2)
      c.fill()
    }
  } else {
    c.fillStyle = `hsl(${H}, ${S}%, ${L}%)`
    c.fill()
  }
  c.restore()
}

function gerar(mm) {
  const r = (mm / 10) * CM * 0.5 // raio médio na escala do desenho
  const c = pronta.getContext('2d')
  c.setTransform(RES, 0, 0, RES, 0, 0)
  papel(c)

  const graos = Math.min(14000, Math.round((1.05 * LADO * LADO) / (Math.PI * r * r)))
  const finos = Math.min(9000, Math.round(graos * 0.8))
  const sorteia = () => [Math.random() * LADO, Math.random() * LADO]

  // metade do pó fino fica por baixo, metade gruda por cima, como no café de verdade
  for (let i = 0; i < finos / 2; i++) grao(c, ...sorteia(), r * rnd(0.18, 0.4))
  for (let i = 0; i < graos; i++) grao(c, ...sorteia(), Math.max(0.8, r * Math.exp(gauss() * 0.28)))
  for (let i = 0; i < finos / 2; i++) grao(c, ...sorteia(), r * rnd(0.15, 0.35))
  // película prateada (casquinha clara) que sempre aparece no café moído
  for (let i = 0; i < Math.max(6, graos * 0.012); i++) {
    const [x, y] = sorteia()
    c.save()
    c.translate(x, y)
    c.rotate(Math.random() * 6.28)
    c.fillStyle = 'rgba(205, 168, 120, 0.75)'
    c.beginPath()
    c.ellipse(0, 0, r * rnd(0.5, 1.1), r * rnd(0.15, 0.3), 0, 0, Math.PI * 2)
    c.fill()
    c.restore()
  }
}

function desenhar() {
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.globalAlpha = 1
  ctx.drawImage(pronta, 0, 0)
}

function animar() {
  cancelAnimationFrame(anim)
  if (reduce) return desenhar()
  // guarda o desenho atual para fazer a transição
  const a = anterior.getContext('2d')
  a.setTransform(1, 0, 0, 1, 0, 0)
  a.drawImage(canvas, 0, 0)
  const t0 = performance.now()
  const passo = (agora) => {
    const p = Math.min(1, (agora - t0) / 650)
    const e = 1 - Math.pow(1 - p, 3)
    const s = 1.06 - 0.06 * e // o novo pó assenta, como se fosse derramado
    const off = (LADO * RES * (1 - s)) / 2
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.globalAlpha = 1
    ctx.drawImage(anterior, 0, 0)
    ctx.globalAlpha = e
    ctx.drawImage(pronta, off, off, LADO * RES * s, LADO * RES * s)
    ctx.globalAlpha = 1
    if (p < 1) anim = requestAnimationFrame(passo)
  }
  anim = requestAnimationFrame(passo)
}


const range = $('#grind-range')
const photo = $('#grind-photo')
function setGuia(i, animado = true) {
  const g = GUIA[i]
  range.style.setProperty('--p', (i / 3) * 100 + '%')
  $('#grind-name').textContent = g.nome
  $('#grind-title-method').textContent = g.metodo
  $('#grind-text').textContent = g.texto
  $('#grind-size').textContent = g.tamanho
  $('#grind-time').textContent = g.tempo
  $('#grind-ratio').textContent = g.prop
  $('#grind-add-text').textContent = `Quero o Mantiqueira em moagem ${g.nome.toLowerCase()}`
  photo.classList.add('is-swap')
  setTimeout(
    () => {
      photo.src = pic(g.foto)
      photo.alt = g.alt
      photo.classList.remove('is-swap')
    },
    reduce ? 0 : 250,
  )
  gerar(g.mm)
  animado ? animar() : desenhar()
}
$('#grind-add').addEventListener('click', () => addToCart('mantiqueira', { torra: 'media', moagem: GUIA[Number(range.value)].valor }))

// régua de 1 cm acompanha o tamanho do círculo na tela
const lens = $('.grind__lens')
const setRegua = () => lens.style.setProperty('--cm', lens.clientWidth / 3 + 'px')
new ResizeObserver(setRegua).observe(lens)

/* ---------- moedor: anel girável e botões de método ---------- */
// Cada moagem tem um ângulo no anel; a escolhida gira até ficar sob o marcador do alto.
const dial = $('#dial')
const ring = $('#dial-ring')
const ANGULOS = [-60, -20, 20, 60]
const NS_SVG = 'http://www.w3.org/2000/svg'
let rot = -ANGULOS[2]

// marcações do anel: uma a cada 6°, maiores nas quatro moagens
const ticks = $('#dial-ticks')
for (let a = 0; a < 360; a += 6) {
  const grande = ANGULOS.some((g) => ((g + 360) % 360) === a)
  const l = document.createElementNS(NS_SVG, 'line')
  l.setAttribute('x1', 100)
  l.setAttribute('x2', 100)
  l.setAttribute('y1', 3)
  l.setAttribute('y2', grande ? 10 : 6.5)
  l.setAttribute('class', `dial__tick${grande ? ' dial__tick--big' : ''}`)
  l.setAttribute('transform', `rotate(${a} 100 100)`)
  ticks.appendChild(l)
}
const labels = $('#dial-labels')
GUIA.forEach((g, i) => {
  const t = document.createElementNS(NS_SVG, 'text')
  t.setAttribute('x', 100)
  t.setAttribute('y', 18.5)
  t.setAttribute('text-anchor', 'middle')
  t.setAttribute('class', 'dial__label')
  t.setAttribute('transform', `rotate(${ANGULOS[i]} 100 100)`)
  t.textContent = g.nome
  labels.appendChild(t)
})

function girarPara(i, animado = true) {
  rot = -ANGULOS[i]
  ring.style.setProperty('--rot', `${rot}deg`)
  $$('.dial__label', labels).forEach((t, k) => t.classList.toggle('is-on', k === i))
  dial.setAttribute('aria-valuenow', i)
  dial.setAttribute('aria-valuetext', `Moagem ${GUIA[i].nome.toLowerCase()}`)
  const radio = $(`input[name="metodo"][value="${i}"]`)
  if (radio) radio.checked = true
  if (animado && !reduce) {
    dial.classList.remove('is-grinding')
    void dial.offsetWidth
    dial.classList.add('is-grinding')
    const m = $('#grind-method')
    m.classList.remove('is-swap')
    void m.offsetWidth
    m.classList.add('is-swap')
  }
}

function escolherMoagem(i) {
  if (Number(range.value) === i) return girarPara(i, false)
  range.value = i
  girarPara(i)
  setGuia(i)
}

$$('input[name="metodo"]').forEach((r) => r.addEventListener('change', () => escolherMoagem(Number(r.value))))

// arrastar o anel: gira junto com o dedo/mouse e trava na moagem mais próxima ao soltar
let arrasto = null
const anguloDo = (ev) => {
  const r = dial.getBoundingClientRect()
  return (Math.atan2(ev.clientY - (r.top + r.height / 2), ev.clientX - (r.left + r.width / 2)) * 180) / Math.PI
}
dial.addEventListener('pointerdown', (ev) => {
  arrasto = { inicio: anguloDo(ev), rot }
  dial.setPointerCapture(ev.pointerId)
  dial.classList.add('is-drag')
})
dial.addEventListener('pointermove', (ev) => {
  if (!arrasto) return
  let d = anguloDo(ev) - arrasto.inicio
  if (d > 180) d -= 360
  if (d < -180) d += 360
  const r = Math.max(-75, Math.min(75, arrasto.rot + d))
  ring.style.setProperty('--rot', `${r}deg`)
  arrasto.atual = r
})
const soltar = () => {
  if (!arrasto) return
  dial.classList.remove('is-drag')
  const r = arrasto.atual ?? arrasto.rot
  arrasto = null
  let melhor = 0
  ANGULOS.forEach((a, i) => {
    if (Math.abs(r + a) < Math.abs(r + ANGULOS[melhor])) melhor = i
  })
  escolherMoagem(melhor)
}
dial.addEventListener('pointerup', soltar)
dial.addEventListener('pointercancel', soltar)

// teclado: setas giram o anel
dial.addEventListener('keydown', (ev) => {
  const passo = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[ev.key]
  if (!passo) return
  ev.preventDefault()
  escolherMoagem(Math.max(0, Math.min(3, Number(range.value) + passo)))
})

girarPara(Number(range.value), false)

// a palavra MOAGEM do fundo desliza devagar conforme a página rola
const fundoMoagem = $('.grind__bgword')
const secMoagem = $('#moagem')
if (fundoMoagem && !reduce) {
  addEventListener(
    'scroll',
    () => {
      const r = secMoagem.getBoundingClientRect()
      const p = (innerHeight - r.top) / (innerHeight + r.height)
      if (p > -0.2 && p < 1.2) fundoMoagem.style.setProperty('--bgx', `${(-p * 12).toFixed(2)}vw`)
    },
    { passive: true },
  )
}

// só desenha quando a seção aparece
const guiaObs = new IntersectionObserver(
  ([e]) => {
    if (!e.isIntersecting) return
    guiaObs.disconnect()
    setGuia(Number(range.value))
  },
  { threshold: 0.3 },
)
gerar(GUIA[2].mm)
desenhar()
guiaObs.observe(lens)

/* ---------- newsletter ---------- */
$('.news').addEventListener('submit', () => {
  const mail = $('#news-mail')
  const msg = $('#news-msg')
  if (!/^\S+@\S+\.\S+$/.test(mail.value.trim())) {
    msg.textContent = 'Confira o e-mail: falta o @ ou o domínio.'
    mail.focus()
    return
  }
  msg.textContent = 'Pronto! (Isto é um exemplo: nenhum e-mail foi cadastrado.)'
  mail.value = ''
})

/* ---------- entrada ao rolar ---------- */
const grupos = new Map()
$$('.reveal').forEach((el) => {
  const n = grupos.get(el.parentElement) || 0
  el.style.setProperty('--i', n)
  grupos.set(el.parentElement, n + 1)
})
const revealObs = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (!e.isIntersecting) return
      e.target.classList.add('is-in')
      revealObs.unobserve(e.target)
    }),
  { rootMargin: '0px 0px -8% 0px' },
)
$$('.reveal').forEach((el) => revealObs.observe(el))

/* ---------- faixa tipográfica: anda para os lados conforme a página rola ---------- */
const band = $('.band')
if (band && !reduce) {
  const linhas = $$('.band__row', band)
  let pedido = false
  const mover = () => {
    pedido = false
    const r = band.getBoundingClientRect()
    // 0 quando a faixa entra por baixo da tela, 1 quando sai por cima
    const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height)))
    linhas[0].style.setProperty('--shift', `${(-p * 28).toFixed(2)}vw`)
    linhas[1].style.setProperty('--shift', `${(p * 22).toFixed(2)}vw`)
  }
  addEventListener(
    'scroll',
    () => {
      if (!pedido) {
        pedido = true
        requestAnimationFrame(mover)
      }
    },
    { passive: true },
  )
  mover()
}

/* ---------- etiquetas: liga cada etiqueta ao ponto do pacote ---------- */
// Posições em % da caixa do produto: etiqueta (--bx, --by) e ponto no pacote (--tx, --ty).
const produto = $('.hero__product')
const etiquetas = $$('.co', produto)
function ligarEtiquetas() {
  const w = produto.clientWidth
  const h = produto.clientHeight
  etiquetas.forEach((co) => {
    const cs = getComputedStyle(co)
    const n = (v) => parseFloat(cs.getPropertyValue(v)) / 100
    const dx = (n('--tx') - n('--bx')) * w
    const dy = (n('--ty') - n('--by')) * h
    const raio = co.querySelector('.co__badge').offsetWidth / 2
    const dist = Math.hypot(dx, dy)
    // a linha começa na borda da etiqueta e termina no ponto do pacote
    const ux = dx / dist
    const uy = dy / dist
    const line = co.querySelector('.co__line')
    line.style.left = `${ux * raio}px`
    line.style.top = `${uy * raio}px`
    co.style.setProperty('--len', `${Math.max(0, dist - raio)}px`)
    co.style.setProperty('--ang', `${Math.atan2(dy, dx)}rad`)
    co.style.setProperty('--dx', `${dx}px`)
    co.style.setProperty('--dy', `${dy}px`)
  })
}
if (etiquetas.length) {
  new ResizeObserver(ligarEtiquetas).observe(produto)
  ligarEtiquetas()
}
