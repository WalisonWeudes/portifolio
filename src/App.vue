<template>
  <main class="site-shell" :data-theme="theme">
    <ClickSpark
      spark-color="#123cff"
      :spark-size="12"
      :spark-radius="22"
      :spark-count="8"
      :duration="420"
      easing="ease-out"
      :extra-scale="1.15"
    >
    <nav class="topbar" aria-label="Navegação principal">
      <div class="topbar__links">
        <a href="#inicio">Início</a>
        <a href="#formacao">Formação</a>
        <a href="#habilidades">Skills</a>
        <a href="#projetos">Projetos</a>
        <a href="#figma">UI/UX</a>
        <a href="#ilustracoes">Ilustrações</a>
        <a href="#atividades">Experiências</a>
        <a href="#contato">Contato</a>
      </div>
      <button
        class="theme-toggle"
        type="button"
        :aria-label="theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'"
        :title="theme === 'dark' ? 'Tema claro' : 'Tema escuro'"
        @click="toggleTheme"
      >
        <span aria-hidden="true">{{ theme === 'dark' ? '☾' : '☀' }}</span>
      </button>
    </nav>

    <section class="hero" aria-labelledby="hero-title">
      <div class="hero__overlay"></div>

      <div id="inicio" class="hero__content">
        <div class="hero__text">
          <p class="eyebrow">Meu</p>
          <h1 id="hero-title" class="hero__title" data-text="Portfólio">Portfólio</h1>
          <p class="hero__role">Full Stack Developer e UX/UI Designer</p>
          <p class="hero__description">
            Olá! Eu sou Walison Weudes. Atuo em desenvolvimento Full Stack, UI/UX Design e design
            gráfico, criando aplicações web e mobile, APIs, interfaces, protótipos e soluções digitais
            com foco em clareza, performance e experiência do usuário.
          </p>

          <div class="hero__actions" aria-label="Ações principais">
            <a class="button button--primary" href="#habilidades">
              <span aria-hidden="true">#</span>
              Ver competências
            </a>
            <a class="button button--ghost" href="#contato">
              <span aria-hidden="true">@</span>
              Falar comigo
            </a>
          </div>
        </div>

        <div class="hero__visual" aria-label="Identidade visual do portfólio">
          <div class="glow"></div>
          <img src="/imagens/teste.png" alt="Logotipo do portfólio" />
          <div class="hero__badge">
            <strong>Full Stack</strong>
            <span>Web, mobile, APIs e interfaces</span>
          </div>
        </div>
      </div>

      <div class="marquee" aria-hidden="true">
        <div class="marquee__track">
          <span>Projetos modernos</span>
          <span>Interfaces responsivas</span>
          <span>APIs REST</span>
          <span>Código limpo</span>
          <span>Deploy em VPS</span>
          <span>Projetos modernos</span>
          <span>Interfaces responsivas</span>
          <span>APIs REST</span>
          <span>Código limpo</span>
          <span>Deploy em VPS</span>
        </div>
      </div>
    </section>

    <section id="formacao" class="section section--split reveal" aria-labelledby="formacao-title">
      <div class="section__media">
        <img src="/imagens/ufpi_picos.jpg" alt="Campus da Universidade Federal do Piauí em Picos" />
        <img src="/imagens/UFPI-Picos.jpg" alt="Vista externa da UFPI Picos" />
      </div>

      <div class="section__content">
        <p class="section__kicker">Formação</p>
        <h2 id="formacao-title">Formação em andamento com prática real.</h2>
        <p>
          Atualmente curso Bacharelado em Sistemas de Informação na Universidade Federal do Piauí
          (UFPI), no Campus Senador Helvídio Nunes de Barros, em Picos. Ao longo da graduação, venho
          desenvolvendo uma base técnica em desenvolvimento web, arquitetura de software, bancos de
          dados e design centrado no usuário.
        </p>
        <p>
          A participação em projetos acadêmicos e práticos tem fortalecido minha atuação em front-end,
          back-end, pesquisa de usabilidade, comunicação e resolução de problemas reais.
        </p>
      </div>
    </section>

    <section id="habilidades" class="section reveal" aria-labelledby="skills-title">
      <div class="section__header">
        <p class="section__kicker">Stack</p>
        <h2 id="skills-title">Competências e tecnologias</h2>
      </div>

      <ul class="skills-grid">
        <li v-for="skill in skills" :key="skill.title" class="skill-card">
          <span class="skill-card__icon" aria-hidden="true">{{ skill.icon }}</span>
          <div>
            <h3>{{ skill.title }}</h3>
            <p>{{ skill.items }}</p>
          </div>
        </li>
      </ul>
    </section>

    <section id="projetos" class="section reveal" aria-labelledby="projects-title">
      <div class="section__header">
        <p class="section__kicker">Projetos</p>
        <h2 id="projects-title">Soluções acadêmicas e sistemas reais</h2>
      </div>

      <div class="projects-grid">
        <article v-for="project in projects" :key="project.title" class="project-card">
          <span>{{ project.status }}</span>
          <h3>{{ project.title }}</h3>
          <p>{{ project.description }}</p>
          <ul>
            <li v-for="tag in project.tags" :key="tag">{{ tag }}</li>
          </ul>
        </article>
      </div>
    </section>

    <section id="figma" class="section reveal" aria-labelledby="figma-title">
      <div class="section__header">
        <p class="section__kicker">Figma</p>
        <h2 id="figma-title">Projetos de interface com arquivos editáveis</h2>
      </div>

      <div class="figma-grid">
        <article
          v-for="(project, index) in figmaProjects"
          :key="project.title"
          class="figma-card"
          :class="`figma-card--${index + 1}`"
        >
          <div class="figma-card__preview" aria-hidden="true">
            <div class="figma-card__window">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div class="figma-card__screen">
              <div class="figma-card__hero-line"></div>
              <div class="figma-card__rows">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div class="figma-card__tiles">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>

          <div class="figma-card__body">
            <span>{{ project.type }}</span>
            <h3>{{ project.title }}</h3>
            <p>{{ project.description }}</p>
            <a :href="project.file" download>
              Baixar arquivo .fig
            </a>
          </div>
        </article>
      </div>
    </section>

    <section id="ilustracoes" class="section reveal" aria-labelledby="illustrations-title">
      <div class="section__header">
        <p class="section__kicker">Desenhos</p>
        <h2 id="illustrations-title">Ilustrações e estudos visuais</h2>
      </div>

      <div class="illustration-grid">
        <article
          v-for="illustration in illustrations"
          :key="illustration.title"
          class="illustration-card"
          role="button"
          tabindex="0"
          :aria-label="`Abrir ilustração ${illustration.title}`"
          @click="selectedIllustration = illustration"
          @keydown.enter="selectedIllustration = illustration"
          @keydown.space.prevent="selectedIllustration = illustration"
        >
          <img :src="illustration.image" :alt="illustration.alt" loading="lazy" />
          <div>
            <span>{{ illustration.type }}</span>
            <h3>{{ illustration.title }}</h3>
          </div>
        </article>
      </div>
    </section>

    <div
      v-if="selectedIllustration"
      class="lightbox"
      role="dialog"
      aria-modal="true"
      :aria-label="`Ilustração ${selectedIllustration.title}`"
      @click.self="selectedIllustration = null"
    >
      <button class="lightbox__close" type="button" aria-label="Fechar imagem" @click="selectedIllustration = null">
        X
      </button>
      <img :src="selectedIllustration.image" :alt="selectedIllustration.alt" />
      <p>{{ selectedIllustration.title }}</p>
    </div>

    <section id="atividades" class="section reveal" aria-labelledby="activities-title">
      <div class="section__header">
        <p class="section__kicker">Experiências</p>
        <h2 id="activities-title">Experiência prática</h2>
      </div>

      <ol class="activity-list">
        <li v-for="activity in activities" :key="activity.title">
          <span aria-hidden="true"></span>
          <div>
            <h3>{{ activity.title }}</h3>
            <p>{{ activity.description }}</p>
          </div>
        </li>
      </ol>
    </section>

    <section id="contato" class="contact reveal" aria-labelledby="contact-title">
      <div>
        <p class="section__kicker">Contato</p>
        <h2 id="contact-title">Vamos construir algo com boa experiência e bom código.</h2>
        <div class="contact__items">
          <a href="mailto:weudesw0@gmail.com">weudesw0@gmail.com</a>
          <a href="tel:+5589994684730">+55 89 99468-4730</a>
        </div>
      </div>
      <a class="button button--primary" href="mailto:weudesw0@gmail.com">
        <span aria-hidden="true">@</span>
        Enviar mensagem
      </a>
    </section>

    <div class="floating-social" :class="{ 'is-open': socialOpen }">
      <a
        v-for="social in socials"
        :key="social.label"
        class="floating-social__item"
        :class="`floating-social__item--${social.key}`"
        :href="social.href"
        :aria-label="social.label"
        target="_blank"
        rel="noreferrer"
      >
        <span aria-hidden="true">{{ social.icon }}</span>
      </a>

      <button
        class="floating-link"
        type="button"
        :aria-expanded="socialOpen"
        aria-label="Abrir links sociais"
        @click="socialOpen = !socialOpen"
      >
        <img src="/imagens/icons8-link.gif" alt="" />
      </button>
    </div>
    </ClickSpark>
  </main>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import ClickSpark from './components/ClickSpark.vue'

