<template>
  <div class="faq-section">
    <!-- Search -->
    <q-card flat class="liquid-glass-card q-mb-md">
      <q-card-section>
        <q-input
          v-model="searchQuery"
          :placeholder="$t('support.searchFaq')"
          outlined
          clearable
          @update:model-value="onSearch"
          @keyup.enter="performSearch"
        >
          <template v-slot:prepend>
            <q-icon name="mdi-magnify" />
          </template>
          <template v-slot:append>
            <q-btn
              icon="mdi-magnify"
              flat
              round
              @click="performSearch"
            />
          </template>
        </q-input>
        
        <div class="row q-gutter-md q-mt-md">
          <div class="col-md-4 col-sm-6 col-xs-12">
            <q-select
              v-model="selectedCategory"
              :options="categoryOptions"
              :label="$t('support.category')"
              outlined
              clearable
              emit-value
              map-options
              @update:model-value="onCategoryChange"
            />
          </div>
          
          <div class="col-md-4 col-sm-6 col-xs-12">
            <q-select
              v-model="selectedLanguage"
              :options="languageOptions"
              :label="$t('support.language')"
              outlined
              emit-value
              map-options
              @update:model-value="onLanguageChange"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Search Results -->
    <div v-if="searchResults.length > 0" class="q-mb-md">
      <div class="text-h6 q-mb-md">
        {{ $t('support.searchResults') }} ({{ searchResults.length }})
      </div>
      
      <q-list separator class="liquid-glass-card">
        <q-expansion-item
          v-for="faq in searchResults"
          :key="`search-${faq.id}`"
          :label="faq.question"
          :caption="$t(`support.categories.${faq.category}`)"
          icon="mdi-help-circle"
          class="faq-item"
        >
          <div class="q-pa-md" v-html="formatAnswer(faq.answer)"></div>
          
          <div v-if="faq.tags && faq.tags.length" class="q-pa-md q-pt-none">
            <q-chip
              v-for="tag in faq.tags"
              :key="tag"
              :label="tag"
              size="sm"
              color="primary"
              outline
            />
          </div>
        </q-expansion-item>
      </q-list>
    </div>

    <!-- FAQ Categories -->
    <div v-if="!searchQuery && faqByCategory">
      <div
        v-for="(faqs, category) in faqByCategory"
        :key="category"
        class="q-mb-lg"
      >
        <div class="text-h6 q-mb-md flex items-center">
          <q-icon
            :name="getCategoryIcon(category)"
            size="sm"
            class="q-mr-sm"
          />
          {{ $t(`support.categories.${category}`) }}
          <q-chip
            :label="faqs.length"
            size="sm"
            color="primary"
            class="q-ml-sm"
          />
        </div>
        
        <q-list separator class="liquid-glass-card">
          <q-expansion-item
            v-for="faq in faqs"
            :key="`category-${faq.id}`"
            :label="faq.question"
            icon="mdi-help-circle"
            class="faq-item"
          >
            <div class="q-pa-md" v-html="formatAnswer(faq.answer)"></div>
            
            <div v-if="faq.tags && faq.tags.length" class="q-pa-md q-pt-none">
              <q-chip
                v-for="tag in faq.tags"
                :key="tag"
                :label="tag"
                size="sm"
                color="primary"
                outline
              />
            </div>
            
            <div class="q-pa-md q-pt-none">
              <div class="row items-center justify-between">
                <div class="text-caption text-grey-6">
                  {{ $t('support.lastUpdated') }}: {{ formatDate(faq.updated_at) }}
                </div>
                
                <div class="row q-gutter-sm">
                  <q-btn
                    :label="$t('support.helpful')"
                    size="sm"
                    flat
                    color="positive"
                    icon="mdi-thumb-up"
                    @click="markHelpful"
                  />
                  <q-btn
                    :label="$t('support.notHelpful')"
                    size="sm"
                    flat
                    color="negative"
                    icon="mdi-thumb-down"
                    @click="markHelpful"
                  />
                </div>
              </div>
            </div>
          </q-expansion-item>
        </q-list>
      </div>
    </div>

    <!-- No Results -->
    <div v-if="searchQuery && searchResults.length === 0 && !loading" class="text-center q-pa-xl">
      <q-icon name="mdi-help-circle-outline" size="4em" color="grey-5" />
      <div class="text-h6 text-grey-7 q-mt-md">
        {{ $t('support.noFaqResults') }}
      </div>
      <div class="text-body2 text-grey-6 q-mt-sm">
        {{ $t('support.noFaqResultsHint') }}
      </div>
      
      <q-btn
        :label="$t('support.createTicket')"
        color="primary"
        class="q-mt-md"
        @click="$emit('create-ticket')"
      />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner-dots size="2em" color="primary" />
      <div class="text-body2 text-grey-6 q-mt-md">
        {{ $t('support.loadingFaq') }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar, date } from 'quasar'
