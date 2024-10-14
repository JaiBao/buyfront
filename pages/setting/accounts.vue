<!-- setting/accounts.vue -->
<template>
  <q-page>
    <div class="accounts">
      <div class="row items-center nomalTitle3 justify-start">
        <p class="text-center">帳號管理</p>
      </div>

      <div class="search">
        <q-input :class="[search.account ? 'haveText' : 'noText']" class="q-mr-sm searchInput" v-model="search.account" label="搜尋帳號" outlined />
        <q-input :class="[search.name ? 'haveText' : 'noText']" class="q-mr-sm searchInput" v-model="search.name" label="搜尋名稱" outlined />
        <q-input :class="[search.phoneNumber ? 'haveText' : 'noText']" class="q-mr-sm searchInput" v-model="search.phoneNumber" label="搜尋手機" outlined />
        <q-select
          :class="[search.role ? 'haveText' : 'noText']"
          class="q-mr-sm searchInput"
          v-model="search.role"
          :options="roleOptions"
          label="角色"
          outlined
          emit-value
          map-options />
        <q-btn class="q-ma-sm searchBtn" @click="onSearch" color="yellow-7" text-color="black">搜尋</q-btn>
        <q-btn class="q-ma-sm searchBtn" label="清空" @click="clearFilters" color="yellow-7" text-color="black" />
      </div>
      <div>
        <q-table :rows="users" :columns="columns" row-key="uid" :rows-per-page-options="[5, 10, 20, 50]" :pagination="pagination" class="accountsTable">
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat @click="openEditDialog(props.row)">
                <q-icon name="edit" color="primary" />
              </q-btn>
              <q-btn flat @click="openResetPasswordDialog(props.row)">
                <q-icon color="green" name="lock_reset" />
              </q-btn>
            </q-td>
          </template>
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-icon size="sm" :name="props.row.status ? 'check_circle' : 'highlight_off'" :color="props.row.status ? 'green' : 'red'" />
            </q-td>
          </template>
          <template v-slot:bottom>
            <div class="row w-100 justify-end">
              <q-pagination
                v-model="pagination.page"
                :max="pagination.totalPages"
                @update:model-value="fetchUsers"
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

      <!-- 編輯用戶資料Dialog -->
      <q-dialog v-model="showEditDialog" persistent>
        <q-card>
          <q-card-section>
            <div class="text-h6">修改用戶資料</div>
          </q-card-section>
          <q-card-section>
            <q-input v-model="editForm.account" label="帳號" disabled />
            <q-input v-model="editForm.name" label="名稱" />
            <q-input v-model="editForm.email" label="信箱" />
            <q-input v-model="editForm.phoneNumber" label="手機" />
            <q-input v-model="editForm.address" label="地址" />
            <q-input v-model="editForm.companyName" label="公司名稱" />
            <q-input v-model="editForm.taxId" label="統編" />
            <q-select v-model="editForm.role" :options="roleOptions" label="權限" map-options emit-value />
            <q-toggle v-model="editForm.status" label="啟用" />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="取消" color="negative" @click="showEditDialog = false" />
            <q-btn flat label="儲存" color="primary" @click="saveEdit" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- 重置密碼對話框 -->
      <q-dialog v-model="showResetPasswordDialog" persistent>
        <q-card>
          <q-card-section>
            <div class="text-h6">重置密碼</div>
          </q-card-section>
          <q-card-section>
            <q-input v-model="resetPasswordForm.newPassword" label="新密碼" type="password" :rules="[rules.required]" />
            <q-input v-model="resetPasswordForm.confirmPassword" label="確認新密碼" type="password" :rules="[rules.required, rules.matchPassword]" />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="取消" color="negative" @click="showResetPasswordDialog = false" />
            <q-btn flat label="重置" color="primary" @click="resetPassword" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import Swal from 'sweetalert2'

