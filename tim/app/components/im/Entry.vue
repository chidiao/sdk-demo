<template>
  <div class="w-full flex flex-col items-center justify-center gap-4 p-4">
    <h1 class="text-xl font-bold mb-4">登录IM</h1>
    <van-button
      v-for="user in presetUsers"
      :key="user.userId"
      type="primary"
      block
      :loading="loading === user.userId"
      @click="handleLogin(user)"
    >
      {{ user.label }}（{{ user.userId }}）
    </van-button>
  </div>
</template>

<script lang="ts" setup>
const imApi = useImApi()

const presetUsers = [
  { label: '孙颖洲', userId: 'sunyz' },
  { label: '吃掉再说', userId: 'chidiao' },
  { label: '面试官', userId: 'hr' }
]

const imStore = useImStore()
const router = useRouter()
const loading = ref<string | null>(null)

async function handleLogin(user: { userId: string }) {
  loading.value = user.userId
  try {
    // 如果当前已有登录用户且与目标用户不同，先退出
    if (imStore.userID && imStore.userID !== user.userId) {
      await imStore.logout()
    }
    const { data } = await imApi.getUserSig(user.userId)
    imStore.setLoginInfo(data)
    await router.push('/home')
    // await router.push('/im')
  } finally {
    loading.value = null
  }
}
</script>
