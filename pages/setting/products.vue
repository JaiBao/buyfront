<template>
  <q-page>
    <div class="adminProducts">
      <h3 class="text-center">商品管理</h3>
      <q-separator />
      <div class="row w-100">
        <q-input class="col-2" v-model="search.name" label="搜尋名稱" outlined />
        <q-select class="col-2" v-model="search.sell" :options="sellOptions" label="狀態" outlined map-options emit-value />
        <q-input v-if="isSuperAdmin" v-model="search.manufacturerName" label="搜尋廠商名稱" outlined />
        <q-btn class="q-ma-sm" color="primary" @click="fetchProducts">搜尋</q-btn>
        <q-btn class="q-ma-sm" label="清空" color="secondary" @click="clearFilters" />
      </div>
      <div>
        <q-table :rows="products" :columns="computedColumns" row-key="id">
          <template v-slot:body-cell-image="props">
            <q-td :props="props">
              <img :src="props.row.image" width="50" height="50" />
            </q-td>
          </template>
          <template v-slot:body-cell-price="props">
            <q-td :props="props">${{ props.row.price }}</q-td>
          </template>
          <template v-slot:body-cell-sell="props">
            <q-td :props="props">
              {{ props.row.sell ? '上架' : '下架' }}
            </q-td>
          </template>
          <template v-slot:body-cell-manufacturer_name="props">
            <q-td :props="props">
              {{ props.row.manufacturer_name }}
            </q-td>
          </template>
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat icon="edit" @click="openDialog(props.row.id)" />
            </q-td>
          </template>
          <template v-slot:bottom>
            <div class="row w-100 justify-end">
              <q-pagination
                v-model="pagination.page"
                :max="pagination.totalPages"
                @update:model-value="fetchProducts"
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
      <q-dialog v-model="form.dialog" persistent>
        <q-card>
          <q-card-section>
            <div class="text-h6">{{ form.id ? '編輯商品' : '新增商品' }}</div>
          </q-card-section>
          <q-form @submit.prevent="submit">
            <q-card-section>
              <q-input filled v-model="form.name" label="名稱" :rules="[rules.required]" />
              <q-input filled v-model="form.price" type="number" label="價格" :rules="[rules.required, rules.price]" />
              <q-input filled v-model="form.description" type="textarea" label="說明" :rules="[rules.required]" />
              <q-select filled v-model="form.category" :options="categories" label="分類" :rules="[rules.required]" />
              <q-checkbox v-model="form.sell" label="上架" />
              <div>
                <input type="file" @change="handleFileUpload" ref="fileInput" />
                <img v-if="imagePreview" :src="imagePreview" alt="Image Preview" width="100" />
              </div>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat label="取消" color="negative" @click="form.dialog = false" />
              <q-btn flat label="送出" type="button" color="primary" :loading="form.loading" @click="submit" />
            </q-card-actions>
          </q-form>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { apiAuth } from '/plugins/axios'
import Swal from 'sweetalert2'
import { useUserStore } from '/stores/user'
import { storeToRefs } from 'pinia'

definePageMeta({
  layout: 'admin'
})

const categories = ['中式料理', '韓式料理', '日式料理', '手搖杯飲料', '其他']
const sellOptions = [
  { label: '全部', value: undefined },
  { label: '上架', value: 1 },
  { label: '下架', value: 0 }
]
const rules = {
  required: value => !!value || '欄位必填',
  price: value => value >= 0 || '價格錯誤'
}

const products = ref([])
const imagePreview = ref(null)
const userStore = useUserStore()
const { isSuperAdmin } = storeToRefs(userStore)

const form = reactive({
  id: '',
  name: '',
  price: 0,
  description: '',
  image: null,
  sell: false,
  category: '',
  valid: false,
  loading: false,
  dialog: false
})

const search = reactive({
  name: '',
  sell: undefined,
  manufacturerName: ''
})

const clearFilters = () => {
  search.value = {
    name: '',
    sell: undefined,
    manufacturerName: ''
  }
  fetchProducts()
}

const pagination = reactive({
  page: 1,
  totalPages: 1
})

const columns = [
  { name: 'image', required: true, label: '圖片', align: 'left', field: row => row.image, sortable: false },
  { name: 'name', required: true, label: '名稱', align: 'left', field: row => row.name, sortable: true },
  { name: 'price', required: true, label: '價格', align: 'left', field: row => row.price, sortable: true },
  { name: 'sell', required: true, label: '狀態', align: 'left', field: row => row.sell, sortable: true },
  { name: 'manufacturer_name', required: true, label: '廠商', align: 'left', field: row => row.manufacturer_name, sortable: true },
  { name: 'actions', label: '管理', align: 'right', field: 'actions', sortable: false }
]

const computedColumns = computed(() => {
  if (isSuperAdmin.value) {
    return columns
  }
  return columns.filter(col => col.name !== 'manufacturer_name')
})

const fetchProducts = async () => {
  try {
    const endpoint = isSuperAdmin.value ? '/products/all' : '/products/me'
    const { data } = await apiAuth.get(endpoint, {
      params: {
        uid: userStore.uid,
        page: pagination.page,
        name: search.name,
        sell: search.sell,
        manufacturerName: search.manufacturerName
      }
    })
    if (!data.success) {
      throw new Error(data.message)
    }
    products.value = data.result
    pagination.totalPages = data.totalPages
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: '無法加載產品數據'
    })
  }
}

const openDialog = idx => {
  if (idx === -1) {
    form.id = ''
    form.name = ''
    form.price = 0
    form.description = ''
    form.image = null
    form.sell = false
    form.category = ''
    form.valid = false
    form.loading = false
    imagePreview.value = null
  } else {
    const product = products.value.find(p => p.id === idx)
    form.id = product.id
    form.name = product.name
    form.price = product.price
    form.description = product.description
    form.image = null
    form.sell = product.sell === 1 // 轉一下
    form.category = product.category
    form.valid = false
    form.loading = false
    imagePreview.value = product.image
  }
  form.dialog = true
}

const handleFileUpload = event => {
  const file = event.target.files[0]
  if (file) {
    form.image = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

const submit = async () => {
  form.valid = true

  if (!form.name || !form.price || !form.description || !form.category) {
    form.valid = false
    return
  }

  form.loading = true

  const fd = new FormData()
  fd.append('name', form.name)
  fd.append('price', form.price)
  fd.append('description', form.description)
  if (form.image) {
    fd.append('image', form.image)
  }
  fd.append('sell', form.sell ? 1 : 0) // 轉一下
  fd.append('category', form.category)
  fd.append('uid', userStore.uid) // 傳入 uid

  try {
    if (!form.id) {
      await apiAuth.post('/products', fd)
    } else {
      // 不要覆盖图片路径，如果没有上传新图片
      if (form.image) {
        fd.append('image', form.image)
      }
      await apiAuth.patch(`/products/${form.id}`, fd)
    }
    await fetchProducts()
    form.dialog = false
    Swal.fire({
      icon: 'success',
      title: '成功',
      text: form.id ? '編輯成功' : '新增成功'
    })
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: error?.response?.data?.message || '發生錯誤'
    })
  }

  form.loading = false
}

onMounted(fetchProducts)
watch(pagination, fetchProducts, { deep: true })
</script>

<style lang="scss" scoped>
@import 'assets/setting/products.scss';
</style>
