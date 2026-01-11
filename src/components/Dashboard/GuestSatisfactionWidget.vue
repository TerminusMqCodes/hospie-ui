<template>
  <DashboardWidget
    title="Guest Satisfaction"
    :subtitle="`${satisfactionData.totalReviews} reviews this month`"
    :loading="loading"
    :error="error"
    size="medium"
    @refresh="fetchSatisfactionData"
  >
    <div class="satisfaction-display">
      <!-- Overall Score -->
      <div class="overall-score q-mb-md">
        <div class="score-circle">
          <canvas ref="scoreCanvas" width="120" height="120"></canvas>
          <div class="score-overlay">
            <div class="score-number">{{ satisfactionData.overallScore }}</div>
            <div class="score-label">Overall</div>
          </div>
        </div>
        <div class="score-details">
          <div class="score-trend" :class="satisfactionData.trend >= 0 ? 'positive' : 'negative'">
            <q-icon :name="satisfactionData.trend >= 0 ? 'trending_up' : 'trending_down'" />
            {{ Math.abs(satisfactionData.trend) }}% from last month
          </div>
        </div>
      </div>

      <!-- Rating Distribution -->
      <div class="rating-distribution q-mb-md">
        <div class="distribution-title">Rating Distribution</div>
        <div class="rating-bars">
          <div
            v-for="(rating, index) in satisfactionData.distribution"
            :key="index"
            class="rating-bar"
          >
            <div class="rating-stars">
              <q-icon
                v-for="star in 5"
                :key="star"
                name="star"
                :class="star <= (5 - index) ? 'filled' : 'empty'"
              />
            </div>
            <div class="rating-progress">
              <div
                class="rating-fill"
                :style="{ width: `${rating.percentage}%` }"
              ></div>
            </div>
            <div class="rating-count">{{ rating.count }}</div>
          </div>
        </div>
      </div>

      <!-- Category Scores -->
      <div class="category-scores q-mb-md">
        <div class="category-title">Category Breakdown</div>
        <div class="category-grid">
          <div
            v-for="category in satisfactionData.categories"
            :key="category.name"
            class="category-item"
          >
            <div class="category-header">
              <q-icon :name="category.icon" />
              <span class="category-name">{{ category.name }}</span>
            </div>
            <div class="category-score">{{ category.score }}</div>
            <div class="category-bar">
              <div
                class="category-progress"
                :style="{ 
                  width: `${(category.score / 5) * 100}%`,
                  backgroundColor: getScoreColor(category.score)
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Reviews -->
      <div class="recent-reviews">
        <div class="reviews-title">Recent Reviews</div>
        <div class="reviews-list">
          <div
            v-for="review in satisfactionData.recentReviews"
            :key="review.id"
            class="review-item"
          >
            <div class="review-header">
              <div class="review-rating">
                <q-icon
                  v-for="star in 5"
                  :key="star"
                  name="star"
                  :class="star <= review.rating ? 'filled' : 'empty'"
                />
              </div>
              <div class="review-date">{{ formatDate(review.date) }}</div>
            </div>
            <div class="review-comment">{{ review.comment }}</div>
            <div class="review-guest">- {{ review.guestName }}</div>
          </div>
        </div>
      </div>

      <!-- Satisfaction Trend Chart -->
      <div class="satisfaction-trend q-mt-md">
        <div class="trend-title">30-Day Satisfaction Trend</div>
        <canvas ref="trendCanvas" height="100"></canvas>
      </div>
    </div>
  </DashboardWidget>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import DashboardWidget from './DashboardWidget.vue'

Chart.register(...registerables)

const loading = ref(false)
const error = ref(null)
const scoreCanvas = ref(null)
const trendCanvas = ref(null)
let scoreChart = null
let trendChart = null

const satisfactionData = ref({
  overallScore: 0,
  trend: 0,
  totalReviews: 0,
  distribution: [],
  categories: [],
  recentReviews: [],
  trendData: []
})

const fetchSatisfactionData = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock data
    satisfactionData.value = {
      overallScore: 4.3,
      trend: 8.5,
      totalReviews: 247,
      distribution: [
        { count: 156, percentage: 85 },
        { count: 45, percentage: 25 },
        { count: 28, percentage: 15 },
        { count: 12, percentage: 7 },
        { count: 6, percentage: 3 }
      ],
      categories: [
        { name: 'Cleanliness', icon: 'cleaning_services', score: 4.5 },
        { name: 'Service', icon: 'room_service', score: 4.2 },
        { name: 'Location', icon: 'location_on', score: 4.4 },
        { name: 'Value', icon: 'attach_money', score: 4.0 },
        { name: 'Amenities', icon: 'pool', score: 4.1 },
        { name: 'Food', icon: 'restaurant', score: 4.3 }
      ],
      recentReviews: [
        {
          id: 1,
          rating: 5,
          comment: 'Excellent service and beautiful rooms. Will definitely come back!',
          guestName: 'Sarah Johnson',
          date: new Date(Date.now() - 1000 * 60 * 60 * 2)
        },
        {
          id: 2,
          rating: 4,
          comment: 'Great location and friendly staff. Room was clean and comfortable.',
          guestName: 'Mike Chen',
          date: new Date(Date.now() - 1000 * 60 * 60 * 6)
        },
        {
          id: 3,
          rating: 5,
          comment: 'Outstanding experience! The spa was amazing.',
          guestName: 'Emma Wilson',
          date: new Date(Date.now() - 1000 * 60 * 60 * 12)
        }
      ],
      trendData: generateMockTrend()
    }
    
    await nextTick()
    updateCharts()
  } catch (err) {
    error.value = 'Failed to load satisfaction data'
    console.error('Satisfaction data error:', err)
  } finally {
    loading.value = false
  }
}

