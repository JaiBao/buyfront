// stores/orderStatusHistory.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useOrderStatusHistoryStore = defineStore(
  'orderStatusHistory',
  () => {
    const statusHistory = ref([])
    const newOrderStatusCount = ref(0)

    const addHistoryRecord = record => {
      statusHistory.value.unshift(record)
      newOrderStatusCount.value++
    }

    const clearHistory = () => {
      statusHistory.value = []
    }

    const removeHistoryRecord = index => {
      statusHistory.value.splice(index, 1)
      newOrderStatusCount.value--
    }

    const clearNewOrderStatusCount = () => {
      newOrderStatusCount.value = 0 // 清除计数器值
    }

    // 每天 23:59 清除历史记录
    const setupClearHistoryAtMidnight = () => {
      const now = new Date()
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0)
      const timeToMidnight = midnight.getTime() - now.getTime()

      setTimeout(() => {
        clearHistory()
        setInterval(clearHistory, 24 * 60 * 60 * 1000) // 每 24 小清除
      }, timeToMidnight)
    }

    setupClearHistoryAtMidnight()

    return {
      statusHistory,
      newOrderStatusCount,
      addHistoryRecord,
      clearHistory,
      removeHistoryRecord,
      clearNewOrderStatusCount
    }
  },
  {
    persist: true // 持久化
  }
)
