//initAuth.js
import { useUserStore } from '/stores/user'

export default defineNuxtPlugin(nuxtApp => {
  const router = useRouter()
  const userStore = useUserStore(nuxtApp.$pinia)
  if (userStore.token) {
    userStore.getUser().catch(() => {
      userStore.logout()
    })
  }
})
