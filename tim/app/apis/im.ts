interface IUserSigRequest {
  sdkAppID: number
  userId: string
  userSig: string
}

function getUserSig(userID: string) {
  return $fetch<{ success: boolean; data: IUserSigRequest }>('/api/usersig', {
    method: 'POST',
    body: { userId: userID }
  })
}

export const useImApi = () => {
  return {
    getUserSig
  }
}
