<!-- setting/orders.vue -->
<template>
  <q-page>
    <div>
      <div class="adminOrdersTable">
        <div>
          <h3 class="text-center">訂單</h3>
        </div>
        <q-separator />
        <div>
          <div class="row w-100">
            <q-select class="col-2 filterBtn" outlined v-model="filters.status" :options="statusOptions" label="訂單狀態" clearable map-options emit-value />
            <q-input class="filterBtn" v-model="filters.deliveryDate" label="送達日期" outlined mask="####-##-##">
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

            <!-- 新增的日期區間篩選 -->
            <q-input class="col-2 filterBtn" outlined v-model="filters.startDate" label="開始日期" mask="####-##-##">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer q-mr-xs">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale" v-model="showStartDatePicker">
                    <q-date v-model="filters.startDate" mask="YYYY-MM-DD" @update:model-value="onStartDateSelected" color="accent"></q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-input class="col-2 filterBtn" outlined v-model="filters.endDate" label="結束日期" mask="####-##-##">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer q-mr-xs">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale" v-model="showEndDatePicker">
                    <q-date v-model="filters.endDate" mask="YYYY-MM-DD" @update:model-value="onEndDateSelected" color="accent"></q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <!-- 結束區間篩選 -->

            <q-btn class="q-ma-sm" label="搜尋" color="primary" @click="onSearch" />
            <q-btn class="q-ma-sm" label="清空" color="secondary" @click="clearFilters" />
            <q-btn class="q-ma-sm" label="匯出為Excel" color="secondary" @click="exportToExcel" />

            <!-- 
            <q-btn v-if="isSuperAdmin" color="primary" class="q-ma-sm" @click="openStatusDialog">
              今日訂單狀態歷史
              <q-badge color="red" floating v-if="newOrderStatusCount > 0">{{ newOrderStatusCount }}</q-badge>
            </q-btn> -->
          </div>

          <q-table :rows="orders" :columns="computedColumns" row-key="oid" :rows-per-page-options="[5, 10, 20, 50]" :pagination="pagination">
            <template v-slot:body-cell-products="props">
              <q-td :props="props">
                <ul>
                  <li v-for="product in props.row.products" :key="product.id">
                    {{ product.quantity + ' 個 ' + (product.product_name || '未知商品') + ' - ' + product.total_price + ' 元' }}
                    <!-- <span v-if="canUpdateProduct" class="pointer" :class="statusColor(product.status)" @click="openProductStatusDialog(product)">
                      {{ product.status }}
                    </span> -->
                    <!-- <span v-else :class="statusColor(product.status)">
                      {{ product.status }}
                      <q-icon
                        v-if="product.status === '拒絕' && product.cancel_reason"
                        name="help"
                        size="xs"
                        class="cursor-pointer text-body2"
                        style="vertical-align: sub">
                        <q-tooltip class="text-body1">{{ product.cancel_reason }}</q-tooltip>
                      </q-icon>
                    </span> -->
                  </li>
                </ul>
              </q-td>
            </template>
            <template v-slot:body-cell-user="props">
              <q-td :props="props">
                <q-btn flat color="primary" @click="openUserDialog(props.row)">
                  {{ props.row.userAccount || '未知用戶' }}
                </q-btn>
              </q-td>
            </template>
            <template v-if="isSuperAdmin" v-slot:body-cell-manufacturer="props">
              <q-td :props="props">
                <ul>
                  <li v-for="product in props.row.products" :key="product.id + '-' + product.manufacturer_name">
                    <q-btn color="primary" style="padding: 0; min-height: 0" flat @click="openManufacturerDialog(product.uid)">
                      {{ product.manufacturer_name }}
                    </q-btn>
                  </li>
                </ul>
              </q-td>
            </template>
            <template v-slot:body-cell-cancel="props">
              <q-td :props="props">
                <q-btn v-if="props.row.status === '未確認'" flat label="取消訂單" color="negative" @click="confirmCancelOrder(props.row)" />
                <!-- <span v-else-if="props.row.status === '商家取消訂單' || props.row.status === '顧客取消訂單'" class="text-blue">已取消訂單</span>
                <span v-else-if="props.row.status === '已接收訂單' || props.row.status === '商品已送出'" class="text-blue">訂單成立</span>
                <span v-else-if="props.row.status === '訂單完成'" class="text-blue">訂單完成</span> -->
              </q-td>
            </template>
            <template v-slot:body-cell-status="props">
              <q-td :props="props">
                <span :class="statusColor(props.row.status)" v-if="isSuperAdmin">{{ props.row.status }}</span>
                <q-btn v-else class="pointer" flat :class="statusColor(props.row.status)" @click="openOrderStatusDialog(props.row)">
                  {{ props.row.status }}
                </q-btn>
                <q-icon v-if="props.row.status === '商家取消訂單' || props.row.status === '顧客取消訂單'" name="help" size="sm" class="cursor-pointer text-body2">
                  <q-tooltip class="text-body1">{{ props.row.cancelReason }}</q-tooltip>
                </q-icon>
              </q-td>
            </template>
            <template v-slot:body-cell-comment="props">
              <q-td :props="props">
                <q-icon name="help" size="sm" v-if="props.row.comment" class="cursor-pointer text-body2">
                  <q-tooltip class="text-body1">{{ props.row.comment }}</q-tooltip>
                </q-icon>
              </q-td>
            </template>
            <template v-slot:bottom>
              <div class="row w-100 justify-between">
                <!-- 顯示總營業額 -->
                <div class="q-mt-md text-red" style="font-size: 18px">
                  <p class="ma-0">總營業額: {{ totalRevenue }} 元</p>
                </div>

                <q-pagination
                  v-model="page"
                  :max="pageCount"
                  @update:model-value="fetchOrders"
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
          <q-dialog v-if="isSuperAdmin" v-model="showStatusDialog" persistent full-width>
            <!-- 訂單狀態歷史記錄區塊 -->
            <q-card>
              <div v-if="isSuperAdmin" class="statusHistory">
                <h3 class="text-center">訂單狀態歷史記錄</h3>
                <q-separator />
                <div>
                  <q-table :rows="statusHistory" :columns="statusHistoryColumns" row-key="id">
                    <template v-slot:body-cell-time="props">
                      <q-td :props="props">
                        {{ new Date(props.row.time).toLocaleString() }}
                      </q-td>
                    </template>
                    <template v-slot:body-cell-action="props">
                      <q-td :props="props">
                        <q-btn outlined color="negative" @click="removeRecord(props.rowIndex)">刪除</q-btn>
                      </q-td>
                    </template>
                  </q-table>
                </div>
              </div>
              <q-card-actions align="right">
                <q-btn flat label="清除提醒" color="red" @click="orderStatusHistoryStore.clearNewOrderStatusCount()" />
                <q-btn flat label="關閉" color="primary" @click="showStatusDialog = false" />
              </q-card-actions>
            </q-card>
          </q-dialog>
        </div>
      </div>
      <!-- 使用者資料Dialog -->
      <q-dialog v-model="showUserDialog" persistent>
        <q-card>
          <q-card-section>
            <div class="text-h6">用戶資料</div>
          </q-card-section>
          <q-card-section>
            <p>
              <strong>訂單編號:</strong>
              {{ selectedOrder.oid }}
            </p>
            <p>
              <strong>訂購日期:</strong>
              {{ new Date(selectedOrder.date).toLocaleDateString() }}
            </p>
            <p>
              <strong>送達日期:</strong>
              {{ new Date(selectedOrder.delivery_date).toLocaleDateString() }}
            </p>
            <p>
              <strong>送達時段:</strong>
              {{ selectedOrder.delivery_time }}
            </p>

            <p>
              <strong>訂購人:</strong>
              {{ selectedOrder.name }}
              <span class="text-red" v-if="selectedOrder.gender">{{ genderChinese(selectedOrder.gender) }}</span>
            </p>
            <p>
              <strong>生日:</strong>
              {{ new Date(selectedOrder.birthdate).toLocaleDateString() }}
              <span v-if="isBirthday(selectedOrder.birthdate)" class="birthday-icon">
                <q-icon name="cake" size="sm" color="red" />
                <span class="birthday-message">生日快樂!</span>
              </span>
            </p>
            <p>
              <strong>訂購人手機:</strong>
              {{ selectedOrder.phone }}
            </p>
            <p>
              <strong>市話:</strong>
              {{ selectedOrder.landline }}
            </p>
            <p>
              <strong>公司名稱:</strong>
              {{ selectedOrder.company_name }}
            </p>
            <p>
              <strong>統編:</strong>
              {{ selectedOrder.tax_id }}
            </p>
            <p>
              <strong>收貨人:</strong>
              {{ selectedOrder.recipient_name }}
            </p>
            <p>
              <strong>收貨人手機:</strong>
              {{ selectedOrder.recipient_phone }}
            </p>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="關閉" color="primary" @click="showUserDialog = false" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- 商品狀態Dialog -->
      <q-dialog v-model="showProductStatusDialog" persistent>
        <q-card>
          <q-card-section>
            <div class="text-h6">更新商品狀態</div>
          </q-card-section>
          <q-card-section>
            <q-select v-model="selectedProductStatus" :options="productStatusOptions" label="狀態" />
            <q-input v-if="selectedProductStatus === '拒絕'" v-model="productCancelReason" label="拒絕原因" type="textarea" />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="取消" color="primary" @click="showProductStatusDialog = false" />
            <q-btn flat label="更新" color="positive" @click="updateProductStatus" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- 訂單狀態Dialog -->
      <q-dialog v-model="showOrderStatusDialog" persistent>
        <q-card>
          <q-card-section>
            <div class="text-h6">更新訂單狀態</div>
          </q-card-section>
          <q-card-section>
            <q-select v-model="selectedOrderStatus" :options="orderStatusOptions" label="狀態" />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="取消" color="primary" @click="showOrderStatusDialog = false" />
            <q-btn flat label="更新" color="positive" @click="updateOrderStatus" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- 取消訂單Dialog -->
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

      <!-- 廠商資料Dialog -->
      <q-dialog v-model="showManufacturerDialog" persistent>
        <q-card>
          <q-card-section>
            <div class="text-h6">廠商資料</div>
          </q-card-section>
          <q-card-section>
            <p>
              <strong>商家帳號:</strong>
              {{ manufacturer.account }}
            </p>
            <p>
              <strong>商家名稱:</strong>
              {{ manufacturer.company_name }}
            </p>
            <p>
              <strong>聯絡電話:</strong>
              {{ manufacturer.phone_number }}
            </p>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="關閉" color="primary" @click="showManufacturerDialog = false" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import ExcelJS from 'exceljs'
