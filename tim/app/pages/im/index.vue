<template>
  <div class="w-full bg-white">
    <TUIKit :SDKAppID="imStore.SDKAppID" :userID="imStore.userID" :userSig="imStore.userSig" v-if="imStore.userSig" />
  </div>
</template>

<script lang="ts" setup>
import { TUIKit } from '@/TUIKit'

const imStore = useImStore()
</script>
