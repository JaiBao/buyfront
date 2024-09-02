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
