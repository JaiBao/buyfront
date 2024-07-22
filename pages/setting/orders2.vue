<!-- setting/orders.vue 廠商/管理者 -->
<template>
  <q-page>
    <div>
      <div class="adminOrdersTable">
        <div>
          <h3 class="text-center">訂單</h3>
        </div>
        <q-separator />
        <div>
          <q-table :rows="orders" :columns="computedColumns" row-key="oid">
            <template v-slot:body-cell-products="props">
              <q-td :props="props">
                <ul>
                  <li v-for="product in props.row.products" :key="product.id">
                    {{ product.quantity + ' 個 ' + (product.name || '未知商品') + ' - ' + product.total_price + ' 元' }}
                    <span v-if="canUpdateProduct" class="pointer" :class="statusColor(product.status)" @click="openProductStatusDialog(product)">
                      {{ product.status }}
                    </span>
                    <span v-else :class="statusColor(product.status)">
                      {{ product.status }}
                      <q-icon v-if="product.status === '拒絕' && product.cancelReason" name="help" size="xs" class="cursor-pointer text-body2">
                        <q-tooltip class="text-body1">{{ product.cancelReason }}</q-tooltip>
                      </q-icon>
                    </span>
                  </li>
                </ul>
              </q-td>
            </template>
            <template v-slot:body-cell-user="props">
              <q-td :props="props">
                <q-btn flat @click="openUserDialog(props.row)">
                  {{ props.row.user_account || '未知用戶' }}
                </q-btn>
              </q-td>
            </template>
            <template v-if="isSuperAdmin" v-slot:body-cell-manufacturer="props">
              <q-td :props="props">
                <ul>
                  <li v-for="product in props.row.products" :key="product.id + '-' + product.manufacturer_name">
                    <q-btn style="padding: 0; min-height: 0" flat @click="openManufacturerDialog(product.uid)">
                      {{ product.manufacturer_name }}
                    </q-btn>
                  </li>
                </ul>
              </q-td>
            </template>
            <template v-if="isSuperAdmin" v-slot:body-cell-cancel="props">
              <q-td :props="props">
                <q-btn v-if="props.row.status === '未確認'" flat label="取消訂單" color="negative" @click="confirmCancelOrder(props.row)" />
                <span v-else-if="props.row.status === '商家取消訂單' || props.row.status === '顧客取消訂單'" class="text-blue">
                  <!-- <q-icon name="help" size="sm" class="cursor-pointer text-body2">
                    <q-tooltip class="text-body1">{{ props.row.cancelReason }}</q-tooltip>
                  </q-icon> -->
                  已取消訂單
                </span>
                <span v-else-if="props.row.status === '已接收訂單' || props.row.status === '商品已送出'" class="text-blue">訂單成立</span>
                <span v-else-if="props.row.status === '訂單完成'" class="text-blue">訂單完成</span>
              </q-td>
            </template>
            <template v-slot:body-cell-status="props">
              <q-td :props="props">
                <span :class="statusColor(props.row.status)" v-if="!isSuperAdmin">{{ props.row.status }}</span>
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
          </q-table>

          <div class="reCatch">
            <q-icon class="pointer" name="sync" size="sm" @click="fetchOrders" />
            <span>於 {{ counter }}秒後重新抓取</span>
          </div>
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
              <strong>送達時間:</strong>
              {{ new Date(selectedOrder.delivery_date).toLocaleDateString() }}
            </p>
            <p>
              <strong>訂購人:</strong>
              {{ selectedOrder.user_name }}
            </p>
            <p>
              <strong>訂購人手機:</strong>
              {{ selectedOrder.user_phone }}
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
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { apiAuth } from '/plugins/axios'
import Swal from 'sweetalert2'
import { useUserStore } from '/stores/user'
import { storeToRefs } from 'pinia'

definePageMeta({
  layout: 'admin'
})

const orders = ref([])
const userStore = useUserStore()
const { isSuperAdmin, role } = storeToRefs(userStore)
const showUserDialog = ref(false)
const showCancelDialog = ref(false)
const showProductStatusDialog = ref(false)
const showOrderStatusDialog = ref(false)
const showManufacturerDialog = ref(false)
const selectedOrder = ref({})
const orderToCancel = ref(null)
const selectedProduct = ref({})
const selectedProductStatus = ref('')
const selectedOrderStatus = ref('')
const cancelReason = ref('')
const productCancelReason = ref('')
const manufacturer = ref({})
const counter = ref(60)
const autoUpdateEnabled = ref(true)
let intervalId = null

const productStatusOptions = ['未確認', '拒絕', '接受', '已送出']
const orderStatusOptions = ['未確認', '商家取消訂單', '已接收訂單', '商品已送出', '訂單完成']

const commonColumns = [
  { name: 'oid', required: true, label: '訂單編號', align: 'left', field: row => row.oid, format: val => `${val}`, sortable: true },
  { name: 'date', align: 'left', label: '日期', field: row => new Date(row.date).toLocaleDateString(), sortable: true },
  { name: 'totalPrice', align: 'left', label: '金額', field: row => row.totalPrice, sortable: true },
  { name: 'products', align: 'left', label: '商品/商品狀態異動(廠商)', field: 'products', sortable: false },
  { name: 'user', align: 'left', label: '用戶', field: 'user_account', sortable: true },
  { name: 'status', align: 'left', label: '訂單狀態/更改(管理者)', field: 'status', sortable: true },
  { name: 'comment', align: 'left', label: '備註', field: 'comment', sortable: false }
]

