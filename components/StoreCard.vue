<!-- components/StoreCard.vue
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
</style> -->

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
      <p v-html="truncatedDescription"></p>
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

// 字數限制
const truncatedDescription = computed(() => {
  const description = props.store?.description
  if (!description || typeof description !== 'string') {
    return '' // 如果 description 不存在或不是字串，返回空字串
  }

  // 移除所有 HTML 標籤，僅保留文本，進行字數截斷
  const plainText = description.replace(/<\/?[^>]+(>|$)/g, '')

  // 重新構造 HTML 並截斷
  return plainText.length > 70 ? plainText.substring(0, 70) + '...' : description
})
</script>

<style lang="scss" scoped>
@import 'assets/components/StoreCard.scss';
</style>
