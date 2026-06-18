<template>
  <div class="w-full min-h-screen bg-white p-4">
    <div class="mx-auto flex w-full max-w-xl flex-col gap-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold text-gray-900">ASR 调试</h1>
        <van-tag :type="permissionState === 'granted' ? 'success' : 'primary'">
          {{ permissionText }}
        </van-tag>
      </div>

      <van-button v-if="permissionState !== 'granted'" type="primary" block @click="handleRequestPermission">
        授权麦克风
      </van-button>

      <AudioRecorder
        v-else
        idle-text="按住说话"
        recording-text="松开结束"
        :recording="isRecording"
        :disabled="isBusy"
        @press-start="handlePressStart"
        @press-end="handlePressEnd"
        @press-cancel="handlePressCancel"
      />

      <div class="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
        <div class="font-medium text-gray-900">调试信息</div>
        <div class="mt-2 space-y-1">
          <div>状态：{{ statusText }}</div>
          <div>时长：{{ duration }} 秒</div>
          <div v-if="lastFileName">文件：{{ lastFileName }}</div>
          <div v-if="lastFileSize">大小：{{ lastFileSize }}</div>
          <div v-if="asrText">识别结果：{{ asrText }}</div>
          <div v-if="lastError" class="text-red-500">错误：{{ lastError }}</div>
        </div>
      </div>

      <div v-if="wavUrl" class="rounded-lg border border-gray-100 bg-white p-4">
        <audio :src="wavUrl" controls class="w-full" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const { permissionState, refreshPermission, requestPermission } = useMicrophonePermission()
const { isRecording, duration, startRecording, stopRecording, cleanup } = usePressRecorder()
const { isEncoding, encodeToWavFile } = useWavEncoder()
const { isRecognizing, recognize } = useAsrRecognition()

const lastFileName = ref('')
const lastFileSize = ref('')
const lastError = ref('')
const wavUrl = ref('')
const statusText = ref('待录音')
const asrText = ref('')

const isBusy = computed(() => isEncoding.value || isRecognizing.value)
const permissionText = computed(() => {
  const map = {
    granted: '已授权',
    denied: '已拒绝',
    prompt: '未授权',
    unsupported: '不支持'
  }
  return map[permissionState.value]
})

onMounted(() => {
  refreshPermission()
})

async function handleRequestPermission() {
  try {
    await requestPermission()
    statusText.value = '已授权，请按住录音'
    lastError.value = ''
  } catch (error) {
    statusText.value = '授权失败'
    lastError.value = error instanceof Error ? error.message : '无法访问麦克风'
  }
}

async function handlePressStart() {
  if (isBusy.value || isRecording.value) return

  try {
    resetResult()
    statusText.value = '开始录音'
    await startRecording()
  } catch (error) {
    statusText.value = '录音失败'
    lastError.value = error instanceof Error ? error.message : '无法访问麦克风'
  }
}

async function handlePressEnd() {
  if (!isRecording.value) return

  try {
    statusText.value = '正在转换'
    const audio = await stopRecording()
    if (!audio) return

    const wavFile = await encodeToWavFile(audio.blob)
    const url = URL.createObjectURL(wavFile)
    setWavPreview(wavFile, url)

    statusText.value = '正在请求 ASR 接口'
    const response = await recognize(wavFile)
    asrText.value = response?.Result || ''
    statusText.value = '识别完成'
  } catch (error) {
    statusText.value = isRecognizing.value ? '识别失败' : '处理失败'
    lastError.value = error instanceof Error ? error.message : '录音处理失败'
  }
}

function handlePressCancel() {
  handlePressEnd()
}

function resetResult() {
  lastError.value = ''
  asrText.value = ''
}

function setWavPreview(file: File, url: string) {
  if (wavUrl.value) {
    URL.revokeObjectURL(wavUrl.value)
  }

  wavUrl.value = url
  lastFileName.value = file.name
  lastFileSize.value = `${(file.size / 1024).toFixed(1)} KB`
}

onBeforeUnmount(() => {
  cleanup()
  if (wavUrl.value) {
    URL.revokeObjectURL(wavUrl.value)
  }
})
</script>
