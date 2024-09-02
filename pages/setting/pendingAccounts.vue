<!-- pendingAccounts.vue -->
<template>
  <q-page>
    <div class="accountsTable">
      <div>
        <h3 class="text-center">待審核廠商</h3>
      </div>
      <q-separator />
      <div class="row w-100">
        <q-input class="col-2" v-model="search.account" label="搜尋帳號" outlined />
        <q-input class="col-2" v-model="search.name" label="搜尋名稱" outlined />
        <q-input class="col-2" v-model="search.phoneNumber" label="搜尋手機" outlined />
        <q-btn class="q-ma-sm" color="primary" @click="onSearch">搜尋</q-btn>
        <q-btn class="q-ma-sm" label="清空" color="secondary" @click="clearFilters" />
      </div>
      <div>
        <q-table :rows="pendingAccounts" :columns="columns" row-key="id" :rows-per-page-options="[5, 10, 20, 50]" :pagination="pagination">
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat @click="approveAccount(props.row.id)" color="primary">
                <q-icon name="check_circle" />
              </q-btn>
              <q-btn flat @click="rejectAccount(props.row.id)" color="negative">
                <q-icon name="highlight_off" />
              </q-btn>
            </q-td>
          </template>
          <template v-slot:bottom>
            <div class="row w-100 justify-end">
              <q-pagination
                v-model="pagination.page"
                :max="pagination.totalPages"
                @update:model-value="fetchPendingAccounts"
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
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import Swal from 'sweetalert2'
import { usePendingCountStore } from '/stores/pendingCountStore'
const { $apiAuth } = useNuxtApp()
definePageMeta({
  layout: 'admin'
})

const pendingAccounts = ref([])

const columns = [
  { name: 'account', label: '帳號', align: 'left', field: 'account', sortable: true },
  { name: 'name', label: '名稱', align: 'left', field: 'name', sortable: true },
  { name: 'phoneNumber', label: '手機號碼', align: 'left', field: 'phone_number', sortable: true },
  { name: 'companyName', label: '公司名稱', align: 'left', field: 'company_name', sortable: true },
  { name: 'taxId', label: '統編', align: 'left', field: 'tax_id', sortable: true },
  { name: 'actions', label: '操作', align: 'center', field: 'actions', sortable: false }
]

const search = reactive({
  account: '',
  name: '',
  phoneNumber: ''
})

const pagination = reactive({
  page: 1,
  rowsPerPage: 10, // 每頁顯示的行數
  totalPages: 1
})

const pendingCountStore = usePendingCountStore()
const { fetchPendingCount } = pendingCountStore

const fetchPendingAccounts = async () => {
  try {
    const { data } = await $apiAuth.get('/users/pending-merchants', {
      params: {
        page: pagination.page,
        account: search.account,
        name: search.name,
        phoneNumber: search.phoneNumber
      }
    })
    pendingAccounts.value = data.result
    pagination.totalPages = data.totalPages
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: '無法獲取待審核帳號'
    })
  }
}

const clearFilters = () => {
  search.account = ''
  search.name = ''
  search.phoneNumber = ''
  pagination.page = 1
  fetchPendingAccounts()
}

const onSearch = () => {
  pagination.page = 1
  fetchPendingAccounts()
}

const approveAccount = async id => {
  try {
    await $apiAuth.post('/users/approve-merchant', { id })
    Swal.fire({
      icon: 'success',
      title: '成功',
      text: '帳號審核通過'
    })
    fetchPendingAccounts()
    fetchPendingCount()
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: '帳號審核失敗'
    })
  }
}

const rejectAccount = async id => {
  try {
    await $apiAuth.post('/users/reject-merchant', { id })
    Swal.fire({
      icon: 'success',
      title: '成功',
      text: '帳號已拒絕'
    })
    fetchPendingAccounts()
    fetchPendingCount()
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: '帳號拒絕失敗'
    })
  }
}

onMounted(fetchPendingAccounts)
watch(pagination, fetchPendingAccounts, { deep: true })
</script>

<style lang="scss" scoped>
@import 'assets/setting/pending.scss';
</style>