const adminColumns = [
  ...commonColumns,
  { name: 'manufacturer', align: 'left', label: '廠商名稱', field: 'manufacturer_name', sortable: true },
  { name: 'cancel', align: 'left', label: '操作', field: 'cancel', sortable: false }
]

const computedColumns = computed(() => (isSuperAdmin.value ? adminColumns : commonColumns))

const canUpdateProduct = computed(() => role.value === 1)

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

let previousOrders = []

const fetchOrders = async () => {
  try {
    const { data } = await apiAuth.get('/orders/all', {
      params: {
        uid: userStore.uid
      }
    })
    const tempOrders = await Promise.all(
      data.result.map(async order => {
        const products = await Promise.all(
          order.products.map(async item => {
            const { data: productData } = await apiAuth.get(`/products/${item.product_name}`)
            return {
              ...item,
              name: productData.success ? productData.result.name : '未知商品',
              manufacturer_name: productData.success ? productData.result.company_name : '未知廠商',
              cancelReason: item.cancel_reason || ''
            }
          })
        )
        order.products = products
        order.totalPrice = products.reduce((total, product) => total + parseFloat(product.total_price), 0)

        return order
      })
    )

    // 保存當前訂單狀態
    const updateMessages = []

    if (autoUpdateEnabled.value && userStore.role === 2) {
      for (const order of tempOrders) {
        const previousOrder = previousOrders.find(o => o.oid === order.oid)
        const hasChanged = previousOrder && !order.products.every((product, index) => product.status === previousOrder.products[index].status)

        if (hasChanged) {
          const allAccepted = order.products.every(product => product.status === '接受')
          const allShipped = order.products.every(product => product.status === '已送出')
          const anyRejected = order.products.some(product => product.status === '拒絕')

          if (allAccepted) {
            const result = await updateOrderStatusAutomatically(order, '已接收訂單')
            if (result.success) {
              const orderLastFourDigits = result.orderId.slice(-4)
              updateMessages.push(`訂單編號(${orderLastFourDigits})狀態已自動更新為 已接收訂單`)
            } else {
              const orderLastFourDigits = result.orderId.slice(-4)
              updateMessages.push(`訂單編號(${orderLastFourDigits})狀態自動更新失敗`)
            }
          } else if (allShipped) {
            const result = await updateOrderStatusAutomatically(order, '商品已送出')
            if (result.success) {
              const orderLastFourDigits = result.orderId.slice(-4)
              updateMessages.push(`訂單編號(${orderLastFourDigits})狀態已自動更新為 商品已送出`)
            } else {
              const orderLastFourDigits = result.orderId.slice(-4)
              updateMessages.push(`訂單編號(${orderLastFourDigits})狀態自動更新失敗`)
            }
          } else if (anyRejected) {
            const orderLastFourDigits = order.oid.slice(-4)
            updateMessages.push(`訂單編號(${orderLastFourDigits})有廠商無法接受訂購`)
          }
        }
      }
    }

    orders.value = tempOrders
    counter.value = 60 // 重置

    // 彙整更新結果
    if (updateMessages.length > 0) {
      Swal.fire({
        icon: 'info',
        title: '更新結果',
        html: updateMessages.join('<br>'),
        backdrop: `rgba(0,0,123,0.4)
    url("https://i.pinimg.com/originals/e1/f2/3d/e1f23dfb401e68caf9e0d81e469a2b46.gif")
    center top
    no-repeat
  `
      })
    }

    previousOrders = JSON.parse(JSON.stringify(tempOrders))
  } catch (error) {
    console.error('Error fetching orders:', error)
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: '取得訂單失敗'
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
    await apiAuth.put('/orders/status', {
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
  selectedOrder.value = {
    ...order,
    user_name: order.name,
    user_phone: order.phone_number,
    company_name: order.company_name
  }
  showUserDialog.value = true
}

const openManufacturerDialog = async uid => {
  try {
    const { data } = await apiAuth.get(`/users/${uid}`)
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
  productCancelReason.value = product.cancelReason || ''
  showProductStatusDialog.value = true
}

const updateProductStatus = async () => {
  try {
    await apiAuth.put('/orders/products-status', {
      productId: selectedProduct.value.id,
      status: selectedProductStatus.value,
      cancelReason: selectedProductStatus.value === '拒絕' ? productCancelReason.value : ''
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
  if (role.value !== 2) {
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: '只有超級管理員可以更改訂單狀態'
    })
    return
  }

  try {
    await apiAuth.put('/orders/status', {
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

const updateOrderStatusAutomatically = async (order, newStatus) => {
  try {
    await apiAuth.put('/orders/status', {
      orderId: order.oid,
      status: newStatus
    })
    order.status = newStatus
    return { success: true, orderId: order.oid, newStatus }
  } catch (error) {
    console.error(`Error updating order status to ${newStatus}:`, error)
    return { success: false, orderId: order.oid }
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
</script>

<style lang="scss" scoped>
@import 'assets/setting/orders.scss';
</style>
