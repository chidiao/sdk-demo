<template>
  <div class="w-full min-h-screen bg-white">
    <TUIKit :SDKAppID="imStore.SDKAppID" :userID="imStore.userID" :userSig="imStore.userSig" v-if="imStore.userSig">
      <div class="w-full h-full">
        <van-nav-bar title="消息" left-arrow @click-left="$router.back" placeholder fixed />

        <TUIConversation />
      </div>
    </TUIKit>
  </div>
</template>

<script lang="ts" setup>
import { TUIKit } from '@/TUIKit'
import { TUIConversation } from '@/TUIKit/components'
import { TUIStore, StoreName } from '@tencentcloud/chat-uikit-engine-lite'

const imStore = useImStore()

const router = useRouter()

onMounted(() => {
  TUIStore.watch(StoreName.CONV, {
    currentConversationID: (id: string) => {
      if (!id) {
        return
      }

      router.push(`/im/chat/${id}`)
      console.log(id)
    }
  })
})
</script>

<style scoped></style>
