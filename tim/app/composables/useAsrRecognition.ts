import type { SentenceAsrResponse } from '~/apis/asr'

export function useAsrRecognition() {
  const asrApi = useAsrApi()
  const isRecognizing = ref(false)
  const result = ref<SentenceAsrResponse['data']>()
  const error = ref('')

  async function recognize(file: File) {
    isRecognizing.value = true
    error.value = ''

    try {
      const data = await fileToBase64(file)
      const response = await asrApi.sentenceRecognition({
        data,
        dataLen: file.size,
        voiceFormat: 'wav',
        engSerViceType: '16k_zh'
      })

      if (!response.success) {
        throw new Error(response.message || response.error || 'ASR 请求失败')
      }

      result.value = response.data
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'ASR 请求失败'
      throw err
    } finally {
      isRecognizing.value = false
    }
  }

  return {
    isRecognizing,
    result,
    error,
    recognize
  }
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        reject(new Error('无法读取音频文件'))
        return
      }
      resolve(result.split(',')[1] || '')
    }
    reader.onerror = () => reject(reader.error || new Error('无法读取音频文件'))
    reader.readAsDataURL(file)
  })
}
