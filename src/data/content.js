// Conteúdo do portfólio. Textos { pt, en } são resolvidos por `tr()` (src/i18n).
// Textos de interface ficam em src/i18n/index.js.

export const EMAIL = 'weudesw0@gmail.com'
export const RESUME_URL = '/curriculo-walison-weudes.pdf'

const L = (pt, en = pt) => ({ pt, en })

export const topbarLinks = [
  { key: 'nav.work', href: '#projetos' },
  { key: 'nav.products', href: '#produtos' },
  { key: 'nav.about', href: '#sobre' },
  { key: 'nav.experience', href: '#experiencia' },
  { key: 'nav.contact', href: '#contato' },
]

// Tipos de site/landing page que eu ofereço. `status: 'soon'` = protótipo ainda não publicado;
// quando houver um, adicione `preview` (imagem) e/ou `href` (link do protótipo).
export const products = [
  {
    tag: L('Empresa', 'Business'),
    title: L('Site institucional', 'Company website'),
    description: L(
      'Várias páginas para apresentar a empresa, os serviços e a equipe, com contato direto.',
      'Multi-page site to present the company, its services and team, with direct contact.',
    ),
    items: [L('Páginas de serviços', 'Service pages'), L('Sobre e equipe', 'About and team'), L('Contato e mapa', 'Contact and map')],
    href: '/exemplos/site-institucional/index.html',
  },
  {
    tag: L('Empresa', 'Business'),
    title: L('Landing page para empresa', 'Business landing page'),
    description: L(
      'Uma página só, direta ao ponto, para transformar visitas em clientes.',
      'A single, to-the-point page that turns visits into customers.',
    ),
    items: [L('Chamada principal', 'Hero and call to action'), L('Benefícios e provas', 'Benefits and proof'), L('Botão de WhatsApp', 'WhatsApp button')],
    href: '/exemplos/landing-page/index.html',
  },
  {
    tag: L('Vendas', 'Sales'),
    title: L('Venda de produto', 'Product sales page'),
    description: L(
      'Página de conversão para lançar ou vender um produto físico ou digital.',
      'Conversion page to launch or sell a physical or digital product.',
    ),
    items: [L('Oferta e preço', 'Offer and pricing'), L('Depoimentos', 'Testimonials'), L('Perguntas frequentes', 'FAQ')],
    href: '/exemplos/venda-produto/index.html',
  },
  {
    tag: L('Pessoal', 'Personal'),
    title: L('Portfólio', 'Portfolio'),
    description: L(
      'Vitrine para designers, fotógrafos, devs e criativos mostrarem o próprio trabalho.',
      'A showcase for designers, photographers, devs and creatives to show their work.',
    ),
    items: [L('Galeria de projetos', 'Project gallery'), L('Sobre e currículo', 'About and résumé'), L('Links e contato', 'Links and contact')],
    status: 'soon',
  },
  {
    tag: L('Estudante', 'Student'),
    title: L('Página para estudante', 'Student page'),
    description: L(
      'Sua primeira presença online: projetos da faculdade, certificados e currículo em um link.',
      'Your first online presence: college projects, certificates and résumé in one link.',
    ),
    items: [L('Projetos acadêmicos', 'Academic projects'), L('Certificados', 'Certificates'), L('Currículo para baixar', 'Downloadable résumé')],
    status: 'soon',
  },
  {
    tag: L('Profissional', 'Professional'),
    title: L('Profissional liberal', 'Independent professional'),
    description: L(
      'Para médicos, advogados, psicólogos e consultores passarem confiança e receberem agendamentos.',
      'For doctors, lawyers, therapists and consultants to build trust and take bookings.',
    ),
    items: [L('Especialidades', 'Specialties'), L('Agendamento', 'Booking'), L('Localização', 'Location')],
    status: 'soon',
  },
  {
    tag: L('Evento', 'Event'),
    title: L('Evento e curso', 'Event and course'),
    description: L(
      'Divulgação de evento, palestra ou curso com programação e inscrição.',
      'Promote an event, talk or course with schedule and sign-up.',
    ),
    items: [L('Programação', 'Schedule'), L('Palestrantes', 'Speakers'), L('Inscrição', 'Sign-up')],
    status: 'soon',
  },
  {
    tag: L('Comércio', 'Retail'),
    title: L('Restaurante e loja local', 'Restaurant and local shop'),
    description: L(
      'Cardápio ou catálogo online com horários, endereço e pedido pelo WhatsApp.',
      'Online menu or catalog with hours, address and ordering via WhatsApp.',
    ),
    items: [L('Cardápio ou catálogo', 'Menu or catalog'), L('Horários e endereço', 'Hours and address'), L('Pedido no WhatsApp', 'WhatsApp ordering')],
    status: 'soon',
  },
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
    preview: '/imagens/projetos/dislexyall.webp',
  },
  {
    status: L('Sistema SaaS em produção — ISESMT', 'SaaS system in production — ISESMT'),
    title: L('Avalia NR01'),
    category: L('UX / Full Stack'),
    year: '2026',
    description: L(
      'Sistema de avaliação de riscos psicossociais (NR-01). Do login em diante, refiz e organizei toda a experiência do sistema: fluxos, telas, painel de indicadores e relatórios da empresa.',
      'Psychosocial risk assessment system (NR-01). From the login onward, I redesigned and organized the whole system experience: flows, screens, indicators dashboard and company reports.',
    ),
    tags: [L('UX'), L('UI'), L('SaaS'), L('Dashboard')],
    url: 'https://app.avalianr01.com.br/login',
    preview: '/imagens/projetos/avalianr01.webp',
  },
  {
    status: L('Sistema SaaS em produção — ISESMT', 'SaaS system in production — ISESMT'),
    title: L('Avalia NR17'),
    category: L('Full Stack / UX'),
    year: '2026',
    description: L(
      'Sistema de análise ergonômica (NR-17), onde fui o principal desenvolvedor: laudo AET em PDF no padrão ABNT (de 150 s para 40 s em 138 páginas), coleta em campo pelo celular, cálculos ergonômicos e medição de postura com IA no navegador.',
      'Ergonomic analysis system (NR-17), where I was the lead developer: ABNT-standard AET report in PDF (from 150 s to 40 s for 138 pages), mobile field data collection, ergonomic calculations and in-browser AI posture measurement.',
    ),
    tags: [L('Full Stack'), L('UX'), L('PDF'), L('IA / MediaPipe', 'AI / MediaPipe')],
    url: 'https://app.avalianr17.com.br/login',
    preview: '/imagens/projetos/avalianr17.webp',
  },
  {
    status: L('Redesign no ar — ISESMT', 'Live redesign — ISESMT'),
    title: L('ISESMT — Plataforma de treinamentos', 'ISESMT — Training platform'),
    category: L('UX / UI / Motion'),
    year: '2026',
    description: L(
      'Plataforma de treinamentos online em saúde e segurança do trabalho, com validação de certificado por QR Code. Fiz o UX do novo design e um vídeo em motion apresentando a transição do design antigo para o novo.',
      'Online occupational health and safety training platform with QR Code certificate validation. I did the UX for the new design and a motion video presenting the transition from the old design to the new one.',
    ),
    tags: [L('UX'), L('UI'), L('Redesign'), L('Motion')],
    url: 'https://isesmt.com/',
    preview: '/imagens/projetos/isesmt.webp',
  },
  {
    status: L('Prototipação e liderança do projeto', 'Prototyping and project co-lead'),
    title: L('SINFO 2026'),
    category: L('UI/UX / Prototipação', 'UI/UX / Prototyping'),
    year: '2026',
    description: L(
      'Site do Simpósio de Sistemas de Informação da UFPI. Participei ativamente da prototipação e das decisões de layout, liderando o projeto junto com uma colega da equipe.',
      "Website for UFPI's Information Systems Symposium. I was actively involved in prototyping and layout decisions, co-leading the project with a teammate.",
    ),
    tags: [L('Prototipação', 'Prototyping'), L('Layout'), L('UI/UX'), L('Liderança', 'Leadership')],
    url: 'https://sinfo-ufpi.com.br/',
    preview: '/imagens/projetos/sinfo.webp',
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
    preview: '/imagens/projetos/premaut.webp',
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
    preview: '/imagens/projetos/tbkoch.webp',
  },
]

