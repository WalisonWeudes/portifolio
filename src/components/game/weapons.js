// Armas do Spider Rush. Cada uma muda o alcance, o ritmo, o estilo dos golpes
// (animações em fighter.js) e o especial (motor em engine.js).
const L = (pt, en) => ({ pt, en })

export const METER_MAX = 10 // abates para encher o especial

export const WEAPONS = {
  fists: {
    id: 'fists',
    style: 'punch',
    name: L('Punhos', 'Fists'),
    trait: L('Rápidos e equilibrados: jab, direto, chute e gancho.', 'Fast and balanced: jab, cross, kick and uppercut.'),
    color: '#e62429',
    range: 150,
    dur: 230,
    reach: 44,
    dmg: 1,
    sfx: ['POW!', 'PÁ!', 'TUM!', 'SOC!'],
    special: {
      name: L('RAJADA RELÂMPAGO', 'LIGHTNING BARRAGE'),
      desc: L('Teleporta até cada aranha e acerta uma sequência de socos.', 'Blinks to every spider and lands a punch barrage.'),
    },
  },
  katana: {
    id: 'katana',
    style: 'slash',
    name: L('Katana', 'Katana'),
    trait: L('Alcance longo e cortes em arco.', 'Long reach and sweeping cuts.'),
    color: '#9fb8ff',
    range: 210,
    dur: 270,
    reach: 74,
    dmg: 1,
    sfx: ['ZING!', 'SHING!', 'TCHAK!'],
    special: {
      name: L('CORTE DO VAZIO', 'VOID CUT'),
      desc: L('Atravessa a tela num piscar e parte todas as aranhas ao meio.', 'Crosses the screen in a blink and splits every spider in half.'),
    },
  },
  hammer: {
    id: 'hammer',
    style: 'smash',
    name: L('Martelo', 'Hammer'),
    trait: L('Lento, mas derruba as grandes de uma vez e atinge a de trás.', 'Slow, but one-shots big ones and hits the one behind.'),
    color: '#e62429',
    range: 165,
    dur: 330,
    reach: 62,
    dmg: 2,
    splash: 80,
    sfx: ['BOOM!', 'KRAK!', 'TUM!'],
    special: {
      name: L('TERREMOTO', 'EARTHQUAKE'),
      desc: L('Salta e afunda o chão: a onda de choque varre os dois lados.', 'Leaps and slams the floor: the shockwave sweeps both sides.'),
    },
  },
  staff: {
    id: 'staff',
    style: 'spin',
    name: L('Bastão', 'Bo Staff'),
    trait: L('Giros amplos que acertam até duas aranhas do mesmo lado.', 'Wide spins that hit up to two spiders on the same side.'),
    color: '#3157ff',
    range: 195,
    dur: 250,
    reach: 84,
    dmg: 1,
    cleave: 2,
    sfx: ['WHAM!', 'TOC!', 'VUSH!'],
    special: {
      name: L('CICLONE', 'CYCLONE'),
      desc: L('Gira o bastão e cria um tornado que puxa e arremessa todas.', 'Spins the staff into a tornado that pulls and flings them all.'),
    },
  },
  web: {
    id: 'web',
    style: 'shoot',
    name: L('Lança-teia', 'Web Shooter'),
    trait: L('Ataca de longe, sem sair do lugar.', 'Hits from afar without moving.'),
    color: '#f5f5f2',
    range: 340,
    dur: 220,
    reach: 0,
    dmg: 1,
    ranged: true,
    sfx: ['THWIP!', 'ZIP!', 'TSST!'],
    special: {
      name: L('REDE TOTAL', 'TOTAL WEB'),
      desc: L('Dispara teias em todas, enrola e explode os casulos.', 'Webs every spider, wraps them up and bursts the cocoons.'),
    },
  },
  daggers: {
    id: 'daggers',
    style: 'dual',
    name: L('Adagas duplas', 'Twin Daggers'),
    trait: L('As mais rápidas, e enchem o especial em dobro.', 'The fastest, and fill the special twice as fast.'),
    color: '#e62429',
    range: 140,
    dur: 165,
    reach: 38,
    dmg: 1,
    meter: 2,
    sfx: ['SHK!', 'TCHK!', 'ZAS!'],
    special: {
      name: L('CHUVA DE LÂMINAS', 'BLADE RAIN'),
      desc: L('Salta e lança adagas em todas as aranhas da tela.', 'Leaps and hurls daggers at every spider on screen.'),
    },
  },
}

// armas oferecidas ao subir de nível (os punhos são só o começo)
export const WEAPON_POOL = ['katana', 'hammer', 'staff', 'web', 'daggers']
