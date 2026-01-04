import { boot } from 'quasar/wrappers'

export default boot(({ app }) => {
  // Load dark mode preference from localStorage on app startup
  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode !== null) {
    const isDark = JSON.parse(savedDarkMode)
    app.config.globalProperties.$q.dark.set(isDark)
  }
})