// Gera o site de exemplo "Ventura Contabilidade" (empresa fictícia) em public/exemplos/site-institucional.
// Uso: node exemplos/site-institucional/build.mjs
// Os estilos e o script ficam ao lado deste arquivo e são copiados para a pasta pública.
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, '..', '..', 'public', 'exemplos', 'site-institucional')
mkdirSync(OUT, { recursive: true })

// Fotos do Unsplash (licença gratuita), servidas pelo CDN do Unsplash; crédito no rodapé.
const photo = {
  hero: 'photo-1760351561005-718d0e766dac',
  owner: 'photo-1687422808248-f807f4ea2a2e',
  calc: 'photo-1589318577086-eaf0fadffcd1',
  signing: 'photo-1562564055-71e051d33c19',
  laptop: 'photo-1781246435700-afec19012b45',
  team: 'photo-1690378820474-b468b8ee64d3',
  tablet: 'photo-1790273019525-db59dec855d6',
  r1: 'photo-1494790108377-be9c29b29330',
  r2: 'photo-1758691737646-79dbce8e25fb',
  r3: 'photo-1780387477222-730504564368',
  r4: 'photo-1568602471122-7832951cc4c5',
  r5: 'photo-1764173039192-2bbd508d5211',
  carlos: 'photo-1764173039051-987d1639b9d5',
  juliana: 'photo-1762341104634-998bbee0ccba',
  pedro: 'photo-1758876204244-930299843f07',
  larissa: 'photo-1699473567091-6ae0ec323a9c',
}
const src = (id, w, h) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ''}&q=75`
const img = (id, w, h, alt, extra = '') =>
  `<img src="${src(id, w, h)}" srcset="${src(id, w, h)} 1x, ${src(id, w * 2, h * 2)} 2x" width="${w}" height="${h}" alt="${alt}" loading="lazy" decoding="async"${extra} />`

// Ícones desenhados (traço 1.8, mesmo estilo em todo o site)
const svg = (paths) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`
const icon = {
  arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  phone: svg('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>'),
  mail: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'),
  clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  pin: svg('<path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>'),
  play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>',
  arrowUp: svg('<path d="M7 17L17 7M8 7h9v9"/>'),
  check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"/></svg>',
  store: svg('<path d="M4 10v10h16V10M3 6l2-3h14l2 3v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z"/><path d="M10 20v-5h4v5"/>'),
  calc: svg('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15v3M8 18h4"/>'),
  people: svg('<circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0M16 4.8a3.2 3.2 0 0 1 0 6.4M18 14a5.5 5.5 0 0 1 3 6"/>'),
  chart: svg('<path d="M4 4v16h16"/><path d="M8 15l3.5-4 3 2.5L20 7"/>'),
  scale: svg('<path d="M12 4v16M7 20h10M5 8h14M5 8l-2.5 6a3 3 0 0 0 5 0zM19 8l-2.5 6a3 3 0 0 0 5 0z"/>'),
  shield: svg('<path d="M12 21s8-4 8-10V5l-8-3-8 3v6c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>'),
  award: svg('<circle cx="12" cy="9" r="5.5"/><path d="M9 14l-1.5 7L12 19l4.5 2L15 14"/>'),
  calendar: svg('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
  chat: svg('<path d="M4 5h16v11H9l-5 4z"/>'),
  doc: svg('<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4M9 13h6M9 17h4"/>'),
  whats: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3a.5.5 0 0 0 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.7 11.7 0 0 0 4.5 4c1.7.7 2.3.8 3.2.7a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3z"/></svg>',
}

const logoMark = `<svg class="logo__mark" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="9" fill="#0f7a4a"/><path d="M9 10l7 12 7-12" fill="none" stroke="#c6ec7a" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
const logo = (light = false) =>
  `<a class="logo${light ? ' logo--light' : ''}" href="index.html" aria-label="Ventura Contabilidade, início">${logoMark}<span>Ventura<small>Contabilidade</small></span></a>`

const nav = [
  ['servicos.html', 'Serviços'],
  ['index.html#como-funciona', 'Como funciona'],
  ['index.html#planos', 'Planos'],
  ['sobre.html', 'Sobre'],
  ['index.html#duvidas', 'Dúvidas'],
]

const header = (current) => `
<div class="demo-bar">
  <div class="wrap">
    <a href="/#produtos"><svg class="flip" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>Voltar ao portfólio</a>
    <span>Site de exemplo · empresa fictícia</span>
  </div>
</div>
<header class="header">
  <div class="wrap header__row">
    ${logo(true)}
    <button class="menu-toggle" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="menu"><span></span><span></span></button>
    <nav class="nav" id="menu" aria-label="Menu principal">
      ${nav.map(([href, label]) => `<a href="${href}"${href === current ? ' aria-current="page"' : ''}>${label}</a>`).join('\n      ')}
      <span class="nav__actions">
        <a class="btn btn--line-light" href="tel:+558900000000">${icon.phone}(89) 0000-0000</a>
        <a class="btn btn--lime" href="contato.html"${current === 'contato.html' ? ' aria-current="page"' : ''}>Falar com um contador</a>
      </span>
    </nav>
  </div>
</header>`

const footer = `
<footer class="footer">
  <div class="wrap">
    <div class="footer__grid">
      <div class="footer__brand">
        ${logo(true)}
        <p>Contabilidade para pequenas e médias empresas do Piauí desde 2009.</p>
        <form class="newsletter" aria-label="Receber o calendário fiscal por e-mail">
          <label for="news-email">Receba o calendário fiscal todo mês</label>
          <div><input id="news-email" type="email" placeholder="seu@email.com.br" required autocomplete="email" /><button class="btn btn--lime" type="submit">Receber</button></div>
          <p class="newsletter__ok" role="status" hidden>Cadastro de exemplo: nada foi enviado.</p>
        </form>
      </div>
      <nav aria-label="Serviços">
        <h2>Serviços</h2>
        <ul><li><a href="servicos.html#abertura">Abertura de empresa</a></li><li><a href="servicos.html#contabil">Contabilidade</a></li><li><a href="servicos.html#pessoal">Departamento pessoal</a></li><li><a href="servicos.html#consultoria">Consultoria</a></li></ul>
      </nav>
      <nav aria-label="Empresa">
        <h2>Empresa</h2>
        <ul><li><a href="sobre.html">Sobre nós</a></li><li><a href="sobre.html#equipe">Equipe</a></li><li><a href="index.html#duvidas">Dúvidas</a></li><li><a href="contato.html">Contato</a></li></ul>
      </nav>
      <div>
        <h2>Contato</h2>
        <ul class="footer__contact">
          <li>${icon.pin}Av. Central, 1200, Picos — PI</li>
          <li>${icon.phone}(89) 0000-0000</li>
          <li>${icon.mail}contato@ventura.exemplo</li>
        </ul>
      </div>
    </div>
    <div class="footer__bottom" id="rodape-fim">
      <span>© <span data-year></span> Ventura Contabilidade · empresa fictícia criada para demonstração.</span>
      <span>Fotos: <a href="https://unsplash.com/?utm_source=portfolio-walison&amp;utm_medium=referral" target="_blank" rel="noopener">Unsplash</a> · Site por <a href="/">Walison Weudes</a></span>
    </div>
  </div>
</footer>
<a class="whats" href="contato.html" aria-label="Falar pelo WhatsApp">${icon.whats}</a>
<script src="script.js" defer></script>`

const page = ({ file, title, description, body }) => `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<meta name="description" content="${description}" />
<meta name="robots" content="noindex" />
<meta name="theme-color" content="#0a2e22" />
<link rel="icon" type="image/png" href="/imagens/favicon-64.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400..800&amp;display=swap" rel="stylesheet" />
<link rel="stylesheet" href="style.css" />
</head>
<body>
${header(file)}
<main id="conteudo">
${body}
</main>
${footer}
</body>
</html>
`

const services = [
  { id: 'abertura', icon: icon.store, title: 'Abertura de empresa', text: 'Do CNPJ ao alvará, com o regime tributário certo desde o primeiro dia.', items: ['Escolha do regime', 'Junta Comercial e Receita', 'Alvarás e licenças'], img: [photo.owner, 'Dono de pequeno negócio atrás do balcão'] },
  { id: 'contabil', icon: icon.calc, title: 'Contabilidade e impostos', text: 'Escrituração, balanço e apuração mensal entregues no prazo.', items: ['Balanço e DRE', 'Apuração de impostos', 'Obrigações acessórias'], img: [photo.calc, 'Calculadora sobre relatórios'] },
  { id: 'pessoal', icon: icon.people, title: 'Departamento pessoal', text: 'Folha, admissões, férias e rescisões dentro da lei.', items: ['Folha e eSocial', 'Admissão e rescisão', 'Férias e 13º'], img: [photo.signing, 'Duas pessoas assinando um contrato'] },
  { id: 'consultoria', icon: icon.chart, title: 'Consultoria financeira', text: 'Fluxo de caixa, custos e preço de venda, com reunião mensal.', items: ['Fluxo de caixa', 'Precificação', 'Relatório mensal'], img: [photo.laptop, 'Notebook com gráficos sobre a mesa'] },
  { id: 'fiscal', icon: icon.scale, title: 'Planejamento tributário', text: 'Análise do enquadramento para pagar só o que é devido.', items: ['Comparativo de regimes', 'Recuperação de créditos', 'Revisão anual'], img: [photo.tablet, 'Contador revisando números num tablet'] },
  { id: 'regularizacao', icon: icon.shield, title: 'Regularização', text: 'Levantamento de pendências e plano para colocar a empresa em dia.', items: ['Certidões negativas', 'Parcelamentos', 'Baixa de empresa'], img: [photo.team, 'Equipe reunida em volta de uma mesa'] },
]

// Cartões de serviço altos, em três estilos que se alternam: verde-escuro, limão com foto embaixo e foto com sobreposição.
const variants = ['dark', 'lime', 'photo']
const serviceCard = (s, i, full = false) => {
  const v = variants[i % 3]
  const href = full ? 'contato.html' : `servicos.html#${s.id}`
  return `
      <article class="svc svc--${v}" id="${s.id}">
        ${v !== 'dark' ? `<figure class="svc__img">${img(s.img[0], 520, v === 'lime' ? 300 : 640, s.img[1])}</figure>` : ''}
        <div class="svc__top"><span class="num">${String(i + 1).padStart(2, '0')}.</span></div>
        <div class="svc__body">
          <h3>${s.title}</h3>
          <p>${s.text}</p>
          ${full ? `<ul class="ticks">${s.items.map((t) => `<li>${icon.check}${t}</li>`).join('')}</ul>` : ''}
          <a class="svc__link" href="${href}">${full ? 'Pedir orçamento' : 'Saiba mais'}</a>
        </div>
        <a class="svc__go" href="${href}" aria-label="${s.title}: ${full ? 'pedir orçamento' : 'saiba mais'}">${icon.arrowUp}</a>
      </article>`
}

