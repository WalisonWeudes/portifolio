import { useEffect } from 'react'
import HeroSection from './components/sections/HeroSection'
import { useReveal } from './hooks/useReveal'
import { useTitleGlitch } from './hooks/useTitleGlitch'
import { usePointerEffects } from './hooks/usePointerEffects'
import { useDecode } from './hooks/useDecode'
import { useScrollVelocity } from './hooks/useScrollVelocity'

// Migração Vue → React em andamento: as seções ainda em .vue entram aqui conforme forem portadas.
// Ordem final: PageLoader, SpiderWalker, SiteHeader, Hero, Projects, Figma, About,
// Experience, Stack, Illustrations, Contact.
export default function App() {
  useReveal()
  useTitleGlitch()
  usePointerEffects()
  useDecode()
  useScrollVelocity()

  // TEMPORÁRIO até o PageLoader ser migrado: é ele quem libera a entrada do site.
  useEffect(() => {
    document.documentElement.classList.add('is-ready')
    window.dispatchEvent(new CustomEvent('site:ready'))
  }, [])

  return (
    <main className="site-shell">
      <HeroSection />
    </main>
  )
}
