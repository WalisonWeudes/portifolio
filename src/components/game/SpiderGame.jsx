// Spider Rush: jogo escondido. Abre ao digitar "spider", ao clicar várias vezes
// nas aranhas da página ou com 5 toques na logo (celular). Esc fecha.
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { createGame, tr } from './engine'
import { WEAPONS, PASSIVES } from './weapons'
import { PERKS } from './perks'
import './SpiderGame.css'

const UI = {
  subtitle: { pt: 'Elas vêm dos dois lados. Você só tem dois golpes.', en: 'They come from both sides. You only have two moves.' },
  keys: { pt: '← → ou A D atacam · ESPAÇO especial · Q ultimate · ESC sai', en: '← → or A D attack · SPACE special · Q ultimate · ESC to quit' },
  touch: { pt: 'Toque à esquerda ou à direita para atacar', en: 'Tap left or right to attack' },
  rule: { pt: 'Atacar sem aranha ao alcance deixa você tonto por um instante.', en: 'Attacking with no spider in reach leaves you dazed for a moment.' },
  play: { pt: 'Jogar', en: 'Play' },
  again: { pt: 'Jogar de novo', en: 'Play again' },
  quit: { pt: 'Sair', en: 'Quit' },
  best: { pt: 'Recorde', en: 'Best' },
  choose: { pt: 'Escolha sua recompensa', en: 'Choose your reward' },
  levelDone: { pt: 'Nível {n} completo', en: 'Level {n} clear' },
  special: { pt: 'Especial', en: 'Special' },
  over: { pt: 'As aranhas venceram', en: 'The spiders won' },
  score: { pt: 'Pontos', en: 'Score' },
  level: { pt: 'Nível', en: 'Level' },
  combo: { pt: 'Maior combo', en: 'Best combo' },
  close: { pt: 'Fechar jogo', en: 'Close game' },
  useSpecial: { pt: 'Especial', en: 'Special' },
  upgrade: { pt: 'Melhorar', en: 'Upgrade' },
  keep: { pt: 'Manter', en: 'Keep' },
  maxed: { pt: 'Nível máximo: continue com ela.', en: 'Max level: keep fighting with it.' },
  skill: { pt: 'Habilidade', en: 'Skill' },
  ultimate: { pt: 'Ultimate', en: 'Ultimate' },
  replaces: { pt: 'Substitui a ultimate atual.', en: 'Replaces your current ultimate.' },
  useUlt: { pt: 'Ulti', en: 'Ult' },
  lv: { pt: 'NV', en: 'LV' },
  passive: { pt: 'Passiva', en: 'Passive' },
  allUp: { pt: 'Todas: +8% de alcance e golpes 6% mais rápidos por nível.', en: 'All: +8% reach and 6% faster strikes per level.' },
}

const ICONS = {
  katana: <path d="M6 42 L10 38 M8 40 L40 8 Q43 6 44 4 Q42 9 40 11 L12 39 M5 35 L13 43" />,
  hammer: <path d="M10 42 L30 22 M24 10 L38 24 L44 18 L30 4 Z" />,
  staff: <path d="M6 42 L42 6 M6 42 L11 37 M37 11 L42 6" />,
  'perk:shield': <path d="M24 4 L40 10 V24 Q40 36 24 44 Q8 36 8 24 V10 Z M24 14 V34" />,
  'perk:life': <path d="M24 40 Q8 30 8 18 Q8 9 16 9 Q21 9 24 14 Q27 9 32 9 Q40 9 40 18 Q40 30 24 40 Z M24 18 V30 M18 24 H30" />,
  'perk:regen': <path d="M24 40 Q8 30 8 18 Q8 9 16 9 Q21 9 24 14 Q27 9 32 9 Q40 9 40 18 Q40 30 24 40 Z M14 24 H20 L23 18 L27 30 L30 24 H34" />,
  'perk:reflex': <path d="M26 4 L12 28 H22 L18 44 L36 18 H26 Z" />,
  'perk:magnet': <path d="M12 8 V26 Q12 38 24 38 Q36 38 36 26 V8 M12 8 H20 M28 8 H36 M20 8 V26 Q20 30 24 30 Q28 30 28 26 V8" />,
  'perk:immune': <path d="M24 4 L28 18 L42 18 L31 27 L35 42 L24 33 L13 42 L17 27 L6 18 L20 18 Z" />,
  'perk:shadow': <path d="M24 6 A6 6 0 1 1 23.9 6 M14 44 L18 22 H30 L34 44 M18 26 L8 34 M30 26 L40 18 M30 22 L33 14" />,
  web: <path d="M24 4 V44 M4 24 H44 M10 10 L38 38 M38 10 L10 38 M24 12 L34 16 L36 26 L30 34 L18 34 L12 26 L14 16 Z" />,
  daggers: <path d="M8 40 L26 22 M26 22 L34 10 L30 20 Z M40 40 L22 22 M22 22 L14 10 L18 20 Z" />,
  fists: <path d="M12 30 Q12 18 22 18 L34 18 Q40 18 40 24 L40 34 Q40 42 32 42 L20 42 Q12 42 12 34 Z M22 18 V26 M28 18 V26 M34 18 V26" />,
}

