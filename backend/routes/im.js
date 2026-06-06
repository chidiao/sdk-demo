import express from 'express'
import TLSSigAPIv2 from 'tls-sig-api-v2'
import config from '../config.js'

const router = express.Router()

function createTIMAPI() {
  return new TLSSigAPIv2.Api(config.tencentIM.sdkAppID, config.tencentIM.key)
}

function generateUserSig(userId, expireTime) {
  const timApi = createTIMAPI()
  const expire = expireTime || config.tencentIM.expireTime
  return timApi.genSig(userId, expire)
}

router.post('/usersig', (req, res) => {
  try {
    const { userId, expireTime } = req.body

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      })
    }

    const userSig = generateUserSig(userId, expireTime)

    res.json({
      success: true,
      data: {
        userId,
        userSig,
        expireTime: expireTime || config.tencentIM.expireTime,
        sdkAppID: config.tencentIM.sdkAppID
      }
    })
  } catch (error) {
    console.error('Failed to generate UserSig:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to generate UserSig',
      error: error.message
    })
  }
})

export default router
