<template>
  <q-page>
    <div id="orders">
      <div>
        <div class="row items-center nomalTitle3 justify-start">
          <p class="text-center">我的訂單</p>
          <q-select v-model="activeTab" outlined :options="tabOptions" emit-value map-options />
        </div>

        <q-tab-panels v-model="activeTab" animated>
          <q-tab-panel name="incomplete" class="no-x">
            <q-separator />
            <div cols="12">
              <div class="row w-100 myOrderFilters">
                <q-select class="myOrderFilter" outlined v-model="filters.status" :options="statusOptions" label="訂單狀態" clearable map-options emit-value />
                <q-input class="myOrderFilter" v-model="filters.deliveryDate" label="送達日期" outlined mask="####-##-##">
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer q-mr-xs">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale" v-model="showDatePicker">
                        <q-date v-model="filters.deliveryDate" mask="YYYY-MM-DD" @update:model-value="onDateSelected" color="accent"></q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <!-- <q-input class="myOrderFilter" outlined v-model="filters.userName" label="用戶帳號" /> -->
                <q-input class="myOrderFilter" outlined v-model="filters.orderNumber" label="訂單編號" />
                <div class="myOrderFilterBtns">
                  <q-btn class="q-mx-sm" label="搜尋" text-color="black" color="yellow-7" @click="onSearch('incomplete')" />
                  <q-btn class="q-mx-sm" label="清空" text-color="black" color="yellow-7" @click="clearFilters" />
                </div>
              </div>

              <!-- 桌面版表格呈現 -->
              <q-table v-if="!isMobile" :rows="orders" :columns="columns" row-key="oid" :rows-per-page-options="[5, 10, 20, 50]" :pagination="pagination">
                <template v-slot:body-cell-products="props">
                  <q-td :props="props">
                    <ul>
                      <li v-for="product in props.row.products" :key="product.id">
                        {{ product.quantity + ' 個 ' + product.product_name + ' - ' + product.total_price + ' 元' }}
                      </li>
                    </ul>
                  </q-td>
                </template>
                <template v-slot:body-cell-status="props">
                  <q-td :props="props">
                    <span :class="statusColor(props.row.status)" v-if="props.row.status !== '商家取消訂單' && props.row.status !== '顧客取消訂單'">
                      {{ props.row.status }}
                    </span>
                    <span v-else class="text-grey">
                      {{ props.row.status }}
                      <q-icon name="help" size="sm" v-if="props.row.cancelReason" class="cursor-pointer text-body2">
                        <q-tooltip class="text-body1">{{ props.row.cancelReason }}</q-tooltip>
                      </q-icon>
                    </span>
                  </q-td>
                </template>
                <template v-slot:body-cell-comment="props">
                  <q-td :props="props">
                    <q-icon name="help" size="sm" v-if="props.row.comment" class="cursor-pointer">
                      <q-tooltip class="text-body1">{{ props.row.comment }}</q-tooltip>
                    </q-icon>
                  </q-td>
                </template>
                <template v-slot:body-cell-cancel="props">
                  <q-td :props="props">
                    <q-btn v-if="props.row.status === '未確認'" flat label="取消訂單" color="negative" @click="confirmCancelOrder(props.row)" />
                    <q-btn v-else-if="props.row.status === '商品已送出'" flat label="領收訂單" color="blue" @click="confirmReceiveOrder(props.row)" />
                    <span v-else-if="props.row.status === '商家取消訂單' || props.row.status === '顧客取消訂單'" class="text-blue">已取消訂單</span>
                    <span v-else-if="props.row.status === '已接收訂單'" class="text-blue">訂單成立</span>
                    <span v-else-if="props.row.status === '已接收訂單' || props.row.status === '訂單完成'" class="text-blue">訂單完成</span>
                  </q-td>
                </template>
                <template v-slot:bottom>
                  <div class="row w-100 justify-end">
                    <q-pagination
                      v-model="page"
                      :max="pageCount"
                      :max-pages="6"
                      direction-links
                      boundary-links
                      icon-first="skip_previous"
                      icon-last="skip_next"
                      icon-prev="fast_rewind"
                      icon-next="fast_forward"
                      color="grey-8"
                      active-color="yellow-7" />
                  </div>
                </template>
              </q-table>

              <!-- 手機版 grid 版本 -->
              <div v-if="isMobile" class="grid-container">
                <div class="grid-item" v-for="order in orders" :key="order.oid">
                  <q-card>
                    <q-card-section>
                      <div class="title row items-center justify-between w-100">
                        <div class="row w-100 justify-start" :class="statusColor(order.status)">{{ order.status }}</div>
                        <div class="text-h6">訂單編號: {{ order.oid }}</div>
                      </div>
                      <div>訂購日期: {{ new Date(order.date).toLocaleDateString() }}</div>
                      <div>送達日期: {{ new Date(order.delivery_date).toLocaleDateString() }}</div>
                      <div>送達時段: {{ order.delivery_time }}</div>
                      <div>付款方式: {{ order.payment_method }}</div>

                      <q-separator />
                      <div class="q-my-sm">
                        訂單商品
                        <li v-for="product in order.products" :key="product.id">{{ product.quantity }} 個 {{ product.product_name }} - {{ product.total_price }} 元</li>
                      </div>
                      <q-separator />

                      <div v-if="order.comment">
                        <div class="text-body1">訂單備註: {{ order.comment }}</div>
                      </div>
                      <div>總金額: {{ order.total_price }} 元</div>
                    </q-card-section>
                    <q-card-actions class="w-100 row justify-start">
                      <q-btn outlined v-if="order.status === '未確認'" label="取消訂單" color="negative" @click="confirmCancelOrder(order)" />
                      <q-btn outlined v-else-if="order.status === '商品已送出'" label="領收訂單" color="blue" @click="confirmReceiveOrder(order)" />
                      <span v-else-if="order.status === '商家取消訂單' || order.status === '顧客取消訂單'" class="text-blue">已取消訂單</span>
                      <span v-else-if="order.status === '已接收訂單'" class="text-blue">訂單成立</span>
                      <span v-else-if="order.status === '已接收訂單' || order.status === '訂單完成'" class="text-blue">訂單完成</span>
                    </q-card-actions>
                  </q-card>
                </div>
              </div>
            </div>
            <div class="row w-100 justify-center q-my-md lt-md">
              <q-pagination
                v-model="page"
                :max="pageCount"
                :max-pages="6"
                direction-links
                boundary-links
                icon-first="skip_previous"
                icon-last="skip_next"
                icon-prev="fast_rewind"
                icon-next="fast_forward"
                color="grey-8"
                active-color="yellow-7" />
            </div>
          </q-tab-panel>

          <q-tab-panel name="complete" class="no-x">
            <q-separator />

            <div cols="12">
              <div class="row w-100 myOrderFilters">
                <q-select class="myOrderFilter" outlined v-model="filters.status" :options="statusOptions" label="訂單狀態" clearable map-options emit-value />
                <q-input class="myOrderFilter" v-model="filters.deliveryDate" label="送達日期" outlined mask="####-##-##">
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer q-mr-xs">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale" v-model="showDatePicker">
                        <q-date v-model="filters.deliveryDate" mask="YYYY-MM-DD" @update:model-value="onDateSelected" color="accent"></q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <!-- <q-input class="myOrderFilter" outlined v-model="filters.userName" label="用戶帳號" /> -->
                <q-input class="myOrderFilter" outlined v-model="filters.orderNumber" label="訂單編號" />
                <div class="myOrderFilterBtns">
                  <q-btn class="q-mx-sm" label="搜尋" text-color="black" color="yellow-7" @click="onSearch('complete')" />
                  <q-btn class="q-mx-sm" label="清空" text-color="black" color="yellow-7" @click="clearFilters" />
                </div>
              </div>

              <!-- 桌面版表格呈現 -->
              <q-table v-if="!isMobile" :rows="orders" :columns="columns" row-key="oid" :rows-per-page-options="[5, 10, 20, 50]" :pagination="pagination">
                <template v-slot:body-cell-products="props">
                  <q-td :props="props">
                    <ul>
                      <li v-for="product in props.row.products" :key="product.id">
                        {{ product.quantity + ' 個 ' + product.product_name + ' - ' + product.total_price + ' 元' }}
                      </li>
                    </ul>
                  </q-td>
                </template>
                <template v-slot:body-cell-status="props">
                  <q-td :props="props">
                    <span :class="statusColor(props.row.status)" v-if="props.row.status !== '商家取消訂單' && props.row.status !== '顧客取消訂單'">
                      {{ props.row.status }}
                    </span>
                    <span v-else class="text-grey">
                      {{ props.row.status }}
                      <q-icon name="help" size="sm" v-if="props.row.cancelReason" class="cursor-pointer text-body2">
                        <q-tooltip class="text-body1">{{ props.row.cancelReason }}</q-tooltip>
                      </q-icon>
                    </span>
                  </q-td>
                </template>
                <template v-slot:body-cell-comment="props">
                  <q-td :props="props">
                    <q-icon name="help" size="sm" v-if="props.row.comment" class="cursor-pointer">
                      <q-tooltip class="text-body1">{{ props.row.comment }}</q-tooltip>
                    </q-icon>
                  </q-td>
                </template>
                <template v-slot:body-cell-cancel="props">
                  <q-td :props="props">
                    <q-btn v-if="props.row.status === '未確認'" flat label="取消訂單" color="negative" @click="confirmCancelOrder(props.row)" />
                    <q-btn v-else-if="props.row.status === '商品已送出'" flat label="領收訂單" color="blue" @click="confirmReceiveOrder(props.row)" />
                    <span v-else-if="props.row.status === '商家取消訂單' || props.row.status === '顧客取消訂單'" class="text-blue">已取消訂單</span>
                    <span v-else-if="props.row.status === '已接收訂單'" class="text-blue">訂單成立</span>
                    <span v-else-if="props.row.status === '已接收訂單' || props.row.status === '訂單完成'" class="text-blue">訂單完成</span>
                  </q-td>
                </template>
                <template v-slot:bottom>
                  <div class="row w-100 justify-end">
                    <q-pagination
                      v-model="page"
                      :max="pageCount"
                      :max-pages="6"
                      direction-links
                      boundary-links
                      icon-first="skip_previous"
                      icon-last="skip_next"
                      icon-prev="fast_rewind"
                      icon-next="fast_forward"
                      color="grey-8"
                      active-color="yellow-7" />
                  </div>
                </template>
              </q-table>

              <!-- 手機版 grid 版本 -->
              <div v-if="isMobile" class="grid-container">
                <div class="grid-item" v-for="order in orders" :key="order.oid">
                  <q-card>
                    <q-card-section>
                      <div class="row w-100 justify-end" :class="statusColor(order.status)">{{ order.status }}</div>
                      <div class="title row items-center justify-between w-100">
                        <div class="text-h6">訂單編號: {{ order.oid }}</div>
                      </div>
                      <div>訂購日期: {{ new Date(order.date).toLocaleDateString() }}</div>
                      <div>送達日期: {{ new Date(order.delivery_date).toLocaleDateString() }}</div>
                      <div>送達時段: {{ order.delivery_time }}</div>
                      <div>付款方式: {{ order.payment_method }}</div>

                      <q-separator />
                      <div class="q-my-sm">
                        訂單商品
                        <li v-for="product in order.products" :key="product.id">{{ product.quantity }} 個 {{ product.product_name }} - {{ product.total_price }} 元</li>
                      </div>
                      <q-separator />
                      <div v-if="order.comment">
                        <div class="text-body1">訂單備註: {{ order.comment }}</div>
                      </div>
                      <div>總金額: {{ order.total_price }} 元</div>
                    </q-card-section>
                    <q-card-actions>
                      <q-btn outlined v-if="order.status === '未確認'" label="取消訂單" color="negative" @click="confirmCancelOrder(order)" />
                      <q-btn outlined v-else-if="order.status === '商品已送出'" label="領收訂單" color="blue" @click="confirmReceiveOrder(order)" />
                      <span v-else-if="order.status === '商家取消訂單' || order.status === '顧客取消訂單'" class="text-blue">已取消訂單</span>
                      <span v-else-if="order.status === '已接收訂單'" class="text-blue">訂單成立</span>
                      <span v-else-if="order.status === '已接收訂單' || order.status === '訂單完成'" class="text-blue">訂單完成</span>
                    </q-card-actions>
                  </q-card>
                </div>
              </div>
            </div>
            <div class="row w-100 justify-center q-my-md lt-md">
              <q-pagination
                v-model="page"
                :max="pageCount"
                :max-pages="6"
                direction-links
                boundary-links
                icon-first="skip_previous"
                icon-last="skip_next"
                icon-prev="fast_rewind"
                icon-next="fast_forward"
                color="grey-8"
                active-color="yellow-7" />
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </div>

      <q-dialog v-model="showCancelDialog" persistent>
        <q-card>
          <q-card-section>
            <div class="text-h6">取消訂單</div>
          </q-card-section>
          <q-card-section>
            <q-input v-model="cancelReason" label="取消原因" type="textarea" />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="否" color="primary" @click="showCancelDialog = false" />
            <q-btn flat label="是" color="negative" @click="cancelOrder" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog v-model="showReceiveDialog" persistent>
        <q-card>
          <q-card-section>
            <div class="text-h6">確認收到商品</div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="否" color="red" @click="showReceiveDialog = false" />
            <q-btn flat label="是" color="primary" @click="receiveOrder" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import Swal from 'sweetalert2'
