<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
<script setup>
import { useUserStore } from '/stores/user'

// 引入 Pinia 的 useUserStore
const userStore = useUserStore()
// 監聽 localStorage 的變化
if (process.client) {
  onMounted(() => {
    window.addEventListener('storage', event => {
      //console.log('Storage event triggered:', event) // 確認事件被正確觸發
      if (event.key === 'token' && !event.newValue) {
        //console.log('Detected token removal, logging out...')
        userStore.logout()
      }
    })
  })
}

// import '/plugins/websocket.client.js'
// if (process.client) {
//   window.addEventListener('beforeunload', () => {
//     useAgreeCollectionStore().clearAgreement()
//   })
// }
// useHead({
//   title,
//   titleTemplate: '%s - 首頁'
// })
</script>
