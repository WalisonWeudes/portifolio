// Conteúdo do portfólio. Textos { pt, en } são resolvidos por `tr()` (src/i18n).
// Textos de interface ficam em src/i18n/index.js.

export const EMAIL = 'weudesw0@gmail.com'

const L = (pt, en = pt) => ({ pt, en })

export const topbarLinks = [
  { key: 'nav.work', href: '#projetos' },
  { key: 'nav.about', href: '#sobre' },
  { key: 'nav.experience', href: '#experiencia' },
  { key: 'nav.contact', href: '#contato' },
]

export const dockItems = [
  { number: '00', key: 'nav.home', href: '#inicio' },
  { number: '01', key: 'nav.work', href: '#projetos' },
  { number: '02', key: 'nav.about', href: '#sobre' },
  { number: '03', key: 'nav.experienceShort', href: '#experiencia' },
  { number: '04', key: 'nav.contact', href: '#contato' },
]

export const socials = [
  { name: 'GitHub', href: 'https://github.com/WalisonWeudes' },
  { name: 'Instagram', href: 'https://www.instagram.com/walison_w0?igsh=a2c1cmpydnBpbG42' },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/walisonweudes' },
]

export const projects = [
  {
    status: L('TCC em desenvolvimento', 'Thesis in progress'),
    title: L('Sistema de Detecção de Dislexia', 'Dyslexia Detection System'),
    category: L('Pesquisa / Desenvolvimento', 'Research / Development'),
    year: '2026',
    description: L(
      'Análise de atividades e escrita manuscrita para identificar possíveis indícios de dislexia.',
      'Analysis of activities and handwriting to identify possible signs of dyslexia.',
    ),
    tags: [
      L('OCR'),
      L('Processamento de texto', 'Text processing'),
      L('Modelos preditivos', 'Predictive models'),
    ],
    url: 'https://dislexyall.vercel.app/',
    preview: '/imagens/projetos/dislexyall.png',
  },
  {
    status: L('Projeto UFPI', 'UFPI project'),
    title: L('PREMAUT'),
    category: L('Full Stack / UI/UX'),
    year: '2026',
    description: L(
      'Frontend e backend do sistema: arquitetura, funcionalidades, interfaces web e fluxos de navegação.',
      'Frontend and backend of the system: architecture, features, web interfaces and navigation flows.',
    ),
    tags: [L('Full Stack'), L('UI/UX'), L('Arquitetura', 'Architecture')],
    url: 'https://premaut.ufpi.br/',
    preview: '/imagens/projetos/premaut.png',
  },
  {
    status: L('Projeto UFPI', 'UFPI project'),
    title: L('TB-Koch'),
    category: L('Web / Mobile'),
    year: '2025—26',
    description: L(
      'Aplicações web, mobile e APIs, com integração a serviços externos, VPS, domínio, deploy e identidade visual.',
      'Web, mobile and API applications with external service integrations, VPS, domain, deployment and visual identity.',
    ),
    tags: [L('Web'), L('Mobile'), L('APIs REST'), L('VPS')],
    url: 'https://tbkoch.com/#/',
    preview: '/imagens/projetos/tbkoch.png',
  },
]

export const figmaProjects = [
  {
    type: L('Identidade e serviço', 'Identity and service'),
    title: L('Barbearia', 'Barbershop'),
    description: L('Serviços, agendamento e contato direto.', 'Services, booking and direct contact.'),
    file: '/arquivos/barbearia.fig',
  },
  {
    type: L('Dashboard'),
    title: L('Financeiro', 'Finance'),
    description: L('Indicadores, registros e movimentações.', 'Indicators, records and transactions.'),
    file: '/arquivos/Finaceiro.fig',
  },
  {
    type: L('Educação e evento', 'Education and event'),
    title: L('Mini Cursos Geek'),
    description: L('Divulgação, hierarquia e inscrição.', 'Promotion, hierarchy and sign-up.'),
    file: '/arquivos/mini%20cursos%20geek.fig',
  },
  {
    type: L('Sistema acadêmico', 'Academic system'),
    title: L('PREMAUT'),
    description: L('Telas e fluxos para operação de dados.', 'Screens and flows for data operations.'),
    file: '/arquivos/PREMAUT.fig',
  },
]

export const skillGroups = [
  {
    number: '01',
    title: L('Front-end'),
    items: ['React', 'Next.js', 'TypeScript', 'Vue.js', 'Tailwind CSS', 'HTML / CSS'],
  },
  {
    number: '02',
    title: L('Back-end e dados', 'Back-end and data'),
    items: ['Node.js / Express', 'FastAPI', 'APIs REST', 'PostgreSQL', 'MySQL', 'Firebase'],
  },
  {
    number: '03',
    title: L('Design'),
    items: [
      'Figma',
      'UI / UX',
      L('Prototipagem', 'Prototyping'),
      L('Design responsivo', 'Responsive design'),
      L('Identidade visual', 'Visual identity'),
    ],
  },
  {
    number: '04',
    title: L('Mobile, DevOps e QA', 'Mobile, DevOps and QA'),
    items: [
      'Flutter',
      'Docker',
      'Git / GitHub',
      L('Deploy em VPS', 'VPS deployment'),
      L('Testes automatizados', 'Automated testing'),
      'Jira',
    ],
  },
]

