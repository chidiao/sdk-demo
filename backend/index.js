import express from 'express'
import config from './config.js'
import { asrRouter, chatRouter, imRouter } from './routes/index.js'

const app = express()
const PORT = config.server.port

app.use(express.json({ limit: '5mb' }))

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

app.use('/api', imRouter)
app.use('/api', chatRouter)
app.use('/api', asrRouter)

app.use((err, req, res, next) => {
  console.error('Global error:', err)
  const statusCode = err.statusCode || 500
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  })
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
