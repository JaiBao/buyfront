<!-- components/StoreCard.vue -->
<template>
  <q-card class="card-store">
    <img :src="store.cover" alt="店家未上傳圖片" />

    <q-card-section class="name">
      <p>
        {{ store.company_name }}
      </p>
    </q-card-section>
    <q-card-section class="description">
      <p v-html="store.description"></p>
    </q-card-section>

    <q-card-actions class="btn">
      <q-btn :to="`/store/${store.uid}`" class="w-100 orderBtn">查看菜單</q-btn>
    </q-card-actions>
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
