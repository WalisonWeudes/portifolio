import { createApp, nextTick } from 'vue'
import App from './App.vue'
import './assets/styles.css'

createApp(App).mount('#app')

nextTick(() => {
  const revealItems = document.querySelectorAll('.reveal')

  if (!('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'))
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.18 },
  )

  revealItems.forEach((item) => observer.observe(item))
})
