import { createI18n } from 'vue-i18n'
import es from './es'
import en from './en'

const i18n = createI18n({
  legacy: false,        // Composition API mode
  locale: 'es',        // idioma por defecto
  fallbackLocale: 'en',
  messages: {
    es,
    en,
  },
})

export default i18n