import Swal from 'sweetalert2'
import { useUserStore } from '/stores/user'
import { storeToRefs } from 'pinia'
import { useOrderStatusHistoryStore } from '/stores/orderStatusHistory'
import io from 'socket.io-client'
const { $apiAuth } = useNuxtApp()
definePageMeta({
  layout: 'admin'
})

const orders = ref([])
const userStore = useUserStore()
const { isSuperAdmin, role, isAdmin } = storeToRefs(userStore)
const showUserDialog = ref(false)
const showCancelDialog = ref(false)
const showProductStatusDialog = ref(false)
const showOrderStatusDialog = ref(false)
const showManufacturerDialog = ref(false)
const showStatusDialog = ref(false)
const showStartDatePicker = ref(false) // 用于显示开始日期选择器
const showEndDatePicker = ref(false) // 用于显示结束日期选择器
const selectedOrder = ref({})
const showDatePicker = ref(false)
const orderToCancel = ref(null)
const selectedProduct = ref({})
const totalRevenue = ref(0)
const selectedProductStatus = ref('')
const selectedOrderStatus = ref('')
const cancelReason = ref('')
const productCancelReason = ref('')
const manufacturer = ref({})
const counter = ref(60)
const orderStatusHistoryStore = useOrderStatusHistoryStore()
const statusHistory = orderStatusHistoryStore.statusHistory
const { newOrderStatusCount } = storeToRefs(orderStatusHistoryStore)

