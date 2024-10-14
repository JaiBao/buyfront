// plugins/localStorageListener.js
import { useUserStore } from '@/stores/user'

export default defineNuxtPlugin(nuxtApp => {
  const userStore = useUserStore(nuxtApp.$pinia)

  if (process.client) {
    window.addEventListener('storage', event => {
      if (event.key === 'token' && !event.newValue) {
        //console.log('Detected token removal, logging out...')
        userStore.logout()
      }
    })
  }
})
