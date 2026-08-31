<template>
  <PageLoader />
  <main class="site-shell">
    <SpiderWalker />
    <header class="topbar" :class="{ 'is-scrolled': isScrolled }">
      <a class="brand" href="#inicio" aria-label="Walison — início">W<span>W</span></a>
      <p class="topbar__role">Designer + Developer</p>
      <nav class="topbar__links" aria-label="Navegação principal">
        <a href="#projetos">Work</a><a href="#sobre">Sobre</a><a href="#experiencia">Experiência</a><a href="#contato">Contato</a>
      </nav>
      <button class="menu-toggle" type="button" :aria-expanded="menuOpen" aria-controls="mobile-menu" :aria-label="menuOpen ? 'Fechar menu' : 'Abrir menu'" @click="menuOpen = !menuOpen">
        <span></span><span></span>
      </button>
    </header>

    <div id="mobile-menu" class="mobile-menu" :class="{ 'is-open': menuOpen }" :aria-hidden="!menuOpen">
      <p>00 — Navegação</p>
      <nav aria-label="Navegação mobile">
        <a v-for="item in navItems" :key="item.href" :href="item.href" @click="menuOpen = false"><span>{{ item.number }}</span>{{ item.label }}</a>
      </nav>
      <a href="mailto:weudesw0@gmail.com">weudesw0@gmail.com ↗</a>
    </div>

    <section id="inicio" class="hero" aria-labelledby="hero-title">
      <div class="hero__halftone" aria-hidden="true"></div>
      <p class="hero__background" aria-hidden="true">WALISON</p>
      <div class="hero__meta hero__meta--left"><span>00 / HOME</span><span>Picos, PI — Brasil</span></div>
      <div class="hero__meta hero__meta--right"><span>{{ currentYear }}</span><span class="availability"><i></i> Disponível para projetos</span></div>
      <div class="hero__content">
        <div class="hero__headline reveal">
          <p class="eyebrow">Design, código e direção visual.</p>
          <GlitchHeroTitle />
          <div class="hero__intro">
            <p>Eu projeto interfaces e desenvolvo produtos digitais do conceito ao código.</p>
            <a class="text-link" href="#projetos">Ver projetos <span>↗</span></a>
          </div>
        </div>
        <div class="hero__portrait">
          <div class="hero__portrait-frame"><img src="/imagens/foro%20porti.png" alt="Ilustração autoral de Walison" fetchpriority="high" /></div>
          <span class="portrait-mark">+</span><span class="portrait-caption">FULL STACK / UI DESIGN</span>
        </div>
      </div>
      <a class="scroll-cue" href="#projetos">Scroll <span>↓</span></a>
    </section>

    <div class="marquee" aria-hidden="true"><div>DESIGN ✦ DEVELOPMENT ✦ UI/UX ✦ FRONT-END ✦ DESIGN ✦ DEVELOPMENT ✦ UI/UX ✦ FRONT-END ✦</div></div>

    <section id="projetos" class="section work" aria-labelledby="projects-title">
      <header class="section-heading reveal">
        <div><span>01</span><p>Selected work</p></div>
        <h2 id="projects-title">PROJETOS<br /><em>SELECIONADOS</em></h2>
        <p>Sistemas reais e projetos acadêmicos em que design, arquitetura e desenvolvimento trabalham juntos.</p>
      </header>
      <div class="cases">
        <article v-for="(project, index) in projects" :key="project.title" class="case reveal" :class="[`case--${index + 1}`, { 'case--reverse': index === 1 }]">
          <div class="case__visual" :class="`case__visual--${index + 1}`">
            <a class="case__preview" :href="project.url" target="_blank" rel="noreferrer" :aria-label="`Abrir projeto ${project.title}`">
              <img :src="project.preview" :alt="`Preview do projeto ${project.title}`" loading="lazy" decoding="async" />
              <span class="case__open">Abrir projeto <i>↗</i></span>
            </a>
            <span class="case__index">0{{ index + 1 }}</span>
          </div>
          <div class="case__info">
            <div class="case__meta"><span>{{ project.category }}</span><span>{{ project.year }}</span></div>
            <h3>{{ project.title }}</h3><p>{{ project.description }}</p>
            <ul><li v-for="tag in project.tags" :key="tag">{{ tag }}</li></ul>
            <span class="case__status">{{ project.status }}</span>
          </div>
        </article>
      </div>
    </section>

    <section id="figma" class="section figma-section" aria-labelledby="figma-title">
      <header class="compact-heading reveal"><span>UI/UX — ARQUIVOS EDITÁVEIS</span><h2 id="figma-title">DO RASCUNHO<br />À INTERFACE.</h2></header>
      <div class="figma-list">
        <a v-for="(project, index) in figmaProjects" :key="project.title" class="figma-row reveal" :href="project.file" download>
          <span>0{{ index + 1 }}</span><div><small>{{ project.type }}</small><h3>{{ project.title }}</h3></div><p>{{ project.description }}</p><strong>BAIXAR .FIG <i>↗</i></strong>
        </a>
      </div>
    </section>

    <section id="sobre" class="section about" aria-labelledby="about-title">
      <span class="section-number" aria-hidden="true">02</span>
      <header class="about__title reveal"><p>02 / Sobre / Formação</p><h2 id="about-title">DESIGN,<br /><em>TECNOLOGIA</em><br />E CRIATIVIDADE.</h2></header>
      <div class="about__media">
        <img class="about__campus-main" src="/imagens/ufpi_picos.jpg" alt="Campus da Universidade Federal do Piauí em Picos" loading="lazy" decoding="async" @error="$event.currentTarget.src = '/imagens/UFPI-Picos.jpg'" />
        <img class="about__campus-detail" src="/imagens/UFPI-Picos.jpg" alt="Vista externa da UFPI em Picos" loading="lazy" decoding="async" @error="$event.currentTarget.hidden = true" />
        <span>UFPI — PICOS</span>
      </div>
      <div class="about__copy reveal"><p class="about__lead">Sou Walison Weudes. Trabalho entre desenvolvimento Full Stack, UI/UX e design gráfico.</p><p>Curso Sistemas de Informação na Universidade Federal do Piauí, no Campus Senador Helvídio Nunes de Barros. A graduação e os projetos práticos formam minha base em desenvolvimento web, arquitetura de software, bancos de dados e design centrado no usuário.</p><p>Minha atuação passa por aplicações web e mobile, APIs, protótipos e interfaces, sempre buscando clareza no uso e consistência na implementação.</p></div>
    </section>

    <section id="experiencia" class="section experience" aria-labelledby="experience-title">
      <header class="section-heading reveal"><div><span>03</span><p>Experiência</p></div><h2 id="experience-title">PRÁTICA<br /><em>EM CAMPO.</em></h2><p>Projetos, design e ensino desenvolvidos durante a formação.</p></header>
      <ol class="experience-list">
        <li v-for="activity in activities" :key="activity.title" class="reveal"><time>{{ activity.year }}</time><div><h3>{{ activity.title }}</h3><span>{{ activity.role }}</span></div><p>{{ activity.description }}</p><i>↗</i></li>
      </ol>
    </section>

    <section id="habilidades" class="section stack" aria-labelledby="stack-title">
      <header class="compact-heading reveal"><span>04 — Stack</span><h2 id="stack-title">FERRAMENTAS<br />DE TRABALHO.</h2></header>
      <div class="stack__groups">
        <div v-for="group in skillGroups" :key="group.title" class="stack__group reveal"><span>{{ group.number }}</span><h3>{{ group.title }}</h3><ul><li v-for="item in group.items" :key="item">{{ item }}</li></ul></div>
      </div>
    </section>

    <section id="ilustracoes" class="section illustrations" aria-labelledby="illustrations-title">
      <header class="illustrations__header reveal"><div><span>05 — Explorações visuais</span><h2 id="illustrations-title">OUTRO LADO<br />DO PROCESSO.</h2></div><p>Ilustração e character design também fazem parte do meu repertório visual.</p></header>
      <div class="illustration-grid">
        <button v-for="illustration in illustrations" :key="illustration.title" type="button" class="illustration-item" @click="selectedIllustration = illustration"><img :src="illustration.thumbnail" :alt="illustration.alt" loading="lazy" decoding="async" @error="$event.currentTarget.src = illustration.image" /><span>{{ illustration.title }} <i>↗</i></span></button>
      </div>
    </section>

    <div v-if="selectedIllustration" class="lightbox" role="dialog" aria-modal="true" :aria-label="`Ilustração ${selectedIllustration.title}`" @click.self="selectedIllustration = null"><button type="button" aria-label="Fechar imagem" @click="selectedIllustration = null">FECHAR ×</button><img :src="selectedIllustration.image" :alt="selectedIllustration.alt" /><p>{{ selectedIllustration.title }}</p></div>

    <section id="contato" class="contact" aria-labelledby="contact-title">
      <div class="contact__top reveal"><span>06 — Contato</span><p>Picos, PI — Brasil<br />Disponível para projetos</p></div>
      <h2 id="contact-title" class="reveal">TEM UMA IDEIA?<br /><em>VAMOS CONSTRUIR</em><br />ALGO JUNTOS. <span>↗</span></h2>
      <div class="contact__bottom">
        <div class="contact__links reveal"><a href="mailto:weudesw0@gmail.com">weudesw0@gmail.com ↗</a><div><a v-for="social in socials" :key="social.name" :href="social.href" target="_blank" rel="noreferrer">{{ social.name }} ↗</a></div></div>
        <form class="contact__form reveal" @submit.prevent="sendEmail"><label for="contact-email">01 / Seu e-mail</label><input id="contact-email" v-model.trim="contactForm.email" type="email" autocomplete="email" placeholder="voce@exemplo.com" required /><label for="contact-subject">02 / Assunto</label><input id="contact-subject" v-model.trim="contactForm.subject" type="text" placeholder="Sobre o que vamos conversar?" required /><label for="contact-message">03 / Mensagem</label><textarea id="contact-message" v-model.trim="contactForm.message" rows="3" placeholder="Conte um pouco mais..." required></textarea><button class="text-link" type="submit">Enviar mensagem <span>↗</span></button></form>
      </div>
      <footer><span>© {{ currentYear }} WALISON WEUDES</span><a href="#inicio">VOLTAR AO TOPO ↑</a><span>DESIGN + CODE</span></footer>
    </section>
  </main>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import GlitchHeroTitle from './components/GlitchHeroTitle.vue'
