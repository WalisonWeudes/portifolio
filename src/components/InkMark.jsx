// Aranha do carregamento preenchida por "tinta líquida": a superfície ondula,
// uma segunda onda mais clara corre atrás e bolhas sobem. Conforme o progresso
// chega a 100%, as ondas acalmam até a aranha ficar toda preenchida.
// O formato vem da máscara CSS (--mark) aplicada ao canvas.
import { useEffect, useRef } from 'react'

const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function InkMark({ progress }) {
  const canvasRef = useRef(null)
  const target = useRef(progress)
  target.current = progress

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const ink = getComputedStyle(canvas).getPropertyValue('--ink').trim() || '#0b0b10'
    const still = reduce()
    let raf
    let w = 0
    let h = 0
    let dpr = 1
    let level = 0 // progresso exibido (suavizado)
    let last = performance.now()
    const bubbles = []

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = rect.width
      h = rect.height
      canvas.width = Math.max(1, Math.round(w * dpr))
      canvas.height = Math.max(1, Math.round(h * dpr))
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    // superfície da tinta em x (y em px; ondas somadas com fases diferentes)
    const surface = (x, t, base, amp, shift) =>
      base +
      Math.sin(x * 0.045 + t * 2.1 + shift) * amp +
      Math.sin(x * 0.11 - t * 3.3 + shift * 2) * amp * 0.45 +
      Math.sin(x * 0.021 + t * 0.9) * amp * 0.6

    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const t = now / 1000
      level += (target.current - level) * (1 - Math.exp(-dt * 7))
      if (target.current >= 1 && level > 0.995) level = 1

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      // a tinta começa um pouco abaixo da base e passa um pouco do topo no fim
      const base = h * 1.04 - level * h * 1.1
      const calm = 1 - level ** 3
      const amp = still ? 0 : Math.max(0.6, 7 * calm) * (h / 190)

      // onda de trás (mais clara, adiantada)
      ctx.fillStyle = 'rgba(11, 11, 16, 0.38)'
      ctx.beginPath()
      ctx.moveTo(0, h)
      for (let x = 0; x <= w; x += 3) ctx.lineTo(x, surface(x, t * 1.15, base - amp * 1.6, amp * 1.2, 2.4))
      ctx.lineTo(w, h)
      ctx.closePath()
      ctx.fill()

      // tinta principal
      ctx.fillStyle = ink
      ctx.beginPath()
      ctx.moveTo(0, h)
      for (let x = 0; x <= w; x += 3) ctx.lineTo(x, surface(x, t, base, amp, 0))
      ctx.lineTo(w, h)
      ctx.closePath()
      ctx.fill()

      // brilho fino na superfície
      if (level < 1 && !still) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)'
        ctx.lineWidth = 1
        ctx.beginPath()
        for (let x = 0; x <= w; x += 3) {
          const y = surface(x, t, base, amp, 0) + 1.5
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }

      // bolhas subindo dentro da tinta
      if (!still && level > 0.04 && level < 0.98 && Math.random() < dt * 9) {
        bubbles.push({ x: Math.random() * w, y: h + 4, r: 0.8 + Math.random() * 2.2, v: 18 + Math.random() * 30, s: Math.random() * 6 })
      }
      for (let i = bubbles.length - 1; i >= 0; i -= 1) {
        const b = bubbles[i]
        b.y -= b.v * dt
        const top = surface(b.x, t, base, amp, 0)
        if (b.y < top + b.r) {
          bubbles.splice(i, 1)
          continue
        }
        const x = b.x + Math.sin(t * 3 + b.s) * 2
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)'
        ctx.lineWidth = 0.8
        ctx.beginPath()
        ctx.arc(x, b.y, b.r, 0, Math.PI * 2)
        ctx.stroke()
      }

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className="mark__layer mark__ink"></canvas>
}
