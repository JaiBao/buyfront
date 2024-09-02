import { defineStore } from 'pinia'
import Swal from 'sweetalert2'

export const usePendingCountStore = defineStore('pendingCount', {
  state: () => ({
    pendingCount: 0
  }),
  actions: {
    async fetchPendingCount() {
      try {
        const { $apiAuth } = useNuxtApp()
        const response = await $apiAuth.get('/users/pending-merchants')
        this.pendingCount = response.data.result.length
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: '失敗',
          text: '無法獲取待審核帳號數量'
        })
      }
    }
  }
})