const theme = ref('light')
const socialOpen = ref(false)
const selectedIllustration = ref(null)

const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
}

const socials = [
  {
    key: 'github',
    label: 'Abrir GitHub',
    icon: 'GH',
    href: 'https://github.com/WalisonWeudes',
  },
  {
    key: 'instagram',
    label: 'Abrir Instagram',
    icon: 'IG',
    href: 'https://www.instagram.com/walison_w0?igsh=a2c1cmpydnBpbG42',
  },
  {
    key: 'linkedin',
    label: 'Abrir LinkedIn',
    icon: 'in',
    href: 'https://www.linkedin.com/in/walisonweudes',
  },
]

onMounted(() => {
  const savedTheme = window.localStorage.getItem('portfolio-theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  theme.value = savedTheme || (prefersDark ? 'dark' : 'light')
  window.addEventListener('keydown', closeLightboxOnEscape)
})

onUnmounted(() => {
  window.removeEventListener('keydown', closeLightboxOnEscape)
})

const closeLightboxOnEscape = (event) => {
  if (event.key === 'Escape') {
    selectedIllustration.value = null
  }
}

watch(
  theme,
  (value) => {
    document.documentElement.dataset.theme = value
    window.localStorage.setItem('portfolio-theme', value)
  },
  { immediate: true },
)

const skills = [
  {
    icon: '</>',
    title: 'Desenvolvimento Web',
    items: 'React, TypeScript, Vue, Quasar, HTML, CSS e JavaScript',
  },
  {
    icon: '{}',
    title: 'Back-end',
    items: 'Node.js, FastAPI, APIs REST, integrações e regras de negócio',
  },
  {
    icon: 'SQL',
    title: 'Banco de dados',
    items: 'PostgreSQL, modelagem de banco de dados e integração com APIs',
  },
  {
    icon: 'Mob',
    title: 'Mobile',
    items: 'Flutter, aplicações mobile e comunicação com serviços externos',
  },
  {
    icon: 'UI',
    title: 'UX/UI Design',
    items: 'Figma, prototipagem, organização visual de telas e fluxos de navegação',
  },
  {
    icon: 'Ops',
    title: 'Ferramentas e deploy',
    items: 'Git, GitHub, Docker, Firebase, VS Code, documentação técnica e deploy em VPS',
  },
]

const projects = [
  {
    status: 'TCC em desenvolvimento',
    title: 'Sistema de Detecção de Dislexia',
    description:
      'Projeto acadêmico voltado à análise de atividades e escrita manuscrita para identificar possíveis indícios de dislexia.',
    tags: ['OCR', 'Processamento de texto', 'Modelos preditivos'],
  },
  {
    status: 'UFPI',
    title: 'PREMAUT',
    description:
      'Sistema com atuação em frontend, backend, arquitetura, interfaces web, fluxos de navegação e melhoria da experiência do usuário.',
    tags: ['Full Stack', 'UI/UX', 'Arquitetura'],
  },
  {
    status: 'UFPI',
    title: 'TB-Koch',
    description:
      'Aplicação web e mobile com APIs, integrações externas, configuração de VPS, domínio, deploy e comunicação entre aplicação e API.',
    tags: ['Web', 'Mobile', 'APIs REST', 'VPS'],
  },
]

const figmaProjects = [
  {
    type: 'Identidade e serviço',
    title: 'Barbearia',
    description:
      'Interface para negócio local com foco em apresentação de serviços, agendamento e comunicação direta com o cliente.',
    file: '/arquivos/barbearia.fig',
  },
  {
    type: 'Dashboard',
    title: 'Financeiro',
    description:
      'Projeto de interface para organização financeira, leitura rápida de indicadores, registros e acompanhamento de movimentações.',
    file: '/arquivos/Finaceiro.fig',
  },
  {
    type: 'Educação e evento',
    title: 'Mini Cursos Geek',
    description:
      'Experiência visual para divulgação de minicursos, com linguagem jovem, hierarquia clara e foco em inscrição.',
    file: '/arquivos/mini%20cursos%20geek.fig',
  },
  {
    type: 'Sistema acadêmico',
    title: 'PREMAUT',
    description:
      'Protótipo de sistema com telas organizadas para fluxos de navegação, uso acadêmico e operação de dados.',
    file: '/arquivos/PREMAUT.fig',
  },
]

const illustrations = [
  {
    title: 'Carmilla',
    type: 'Personagem',
    image: '/desenhos/carmilla.png',
    alt: 'Ilustração Carmilla',
  },
  {
    title: 'Doroki',
    type: 'Personagem',
    image: '/desenhos/doroki.png',
    alt: 'Ilustração Doroki',
  },
  {
    title: 'Juarezd',
    type: 'Estudo visual',
    image: '/desenhos/juarezd.png',
    alt: 'Ilustração Juarezd',
  },
  {
    title: 'O arreio de ouro',
    type: 'Composição',
    image: '/desenhos/O%20arreio%20de%20ouro.png',
    alt: 'Ilustração O arreio de ouro',
  },
  {
    title: 'Personagens',
    type: 'Character design',
    image: '/desenhos/personagens.png',
    alt: 'Conjunto de personagens ilustrados',
  },
  {
    title: 'Soul',
    type: 'Arte digital',
    image: '/desenhos/soul.png',
    alt: 'Ilustração Soul',
  },
]

const activities = [
  {
    title: 'Projeto PREMAUT - UFPI',
    description:
      'Desde março de 2026, atuo como Desenvolvedor Full Stack e UI/UX Designer, participando da arquitetura, implementação de funcionalidades e organização visual das telas.',
  },
  {
    title: 'Projeto TB-Koch - UFPI',
    description:
      'Desde outubro de 2025, contribuo com desenvolvimento e manutenção do sistema, incluindo frontend, backend, mobile, APIs, deploy, domínio e ambiente em VPS.',
  },
  {
    title: 'UI/UX Designer',
    description:
      'Criação de telas web e mobile, organização visual de componentes, identidade visual e definição de fluxos de navegação.',
  },
  {
    title: 'JUÁ - Designer',
    description:
      'Desde outubro de 2025, atuo na empresa júnior JUÁ com peças visuais, ilustrações, estampas, materiais para redes sociais e projetos UI/UX.',
  },
  {
    title: 'Monitoria e minicursos',
    description:
      'Apoio alunos em programação web e minicursos sobre desenvolvimento web, UI/UX e boas práticas de programação.',
  },
  {
    title: 'Iniciação tecnológica',
    description:
      'Atuação em projetos de tecnologia com desenvolvimento prático, integrações, organização de código e soluções de TI.',
  },
]
</script>
