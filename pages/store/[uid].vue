<template>
  <q-page>
    <div class="sotreMaterial">
      <div class="storeImg">
        <img :src="store.banner" alt="店家未上傳圖片" class="q-ma-md gt-xs" />
        <div class="store col-6">
          <div class="content column items-start w-100">
            <h4>{{ store.company_name }}</h4>
            <!-- <div class="description">
              <p v-html="store.description"></p>
            </div> -->
            <div class="material">
              <p>
                <q-icon name="schedule" size="md" />
                營業時間：
                {{ store.opening_hours }}
              </p>
              <p>
                <q-icon name="support_agent" size="md" />
                店家聯絡電話：
                {{ store.store_phone }}
              </p>
              <p>
                <q-icon name="location_on" size="md" />
                {{ store.address }}
              </p>

              <p v-html="store.description"></p>
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

    <!-- Dialog 彈出框 -->
    <q-dialog v-model="showDialog" persistent>
      <q-card class="showDialogCard">
        <!-- 關閉按鈕 -->
        <q-btn flat dense round icon="close" color="black" class="close-dialog-button" @click="showDialog = false" />

        <q-card-section>
          <div class="text-bold text-yellow-7 text-title">預訂須知</div>
          <ul>
            <li class="text-content">本平台提供一週前的預訂服務；若為一週內的訂單訂購可自行洽店家洽詢。</li>
            <li class="text-content">本平台系提供企業/團體訂餐服務為主，同一店家的起訂量為20份以上。</li>
            <li class="text-content">本平台所提供之外送服務費需以外送距離計算外送費用，依店家為主。</li>
            <li class="text-content">本平台提供僅提供各店家餐飲服務之預訂服務，付款方式以現金支付為主。若有大量餐點店家可能會要求訂購人預先以匯款方式預付訂金。</li>
            <li class="text-content">本須知如有未盡事宜，得由各店家所提供之服務為主，感謝您的配合，謝謝！</li>
          </ul>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import Swal from 'sweetalert2'

const { $api } = useNuxtApp()
const route = useRoute()
const uid = ref(route.params.uid)
const products = ref([])
const store = ref({})
const tabs = ref([])
const selectedTab = ref('')
const showDialog = ref(false)

useHead({
  title: store.value.company_name || '北台灣企業餐飲團訂網｜店家',
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
      content: store.value.company_name || '北台灣企業餐飲團訂網｜店家'
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
      content: `https://www.beifoodorder.com/store/${uid.value}`
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

    //  product_tabs
    if (typeof data.result.product_tabs === 'string') {
      tabs.value = data.result.product_tabs.split(',')
    } else {
      tabs.value = []
    }

    selectedTab.value = tabs.value[0] || ''
    //console.log('Tabs:', tabs.value)
    //console.log('Selected Tab:', selectedTab.value)
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: '取得商家信息失敗'
    })
  }
}

// 過濾商品列表
const filteredProducts = computed(() => {
  return products.value.filter(product => product.tab === selectedTab.value)
})

onMounted(() => {
  fetchStoreData()
  showDialog.value = true // 頁面加載時顯示
})
</script>

<style lang="scss" scoped>
@import 'assets/store/[uid].scss';
</style>