export const figmaProjects = [
  {
    type: L('Identidade e serviço', 'Identity and service'),
    title: L('Barbearia', 'Barbershop'),
    description: L('Serviços, agendamento e contato direto.', 'Services, booking and direct contact.'),
    file: '/arquivos/barbearia.fig',
    kind: 'booking',
    preview: '/imagens/figma/barbearia.webp',
  },
  {
    type: L('Dashboard'),
    title: L('Financeiro', 'Finance'),
    description: L('Indicadores, registros e movimentações.', 'Indicators, records and transactions.'),
    file: '/arquivos/Finaceiro.fig',
    kind: 'dashboard',
  },
  {
    type: L('Educação e evento', 'Education and event'),
    title: L('Mini Cursos Geek'),
    description: L('Divulgação, hierarquia e inscrição.', 'Promotion, hierarchy and sign-up.'),
    file: '/arquivos/mini%20cursos%20geek.fig',
    kind: 'event',
    preview: '/imagens/figma/mini-cursos-geek.webp',
  },
  {
    type: L('Sistema acadêmico', 'Academic system'),
    title: L('PREMAUT'),
    description: L('Telas e fluxos para operação de dados.', 'Screens and flows for data operations.'),
    file: '/arquivos/PREMAUT.fig',
    kind: 'system',
    preview: '/imagens/figma/premaut.webp',
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
    year: L('SET 2026—ATUAL', 'SEP 2026—NOW'),
    title: L('ISESMT'),
    role: L('Desenvolvedor Full Stack', 'Full Stack Developer'),
    description: L(
      'Front e back em quatro produtos de saúde e segurança do trabalho: Gerencia SST, Avalia NR17, Avalia NR01 e a Plataforma de Treinamentos. Transformo normas e métodos de SST (RULA, REBA, NIOSH, COPSOQ, PGR, PCMSO) em funcionalidades, gero relatórios em PDF no padrão ABNT, cuido do módulo financeiro, audito a segurança e o isolamento entre clientes, escrevo testes automatizados e lidero módulos: especifico, divido épicos e integro PRs. Também criei um protótipo de visão computacional com MediaPipe que mede ângulos posturais, levado ao Avalia NR17.',
      'Front and back end across four occupational health and safety products: Gerencia SST, Avalia NR17, Avalia NR01 and the Training Platform. I turn safety standards and methods (RULA, REBA, NIOSH, COPSOQ, PGR, PCMSO) into features, build ABNT-standard PDF reports, handle the finance module, audit security and tenant isolation, write automated tests and lead modules: specs, epic breakdown and PR integration. I also built a MediaPipe computer-vision prototype that measures posture angles, shipped to Avalia NR17.',
    ),
    tags: ['Next.js', 'React', 'TypeScript', 'Node', 'Django', 'Prisma', 'Drizzle', 'MySQL'],
    photo: '/imagens/isesmt.webp',
    photoAlt: L('Walison com a camisa da ISESMT na mesa de trabalho, com o notebook e o monitor ao fundo', 'Walison wearing the ISESMT shirt at his desk, with laptop and monitor behind him'),
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

// Em campo: fotos de eventos, palestras e minicursos.
// Para adicionar uma foto: coloque as imagens em public/imagens/em-campo/ e copie um item abaixo.
//   card  → recorte vertical 4:5 que aparece na seção
//   image → foto inteira, aberta ao clicar
//   date  → opcional
export const fieldwork = [
  {
    card: '/imagens/em-campo/sinfo-dislexyall-card.webp',
    image: '/imagens/em-campo/sinfo-dislexyall.webp',
    event: L('SINFO — UFPI'),
    title: L('Apresentação do Dislexyall', 'Presenting Dislexyall'),
    role: L('Artigo aprovado · Apresentador', 'Accepted paper · Speaker'),
    description: L(
      'Apresentei o Dislexyall, meu projeto de detecção de indícios de dislexia, depois de ter o artigo sobre ele aprovado no Simpósio de Sistemas de Informação da UFPI. Mostrei a plataforma web na prática, incluindo o módulo de atividades pedagógicas gamificadas.',
      'I presented Dislexyall, my project for detecting signs of dyslexia, after its paper was accepted at UFPI’s Information Systems Symposium. I demoed the web platform, including the gamified learning activities module.',
    ),
    alt: L(
      'Walison no palco do auditório apresentando o slide "A plataforma web na prática" do Dislexyall',
      'Walison on the auditorium stage presenting the Dislexyall slide "The web platform in practice"',
    ),
  },
  {
    card: '/imagens/em-campo/geek-day-minicurso-card.webp',
    image: '/imagens/em-campo/geek-day-minicurso.webp',
    event: L('Geek Day — UFPI'),
    title: L('Minicurso de Design Web', 'Web Design Mini-course'),
    role: L('Instrutor', 'Instructor'),
    description: L(
      'Ministrei um minicurso sobre design web: layout, cores, tipografia, imagens e ícones, responsividade, usabilidade e acessibilidade.',
      'I taught a mini-course on web design: layout, color, typography, images and icons, responsiveness, usability and accessibility.',
    ),
    alt: L(
      'Walison apresentando o slide "O que é design web?" em uma sala de aula',
      'Walison presenting the slide "What is web design?" in a classroom',
    ),
  },
]

// Números da ISESMT (histórico git e Jira, ago–out de 2026)
export const stats = [
  { value: 1575, label: L('commits em 6 repositórios', 'commits across 6 repositories') },
  { value: 330, label: L('cards concluídos no Jira', 'Jira cards completed') },
  { value: 4, label: L('produtos de SST, front e back', 'safety products, front and back') },
  {
    text: L('150s → 40s', '150s → 40s'),
    label: L('para abrir um laudo de 138 páginas', 'to open a 138-page report'),
  },
]

const illustration = (title, file, alt) => ({
  title,
  alt,
  image: `/desenhos/${file}.webp`,
  thumbnail: `/desenhos/thumbs/${file}.webp`,
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

