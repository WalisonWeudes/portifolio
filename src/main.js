import { createApp, nextTick } from 'vue'
import App from './App.vue'
import './assets/styles.css'

createApp(App).mount('#app')

nextTick(() => {
    const sessoes = document.querySelectorAll('.container-universidade')
    

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active')
            }
        })
    }, { threshold: 0.5 })

    sessoes.forEach(sessao => observer.observe(sessao))
})


nextTick(() => {
    const sessoes = document.querySelectorAll('.timeline')
    

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active')
            }
        })
    }, { threshold: 0.1 })

    sessoes.forEach(sessao => observer.observe(sessao))
})


nextTick(() => {
    const sessoes = document.querySelectorAll('.timeline li')
    

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active')
            }
        })
    }, { threshold: 1.0 })

    sessoes.forEach(sessao => observer.observe(sessao))
})


nextTick(() => {
    const sessoes = document.querySelectorAll('.container-Atividades')
    

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active')
            }
        })
    }, { threshold: 0.5 })

    sessoes.forEach(sessao => observer.observe(sessao))
})

