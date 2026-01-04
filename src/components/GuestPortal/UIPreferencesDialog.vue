<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 400px; max-width: 500px" :class="{ 'bg-grey-8 text-white': $q.dark.isActive }">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">UI Preferences</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup :color="$q.dark.isActive ? 'white' : 'grey'" />
      </q-card-section>

      <q-card-section>
        <!-- Language Selection -->
        <div class="q-mb-md">
          <div class="text-subtitle2 q-mb-sm">
            <q-icon name="language" class="q-mr-sm" />
            Language
          </div>
          <q-select
            v-model="selectedLanguage"
            :options="availableLanguages"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            outlined
            @update:model-value="onLanguageChange"
            :dark="$q.dark.isActive"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <span class="text-h6">{{ scope.opt.flag }}</span>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
            
            <template v-slot:selected>
              <div class="row items-center">
                <span class="q-mr-sm">{{ selectedLanguageFlag }}</span>
                {{ selectedLanguageLabel }}
              </div>
            </template>
          </q-select>
        </div>

        <!-- Theme Selection -->
        <div class="q-mb-md">
          <div class="text-subtitle2 q-mb-sm">
            <q-icon name="palette" class="q-mr-sm" />
            Theme
          </div>
          <q-btn-toggle
            v-model="selectedTheme"
            :options="availableThemes"
            color="primary"
            toggle-color="primary"
            :outline="!$q.dark.isActive"
            :unelevated="$q.dark.isActive"
            @update:model-value="onThemeChange"
            class="full-width"
            :text-color="$q.dark.isActive ? 'white' : undefined"
          />
        </div>

        <!-- Additional Preferences -->
        <div class="q-mb-md">
          <div class="text-subtitle2 q-mb-sm">
            <q-icon name="settings" class="q-mr-sm" />
            Additional Settings
          </div>
          
          <q-list>
            <q-item tag="label" v-ripple>
              <q-item-section avatar>
                <q-checkbox 
                  v-model="preferences.notifications_enabled"
                  @update:model-value="updatePreference('notifications_enabled', $event)"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>Enable Notifications</q-item-label>
                <q-item-label caption>Show system notifications</q-item-label>
              </q-item-section>
            </q-item>

            <q-item tag="label" v-ripple>
              <q-item-section avatar>
                <q-checkbox 
                  v-model="preferences.sound_enabled"
                  @update:model-value="updatePreference('sound_enabled', $event)"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>Enable Sounds</q-item-label>
                <q-item-label caption>Play notification sounds</q-item-label>
              </q-item-section>
            </q-item>

            <q-item tag="label" v-ripple>
              <q-item-section avatar>
                <q-checkbox 
                  v-model="preferences.animation_enabled"
                  @update:model-value="updatePreference('animation_enabled', $event)"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>Enable Animations</q-item-label>
                <q-item-label caption>Show smooth transitions</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Close" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useGuestUIPreferences } from 'src/composables/useGuestUIPreferences'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const $q = useQuasar()
const { locale } = useI18n()
const {
  uiLanguage,
  uiTheme,
  uiPreferences,
  availableLanguages,
  availableThemes,
  changeLanguage: changeUILanguage,
  changeTheme,
  updatePreference: updatePref
} = useGuestUIPreferences()

const showDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const selectedLanguage = ref(uiLanguage.value)
const selectedTheme = ref(uiTheme.value)
const preferences = ref({ ...uiPreferences.value })

// Computed properties for display
const selectedLanguageData = computed(() => 
  availableLanguages.value.find(lang => lang.value === selectedLanguage.value)
)

const selectedLanguageFlag = computed(() => selectedLanguageData.value?.flag || '🇺🇸')
const selectedLanguageLabel = computed(() => selectedLanguageData.value?.label || 'English')

// Watch for external changes
watch(uiLanguage, (newLang) => {
  selectedLanguage.value = newLang
  locale.value = newLang // Update i18n locale
})

watch(uiTheme, (newTheme) => {
  selectedTheme.value = newTheme
})

watch(uiPreferences, (newPrefs) => {
  preferences.value = { ...newPrefs }
}, { deep: true })

// Event handlers
const onLanguageChange = async (lang) => {
  try {
    await changeUILanguage(lang)
    locale.value = lang // Update i18n locale immediately
    $q.notify({
      type: 'positive',
      message: 'Language updated successfully',
      position: 'top'
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to update language',
      position: 'top'
    })
  }
}

const onThemeChange = async (theme) => {
  try {
    await changeTheme(theme)
    $q.notify({
      type: 'positive',
      message: 'Theme updated successfully',
      position: 'top'
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to update theme',
      position: 'top'
    })
  }
}

const updatePreference = async (key, value) => {
  try {
    await updatePref(key, value)
    $q.notify({
      type: 'positive',
      message: 'Preference updated successfully',
      position: 'top'
    })
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to update preference',
      position: 'top'
    })
  }
}
</script>

<style lang="scss" scoped>
.q-btn-toggle {
  .q-btn {
    flex: 1;
  }
}
</style>