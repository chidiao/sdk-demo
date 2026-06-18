<template>
  <div class="w-full min-h-full bg-white flex flex-col items-center justify-center gap-4 p-4">
    <ImEntry />

    <div class="w-full flex flex-col items-center justify-center gap-4 p-4">
      <h1 class="text-xl font-bold my-4">流式消息</h1>
      <van-button type="default" block icon="chat-o" @click="handleGoChat"> AI 对话 </van-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: 'tabbar'
})

const router = useRouter()

function handleGoChat() {
  router.push('/chat')
}
</script>