const clients = [
  ['casa', 'Casa Aroeira', '<span class="mk mk--circle">CA</span>Casa <i>Aroeira</i>'],
  ['norte', 'Oficina Norte', 'OFICINA<b>NORTE</b>'],
  ['vitta', 'Clínica Vitta', 'clínica<b>vitta</b><span class="mk mk--plus">+</span>'],
  ['sol', 'Mercado Sol', '<span class="mk mk--sun"></span>Mercado Sol'],
  ['lume', 'Studio Lume', 'studio <b>LUME</b>'],
  ['padaria', 'Padaria Picoense', '<span class="mk mk--square">P</span>PADARIA PICOENSE'],
  ['otica', 'Ótica Central', 'Ótica<span class="mk mk--o">o</span>Central'],
  ['agro', 'Agro Serra', '<span class="mk mk--leaf"></span>AgroSerra'],
]

const reviews = [
  ['r1', 'Mariana Souza', 'Loja de roupas · cliente desde 2019', 'Saí do MEI para ME sem dor de cabeça. Explicam tudo em linguagem simples e respondem rápido no WhatsApp.'],
  ['r2', 'Rafael Lima', 'Clínica odontológica · desde 2016', 'O planejamento tributário reduziu nossos impostos já no primeiro trimestre. Recomendo para qualquer clínica.'],
  ['r4', 'Lucas Andrade', 'Agência digital · desde 2021', 'Relatório todo mês, claro e direto. Finalmente sei quanto a empresa lucra de verdade.'],
]