import PageLoader from './components/PageLoader.vue'
import SpiderWalker from './components/SpiderWalker.vue'

const currentYear = new Date().getFullYear()
const selectedIllustration = ref(null)
const contactForm = ref({ email: '', subject: '', message: '' })
const menuOpen = ref(false)
const isScrolled = ref(false)
let revealObserver
let subtleGlitchTimer

const titleFontPool = [
  "Chetta, Impact, 'Arial Narrow', sans-serif",
  "Odeto, 'Courier New', monospace",
  "Georgia, 'Times New Roman', serif",
  "'Courier New', Monaco, monospace",
  "Impact, 'Arial Black', sans-serif",
  "Inter, 'Segoe UI', sans-serif",
]

const triggerSubtleGlitch = (el) => {
  if (!el || el.classList.contains('subtle-title-glitch-active')) return
  el.classList.add('subtle-title-glitch-active')

  const originalFont = el.style.fontFamily || ''

  let count = 0
  const fontShiftInterval = setInterval(() => {
    el.style.fontFamily = titleFontPool[Math.floor(Math.random() * titleFontPool.length)]
    count += 1
    if (count >= 3) {
      clearInterval(fontShiftInterval)
      el.style.fontFamily = originalFont
    }
  }, 65)

  setTimeout(() => {
    el.classList.remove('subtle-title-glitch-active')
    el.style.fontFamily = originalFont
  }, 240)
}

