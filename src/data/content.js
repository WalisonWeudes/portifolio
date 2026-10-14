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
      'Sistema desenvolvido entre arquitetura, interfaces web, fluxos de navegação e experiência do usuário.',
      'System built across architecture, web interfaces, navigation flows and user experience.',
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
      'Aplicação web e mobile com APIs, integrações externas, VPS, domínio e deploy.',
      'Web and mobile application with APIs, external integrations, VPS, domain and deployment.',
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
  { number: '01', title: L('Front-end'), items: ['React', 'Vue', 'Quasar', 'TypeScript', 'JavaScript', 'HTML / CSS'] },
  {
    number: '02',
    title: L('Back-end'),
    items: ['Node.js', 'FastAPI', 'APIs REST', 'PostgreSQL', L('Modelagem de dados', 'Data modeling')],
  },
  {
    number: '03',
    title: L('Design'),
    items: ['Figma', 'UI Design', 'UX Design', L('Prototipagem', 'Prototyping'), L('Design gráfico', 'Graphic design')],
  },
  {
    number: '04',
    title: L('Outros', 'Other'),
    items: ['Flutter', 'Git / GitHub', 'Docker', 'Firebase', L('Deploy em VPS', 'VPS deployment')],
  },
]

export const activities = [
  {
    year: '2026',
    title: L('PREMAUT — UFPI'),
    role: L('Full Stack / UI/UX'),
    description: L(
      'Arquitetura, implementação de funcionalidades e organização visual das telas.',
      'Architecture, feature implementation and visual organization of the screens.',
    ),
  },
  {
    year: '2025—26',
    title: L('TB-Koch — UFPI'),
    role: L('Desenvolvimento', 'Development'),
    description: L(
      'Front-end, back-end, mobile, APIs, deploy, domínio e ambiente em VPS.',
      'Front-end, back-end, mobile, APIs, deployment, domain and VPS environment.',
    ),
  },
  {
    year: '2025—26',
    title: L('JUÁ'),
    role: L('Designer'),
    description: L(
      'Peças visuais, ilustrações, estampas, redes sociais e projetos UI/UX.',
      'Visual pieces, illustrations, prints, social media and UI/UX projects.',
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
