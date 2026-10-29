import KineticText from '../KineticText'
import StatsStrip from '../StatsStrip'
import FieldSection from './FieldSection'
import { activities } from '../../data/content'
import { useI18n } from '../../i18n'

export default function ExperienceSection() {
  const { t, tr } = useI18n()

  return (
    <section id="experiencia" className="section experience" aria-labelledby="experience-title">
      <header className="section-heading reveal">
        <div>
          <span>03</span>
          <p>{t('experience.label')}</p>
        </div>
        <h2 id="experience-title">
          <KineticText text={t('experience.title1')} />
          <br />
          <em>
            <KineticText text={t('experience.title2')} />
          </em>
        </h2>
        <p>{t('experience.desc')}</p>
      </header>
      <StatsStrip />
      <ol className="experience-list">
        {activities.map((activity, index) => (
          <li key={index} className="reveal">
            <time>{tr(activity.year)}</time>
            <div>
              <h3>{tr(activity.title)}</h3>
              <span>{tr(activity.role)}</span>
            </div>
            <p>{tr(activity.description)}</p>
            <i>↗</i>
          </li>
        ))}
      </ol>
      <FieldSection />
    </section>
  )
}