const sendEmail = () => {
  const body = `E-mail para retorno: ${contactForm.value.email}\n\n${contactForm.value.message}`
  window.location.href = `mailto:weudesw0@gmail.com?subject=${encodeURIComponent(contactForm.value.subject)}&body=${encodeURIComponent(body)}`
}
const closeOnEscape = (event) => { if (event.key === 'Escape') { selectedIllustration.value = null; menuOpen.value = false } }
const onScroll = () => { isScrolled.value = window.scrollY > 32 }

onMounted(() => {
  window.addEventListener('keydown', closeOnEscape)
  window.addEventListener('scroll', onScroll, { passive: true })
  const items = document.querySelectorAll('.reveal, .reveal-image')
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) items.forEach((item) => item.classList.add('is-visible'))
  else { revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target) } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }); items.forEach((item) => revealObserver.observe(item)) }

  const sectionTitles = document.querySelectorAll('.section-heading h2, .compact-heading h2, .about h2, .illustrations h2, .contact h2, .case__info h3, .figma-row h3, .stack__group h3, .experience-list h3')
  sectionTitles.forEach((title) => {
    title.addEventListener('mouseenter', () => triggerSubtleGlitch(title))
  })

  const scheduleSubtleGlitch = () => {
    const delay = 7000 + Math.random() * 8000
    subtleGlitchTimer = setTimeout(() => {
      if (sectionTitles.length > 0) {
        const randomTitle = sectionTitles[Math.floor(Math.random() * sectionTitles.length)]
        triggerSubtleGlitch(randomTitle)
      }
      scheduleSubtleGlitch()
    }, delay)
  }
  scheduleSubtleGlitch()
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', closeOnEscape)
  window.removeEventListener('scroll', onScroll)
  revealObserver?.disconnect()
  if (subtleGlitchTimer) clearTimeout(subtleGlitchTimer)
})

