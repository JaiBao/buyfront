<!-- index.vue -->
<template>
  <q-page>
    <!-- banner -->
    <section class="indexSection1">
      <bannerCarousel />
      <!-- <bannerAppCarousel class="lt-md" /> -->
    </section>

    <!-- 推薦店家 -->
    <div>
      <div class="stores">
        <div class="search-bar">
          <h3>今天想吃什麼？</h3>
          <div class="searchs">
            <div class="selects">
              <q-select
                v-model="selectedAddress"
                :options="addressoptions"
                option-label="name"
                option-value="id"
                label="縣市"
                filled
                class="searchSelect"
                @update:model-value="updateCityOptions" />
              <q-select v-model="selectedCity" :options="computedCityOptions" option-label="name" option-value="city_id" label="區域" filled class="searchSelect" />
              <q-select v-model="storeCategory" :options="categories" label="種類" filled class="searchSelect" />
              <q-input class="searchSelect" v-model="storeName" label="店家名稱" />
            </div>
            <div class="btns">
              <q-btn color="red" @click="clearStoreSearch">清空</q-btn>
              <q-btn color="yellow-5" @click="searchStores">搜尋</q-btn>
            </div>
          </div>
        </div>
        <!-- <q-separator /> -->
        <div class="nomalTitle">
          <p>推薦店家</p>
          <q-btn v-if="stores.length > 4" flat color="black" @click="viewMoreStores" class="seeMore">查看更多</q-btn>
        </div>

        <div v-if="stores.length > 0" class="storeCards">
          <div v-for="store in displayedStores" :key="store.company_name" class="storeCard">
            <StoreCard :store="store" />
          </div>
        </div>
        <div v-else class="row w-100 justify-center">
          <h5>目前無相符店家，敬請期待</h5>
        </div>
      </div>
      <!-- <q-separator /> -->
      <div class="supplys">
        <div class="category">
          <img src="/index/categoryDrink.png" alt="手搖飲杯" class="pointer" @click="viewMore('手搖杯飲料')" />
          <img src="/index/categoryJapen.png" alt="日式料理" class="pointer" @click="viewMore('日式料理')" />
          <img src="/index/categoryChinese.png" alt="中式料理" class="pointer" @click="viewMore('中式料理')" />
          <img src="/index/categoryKorean.png" alt="韓式料理" class="pointer" @click="viewMore('韓式料理')" />
        </div>
        <div class="supply">
          <q-card class="supplyCard">
            <div class="nomalTitle2"><p>嚴選新鮮食材供應商</p></div>
            <img src="/index/supply1.png" alt="供應商" />
            <div class="tags">
              <div class="tag">東昇米糧食品有限公司</div>
              <div class="tag">同正食品有限公司</div>
              <div class="tag">沛洋國際股份有限公司</div>
              <div class="tag">瑞福食品股份有限公司</div>
              <div class="tag">菁源生技股份有限公司</div>
            </div>
          </q-card>
          <q-card class="supplyCard">
            <div class="nomalTitle2"><p>餐盒包裝製造商</p></div>
            <img src="/index/supply2.png" alt="製造商" />
            <div class="tags">
              <div class="tag">萬鴻萬鴻貿易有限公司</div>
              <div class="tag">禾啓股份有限公司</div>
              <div class="tag">三麟彩色印刷股份有限公司</div>
              <div class="tag">雄豪野科技印刷有限公司</div>
            </div>
          </q-card>
        </div>
      </div>
      <!-- 產品 -->
      <!-- <div class="search-bar">
        <h3 color="white">產品今天想吃什麼？</h3>
        <div class="searchs">
          <div class="selects">
            <q-select color="grey" v-model="searchCategory" :options="categories" label="按分類搜尋" class="searchSelect" />
            <q-input class="searchSelect" v-model="searchProduct" label="按店家名稱搜尋" />
          </div>
          <div class="btns">
            <q-btn @click="search2">搜尋</q-btn>
            <q-btn @click="clearSearch">清空</q-btn>
          </div>
        </div>
      </div>
      <q-separator />

      <div class="productCards" v-if="products.length > 0">
        <div v-for="product in products" :key="product.id" class="productCard">
          <ProductCard :product="product" />
        </div>
      </div>
      <div v-else class="row w-100 justify-center">
           <img src="/index/comingsoon.png" alt="comingsoon" />
      </div> -->

      <!-- <q-separator /> -->

      <!-- 中式料理 -->
      <div class="nomalTitle">
        <p>中式料理</p>
        <q-btn flat color="black" @click="viewMore('中式料理')" class="seeMore">查看更多</q-btn>
      </div>
      <div class="productCards" v-if="productsChinese.length > 0">
        <div v-for="product in productsChinese" :key="product.id" class="productCard">
          <ProductCard :product="product" />
        </div>
      </div>
      <div v-else class="row w-100 justify-center">
        <img src="/index/comingsoon.png" alt="comingsoon" />
      </div>

      <!-- 韓式料理 -->
      <div class="nomalTitle">
        <p>韓式料理</p>
        <q-btn flat color="black" @click="viewMore('韓式料理')" class="seeMore">查看更多</q-btn>
      </div>
      <div class="productCards" v-if="productsKorean.length > 0">
        <div v-for="product in productsKorean" :key="product.id" class="productCard">
          <ProductCard :product="product" />
        </div>
      </div>
      <div v-else class="row w-100 justify-center">
        <img src="/index/comingsoon.png" alt="comingsoon" />
      </div>

      <!-- 日式料理 -->
      <div class="nomalTitle">
        <p>日式料理</p>
        <q-btn flat color="black" @click="viewMore('日式料理')" class="seeMore">查看更多</q-btn>
      </div>
      <div class="productCards" v-if="productsJapanese.length > 0">
        <div v-for="product in productsJapanese" :key="product.id" class="productCard">
          <ProductCard :product="product" />
        </div>
      </div>
      <div v-else class="row w-100 justify-center">
        <img src="/index/comingsoon.png" alt="comingsoon" />
      </div>

      <!-- 手搖杯飲料 -->
      <div class="nomalTitle">
        <p>手搖杯飲料</p>
        <q-btn flat color="black" @click="viewMore('手搖杯飲料')" class="seeMore">查看更多</q-btn>
      </div>
      <div class="productCards" v-if="productsDrinks.length > 0">
        <div v-for="product in productsDrinks" :key="product.id" class="productCard">
          <ProductCard :product="product" />
        </div>
      </div>
      <div v-else class="row w-100 justify-center">
        <img src="/index/comingsoon.png" alt="comingsoon" />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import Swal from 'sweetalert2'
