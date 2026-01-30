<template>
  <div class="live-chat-widget">
    <!-- Chat Header -->
    <div class="chat-header bg-primary text-white q-pa-md">
      <div class="row items-center">
        <div class="col">
          <div class="text-subtitle1">{{ $t('support.liveChat') }}</div>
          <div class="text-caption">
            <q-icon name="mdi-circle" size="xs" color="green" />
            {{ $t('support.online') }}
          </div>
        </div>
        <div class="col-auto">
          <q-btn
            icon="mdi-minus"
            flat
            round
            dense
            @click="minimized = !minimized"
          />
          <q-btn
            icon="mdi-close"
            flat
            round
            dense
            @click="$emit('close')"
          />
        </div>
      </div>
    </div>

    <!-- Chat Body -->
    <div v-show="!minimized" class="chat-body">
      <!-- Session Info -->
      <div v-if="session" class="session-info q-pa-sm bg-grey-2">
        <div class="text-caption text-grey-7">
          {{ $t('support.sessionId') }}: {{ session.session_id }}
        </div>
        <div class="text-caption text-grey-7">
          {{ $t('support.connectedAt') }}: {{ formatDate(session.created_at) }}
        </div>
      </div>

      <!-- Messages -->
      <div class="messages-container" ref="messagesContainer">
        <div class="q-pa-md">
          <!-- Welcome Message -->
          <div class="message-item agent-message">
            <div class="message-avatar">
              <q-avatar size="sm" color="primary" text-color="white" icon="mdi-account-tie" />
            </div>
            <div class="message-content">
              <div class="message-bubble">
                {{ $t('support.chatWelcomeMessage') }}
              </div>
              <div class="message-time">
                {{ formatTime(new Date()) }}
              </div>
            </div>
          </div>

          <!-- Chat Messages -->
          <div
            v-for="message in messages"
            :key="message.id"
            class="message-item"
            :class="message.sender_type === 'agent' ? 'agent-message' : 'user-message'"
          >
            <div class="message-avatar">
              <q-avatar
                size="sm"
                :color="message.sender_type === 'agent' ? 'primary' : 'secondary'"
                text-color="white"
                :icon="message.sender_type === 'agent' ? 'mdi-account-tie' : 'mdi-account'"
              />
            </div>
            <div class="message-content">
              <div class="message-bubble">
                {{ message.content }}
              </div>
              <div class="message-time">
                {{ formatTime(message.created_at) }}
              </div>
            </div>
          </div>

          <!-- Typing Indicator -->
          <div v-if="agentTyping" class="message-item agent-message">
            <div class="message-avatar">
              <q-avatar size="sm" color="primary" text-color="white" icon="mdi-account-tie" />
            </div>
            <div class="message-content">
              <div class="message-bubble typing-indicator">
                <div class="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Message Input -->
      <div class="message-input q-pa-md bg-white">
        <div class="row q-gutter-sm">
          <div class="col">
            <q-input
              v-model="newMessage"
              :placeholder="$t('support.typeMessage')"
              outlined
              dense
              @keyup.enter="sendMessage"
              :disable="sending"
            />
          </div>
          <div class="col-auto">
            <q-btn
              icon="mdi-send"
              color="primary"
              @click="sendMessage"
              :loading="sending"
              :disable="!newMessage.trim()"
            />
          </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="row q-gutter-xs q-mt-sm">
          <q-chip
            v-for="quickAction in quickActions"
            :key="quickAction.id"
            :label="quickAction.label"
            clickable
            size="sm"
            color="grey-3"
            @click="sendQuickAction(quickAction)"
          />
        </div>
      </div>
    </div>

    <!-- Minimized State -->
    <div v-show="minimized" class="minimized-state q-pa-md text-center">
      <q-icon name="mdi-chat" size="lg" color="primary" />
      <div class="text-caption q-mt-sm">{{ $t('support.chatMinimized') }}</div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { date } from 'quasar'

