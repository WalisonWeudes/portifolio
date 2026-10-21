import { useEffect } from 'react'

/** Revela elementos `.reveal` / `.reveal-image` quando entram na viewport. */
export function useReveal(selector = '.reveal, .reveal-image') {
  useEffect(() => {
    const items = document.querySelectorAll(selector)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    )
    items.forEach((item) => observer.observe(item))

    return () => observer.disconnect()
  }, [selector])
}
