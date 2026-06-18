import express from 'express'
import tencentcloud from 'tencentcloud-sdk-nodejs'
import config from '../config.js'

const router = express.Router()
const MAX_AUDIO_BYTES = 3 * 1024 * 1024

const AsrClient = tencentcloud.asr.v20190614.Client

function createAsrClient() {
  const { SecretId, SecretKey, host, region } = config.tencentAsr
  return new AsrClient({
    credential: {
      secretId: SecretId,
      secretKey: SecretKey
    },
    region,
    profile: {
      httpProfile: {
        endpoint: host
      }
    }
  })
}

router.post('/asr/sentence', async (req, res) => {
  try {
    const {
      data,
      dataLen,
      engSerViceType = '16k_zh',
      voiceFormat = 'wav',
      filterDirty = 0,
      filterModal = 0,
      filterPunc = 0,
      convertNumMode = 1,
      wordInfo = 0
    } = req.body

    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'data is required'
      })
    }

    const audioByteLength = dataLen || Buffer.byteLength(data, 'base64')
    if (audioByteLength > MAX_AUDIO_BYTES) {
      return res.status(400).json({
        success: false,
        message: 'audio data must be less than 3MB'
      })
    }

    const result = await createAsrClient().SentenceRecognition({
      EngSerViceType: engSerViceType,
      SourceType: 1,
      VoiceFormat: voiceFormat,
      Data: data,
      DataLen: audioByteLength,
      FilterDirty: filterDirty,
      FilterModal: filterModal,
      FilterPunc: filterPunc,
      ConvertNumMode: convertNumMode,
      WordInfo: wordInfo
    })

    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Tencent ASR error:', error)
    res.status(500).json({
      success: false,
      message: 'Tencent ASR request failed',
      error: error.message
    })
  }
})

export default router