const { $apiAuth } = useNuxtApp()
const orders = ref([])
const showCancelDialog = ref(false)
const showReceiveDialog = ref(false)
const showDatePicker = ref(false)
const orderToCancel = ref(null)
const orderToReceive = ref(null)
const cancelReason = ref('')
const counter = ref(60)
const page = ref(1)
const pageCount = ref(1)
const activeTab = ref('incomplete')
const isMobile = ref(false)

useHead({
  title: '北台灣企業餐飲團訂網｜訂單',
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' },
    // Description Meta Tag
    {
      name: 'description',
      content:
        '北台灣企業餐飲團訂網平台為整合各大服務企業團體餐點的預訂網站，在這裡無論團體便當外送、會議盒餐外送、下午茶餐盒外送、甜品外送、手搖飲外送，在這裡都可輕鬆預訂！'
    },
    // Open Graph
    {
      property: 'og:title',
      content: '北台灣企業餐飲團訂網｜訂單'
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
      content: 'https://www.beifoodorder.com/orders'
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

const tabOptions = ref([
  { label: '未完成訂單', value: 'incomplete' },
  { label: '已完成訂單', value: 'complete' }
])
const filters = ref({
  status: '',
  deliveryDate: '',
  userName: '',
  orderNumber: ''
})

const pagination = reactive({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  totalPages: 1
})
let intervalId = null
const statusOptions = ref([
  { label: '未確認', value: '未確認' },
  { label: '已接收訂單', value: '已接收訂單' },
  { label: '商品已送出', value: '商品已送出' }
])

const updateStatusOptions = tab => {
  if (tab === 'incomplete') {
    statusOptions.value = [
      { label: '未確認', value: '未確認' },
      { label: '已接收訂單', value: '已接收訂單' },
      { label: '商品已送出', value: '商品已送出' }
    ]
  } else if (tab === 'complete') {
    statusOptions.value = [
      { label: '訂單完成', value: '訂單完成' },
      { label: '顧客取消訂單', value: '顧客取消訂單' },
      { label: '商家取消訂單', value: '商家取消訂單' }
    ]
  }
}

const columns = [
  { name: 'oid', required: true, label: '訂單編號', align: 'center', field: row => row.oid, format: val => `${val}`, sortable: true },
  { name: 'date', align: 'center', label: '訂購日期', field: row => new Date(row.date).toLocaleDateString(), sortable: true },
  { name: 'deliveryDate', align: 'center', label: '送達日期', field: row => new Date(row.delivery_date).toLocaleDateString(), sortable: true },
  { name: 'deliveryTime', align: 'center', label: '送達時段', field: row => row.delivery_time, sortable: true },
  { name: 'totalPrice', align: 'left', label: '金額', field: row => row.order_total, sortable: true },
  { name: 'paymentMethod', align: 'center', label: '付款方式', field: row => row.payment_method, sortable: true },
  { name: 'products', align: 'left', label: '商品', field: 'products', sortable: false },
  { name: 'status', align: 'center', label: '狀態', field: 'status', sortable: true },
  { name: 'comment', align: 'center', label: '備註', field: 'comment', sortable: false },
  { name: 'cancel', align: 'center', label: '操作', field: 'cancel', sortable: false }
]

const statusColor = status => {
  switch (status) {
    case '未確認':
    case '拒絕':
      return 'text-red'
    case '商家取消訂單':
    case '顧客取消訂單':
      return 'text-grey'
    case '已接收訂單':
    case '商品已送出':
      return 'text-green'
    case '訂單完成':
      return 'text-blue'
    case '接受':
      return 'text-green'
    default:
      return ''
  }
}

const onDateSelected = date => {
  filters.value.deliveryDate = date
  showDatePicker.value = false
}

const onSearch = tab => {
  page.value = 1
  fetchOrders(tab)
}

const fetchOrders = async tab => {
  const url = tab === 'complete' ? '/orders/completed' : '/orders/incomplete'
  try {
    const { data } = await $apiAuth.get(url, {
      params: {
        page: page.value,
        ...filters.value
      }
    })
    // const tempOrders = data.result.map(order => {
    //   order.total_price = order.products.reduce((total, product) => total + parseFloat(product.total_price), 0)
    //   return order
    // })

    // orders.value = tempOrders
    orders.value = data.result
    pageCount.value = data.totalPages
    counter.value = 60 // 重置
  } catch (error) {
    console.error('Error fetching orders:', error)
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: '取得訂單失敗'
    })
  }
}

const clearFilters = () => {
  filters.value = {
    status: '',
    deliveryDate: '',
    userName: '',
    orderNumber: ''
  }
  fetchOrders(activeTab.value)
}

const confirmCancelOrder = order => {
  orderToCancel.value = order
  showCancelDialog.value = true
}

const confirmReceiveOrder = order => {
  orderToReceive.value = order
  showReceiveDialog.value = true
}

const cancelOrder = async () => {
  if (!cancelReason.value) {
    Swal.fire({
      icon: 'warning',
      title: '警告',
      text: '取消原因不能為空'
    })
    return
  }

  try {
    await $apiAuth.put('/orders/status', {
      orderId: orderToCancel.value.oid,
      status: '顧客取消訂單',
      cancelReason: cancelReason.value
    })
    orderToCancel.value.status = '顧客取消訂單'
    orderToCancel.value.cancelReason = cancelReason.value
    showCancelDialog.value = false
    Swal.fire({
      icon: 'success',
      title: '成功',
      text: '訂單已取消'
    })
    fetchOrders(activeTab.value)
  } catch (error) {
    console.error('Error canceling order:', error)
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: '取消訂單失敗'
    })
  }
}