const plans = [
  { name: 'MEI', price: '149', desc: 'Para quem está começando e quer tudo em dia.', items: ['Declaração anual do MEI', 'Emissão de guias DAS', 'Suporte pelo WhatsApp', 'Ajuda para virar ME'], featured: false },
  { name: 'Simples Nacional', price: '490', desc: 'Para micro e pequenas empresas com funcionários.', items: ['Contabilidade completa', 'Folha de até 5 funcionários', 'Relatório mensal', 'Contador dedicado'], featured: true },
  { name: 'Lucro Presumido', price: '990', desc: 'Para empresas maiores ou de serviços regulados.', items: ['Tudo do plano Simples', 'Planejamento tributário', 'Reunião mensal', 'Folha de até 15 funcionários'], featured: false },
]

const faq = [
  ['Quanto custa a contabilidade mensal?', 'Depende do porte, do regime tributário e do número de funcionários. Depois de uma conversa, enviamos uma proposta com valor fixo mensal, sem taxas escondidas.'],
  ['Como funciona a troca de contador?', 'Você nos autoriza e nós pedimos os documentos ao contador atual. A transição fica por nossa conta, sem custo extra.'],
  ['Vocês atendem MEI?', 'Sim. Fazemos a declaração anual do MEI e, quando chegar a hora, a migração para Microempresa no regime mais vantajoso.'],
  ['Preciso ir até o escritório?', 'Não. O atendimento pode ser todo pelo WhatsApp, e-mail e videochamada. Se preferir conversar pessoalmente, é só agendar.'],
  ['Em quanto tempo abro minha empresa?', 'Na maioria dos casos, entre 7 e 15 dias úteis, conforme a atividade e os alvarás exigidos pela prefeitura.'],
  ['Posso cancelar quando quiser?', 'Sim. O contrato é mensal, com aviso de 30 dias, e entregamos toda a documentação para o próximo contador.'],
]