const genderChinese = gender => {
  switch (gender) {
    case 'male':
      return '男'
    case 'female':
      return '女'
    default:
      return ''
  }
}

const isBirthday = birthdate => {
  const today = new Date()
  const birthDate = new Date(birthdate)
  return today.getMonth() === birthDate.getMonth() && today.getDate() === birthDate.getDate()
}

const page = ref(1)
const pageCount = ref(1)

const today = new Date().toISOString().split('T')[0]
const filters = ref({
  status: '',
  deliveryDate: today,
  startDate: '', // 新增的開始日期過濾器
  endDate: '',
  userName: '',
  orderNumber: ''
})

const pagination = reactive({
  page: 1,
  rowsPerPage: 10, // 每頁顯示的行數
  totalPages: 1
})

let intervalId = null

const productStatusOptions = ['未確認', '拒絕', '接受', '已送出']
const orderStatusOptions = ['未確認', '已接收訂單', '商品已送出', '訂單完成']
const orderFilterOptions = ['未確認', '已接收訂單', '商品已送出', '訂單完成', '顧客取消訂單', '商家取消訂單']
const statusOptions = orderFilterOptions.map(status => ({ label: status, value: status }))

// 處理開始日期選擇的函數
const onStartDateSelected = date => {
  filters.value.startDate = date
  filters.value.deliveryDate = '' // 清空送達日期
  showStartDatePicker.value = false
}

