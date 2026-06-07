<template>
  <div class="chat-page">
    <van-nav-bar title="AI 对话" left-arrow @click-left="goBack" fixed />

    <div ref="messageListRef" class="message-list">
      <div v-for="(msg, index) in messages" :key="index" class="message-item" :class="msg.role">
        <div class="message-bubble">
          {{ msg.content }}
          <span v-if="msg.streaming" class="cursor-blink">|</span>
        </div>
      </div>

      <div v-if="errorMsg" class="message-item assistant">
        <div class="message-bubble error">{{ errorMsg }}</div>
      </div>
    </div>

    <div class="input-area">
      <van-field
        v-model="inputText"
        placeholder="输入消息..."
        :disabled="streaming"
        @keypress.enter="handleSend"
        class="input-field"
      />
      <van-button v-if="streaming" type="danger" round @click="handleStop" class="stop-btn"> 终止 </van-button>
      <van-button v-else type="primary" round :disabled="!inputText.trim()" @click="handleSend" class="send-btn">
        发送
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Message {
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

const router = useRouter()
const { sendChatStream } = useChatApi()
const inputText = ref('')
const streaming = ref(false)
const messages = ref<Message[]>([])
const messageListRef = ref<HTMLElement>()
const errorMsg = ref('')

let abortController: AbortController | null = null

function goBack() {
  router.back()
}

function scrollToBottom() {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

async function handleSend() {
  const text = inputText.value.trim()
  if (!text || streaming.value) return

  inputText.value = ''
  errorMsg.value = ''

  messages.value.push({ role: 'user', content: text })

  messages.value.push({ role: 'assistant', content: '', streaming: true })
  scrollToBottom()

  streaming.value = true
  abortController = new AbortController()

  try {
    const stream = await sendChatStream(text, true, abortController.signal)
    const reader = stream.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    // 通过 reactive 数组访问 assistant 消息，确保响应式更新
    const getAssistantMsg = () => messages.value[messages.value.length - 1] as Message

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data:')) continue

        const jsonStr = trimmed.slice(5).trim()
        if (jsonStr === '[DONE]') continue

        try {
          const parsed = JSON.parse(jsonStr)
          const content = parsed.choices?.[0]?.delta?.content
          if (content) {
            getAssistantMsg().content += content
            scrollToBottom()
            await nextTick()
          }
        } catch {
          // 非 JSON 行，跳过
        }
      }
    }

    reader.releaseLock()
    getAssistantMsg().streaming = false
  } catch (err: any) {
    const lastMsg = messages.value[messages.value.length - 1] as Message
    if (err.name === 'AbortError') {
      lastMsg.streaming = false
      if (!lastMsg.content) {
        messages.value.pop()
      }
    } else {
      lastMsg.streaming = false
      errorMsg.value = err.message || '请求出错，请重试'
      console.error('Chat error:', err)
    }
  } finally {
    streaming.value = false
    abortController = null
  }
}

function handleStop() {
  abortController?.abort()
}
</script>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 60px 16px 80px;
}

.message-item {
  display: flex;
  margin-bottom: 16px;
}

.message-item.user {
  justify-content: flex-end;
}

.message-item.assistant {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 75%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 15px;
  line-height: 1.6;
  word-break: break-word;
  white-space: pre-wrap;
}

.message-item.user .message-bubble {
  background: #1989fa;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.message-item.assistant .message-bubble {
  background: #fff;
  color: #333;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.message-bubble.error {
  background: #fff0f0;
  color: #ee0a24;
}

.cursor-blink {
  animation: blink 0.8s infinite;
  color: #1989fa;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

.input-area {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fff;
  border-top: 1px solid #ebedf0;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
}

.input-field {
  flex: 1;
  border-radius: 20px;
  background: #f5f5f5;
}

.send-btn,
.stop-btn {
  flex-shrink: 0;
  height: 36px;
  min-width: 56px;
}
</style>