const leadForm = (id) => `
      <form class="lead" id="${id}" novalidate>
        <h2 class="lead__title">Fale com um contador</h2>
        <p class="lead__sub">Resposta em até 1 dia útil. Primeira conversa sem custo.</p>
        <label class="field"><span>Nome completo</span><input name="nome" type="text" required autocomplete="name" placeholder="Seu nome" /></label>
        <label class="field"><span>WhatsApp</span><input name="whatsapp" type="tel" required autocomplete="tel" inputmode="tel" placeholder="(89) 9 0000-0000" /></label>
        <label class="field"><span>Situação da empresa</span>
          <select name="tipo">
            <option>Ainda vou abrir</option>
            <option>MEI</option>
            <option>Microempresa (ME)</option>
            <option>Empresa de pequeno porte (EPP)</option>
            <option>Quero trocar de contador</option>
          </select>
        </label>
        <button class="btn btn--brand btn--block" type="submit">Solicitar conversa ${icon.arrow}</button>
        <p class="lead__ok" role="status" hidden>Solicitação registrada. (Exemplo: nada foi enviado.)</p>
      </form>`

const cta = `
<section class="wrap cta-band" aria-labelledby="h-cta">
  <div class="cta-band__text">
    <h2 id="h-cta">Vamos organizar as contas da sua empresa?</h2>
    <p>Conte em que pé está a sua empresa. Um contador responde em até 1 dia útil, sem compromisso.</p>
    <div class="cta-band__actions">
      <a class="btn btn--lime" href="contato.html">Solicitar conversa ${icon.arrow}</a>
      <a class="btn btn--ghost-light" href="tel:+558900000000">${icon.phone}(89) 0000-0000</a>
    </div>
  </div>
  <figure class="cta-band__img">${img(photo.tablet, 560, 480, 'Contador da Ventura sorrindo com um tablet no escritório')}</figure>
</section>`

