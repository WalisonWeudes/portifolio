import KineticText from '../KineticText'
import SpotlightCard from '../reactbits/SpotlightCard/SpotlightCard'
import CurvedLoop from '../reactbits/CurvedLoop/CurvedLoop'
import { skillGroups } from '../../data/content'
import { useI18n } from '../../i18n'

export default function StackSection() {
  const { t, tr } = useI18n()

  return (
    <section id="habilidades" className="section stack" aria-labelledby="stack-title">
      <header className="compact-heading reveal">
        <span>{t('stack.label')}</span>
        <h2 id="stack-title">
          <KineticText text={t('stack.title1')} />
          <br />
          <KineticText text={t('stack.title2')} />
        </h2>
      </header>
      <div className="stack__groups">
        {skillGroups.map((group) => (
          <SpotlightCard
            key={group.number}
            className="stack__group reveal"
            spotlightColor="#e62429"
            intensity={0.22}
            spotlightSize={320}
            borderGlow={0.8}
            proximity={60}
          >
            <span className="stack__num">{group.number}</span>
            <h3>{tr(group.title)}</h3>
            <ul>
              {group.items.map((item, i) => (
                <li key={i}>{tr(item)}</li>
              ))}
            </ul>
          </SpotlightCard>
        ))}
      </div>
      {/* Faixa em onda, como um fio de teia: arraste para girar (React Bits) */}
      <div className="stack__loop">
        <CurvedLoop
          marqueeText={t('stack.loop')}
          shape="wave"
          curveAmount={260}
          speed={1.4}
          fontSize={88}
          fontWeight={400}
          className="stack__loop-text"
          separator="✦"
          separatorColor="#e62429"
          edgeFade={0.12}
          scrollBoost={1}
        />
      </div>
    </section>
  )
}