const hasTouch = () => window.matchMedia('(hover: none)').matches

function GameOverlay({ onClose }) {
  const canvasRef = useRef(null)
  const game = useRef(null)
  const [screen, setScreen] = useState({ name: 'title', data: null })
  const [meterFull, setMeterFull] = useState(false)
  const [ultReady, setUltReady] = useState(false)
  const touch = hasTouch()
  const best = (() => {
    try {
      return Number(localStorage.getItem('ww-spider-best')) || 0
    } catch {
      return 0
    }
  })()

  useEffect(() => {
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = 'hidden'
    root.classList.add('is-gaming')
    window.dispatchEvent(new CustomEvent('spider:game-state', { detail: { open: true } }))
    game.current = createGame(canvasRef.current, {
      onScreen: (name, data) => setScreen({ name, data }),
      onMeter: setMeterFull,
      onUlt: setUltReady,
      onClose,
    })
    if (import.meta.env.DEV) window.__spiderGame = game.current
    return () => {
      game.current?.destroy()
      game.current = null
      root.style.overflow = previous
      root.classList.remove('is-gaming')
      window.dispatchEvent(new CustomEvent('spider:game-state', { detail: { open: false } }))
      if (import.meta.env.DEV) delete window.__spiderGame
    }
  }, [onClose])

  const { name, data } = screen

  return (
    <div className="spider-game" role="dialog" aria-modal="true" aria-label="Spider Rush">
      <canvas ref={canvasRef} className="spider-game__canvas"></canvas>

      <button type="button" className="spider-game__close" onClick={onClose} aria-label={tr(UI.close)}>
        ESC ×
      </button>

      {name === 'title' && (
        <div className="spider-game__panel spider-game__panel--title">
          <p className="spider-game__kicker">// {tr(UI.best)} {best}</p>
          <h2 className="spider-game__title">
            SPIDER <em>RUSH</em>
          </h2>
          <p className="spider-game__lead">{tr(UI.subtitle)}</p>
          <p className="spider-game__keys">{touch ? tr(UI.touch) : tr(UI.keys)}</p>
          <p className="spider-game__rule">{tr(UI.rule)}</p>
          <button type="button" className="spider-game__btn" onClick={() => game.current?.start()} autoFocus>
            {tr(UI.play)} <span>↵</span>
          </button>
        </div>
      )}

      {name === 'choose' && (
        <div className="spider-game__panel spider-game__panel--choose">
          <p className="spider-game__kicker">// {tr(UI.levelDone).replace('{n}', String(data.level).padStart(2, '0'))}</p>
          <h2 className="spider-game__heading">{tr(UI.choose)}</h2>
          <div className="spider-game__cards">
            {data.options.map((id, i) => {
              if (id.startsWith('perk:')) {
                const pid = id.slice(5)
                const p = PERKS[pid]
                const have = data.perks?.[pid] || 0
                const isUlt = p.kind === 'ult'
                return (
                  <button key={id} type="button" className={`weapon-card weapon-card--perk${isUlt ? ' weapon-card--ult' : ''}`} onClick={() => game.current?.choose(id)} style={{ '--k': i, '--pc': p.color }}>
                    <span className="weapon-card__key">{i + 1}</span>
                    <span className="weapon-card__badge weapon-card__badge--perk">
                      ✦ {isUlt ? tr(UI.ultimate) : tr(UI.skill)}
                      {p.kind === 'passive' && have > 0 ? ` · ${tr(UI.lv)} ${have} → ${have + 1}` : ''}
                    </span>
                    <svg className="weapon-card__icon" viewBox="0 0 48 48" aria-hidden="true">
                      {ICONS[id]}
                    </svg>
                    <strong className="weapon-card__name">{tr(p.name).replace(/^Ulti: |^Ult: /, '')}</strong>
                    <span className="weapon-card__trait">{tr(p.desc)}</span>
                    {isUlt && data.ult && data.ult !== pid && <span className="weapon-card__special">{tr(UI.replaces)}</span>}
                  </button>
                )
              }
              const w = WEAPONS[id]
              const up = id === data.current
              const lv = data.levels?.[id] || 1
              const maxed = up && lv >= data.max
              return (
                <button key={id} type="button" className={`weapon-card${up ? ' weapon-card--up' : ''}`} onClick={() => game.current?.choose(id)} style={{ '--k': i }}>
                  <span className="weapon-card__key">{i + 1}</span>
                  {up && (
                    <span className="weapon-card__badge">
                      {maxed ? `● ${tr(UI.keep)} · ${tr(UI.lv)} ${lv}` : `▲ ${tr(UI.upgrade)} · ${tr(UI.lv)} ${lv} → ${lv + 1}`}
                    </span>
                  )}
                  {!up && lv > 1 && <span className="weapon-card__lv">{tr(UI.lv)} {lv}</span>}
                  <svg className="weapon-card__icon" viewBox="0 0 48 48" aria-hidden="true">
                    {ICONS[id]}
                  </svg>
                  <strong className="weapon-card__name">{tr(w.name)}</strong>
                  <span className="weapon-card__trait">{maxed ? tr(UI.maxed) : up ? tr(UI.allUp) : tr(w.trait)}</span>
                  {up && !maxed && (
                    <span className="weapon-card__passive">
                      <b>{tr(UI.passive)}</b> {tr(PASSIVES[id])}
                    </span>
                  )}
                  <span className="weapon-card__special">
                    <b>
                      {tr(UI.special)}: {tr(w.special.name)}
                    </b>
                    {tr(w.special.desc)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {name === 'over' && (
        <div className="spider-game__panel spider-game__panel--over">
          <p className="spider-game__kicker">// GAME OVER</p>
          <h2 className="spider-game__heading">{tr(UI.over)}</h2>
          <dl className="spider-game__stats">
            <div>
              <dt>{tr(UI.score)}</dt>
              <dd>{data.score}</dd>
            </div>
            <div>
              <dt>{tr(UI.best)}</dt>
              <dd>{data.best}</dd>
            </div>
            <div>
              <dt>{tr(UI.level)}</dt>
              <dd>{String(data.level).padStart(2, '0')}</dd>
            </div>
            <div>
              <dt>{tr(UI.combo)}</dt>
              <dd>{data.maxCombo}</dd>
            </div>
          </dl>
          <div className="spider-game__actions">
            <button type="button" className="spider-game__btn" onClick={() => game.current?.start()} autoFocus>
              {tr(UI.again)} <span>↵</span>
            </button>
            <button type="button" className="spider-game__btn spider-game__btn--ghost" onClick={onClose}>
              {tr(UI.quit)} <span>ESC</span>
            </button>
          </div>
        </div>
      )}

      {touch && !name && ultReady && (
        <button type="button" className="spider-game__special spider-game__special--ult" onClick={() => game.current?.ult()}>
          {tr(UI.useUlt)}
        </button>
      )}

      {touch && !name && meterFull && (
        <button type="button" className="spider-game__special" onClick={() => game.current?.special()}>
          {tr(UI.useSpecial)}
        </button>
      )}
    </div>
  )
}

export default function SpiderGame() {
  const [open, setOpen] = useState(false)
  const close = useRef(() => setOpen(false)).current

  useEffect(() => {
    if (open) return undefined
    let typed = ''
    let taps = []
    const onKey = (event) => {
      const el = event.target
      if (el?.tagName === 'INPUT' || el?.tagName === 'TEXTAREA' || el?.isContentEditable) return
      if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return
      typed = (typed + event.key.toLowerCase()).slice(-6)
      if (typed === 'spider') {
        typed = ''
        setOpen(true)
      }
    }
    const onOpen = () => setOpen(true)
    // celular: 5 toques seguidos na logo
    const onTap = (event) => {
      if (!event.target.closest?.('.brand')) return
      const now = Date.now()
      taps = [...taps.filter((t) => now - t < 2500), now]
      if (taps.length >= 5) {
        taps = []
        event.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('spider:game', onOpen)
    document.addEventListener('click', onTap, true)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('spider:game', onOpen)
      document.removeEventListener('click', onTap, true)
    }
  }, [open])

  return open ? createPortal(<GameOverlay onClose={close} />, document.body) : null
}
