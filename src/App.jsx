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
    </>
  )
}
