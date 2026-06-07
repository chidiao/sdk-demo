<template>
  <div class="w-full min-h-screen bg-white">
    <TUIKit
      :SDKAppID="imStore.SDKAppID"
      :userID="imStore.userID"
      :userSig="imStore.userSig"
      :conversationID="id"
      v-if="imStore.userSig"
    >
      <div>
        <TUIChat class="h-full" @closeChat="$router.back" />
      </div>
    </TUIKit>
  </div>
</template>

<script setup lang="ts">
import { TUIKit } from '@/TUIKit'
import { TUISearch, TUIConversation, TUIChat, TUIContact, TUIGroup } from '@/TUIKit/components'
const route = useRoute()
const id = route.params.id as string

const imStore = useImStore()
</script>

<style scoped>
:deep(.tui-chat-h5) {
  height: 100vh;
}

:deep(.message-input-editor-container-h5) {
  min-height: 40px;
}

:deep(.message-input-toolbar-h5-list) {
  height: 0;
}

:deep(.toolbar-item-container-h5) {
  top: -25px;
}
</style>