const navItems = [{ number: '01', label: 'Work', href: '#projetos' }, { number: '02', label: 'Sobre', href: '#sobre' }, { number: '03', label: 'Experiência', href: '#experiencia' }, { number: '04', label: 'Stack', href: '#habilidades' }, { number: '05', label: 'Contato', href: '#contato' }]
const socials = [{ name: 'GitHub', href: 'https://github.com/WalisonWeudes' }, { name: 'Instagram', href: 'https://www.instagram.com/walison_w0?igsh=a2c1cmpydnBpbG42' }, { name: 'LinkedIn', href: 'https://www.linkedin.com/in/walisonweudes' }]
const projects = [
  { status: 'TCC em desenvolvimento', title: 'Sistema de Detecção de Dislexia', category: 'Pesquisa / Desenvolvimento', year: '2026', description: 'Análise de atividades e escrita manuscrita para identificar possíveis indícios de dislexia.', tags: ['OCR', 'Processamento de texto', 'Modelos preditivos'], url: 'https://dislexyall.vercel.app/', preview: '/imagens/projetos/dislexyall.png' },
  { status: 'Projeto UFPI', title: 'PREMAUT', category: 'Full Stack / UI/UX', year: '2026', description: 'Sistema desenvolvido entre arquitetura, interfaces web, fluxos de navegação e experiência do usuário.', tags: ['Full Stack', 'UI/UX', 'Arquitetura'], url: 'https://premaut.ufpi.br/', preview: '/imagens/projetos/premaut.png' },
  { status: 'Projeto UFPI', title: 'TB-Koch', category: 'Web / Mobile', year: '2025—26', description: 'Aplicação web e mobile com APIs, integrações externas, VPS, domínio e deploy.', tags: ['Web', 'Mobile', 'APIs REST', 'VPS'], url: 'https://tbkoch.com/#/', preview: '/imagens/projetos/tbkoch.png' },
]
const figmaProjects = [
  { type: 'Identidade e serviço', title: 'Barbearia', description: 'Serviços, agendamento e contato direto.', file: '/arquivos/barbearia.fig' },
  { type: 'Dashboard', title: 'Financeiro', description: 'Indicadores, registros e movimentações.', file: '/arquivos/Finaceiro.fig' },
  { type: 'Educação e evento', title: 'Mini Cursos Geek', description: 'Divulgação, hierarquia e inscrição.', file: '/arquivos/mini%20cursos%20geek.fig' },
  { type: 'Sistema acadêmico', title: 'PREMAUT', description: 'Telas e fluxos para operação de dados.', file: '/arquivos/PREMAUT.fig' },
]
const skillGroups = [
  { number: '01', title: 'Front-end', items: ['React', 'Vue', 'Quasar', 'TypeScript', 'JavaScript', 'HTML / CSS'] },
  { number: '02', title: 'Back-end', items: ['Node.js', 'FastAPI', 'APIs REST', 'PostgreSQL', 'Modelagem de dados'] },
  { number: '03', title: 'Design', items: ['Figma', 'UI Design', 'UX Design', 'Prototipagem', 'Design gráfico'] },
  { number: '04', title: 'Outros', items: ['Flutter', 'Git / GitHub', 'Docker', 'Firebase', 'Deploy em VPS'] },
]
const activities = [
  { year: '2026', title: 'PREMAUT — UFPI', role: 'Full Stack / UI/UX', description: 'Arquitetura, implementação de funcionalidades e organização visual das telas.' },
  { year: '2025—26', title: 'TB-Koch — UFPI', role: 'Desenvolvimento', description: 'Front-end, back-end, mobile, APIs, deploy, domínio e ambiente em VPS.' },
  { year: '2025—26', title: 'JUÁ', role: 'Designer', description: 'Peças visuais, ilustrações, estampas, redes sociais e projetos UI/UX.' },
  { year: 'ATUAL', title: 'Monitoria e minicursos', role: 'Ensino', description: 'Apoio em programação web, UI/UX e boas práticas de desenvolvimento.' },
  { year: 'ATUAL', title: 'Iniciação tecnológica', role: 'Tecnologia', description: 'Projetos práticos, integrações, organização de código e soluções de TI.' },
]
const illustrations = [
  { title: 'Carmilla', image: '/desenhos/carmilla.png', thumbnail: '/desenhos/thumbs/carmilla.jpg', alt: 'Ilustração Carmilla' }, { title: 'Doroki', image: '/desenhos/doroki.png', thumbnail: '/desenhos/thumbs/doroki.jpg', alt: 'Ilustração Doroki' }, { title: 'Juarezd', image: '/desenhos/juarezd.png', thumbnail: '/desenhos/thumbs/juarezd.jpg', alt: 'Ilustração Juarezd' }, { title: 'O arreio de ouro', image: '/desenhos/O%20arreio%20de%20ouro.png', thumbnail: '/desenhos/thumbs/O%20arreio%20de%20ouro.jpg', alt: 'Ilustração O arreio de ouro' }, { title: 'Personagens', image: '/desenhos/personagens.png', thumbnail: '/desenhos/thumbs/personagens.jpg', alt: 'Conjunto de personagens ilustrados' }, { title: 'Soul', image: '/desenhos/soul.png', thumbnail: '/desenhos/thumbs/soul.jpg', alt: 'Ilustração Soul' },
]
</script>
