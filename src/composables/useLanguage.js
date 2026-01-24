import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export function useLanguage() {
  const { locale, t } = useI18n()

  // Elérhető nyelvek konfigurációja
  const supportedLocales = [
    {
      code: 'en-US',
      label: 'English',
      nativeLabel: 'English',
      icon: 'img:https://flagcdn.com/w20/us.png',
      flag: '🇺🇸'
    },
    {
      code: 'hu-HU',
      label: 'Hungarian', 
      nativeLabel: 'Magyar',
      icon: 'img:https://flagcdn.com/w20/hu.png',
      flag: '🇭🇺'
    }
  ]

  // Aktuális nyelv
  const currentLocale = computed(() => locale.value)

  // Aktuális nyelv adatai
  const currentLanguage = computed(() => {
    return supportedLocales.find(l => l.code === currentLocale.value) || supportedLocales[0]
  })

  // Nyelv váltás
  const setLocale = (newLocale) => {
    if (newLocale && supportedLocales.find(l => l.code === newLocale)) {
      locale.value = newLocale
      localStorage.setItem('hospie-locale', newLocale)
      document.documentElement.lang = newLocale.split('-')[0]
      
      // Oldal újratöltése a teljes nyelvi váltás érdekében (opcionális)
      // window.location.reload()
      
      return true
    }
    return false
  }

  // Alapértelmezett nyelv meghatározása
  const getDefaultLocale = () => {
    // localStorage-ból
    const savedLocale = localStorage.getItem('hospie-locale')
    if (savedLocale && supportedLocales.find(l => l.code === savedLocale)) {
      return savedLocale
    }
    
    // Böngésző nyelvéből
    const browserLocale = navigator.language
    if (supportedLocales.find(l => l.code === browserLocale)) {
      return browserLocale
    }
    
    // Nyelv kód alapján (pl. 'hu' -> 'hu-HU')
    const languageCode = browserLocale.split('-')[0]
    const matchingLocale = supportedLocales.find(l => 
      l.code.startsWith(languageCode)
    )
    
    if (matchingLocale) {
      return matchingLocale.code
    }
    
    // Alapértelmezett
    return 'en-US'
  }

  // Nyelv inicializálása
  const initializeLanguage = () => {
    const defaultLocale = getDefaultLocale()
    setLocale(defaultLocale)
  }

  // Nyelv váltás következő elérhető nyelvre
  const toggleLanguage = () => {
    const currentIndex = supportedLocales.findIndex(l => l.code === currentLocale.value)
    const nextIndex = (currentIndex + 1) % supportedLocales.length
    setLocale(supportedLocales[nextIndex].code)
  }

  // Nyelv ellenőrzése
  const isRTL = computed(() => {
    // RTL nyelvek listája (ha szükséges a jövőben)
    const rtlLanguages = ['ar', 'he', 'fa', 'ur']
    const langCode = currentLocale.value.split('-')[0]
    return rtlLanguages.includes(langCode)
  })

  return {
    // Reactive properties
    currentLocale,
    currentLanguage,
    supportedLocales,
    isRTL,
    
    // Methods
    setLocale,
    getDefaultLocale,
    initializeLanguage,
    toggleLanguage,
    
    // i18n methods
    t
  }
}