import KineticText from '../KineticText'
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
          <div key={group.number} className="stack__group reveal">
            <span>{group.number}</span>
            <h3>{tr(group.title)}</h3>
            <ul>
              {group.items.map((item, i) => (
                <li key={i}>{tr(item)}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
