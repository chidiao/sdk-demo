<template>
  <div class="w-full bg-white">
    <TUIKit :SDKAppID="imStore.SDKAppID" :userID="imStore.userID" :userSig="imStore.userSig" v-if="imStore.userSig">
      <div class="w-full h-full">
        <van-nav-bar title="好友" placeholder fixed />

        <ImH5FriendContact />
      </div>
    </TUIKit>
  </div>
</template>

<script lang="ts" setup>
import { TUIKit } from '@/TUIKit'

definePageMeta({
  layout: 'tabbar'
})

const imStore = useImStore()
</script>

<style scoped></style>
