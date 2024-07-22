<template>
  <q-page>
    <div class="banner">
      <img v-if="store.banner" :src="store.banner" alt="無圖片或圖片載入失敗" />
    </div>
    <div id="store-products">
      <div cols="12">
        <h4 class="text-center">{{ store.company_name }} 的商品</h4>
      </div>
      <q-separator />
      <div class="productCards">
        <div v-for="product in products" :key="product.id" class="productCard">
          <ProductCard :product="product" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { api } from '/plugins/axios'
import { useRoute } from 'vue-router'
import Swal from 'sweetalert2'
import ProductCard from '/components/ProductCard.vue'

const route = useRoute()
const uid = ref(route.params.uid)
const products = ref([])
const store = ref({})

const fetchStoreData = async () => {
  // //console.log('Fetching store data for UID:', uid.value)
  try {
    const { data } = await api.get(`/products/store/${uid.value}`)
    //console.log('Products data:', data)
    products.value = data.result
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: '取得商品失敗'
    })
  }

  try {
    const { data } = await api.get(`/users/store/${uid.value}`)
    //console.log('Store info data:', data)
    store.value = data.result
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: '取得商家信息失敗'
    })
  }
}

onMounted(fetchStoreData)
</script>

<style lang="scss" scoped>
@import 'assets/store/[uid].scss';
</style>