// 處理結束日期選擇的函數
const onEndDateSelected = date => {
  filters.value.endDate = date
  showEndDatePicker.value = false
}

// 處理送達日期選擇的函數
const onDateSelected = date => {
  filters.value.deliveryDate = date
  filters.value.startDate = '' // 清空開始日期
  filters.value.endDate = '' // 清空結束日期
  showDatePicker.value = false
}

const commonColumns = [
  { name: 'oid', required: true, label: '訂單編號', align: 'center', field: row => row.oid, format: val => `${val}`, sortable: true },
  { name: 'date', align: 'center', label: '訂購日期', field: row => new Date(row.date).toLocaleDateString(), sortable: true },
  { name: 'deliveryDate', align: 'center', label: '送達日期', field: row => new Date(row.delivery_date).toLocaleDateString(), sortable: true },
  { name: 'deliveryTime', align: 'center', label: '送達時段', field: row => row.delivery_time, sortable: true },
  { name: 'totalPrice', align: 'left', label: '金額', field: row => row.total_price, sortable: true },
  { name: 'paymentMethod', align: 'center', label: '付款方式', field: row => row.payment_method, sortable: true },
  { name: 'products', align: 'left', label: '商品/商品狀態異動(廠商)', field: 'products', sortable: false },
  { name: 'user', align: 'center', label: '用戶帳號', field: 'user_account', sortable: true },
  { name: 'status', align: 'center', label: '訂單狀態/更改(管理者)', field: 'status', sortable: true },
  { name: 'comment', align: 'center', label: '備註', field: 'comment', sortable: false },
  { name: 'cancel', align: 'center', label: '操作', field: 'cancel', sortable: false } // 将 "操作" 列包含在 commonColumns 中
]

const adminColumns = [
  ...commonColumns.slice(0, -1), // 排除 `cancel` 列
  { name: 'manufacturer', align: 'left', label: '廠商名稱', field: 'manufacturer_name', sortable: true },
  commonColumns[commonColumns.length - 1] // 重新添加 `cancel` 列
]

const statusHistoryColumns = [
  { name: 'time', required: true, label: '時間', align: 'center', field: row => row.time, format: val => `${val}`, sortable: true },
  { name: 'oid', align: 'center', label: '訂單編號', field: row => row.oid, sortable: true },
  { name: 'updateMessage', align: 'left', label: '動作', field: row => row.updateMessage, sortable: true },
  { name: 'operatorName', align: 'center', label: '操作者', field: row => row.operatorName, sortable: true },
  { name: 'action', align: 'center', label: '操作', field: 'action', sortable: false }
]

const computedColumns = computed(() => (isSuperAdmin.value ? adminColumns : commonColumns))

const canUpdateProduct = computed(() => role.value === 1)

const removeRecord = index => {
  orderStatusHistoryStore.removeHistoryRecord(index)
}

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
const onSearch = () => {
  page.value = 1
  fetchOrders()
}
const fetchOrders = async () => {
  try {
    const { data } = await $apiAuth.get('/orders/all', {
      params: {
        uid: userStore.uid,
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
    totalRevenue.value = data.totalRevenue
    counter.value = 60 // 重置
  } catch (error) {
    const errorMessage = error.response?.data?.message
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: errorMessage
    })
  }
}

const confirmCancelOrder = order => {
  orderToCancel.value = order
  showCancelDialog.value = true
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
      status: '商家取消訂單',
      cancelReason: cancelReason.value
    })
    orderToCancel.value.status = '商家取消訂單'
    showCancelDialog.value = false
    Swal.fire({
      icon: 'success',
      title: '成功',
      text: '訂單已取消'
    })
    cancelReason.value = ''
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

