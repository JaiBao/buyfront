<template>
  <q-page>
    <div id="cart">
      <div>
        <div class="row items-center nomalTitle3 justify-start">
          <p class="text-center">購物車</p>
        </div>
        <p class="storeNames">
          店家名稱:
          <span>{{ storeInfo.companyName }}</span>
        </p>

        <!-- 手機版 grid 版本 -->
        <div v-if="isMobile" class="grid-container">
          <div class="gridCards">
            <q-card class="grid-item" v-for="item in cart" :key="item.id">
              <div>
                <img class="gridImg" :src="item.details?.image || ''" alt="商品圖片" />
                <div class="text-h6 q-px-md">
                  {{ item.details?.name || '未知商品' }}${{ item.details?.price || '未知價格' }}
                  <br />
                  <!-- 顯示選項和數量 -->
                  {{ item.options.map(option => option.option_value).join(' / ') }}
                </div>
              </div>
              <q-card-actions class="row justify-between">
                <div class="row items-center">
                  <q-btn flat color="yellow-7" icon="remove" @click="updateCart(item.id, -1)" />
                  <q-input
                    style="max-width: 70px"
                    v-model.number="item.quantity"
                    type="number"
                    class="quantity-input"
                    aria-label="數量"
                    item-aligned
                    borderless
                    @blur="updateCartInput(item.id, item.quantity)"></q-input>
                  <q-btn flat color="yellow-7" icon="add" @click="updateCart(item.id, 1)" />
                </div>
                <div>小計: ${{ item.quantity * (item.details?.price || 0) }}</div>
              </q-card-actions>
              <q-btn class="gridDelete" color="red" icon="delete" @click="removeItem(item.id)" />
            </q-card>
          </div>

          <div class="end">
            <p>訂單總金額 :</p>
            <span>${{ totalPrice }}</span>
            <p>店家聯絡電話 :</p>
            <span>{{ storeInfo.storePhone }}</span>

            <q-separator class="q-my-sm" />

            <q-btn class="q-my-sm" color="yellow-7" text-color="black" :disable="!canCheckout" @click="openCheckoutDialog">確認訂單，前往結賬</q-btn>

            <q-btn color="yellow-7" text-color="black" :to="`/store/${storeInfo.uid}`">返回店家，繼續購物</q-btn>
          </div>
        </div>

        <!-- 桌面版 table 版本 -->
        <div v-else class="tables">
          <q-table
            class="tableCart"
            :rows="cart"
            :columns="columns"
            row-key="id"
            :pagination="pagination"
            :rows-per-page-options="[5]"
            :rows-per-page="pagination.rowsPerPage">
            <template v-slot:body-cell-image="props">
              <q-td :props="props">
                <img :src="props.row.details?.image || ''" width="128" height="90" />
              </q-td>
            </template>
            <template v-slot:body-cell-name="props">
              <q-td :props="props">
                {{ props.row.details?.name || '未知商品' }}
                <br />
                <!-- 顯示選項和數量 -->
                {{ props.row.options.map(option => option.option_value).join(' / ') }}
                / {{ props.row.quantity }} 份
              </q-td>
            </template>
            <template v-slot:body-cell-price="props">
              <q-td :props="props">${{ props.row.details?.price || '未知價格' }}</q-td>
            </template>
            <template v-slot:body-cell-quantity="props">
              <q-td :props="props">
                <div class="row items-center w-100 justify-center">
                  <q-btn flat icon="remove" @click="updateCart(props.row.id, -1)" />

                  <q-input
                    style="max-width: 70px"
                    v-model.number="props.row.quantity"
                    type="number"
                    class="quantity-input"
                    item-aligned
                    borderless
                    @blur="updateCartInput(props.row.id, props.row.quantity)" />
                  <q-btn flat icon="add" @click="updateCart(props.row.id, 1)" />
                </div>
              </q-td>
            </template>
            <template v-slot:body-cell-total="props">
              <q-td :props="props">${{ props.row.quantity * (props.row.details?.price || 0) }}</q-td>
            </template>
            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn color="red" icon="delete" @click="removeItem(props.row.id)" />
                <!-- <q-btn color="primary" label="詳情" @click="openDialog(props.row)" /> -->
              </q-td>
            </template>

            <template v-slot:pagination="scope">
              <q-pagination
                v-model="scope.pagination.page"
                :max="scope.pagesNumber"
                :max-pages="6"
                direction-links
                boundary-links
                icon-first="skip_previous"
                icon-last="skip_next"
                icon-prev="fast_rewind"
                icon-next="fast_forward"
                color="grey-8"
                active-color="yellow-7" />
            </template>
          </q-table>

          <div class="end">
            <div class="text">
              <p>訂單總金額 :</p>
              <span>${{ totalPrice }}</span>
              <p>店家聯絡電話 :</p>
              <span>{{ storeInfo.storePhone }}</span>
            </div>
            <q-separator class="q-my-sm" />

            <q-btn class="q-my-sm" color="yellow-7" text-color="black" :disable="!canCheckout" @click="openCheckoutDialog">確認訂單，前往結賬</q-btn>

            <q-btn color="yellow-7" text-color="black" :to="`/store/${storeInfo.uid}`">返回店家，繼續購物</q-btn>
          </div>
        </div>

        <!-- 結帳彈出框 -->
        <q-dialog v-model="checkoutDialog">
          <q-card class="checkCard">
            <!-- 新增的關閉按鈕 -->
            <q-btn
              flat
              dense
              round
              icon="close"
              color="white"
              class="close-dialog-button"
              @click="checkoutDialog = false"
              :style="{ backgroundColor: 'rgba(0, 0, 0, 0.5)', borderColor: 'black' }" />
            <q-card-section style="padding-bottom: 0">
              <div class="row items-center nomalTitle3 justify-start">
                <p class="text-center">訂單資訊</p>
              </div>
            </q-card-section>
            <q-form @submit.prevent="onCheckoutBtnClick">
              <q-card-section class="checkout-form">
                <div class="twins">
                  <q-input class="twinsInput" v-model="user.name" label="訂購人" outlined readonly />
                  <q-input class="twinsInput" v-model="phone" label="訂購人手機" type="tel" outlined readonly />
                </div>

                <q-input class="oneInput" v-model="landline" label="市話" type="tel" outlined />
                <div class="three">
                  <q-select class="shortInput" v-model="paymentMethod" :options="paymentMethods" label="付款方式" outlined></q-select>
                  <q-input class="threeInput" v-model="deliveryDate" label="送達日期" outlined mask="####-##-##">
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer q-mr-xs">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale" v-model="showDatePicker">
                          <q-date
                            v-model="deliveryDate"
                            mask="YYYY-MM-DD"
                            subtitle="送達日期"
                            @update:model-value="onDateSelected"
                            color="accent"
                            :options="date => isSelectableDate(DateTime.fromJSDate(new Date(date)).toISODate())"></q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>

                  <q-select class="threeInput" v-model="deliveryTime" :options="timeSlots" label="送達時段" outlined></q-select>
                </div>
                <q-input class="oneInput" v-model="user.companyName" label="公司名稱" outlined />
                <q-input class="oneInput" v-model="user.taxId" label="統一編號" outlined />
                <q-input class="oneInput" v-model="user.address" label="送達地址" outlined />
                <q-checkbox v-model="sameAsOrderer" label="同訂購人" />
                <div class="twins">
                  <q-input class="twinsInput" v-model="recipientName" label="收貨人" outlined />
                  <q-input class="twinsInput" v-model="recipientPhone" label="收貨人電話" type="tel" outlined />
                </div>
                <q-input class="oneInput" v-model="comment" label="備註" outlined />
              </q-card-section>
              <q-card-actions class="checkBtns">
                <q-btn outlined label="送出訂單" type="submit" class="checkBtn" color="yellow-7" text-color="black" :loading="loading" />
              </q-card-actions>
            </q-form>
          </q-card>
        </q-dialog>

        <!-- dialog 彈出框 -->
        <q-dialog v-model="showDialog">
          <q-card>
            <q-card-section>
              <div class="row items-center justify-start">
                <p>{{ dialogData?.product?.name }}</p>
              </div>
              <!-- 顯示數量和選項 -->
              <p>
                {{ dialogData?.options.map(option => option.option_value).join(' / ') }}
                / {{ dialogData?.quantity }} 份
              </p>
            </q-card-section>
            <q-card-actions>
              <q-btn flat @click="showDialog = false">關閉</q-btn>
            </q-card-actions>
          </q-card>
        </q-dialog>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import Swal from 'sweetalert2'
