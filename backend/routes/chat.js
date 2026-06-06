import express from 'express'
import config from '../config.js'

const router = express.Router()
const { apiKey, apiUrl } = config.zhipu
const DEFAULT_MODEL = 'glm-4-flash'

async function callLLM(message, stream = false) {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [{ role: 'user', content: message }],
      stream
    })
  })
  return response
}

async function handleStreamResponse(response, res) {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    res.write(decoder.decode(value))
  }
  res.end()
}

router.post('/chat', async (req, res) => {
  const { message, stream = false } = req.body

  if (!message) {
    return res.status(400).json({
      success: false,
      message: 'Message content is required'
    })
  }

  try {
    const response = await callLLM(message, stream)

    if (!response.ok) {
      const errorData = await response.json()
      return res.status(response.status).json({
        success: false,
        message: errorData.message || 'API call failed',
        data: errorData
      })
    }

    if (stream) {
      await handleStreamResponse(response, res)
    } else {
      const data = await response.json()
      res.json({
        success: true,
        data
      })
    }
  } catch (error) {
    console.error('API call error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    })
  }
})

export default router
