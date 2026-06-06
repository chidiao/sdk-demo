<template>
  <div class="w-full bg-white">
    <TUIKit :SDKAppID :userID :userSig v-if="userSig" />
  </div>
</template>

<script lang="ts" setup>
import { TUIKit } from '@/TUIKit'

const SDKAppID = ref()
const userID = ref('')
const userSig = ref('')

async function getUserSig() {
  const { data } = await $fetch<{ success: boolean; data: any }>('/api/usersig', {
    method: 'POST',
    body: {
      userId: 'sunyz'
    }
  })

  SDKAppID.value = data.sdkAppID
  userID.value = data.userId
  userSig.value = data.userSig
}

onMounted(() => {
  getUserSig()
})
</script>
