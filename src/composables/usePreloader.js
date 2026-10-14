import { ref } from 'vue'

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
 */
export function usePreloader({ images = [], fonts = [], timeout = 9000 } = {}) {
  const progress = ref(0)
  const ready = ref(false)

  const tasks = [...fonts.map((f) => () => loadFont(f)), ...images.map((src) => () => loadImage(src))]
  let done = 0

  const finish = () => {
    progress.value = 1
    ready.value = true
  }

  const start = () => {
    if (!tasks.length) return finish()
    const safety = setTimeout(finish, timeout)
    tasks.forEach((task) =>
      task().then(() => {
        done += 1
        progress.value = done / tasks.length
        if (done === tasks.length) {
          clearTimeout(safety)
          finish()
        }
      }),
    )
  }

  return { progress, ready, start }
}