const home = page({
  file: 'index.html',
  title: 'Ventura Contabilidade — Contabilidade para pequenas empresas em Picos',
  description: 'Contabilidade, impostos, folha e abertura de empresa para pequenas e médias empresas do Piauí.',
  body: `
<section class="hero" aria-labelledby="titulo">
  ${img(photo.laptop, 1600, 900, '', ' class="hero__bg" aria-hidden="true"').replace(' loading="lazy"', '')}
  <div class="hero__shade" aria-hidden="true"></div>
  <div class="wrap hero__grid">
    <div class="hero__text">
      <h1 id="titulo">Pague <mark>só o imposto que é devido.</mark></h1>
      <p>Contabilidade e planejamento tributário para pequenas empresas do Piauí. Simule agora quanto a sua empresa pode economizar dentro da lei.</p>
      <div class="hero__actions">
        <a class="btn btn--lime btn--lg" href="contato.html">Falar com um contador ${icon.arrow}</a>
        <a class="btn btn--play btn--lg" href="#como-funciona"><span class="btn__dot">${icon.play}</span>Ver como funciona</a>
      </div>
      <p class="hero__proof"><span class="stars" aria-hidden="true">${icon.star.repeat(5)}</span><b>4,9</b> em 120 avaliações · 17 anos em Picos · 320+ empresas</p>
    </div>
    <form class="sim" data-sim aria-labelledby="sim-title">
      <div class="sim__head">
        <h2 id="sim-title">Simulador de imposto</h2>
        <span>Simples Nacional · estimativa</span>
      </div>
      <div class="sim__acts" role="group" aria-label="Atividade da empresa">
        <button type="button" data-act="servicos" aria-pressed="true">Serviços</button>
        <button type="button" data-act="comercio" aria-pressed="false">Comércio</button>
      </div>
      <label class="sim__rev" for="sim-rev">
        <span>Faturamento mensal</span>
        <output data-sim-rev for="sim-rev" class="num">R$ 40.000</output>
      </label>
      <input id="sim-rev" type="range" min="5000" max="300000" step="1000" value="40000" data-sim-range />
      <div class="sim__scale num" aria-hidden="true"><span>R$ 5 mil</span><span>R$ 300 mil</span></div>
      <div class="sim__bars" aria-live="polite">
        <div class="sim__bar sim__bar--before"><span data-sim-label-a>Sem planejamento</span><div><i data-sim-bar-a></i></div><b class="num" data-sim-a>–</b></div>
        <div class="sim__bar sim__bar--after"><span data-sim-label-b>Com planejamento</span><div><i data-sim-bar-b></i></div><b class="num" data-sim-b>–</b></div>
      </div>
      <div class="sim__save">
        <span>Economia estimada</span>
        <b class="num" data-sim-save>–</b>
        <small class="num" data-sim-year>–</small>
      </div>
      <p class="sim__how" data-sim-how></p>
      <a class="btn btn--lime btn--block" href="contato.html">Quero o cálculo da minha empresa ${icon.arrow}</a>
      <p class="sim__fine">Estimativa ilustrativa com as alíquotas do Simples Nacional (LC 123/2006). Não substitui a análise de um contador.</p>
    </form>
  </div>
</section>

<section class="sec" id="servicos" aria-labelledby="h-servicos">
  <div class="wrap">
    <div class="sec-head sec-head--split">
      <div>
        <h2 id="h-servicos">Serviços para cada fase do seu negócio</h2>
        <p>Tudo o que a empresa precisa para ficar em dia, num só escritório.</p>
      </div>
      <a class="btn btn--outline" href="servicos.html">Ver todos os serviços ${icon.arrow}</a>
    </div>
    <div class="svc-grid">${services.slice(0, 3).map((s, i) => serviceCard(s, i)).join('')}
    </div>
    <div class="extras">
      <b>Também fazemos:</b>
      <ul class="chips chips--line"><li>Imposto de Renda (IRPF)</li><li>Certidões negativas</li><li>Alvarás</li><li>Baixa de empresa</li></ul>
    </div>
  </div>
</section>

<section class="stats" aria-labelledby="h-stats">
  <div class="wrap stats__grid">
    <div class="stats__intro">
      <h2 id="h-stats">Números que mostram o nosso compromisso</h2>
      <p>Empresas de todo o Piauí confiam a sua rotina contábil à Ventura.</p>
      <a class="btn btn--lime" href="contato.html">Quero ser cliente ${icon.arrow}</a>
    </div>
    <dl class="stats__list">
      <div>${icon.store}<dt>Empresas atendidas</dt><dd class="num"><span data-count="320">320</span>+</dd></div>
      <div>${icon.calendar}<dt>Anos de mercado</dt><dd class="num"><span data-count="17">17</span></dd></div>
      <div>${icon.check}<dt>Obrigações entregues no prazo</dt><dd class="num"><span data-count="99">99</span>%</dd></div>
      <div>${icon.people}<dt>Especialistas</dt><dd class="num"><span data-count="12">12</span></dd></div>
    </dl>
  </div>
</section>

<section class="sec" id="como-funciona" aria-labelledby="h-processo">
  <div class="wrap">
    <div class="how__head">
      <h2 id="h-processo">Como funciona: do primeiro contato à rotina em dia</h2>
      <span class="how__squares" aria-hidden="true"><i></i><i></i></span>
    </div>
    <div class="how">
      <figure class="how__big">${img(photo.team, 720, 520, 'Equipe da Ventura reunida em volta da mesa')}</figure>
      <a class="seal" href="contato.html" aria-label="Falar com um contador">
        <svg class="seal__text" viewBox="0 0 200 200" aria-hidden="true">
          <defs><path id="seal-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" /></defs>
          <text><textPath href="#seal-circle">DESDE 2009 · CONTABILIDADE · PICOS · PIAUÍ ·</textPath></text>
        </svg>
        <span class="seal__btn">${icon.arrowUp}</span>
      </a>
      <div class="how__side">
        <p>Você conta em que pé está a sua empresa, recebe uma proposta com valor fixo e nós buscamos tudo com o contador atual. A partir daí, impostos, folha e relatório mensal ficam com um contador que conhece o seu negócio pelo nome.</p>
        <figure class="how__small">${img(photo.signing, 480, 300, 'Cliente e contadora assinando o contrato')}</figure>
      </div>
    </div>
    <ol class="how__steps">
      <li><span class="num">01</span><b>Conversa sem custo</b><p>Entendemos a sua empresa e as suas dúvidas.</p></li>
      <li><span class="num">02</span><b>Proposta com valor fixo</b><p>Os serviços certos e um valor mensal, sem surpresas.</p></li>
      <li><span class="num">03</span><b>Migração por nossa conta</b><p>Buscamos tudo com o contador atual.</p></li>
      <li><span class="num">04</span><b>Rotina em dia</b><p>Impostos, folha e relatório mensal.</p></li>
    </ol>
  </div>
</section>

<section class="sec sec--soft" id="prazos" aria-labelledby="h-prazos">
  <div class="wrap dl">
    <div class="dl__intro">
      <h2 id="h-prazos">Os prazos da sua empresa, sempre sob controle</h2>
      <p class="lead-text">Cada obrigação tem data. Escolha o tipo da sua empresa e veja o calendário do mês: nós acompanhamos tudo e avisamos antes.</p>
      <div class="dl__regime" role="group" aria-label="Tipo de empresa">
        <button type="button" data-regime="simples" aria-pressed="true">Simples Nacional</button>
        <button type="button" data-regime="mei" aria-pressed="false">MEI</button>
      </div>
      <div class="countdown" aria-live="polite">
        <svg class="countdown__ring" viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="52" class="countdown__track" />
          <circle cx="60" cy="60" r="52" class="countdown__bar" data-ring />
        </svg>
        <div class="countdown__num"><b class="num" data-days>–</b><span data-days-label>dias</span></div>
        <div class="countdown__text">
          <span>Próximo prazo</span>
          <b data-next-name>calculando…</b>
          <small data-next-date></small>
        </div>
      </div>
      <p class="fine">Datas de referência; vencimentos em fim de semana são antecipados. Feriados e regras locais podem mudar as datas.</p>
    </div>
    <div class="cal" data-cal>
      <div class="cal__head">
        <button type="button" class="cal__nav" data-cal-prev aria-label="Mês anterior">${icon.arrow.replace('<svg', '<svg class="flip"')}</button>
        <b data-cal-title>Mês</b>
        <button type="button" class="cal__nav" data-cal-next aria-label="Próximo mês">${icon.arrow}</button>
      </div>
      <div class="cal__week" aria-hidden="true"><span>Dom</span><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span></div>
      <div class="cal__grid" data-cal-grid role="grid" aria-label="Dias do mês"></div>
      <div class="cal__legend" aria-hidden="true"><span><i class="lg lg--due"></i>Vencimento</span><span><i class="lg lg--today"></i>Hoje</span><span><i class="lg lg--done"></i>Cumprido</span></div>
      <div class="cal__detail" data-cal-detail aria-live="polite"></div>
    </div>
  </div>
</section>

<section class="sec" id="depoimentos" aria-labelledby="h-depo">
  <div class="wrap">
    <div class="sec-head sec-head--split">
      <h2 id="h-depo">O que dizem os nossos clientes</h2>
      <p class="rating"><b class="num">4,9</b><span><span class="stars" aria-hidden="true">${icon.star.repeat(5)}</span>120 avaliações de clientes</span></p>
    </div>
    <div class="reviews">${reviews
      .map(
        ([k, name, role, text], i) => `
      <figure class="review${i === 1 ? ' review--brand' : ''}">
        <span class="stars" aria-label="5 de 5 estrelas">${icon.star.repeat(5)}</span>
        <blockquote>${text}</blockquote>
        <figcaption>${img(photo[k], 52, 52, '')}<span><b>${name}</b>${role}</span></figcaption>
      </figure>`,
      )
      .join('')}
    </div>
  </div>
</section>

<section class="sec sec--soft" id="planos" aria-labelledby="h-planos">
  <div class="wrap">
    <div class="sec-head sec-head--center">
      <h2 id="h-planos">Planos simples, com valor fixo</h2>
      <p>Valores ilustrativos deste site de exemplo. A proposta real depende do porte da empresa.</p>
    </div>
    <div class="plans">${plans
      .map(
        (p) => `
      <article class="plan${p.featured ? ' plan--featured' : ''}">
        ${p.featured ? '<span class="plan__tag">Mais escolhido</span>' : ''}
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <p class="plan__price"><span>a partir de</span><b class="num">R$ ${p.price}</b><span>/mês</span></p>
        <ul class="ticks">${p.items.map((i) => `<li>${icon.check}${i}</li>`).join('')}</ul>
        <a class="btn ${p.featured ? 'btn--lime' : 'btn--outline'} btn--block" href="contato.html">Quero este plano</a>
      </article>`,
      )
      .join('')}
    </div>
  </div>
</section>

<section class="sec" id="duvidas" aria-labelledby="h-duvidas">
  <div class="wrap">
    <div class="sec-head sec-head--center">
      <h2 id="h-duvidas">Perguntas frequentes</h2>
      <p>Não achou a sua? Mande pelo WhatsApp e respondemos no mesmo dia.</p>
    </div>
    <div class="faq">${[faq.slice(0, 3), faq.slice(3)]
      .map(
        (col) => `
      <div>${col
        .map(
          ([q, a]) => `
        <details>
          <summary>${q}<i aria-hidden="true"></i></summary>
          <p>${a}</p>
        </details>`,
        )
        .join('')}
      </div>`,
      )
      .join('')}
    </div>
  </div>
</section>
${cta}`,
})

