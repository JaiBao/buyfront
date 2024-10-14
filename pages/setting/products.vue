<script setup>
import Swal from 'sweetalert2'
import { useUserStore } from '/stores/user'
import { storeToRefs } from 'pinia'
import { useCategoryStore } from '/stores/category'

useHead({
  title: '北台灣企業餐飲團訂網｜產品設定',
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
      content: '北台灣企業餐飲團訂網｜產品設定'
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
      content: 'https://www.beifoodorder.com/setting/products'
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
const { $api, $apiAuth } = useNuxtApp()
definePageMeta({
  layout: 'admin'
})

const showProductTabDialog = ref(false)
const loading = ref(false)

const categoryStore = useCategoryStore()
const categories = categoryStore.categories
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
const { isSuperAdmin, isAdmin } = storeToRefs(userStore)

const showOptionDialog = ref(false)
const optionForm = reactive({
  id: '', // 產品ID
  options: [
    {
      name: '', // 選項種類名稱
      values: [{ name: '', price: 0.0 }] // 選項及價錢
    }
  ]
})

// 打開增加選項對話框
const openOptionDialog = productId => {
  const product = products.value.find(p => p.id === productId)

  // 確認產品是否存在，並且有選項數據
  if (product && product.options && product.options.length > 0) {
    const options = []
    const groupedOptions = {}

    // 將同一種類的選項歸類在一起
    product.options.forEach(option => {
      if (!groupedOptions[option.name]) {
        groupedOptions[option.name] = {
          name: option.name,
          values: []
        }
      }
      groupedOptions[option.name].values.push({
        name: option.option_name,
        price: parseFloat(option.price)
      })
    })

    // 將分組後的選項種類和對應的選項填充到表單
    Object.keys(groupedOptions).forEach(key => {
      options.push(groupedOptions[key])
    })

    optionForm.options = options
  } else {
    // 如果沒有選項，初始化為空的表單
    optionForm.options = [{ name: '', values: [{ name: '', price: 0.0 }] }]
  }

  optionForm.id = productId
  showOptionDialog.value = true
}

// 新增選項種類
const addOptionCategory = () => {
  optionForm.options.push({ name: '', values: [{ name: '', price: 0.0 }] })
}

// 移除選項種類
const removeOptionCategory = index => {
  optionForm.options.splice(index, 1)
}

// 新增選項
const addOptionValue = index => {
  optionForm.options[index].values.push({ name: '', price: 0.0 })
}

// 移除單個選項
const removeOptionValue = (index, valueIndex) => {
  optionForm.options[index].values.splice(valueIndex, 1)
}

// 保存選項
const saveProductOptions = async () => {
  // 檢查選項表單，過濾掉空的選項種類或空的選項
  const validOptions = optionForm.options
    .filter(option => {
      // 選項種類名稱非空，並且至少有一個有效的選項值
      return option.name && option.values.some(value => value.name && value.price !== null && value.price !== undefined)
    })
    .map(option => {
      // 過濾掉空的選項值
      return {
        name: option.name,
        values: option.values.filter(value => value.name && value.price !== null && value.price !== undefined)
      }
    })

  // 如果沒有有效的選項，則不進行提交
  if (validOptions.length === 0) {
    Swal.fire({ icon: 'error', title: '失敗', text: '請填寫至少一個有效的選項種類和選項' })
    return
  }

  try {
    await $apiAuth.post('/products/addOptions', {
      productId: optionForm.id,
      options: validOptions
    })
    Swal.fire({ icon: 'success', title: '成功', text: '選項已成功添加' })
    showOptionDialog.value = false
    fetchProducts() // 刷新產品數據
  } catch (error) {
    Swal.fire({ icon: 'error', title: '失敗', text: error?.response?.data?.message || '添加選項時出現錯誤' })
  }
}

const form = reactive({
  id: '',
  name: '',
  price: 0,
  description: '',
  image: null,
  sell: false,
  category: '',
  tab: '', // 新增的 tab 属性
  valid: false,
  loading: false,
  dialog: false
})

const search = reactive({
  name: '',
  sell: undefined,
  manufacturerName: ''
})

const openProductTabDialog = () => {
  showProductTabDialog.value = true
}

const saveProductTabs = async () => {
  showProductTabDialog.value = false

  const productTabsString = form.productTabs.join(',')

  try {
    // 單獨調用 API 更新產品分類 tabs
    await $apiAuth.post('/users/updateProductTabs', {
      productTabs: productTabsString // 只提交 productTabs
    })
    Swal.fire({ icon: 'success', title: '成功', text: '產品分類已更新' })
  } catch (error) {
    Swal.fire({ icon: 'error', title: '失敗', text: error?.response?.data?.message || '產品分類更新失敗' })
  }
}

const addProductTab = () => {
  form.productTabs.push('')
}
const clearFilters = () => {
  search.name = ''
  search.sell = undefined
  search.manufacturerName = ''
  fetchProducts()
}

const pagination = reactive({
  page: 1,
  rowsPerPage: 10, // 每頁顯示的行數
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
    const { data } = await $apiAuth.get(endpoint, {
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

const fetchProductTabs = async () => {
  try {
    const { data } = await $apiAuth.get('/users/store-images')
    //console.log('API Response:', data)
    if (data.success) {
      if (typeof data.result.productTabs === 'string') {
        form.productTabs = data.result.productTabs.split(',')
      } else {
        form.productTabs = []
      }

      // 如果 message 是 "尚未建立商店檔案" 并且 `result.productTabs` 是空的，初始化
      if (data.message === '尚未建立商店檔案' && !form.productTabs.length) {
        form.productTabs = []
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: '失败',
        text: '無法獲取產品分類'
      })
    }
  } catch (error) {
    console.error('Error fetching product tabs:', error)
    Swal.fire({
      icon: 'error',
      title: '失败',
      text: error.response?.data?.message || '發生意外錯誤'
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
    form.tab = '' // 重置 tab 选择
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
    form.tab = product.tab || '' // 設置已有Tab
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

  if (!form.name || !form.price || !form.description || !form.category || !form.tab) {
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
  fd.append('tab', form.tab) // 新增的 tab

  try {
    if (!form.id) {
      // 只有在新增時傳入 uid
      fd.append('uid', userStore.uid)
      await $apiAuth.post('/products', fd)
    } else {
      await $apiAuth.patch(`/products/${form.id}`, fd)
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

onMounted(async () => {
  await fetchProducts()
  if (isAdmin.value) {
    await fetchProductTabs()
  }
})
watch(pagination, fetchProducts, { deep: true })
</script>

<template>
  <q-page>
    <div class="adminProducts">
      <div class="row items-center nomalTitle3 justify-start">
        <p class="text-center">商品管理</p>
      </div>

      <div class="search">
        <q-input label-color="dark" class="searchInput q-mr-sm" :class="[search.name ? 'haveText' : 'noText']" v-model="search.name" label="產品名稱" outlined />
        <q-select
          :class="[search.sell ? 'haveText' : 'noText']"
          class="searchInput q-mr-sm"
          v-model="search.sell"
          :options="sellOptions"
          label="狀態"
          outlined
          map-options
          emit-value />
        <q-input
          :class="[search.manufacturerName ? 'haveText' : 'noText']"
          class="searchInput q-mr-sm"
          v-if="isSuperAdmin"
          v-model="search.manufacturerName"
          label="廠商名稱"
          outlined />
        <q-btn class="q-mx-sm searchBtn" color="yellow-7" text-color="black" @click="fetchProducts">搜尋</q-btn>
        <q-btn class="q-mx-sm searchBtn" label="清空" color="yellow-7" text-color="black" @click="clearFilters" />
        <q-btn class="q-mx-sm searchBtn" color="yellow-7" text-color="black" @click="openDialog(-1)">新增商品</q-btn>
        <!-- 產品分類按钮 -->
        <q-btn @click="openProductTabDialog" label="設定產品分類" color="yellow-7" text-color="black" :loading="loading" class="q-mx-sm searchBtn" />
      </div>
      <div>
        <q-table :rows="products" :columns="computedColumns" row-key="id" :rows-per-page-options="[5, 10, 20, 50]" :pagination="pagination" class="productTable">
          <template v-slot:body-cell-image="props">
            <q-td :props="props">
              <img :src="props.row.image" width="128" height="90" />
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
              <q-btn color="primary" flat icon="edit" @click="openDialog(props.row.id)">編輯</q-btn>
              <q-btn color="secondary" flat icon="add" @click="openOptionDialog(props.row.id)">選項設定</q-btn>
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
                icon-next="fast_forward"
                color="grey-8"
                active-color="yellow-7" />
            </div>
          </template>
        </q-table>
      </div>
      <q-dialog v-model="form.dialog">
        <q-card>
          <q-card-section>
            <div class="text-h6">{{ form.id ? '編輯商品' : '新增商品' }}</div>
          </q-card-section>
          <q-form @submit.prevent="submit">
            <q-card-section>
              <q-input filled v-model="form.name" label="名稱" :rules="[rules.required]" />
              <q-input filled v-model="form.price" type="number" label="價格" :rules="[rules.required, rules.price]" />
              <q-editor filled v-model="form.description" type="textarea" label="說明" :rules="[rules.required]" />
              <q-select filled v-model="form.category" :options="categories" label="分類" :rules="[rules.required]" />
              <q-select filled v-model="form.tab" :options="form.productTabs" label="產品分類" :rules="[rules.required]" />
              <!-- 新增的 tab  -->
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
      <!-- 產品分類設定的對話框 -->
      <q-dialog v-model="showProductTabDialog" persistent>
        <q-card>
          <q-card-section>
            <div class="text-h6">產品分類設定</div>
          </q-card-section>

          <q-card-section>
            <div v-for="(tab, index) in form.productTabs" :key="index" class="row q-my-sm">
              <q-input v-model="form.productTabs[index]" label="分類名稱" outlined />
              <q-btn flat icon="delete" color="negative" @click="removeProductTab(index)" />
            </div>
            <q-btn flat icon="add" @click="addProductTab">新增分類</q-btn>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="取消" color="negative" @click="showProductTabDialog = false" />
            <q-btn flat label="確認" color="primary" @click="saveProductTabs" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog v-model="showOptionDialog">
        <q-card>
          <q-card-section>
            <div class="text-h6">增加選項</div>
          </q-card-section>

          <q-card-section>
            <!-- 選項種類 -->
            <div v-for="(option, index) in optionForm.options" :key="index" class="q-mb-sm">
              <q-card bordered class="q-pa-sm">
                <q-card-section>
                  <q-input v-model="option.name" label="選項種類名稱" />

                  <!-- 移除選項種類按鈕 -->
                  <q-btn flat icon="delete" color="negative" @click="removeOptionCategory(index)" label="刪除選項種類" />
                </q-card-section>

                <q-separator />

                <!-- 選項 -->
                <q-card-section>
                  <div v-for="(value, valueIndex) in option.values" :key="valueIndex" class="q-mb-sm">
                    <q-card bordered class="q-pa-sm">
                      <q-card-section>
                        <q-input v-model="value.name" label="選項名稱" />
                        <!-- <q-input v-model="value.price" type="number" label="加購價格" /> -->

                        <!-- 移除單個選項按鈕 -->
                        <q-btn flat icon="delete" color="negative" @click="removeOptionValue(index, valueIndex)" label="刪除選項" />
                      </q-card-section>
                    </q-card>
                  </div>

                  <!-- 新增選項按鈕 -->
                  <q-btn flat icon="add" @click="addOptionValue(index)" label="新增選項" />
                </q-card-section>
              </q-card>
            </div>

            <!-- 新增選項種類按鈕 -->
            <q-btn flat icon="add" @click="addOptionCategory" label="新增選項種類" />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="取消" color="negative" @click="showOptionDialog = false" />
            <q-btn flat label="確認" color="primary" @click="saveProductOptions" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>
<style lang="scss" scoped>
@import 'assets/setting/products.scss';
</style>
