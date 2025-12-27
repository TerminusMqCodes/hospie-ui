<template>
  <q-layout view="hHh lpR fFf" :class="isDarkMode ? 'bg-dark' : 'bg-grey-1'">
    <q-header elevated :class="isDarkMode ? 'bg-dark text-white' : 'bg-white text-grey-8'" height-hint="64">
      <q-toolbar class="GNL__toolbar">
        <q-btn
          flat
          dense
          round
          @click="toggleLeftDrawer"
          aria-label="Menu"
          icon="menu"
          class="q-mr-sm"
        />

        <q-toolbar-title v-if="$q.screen.gt.xs" shrink class="row items-center no-wrap">
          <span class="q-ml-sm">Hospie PMS</span>
        </q-toolbar-title>

        <q-space />

        <q-input class="GNL__toolbar-input" outlined dense v-model="search" color="bg-grey-7 shadow-1" placeholder="Keresés...">
          <template v-slot:prepend>
            <q-icon v-if="search === ''" name="search" />
            <q-icon v-else name="clear" class="cursor-pointer" @click="search = ''" />
          </template>
          <template v-slot:append>
            <q-btn
              flat
              dense
              round
              aria-label="Menu"
              icon="arrow_drop_down"
            >
              <q-menu anchor="bottom end" self="top end">
                <div class="q-pa-md" style="width: 400px">
                  <div class="text-body2 text-grey q-mb-md">
                    Részletes keresés
                  </div>

                  <div class="row items-center">
                    <div class="col-3 text-subtitle2 text-grey">
                      Exact phrase
                    </div>
                    <div class="col-9 q-pl-md">
                      <q-input dense v-model="exactPhrase" />
                    </div>

                    <div class="col-3 text-subtitle2 text-grey">
                      Has words
                    </div>
                    <div class="col-9 q-pl-md">
                      <q-input dense v-model="hasWords" />
                    </div>

                    <div class="col-3 text-subtitle2 text-grey">
                      Exclude words
                    </div>
                    <div class="col-9 q-pl-md">
                      <q-input dense v-model="excludeWords" />
                    </div>

                    <div class="col-3 text-subtitle2 text-grey">
                      Website
                    </div>
                    <div class="col-9 q-pl-md">
                      <q-input dense v-model="byWebsite" />
                    </div>

                    <div class="col-12 q-pt-lg row justify-end">
                      <q-btn flat dense no-caps color="grey-7" size="md" style="min-width: 68px;" label="Keresés" v-close-popup />
                      <q-btn flat dense no-caps color="grey-7" size="md" style="min-width: 68px;" @click="onClear" label="Törlés" v-close-popup />
                    </div>
                  </div>
                </div>
              </q-menu>
            </q-btn>
          </template>
        </q-input>

        <q-space />

        <div class="q-gutter-sm row items-center no-wrap">
          <q-btn v-if="$q.screen.gt.sm" round dense flat color="text-grey-7" icon="apps">
            <q-tooltip>Alkalmazások</q-tooltip>
            <q-menu anchor="bottom end" self="top end" class="apps-menu">
              <div class="q-pa-md" style="width: 320px">
                <div class="text-body2 text-grey q-mb-md text-center">
                  Hospie SaaS Szolgáltatások
                </div>
                <div class="row q-gutter-sm">
                  <div class="col-5" v-for="app in applications" :key="app.name">
                    <q-card 
                      flat 
                      bordered 
                      class="app-card cursor-pointer" 
                      @click="openApplication(app)"
                      :class="isDarkMode ? 'bg-grey-9 text-white' : 'bg-white'"
                    >
                      <q-card-section class="text-center q-pa-md">
                        <q-icon 
                          :name="app.icon" 
                          size="32px" 
                          :color="app.color"
                          class="q-mb-sm"
                        />
                        <div class="text-caption text-weight-medium">
                          {{ app.name }}
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </div>
            </q-menu>
          </q-btn>
          <DarkModeToggle />
          <q-btn round dense flat color="text-grey-7" icon="notifications">
            <q-badge color="red" text-color="white" floating>
              2
            </q-badge>
            <q-tooltip>Értesítések</q-tooltip>
          </q-btn>
          <q-btn round flat>
            <q-avatar size="26px">
              <img src="https://cdn.quasar.dev/img/boy-avatar.png">
            </q-avatar>
            <q-tooltip>Saját fiók</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      bordered
      :class="isDarkMode ? 'bg-dark' : 'bg-white'"
      :width="280"
    >
      <q-scroll-area class="fit">
        <q-list padding :class="isDarkMode ? 'text-white' : 'text-grey-8'">
          <q-item class="GNL__drawer-item" v-ripple v-for="link in links1" :key="link.text" clickable>
            <q-item-section avatar>
              <q-icon :name="link.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ link.text }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator inset class="q-my-sm" />

          <q-item class="GNL__drawer-item" v-ripple v-for="link in links2" :key="link.text" clickable>
            <q-item-section avatar>
              <q-icon :name="link.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ link.text }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator inset class="q-my-sm" />

          <q-item class="GNL__drawer-item" v-ripple v-for="link in links3" :key="link.text" clickable>
            <q-item-section>
              <q-item-label>{{ link.text }} <q-icon v-if="link.icon" :name="link.icon" /></q-item-label>
            </q-item-section>
          </q-item>

          <div class="q-mt-md">
            <div class="flex flex-center q-gutter-xs">
              <a class="GNL__drawer-footer-link" href="javascript:void(0)" aria-label="Privacy">Adatvédelem</a>
              <span> · </span>
              <a class="GNL__drawer-footer-link" href="javascript:void(0)" aria-label="Terms">ÁSZF</a>
              <span> · </span>
              <a class="GNL__drawer-footer-link" href="javascript:void(0)" aria-label="About">A Hospie-ról</a>
            </div>
          </div>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Under Development Modal -->
    <UnderDevelopmentModal 
      v-model="showUnderDevelopmentModal"
      :feature-name="selectedFeature"
      :expected-date="expectedDate"
      @notification-requested="handleNotificationRequest"
    />
  </q-layout>
