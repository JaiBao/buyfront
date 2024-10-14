import { useUserStore } from '/stores/user'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const userStore = useUserStore()
  const { $apiAuth } = useNuxtApp()

  // 確保這段程式只在客戶端（瀏覽器）執行
  if (process.client) {
    const piniaToken = userStore.token

    // 如果有 Pinia 中的 token，進行驗證
    if (piniaToken) {
      try {
        // 調用後端 API 驗證 token
        const { data } = await $apiAuth.post('/users/check-token', { token: piniaToken })

        // 如果 token 無效，登出用戶
        if (!data.success) {
          userStore.logout()
        }
      } catch (error) {
        //console.log('Error validating token:', error)
        userStore.logout()
      }
    } else if (!piniaToken && userStore.isLogin) {
      // 如果 Pinia 沒有 token 但顯示已登入，則登出
      userStore.logout()
    }
  }
})
