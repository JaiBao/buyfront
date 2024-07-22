//initAuth.js
import { useUserStore } from '/stores/user'

export default defineNuxtPlugin(nuxtApp => {
  const userStore = useUserStore(nuxtApp.$pinia)
  if (userStore.token) {
    userStore.getUser().catch(() => {
      userStore.logout()
    })
  }
})