</template>

<script>
import { ref, onMounted } from 'vue'
import { fasEarthAmericas, fasFlask } from '@quasar/extras/fontawesome-v6'
import { useDarkMode } from '../composables/useDarkMode'
import DarkModeToggle from '../components/DarkModeToggle.vue'
import UnderDevelopmentModal from '../components/UnderDevelopmentModal.vue'

export default {
  name: 'GoogleNewsLayout',

  components: {
    DarkModeToggle,
    UnderDevelopmentModal
  },

  setup () {
    const leftDrawerOpen = ref(false)
    const search = ref('')
    const showAdvanced = ref(false)
    const showDateOptions = ref(false)
    const exactPhrase = ref('')
    const hasWords = ref('')
    const excludeWords = ref('')
    const byWebsite = ref('')
    const byDate = ref('Any time')

    // Under Development Modal
    const showUnderDevelopmentModal = ref(false)
    const selectedFeature = ref('')
    const expectedDate = ref('2026.01.01.')

    // Dark mode functionality
    const { isDarkMode, loadDarkModePreference } = useDarkMode()

    // Load dark mode preference on component mount
    onMounted(() => {
      loadDarkModePreference()
    })

    function onClear () {
      exactPhrase.value = ''
      hasWords.value = ''
      excludeWords.value = ''
      byWebsite.value = ''
      byDate.value = 'Any time'
    }

    function changeDate (option) {
      byDate.value = option
      showDateOptions.value = false
    }

    function toggleLeftDrawer () {
      leftDrawerOpen.value = !leftDrawerOpen.value
    }

    function openApplication (app) {
      // Show under development modal instead of navigating
      selectedFeature.value = app.name
      showUnderDevelopmentModal.value = true
    }

    function handleNotificationRequest (featureName) {
      console.log('Notification requested for:', featureName)
      // Itt lehet implementálni az értesítés kérés logikáját
      // Például: API hívás a backend felé
    }

    return {
      leftDrawerOpen,
      search,
      showAdvanced,
      showDateOptions,
      exactPhrase,
      hasWords,
      excludeWords,
      byWebsite,
      byDate,
      isDarkMode,
      showUnderDevelopmentModal,
      selectedFeature,
      expectedDate,

      applications: [
        { 
          name: 'HospiePAY', 
          icon: 'payment', 
          color: 'primary',
          route: '/hospiepay'
        },
        { 
          name: 'ChannelManager', 
          icon: 'hub', 
          color: 'secondary',
          route: '/channel-manager'
        },
        { 
          name: 'Előfizetés', 
          icon: 'subscriptions', 
          color: 'info',
          route: '/subscription'
        },
        { 
          name: 'Beállítások', 
          icon: 'settings', 
          color: 'warning',
          route: '/settings'
        }
      ],

      links1: [
        { icon: 'web', text: 'Top stories' },
        { icon: 'person', text: 'For you' },
        { icon: 'star_border', text: 'Favourites' },
        { icon: 'search', text: 'Saved searches' }
      ],
      links2: [
        { icon: 'flag', text: 'Canada' },
        { icon: fasEarthAmericas, text: 'World' },
        { icon: 'place', text: 'Local' },
        { icon: 'domain', text: 'Business' },
        { icon: 'memory', text: 'Technology' },
        { icon: 'local_movies', text: 'Entertainment' },
        { icon: 'directions_bike', text: 'Sports' },
        { icon: fasFlask, text: 'Science' },
        { icon: 'fitness_center', text: 'Health ' }
      ],
      links3: [
        { icon: '', text: 'Language & region' },
        { icon: '', text: 'Settings' },
        { icon: 'open_in_new', text: 'Get the Android app' },
        { icon: 'open_in_new', text: 'Get the iOS app' },
        { icon: '', text: 'Send feedback' },
        { icon: 'open_in_new', text: 'Help' }
      ],

      onClear,
      changeDate,
      toggleLeftDrawer,
      openApplication,
      handleNotificationRequest
    }
  }
}
</script>

<style lang="sass">
.GNL

  &__toolbar
    height: 64px

  &__toolbar-input
    width: 55%

  &__drawer-item
    line-height: 24px
    border-radius: 0 24px 24px 0
    margin-right: 12px

    .q-item__section--avatar
      .q-icon
        color: #5f6368

    .q-item__label
      color: #3c4043
      letter-spacing: .01785714em
      font-size: .875rem
      font-weight: 500
      line-height: 1.25rem

  &__drawer-footer-link
    color: inherit
    text-decoration: none
    font-weight: 500
    font-size: .75rem

.app-card
  transition: all 0.2s ease
  min-height: 80px
  
  &:hover
    transform: translateY(-2px)
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)

.apps-menu
  .q-menu
    border-radius: 8px
</style>