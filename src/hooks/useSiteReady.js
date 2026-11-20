import { useEffect } from 'react'

/**
 * Sem tela de entrada: marca o site como pronto logo depois de montar,
 * quando os efeitos das seções já estão ouvindo o sinal "site:ready".
 * (Fazia parte do PageLoader, que foi desligado.)
 */
export function useSiteReady() {
  useEffect(() => {
    let fired = false
    const timer = setTimeout(() => {
      document.documentElement.classList.add('is-ready')
      if (!fired) {
        fired = true
        window.dispatchEvent(new CustomEvent('site:ready'))
      }
    }, 60)
    return () => clearTimeout(timer)
  }, [])
}