export const activities = [
  {
    year: L('2026—ATUAL', '2026—NOW'),
    title: L('ISESMT'),
    role: L('Desenvolvedor Full Stack / QA', 'Full Stack Developer / QA'),
    description: L(
      'Três sistemas SaaS de saúde e segurança do trabalho (Gerencia SST, Avalia NR01 e Avalia NR17): telas, laudos em PDF, pagamentos, integrações, segurança entre clientes e testes automatizados.',
      'Three occupational health and safety SaaS systems (Gerencia SST, Avalia NR01 and Avalia NR17): screens, PDF reports, payments, integrations, tenant data security and automated tests.',
    ),
  },
  {
    year: L('2026—ATUAL', '2026—NOW'),
    title: L('PREMAUT — UFPI'),
    role: L('Full Stack / UI/UX'),
    description: L(
      'Frontend e backend, arquitetura, implementação de funcionalidades, fluxos de navegação e organização visual das telas.',
      'Frontend and backend, architecture, feature implementation, navigation flows and visual organization of the screens.',
    ),
  },
  {
    year: L('2025—ATUAL', '2025—NOW'),
    title: L('TB-Koch — UFPI'),
    role: L('Full Stack / UI/UX'),
    description: L(
      'Aplicações web, mobile e APIs; integração com serviços externos, VPS, domínio e deploy; telas, identidade visual e componentes de interface.',
      'Web, mobile and API applications; external service integrations, VPS, domain and deployment; screens, visual identity and interface components.',
    ),
  },
  {
    year: '2025—26',
    title: L('JUÁ Empresa Júnior', 'JUÁ Junior Company'),
    role: L('Designer'),
    description: L(
      'Peças visuais, ilustrações, estampas, materiais para redes sociais e projetos de interface UI/UX.',
      'Visual pieces, illustrations, prints, social media materials and UI/UX interface projects.',
    ),
  },
  {
    year: L('ATUAL', 'NOW'),
    title: L('Monitoria e minicursos', 'Tutoring and short courses'),
    role: L('Ensino', 'Teaching'),
    description: L(
      'Apoio em programação web, UI/UX e boas práticas de desenvolvimento.',
      'Support in web programming, UI/UX and development best practices.',
    ),
  },
  {
    year: L('ATUAL', 'NOW'),
    title: L('Iniciação tecnológica', 'Technology research initiation'),
    role: L('Tecnologia', 'Technology'),
    description: L(
      'Projetos práticos, integrações, organização de código e soluções de TI.',
      'Hands-on projects, integrations, code organization and IT solutions.',
    ),
  },
]

// Números do currículo (ISESMT, ago–out de 2026)
export const stats = [
  { value: 889, label: L('commits em 3 meses', 'commits in 3 months') },
  { value: 149, label: L('tarefas concluídas', 'tasks completed') },
  { value: 3, label: L('sistemas SaaS em produção', 'SaaS systems in production') },
  {
    text: L('150s → 40s', '150s → 40s'),
    label: L('para abrir um laudo de 138 páginas', 'to open a 138-page report'),
  },
]

const illustration = (title, file, alt) => ({
  title,
  alt,
  image: `/desenhos/${file}.png`,
  thumbnail: `/desenhos/thumbs/${file}.jpg`,
})

export const illustrations = [
  illustration(L('Carmilla'), 'carmilla', L('Ilustração Carmilla', 'Carmilla illustration')),
  illustration(L('Doroki'), 'doroki', L('Ilustração Doroki', 'Doroki illustration')),
  illustration(L('Juarezd'), 'juarezd', L('Ilustração Juarezd', 'Juarezd illustration')),
  illustration(
    L('O arreio de ouro', 'The golden harness'),
    'O%20arreio%20de%20ouro',
    L('Ilustração O arreio de ouro', 'The golden harness illustration'),
  ),
  illustration(
    L('Personagens', 'Characters'),
    'personagens',
    L('Conjunto de personagens ilustrados', 'Set of illustrated characters'),
  ),
  illustration(L('Soul'), 'soul', L('Ilustração Soul', 'Soul illustration')),
]

export const SPIDER_FRAME_COUNT = 60
export const spiderFrames = Array.from(
  { length: SPIDER_FRAME_COUNT },
  (_, i) => `/imagens/aranha-frames/frame-${String(i).padStart(2, '0')}.png`,
)