const pageHead = (crumb, title, text, photoId, alt) => `
<section class="pagehead">
  <div class="wrap pagehead__grid">
    <div>
      <p class="crumbs"><a href="index.html">Início</a> / ${crumb}</p>
      <h1>${title}</h1>
      <p>${text}</p>
    </div>
    <figure>${img(photoId, 560, 360, alt)}</figure>
  </div>
</section>`

const servicos = page({
  file: 'servicos.html',
  title: 'Serviços — Ventura Contabilidade',
  description: 'Abertura de empresa, contabilidade, folha, consultoria, planejamento tributário e regularização.',
  body: `${pageHead('Serviços', 'Nossos serviços', 'Tudo o que a sua empresa precisa em contabilidade, com um contador que conhece o seu negócio.', photo.calc, 'Calculadora sobre relatórios financeiros')}
<section class="sec" aria-labelledby="h-lista">
  <div class="wrap">
    <div class="sec-head"><h2 id="h-lista">Serviços oferecidos</h2></div>
    <div class="svc-grid">${services.map((s, i) => serviceCard(s, i, true)).join('')}
    </div>
  </div>
</section>
<section class="sec sec--soft" aria-labelledby="h-passos">
  <div class="wrap">
    <div class="sec-head sec-head--center"><h2 id="h-passos">Como começar</h2></div>
    <ol class="steps steps--row">
      <li><span class="steps__n">1</span><div><b>Conversa</b><p>Entendemos a sua empresa e as suas dúvidas. Sem custo.</p></div></li>
      <li><span class="steps__n">2</span><div><b>Proposta</b><p>Você recebe os serviços certos e um valor mensal fixo.</p></div></li>
      <li><span class="steps__n">3</span><div><b>Migração</b><p>Buscamos tudo com o contador atual. Você não faz nada.</p></div></li>
    </ol>
  </div>
</section>
${cta}`,
})

