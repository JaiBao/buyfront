<!-- category-page.vue -->
<template>
  <q-page>
    <!-- 搜尋欄 -->
    <div class="search-bar">
      <!-- <div class="top">
        <div class="category">
          <img src="/index/categoryDrink.png" alt="手搖飲杯" class="pointer" @click="viewMore('手搖杯飲料')" />
          <img src="/index/categoryJapen.png" alt="日式料理" class="pointer" @click="viewMore('日式料理')" />
          <img src="/index/categoryChinese.png" alt="中式料理" class="pointer" @click="viewMore('中式料理')" />
          <img src="/index/categoryKorean.png" alt="韓式料理" class="pointer" @click="viewMore('韓式料理')" />
        </div>
      </div> -->
      <div class="bottom">
        <h3>{{ category }}</h3>
        <div class="searchs">
          <div class="selects">
            <q-input v-model="searchProduct" label="商品名稱" class="searchSelect" filled />
          </div>
          <div class="btns">
            <q-btn color="primary" @click="searchProducts">搜尋</q-btn>
            <q-btn color="red" @click="clearSearch">清空</q-btn>
          </div>
        </div>
      </div>
    </div>
    <!-- <div class="nomalTitle">
      <p>{{ category }}</p>
    </div> -->

    <!-- 產品列表 -->
    <div class="productCards" v-if="products.length > 0">
      <div v-for="product in products" :key="product.id" class="productCard">
        <ProductCard :product="product" />
      </div>
    </div>
    <div v-else class="row w-100 justify-center">
      <img src="/index/comingsoon.png" alt="comingsoon" />
    </div>
  </q-page>
</template>

<script setup>
import Swal from 'sweetalert2'
import { useNuxtApp } from '#app'

const route = useRoute()
const router = useRouter()
const category = ref(route.query.category || '未知分類')
const products = ref([])

// 搜尋欄
const searchCategory = ref(category.value)
const searchProduct = ref('')

const { $api } = useNuxtApp()

const fetchProducts = async () => {
  try {
    let query = `/products/search?category=${encodeURIComponent(category.value)}`
    const { data } = await $api.get(query)
    products.value = data.result
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: error?.response?.data?.message || '發生錯誤'
    })
  }
}

// 在分類頁面進行搜尋
const searchProducts = async () => {
  try {
    let query = `/products/search?category=${encodeURIComponent(searchCategory.value)}`
    if (searchProduct.value) {
      query += `&product=${encodeURIComponent(searchProduct.value)}`
    }
    const { data } = await $api.get(query)
    products.value = data.result
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: error?.response?.data?.message || '發生錯誤'
    })
  }
}

// 查看更多邏輯
const viewMore = category => {
  router.push({ name: 'category-page', query: { category } })
}

// 清空搜索
const clearSearch = () => {
  searchProduct.value = ''
  fetchProducts()
}

// 監聽路由
watch(
  () => route.query.category,
  newCategory => {
    category.value = newCategory
    searchCategory.value = newCategory
    fetchProducts()
  }
)

onMounted(() => {
  fetchProducts()
})
</script>

<style lang="scss" scoped>
@import 'assets/category.scss';
</style>