const receiveOrder = async () => {
  try {
    await $apiAuth.put('/orders/status', {
      orderId: orderToReceive.value.oid,
      status: '訂單完成'
    })
    orderToReceive.value.status = '訂單完成'
    showReceiveDialog.value = false
    Swal.fire({
      icon: 'success',
      title: '成功',
      text: '訂單已完成'
    })
    fetchOrders(activeTab.value)
  } catch (error) {
    console.error('Error updating order status:', error)
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: '更新訂單狀態失敗'
    })
  }
}

const startTimer = () => {
  intervalId = setInterval(() => {
    if (counter.value > 0) {
      counter.value--
    } else {
      fetchOrders(activeTab.value)
    }
  }, 1000)
}

const updateIsMobile = () => {
  isMobile.value = window.innerWidth <= 1024
}

onMounted(() => {
  fetchOrders(activeTab.value)
  startTimer()
  updateIsMobile()
  window.addEventListener('resize', updateIsMobile)
})

onUnmounted(() => {
  clearInterval(intervalId)
  window.removeEventListener('resize', updateIsMobile)
})

watch(activeTab, newTab => {
  updateStatusOptions(newTab)
  fetchOrders(newTab)
})

watch(page, () => fetchOrders(activeTab.value))
</script>

<style lang="scss" scoped>
@import 'assets/orders.scss';
</style>
