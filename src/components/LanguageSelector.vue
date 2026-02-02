<template>
  <q-btn-dropdown
    :label="currentLanguageLabel"
    :icon="currentLanguageIcon"
    flat
    dense
    class="language-selector"
    :class="{ 'text-white': darkMode }"
  >
    <q-list>
      <q-item
        v-for="locale in availableLocales"
        :key="locale.code"
        clickable
        v-close-popup
        @click="changeLanguage(locale.code)"
        :active="locale.code === currentLocale"
        active-class="bg-primary text-white"
      >
        <q-item-section avatar>
          <q-icon :name="locale.icon" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ locale.label }}</q-item-label>
          <q-item-label caption>{{ locale.nativeLabel }}</q-item-label>
        </q-item-section>
        <q-item-section side v-if="locale.code === currentLocale">
          <q-icon name="check" color="positive" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDarkMode } from 'src/composables/useDarkMode'

const { locale, t } = useI18n()
const { darkMode } = useDarkMode()

// Elérhető nyelvek konfigurációja
const availableLocales = [
  {
    code: 'en-US',
    label: 'English',
    nativeLabel: 'English',
    icon: 'img:https://flagcdn.com/w20/us.png'
  },
  {
    code: 'hu-HU',
    label: 'Hungarian',
    nativeLabel: 'Magyar',
    icon: 'img:https://flagcdn.com/w20/hu.png'
  }
]

// Aktuális nyelv
const currentLocale = computed(() => locale.value)

// Aktuális nyelv címkéje
const currentLanguageLabel = computed(() => {
  const current = availableLocales.find(l => l.code === currentLocale.value)
  return current ? current.nativeLabel : t('language.select')
})

// Aktuális nyelv ikonja
const currentLanguageIcon = computed(() => {
  const current = availableLocales.find(l => l.code === currentLocale.value)
  return current ? current.icon : 'language'
})

// Nyelv váltás
const changeLanguage = (newLocale) => {
  if (newLocale !== currentLocale.value) {
    locale.value = newLocale
    localStorage.setItem('hospie-locale', newLocale)
    document.documentElement.lang = newLocale.split('-')[0]
    
    // Értesítés a sikeres váltásról
    const current = availableLocales.find(l => l.code === newLocale)
    if (current) {
      // Quasar notify használata (ha elérhető)
      if (window.$q && window.$q.notify) {
        window.$q.notify({
          message: t('language.select') + ': ' + current.nativeLabel,
          color: 'positive',
          icon: 'language',
          position: 'top',
          timeout: 2000
        })
      }
    }
  }
}
</script>

<style scoped>
.language-selector {
  min-width: 120px;
}

.language-selector :deep(.q-btn__content) {
  justify-content: flex-start;
}

.q-item {
  min-height: 48px;
}

.q-item-section--avatar {
  min-width: 32px;
}
</style>