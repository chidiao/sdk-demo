<template>
  <div class="w-full min-h-screen bg-white">
    <div class="pb-[50px]">
      <slot />
    </div>

    <van-tabbar v-model="active" route placeholder fixed>
      <van-tabbar-item icon="home-o" to="/im/conversations">主页</van-tabbar-item>
      <van-tabbar-item icon="contact-o" to="/im/contact">好友</van-tabbar-item>
      <van-tabbar-item icon="chat-o" to="/chat">AI</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/mine">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
const active = ref(0)
</script>
