// Debandada do carregamento: quando a transição em triângulos começa, a aranha
// de tinta "estoura" em várias aranhas que fogem do centro em todas as direções.
// Usa o mesmo esqueleto procedural das aranhas do site (pernas com marcha real).
import { useEffect, useRef } from 'react'
import { createRig, drawRig, updateRig } from './spider/rig'

const rand = (a, b) => a + Math.random() * (b - a)

export default function SpiderStampede({ active }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!active) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = window.innerWidth
    const h = window.innerHeight
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)

    const cx = w / 2
    const cy = h / 2
    const small = w < 600
    const count = small ? 12 : 22
    const base = small ? 0.6 : 0.85

    // cada aranha nasce perto do centro e foge num ângulo próprio
    const spiders = Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + rand(-0.18, 0.18)
      const r = rand(40, 120) // espalhadas num anel em volta da aranha central
      const x = cx + Math.cos(angle) * r
      const y = cy + Math.sin(angle) * r
      const scale = base * rand(0.65, 1.25)
      return {
        x,
        y,
        angle,
        speed: rand(250, 420), // já saem com impulso (o "estouro")
        top: rand(700, 1100) * (small ? 0.7 : 1),
        accel: rand(1800, 3000),
        delay: rand(0, 160),
        wobble: rand(2.5, 5),
        phase: rand(0, Math.PI * 2),
        rig: createRig(x, y, angle, scale, i + 1 + Math.random()),
      }
    })

    let start = 0
    let last = 0
    let clock = 0
    let raf

    const frame = (now) => {
      if (!start) start = last = now
      const dt = Math.min(34, now - last)
      last = now
      clock += dt
      const t = now - start
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      let alive = false
      for (const s of spiders) {
        if (t > s.delay) {
          s.speed = Math.min(s.top, s.speed + s.accel * (dt / 1000))
          // zigue-zague de quem foge em pânico
          const heading = s.angle + Math.sin(t / 1000 * s.wobble * 2 + s.phase) * 0.35
          s.x += Math.cos(heading) * s.speed * (dt / 1000)
          s.y += Math.sin(heading) * s.speed * (dt / 1000)
          updateRig(s.rig, s.x, s.y, heading, dt, clock)
        } else {
          updateRig(s.rig, s.x, s.y, s.angle, dt, clock)
        }
        const margin = 80
        if (s.x > -margin && s.x < w + margin && s.y > -margin && s.y < h + margin) {
          alive = true
          // contorno vermelho/azul deslocado: lê bem no vermelho e no fundo escuro do site
          drawRig(ctx, s.rig, { clock, tint: '#e62429', dx: -2.5 })
          drawRig(ctx, s.rig, { clock, tint: '#3157ff', dx: 2.5 })
          drawRig(ctx, s.rig, { clock, tint: '#0b0b10' })
        }
      }
      if (alive) raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [active])

  return <canvas ref={canvasRef} className="loader__stampede" aria-hidden="true"></canvas>
}