const generateMockTrend = () => {
  const trend = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    trend.push({
      date: date.toISOString().split('T')[0],
      score: Math.random() * 1 + 3.5 // Random score between 3.5 and 4.5
    })
  }
  return trend
}

const updateCharts = () => {
  updateScoreChart()
  updateTrendChart()
}

const updateScoreChart = () => {
  if (!scoreCanvas.value) return
  
  const ctx = scoreCanvas.value.getContext('2d')
  
  if (scoreChart) {
    scoreChart.destroy()
  }
  
  const score = satisfactionData.value.overallScore
  const percentage = (score / 5) * 100
  
  scoreChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [percentage, 100 - percentage],
        backgroundColor: [getScoreColor(score), '#e0e0e0'],
        borderWidth: 0,
        cutout: '75%'
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: false
        }
      }
    }
  })
}

const updateTrendChart = () => {
  if (!trendCanvas.value) return
  
  const ctx = trendCanvas.value.getContext('2d')
  
  if (trendChart) {
    trendChart.destroy()
  }
  
  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: satisfactionData.value.trendData.map(t => {
        const date = new Date(t.date)
        return `${date.getMonth() + 1}/${date.getDate()}`
      }),
      datasets: [{
        label: 'Satisfaction Score',
        data: satisfactionData.value.trendData.map(t => t.score),
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false,
          min: 3,
          max: 5,
          ticks: {
            stepSize: 0.5
          }
        },
        x: {
          display: false
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  })
}

const getScoreColor = (score) => {
  if (score >= 4.5) return '#4caf50'
  if (score >= 4.0) return '#8bc34a'
  if (score >= 3.5) return '#ffc107'
  if (score >= 3.0) return '#ff9800'
  return '#f44336'
}

const formatDate = (date) => {
  const now = new Date()
  const diff = now - date
  const hours = Math.floor(diff / (1000 * 60 * 60))
  
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  
  return date.toLocaleDateString()
}

onMounted(() => {
  fetchSatisfactionData()
})

onUnmounted(() => {
  if (scoreChart) {
    scoreChart.destroy()
  }
  if (trendChart) {
    trendChart.destroy()
  }
})
</script>

<style lang="scss" scoped>
.satisfaction-display {
  .overall-score {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    
    .score-circle {
      position: relative;
      display: inline-block;
      
      .score-overlay {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        
        .score-number {
          font-size: 1.8rem;
          font-weight: bold;
          color: var(--q-primary);
          line-height: 1;
        }
        
        .score-label {
          font-size: 0.75rem;
          color: var(--q-dark);
          opacity: 0.7;
        }
      }
    }
    
    .score-details {
      margin-top: 8px;
      text-align: center;
      
      .score-trend {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.875rem;
        
        &.positive {
          color: #4caf50;
        }
        
        &.negative {
          color: #f44336;
        }
        
        .q-icon {
          margin-right: 4px;
        }
      }
    }
  }
  
  .rating-distribution {
    .distribution-title {
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 12px;
      color: var(--q-dark);
    }
    
    .rating-bars {
      .rating-bar {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        
        .rating-stars {
          width: 80px;
          display: flex;
          
          .q-icon {
            font-size: 14px;
            
            &.filled {
              color: #ffc107;
            }
            
            &.empty {
              color: #e0e0e0;
            }
          }
        }
        
        .rating-progress {
          flex: 1;
          height: 8px;
          background: #e0e0e0;
          border-radius: 4px;
          margin: 0 8px;
          overflow: hidden;
          
          .rating-fill {
            height: 100%;
            background: linear-gradient(90deg, #1976d2, #42a5f5);
            transition: width 0.3s ease;
          }
        }
        
        .rating-count {
          width: 30px;
          text-align: right;
          font-size: 0.75rem;
          color: var(--q-dark);
        }
      }
    }
  }
  
  .category-scores {
    .category-title {
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 12px;
      color: var(--q-dark);
    }
    
    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
      
      .category-item {
        .category-header {
          display: flex;
          align-items: center;
          margin-bottom: 4px;
          
          .q-icon {
            font-size: 16px;
            margin-right: 6px;
            color: var(--q-primary);
          }
          
          .category-name {
            font-size: 0.75rem;
            color: var(--q-dark);
          }
        }
        
        .category-score {
          font-size: 1rem;
          font-weight: bold;
          color: var(--q-primary);
          margin-bottom: 4px;
        }
        
        .category-bar {
          height: 4px;
          background: #e0e0e0;
          border-radius: 2px;
          overflow: hidden;
          
          .category-progress {
            height: 100%;
            transition: width 0.3s ease;
          }
        }
      }
    }
  }
  
  .recent-reviews {
    .reviews-title {
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 12px;
      color: var(--q-dark);
    }
    
    .reviews-list {
      max-height: 200px;
      overflow-y: auto;
      
      .review-item {
        padding: 12px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        margin-bottom: 8px;
        
        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
          
          .review-rating {
            .q-icon {
              font-size: 14px;
              
              &.filled {
                color: #ffc107;
              }
              
              &.empty {
                color: #e0e0e0;
              }
            }
          }
          
          .review-date {
            font-size: 0.75rem;
            color: var(--q-dark);
            opacity: 0.7;
          }
        }
        
        .review-comment {
          font-size: 0.875rem;
          color: var(--q-dark);
          margin-bottom: 4px;
          line-height: 1.4;
        }
        
        .review-guest {
          font-size: 0.75rem;
          color: var(--q-primary);
          font-style: italic;
        }
      }
    }
  }
  
  .satisfaction-trend {
    .trend-title {
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--q-dark);
    }
  }
}

.body--dark .satisfaction-display {
  .review-item {
    border-color: rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.02);
  }
}
</style>