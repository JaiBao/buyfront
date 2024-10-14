// stores/user.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import Swal from 'sweetalert2'

export const useUserStore = defineStore(
  'user',
  () => {
    const { $api, $apiAuth } = useNuxtApp()
    const token = ref('')
    const account = ref('')
    const email = ref('')
    const cart = ref(0)
    const role = ref(0)
    const name = ref('')
    const address = ref('')
    const companyName = ref('')
    const taxId = ref('')
    const phoneNumber = ref('')
    const uid = ref('')

    const router = useRouter()

    const isLogin = computed(() => token.value.length > 0)
    const isAdmin = computed(() => role.value === 1)
    const isSuperAdmin = computed(() => role.value === 2)
    const avatar = computed(() => `https://source.boringavatars.com/beam/256/${account.value}?colors=ffabab,ffdaab,ddffab,abe4ff,d9abff`)

    const login = async form => {
      try {
        closeLoginDialog()
        const { data } = await $api.post('/users/login', form)
        token.value = data.result.token
        account.value = data.result.account
        email.value = data.result.email
        cart.value = data.result.cart
        role.value = data.result.role
        name.value = data.result.name
        address.value = data.result.address
        companyName.value = data.result.companyName
        taxId.value = data.result.taxId
        phoneNumber.value = data.result.phoneNumber
        uid.value = data.result.uid
        Swal.fire({ icon: 'success', title: '成功', text: '登入成功' })

        // 立即獲取使用者資訊並更新購物車數量
        await getUser()
        // router.push('/')
      } catch (error) {
        Swal.fire({ icon: 'error', title: '失敗', text: error?.response?.data?.message || '發生錯誤' })
      }
    }

    const logout = async () => {
      try {
        //console.log(`Logging out with token: ${token.value}`)
        await $apiAuth.delete('/users/logout')
        token.value = ''
        account.value = ''
        role.value = 0
        cart.value = 0
        name.value = ''
        address.value = ''
        companyName.value = ''
        taxId.value = ''
        phoneNumber.value = ''
        uid.value = ''

        router.push('/')
        Swal.fire({ icon: 'success', title: '成功', text: '登出成功' })
        location.reload()
      } catch (error) {
        Swal.fire({ icon: 'error', title: '失敗', text: error?.response?.data?.message || '發生錯誤' })
      }
    }

    const getUser = async () => {
      if (token.value.length === 0) return
      try {
        const { data } = await $apiAuth.get('/users/me')
        account.value = data.result.account
        email.value = data.result.email
        cart.value = data.result.cart
        role.value = data.result.role
        name.value = data.result.name
        address.value = data.result.address
        companyName.value = data.result.companyName
        taxId.value = data.result.taxId
        phoneNumber.value = data.result.phoneNumber
        uid.value = data.result.uid
      } catch (error) {
        logout()
      }
    }

    // const editCart = async ({ id, quantity, uid, action }) => {
    //   if (token.value.length === 0) {
    //     // Swal.fire({ icon: 'error', title: '失敗', text: '請先登入' })
    //     // router.push('/login')
    //     showLoginDialog()
    //     return
    //   }

    //   try {
    //     if (action === 'add' || action === 'set') {
    //       // 檢查當前購物車
    //       const { data: cartData } = await $apiAuth.get('/users/cart')
    //       const currentCart = cartData.result

    //       if (currentCart.length > 0 && currentCart[0].uid !== uid) {
    //         // 如果購物車中已有不同商家的商品
    //         const result = await Swal.fire({
    //           title: '此為不同店家商品，是否覆蓋前一個店家的訂單？',
    //           icon: 'warning',
    //           showCancelButton: true,
    //           confirmButtonText: '確認',
    //           cancelButtonText: '取消'
    //         })

    //         if (result.isConfirmed) {
    //           await $apiAuth.delete('/users/cart') // 清空購物車
    //           const { data } = await $apiAuth.post('/users/cart', { p_id: id, quantity: parseInt(quantity), uid })
    //           cart.value = data.result
    //           Swal.fire({ icon: 'success', title: '成功', text: '購物車已更新' })
    //         } else {
    //           // 取消操作
    //           Swal.fire({ icon: 'info', title: '取消', text: '商品未加入購物車' })
    //         }
    //       } else {
    //         // 購物車為空或同商家商品
    //         const { data } = await $apiAuth.post('/users/cart', { p_id: id, quantity: parseInt(quantity), uid, action })
    //         cart.value = data.result

    //         // 在按加號或減號的時候不顯示通知
    //         if (action !== 'add' || (quantity !== 1 && quantity !== -1)) {
    //           // 根據 quantity 的正負顯示不同的提示訊息
    //           const actionText = action === 'add' ? (quantity > 0 ? '加入購物車成功' : '成功減少商品數量') : '商品數量已更新'
    //           Swal.fire({ icon: 'success', title: '成功', text: actionText })
    //         }
    //       }
    //     } else if (action === 'remove') {
    //       // 刪除商品
    //       const { data } = await $apiAuth.post('/users/cart', { p_id: id, quantity: parseInt(quantity), uid })
    //       cart.value = data.result
    //     }
    //   } catch (error) {
    //     Swal.fire({ icon: 'error', title: '失敗', text: error?.response?.data?.message || '發生錯誤' })
    //   }
    // }

    const editCart = async ({ p_id, items_id, quantity, action, uid, selectedOptions }) => {
      if (token.value.length === 0) {
        showLoginDialog()
        return
      }

      try {
        // 構建請求 payload
        const payload = { p_id, items_id, action, uid }

        if (action !== 'remove') {
          payload.quantity = parseInt(quantity)
        }

        // 只有在新增（new 或 add）商品時傳送選項
        if ((action === 'new' || action === 'add') && selectedOptions && selectedOptions.length > 0) {
          payload.options = selectedOptions
        }

        // 發送 API 請求
        const { data } = await $apiAuth.post('/users/cart', payload)
        cart.value = data.result

        // 根據不同的 action 顯示提示訊息
        if (action === 'new') {
          Swal.fire({ icon: 'success', title: '成功', text: '已加入購物車' })
        } else if (action !== 'add' || (quantity !== 1 && quantity !== -1)) {
          const actionText = action === 'add' ? (quantity > 0 ? '加入購物車成功' : '成功減少商品數量') : '商品數量已更新'
          Swal.fire({ icon: 'success', title: '成功', text: actionText })
        }
      } catch (error) {
        Swal.fire({ icon: 'error', title: '失敗', text: error?.response?.data?.message || '發生錯誤' })
      }
    }

    const checkout = async orderData => {
      try {
        await $apiAuth.post('/orders', orderData)
        cart.value = 0
        Swal.fire({ icon: 'success', title: '成功', text: '結帳成功' })
      } catch (error) {
        Swal.fire({ icon: 'error', title: '失敗', text: error?.response?.data?.message || '發生錯誤' })
      }
    }

    const loginDialog = ref(false) // 新增這一行

    const showLoginDialog = () => {
      loginDialog.value = true
    }
    const closeLoginDialog = () => {
      loginDialog.value = false
    }

    return {
      token,
      account,
      email,
      cart,
      role,
      name,
      address,
      companyName,
      taxId,
      phoneNumber,
      uid,
      login,
      logout,
      getUser,
      isLogin,
      isAdmin,
      isSuperAdmin,
      avatar,
      editCart,
      checkout,
      loginDialog, // 新增這一行
      showLoginDialog,
      closeLoginDialog
    }
  },
  {
    persist: {
      key: '20230103',
      paths: ['token', 'role', 'uid']
    }
  }
)
