<template>
  <q-page>
    <div class="stores">
      <div class="nomalTitle">
        <p>全部推薦店家</p>
      </div>

      <div v-if="stores.length > 0" class="storeCards">
        <div v-for="store in stores" :key="store.company_name" class="storeCard">
          <StoreCard :store="store" />
        </div>
      </div>
      <div v-else class="row w-100 justify-center">
        <h5>目前無相符店家，敬請期待</h5>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import StoreCard from '/components/StoreCard.vue'
import Swal from 'sweetalert2'
const stores = ref([])

useHead({
  title: '北台灣企業餐飲團訂網｜推薦店家',
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' },
    // Description Meta Tag
    {
      name: 'description',
      content:
        '北台灣企業餐飲團訂網平台為整合各大服務企業團體餐點的預訂網站，在這裡無論團體便當外送、會議盒餐外送、下午茶餐盒外送、甜品外送、手搖飲外送，在這裡都可輕鬆預訂！'
    },
    // Open Graph
    {
      property: 'og:title',
      content: '北台灣企業餐飲團訂網｜推薦店家'
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
      content: 'https://www.beifoodorder.com/stores-page'
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

onMounted(() => {
  fetchStores()
})
</script>

<style lang="scss" scoped>
@import 'assets/stores.scss';
</style>