const openUserDialog = order => {
  selectedOrder.value = order
  showUserDialog.value = true
}
const openStatusDialog = () => {
  showStatusDialog.value = true
}

const openManufacturerDialog = async uid => {
  try {
    const { data } = await $apiAuth.get(`/users/${uid}`)
    if (data.success) {
      manufacturer.value = data.result
      showManufacturerDialog.value = true
    } else {
      Swal.fire({
        icon: 'error',
        title: '失敗',
        text: '獲取廠商資料失敗'
      })
    }
  } catch (error) {
    console.error('Error fetching manufacturer details:', error)
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: '獲取廠商資料失敗'
    })
  }
}

const openProductStatusDialog = product => {
  selectedProduct.value = product
  selectedProductStatus.value = product.status
  productCancelReason.value = product.cancel_reason || ''
  showProductStatusDialog.value = true
}

const updateProductStatus = async () => {
  try {
    await $apiAuth.put('/orders/products-status', {
      productId: selectedProduct.value.id,
      status: selectedProductStatus.value,
      cancelReason: selectedProductStatus.value === '拒絕' ? productCancelReason.value : '',
      uid: userStore.uid
    })
    selectedProduct.value.status = selectedProductStatus.value
    if (selectedProductStatus.value === '拒絕') {
      selectedProduct.value.cancelReason = productCancelReason.value
    }
    showProductStatusDialog.value = false

    Swal.fire({
      icon: 'success',
      title: '成功',
      text: '商品狀態已更新'
    })
    fetchOrders()
  } catch (error) {
    console.error('Error updating product status:', error)
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: '更新商品狀態失敗'
    })
  }
}

const openOrderStatusDialog = order => {
  selectedOrder.value = order
  selectedOrderStatus.value = order.status
  showOrderStatusDialog.value = true
}

