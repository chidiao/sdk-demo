interface IUserSigRequest {
  sdkAppID: number
  userId: string
  userSig: string
}

export const useImApi = () => {
  const { $api } = useNuxtApp()

  function getUserSig(userID: string) {
    return $api<{ success: boolean; data: IUserSigRequest }>('/api/usersig', {
      method: 'POST',
      body: { userId: userID }
    })
  }

  return {
    getUserSig
  }
}