import { DateTime } from 'luxon'
import { useUserStore } from '/stores/user'
import axios from 'axios'
import { onMounted, onBeforeUnmount, ref, reactive, computed } from 'vue'

useHead({
  title: '北台灣企業餐飲團訂網｜購物車',
  meta: [
    // Description Meta Tag

    { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' },
    // ...
    {
      name: 'description',
      content:
        '北台灣企業餐飲團訂網平台為整合各大服務企業團體餐點的預訂網站，在這裡無論團體便當外送、會議盒餐外送、下午茶餐盒外送、甜品外送、手搖飲外送，在這裡都可輕鬆預訂！'
    },
    // Open Graph
    {
      property: 'og:title',
      content: '北台灣企業餐飲團訂網｜購物車'
    },
    {
      property: 'og:description',
      content:
        '北台灣企業餐飲團訂網平台為整合各大服務企業團體餐點的預訂網站，在這裡無論團體便當外送、會議盒餐外送、下午茶餐盒外送、甜品外送、手搖飲外送，在這裡都可輕鬆預訂！'
    },
    {
      property: 'og:image',
      content: 'https://www.beifoodorder.com/ogImg.png' // 使用你的圖片路徑
    },
    {
      property: 'og:image:alt',
      content: '北台灣'
    },
    {
      property: 'og:url',
      content: 'https://www.beifoodorder.com/cart'
    },
    {
      property: 'og:type',
      content: 'website'
    },
    {
      name: 'author',
      content: 'bao'
    }

    // { name: 'google-site-verification', content: '5j6K_dFtD3LNzCJ42rR_OSpfv1rmneTcTEXsdRASwU0' }
    // ...
  ]
})

const { $apiAuth } = useNuxtApp()
const router = useRouter()
const user = useUserStore()
const { editCart, checkout } = user

const cart = reactive([])
const isMobile = ref(false) // 偵測是否為手機
const deliveryDate = ref('')
const deliveryTime = ref('')
const phone = ref(user.phoneNumber)
const landline = ref('')
const recipientName = ref('')
const recipientPhone = ref('')
const paymentMethod = ref('現金')
const sameAsOrderer = ref(false)
const checkoutDialog = ref(false)
const showDatePicker = ref(false)
const loading = ref(false)
const comment = ref('')
const storeInfo = reactive({}) // 儲存商家信息
const pagination = reactive({
  page: 1,
  rowsPerPage: 5 // 每頁顯示5筆
})

// 監控螢幕大小的函數
const updateIsMobile = () => {
  isMobile.value = window.innerWidth <= 768 // 偵測螢幕寬度小於或等於 1024
}
const minDate = ref('')

onMounted(async () => {
  const currentYear = DateTime.local().year
  await fetchHolidayData(currentYear) // 抓取當年的假日資料
  minDate.value = calculateMinDate().toISODate() // 計算五個工作日後的日期
  updateIsMobile() // 頁面載入時執行一次
  window.addEventListener('resize', updateIsMobile) // 螢幕尺寸變化時更新
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateIsMobile) // 元件卸載時移除監聽
})