import { useSupportStore } from 'src/stores/support'

export default {
  name: 'FaqSection',
  
  emits: ['create-ticket'],

  setup() {
    const { t, locale } = useI18n()
    const $q = useQuasar()
    const supportStore = useSupportStore()
    
    const searchQuery = ref('')
    const selectedCategory = ref(null)
    const selectedLanguage = ref(locale.value || 'en')
    const loading = ref(false)
    
    const searchResults = computed(() => supportStore.faqSearchResults)
    const faqByCategory = computed(() => supportStore.faqByCategory)

    const categoryOptions = computed(() => [
      { label: t('support.categories.technical'), value: 'technical' },
      { label: t('support.categories.billing'), value: 'billing' },
      { label: t('support.categories.account'), value: 'account' },
      { label: t('support.categories.feature_request'), value: 'feature_request' },
      { label: t('support.categories.general'), value: 'general' }
    ])

    const languageOptions = computed(() => [
      { label: 'English', value: 'en' },
      { label: 'Magyar', value: 'hu' },
      { label: 'Deutsch', value: 'de' },
      { label: 'Français', value: 'fr' },
      { label: 'Español', value: 'es' }
    ])

    const getCategoryIcon = (category) => {
      const icons = {
        technical: 'mdi-cog',
        billing: 'mdi-credit-card',
        account: 'mdi-account',
        feature_request: 'mdi-lightbulb',
        general: 'mdi-help-circle'
      }
      return icons[category] || 'mdi-help-circle'
    }

    const formatAnswer = (answer) => {
      // Convert markdown-like formatting to HTML
      return answer
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>')
    }

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      return date.formatDate(dateString, 'YYYY-MM-DD')
    }

    const loadFaqContent = async () => {
      loading.value = true
      try {
        await supportStore.fetchFaqContent(selectedCategory.value, selectedLanguage.value)
      } catch (error) {
        console.error('Failed to load FAQ content:', error)
      } finally {
        loading.value = false
      }
    }

    const performSearch = async () => {
      if (!searchQuery.value.trim()) {
        supportStore.clearFaqResults()
        return
      }
      
      loading.value = true
      try {
        await supportStore.searchFaq(
          searchQuery.value,
          selectedCategory.value,
          selectedLanguage.value
        )
      } catch (error) {
        console.error('Failed to search FAQ:', error)
      } finally {
        loading.value = false
      }
    }

    const onSearch = (value) => {
      if (!value) {
        supportStore.clearFaqResults()
      }
    }

    const onCategoryChange = () => {
      if (searchQuery.value) {
        performSearch()
      } else {
        loadFaqContent()
      }
    }

    const onLanguageChange = () => {
      if (searchQuery.value) {
        performSearch()
      } else {
        loadFaqContent()
      }
    }

    const markHelpful = async () => {
      try {
        // Track FAQ feedback (this would be an API call)
        $q.notify({
          type: 'positive',
          message: t('support.feedbackThanks'),
          position: 'top-right'
        })
      } catch (error) {
        console.error('Failed to submit feedback:', error)
      }
    }

    // Watch locale changes
    watch(locale, (newLocale) => {
      selectedLanguage.value = newLocale
      onLanguageChange()
    })

    onMounted(() => {
      loadFaqContent()
    })

    return {
      searchQuery,
      selectedCategory,
      selectedLanguage,
      loading,
      searchResults,
      faqByCategory,
      categoryOptions,
      languageOptions,
      getCategoryIcon,
      formatAnswer,
      formatDate,
      performSearch,
      onSearch,
      onCategoryChange,
      onLanguageChange,
      markHelpful
    }
  }
}
</script>

<style lang="scss" scoped>
.faq-section {
  .liquid-glass-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .faq-item {
    &:hover {
      background: rgba(255, 255, 255, 0.05);
    }
  }
}
</style>