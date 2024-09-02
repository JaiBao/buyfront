// import { useUserStore } from '/stores/user'
// import Swal from 'sweetalert2'
// import { storeToRefs } from 'pinia'
// import { useOrderStatusHistoryStore } from '/stores/orderStatusHistory'
// import io from 'socket.io-client'

// export default defineNuxtPlugin(nuxtApp => {
//   const userStore = useUserStore()
//   const { isSuperAdmin, isAdmin } = storeToRefs(userStore)
//   const orderStatusHistoryStore = useOrderStatusHistoryStore()

//   const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl
//   const protocol = apiBaseUrl.startsWith('https') ? 'wss' : 'ws'
//   const wsUrl = apiBaseUrl.replace(/^http/, protocol)
//   console.log('WebSocket URL:', wsUrl)

//   const socket = io(wsUrl)
//   const messageQueue = []

//   socket.on('connect', () => {
//     console.log('連線到伺服器')
//   })

//   if (isSuperAdmin.value) {
//     socket.on('orderStatusUpdate', message => {
//       console.log('Received order status update:', message)
//       messageQueue.push({
//         type: 'orderStatusUpdate',
//         time: message.time,
//         oid: message.oid,
//         updateMessage: message.updateMessage,
//         operatorName: message.operatorName
//       })
//       processQueue()
//     })
//   }

//   if (isAdmin.value || isSuperAdmin.value) {
//     socket.on('newOrder', message => {
//       console.log('Received new order message:', message)
//       messageQueue.push({
//         type: 'newOrder',
//         time: message.time,
//         oid: message.oid,
//         updateMessage: message.updateMessage,
//         operatorName: message.operatorName
//       })
//       processQueue()
//     })
//   }

//   socket.on('disconnect', reason => {
//     console.log('WebSocket disconnected:', reason)
//   })

//   socket.on('error', error => {
//     console.error('WebSocket error:', error)
//   })

//   const processQueue = () => {
//     if (messageQueue.length > 0) {
//       const currentMessage = messageQueue.shift()
//       Swal.fire({
//         icon: 'info',
//         title: currentMessage.type === 'newOrder' ? '新訂單通知' : '訂單狀態更新',
//         text: currentMessage.updateMessage,
//         timer: 5000,
//         backdrop: `rgba(0,0,123,0.4)
//         url("https://i.pinimg.com/originals/e1/f2/3d/e1f23dfb401e68caf9e0d81e469a2b46.gif")
//         left center
//         no-repeat
//         `
//       }).then(() => {
//         orderStatusHistoryStore.addHistoryRecord(currentMessage)
//         processQueue()
//       })
//     }
//   }
// })
