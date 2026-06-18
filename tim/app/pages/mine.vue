<template>
  <div class="w-full min-h-full bg-white">
    <van-nav-bar title="我的" placeholder fixed />
    <div class="flex flex-col items-center justify-center gap-4 p-4 mt-8">
      <van-image round width="80" height="80" :src="DEFAULT_IM_USER_AVATAR" />

      <div class="text-lg font-bold">{{ imStore.userID }}</div>

      <van-cell-group class="w-full">
        <van-cell title="用户ID" :value="imStore.userID" />
        <van-cell title="SDKAppID" :value="String(imStore.SDKAppID)" />
      </van-cell-group>

      <van-button type="danger" block @click="handleLogout">退出登录</van-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: 'tabbar'
})

const imStore = useImStore()
const router = useRouter()

async function handleLogout() {
  await imStore.logout()
  router.push('/')
}
</script>
