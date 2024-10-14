<!-- pendingAccounts.vue -->
<template>
  <q-page>
    <div class="peddings">
      <div class="row items-center nomalTitle3 justify-start">
        <p class="text-center">待審核廠商</p>
      </div>

      <div class="search row w-100">
        <q-input :class="[search.userName ? 'haveText' : 'noText']" class="searchInput q-mr-sm" v-model="search.account" label="搜尋帳號" outlined />
        <q-input :class="[search.name ? 'haveText' : 'noText']" class="searchInput q-mr-sm" v-model="search.name" label="搜尋名稱" outlined />
        <q-input :class="[search.phoneNumber ? 'haveText' : 'noText']" class="searchInput q-mr-sm" v-model="search.phoneNumber" label="搜尋手機" outlined />
        <q-btn class="q-mx-sm searchBtn" color="yellow-7" text-color="black" @click="onSearch">搜尋</q-btn>
        <q-btn class="q-mx-sm searchBtn" label="清空" color="yellow-7" text-color="black" @click="clearFilters" />
      </div>
      <div>
        <q-table class="peddingsTable" :rows="pendingAccounts" :columns="columns" row-key="id" :rows-per-page-options="[5, 10, 20, 50]" :pagination="pagination">
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
                icon-next="fast_forward"
                color="grey-8"
                active-color="yellow-7" />
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

useHead({
  title: '北台灣企業餐飲團訂網｜廠商審核',
  meta: [
    // Description Meta Tag
    {
      name: 'description',
      content:
        '北台灣企業餐飲團訂網平台為整合各大服務企業團體餐點的預訂網站，在這裡無論團體便當外送、會議盒餐外送、下午茶餐盒外送、甜品外送、手搖飲外送，在這裡都可輕鬆預訂！'
    },
    // Open Graph
    {
      property: 'og:title',
      content: '北台灣企業餐飲團訂網｜廠商審核'
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
      content: 'https://www.beifoodorder.com/setting/pedingAccounts'
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
