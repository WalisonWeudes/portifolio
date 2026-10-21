import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'ww-locale'
export const LOCALES = ['pt', 'en']

const detect = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (LOCALES.includes(saved)) return saved
  } catch {
    /* localStorage indisponível */
  }
  return navigator.language?.toLowerCase().startsWith('pt') ? 'pt' : 'en'
}

// Store mínima: o idioma vive fora do React e os componentes assinam via useI18n().
let locale = detect()
const listeners = new Set()

const subscribe = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
const getLocale = () => locale

const syncDocument = () => {
  document.documentElement.lang = locale === 'pt' ? 'pt-BR' : 'en'
  document.title = dict[locale]['meta.title']
}

export const setLocale = (value) => {
  if (!LOCALES.includes(value) || value === locale) return
  locale = value
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    /* ignore */
  }
  syncDocument()
  listeners.forEach((listener) => listener())
}

const dict = {
  pt: {
    'meta.title': 'Walison Weudes — Designer + Developer',
    'lang.switch': 'Mudar idioma',
    'nav.main': 'Navegação principal',
    'nav.quick': 'Navegação rápida',
    'nav.home': 'Início',
    'nav.work': 'Trabalhos',
    'nav.about': 'Sobre',
    'nav.experience': 'Experiência',
    'nav.experienceShort': 'Exp.',
    'nav.stack': 'Stack',
    'nav.contact': 'Contato',
    'brand.aria': 'Walison — início',

    'hero.eyebrow': 'Design, código e direção visual.',
    'hero.intro': 'Eu projeto interfaces e desenvolvo produtos digitais do conceito ao código.',
    'hero.cta': 'Ver projetos',
    'resume.download': 'Baixar currículo',
    'resume.short': 'Currículo',
    'hero.location': 'Picos, PI — Brasil',
    'hero.available': 'Disponível para projetos',
    'hero.scroll': 'Scroll',
    'hero.portraitAlt': 'Ilustração autoral de Walison',

    'projects.label': 'Trabalhos selecionados',
    'projects.title1': 'PROJETOS',
    'projects.title2': 'SELECIONADOS',
    'projects.desc':
      'Sistemas reais e projetos acadêmicos em que design, arquitetura e desenvolvimento trabalham juntos.',
    'projects.open': 'Abrir projeto',
    'projects.openAria': 'Abrir projeto',
    'projects.previewAlt': 'Preview do projeto',

    'figma.label': 'UI/UX — ARQUIVOS EDITÁVEIS',
    'figma.title1': 'DO RASCUNHO',
    'figma.title2': 'À INTERFACE.',
    'figma.download': 'BAIXAR .FIG',
    'figma.wire': 'ESQUEMA',
    'figma.preview': 'PRÉVIA',
    'nav.top': 'Voltar ao topo',
    'manifesto.label': '00.5 / Manifesto',
    'manifesto.text': 'Todo projeto é um *universo* diferente. Meu trabalho é fazer _design_ e *código* falarem a mesma língua, do primeiro rascunho no Figma ao último commit em produção.',

    'about.label': '02 / Sobre / Formação',
    'about.title1': 'DESIGN,',
    'about.title2': 'TECNOLOGIA',
    'about.title3': 'E CRIATIVIDADE.',
    'about.lead': 'Sou Walison Weudes, desenvolvedor Full Stack com foco em front-end e UI/UX.',
    'about.p1':
      'Curso Sistemas de Informação na Universidade Federal do Piauí, no Campus Senador Helvídio Nunes de Barros. Hoje atuo na ISESMT, em sistemas SaaS de saúde e segurança do trabalho, e nos projetos PREMAUT e TB-Koch, na UFPI.',
    'about.p2':
      'Vou do protótipo no Figma ao código em React, Next.js e TypeScript, passando por back-end, APIs e qualidade de software (QA), sempre buscando clareza no uso e consistência na implementação.',
    'about.mainAlt': 'Campus da Universidade Federal do Piauí em Picos',
    'about.detailAlt': 'Vista externa da UFPI em Picos',
    'about.badge': 'UFPI — PICOS',

    'experience.label': 'Experiência',
    'experience.title1': 'PRÁTICA',
    'experience.title2': 'EM CAMPO.',
    'experience.desc': 'Trabalho profissional, projetos acadêmicos e design.',
    'stats.label': 'Números da experiência',

    'stack.label': '04 — Stack',
    'stack.title1': 'FERRAMENTAS',
    'stack.title2': 'DE TRABALHO.',

    'illustrations.label': '05 — Explorações visuais',
    'illustrations.title1': 'OUTRO LADO',
    'illustrations.title2': 'DO PROCESSO.',
    'illustrations.desc': 'Ilustração e character design também fazem parte do meu repertório visual.',
    'lightbox.close': 'FECHAR ×',
    'lightbox.closeAria': 'Fechar imagem',
    'lightbox.prev': 'Imagem anterior',
    'lightbox.next': 'Próxima imagem',

    'contact.label': '06 — Contato',
    'contact.available': 'Disponível para projetos',
    'contact.title1': 'TEM UMA IDEIA?',
    'contact.title2': 'VAMOS CONSTRUIR',
    'contact.title3': 'ALGO JUNTOS.',
    'contact.email': '01 / Seu e-mail',
    'contact.emailPh': 'voce@exemplo.com',
    'contact.subject': '02 / Assunto',
    'contact.subjectPh': 'Sobre o que vamos conversar?',
    'contact.message': '03 / Mensagem',
    'contact.messagePh': 'Conte um pouco mais...',
    'contact.send': 'Enviar mensagem',
    'contact.replyTo': 'E-mail para retorno:',
    'footer.top': 'VOLTAR AO TOPO ↑',

    'spider.hint': 'SACUDA O MOUSE RÁPIDO PARA SE SOLTAR',
    'loader.aria': 'Entrando no multiverso',
    'loader.s1': 'ABRINDO FENDA DIMENSIONAL',
    'loader.s2': 'ESTABILIZANDO TEIA',
    'loader.s3': 'SINCRONIZANDO UNIVERSOS',
    'loader.s4': 'CALIBRANDO GLITCH',
    'loader.done': 'REALIDADE ESTABILIZADA',
    'loader.enter': 'ENTRANDO NO MULTIVERSO',
  },
  en: {
    'meta.title': 'Walison Weudes — Designer + Developer',
    'lang.switch': 'Change language',
    'nav.main': 'Main navigation',
    'nav.quick': 'Quick navigation',
    'nav.home': 'Home',
    'nav.work': 'Work',
    'nav.about': 'About',
    'nav.experience': 'Experience',
    'nav.experienceShort': 'Exp.',
    'nav.stack': 'Stack',
    'nav.contact': 'Contact',
    'brand.aria': 'Walison — home',

    'hero.eyebrow': 'Design, code and visual direction.',
    'hero.intro': 'I design interfaces and build digital products from concept to code.',
    'hero.cta': 'View projects',
    'resume.download': 'Download resume (PT)',
    'resume.short': 'Resume (PT)',
    'hero.location': 'Picos, PI — Brazil',
    'hero.available': 'Available for projects',
    'hero.scroll': 'Scroll',
    'hero.portraitAlt': "Walison's self-made illustration",

    'projects.label': 'Selected work',
    'projects.title1': 'SELECTED',
    'projects.title2': 'PROJECTS',
    'projects.desc':
      'Real systems and academic projects where design, architecture and development work together.',
    'projects.open': 'Open project',
    'projects.openAria': 'Open project',
    'projects.previewAlt': 'Project preview',

    'figma.label': 'UI/UX — EDITABLE FILES',
    'figma.title1': 'FROM SKETCH',
    'figma.title2': 'TO INTERFACE.',
    'figma.download': 'DOWNLOAD .FIG',
    'figma.wire': 'WIREFRAME',
    'figma.preview': 'PREVIEW',
    'nav.top': 'Back to top',
    'manifesto.label': '00.5 / Manifesto',
    'manifesto.text': 'Every project is a different *universe.* My job is to make _design_ and *code* speak the same language, from the first Figma sketch to the last commit in production.',

    'about.label': '02 / About / Education',
    'about.title1': 'DESIGN,',
    'about.title2': 'TECHNOLOGY',
    'about.title3': 'AND CREATIVITY.',
    'about.lead': "I'm Walison Weudes, a Full Stack developer focused on front-end and UI/UX.",
    'about.p1':
      "I'm studying Information Systems at the Federal University of Piauí, Senador Helvídio Nunes de Barros Campus. Today I work at ISESMT on occupational health and safety SaaS systems, and on the PREMAUT and TB-Koch projects at UFPI.",
    'about.p2':
      'I go from the Figma prototype to code in React, Next.js and TypeScript, through back-end, APIs and software quality (QA), always aiming for clarity of use and consistency in implementation.',
    'about.mainAlt': 'Federal University of Piauí campus in Picos',
    'about.detailAlt': 'Outside view of UFPI in Picos',
    'about.badge': 'UFPI — PICOS',

    'experience.label': 'Experience',
    'experience.title1': 'HANDS-ON',
    'experience.title2': 'EXPERIENCE.',
    'experience.desc': 'Professional work, academic projects and design.',
    'stats.label': 'Experience in numbers',

    'stack.label': '04 — Stack',
    'stack.title1': 'TOOLS',
    'stack.title2': 'OF THE TRADE.',

    'illustrations.label': '05 — Visual explorations',
    'illustrations.title1': 'THE OTHER SIDE',
    'illustrations.title2': 'OF THE PROCESS.',
    'illustrations.desc': 'Illustration and character design are also part of my visual repertoire.',
    'lightbox.close': 'CLOSE ×',
    'lightbox.closeAria': 'Close image',
    'lightbox.prev': 'Previous image',
    'lightbox.next': 'Next image',

    'contact.label': '06 — Contact',
    'contact.available': 'Available for projects',
    'contact.title1': 'GOT AN IDEA?',
    'contact.title2': "LET'S BUILD",
    'contact.title3': 'SOMETHING TOGETHER.',
    'contact.email': '01 / Your email',
    'contact.emailPh': 'you@example.com',
    'contact.subject': '02 / Subject',
    'contact.subjectPh': 'What should we talk about?',
    'contact.message': '03 / Message',
    'contact.messagePh': 'Tell me a bit more...',
    'contact.send': 'Send message',
    'contact.replyTo': 'Reply-to email:',
    'footer.top': 'BACK TO TOP ↑',

    'spider.hint': 'SHAKE THE MOUSE FAST TO BREAK FREE',
    'loader.aria': 'Entering the multiverse',
    'loader.s1': 'OPENING DIMENSIONAL RIFT',
    'loader.s2': 'STABILIZING THE WEB',
    'loader.s3': 'SYNCING UNIVERSES',
    'loader.s4': 'CALIBRATING GLITCH',
    'loader.done': 'REALITY STABILIZED',
    'loader.enter': 'ENTERING THE MULTIVERSE',
  },
}

/** Texto de interface pela chave. */
const translate = (lang, key) => dict[lang][key] ?? dict.pt[key] ?? key

/** Resolve um valor de conteúdo: string simples ou { pt, en }. */
const resolve = (lang, value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value[lang] ?? value.pt) : value

/** Idioma atual + helpers de tradução; re-renderiza o componente quando o idioma muda. */
export function useI18n() {
  const lang = useSyncExternalStore(subscribe, getLocale)
  return {
    locale: lang,
    setLocale,
    t: (key) => translate(lang, key),
    tr: (value) => resolve(lang, value),
    trList: (list) => (list || []).map((value) => resolve(lang, value)),
  }
}

syncDocument()