const team = [
  ['Carlos Ventura', 'Sócio-fundador', 'carlos'],
  ['Juliana Melo', 'Gerente fiscal', 'juliana'],
  ['Pedro Rocha', 'Departamento pessoal', 'pedro'],
  ['Larissa Nunes', 'Consultora financeira', 'larissa'],
]

const sobre = page({
  file: 'sobre.html',
  title: 'Sobre — Ventura Contabilidade',
  description: 'História, valores e equipe da Ventura Contabilidade.',
  body: `${pageHead('Sobre', 'Sobre a Ventura', 'Há 17 anos ajudando empresários do Piauí a entender e melhorar os próprios números.', photo.team, 'Equipe da Ventura reunida em volta da mesa')}
<section class="sec" aria-labelledby="h-historia">
  <div class="wrap about">
    <div>
      <h2 id="h-historia">Nossa história</h2>
      <p class="lead-text">A Ventura começou em 2009, quando Carlos Ventura decidiu fazer uma contabilidade próxima, clara e focada em ajudar o cliente a decidir melhor.</p>
      <ol class="timeline">
        <li><b class="num">2009</b><span>Fundação em Picos, com os primeiros 10 clientes.</span></li>
        <li><b class="num">2015</b><span>Criação da área de consultoria financeira.</span></li>
        <li><b class="num">2020</b><span>Atendimento 100% digital para todo o Piauí.</span></li>
        <li><b>Hoje</b><span>12 especialistas e mais de 320 empresas atendidas.</span></li>
      </ol>
    </div>
    <div class="values">
      <div class="value">${icon.shield}<div><b>Confiança</b><p>Prazos, valores e responsabilidades combinados por escrito.</p></div></div>
      <div class="value">${icon.chat}<div><b>Proximidade</b><p>Você fala com quem cuida da sua empresa, não com uma central.</p></div></div>
      <div class="value">${icon.chart}<div><b>Clareza</b><p>Relatórios simples para decisões rápidas e seguras.</p></div></div>
    </div>
  </div>
</section>
<section class="sec sec--soft" id="equipe" aria-labelledby="h-equipe">
  <div class="wrap">
    <div class="sec-head sec-head--center"><h2 id="h-equipe">Quem cuida da sua empresa</h2></div>
    <ul class="people">${team
      .map(
        ([name, role, key]) => `
      <li>${img(photo[key], 360, 420, `Foto de ${name}`)}<div><b>${name}</b><span>${role}</span></div></li>`,
      )
      .join('')}
    </ul>
  </div>
</section>
${cta}`,
})

