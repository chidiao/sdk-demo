export interface SentenceAsrRequest {
  data: string
  dataLen: number
  voiceFormat?: string
  engSerViceType?: string
}

export interface SentenceAsrResponse {
  success: boolean
  data?: {
    RequestId: string
    Result: string
    AudioDuration?: number
    WordSize?: number
    WordList?: Array<{
      Word: string
      StartTime: number
      EndTime: number
    }>
  }
  message?: string
  error?: string
}

export const useAsrApi = () => {
  const { $api } = useNuxtApp()

  function sentenceRecognition(payload: SentenceAsrRequest) {
    return $api<SentenceAsrResponse>('/api/asr/sentence', {
      method: 'POST',
      body: payload
    })
  }

  return {
    sentenceRecognition
  }
}
