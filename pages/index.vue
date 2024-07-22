<!-- index.vue -->
<template>
  <q-page>
    <div>
      <div class="title">
        <h3 class="text-center">北台灣團購網</h3>
      </div>

      <div class="search-bar">
        <h3>今天我想來點</h3>
        <q-select v-model="searchCategory" :options="categories" placeholder="按分類搜尋" filled class="searchSelect" />
        <q-input v-model="searchStore" placeholder="按店家名稱搜尋" />
        <q-btn @click="search">搜尋</q-btn>
        <q-btn @click="clearSearch">清空</q-btn>
      </div>
      <q-separator />

      <div class="productCards" v-if="products.length > 0">
        <div v-for="product in products" :key="product.id" class="productCard">
          <ProductCard :product="product" />
        </div>
      </div>
      <div v-else class="row w-100 justify-center">
        <h5>目前無相符商品，敬請期待</h5>
      </div>

      <q-separator />

      <h3>推薦店家</h3>
      <div class="storeCards">
        <div v-for="store in stores" :key="store.company_name" class="storeCard">
          <StoreCard :store="store" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { api, apiAuth } from '/plugins/axios'
import Swal from 'sweetalert2'
import ProductCard from '/components/ProductCard.vue'
import StoreCard from '/components/StoreCard.vue'

const products = ref([])
const stores = ref([])
const searchCategory = ref('')
const searchStore = ref('')
const categories = ['中式料理', '韓式料理', '日式料理', '手搖杯飲料', '其他']

const fetchProducts = async () => {
  try {
    const { data } = await api.get('/products')
    products.value = data.result
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: error?.response?.data?.message || '發生錯誤'
    })
  }
}

const fetchStores = async () => {
  try {
    const { data } = await apiAuth.get('/users/stores') // 使用 apiAuth 以附带 token
    stores.value = data.result
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: error?.response?.data?.message || '發生錯誤'
    })
  }
}

const search = async () => {
  try {
    let query = '/products/search?'
    if (searchCategory.value) {
      query += `category=${encodeURIComponent(searchCategory.value)}&`
    }
    if (searchStore.value) {
      query += `store=${encodeURIComponent(searchStore.value)}`
    }

    const { data } = await api.get(query)
    products.value = data.result
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: error?.response?.data?.message || '發生錯誤'
    })
  }
}

const clearSearch = () => {
  searchCategory.value = ''
  searchStore.value = ''
  fetchProducts()
}

onMounted(() => {
  fetchProducts()
  fetchStores()
})
</script>

<style lang="scss" scoped>
@import 'assets/index.scss';
</style>