const fetchStoreInfo = async uid => {
  try {
    const { data } = await $apiAuth.get(`/users/store/${uid}`)
    if (data.success) {
      storeInfo.companyName = data.result.company_name
      storeInfo.storePhone = data.result.store_phone
      storeInfo.uid = uid
    } else {
      Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: '無法獲取商家信息'
      })
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '錯誤',
      text: '加載商家信息失敗'
    })
  }
}

const columns = [
  { name: 'image', label: '圖片', field: 'image', align: 'center', sortable: false },
  { name: 'name', label: '名稱', field: 'name', align: 'left', sortable: true },
  { name: 'price', label: '單價', field: 'price', align: 'center', sortable: true },
  { name: 'quantity', label: '數量', field: 'quantity', align: 'center', sortable: true },
  { name: 'total', label: '小計', field: row => row.quantity * (row.details?.price || 0), align: 'center', sortable: true },
  { name: 'actions', label: '操作', align: 'center', sortable: false }
]

const paymentMethods = ref(['現金'])
const timeSlots = ref([])

const fetchTimeSlots = async productUid => {
  try {
    const { data } = await $apiAuth.get(`/users/opening-hours/${productUid}`)
    if (data.success) {
      const openingHours = data.result.opening_hours.split('-')
      const startHour = parseInt(openingHours[0].split(':')[0])
      const endHour = parseInt(openingHours[1].split(':')[0])

      timeSlots.value = []
      for (let hour = startHour; hour < endHour; hour++) {
        timeSlots.value.push(`${hour}:00-${hour}:30`, `${hour}:30-${hour + 1}:00`)
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: '無法獲取營業時間'
      })
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '錯誤',
      text: '加載營業時間失敗'
    })
  }
}

const holidays = ref([]) // 儲存假日資料
const today = DateTime.local().startOf('day') // 當前日期，時間設為午夜

const fetchHolidayData = async year => {
  try {
    const response = await axios.get(`https://cdn.jsdelivr.net/gh/ruyut/TaiwanCalendar/data/${year}.json`)
    holidays.value = response.data.filter(item => item.isHoliday === true).map(item => DateTime.fromFormat(item.date, 'yyyyLLdd').toISODate())
  } catch (error) {
    console.error('Error fetching holiday data:', error)
  }
}

