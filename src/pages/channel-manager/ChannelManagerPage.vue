<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="row items-center q-mb-md">
        <div class="col">
          <div class="text-h4">Channel Manager</div>
          <div class="text-subtitle2 text-grey-7">Manage OTA integrations and distribution channels</div>
        </div>
        <div class="col-auto">
          <q-btn color="primary" icon="sync" label="Sync All" @click="syncAll" :loading="syncing" />
        </div>
      </div>

      <!-- Statistics -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-md-3">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6">{{ statistics.total_channels || 0 }}</div>
              <div class="text-caption text-grey-7">Active Channels</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-3">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6">{{ statistics.total_reservations || 0 }}</div>
              <div class="text-caption text-grey-7">Channel Reservations</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-3">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6">{{ statistics.sync_success_rate || 0 }}%</div>
              <div class="text-caption text-grey-7">Sync Success Rate</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-3">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6">{{ statistics.last_sync || 'Never' }}</div>
              <div class="text-caption text-grey-7">Last Sync</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Channels -->
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-md">Connected Channels</div>
          <q-list separator>
            <q-item v-for="channel in channels" :key="channel.id">
              <q-item-section avatar>
                <q-avatar :color="channel.is_active ? 'positive' : 'grey'" text-color="white">
                  <q-icon :name="channel.icon || 'cloud'" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ channel.name }}</q-item-label>
                <q-item-label caption>{{ channel.description }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="row q-gutter-sm">
                  <q-btn flat dense icon="settings" color="primary" @click="configureChannel(channel)" />
                  <q-btn flat dense icon="sync" color="primary" @click="syncChannel(channel.id)" />
                  <q-btn flat dense icon="bug_report" color="primary" @click="testConnection(channel.id)" />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- Sync Logs -->
      <q-card flat bordered class="q-mt-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">Recent Sync Logs</div>
          <q-table
            :rows="syncLogs"
            :columns="logColumns"
            row-key="id"
            :loading="loadingLogs"
            flat
          >
            <template v-slot:body-cell-status="props">
              <q-td :props="props">
                <q-badge :color="props.row.status === 'success' ? 'positive' : 'negative'">
                  {{ props.row.status }}
                </q-badge>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>

      <!-- Channel Configuration Dialog -->
      <q-dialog v-model="showConfigDialog">
        <q-card style="min-width: 600px">
          <q-card-section>
            <div class="text-h6">Configure {{ selectedChannel?.name }}</div>
          </q-card-section>
          <q-card-section>
            <q-form @submit="saveChannelConfig">
              <q-input
                v-model="channelConfig.api_key"
                label="API Key"
                outlined
                dense
                class="q-mb-md"
              />
              <q-input
                v-model="channelConfig.api_secret"
                label="API Secret"
                type="password"
                outlined
                dense
                class="q-mb-md"
              />
              <q-toggle
                v-model="channelConfig.auto_sync"
                label="Auto Sync"
                class="q-mb-md"
              />
              <div class="row q-gutter-sm">
                <q-btn label="Cancel" color="grey" flat @click="showConfigDialog = false" />
                <q-btn label="Save" type="submit" color="primary" />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import channelManagerService from 'src/services/channelManagerService'

export default {
  name: 'ChannelManagerPage',
  setup() {
    const $q = useQuasar()
    const channels = ref([])
    const syncLogs = ref([])
    const statistics = ref({})
    const loading = ref(false)
    const loadingLogs = ref(false)
    const syncing = ref(false)
    const showConfigDialog = ref(false)
    const selectedChannel = ref(null)
    const channelConfig = ref({})

    const logColumns = [
      { name: 'timestamp', label: 'Time', field: 'timestamp', align: 'left' },
      { name: 'channel', label: 'Channel', field: 'channel', align: 'left' },
      { name: 'action', label: 'Action', field: 'action', align: 'left' },
      { name: 'status', label: 'Status', field: 'status', align: 'center' },
      { name: 'message', label: 'Message', field: 'message', align: 'left' }
    ]

    const loadChannels = async () => {
      loading.value = true
      try {
        const response = await channelManagerService.getChannels()
        channels.value = response.data
      } catch {
        $q.notify({ type: 'negative', message: 'Failed to load channels' })
      } finally {
        loading.value = false
      }
    }

    const loadStatistics = async () => {
      try {
        const response = await channelManagerService.getStatistics()
        statistics.value = response.data
      } catch (error) {
        console.error('Failed to load statistics', error)
      }
    }

    const loadSyncLogs = async () => {
      loadingLogs.value = true
      try {
        const response = await channelManagerService.getSyncLogs({ limit: 20 })
        syncLogs.value = response.data
      } catch (error) {
        console.error('Failed to load sync logs', error)
      } finally {
        loadingLogs.value = false
      }
    }

    const syncAll = async () => {
      syncing.value = true
      try {
        for (const channel of channels.value) {
          await syncChannel(channel.id)
        }
        $q.notify({ type: 'positive', message: 'All channels synced successfully' })
      } catch {
        $q.notify({ type: 'negative', message: 'Failed to sync channels' })
      } finally {
        syncing.value = false
      }
    }

    const syncChannel = async (channelId) => {
      try {
        await channelManagerService.syncRates(channelId, {})
        await channelManagerService.syncAvailability(channelId, {})
        $q.notify({ type: 'positive', message: 'Channel synced successfully' })
        loadSyncLogs()
      } catch {
        $q.notify({ type: 'negative', message: 'Failed to sync channel' })
      }
    }

    const testConnection = async (channelId) => {
      try {
        const response = await channelManagerService.testConnection(channelId)
        $q.notify({
          type: response.success ? 'positive' : 'negative',
          message: response.message
        })
      } catch {
        $q.notify({ type: 'negative', message: 'Connection test failed' })
      }
    }

    const configureChannel = async (channel) => {
      selectedChannel.value = channel
      try {
        const response = await channelManagerService.getChannelConfig(channel.id)
        channelConfig.value = response.data
        showConfigDialog.value = true
      } catch {
        $q.notify({ type: 'negative', message: 'Failed to load channel configuration' })
      }
    }

    const saveChannelConfig = async () => {
      try {
        await channelManagerService.updateChannelConfig(selectedChannel.value.id, channelConfig.value)
        $q.notify({ type: 'positive', message: 'Configuration saved successfully' })
        showConfigDialog.value = false
        loadChannels()
      } catch {
        $q.notify({ type: 'negative', message: 'Failed to save configuration' })
      }
    }

    onMounted(() => {
      loadChannels()
      loadStatistics()
      loadSyncLogs()
    })

    return {
      channels,
      syncLogs,
      statistics,
      loading,
      loadingLogs,
      syncing,
      showConfigDialog,
      selectedChannel,
      channelConfig,
      logColumns,
      syncAll,
      syncChannel,
      testConnection,
      configureChannel,
      saveChannelConfig
    }
  }
}
</script>
