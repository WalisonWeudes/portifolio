<template>
  <div class="hero">
    <!-- Imagem e Título -->
    <div class="imagem-container">
      <div class="titulo-container" role="group" aria-label="Título e cargo">
        <h2 class="titulo-superior">MEU</h2>
        <h1 class="texton-logo-trans">PORTIFÓLIO</h1>
        <div class="luminoxidade"></div>
        <h1 class="texton-logo-normal">PORTIFÓLIO</h1>
        <h2 class="titulo-inferior">FULL STACK e UX/UI DESIGNER</h2>
        <h4 class="subtitulo">
          Olá! eu sou Walison Weudes. E este é o meu portfólio, um espaço onde compartilho meus projetos,
          aprendizados e experiências no mundo da tecnologia. Cada código,
          interface ou solução apresentada aqui representa parte da minha jornada
          como desenvolvedor e a busca constante por aperfeiçoar minhas
          habilidades. Meu objetivo é criar soluções eficientes, criativas e que
          realmente façam a diferença.
        </h4>
        <img src="/imagens/teste.png" alt="Logotipo" class="imagem-centro" />

        <div class="barra-carrocel">
          <!-- Barra animada -->
          <div class="texto-carrocel">
            <span>
              Projeto novo no ar! &nbsp;&nbsp; Confira meu portfólio atualizado!
              &nbsp;&nbsp; Criação de sites modernos e responsivos! &nbsp;&nbsp;
              Fale comigo para colaborar!
            </span>
            <span>
              Projeto novo no ar! &nbsp;&nbsp; Confira meu portfólio atualizado!
              &nbsp;&nbsp; Criação de sites modernos e responsivos! &nbsp;&nbsp;
              Fale comigo para colaborar!
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Espaço para rolagem -->
    <section class="sessao-universidade" aria-labelledby="uni-title">
      <div class="container-universidade" role="group" aria-label="Foto e texto sobre universidade">
        <div class="texto-universidade" role="article">
          <!-- <div class="luminoxidade" style="left: 4%;z-index: -1;"></div> -->
          <img src="../public/imagens/ufpi_picos.jpg" alt="Foto da Universidade" />
          <img
            src="../public/imagens/UFPI-Picos.jpg"
            alt="Foto da Universidade"
            style="top: 50%;left: 15%;z-index: -1;"
          />
          <h3 id="uni-title">Formação Universitária</h3>
          <p>
            Estudei na Universidade Federal do Piauí (UFPI), no Campus Senador Helvídio Nunes de Barros,
            em Picos, onde aprofundei meus conhecimentos em desenvolvimento web, arquitetura de software
            e design centrado no usuário. Durante a graduação, participei de projetos práticos que
            integravam front-end, back-end e pesquisa em usabilidade, sempre com foco na criação de
            soluções eficientes e acessíveis.
          </p>
          <p>
            Essas experiências me proporcionaram uma base técnica sólida, além do desenvolvimento de
            habilidades essenciais de trabalho em equipe, comunicação e resolução de problemas, que
            aplico atualmente em projetos full-stack e em soluções de UX/UI voltadas à experiência real
            e às necessidades dos usuários.
          </p>
        </div>
      </div>
    </section>

    <section class="sessao-habilidades" aria-labelledby="skills-title">
      <div class="container-habilidades">
        <h3 id="skills-title">Habilidades e Tecnologias</h3>

        <ul class="timeline">
          <li><strong>Desenvolvimento Front-end:</strong> HTML, CSS, JavaScript, TypeScript, Vue.js, React</li>
          <li><strong>Desenvolvimento Back-end:</strong> Node.js, Express, Python</li>
          <li><strong>Design UX/UI:</strong> Figma, prototipagem e testes de usabilidade</li>
          <li><strong>Bancos de Dados:</strong> MySQL, MongoDB</li>
          <li><strong>Controle de Versão:</strong> Git, GitHub</li>
          <li><strong>Metodologias Ágeis:</strong> Scrum, Kanban</li>
          <li><strong>Outras Linguagens/Skills:</strong> C, Dart, Bash, Haskell, JSON</li>
        </ul>
      </div>

      <div class="container-Atividades">
        <h3 id="activities-title">Atividades Complementares</h3>

        <ul class="timelineS">
          <li>
            <strong>Desenvolvedor IT (Iniciação Tecnológica):</strong> Atuei em projetos de tecnologia,
            desenvolvendo habilidades práticas em programação e soluções de TI.
          </li>
          <li>
            <strong>Projeto de Extensão UFPI – TB-KOCH:</strong> Participei do projeto voltado para o
            tratamento da tuberculose, contribuindo com tecnologia e suporte ao gerenciamento de dados.
          </li>
          <li>
            <strong>Monitor de Programação Web – UFPI:</strong> Auxiliei alunos em aulas de programação web,
            promovendo aprendizado prático e suporte pedagógico.
          </li>
          <li>
            <strong>Palestrante de Mini Cursos:</strong> Ministrou cursos focados em desenvolvimento web, UI/UX
            e boas práticas de programação.
          </li>
          <li>
            <strong>Design na Empresa Junios JUÁ:</strong> Atuei no design de interfaces e experiências de usuário,
            colaborando com a criação de produtos digitais da empresa.
          </li>
        </ul>
      </div>
    </section>
  </div>
  
  <div class="barra-final"></div> 
  <div class="botao-flutuante" role="button" aria-label="Botão para abrir link">
    <img class="gif" src="../public/imagens/icons8-link.gif" alt="Ícone do WhatsApp" />
  </div>
</template>