export default {
  name: 'LiveChatWidget',
  
  props: {
    session: {
      type: Object,
      required: true
    }
  },

  emits: ['close', 'message-sent'],

  setup(props, { emit }) {
    const { t } = useI18n()
    
    const minimized = ref(false)
    const newMessage = ref('')
    const sending = ref(false)
    const agentTyping = ref(false)
    const messages = ref([])
    const messagesContainer = ref(null)

    const quickActions = computed(() => [
      { id: 1, label: t('support.quickActions.needHelp'), message: t('support.quickActions.needHelpMessage') },
      { id: 2, label: t('support.quickActions.technicalIssue'), message: t('support.quickActions.technicalIssueMessage') },
      { id: 3, label: t('support.quickActions.billing'), message: t('support.quickActions.billingMessage') },
      { id: 4, label: t('support.quickActions.featureRequest'), message: t('support.quickActions.featureRequestMessage') }
    ])

    const formatDate = (dateString) => {
      if (!dateString) return ''
      return date.formatDate(dateString, 'YYYY-MM-DD HH:mm')
    }

    const formatTime = (dateString) => {
      if (!dateString) return ''
      return date.formatDate(dateString, 'HH:mm')
    }

    const scrollToBottom = async () => {
      await nextTick()
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    }

    const sendMessage = async () => {
      if (!newMessage.value.trim() || sending.value) return
      
      const messageContent = newMessage.value.trim()
      newMessage.value = ''
      sending.value = true

      try {
        // Add user message to local messages
        const userMessage = {
          id: Date.now(),
          content: messageContent,
          sender_type: 'user',
          created_at: new Date().toISOString()
        }
        
        messages.value.push(userMessage)
        await scrollToBottom()

        // Simulate agent typing
        agentTyping.value = true
        
        // Here you would send the message to your chat service
        // For now, we'll simulate a response
        setTimeout(() => {
          agentTyping.value = false
          
          const agentResponse = {
            id: Date.now() + 1,
            content: getAgentResponse(messageContent),
            sender_type: 'agent',
            created_at: new Date().toISOString()
          }
          
          messages.value.push(agentResponse)
          scrollToBottom()
        }, 1500)

        emit('message-sent', userMessage)
        
      } catch (error) {
        console.error('Failed to send message:', error)
      } finally {
        sending.value = false
      }
    }

    const sendQuickAction = (action) => {
      newMessage.value = action.message
      sendMessage()
    }

    const getAgentResponse = (userMessage) => {
      // Simple response logic - in real implementation this would be handled by your chat service
      const lowerMessage = userMessage.toLowerCase()
      
      if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
        return t('support.agentResponses.help')
      } else if (lowerMessage.includes('technical') || lowerMessage.includes('bug') || lowerMessage.includes('error')) {
        return t('support.agentResponses.technical')
      } else if (lowerMessage.includes('billing') || lowerMessage.includes('payment') || lowerMessage.includes('invoice')) {
        return t('support.agentResponses.billing')
      } else if (lowerMessage.includes('feature') || lowerMessage.includes('request')) {
        return t('support.agentResponses.feature')
      } else {
        return t('support.agentResponses.default')
      }
    }

    // Watch for new messages to auto-scroll
    watch(messages, () => {
      scrollToBottom()
    }, { deep: true })

    onMounted(() => {
      scrollToBottom()
    })

    return {
      minimized,
      newMessage,
      sending,
      agentTyping,
      messages,
      messagesContainer,
      quickActions,
      formatDate,
      formatTime,
      sendMessage,
      sendQuickAction
    }
  }
}
</script>

<style lang="scss" scoped>
.live-chat-widget {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  .chat-header {
    flex-shrink: 0;
  }

  .chat-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .session-info {
    flex-shrink: 0;
    border-bottom: 1px solid #e0e0e0;
  }

  .messages-container {
    flex: 1;
    overflow-y: auto;
    background: #f5f5f5;
  }

  .message-item {
    display: flex;
    margin-bottom: 16px;
    
    &.user-message {
      flex-direction: row-reverse;
      
      .message-content {
        align-items: flex-end;
      }
      
      .message-bubble {
        background: #1976d2;
        color: white;
      }
    }
    
    &.agent-message {
      .message-bubble {
        background: white;
        color: #333;
      }
    }
  }

  .message-avatar {
    flex-shrink: 0;
    margin: 0 8px;
  }

  .message-content {
    display: flex;
    flex-direction: column;
    max-width: 70%;
  }

  .message-bubble {
    padding: 8px 12px;
    border-radius: 18px;
    word-wrap: break-word;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .message-time {
    font-size: 11px;
    color: #666;
    margin-top: 4px;
    padding: 0 4px;
  }

  .typing-indicator {
    .typing-dots {
      display: flex;
      align-items: center;
      
      span {
        height: 6px;
        width: 6px;
        background: #999;
        border-radius: 50%;
        display: inline-block;
        margin-right: 4px;
        animation: typing 1.4s infinite ease-in-out;
        
        &:nth-child(1) { animation-delay: -0.32s; }
        &:nth-child(2) { animation-delay: -0.16s; }
        &:nth-child(3) { margin-right: 0; }
      }
    }
  }

  .message-input {
    flex-shrink: 0;
    border-top: 1px solid #e0e0e0;
  }

  .minimized-state {
    height: 80px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: #f5f5f5;
  }
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}
</style>