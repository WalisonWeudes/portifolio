import { useEffect, useRef, useState } from 'react'
import { usePreloader } from '../hooks/usePreloader'
import { useI18n } from '../i18n'
import spiderMark from '../assets/aranha-loader.svg'
import InkMark from './InkMark'
import SpiderStampede from './SpiderStampede'
import './PageLoader.css'

const universes = ['TERRA-1610', 'TERRA-616', 'TERRA-65', 'TERRA-928', 'TERRA-42', 'TERRA-138', 'TERRA-8311', 'TERRA-90214']
const STATUS = ['loader.s1', 'loader.s2', 'loader.s3', 'loader.s4']

// Grade de blocos proporcional à tela (blocos ~quadrados).
// Cada bloco vira dois triângulos; a diagonal alterna para formar o padrão.
// Na saída eles somem numa onda do centro para as bordas (atraso pela distância).
const buildCells = () => {
  const cols = window.innerWidth < 600 ? 7 : 14
  const rows = Math.max(4, Math.round((cols * window.innerHeight) / window.innerWidth))
  const aspect = window.innerHeight / window.innerWidth
  const cells = Array.from({ length: cols * rows }, (_, i) => {
    const row = Math.floor(i / cols)
    const col = i % cols
    const dx = (col + 0.5) / cols - 0.5
    const dy = ((row + 0.5) / rows - 0.5) * aspect
    const dist = Math.min(1, Math.hypot(dx, dy) / Math.hypot(0.5, 0.5 * aspect))
    return {
      i,
      flip: (row + col) % 2 === 1,
      tris: [0, 1].map(() => ({
        delay: Math.round(dist * 560 + Math.random() * 110),
        spin: Math.round((Math.random() - 0.5) * 50),
      })),
    }
  })
  return { grid: { cols, rows }, cells }
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
// Em desenvolvimento, ?noloader pula a tela de carregamento.
const skipLoader = import.meta.env.DEV && new URLSearchParams(location.search).has('noloader')

const formatClock = () =>
  new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Fortaleza',
  }).format(new Date())