import ProductCard from '/components/ProductCard.vue'
import StoreCard from '/components/StoreCard.vue'
import { useOrderAddress } from '/stores/orderAddress.js'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const isMobile = ref(false)
const products = ref([])
const stores = ref([])
const displayedStores = computed(() => stores.value.slice(0, 4)) // 只顯示前四個店家
const searchCategory = ref('')
const searchStore = ref('')
const searchProduct = ref('')
const storeCategory = ref('')
const storeName = ref('')
const selectedAddress = ref(null) // 縣市
const selectedCity = ref(null) // 區域
const categories = ['中式料理', '韓式料理', '日式料理', '手搖杯飲料', '其他']
// 用於存儲不同分類的產品
const productsChinese = ref([])
const productsKorean = ref([])
const productsJapanese = ref([])
const productsDrinks = ref([])

gsap.registerPlugin(ScrollTrigger)

const { addressoptions, cityOptions, updateCityOptions } = useOrderAddress()
watch(selectedAddress, newAddress => {
  if (newAddress && newAddress.id) {
    // 檢查 newAddress 是否為 null
    updateCityOptions(newAddress.id)
    selectedCity.value = null //更新要清空
  }
})

const { $api, $apiAuth } = useNuxtApp()

const computedCityOptions = computed(() => cityOptions.value)

const fetchProducts = async () => {
  try {
    const { data } = await $api.get('/products')
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
    const { data } = await $apiAuth.get('/users/stores')
    stores.value = data.result
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: error?.response?.data?.message || '發生錯誤'
    })
  }
}

const search2 = async () => {
  try {
    let query = '/products/search?'
    if (searchCategory.value) {
      query += `category=${encodeURIComponent(searchCategory.value)}&`
    }
    if (searchProduct.value) {
      // 添加產品名稱搜索條件
      query += `product=${encodeURIComponent(searchProduct.value)}`
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

// 通用的搜尋函數，接收分類名稱和產品存儲變量
const search = async (category, productList) => {
  try {
    let query = `/products/search?category=${encodeURIComponent(category)}`
    const { data } = await $api.get(query)
    productList.value = data.result.slice(0, 4) // 只顯示前四個產品
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: error?.response?.data?.message || '發生錯誤'
    })
  }
}

const searchStores = async () => {
  try {
    let query = '/users/stores/search?'
    if (storeCategory.value) {
      query += `category=${encodeURIComponent(storeCategory.value)}&`
    }
    if (storeName.value) {
      query += `store=${encodeURIComponent(storeName.value)}&`
    }
    if (selectedAddress.value) {
      query += `address=${encodeURIComponent(selectedAddress.value.name)}&`
    }
    if (selectedCity.value) {
      query += `city=${encodeURIComponent(selectedCity.value.name)}`
    }

    const { data } = await $apiAuth.get(query)
    stores.value = data.result
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

const clearStoreSearch = () => {
  storeCategory.value = ''
  storeName.value = ''
  selectedAddress.value = null
  selectedCity.value = null
  fetchStores()
}

onMounted(() => {
  AOS.init()
  // 定義螢幕寬度
  isMobile.value = window.innerWidth <= 992

  // 監聽螢幕寬度變化
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth <= 992
  })

  gsap.registerPlugin(ScrollTrigger)

  // nextTick()
  // animateImage()
  // 監聽調整效果
  // 初始化選擇器的值

  fetchProducts()
  fetchStores()
  search('中式料理', productsChinese)
  search('韓式料理', productsKorean)
  search('日式料理', productsJapanese)
  search('手搖杯飲料', productsDrinks)
})

// 查看更多邏輯
const viewMore = category => {
  const router = useRouter()
  router.push({ name: 'category-page', query: { category } })
}

const viewMoreStores = () => {
  const router = useRouter()
  router.push({ name: 'stores-page' }) // 跳轉到顯示全部推薦店家的頁面
}
</script>

<style lang="scss" scoped>
@import 'assets/index.scss';
</style>
