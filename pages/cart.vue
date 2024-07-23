<template>
  <q-page>
    <div id="cart">
      <div>
        <div cols="12">
          <h3 class="text-center">購物車</h3>
        </div>
        <q-separator />
        <div cols="12">
          <q-table :rows="cart" :columns="columns" row-key="id">
            <template v-slot:body-cell-image="props">
              <q-td :props="props">
                <q-img :src="props.row.details?.image || ''" width="50" height="50" />
              </q-td>
            </template>
            <template v-slot:body-cell-name="props">
              <q-td :props="props">
                {{ props.row.details?.name || '未知商品' }}
              </q-td>
            </template>
            <template v-slot:body-cell-price="props">
              <q-td :props="props">${{ props.row.details?.price || '未知價格' }}</q-td>
            </template>
            <template v-slot:body-cell-quantity="props">
              <q-td :props="props">
                <q-btn flat icon="remove" @click="updateCart(props.row.id, -1)" />
                {{ props.row.quantity }}
                <q-btn flat icon="add" @click="updateCart(props.row.id, 1)" />
              </q-td>
            </template>
            <template v-slot:body-cell-total="props">
              <q-td :props="props">${{ props.row.quantity * (props.row.details?.price || 0) }}</q-td>
            </template>
            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn color="red" icon="delete" @click="removeItem(props.row.id)" />
              </q-td>
            </template>
          </q-table>
        </div>
        <q-separator />
        <div class="text-center">
          <p>總金額 {{ totalPrice }}</p>
          <q-btn color="primary" :disable="!canCheckout" @click="openCheckoutDialog">結帳</q-btn>
        </div>
        <q-dialog v-model="checkoutDialog" persistent>
          <q-card>
            <q-card-section>
              <div class="text-h6">訂單資訊</div>
            </q-card-section>
            <q-form @submit.prevent="onCheckoutBtnClick">
              <q-card-section class="checkout-form">
                <q-input v-model="user.name" label="訂購人" outlined readonly />
                <q-input v-model="phone" label="訂購人手機" type="tel" outlined readonly />
                <q-input v-model="landline" label="市話" type="tel" outlined />

                <q-input v-model="deliveryDate" label="送達日期" outlined mask="####-##-##">
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer q-mr-xs">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale" v-model="showDatePicker">
                        <q-date v-model="deliveryDate" mask="YYYY-MM-DD" @update:model-value="onDateSelected" color="accent"></q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>

                <q-select v-model="deliveryTime" :options="timeSlots" label="送達時段" outlined></q-select>
                <q-input v-model="user.companyName" label="公司名稱" outlined />
                <q-input v-model="user.taxId" label="統一編號" outlined />
                <q-input v-model="user.address" label="地址" outlined />
                <q-checkbox v-model="sameAsOrderer" label="同訂購人" />
                <q-input v-model="recipientName" label="收貨人" outlined />
                <q-input v-model="recipientPhone" label="收貨人電話" type="tel" outlined />
                <q-input v-model="comment" label="備註" outlined />
                <q-select v-model="paymentMethod" :options="paymentMethods" label="付款方式" outlined></q-select>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat label="取消" color="negative" @click="checkoutDialog = false" />
                <q-btn flat label="送出訂單" type="submit" color="primary" :loading="loading" />
              </q-card-actions>
            </q-form>
          </q-card>
        </q-dialog>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import Swal from 'sweetalert2'
import { apiAuth } from '/plugins/axios'
import { useUserStore } from '/stores/user'

const router = useRouter()
const user = useUserStore()
const { editCart, checkout } = user

const cart = reactive([])

const deliveryDate = ref('')
const deliveryTime = ref('')
const phone = ref(user.phoneNumber)
const landline = ref('')
const recipientName = ref('')
const recipientPhone = ref('')
const paymentMethod = ref('')
const sameAsOrderer = ref(false)
const checkoutDialog = ref(false)
const showDatePicker = ref(false)
const loading = ref(false)
const comment = ref('')

const columns = [
  { name: 'image', label: '圖片', field: 'image', align: 'center', sortable: false },
  { name: 'name', label: '名稱', field: 'name', align: 'left', sortable: true },
  { name: 'price', label: '單價', field: 'price', align: 'center', sortable: true },
  { name: 'quantity', label: '數量', field: 'quantity', align: 'center', sortable: true },
  { name: 'total', label: '小計', field: row => row.quantity * (row.details?.price || 0), align: 'center', sortable: true },
  { name: 'actions', label: '操作', align: 'center', sortable: false }
]

const paymentMethods = ref(['現金', '轉帳'])

const timeSlots = ref([])
for (let hour = 9; hour < 18; hour++) {
  timeSlots.value.push(`${hour}:00-${hour}:30`, `${hour}:30-${hour + 1}:00`)
}

const onDateSelected = date => {
  deliveryDate.value = date
  showDatePicker.value = false
}

watch(sameAsOrderer, newValue => {
  if (newValue) {
    recipientName.value = user.name
    recipientPhone.value = phone.value
  } else {
    recipientName.value = ''
    recipientPhone.value = ''
  }
})

const updateCart = async (id, quantity) => {
  const idx = cart.findIndex(item => item.id === id)
  await editCart({ id: cart[idx].product_name, quantity })
  cart[idx].quantity += quantity
  if (cart[idx].quantity <= 0) {
    cart.splice(idx, 1)
  }
}

const removeItem = async id => {
  const idx = cart.findIndex(item => item.id === id)
  await editCart({ id: cart[idx].product_name, quantity: -cart[idx].quantity })
  cart.splice(idx, 1)
}

const openCheckoutDialog = () => {
  checkoutDialog.value = true
}

const onCheckoutBtnClick = async () => {
  if (!deliveryDate.value) {
    checkoutDialog.value = false
    await Swal.fire({ icon: 'error', title: '失敗', text: '送達日期是必需的' })
    checkoutDialog.value = true
    return
  }

  if (!deliveryTime.value) {
    checkoutDialog.value = false
    await Swal.fire({ icon: 'error', title: '失敗', text: '送達時間是必需的' })
    checkoutDialog.value = true
    return
  }

  if (!paymentMethod.value) {
    checkoutDialog.value = false
    await Swal.fire({ icon: 'error', title: '失敗', text: '付款方式是必需的' })
    checkoutDialog.value = true
    return
  }

  const orderData = {
    deliveryDate: deliveryDate.value,
    deliveryTime: deliveryTime.value,
    paymentMethod: paymentMethod.value,
    phone: phone.value,
    landline: landline.value,
    companyName: user.companyName,
    taxId: user.taxId,
    address: user.address,
    recipientName: recipientName.value,
    recipientPhone: recipientPhone.value,
    uid: user.uid,
    comment: comment.value,
    address: user.address
  }

  try {
    await checkout(orderData)
    router.push('/orders')
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: error.response?.data?.message || '訂單提交失敗，請稍後再試'
    })
  }
}

const totalPrice = computed(() => {
  return cart.reduce((total, current) => {
    return total + (current.details?.price || 0) * current.quantity
  }, 0)
})

const canCheckout = computed(() => {
  return cart.length > 0 && !cart.some(product => product.details && product.details.sell === 0)
})

;(async () => {
  try {
    const { data } = await apiAuth.get('/users/cart')
    const cartItems = data.result
    for (const item of cartItems) {
      const { data: productData } = await apiAuth.get(`/products/${item.product_name}`)
      item.details = productData.result
    }
    cart.push(...cartItems)
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: '取得購物車失敗'
    })
  }
})()
</script>