const isSelectableDate = dateString => {
  const date = DateTime.fromISO(dateString) // 將字串轉換為日期格式

  // 禁用今天以前的日期
  if (date < today) {
    return false
  }

  // 禁用五個工作日以前的日期
  if (date < DateTime.fromISO(minDate.value)) {
    return false
  }

  // 禁用假日
  if (holidays.value.includes(dateString)) {
    return false
  }

  return true // 日期可選擇
}

const calculateMinDate = () => {
  let date = DateTime.local().startOf('day') // 當前日期，時間設為午夜
  let workDays = 0 // 計算工作天數

  // 假日不算作工作日，迴圈直到我們找到 5 個工作日
  while (workDays < 5) {
    date = date.plus({ days: 1 }) // 日期加一天

    // 檢查是否是假日，並且確保是工作日（週一到週五）
    const isHoliday = holidays.value.includes(date.toISODate())
    if (!isHoliday && date.weekday < 6) {
      workDays++ // 只有不是假日且是工作日時才計算為一個工作日
    }
  }

  return date // 返回滿足條件的最小日期
}

const onDateSelected = date => {
  if (isSelectableDate(date)) {
    deliveryDate.value = date // 更新選擇的日期
    showDatePicker.value = false // 隱藏日期選擇器
  } else {
    //console.log('不可選擇的日期') // 若日期不可選擇，打印日誌
  }
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
// 更新購物車數量（使用者直接輸入數量）
const updateCartInput = async (id, newQuantity) => {
  const idx = cart.findIndex(item => item.id === id)

  if (newQuantity <= 0) {
    cart[idx].quantity = 1 // 防止输入0或负数，将数量重置为1
  } else {
    cart[idx].quantity = newQuantity // 设置新数量
  }

  // 傳送 `items_id`、`p_id` 和 `uid`
  await editCart({
    p_id: cart[idx].product_name,
    items_id: cart[idx].items_id,
    quantity: cart[idx].quantity,
    uid: cart[idx].uid, // 確保這裡傳遞了 uid
    action: 'set'
  })
}

// 更新購物車數量
const updateCart = async (id, quantity) => {
  const idx = cart.findIndex(item => item.id === id)

  if (isNaN(quantity)) {
    console.error('Invalid quantity:', quantity)
    return
  }

  await editCart({
    p_id: cart[idx].product_name,
    items_id: cart[idx].items_id,
    quantity,
    uid: cart[idx].uid, // 確保這裡傳遞了 uid
    action: 'add'
  })

  // 更新本地數量
  cart[idx].quantity += quantity
  if (cart[idx].quantity <= 0) {
    cart.splice(idx, 1)
  }
}

// 刪除商品
const removeItem = async id => {
  const idx = cart.findIndex(item => item.id === id)

  const result = await Swal.fire({
    title: '確認刪除商品',
    text: '您確定要刪除此商品嗎？',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: '確認',
    cancelButtonText: '取消'
  })

  if (result.isConfirmed) {
    await editCart({
      p_id: cart[idx].product_name,
      items_id: cart[idx].items_id,
      uid: cart[idx].uid, // 確保這裡傳遞了 uid
      action: 'remove'
    })

    cart.splice(idx, 1)
    Swal.fire({ icon: 'success', title: '成功', text: '商品已刪除' })
  } else {
    Swal.fire({ icon: 'info', title: '取消', text: '商品未被刪除' })
  }
}

const openCheckoutDialog = async () => {
  if (cart.length > 0) {
    await fetchTimeSlots(cart[0].details?.uid)
  }
  checkoutDialog.value = true
}

const onCheckoutBtnClick = async () => {
  // 檢查購物車總數是否大於 20
  const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0)

  if (totalQuantity < 20) {
    checkoutDialog.value = false
    await Swal.fire({ icon: 'error', title: '失敗', text: '訂單商品數量必須大於 20 件' })
    checkoutDialog.value = true
    return
  }

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
    sid: storeInfo.uid,
    productTotal: totalPrice.value,
    shippingFee: 0,
    discount: 0
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
    const { data } = await $apiAuth.get('/users/cart')
    const cartItems = data.result
    if (cartItems.length > 0) {
      const storeUid = cartItems[0].product.uid
      await fetchStoreInfo(storeUid)
    }
    for (const item of cartItems) {
      const { data: productData } = await $apiAuth.get(`/products/${item.product_name}`)
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
const showDialog = ref(false)
const dialogData = ref(null)

// 打開 dialog 顯示商品詳情
const openDialog = item => {
  dialogData.value = item
  showDialog.value = true
}
</script>

<style lang="scss" scoped>
@import 'assets/cart.scss';
</style>
