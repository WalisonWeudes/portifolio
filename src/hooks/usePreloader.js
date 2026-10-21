import { useCallback, useRef, useState } from 'react'

const loadImage = (src) =>
  new Promise((resolve) => {
    const img = new Image()
    img.onload = img.onerror = () => resolve()
    img.src = src
  })

const loadFont = (family) =>
  document.fonts?.load ? document.fonts.load(`1em ${family}`).catch(() => {}) : Promise.resolve()

/**
 * Pré-carrega imagens e fontes e expõe o progresso real (0–1).
 * Cada tarefa tem um peso; o progresso nunca passa de `timeout`.
 * `progressRef` permite ler o valor a cada frame sem re-renderizar.
 * `start()` devolve uma função que cancela (seguro com StrictMode).
 */
export function usePreloader({ images = [], fonts = [], timeout = 9000 } = {}) {
  const [progress, setProgress] = useState(0)
  const [ready, setReady] = useState(false)
  const progressRef = useRef(0)
  // as listas vêm como literais novos a cada render: guardamos a primeira
  const config = useRef({ images, fonts, timeout })

  const start = useCallback(() => {
    const { images: imgs, fonts: fnts, timeout: limit } = config.current
    const tasks = [...fnts.map((f) => () => loadFont(f)), ...imgs.map((src) => () => loadImage(src))]
    let done = 0
    let cancelled = false
    let safety

    const update = (value) => {
      progressRef.current = value
      setProgress(value)
    }

    const finish = () => {
      if (cancelled) return
      update(1)
      setReady(true)
    }

    if (!tasks.length) {
      finish()
      return () => {
        cancelled = true
      }
    }

    safety = setTimeout(finish, limit)
    tasks.forEach((task) =>
      task().then(() => {
        if (cancelled) return
        done += 1
        update(done / tasks.length)
        if (done === tasks.length) {
          clearTimeout(safety)
          finish()
        }
      }),
    )

    return () => {
      cancelled = true
      clearTimeout(safety)
    }
  }, [])

  return { progress, progressRef, ready, start }
}
