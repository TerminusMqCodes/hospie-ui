<template>
  <div class="fullscreen bg-accent text-white text-center q-pa-md flex flex-center">
    <div>
      <div style="font-size: 30vh">
        🚫
      </div>

      <div class="text-h2" style="opacity:.4">
        Unauthorized
      </div>

      <div class="text-h5 q-mt-md">
        {{ message || 'You do not have permission to access this page.' }}
      </div>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="blue"
        unelevated
        to="/dashboard"
        label="Go to Dashboard"
        no-caps
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const message = computed(() => route.query.message)
</script>