import PageLoader from './components/PageLoader'
import SpiderWalker from './components/SpiderWalker'
import SiteHeader from './components/SiteHeader'
import HeroSection from './components/sections/HeroSection'
import ProjectsSection from './components/sections/ProjectsSection'
import FigmaSection from './components/sections/FigmaSection'
import AboutSection from './components/sections/AboutSection'
import ExperienceSection from './components/sections/ExperienceSection'
import StackSection from './components/sections/StackSection'
import IllustrationsSection from './components/sections/IllustrationsSection'
import ContactSection from './components/sections/ContactSection'
import ClickSpark from './components/reactbits/ClickSpark/ClickSpark'
import SpiderGame from './components/game/SpiderGame'
import { useReveal } from './hooks/useReveal'
import { useTitleGlitch } from './hooks/useTitleGlitch'
import { usePointerEffects } from './hooks/usePointerEffects'
import { useDecode } from './hooks/useDecode'
import { useScrollVelocity } from './hooks/useScrollVelocity'

export default function App() {
  useReveal()
  useTitleGlitch()
  usePointerEffects()
  useDecode()
  useScrollVelocity()

  return (
    <>
      <PageLoader />
      {/* Faíscas no clique, nas cores do site (React Bits) */}
      <ClickSpark
        sparkColor={['#e62429', '#3157ff', '#f5f5f2']}
        shape="streak"
        sparkCount={10}
        sparkRadius={44}
        sparkWidth={3}
        sparkSize={16}
        duration={520}
        randomness={0.5}
        glow={0.5}
        className="spark-root"
        style={{ height: 'auto' }}
      >
        <main className="site-shell">
          <SpiderWalker />
          <SiteHeader />
          <HeroSection />
          <ProjectsSection />
          <FigmaSection />
          <AboutSection />
          <ExperienceSection />
          <StackSection />
          <IllustrationsSection />
          <ContactSection />
        </main>
      </ClickSpark>
      {/* jogo escondido: digite "spider" */}
      <SpiderGame />
    </>
  )
}