const contato = page({
  file: 'contato.html',
  title: 'Contato — Ventura Contabilidade',
  description: 'Fale com a Ventura Contabilidade.',
  body: `${pageHead('Contato', 'Fale com um contador', 'Conte um pouco sobre a sua empresa. Um contador responde em até 1 dia útil.', photo.tablet, 'Contador sorrindo com um tablet')}
<section class="sec">
  <div class="wrap contact">
    <div class="contact__info">
      <div class="value">${icon.pin}<div><b>Endereço</b><p>Av. Central, 1200 — Centro, Picos — PI (fictício)</p></div></div>
      <div class="value">${icon.phone}<div><b>Telefone e WhatsApp</b><p class="num">(89) 0000-0000</p></div></div>
      <div class="value">${icon.mail}<div><b>E-mail</b><p>contato@ventura.exemplo</p></div></div>
      <div class="value">${icon.clock}<div><b>Horário</b><p>Segunda a sexta, das 8h às 18h</p></div></div>
    </div>
    ${leadForm('lead-contato')}
  </div>
</section>`,
})

for (const [name, html] of Object.entries({ 'index.html': home, 'servicos.html': servicos, 'sobre.html': sobre, 'contato.html': contato })) {
  writeFileSync(join(OUT, name), html)
}
for (const asset of ['style.css', 'script.js']) copyFileSync(join(HERE, asset), join(OUT, asset))
console.log('ok:', OUT)
