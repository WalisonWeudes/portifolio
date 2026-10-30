// Habilidades do Spider Rush, oferecidas junto com as armas ao subir de nível.
// Passivas acumulam até `max`; ultimates ocupam um único espaço (tecla Q) e
// escolher outra troca a atual.
const L = (pt, en) => ({ pt, en })

export const PERKS = {
  shield: {
    kind: 'passive',
    max: 3,
    color: '#3157ff',
    name: L('Escudo', 'Shield'),
    desc: L('Absorve uma mordida e recarrega a cada nível. +1 carga por nível.', 'Blocks one bite and recharges every level. +1 charge per level.'),
  },
  life: {
    kind: 'instant',
    max: 99,
    color: '#e62429',
    name: L('Vida extra', 'Extra life'),
    desc: L('+1 vida agora.', '+1 life right now.'),
  },
  regen: {
    kind: 'passive',
    max: 3,
    color: '#ff6b6f',
    name: L('Regeneração', 'Regeneration'),
    desc: L('+1 vida a cada 30 aranhas mortas (25 e 20 nos próximos níveis).', '+1 life every 30 kills (25 and 20 at higher levels).'),
  },
  reflex: {
    kind: 'passive',
    max: 2,
    color: '#9fb8ff',
    name: L('Reflexos', 'Reflexes'),
    desc: L('Errar deixa você tonto por menos tempo (−40% por nível).', 'Missing dazes you for less time (−40% per level).'),
  },
  magnet: {
    kind: 'passive',
    max: 2,
    color: '#f5f5f2',
    name: L('Ímã de energia', 'Energy magnet'),
    desc: L('O especial enche 50% mais rápido por nível.', 'The special fills 50% faster per level.'),
  },
  immune: {
    kind: 'ult',
    max: 1,
    color: '#ffc94a',
    cooldown: 22000,
    name: L('Ulti: Pele de Aço', 'Ult: Steel Skin'),
    desc: L('Tecla Q: fica imune por 5 s e esmaga as aranhas que encostam.', 'Q key: immune for 5 s, crushing any spider that touches you.'),
  },
  shadow: {
    kind: 'ult',
    max: 1,
    color: '#8a5cff',
    cooldown: 24000,
    name: L('Ulti: Sombra', 'Ult: Shadow'),
    desc: L('Tecla Q: um clone sombrio luta do outro lado por 9 s.', 'Q key: a shadow clone fights on your other side for 9 s.'),
  },
}

export const PERK_IDS = Object.keys(PERKS)
