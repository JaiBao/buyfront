import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api, apiAuth } from '/plugins/axios'
import Swal from 'sweetalert2'

export const useUserStore = defineStore(
  'user',
  () => {
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
        const { data } = await api.post('/users/login', form)
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
        router.push('/')
      } catch (error) {
        Swal.fire({ icon: 'error', title: '失敗', text: error?.response?.data?.message || '發生錯誤' })
      }
    }

    const logout = async () => {
      try {
        //console.log(`Logging out with token: ${token.value}`)
        await apiAuth.delete('/users/logout')
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
      } catch (error) {
        Swal.fire({ icon: 'error', title: '失敗', text: error?.response?.data?.message || '發生錯誤' })
      }
    }

    const getUser = async () => {
      if (token.value.length === 0) return
      try {
        const { data } = await apiAuth.get('/users/me')
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

    const editCart = async ({ id, quantity }) => {
      if (token.value.length === 0) {
        Swal.fire({ icon: 'error', title: '失敗', text: '請先登入' })
        router.push('/login')
        return
      }
      try {
        const { data } = await apiAuth.post('/users/cart', { p_id: id, quantity: parseInt(quantity) })
        cart.value = data.result
        const action = quantity > 0 ? '加入購物車成功' : '成功移除商品'
        Swal.fire({ icon: 'success', title: '成功', text: action })
      } catch (error) {
        Swal.fire({ icon: 'error', title: '失敗', text: error?.response?.data?.message || '發生錯誤' })
      }
    }

    const checkout = async orderData => {
      try {
        await apiAuth.post('/orders', orderData)
        cart.value = 0
        Swal.fire({ icon: 'success', title: '成功', text: '結帳成功' })
      } catch (error) {
        Swal.fire({ icon: 'error', title: '失敗', text: error?.response?.data?.message || '發生錯誤' })
      }
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
      checkout
    }
  },
  {
    persist: {
      key: '20230103',
      paths: ['token', 'role', 'uid']
    }
  }
)
