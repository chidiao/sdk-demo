export interface RecordedAudio {
  blob: Blob
  duration: number
  mimeType: string
}

export function usePressRecorder() {
  const isRecording = ref(false)
  const duration = ref(0)

  let mediaRecorder: MediaRecorder | null = null
  let mediaStream: MediaStream | null = null
  let audioChunks: BlobPart[] = []
  let recordStartedAt = 0
  let durationTimer: ReturnType<typeof window.setInterval> | null = null
  let stopResolve: ((audio: RecordedAudio) => void) | null = null
  let stopReject: ((error: Error) => void) | null = null

  async function startRecording() {
    if (!import.meta.client) return
    if (isRecording.value) return

    audioChunks = []
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(mediaStream)

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      const mimeType = mediaRecorder?.mimeType || 'audio/webm'
      const blob = new Blob(audioChunks, { type: mimeType })
      cleanupStream()

      if (!blob.size) {
        stopReject?.(new Error('未录制到音频'))
        clearStopHandlers()
        return
      }

      stopResolve?.({ blob, duration: duration.value, mimeType })
      clearStopHandlers()
    }

    mediaRecorder.onerror = () => {
      const error = mediaRecorder?.error || new Error('录音失败')
      cleanupStream()
      stopReject?.(error)
      clearStopHandlers()
    }

    mediaRecorder.start()
    recordStartedAt = Date.now()
    duration.value = 0
    isRecording.value = true
    durationTimer = window.setInterval(() => {
      duration.value = Math.floor((Date.now() - recordStartedAt) / 1000)
    }, 250)
  }

  function stopRecording() {
    if (!isRecording.value || !mediaRecorder) {
      return Promise.resolve<RecordedAudio | null>(null)
    }

    isRecording.value = false
    duration.value = Math.max(1, Math.round((Date.now() - recordStartedAt) / 1000))
    clearDurationTimer()

    const stopPromise = new Promise<RecordedAudio>((resolve, reject) => {
      stopResolve = resolve
      stopReject = reject
    })

    if (mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
    }

    return stopPromise
  }

  function cleanup() {
    if (mediaRecorder?.state === 'recording') {
      mediaRecorder.stop()
    }
    cleanupStream()
    clearStopHandlers()
  }

  function cleanupStream() {
    mediaStream?.getTracks().forEach((track) => track.stop())
    mediaStream = null
    mediaRecorder = null
    clearDurationTimer()
  }

  function clearDurationTimer() {
    if (durationTimer) {
      window.clearInterval(durationTimer)
      durationTimer = null
    }
  }

  function clearStopHandlers() {
    stopResolve = null
    stopReject = null
  }

  onBeforeUnmount(cleanup)

  return {
    isRecording,
    duration,
    startRecording,
    stopRecording,
    cleanup
  }
}
