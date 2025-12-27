<template>
  <q-page class="q-pa-lg">
    <div class="row q-gutter-lg">
      <!-- Welcome Section -->
      <div class="col-12">
        <q-card class="welcome-card">
          <q-card-section>
            <div class="text-h4 text-weight-light">
              Welcome back, {{ authStore.userName }}! 👋
            </div>
            <div class="text-subtitle1 text-grey-7 q-mt-sm">
              Here's what's happening with your property today
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Stats Cards -->
      <div class="col-12 col-md-3">
        <q-card class="stat-card">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h6">Today's Arrivals</div>
                <div class="text-h4 text-primary">12</div>
              </div>
              <div class="col-auto">
                <q-icon name="flight_land" size="40px" color="primary" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="stat-card">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h6">Departures</div>
                <div class="text-h4 text-secondary">8</div>
              </div>
              <div class="col-auto">
                <q-icon name="flight_takeoff" size="40px" color="secondary" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="stat-card">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h6">Occupancy</div>
                <div class="text-h4 text-positive">85%</div>
              </div>
              <div class="col-auto">
                <q-icon name="hotel" size="40px" color="positive" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="stat-card">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h6">Revenue</div>
                <div class="text-h4 text-accent">$2,450</div>
              </div>
              <div class="col-auto">
                <q-icon name="attach_money" size="40px" color="accent" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Quick Actions -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Quick Actions</div>
            <div class="row q-gutter-sm">
              <q-btn 
                color="primary" 
                icon="add" 
                label="New Reservation" 
                @click="$router.push('/reservations')"
              />
              <q-btn 
                color="secondary" 
                icon="hotel" 
                label="Room Status" 
                outline
              />
              <q-btn 
                color="accent" 
                icon="person_add" 
                label="Check In" 
                outline
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Recent Activity -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Recent Activity</div>
            <q-list>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="check_circle" color="positive" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>John Doe checked in</q-item-label>
                  <q-item-label caption>Room 101 • 2 minutes ago</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item>
                <q-item-section avatar>
                  <q-icon name="event" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>New reservation created</q-item-label>
                  <q-item-label caption>Jane Smith • 15 minutes ago</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item>
                <q-item-section avatar>
                  <q-icon name="cleaning_services" color="warning" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Room 205 cleaning completed</q-item-label>
                  <q-item-label caption>Housekeeping • 1 hour ago</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useAuthStore } from 'src/stores/auth'

const authStore = useAuthStore()
</script>

<style scoped>
.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-card {
  height: 120px;
}
</style>