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
      <van-button
        class="mode-btn"
        round
        plain
        :icon="inputMode === 'text' ? 'volume-o' : 'edit'"
        :disabled="streaming || isBusy"
        @click="handleToggleInputMode"
      />

      <template v-if="inputMode === 'text'">
        <van-field
          v-model="inputText"
          placeholder="输入消息..."
          :disabled="streaming"
          @keypress.enter="handleSend()"
          class="input-field"
        />
        <van-button v-if="streaming" type="danger" round @click="handleStop" class="stop-btn"> 终止 </van-button>
        <van-button v-else type="primary" round :disabled="!inputText.trim()" @click="handleSend()" class="send-btn">
          发送
        </van-button>
      </template>

      <AudioRecorder
        v-else
        class="voice-record-wrap"
        idle-text="按住说话"
        recording-text="松开发送"
        :recording="isRecording"
        :disabled="isBusy && !streaming"
        unstyled
        @press-start="handleVoicePressStart"
        @press-end="handleVoicePressEnd"
        @press-cancel="handleVoicePressCancel"
      >
        <template #default="{ recording, text }">
          <van-button class="voice-record-btn" :type="streaming || recording ? 'danger' : 'primary'" block round>
            {{ voiceButtonText(recording, text) }}
          </van-button>
        </template>
      </AudioRecorder>
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
const { permissionState, refreshPermission, requestPermission } = useMicrophonePermission()
const { isRecording, startRecording, stopRecording, cleanup } = usePressRecorder()
const { isEncoding, encodeToWavFile } = useWavEncoder()
const { isRecognizing, recognize } = useAsrRecognition()
const inputText = ref('')
const inputMode = ref<'text' | 'voice'>('text')
const streaming = ref(false)
const messages = ref<Message[]>([])
const messageListRef = ref<HTMLElement>()
const errorMsg = ref('')

let abortController: AbortController | null = null
let streamDisplayTimer: ReturnType<typeof window.setInterval> | null = null
let pendingStreamText = ''

const isBusy = computed(() => isEncoding.value || isRecognizing.value)
const voiceBusyText = computed(() => (isEncoding.value ? '正在转换...' : isRecognizing.value ? '正在识别...' : '处理中...'))

onMounted(() => {
  refreshPermission()
})

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

async function handleSend(messageText?: string) {
  const text = (typeof messageText === 'string' ? messageText : inputText.value).trim()
  if (!text || streaming.value) return

  if (!messageText) {
    inputText.value = ''
  }
  errorMsg.value = ''

  messages.value.push({ role: 'user', content: text })

  messages.value.push({ role: 'assistant', content: '', streaming: true })
  scrollToBottom()

  streaming.value = true
  abortController = new AbortController()
  pendingStreamText = ''

  try {
    const stream = await sendChatStream(text, true, abortController.signal)
    const reader = stream.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    // 通过 reactive 数组访问 assistant 消息，确保响应式更新
    const getAssistantMsg = () => messages.value[messages.value.length - 1] as Message
    startSmoothStreamDisplay(getAssistantMsg)

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
            pendingStreamText += content
          }
        } catch {
          // 非 JSON 行，跳过
        }
      }
    }

    reader.releaseLock()
    await flushSmoothStreamDisplay(getAssistantMsg)
    getAssistantMsg().streaming = false
  } catch (err: any) {
    stopSmoothStreamDisplay()
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
    stopSmoothStreamDisplay()
    streaming.value = false
    abortController = null
  }
}

function handleStop() {
  stopSmoothStreamDisplay()
  pendingStreamText = ''
  abortController?.abort()
}

function voiceButtonText(recording: boolean, text: string) {
  if (streaming.value) return '终止'
  if (isBusy.value && !recording) return voiceBusyText.value
  return text
}

function startSmoothStreamDisplay(getAssistantMsg: () => Message) {
  stopSmoothStreamDisplay()
  streamDisplayTimer = window.setInterval(() => {
    if (!pendingStreamText) return

    const step = pendingStreamText.length > 24 ? 3 : 1
    const nextText = pendingStreamText.slice(0, step)
    pendingStreamText = pendingStreamText.slice(step)
    getAssistantMsg().content += nextText
    scrollToBottom()
  }, 24)
}

function stopSmoothStreamDisplay() {
  if (streamDisplayTimer) {
    window.clearInterval(streamDisplayTimer)
    streamDisplayTimer = null
  }
}

function flushSmoothStreamDisplay(getAssistantMsg: () => Message) {
  return new Promise<void>((resolve) => {
    const flushTimer = window.setInterval(() => {
      if (!pendingStreamText) {
        window.clearInterval(flushTimer)
        resolve()
        return
      }

      const step = pendingStreamText.length > 30 ? 4 : 2
      getAssistantMsg().content += pendingStreamText.slice(0, step)
      pendingStreamText = pendingStreamText.slice(step)
      scrollToBottom()
    }, 16)
  })
}

async function handleToggleInputMode() {
  if (inputMode.value === 'voice') {
    inputMode.value = 'text'
    return
  }

  try {
    const state = permissionState.value === 'granted' ? permissionState.value : await requestPermission()
    if (state !== 'granted') {
      showToast('麦克风授权失败')
      return
    }

    inputMode.value = 'voice'
  } catch (error) {
    showToast(error instanceof Error ? error.message : '麦克风授权失败')
  }
}

async function handleVoicePressStart() {
  if (streaming.value) {
    handleStop()
    return
  }

  if (streaming.value || isBusy.value || isRecording.value) return

  try {
    errorMsg.value = ''
    await startRecording()
  } catch (error) {
    showToast(error instanceof Error ? error.message : '无法开始录音')
  }
}

async function handleVoicePressEnd() {
  if (!isRecording.value) return

  try {
    const audio = await stopRecording()
    if (!audio) return

    const wavFile = await encodeToWavFile(audio.blob)
    const response = await recognize(wavFile)
    const text = response?.Result?.trim()

    if (!text) {
      showToast('未识别到语音内容')
      return
    }

    await handleSend(text)
  } catch (error) {
    showToast(error instanceof Error ? error.message : '语音识别失败')
  }
}

function handleVoicePressCancel() {
  handleVoicePressEnd()
}

onBeforeUnmount(() => {
  cleanup()
  stopSmoothStreamDisplay()
})
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
  padding: 60px 16px 88px;
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
  min-height: 60px;
  padding: 9px 12px;
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
  height: 42px;
  padding: 0 12px;
}

.input-field :deep(.van-field__body) {
  height: 42px;
}

.input-field :deep(.van-field__control) {
  line-height: 42px;
}

.mode-btn {
  flex-shrink: 0;
  height: 42px;
  width: 42px;
  padding: 0;
}

.voice-record-wrap {
  flex: 1;
  height: 42px;
}

.voice-record-btn {
  height: 42px;
  border-radius: 999px;
  pointer-events: none;
}

.send-btn,
.stop-btn {
  flex-shrink: 0;
  height: 42px;
  min-width: 64px;
}
</style>
