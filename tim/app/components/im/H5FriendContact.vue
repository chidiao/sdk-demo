<template>
  <div class="h5-friend-contact">
    <div v-if="!sortedFriendGroups.length" class="h5-friend-contact-empty">暂无好友</div>

    <div v-for="[groupKey, groupData] in sortedFriendGroups" :key="groupKey">
      <div class="h5-friend-contact-group-title">{{ groupKey }} ({{ groupData.length }})</div>
      <div
        v-for="friend in groupData"
        :key="friend.renderKey"
        class="h5-friend-contact-item"
        @click="handleSelectFriend(friend)"
      >
        <ContactListItem :item="deepCopy(friend)" :display-online-status="displayOnlineStatus" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { StoreName, TUIConversationService, TUIStore } from '@tencentcloud/chat-uikit-engine-lite'
import type { Friend } from '@tencentcloud/chat-uikit-engine-lite'
import { provide } from '@/TUIKit/adapter-vue'
import type { IContactInfoType, IUserStatus, IUserStatusMap } from '@/TUIKit/interface'
import { deepCopy } from '@/TUIKit/components/TUIChat/utils/utils'
import { sortByFirstChar } from '@/TUIKit/components/TUIContact/utils/sortByFirstChar'
import ContactListItem from '@/TUIKit/components/TUIContact/contact-list/contact-list-item/index.vue'

type FriendWithRenderKey = Friend & { renderKey: string }

const friendList = ref<FriendWithRenderKey[]>([])
const displayOnlineStatus = ref(false)
const userOnlineStatusMap = ref<IUserStatusMap>()
const router = useRouter()

const sortedFriendGroups = computed(() => {
  const { groupedList } = sortByFirstChar(friendList.value, (friend: Friend) => {
    return friend.remark || friend.profile?.nick || friend.userID || ''
  })
  return Object.entries(groupedList)
})

onMounted(() => {
  TUIStore.watch(StoreName.FRIEND, {
    friendList: handleFriendListUpdated
  })
  TUIStore.watch(StoreName.USER, {
    displayOnlineStatus: handleDisplayOnlineStatusUpdated,
    userStatusList: handleUserStatusListUpdated
  })

  TUIStore.update(StoreName.CUSTOM, 'currentContactListKey', 'friendList')
  TUIStore.update(StoreName.CUSTOM, 'currentContactInfo', {})
})

onUnmounted(() => {
  TUIStore.unwatch(StoreName.FRIEND, {
    friendList: handleFriendListUpdated
  })
  TUIStore.unwatch(StoreName.USER, {
    displayOnlineStatus: handleDisplayOnlineStatusUpdated,
    userStatusList: handleUserStatusListUpdated
  })
})

function handleFriendListUpdated(list: Friend[]) {
  friendList.value = list.map((friend, index) => ({
    ...friend,
    renderKey: `friendList-${friend.userID || index}`
  }))
}

function handleDisplayOnlineStatusUpdated(status: boolean) {
  displayOnlineStatus.value = status
}

function handleUserStatusListUpdated(list: Map<string, IUserStatus>) {
  if (list?.size > 0) {
    userOnlineStatusMap.value = Object.fromEntries(list.entries())
  }
}

async function handleSelectFriend(friend: IContactInfoType) {
  if (!friend?.userID) {
    return
  }

  const conversationID = `C2C${friend.userID}`

  TUIStore.update(StoreName.CUSTOM, 'currentContactInfo', friend)
  await TUIConversationService.switchConversation(conversationID)
  router.push(`/im/chat/${conversationID}`)
}

provide('userOnlineStatusMap', userOnlineStatusMap)
</script>

<style scoped>
.h5-friend-contact {
  height: calc(100vh - 46px - 50px);
  overflow-y: auto;
  background: #fff;
  overscroll-behavior: contain;
}

.h5-friend-contact-empty {
  padding: 32px 16px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

.h5-friend-contact-group-title {
  height: 24px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  background: #f7f8fa;
  color: #666;
  font-size: 13px;
}

.h5-friend-contact-item {
  min-height: 54px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid #f4f5f9;
}

.h5-friend-contact-item:active {
  background: #eef0f3;
}
</style>
