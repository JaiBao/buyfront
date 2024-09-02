<template>
  <q-page>
    <div class="sotreMaterial">
      <div class="storeImg row justify-between">
        <img :src="store.cover" alt="店家未上傳圖片" class="col-5 q-ma-md" />
        <div class="store col-6">
          <div class="content column items-start w-100">
            <h4>{{ store.company_name }}</h4>
            <!-- <div class="description">
              <p v-html="store.description"></p>
            </div> -->
            <div class="material">
              <p>
                <q-icon name="location_on" size="md" />
                {{ store.address }}
              </p>
              <p>
                <q-icon name="schedule" size="md" />
                營業時間
                {{ store.opening_hours }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 顯示店家 tabs -->
      <q-tabs v-model="selectedTab" class="text-bold" active-color="yellow-6" indicator-color="yellow-6" align="left">
        <q-tab v-for="tab in tabs" :key="tab" :name="tab" :label="tab" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="selectedTab" animated transition-prev="slide-right" transition-next="slide-left">
        <q-tab-panel v-for="tab in tabs" :key="tab" :name="tab">
          <div class="productCards">
            <div v-for="product in filteredProducts" :key="product.id" class="productCard">
              <StoreProductCard :product="product" />
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script setup>
import Swal from 'sweetalert2'

const { $api } = useNuxtApp()
const route = useRoute()
const uid = ref(route.params.uid)
const products = ref([])
const store = ref({})
const tabs = ref([]) // 用于存储 tabs 信息
const selectedTab = ref('') // 当前选中的 tab

const fetchStoreData = async () => {
  try {
    const { data } = await $api.get(`/products/store/${uid.value}`)
    products.value = data.result
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: '取得商品失敗'
    })
  }

  try {
    const { data } = await $api.get(`/users/store/${uid.value}`)
    store.value = data.result

    // 使用正确的 product_tabs 字段名
    if (typeof data.result.product_tabs === 'string') {
      tabs.value = data.result.product_tabs.split(',')
    } else {
      tabs.value = []
    }

    selectedTab.value = tabs.value[0] || ''
    console.log('Tabs:', tabs.value)
    console.log('Selected Tab:', selectedTab.value)
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: '取得商家信息失敗'
    })
  }
}

// 过滤商品列表以匹配选中的 tab
const filteredProducts = computed(() => {
  return products.value.filter(product => product.tab === selectedTab.value)
})

onMounted(fetchStoreData)
</script>

<style lang="scss" scoped>
@import 'assets/store/[uid].scss';
</style>
