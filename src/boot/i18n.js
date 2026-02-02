import { defineBoot } from '#q-app/wrappers'
import { createI18n } from 'vue-i18n'
import messages from 'src/i18n'

// Alapértelmezett nyelv meghatározása
const getDefaultLocale = () => {
  // Először a localStorage-ból próbáljuk betölteni
  const savedLocale = localStorage.getItem('hospie-locale')
  if (savedLocale && messages[savedLocale]) {
    return savedLocale
  }
  
  // Ha nincs mentett nyelv, akkor a böngésző nyelvét használjuk
  const browserLocale = navigator.language
  
  // Ellenőrizzük, hogy a böngésző nyelve támogatott-e
  if (messages[browserLocale]) {
    return browserLocale
  }
  
  // Ha a böngésző nyelve nem támogatott, próbáljuk a nyelv kódot (pl. 'hu' -> 'hu-HU')
  const languageCode = browserLocale.split('-')[0]
  const supportedLocale = Object.keys(messages).find(locale => 
    locale.startsWith(languageCode)
  )
  
  if (supportedLocale) {
    return supportedLocale
  }
  
  // Alapértelmezett: angol
  return 'en-US'
}

export default defineBoot(({ app }) => {
  const i18n = createI18n({
    locale: getDefaultLocale(),
    fallbackLocale: 'en-US',
    globalInjection: true,
    messages,
    legacy: true, // Vue 2 Options API kompatibilitás
  })

  // Nyelv váltó függvény globálisan elérhető
  app.config.globalProperties.$setLocale = (locale) => {
    if (messages[locale]) {
      i18n.global.locale.value = locale
      localStorage.setItem('hospie-locale', locale)
      document.documentElement.lang = locale.split('-')[0]
    }
  }

  // Aktuális nyelv lekérése
  app.config.globalProperties.$getLocale = () => {
    return i18n.global.locale.value
  }

  // Elérhető nyelvek listája
  app.config.globalProperties.$getAvailableLocales = () => {
    return Object.keys(messages)
  }

  // Set i18n instance on app
  app.use(i18n)
  
  // Beállítjuk a dokumentum nyelvét
  document.documentElement.lang = i18n.global.locale.value.split('-')[0]
})
