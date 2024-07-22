<!-- components/StoreCard.vue -->
<template>
  <q-card class="card-store">
    <img :src="store.cover" alt="無圖片" />
    <q-card-section>
      <q-card-title class="row justify-center">
        <a :href="`/store/${store.uid}`" class="text-decoration-none text-primary">
          {{ store.company_name }}
        </a>
      </q-card-title>
      <q-card-section>
        <p>地址:{{ store.address }}</p>
      </q-card-section>
    </q-card-section>
  </q-card>
</template>

<script setup>
const props = defineProps({
  store: {
    type: Object,
    required: true
  }
})
</script>

<style lang="scss" scoped>
@import 'assets/components/StoreCard.scss';
</style>
