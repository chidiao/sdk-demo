import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const defaultConfig = {
  tencentIM: {
    sdkAppID: 1400000000,
    key: 'your-secret-key-here',
    expireTime: 86400 * 180
  },
  zhipu: {
    apiKey: 'your-zhipu-api-key',
    apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
  },
  tencentAsr: {
    SecretId: 'your-tencent-asr-secret-id',
    SecretKey: 'your-tencent-asr-secret-key',
    endpoint: 'https://asr.tencentcloudapi.com',
    host: 'asr.tencentcloudapi.com',
    region: 'ap-shanghai',
    version: '2019-06-14'
  },
  server: {
    port: 8080
  }
}

function deepMerge(target, source) {
  const result = { ...target }
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key])
    } else {
      result[key] = source[key]
    }
  }
  return result
}

const localConfigPath = path.join(__dirname, 'config.local.js')
let localConfig = {}

if (fs.existsSync(localConfigPath)) {
  try {
    const localConfigModule = await import('./config.local.js')
    localConfig = localConfigModule.default || {}
    console.log('Local config file loaded: config.local.js')
  } catch (error) {
    console.warn('Failed to load local config:', error.message)
  }
}

export default deepMerge(defaultConfig, localConfig)