export default function PageLoader({ onLoaded }) {
  const { t } = useI18n()
  const [{ grid, cells }] = useState(buildCells)

  const [visible, setVisible] = useState(true)
  const [phase, setPhase] = useState('loading') // loading → done → leaving
  const [shown, setShown] = useState(0)
  const [stageIndex, setStageIndex] = useState(0)
  const [clock, setClock] = useState('')

  const { progressRef, start: startPreload } = usePreloader({
    fonts: ['Chetta', 'Odeto'],
    images: ['/imagens/retrato-social.webp', '/imagens/retrato.webp'],
  })

  // callback sempre atual; "site:ready" é disparado uma única vez (StrictMode roda o efeito duas vezes)
  const onLoadedRef = useRef(onLoaded)
  onLoadedRef.current = onLoaded
  const readyFired = useRef(false)

  useEffect(() => {
    let seen = false
    try {
      seen = sessionStorage.getItem('ww-loader-seen') === '1'
    } catch {
      /* sessionStorage indisponível */
    }
    const MIN_DURATION = reduceMotion ? 700 : seen ? 1500 : 3000

    let frame
    let leaveTimer
    let readyTimer
    let stopPreload
    let lastTime = 0
    let startTime = 0
    let finishedAt = 0
    let currentShown = 0
    let currentStage = 0
    let currentPhase = 'loading'
    let previousOverflow = ''
    let locked = false

    const unlockScroll = () => {
      if (!locked) return
      locked = false
      document.documentElement.style.overflow = previousOverflow
    }

    const leave = () => {
      currentPhase = 'leaving'
      setPhase('leaving')
      unlockScroll()
      // a entrada do site começa um instante depois, para não disputar o
      // processamento com o início da transição (era aí que travava)
      readyTimer = setTimeout(
        () => {
          document.documentElement.classList.add('is-ready')
          if (!readyFired.current) {
            readyFired.current = true
            window.dispatchEvent(new CustomEvent('site:ready'))
          }
        },
        reduceMotion ? 0 : 220,
      )
      leaveTimer = setTimeout(() => {
        setVisible(false)
        onLoadedRef.current?.()
      }, reduceMotion ? 200 : 1450)
    }

    const tick = (now) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000 || 0.016)
      lastTime = now

      // Avança suavemente até o menor entre o progresso real e a linha do tempo mínima.
      const timeline = Math.min(1, (now - startTime) / MIN_DURATION)
      const target = Math.min(progressRef.current, timeline)
      let next = currentShown + (target - currentShown) * (1 - Math.exp(-dt * 6))
      if (target === 1 && next > 0.997) next = 1
      currentShown = next
      setShown(next)

      const nextStage = Math.min(universes.length - 1, Math.floor(next * universes.length))
      if (nextStage !== currentStage) {
        currentStage = nextStage
        setStageIndex(nextStage)
      }

      if (next === 1) {
        if (!finishedAt) {
          finishedAt = now
          currentPhase = 'done'
          setPhase('done')
        } else if (now - finishedAt > (reduceMotion ? 150 : 550)) {
          try {
            sessionStorage.setItem('ww-loader-seen', '1')
          } catch {
            /* ignore */
          }
          leave()
          return
        }
      }

      frame = requestAnimationFrame(tick)
    }

    if (skipLoader) {
      leave()
    } else {
      setClock(formatClock())
      previousOverflow = document.documentElement.style.overflow
      document.documentElement.style.overflow = 'hidden'
      locked = true
      stopPreload = startPreload()
      frame = requestAnimationFrame((now) => {
        startTime = lastTime = now
        tick(now)
      })
    }

    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(leaveTimer)
      clearTimeout(readyTimer)
      stopPreload?.()
      unlockScroll()
    }
  }, [startPreload, progressRef])

  if (!visible) return null

  const percent = Math.round(shown * 100)
  const universe = `// ${universes[stageIndex % universes.length]}`
  const statusText =
    phase === 'leaving' ? t('loader.enter') : phase === 'done' ? t('loader.done') : t(STATUS[stageIndex % STATUS.length])

  return (
    <div
      className={`loader is-${phase}`}
      style={{ '--p': shown, '--cols': grid.cols, '--rows': grid.rows }}
      role="progressbar"
      aria-label={t('loader.aria')}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow={percent}
    >
      {/* O fundo vermelho é formado por triângulos: na saída eles somem em mosaico. */}
      <div className="loader__pixels" aria-hidden="true">
        {cells.map((cell) => (
          <span key={cell.i} className={cell.flip ? 'is-flip' : undefined}>
            {cell.tris.map((tri, k) => (
              <i key={k} className={`tri--${k}`} style={{ '--d': `${tri.delay}ms`, '--spin': `${tri.spin}deg` }}></i>
            ))}
          </span>
        ))}
      </div>

      <div className="loader__hud">
        {/* moldura HUD com entalhes */}
        <div className="hud__frame" aria-hidden="true"></div>
        <svg className="hud__notch hud__notch--top" viewBox="0 0 120 14" aria-hidden="true"><path d="M0 0 L18 13 L102 13 L120 0" /></svg>
        <svg className="hud__notch hud__notch--bottom" viewBox="0 0 120 14" aria-hidden="true"><path d="M0 14 L18 1 L102 1 L120 14" /></svg>
        <svg className="hud__notch hud__notch--left" viewBox="0 0 14 120" aria-hidden="true"><path d="M0 0 L13 18 L13 102 L0 120" /></svg>
        <svg className="hud__notch hud__notch--right" viewBox="0 0 14 120" aria-hidden="true"><path d="M14 0 L1 18 L1 102 L14 120" /></svg>
        <i className="hud__tick hud__tick--tl" aria-hidden="true"></i>
        <i className="hud__tick hud__tick--tr" aria-hidden="true"></i>
        <i className="hud__tick hud__tick--bl" aria-hidden="true"></i>
        <i className="hud__tick hud__tick--br" aria-hidden="true"></i>

        <p className="hud__label hud__label--tl">WW / PORTFOLIO</p>
        <p className="hud__label hud__label--tr">PICOS, PI — BR<br />{clock}</p>
        <p className="hud__label hud__label--bl">{universe}</p>
        <p className="hud__label hud__label--br" aria-live="polite">{statusText}</p>

        <div className="hud__center">
          {/* aranha que se enche de tinta conforme o carregamento */}
          <div className="mark" style={{ '--mark': `url(${spiderMark})` }} aria-hidden="true">
            <i className="mark__layer mark__base"></i>
            <InkMark progress={shown} />
            <i className="mark__ring"></i>
            <i className="mark__ring mark__ring--2"></i>
          </div>
          <p className="hud__percent">{percent}%</p>
        </div>

        <div className="hud__progress" aria-hidden="true"><i></i></div>
      </div>

      {/* na transição, a aranha estoura em várias que fogem em debandada */}
      <SpiderStampede active={phase === 'leaving'} />
    </div>
  )
}
