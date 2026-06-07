import { TUILogin } from '@tencentcloud/tui-core-lite'

export const useImStore = defineStore('im', () => {
  const SDKAppID = ref<number>()
  const userID = ref('')
  const userSig = ref('')

  function setLoginInfo(info: { sdkAppID: number; userId: string; userSig: string }) {
    SDKAppID.value = info.sdkAppID
    userID.value = info.userId
    userSig.value = info.userSig
  }

  async function logout() {
    await TUILogin.logout()
    SDKAppID.value = undefined
    userID.value = ''
    userSig.value = ''
  }

  return {
    SDKAppID,
    userID,
    userSig,
    setLoginInfo,
    logout
  }
})
