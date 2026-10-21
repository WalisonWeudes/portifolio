import { useCallback, useEffect, useRef, useState } from 'react'
import KineticText from './KineticText'
import './GlitchHeroTitle.css'

export default function GlitchHeroTitle() {
  const titleRef = useRef(null)
  const [isGlitching, setIsGlitching] = useState(false)
  const glitching = useRef(false)
  const endTimer = useRef(null)

  const triggerGlitch = useCallback(() => {
    if (glitching.current) return
    glitching.current = true
    setIsGlitching(true)
    endTimer.current = setTimeout(() => {
      glitching.current = false
      setIsGlitching(false)
    }, 260)
  }, [])

  useEffect(() => {
    let glitchTimer
    let frame = null
    let tilt = { x: 0, y: 0 }

    // Inclinação 3D que segue o mouse — escrita direto no DOM, sem re-render.
    const applyTilt = () => {
      frame = null
      const el = titleRef.current
      if (!el) return
      el.style.transform = `perspective(600px) rotateX(${(tilt.y * -6).toFixed(2)}deg) rotateY(${(tilt.x * 7).toFixed(2)}deg)`
    }

    const onMouseMove = (event) => {
      tilt = { x: event.clientX / window.innerWidth - 0.5, y: event.clientY / window.innerHeight - 0.5 }
      if (!frame) frame = requestAnimationFrame(applyTilt)
    }

    // De vez em quando (a cada ~6–10s) um glitch curto e leve.
    const scheduleGlitch = () => {
      glitchTimer = setTimeout(() => {
        if (!document.hidden) triggerGlitch()
        scheduleGlitch()
      }, 6000 + Math.random() * 4000)
    }

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      glitchTimer = setTimeout(() => {
        triggerGlitch()
        scheduleGlitch()
      }, 4500)
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(frame)
      clearTimeout(endTimer.current)
      clearTimeout(glitchTimer)
    }
  }, [triggerGlitch])

  return (
    <h1
      id="hero-title"
      ref={titleRef}
      className={`glitch-hero-title${isGlitching ? ' is-glitching' : ''}`}
      onMouseEnter={triggerGlitch}
      onClick={triggerGlitch}
    >
      <span className="title-line line-1">
        <span className="word">
          <KineticText text="DESIGNER" entrance={false} />
        </span>
        <em className="ampersand">&amp;</em>
      </span>
      <span className="title-line line-2">
        <span className="word">
          <KineticText text="FRONT-END" entrance={false} />
        </span>
      </span>
      <span className="title-line line-3">
        <span className="word">
          <KineticText text="DEVELOPER" entrance={false} />
        </span>
      </span>
    </h1>
  )
}