useHead({
  title: '北台灣企業餐飲團訂網｜設定',
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
      content: '北台灣企業餐飲團訂網｜設定'
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
      content: 'https://www.beifoodorder.com/setting/accounts'
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

const users = ref([])
const showEditDialog = ref(false)
const showResetPasswordDialog = ref(false) // 新增
const editForm = ref({
  uid: '',
  account: '',
  name: '',
  email: '',
  phoneNumber: '',
  address: '',
  companyName: '',
  role: 0,
  status: true,
  taxId: ''
})

const resetPasswordForm = reactive({
  // 新增
  uid: '',
  newPassword: '',
  confirmPassword: ''
})

const rules = {
  // 新增
  required: val => !!val || '此欄位必填',
  matchPassword: val => val === resetPasswordForm.newPassword || '密碼不匹配'
}

const search = reactive({
  account: '',
  name: '',
  phoneNumber: '',
  role: undefined
})

const pagination = reactive({
  page: 1,
  rowsPerPage: 10, // 每頁顯示的行數
  totalPages: 1
})

const columns = [
  { name: 'uid', label: 'UID', align: 'left', field: 'uid', sortable: true },
  { name: 'account', label: '帳號', align: 'left', field: 'account', sortable: true },
  { name: 'name', label: '名稱', align: 'left', field: 'name', sortable: true },
  { name: 'role', label: '權限', align: 'left', field: row => roleOptions.find(option => option.value === row.role)?.label || row.role, sortable: true },
  { name: 'status', label: '狀態', align: 'center', field: 'status', sortable: false },
  { name: 'actions', label: '操作', align: 'center', field: 'actions', sortable: false }
]

const roleOptions = [
  { label: '所有角色', value: undefined },
  { label: '會員', value: 0 },
  { label: '廠商', value: 1 },
  { label: '管理者', value: 2 }
]

const fetchUsers = async () => {
  try {
    const { data } = await $apiAuth.get('/users/all', {
      params: {
        page: pagination.page,
        account: search.account,
        name: search.name,
        phoneNumber: search.phoneNumber,
        role: search.role
      }
    })
    if (data.success) {
      users.value = data.result
      pagination.totalPages = data.totalPages
    } else {
      Swal.fire({ icon: 'error', title: '失敗', text: data.message })
    }
  } catch (error) {
    Swal.fire({ icon: 'error', title: '失敗', text: '無法取得用戶資料' })
  }
}

const clearFilters = () => {
  search.account = ''
  search.name = ''
  search.phoneNumber = ''
  search.role = undefined
  fetchUsers()
}

const onSearch = () => {
  pagination.page = 1
  fetchUsers()
}

const openEditDialog = user => {
  editForm.value = {
    ...user,
    status: user.status === 1,
    phoneNumber: user.phone_number,
    companyName: user.company_name,
    taxId: user.tax_id,
    role: user.role
  }
  showEditDialog.value = true
}

const openResetPasswordDialog = user => {
  // 新增
  resetPasswordForm.uid = user.uid
  resetPasswordForm.newPassword = ''
  resetPasswordForm.confirmPassword = ''
  showResetPasswordDialog.value = true
}

const saveEdit = async () => {
  if (!editForm.value.phoneNumber) {
    Swal.fire({ icon: 'error', title: '失敗', text: '手機號碼不能為空' })
    return
  }

  try {
    const { uid, role, password, ...userData } = editForm.value // 排除 password 欄位
    userData.status = userData.status ? 1 : 0
    userData.role = role

    const { data } = await $apiAuth.put(`/users/update/${uid}`, userData)
    if (data.success) {
      Swal.fire({
        icon: 'success',
        title: '成功',
        text: '資料已更新',
        backdrop: `rgba(0,0,123,0.4)
    url("https://i.gifer.com/17xo.gif")
   left center
    no-repeat
  `
      })
      showEditDialog.value = false
      fetchUsers()
    } else {
      Swal.fire({ icon: 'error', title: '失敗', text: data.message })
    }
  } catch (error) {
    Swal.fire({ icon: 'error', title: '失敗', text: '無法更新用戶資料' })
  }
}

const resetPassword = async () => {
  // 新增
  if (resetPasswordForm.newPassword !== resetPasswordForm.confirmPassword) {
    Swal.fire({ icon: 'error', title: '失敗', text: '密碼不匹配' })
    return
  }

  try {
    const { uid, newPassword } = resetPasswordForm
    const { data } = await $apiAuth.put(`/users/reset-password/${uid}`, { newPassword })
    if (data.success) {
      Swal.fire({
        icon: 'success',
        title: '成功',
        text: '密碼已重置'
      })
      showResetPasswordDialog.value = false
    } else {
      Swal.fire({ icon: 'error', title: '失敗', text: data.message })
    }
  } catch (error) {
    Swal.fire({ icon: 'error', title: '失敗', text: '無法重置密碼' })
  }
}

onMounted(fetchUsers)
</script>

<style lang="scss" scoped>
@import 'assets/setting/accounts.scss';
</style>
