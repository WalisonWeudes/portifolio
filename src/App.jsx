// tela de entrada desligada: para voltar, descomente esta linha e o <PageLoader /> abaixo
// import PageLoader from './components/PageLoader'
// import SpiderWalker from './components/SpiderWalker'
import SiteHeader from './components/SiteHeader'
import HeroSection from './components/sections/HeroSection'
import ProjectsSection from './components/sections/ProjectsSection'
import FigmaSection from './components/sections/FigmaSection'
import ProductsSection from './components/sections/ProductsSection'
import AboutSection from './components/sections/AboutSection'
import ExperienceSection from './components/sections/ExperienceSection'
import StackSection from './components/sections/StackSection'
import IllustrationsSection from './components/sections/IllustrationsSection'
import ContactSection from './components/sections/ContactSection'
import SpiderGame from './components/game/SpiderGame'
import { useReveal } from './hooks/useReveal'
import { useTitleGlitch } from './hooks/useTitleGlitch'
import { usePointerEffects } from './hooks/usePointerEffects'
import { useDecode } from './hooks/useDecode'
import { useScrollVelocity } from './hooks/useScrollVelocity'
import { useSiteReady } from './hooks/useSiteReady'

export default function App() {
  useReveal()
  useTitleGlitch()
  usePointerEffects()
  useDecode()
  useScrollVelocity()
  useSiteReady()

  return (
    <>
      {/* <PageLoader /> */}
      <main className="site-shell">
        {/* aranha desligada por enquanto: para voltar, descomente a linha abaixo */}
        {/* <SpiderWalker /> */}
        <SiteHeader />
        <HeroSection />
        <ProductsSection />
        <ProjectsSection />
        <FigmaSection />
        <AboutSection />
        <ExperienceSection />
        <StackSection />
        <IllustrationsSection />
        <ContactSection />
      </main>
      {/* jogo escondido: digite "spider" */}
      <SpiderGame />
    </>
  )
}
