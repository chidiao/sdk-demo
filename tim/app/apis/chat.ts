export interface ChatResponse {
  success: boolean
  data?: {
    choices: Array<{
      message: {
        content: string
      }
    }>
  }
}

export const useChatApi = () => {
  const { $api } = useNuxtApp()

  function sendChatMessage(message: string) {
    return $api<ChatResponse>('/api/chat', {
      method: 'POST',
      body: { message }
    })
  }

  function sendChatStream(message: string, stream: boolean, signal?: AbortSignal) {
    return $api('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { message, stream },
      signal,
      responseType: 'stream'
    })
  }

  return {
    sendChatMessage,
    sendChatStream
  }
}
