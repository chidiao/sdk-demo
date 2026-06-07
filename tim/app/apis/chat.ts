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

function sendChatMessage(message: string) {
  return $fetch<ChatResponse>('/api/chat', {
    method: 'POST',
    body: { message }
  })
}

function sendChatStream(message: string, stream: boolean, signal?: AbortSignal) {
  return $fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { message, stream },
    signal,
    responseType: 'stream'
  })
}

export const useChatApi = () => {
  return {
    sendChatMessage,
    sendChatStream
  }
}
