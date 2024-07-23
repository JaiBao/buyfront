<template>
  <q-page>
    <div id="orders">
      <div>
        <div cols="12">
          <h3 class="text-center">訂單</h3>
        </div>
        <q-separator />
        <div cols="12" class="q-gutter-sm">
          <div class="row w-100">
            <q-select class="col-2 filterBtn" outlined v-model="filters.status" :options="statusOptions" label="訂單狀態" clearable map-options emit-value />
            <q-input v-model="filters.deliveryDate" label="送達日期" outlined mask="####-##-##">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer q-mr-xs">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale" v-model="showDatePicker">
                    <q-date v-model="filters.deliveryDate" mask="YYYY-MM-DD" @update:model-value="onDateSelected" color="accent"></q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-input class="col-2 filterBtn" outlined v-model="filters.userName" label="用戶帳號" />
            <q-input class="col-2 filterBtn" outlined v-model="filters.orderNumber" label="訂單編號" />
            <q-btn class="q-ma-sm" label="搜尋" color="primary" @click="onSearch" />
            <q-btn class="q-ma-sm" label="清空" color="secondary" @click="clearFilters" />
          </div>
          <q-table :rows="orders" :columns="columns" row-key="oid">
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
                  icon-next="fast_forward" />
              </div>
            </template>
          </q-table>

          <div class="reCatch">
            <q-icon class="pointer" name="sync" size="sm" @click="fetchOrders" />
            <span>於 {{ counter }}秒後重新抓取</span>
          </div>
        </div>
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
import { apiAuth } from '/plugins/axios'
import Swal from 'sweetalert2'

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
const filters = ref({
  status: '',
  deliveryDate: '',
  userName: '',
  orderNumber: ''
})
let intervalId = null

const orderFilterOptions = ['未確認', '已接收訂單', '商品已送出', '訂單完成', '顧客取消訂單', '商家取消訂單']
const statusOptions = orderFilterOptions.map(status => ({ label: status, value: status }))

const columns = [
  { name: 'oid', required: true, label: '訂單編號', align: 'center', field: row => row.oid, format: val => `${val}`, sortable: true },
  { name: 'date', align: 'center', label: '訂購日期', field: row => new Date(row.date).toLocaleDateString(), sortable: true },
  { name: 'deliveryDate', align: 'center', label: '送達日期', field: row => new Date(row.delivery_date).toLocaleDateString(), sortable: true },
  { name: 'deliveryTime', align: 'center', label: '送達時段', field: row => row.delivery_time, sortable: true },
  { name: 'totalPrice', align: 'left', label: '金額', field: row => row.total_price, sortable: true },
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

const onSearch = () => {
  page.value = 1
  fetchOrders()
}

const fetchOrders = async () => {
  try {
    const { data } = await apiAuth.get('/orders', {
      params: {
        page: page.value,
        ...filters.value
      }
    })
    const tempOrders = data.result.map(order => {
      order.total_price = order.products.reduce((total, product) => total + parseFloat(product.total_price), 0)
      return order
    })

    orders.value = tempOrders
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
  fetchOrders()
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
    await apiAuth.put('/orders/status', {
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
    fetchOrders()
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
    await apiAuth.put('/orders/status', {
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
    fetchOrders()
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
      fetchOrders()
    }
  }, 1000)
}

onMounted(() => {
  fetchOrders()
  startTimer()
})

onUnmounted(() => {
  clearInterval(intervalId)
})

watch(page, fetchOrders)
</script>

<style lang="scss" scoped>
@import 'assets/orders.scss';
</style>
