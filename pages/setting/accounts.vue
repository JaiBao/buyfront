<template>
  <q-page>
    <div class="accountsTable">
      <div>
        <h3 class="text-center">帳號管理</h3>
      </div>
      <q-separator />
      <div>
        <q-table :rows="users" :columns="columns" row-key="uid">
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat @click="openEditDialog(props.row)">
                <q-icon name="edit" />
              </q-btn>
            </q-td>
          </template>
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-icon size="sm" :name="props.row.status ? 'check_circle' : 'highlight_off'" :color="props.row.status ? 'green' : 'red'" />
            </q-td>
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
            <q-input v-model="editForm.password" label="密碼" type="password" />
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
    </div>
  </q-page>
</template>

<script setup>
import { apiAuth } from '/plugins/axios'
import Swal from 'sweetalert2'

definePageMeta({
  layout: 'admin'
})

const users = ref([])
const showEditDialog = ref(false)
const editForm = ref({
  uid: '',
  account: '',
  password: '',
  name: '',
  email: '',
  phoneNumber: '',
  address: '',
  companyName: '',
  role: 0,
  status: true,
  taxId: ''
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
  { label: '會員', value: 0 },
  { label: '廠商', value: 1 },
  { label: '管理者', value: 2 }
]

const fetchUsers = async () => {
  try {
    const { data } = await apiAuth.get('/users/all')
    if (data.success) {
      users.value = data.result
    } else {
      Swal.fire({ icon: 'error', title: '失敗', text: data.message })
    }
  } catch (error) {
    Swal.fire({ icon: 'error', title: '失敗', text: '無法取得用戶資料' })
  }
}

const openEditDialog = user => {
  editForm.value = {
    ...user,
    password: '',
    status: user.status === 1,
    phoneNumber: user.phone_number,
    companyName: user.company_name,
    taxId: user.tax_id,
    role: user.role
  }
  showEditDialog.value = true
}

const saveEdit = async () => {
  if (!editForm.value.phoneNumber) {
    Swal.fire({ icon: 'error', title: '失敗', text: '手機號碼不能為空' })
    return
  }

  try {
    const { uid, role, ...userData } = editForm.value
    userData.status = userData.status ? 1 : 0
    userData.role = role

    const { data } = await apiAuth.put(`/users/update/${uid}`, userData)
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

onMounted(fetchUsers)
</script>

<style lang="scss" scoped>
@import 'assets/setting/accounts.scss';
</style>
