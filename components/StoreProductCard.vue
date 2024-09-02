<!-- components/ProductCard.vue -->
<template>
  <q-card class="card-product pointer" @click="openDialog">
    <div class="left">
      <div class="name">
        <p>
          {{ product.name }}
        </p>
      </div>
      <div class="content">
        <p class="pre" v-html="product.description"></p>
      </div>
      <p class="price">NT${{ product.price }}</p>
    </div>

    <div class="right">
      <img :src="product.image" />
    </div>
  </q-card>
  <q-dialog v-model="showDialog" class="productDialog">
    <q-card class="productDialogCard">
      <!-- 新增的關閉按鈕 -->
      <q-btn
        flat
        dense
        round
        icon="close"
        color="white"
        class="close-dialog-button"
        @click="closeDialog"
        :style="{ backgroundColor: 'rgba(0, 0, 0, 0.5)', borderColor: 'black' }" />

      <img :src="product.image" />
      <q-card-section class="content">
        <p class="name text-yellow-6">
          {{ product.name }}
          <!-- <span>${{ product.price }}</span> -->
        </p>
        <p class="pre" v-html="product.description"></p>
      </q-card-section>
      <div>
        <q-form @submit.prevent="submitCart" class="w-100">
          <div class="w-100 row justify-around items-center">
            <div class="quanitys row col-5 justify-between">
              <!-- - -->
              <q-btn flat round icon="remove" color="yellow-5" @click="decreaseQuantity" />

              <!-- 數量-->
              <q-input
                class="text-center col-6"
                v-model.number="quantity"
                type="number"
                label="數量"
                :rules="[rules.required, rules.number]"
                outlined
                hide-bottom-space />

              <!-- + -->
              <q-btn flat round icon="add" color="yellow-5" @click="increaseQuantity" />
            </div>

            <q-btn type="submit" icon="add_shopping_cart" color="yellow-5" class="col-6">加入購物車NT${{ totalPrice }}</q-btn>
          </div>
        </q-form>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useUserStore } from '/stores/user'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

console.log(props.product)

const user = useUserStore()
const { editCart } = user

const showDialog = ref(false)
const quantity = ref(1)

const rules = {
  required: value => !!value || '欄位必填',
  number: value => value > 0 || '數量錯誤'
}

const totalPrice = computed(() => quantity.value * props.product.price)

// 减少数量的函数
const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value -= 1
  }
}

// 增加数量的函数
const increaseQuantity = () => {
  quantity.value += 1
}

const openDialog = () => {
  quantity.value = 1
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
}

const submitCart = () => {
  if (quantity.value > 0) {
    editCart({ id: props.product.id, quantity: quantity.value, uid: props.product.uid, action: 'add' })
    showDialog.value = false
  }
}
</script>

<style lang="scss" scoped>
@import 'assets/components/StoreProductCard.scss';
</style>
