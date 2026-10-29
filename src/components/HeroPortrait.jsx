// Retrato com revelação "aquática": ao passar o mouse, a outra versão do retrato
// (camiseta de aranha) se espalha a partir do cursor como uma onda de água.
import { useEffect, useRef } from 'react'
import './HeroPortrait.css'

const loadReveal = (reveal, base) =>
  new Promise((resolve) => {
    const candidate = new Image()
    candidate.onload = () => resolve({ image: candidate, standIn: false })
    candidate.onerror = () => {
      // Sem a arte do traje ainda: usa o retrato com tom vermelho só para o efeito aparecer.
      const fallback = new Image()
      fallback.onload = () => resolve({ image: fallback, standIn: true })
      fallback.src = base
    }
    candidate.src = reveal
  })

export default function HeroPortrait({
  base,
  // Arte revelada no hover (mesmo enquadramento da base), em public/imagens/.
  reveal = '/imagens/retrato.webp',
  alt = '',
}) {
  const root = useRef(null)
  const canvas = useRef(null)
  // a animação inteira vive aqui dentro; os handlers do JSX só chamam essas funções
  const api = useRef({ onMove: () => {}, release: () => {} })

  useEffect(() => {
    let ctx
    let img
    let isStandIn = false
    let dpr = 1
    let width = 0
    let height = 0
    let raf = null
    let last = 0
    let level = 0
    let target = 0
    let pulseTimer
    let cancelled = false
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const pointer = { x: 0.5, y: 0.5 }

    const drawCover = (image) => {
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight)
      const w = image.naturalWidth * scale
      const h = image.naturalHeight * scale
      ctx.drawImage(image, (width - w) / 2, (height - h) / 2, w, h)
    }

    const blobPath = (cx, cy, radius, t) => {
      ctx.beginPath()
      const steps = 72
      for (let i = 0; i <= steps; i += 1) {
        const a = (i / steps) * Math.PI * 2
        const r =
          radius *
          (1 + 0.05 * Math.sin(3 * a + t * 1.6) + 0.035 * Math.sin(5 * a - t * 1.1) + 0.02 * Math.sin(9 * a + t * 2.3))
        const x = cx + Math.cos(a) * r
        const y = cy + Math.sin(a) * r
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
    }

    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016)
      last = now

      level += (target - level) * (reduce ? 1 : 1 - Math.exp(-dt * (target ? 3 : 4.2)))
      if (target === 0 && level < 0.003) {
        level = 0
        ctx.clearRect(0, 0, width, height)
        raf = null
        return
      }
      if (target === 1 && level > 0.999) level = 1

      const cx = pointer.x * width
      const cy = pointer.y * height
      const maxR = Math.hypot(Math.max(cx, width - cx), Math.max(cy, height - cy)) * 1.12
      const radius = maxR * level
      const t = now / 1000

      ctx.globalCompositeOperation = 'source-over'
      ctx.clearRect(0, 0, width, height)
      drawCover(img)
      if (isStandIn) {
        ctx.globalCompositeOperation = 'source-atop'
        ctx.fillStyle = 'rgba(230, 36, 41, 0.55)'
        ctx.fillRect(0, 0, width, height)
      }

      // Máscara líquida com borda orgânica e suave
      ctx.globalCompositeOperation = 'destination-in'
      ctx.shadowColor = '#fff'
      ctx.shadowBlur = 26 * dpr
      ctx.fillStyle = '#fff'
      blobPath(cx, cy, radius, t)
      ctx.fill()
      ctx.shadowBlur = 0

      // Reflexos da água na borda
      if (level < 0.97) {
        ctx.globalCompositeOperation = 'source-over'
        ctx.lineWidth = 1.5 * dpr
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
        blobPath(cx, cy, radius, t)
        ctx.stroke()
        ctx.strokeStyle = 'rgba(120, 160, 255, 0.28)'
        blobPath(cx, cy, radius * 0.93, t + 1.7)
        ctx.stroke()
      }

      raf = requestAnimationFrame(frame)
    }

    const wake = () => {
      if (!ctx || !img || raf) return
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }

    api.current.onMove = (event) => {
      const rect = root.current.getBoundingClientRect()
      pointer.x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
      pointer.y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height))
      if (!target) {
        target = 1
        wake()
      }
    }
    api.current.release = () => {
      target = 0
      wake()
    }

    const resize = () => {
      const el = canvas.current
      if (!el || !root.current) return
      const rect = root.current.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      width = Math.max(1, Math.round(rect.width * dpr))
      height = Math.max(1, Math.round(rect.height * dpr))
      el.width = width
      el.height = height
      if (level > 0) wake()
    }

    ctx = canvas.current.getContext('2d')
    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(root.current)

    loadReveal(reveal, base).then((result) => {
      if (cancelled) return
      img = result.image
      isStandIn = result.standIn

      // Em telas de toque não existe hover: o traje "respira" sozinho de tempos em tempos.
      if (window.matchMedia('(hover: none)').matches && !reduce) {
        let on = false
        pointer.x = 0.5
        pointer.y = 0.45
        pulseTimer = setInterval(() => {
          if (document.hidden) return
          on = !on
          target = on ? 1 : 0
          wake()
        }, 3200)
      }
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      clearInterval(pulseTimer)
      resizeObserver.disconnect()
    }
  }, [base, reveal])

  const onMove = (event) => api.current.onMove(event)
  const release = () => api.current.release()

  return (
    <div
      ref={root}
      className="portrait"
      onPointerEnter={onMove}
      onPointerMove={onMove}
      onPointerLeave={release}
      onPointerDown={onMove}
    >
      <img className="portrait__base" src={base} alt={alt} fetchPriority="high" />
      <canvas ref={canvas} className="portrait__reveal" aria-hidden="true"></canvas>
    </div>
  )
}