const updateOrderStatus = async () => {
  // if (role.value !== 2) {
  //   Swal.fire({
  //     icon: 'error',
  //     title: '失敗',
  //     text: '只有超級管理員可以更改訂單狀態'
  //   })
  //   return
  // }

  try {
    await $apiAuth.put('/orders/status', {
      orderId: selectedOrder.value.oid,
      status: selectedOrderStatus.value
    })
    selectedOrder.value.status = selectedOrderStatus.value
    showOrderStatusDialog.value = false
    Swal.fire({
      icon: 'success',
      title: '成功',
      text: '訂單狀態已更新'
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

const exportToExcel = async () => {
  try {
    const { data } = await $apiAuth.get('/orders/completedorder', {
      params: {
        uid: userStore.uid,
        startDate: filters.value.startDate,
        endDate: filters.value.endDate,
        userName: filters.value.userName,
        orderNumber: filters.value.orderNumber
      }
    })

    if (data.result.length === 0) {
      Swal.fire({
        icon: 'info',
        title: '提示',
        text: '目前没有符合的訂單'
      })
      return
    }

    // 準備數據
    const exportData = data.result.map(order => ({
      訂單編號: order.oid,
      訂購日期: new Date(order.date).toLocaleDateString(),
      送達日期: new Date(order.delivery_date).toLocaleDateString(),
      送達時段: order.delivery_time,
      金額: order.products.reduce((total, product) => total + product.quantity * product.price, 0), // 確保正確計算總價
      付款方式: order.payment_method,
      訂單狀態: order.status,
      備註: order.comment,
      用戶帳號: order.user_account,
      商品明細: order.products.map(p => `${p.quantity} 個 ${p.product_name} - ${p.total_price} 元`).join('; ')
    }))

    // 總營業額計算
    const totalRevenue = exportData.reduce((sum, order) => sum + order.金額, 0)

    exportData.push({
      訂單編號: '總營業額',
      金額: totalRevenue.toFixed(2),
      訂購日期: '',
      送達日期: '',
      送達時段: '',
      付款方式: '',
      訂單狀態: '',
      備註: '',
      用戶帳號: '',
      商品明細: ''
    })

    // 使用 exceljs 生成工作簿和工作表
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('訂單列表')

    // 設定欄位名稱
    worksheet.columns = [
      { header: '訂單編號', key: '訂單編號', width: 15 },
      { header: '訂購日期', key: '訂購日期', width: 15 },
      { header: '送達日期', key: '送達日期', width: 15 },
      { header: '送達時段', key: '送達時段', width: 15 },
      { header: '金額', key: '金額', width: 10 },
      { header: '付款方式', key: '付款方式', width: 15 },
      { header: '訂單狀態', key: '訂單狀態', width: 15 },
      { header: '備註', key: '備註', width: 30 },
      { header: '用戶帳號', key: '用戶帳號', width: 20 },
      { header: '商品明細', key: '商品明細', width: 50 }
    ]

    // 填充數據
    exportData.forEach(dataRow => {
      worksheet.addRow(dataRow)
    })

    // 生成文件名
    const startDate = filters.value.startDate ? filters.value.startDate.replace(/-/g, '') : '開始日期未指定'
    const endDate = filters.value.endDate ? filters.value.endDate.replace(/-/g, '') : '結束日期未指定'
    const fileName = `${startDate}至${endDate} 訂單.xlsx`

    // 將工作簿轉換為緩衝區並觸發下載
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Export to Excel error:', error)
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: '匯出訂單資料失敗'
    })
  }
}

const clearFilters = () => {
  filters.value = {
    status: '',
    deliveryDate: today,
    startDate: '', // 清空開始日期
    endDate: '', // 清空結束日期
    userName: '',
    orderNumber: ''
  }
  fetchOrders()
}

const startTimer = () => {
  intervalId = setInterval(() => {
    if (counter.value > 0) {
      counter.value--
    } else {
      fetchOrders()
      counter.value = 60
    }
  }, 1000)
}

const initWebSocket = () => {
  const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl
  const protocol = apiBaseUrl.startsWith('https') ? 'wss' : 'ws'
  const wsUrl = apiBaseUrl.replace(/^http/, protocol)
  console.log('WebSocket URL:', wsUrl)

  const socket = io(wsUrl)
  const messageQueue = []

  socket.on('connect', () => {
    console.log('連線到伺服器')
  })

  const shouldNotify = message => {
    if (isSuperAdmin.value) return true
    if (isAdmin.value && message.relatedManufacturerIds.includes(userStore.uid)) return true
    return false
  }

  socket.on('orderStatusUpdate', message => {
    console.log('Received order status update:', message)
    if (shouldNotify(message)) {
      messageQueue.push({
        type: 'orderStatusUpdate',
        time: message.time,
        oid: message.oid,
        updateMessage: message.updateMessage,
        operatorName: message.operatorName
      })
      processQueue()
    }
  })

  socket.on('newOrder', message => {
    console.log('Received new order message:', message)
    if (shouldNotify(message)) {
      messageQueue.push({
        type: 'newOrder',
        time: message.time,
        oid: message.oid,
        updateMessage: message.updateMessage,
        operatorName: message.operatorName
      })
      processQueue()
    }
  })

  socket.on('disconnect', reason => {
    console.log('WebSocket disconnected:', reason)
  })

  socket.on('error', error => {
    console.error('WebSocket error:', error)
  })

  const processQueue = () => {
    if (messageQueue.length > 0) {
      const currentMessage = messageQueue.shift()
      Swal.fire({
        icon: 'info',
        title: currentMessage.type === 'newOrder' ? '新訂單通知' : '訂單狀態更新',
        text: currentMessage.updateMessage,
        timer: 5000,
        backdrop: `rgba(0,0,123,0.4)
        url("https://i.pinimg.com/originals/e1/f2/3d/e1f23dfb401e68caf9e0d81e469a2b46.gif")
        left center
        no-repeat
        `
      }).then(() => {
        if (currentMessage.type === 'orderStatusUpdate') {
          orderStatusHistoryStore.addHistoryRecord(currentMessage)
        }
        fetchOrders()
        processQueue()
      })
    }
  }
}

onMounted(() => {
  fetchOrders()
  startTimer()
  initWebSocket() // 初始化 WebSocket
})

onUnmounted(() => {
  clearInterval(intervalId)
})
</script>

<style lang="scss" scoped>
@import 'assets/setting/orders.scss';
</style>
