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
      <div class="contents">
        <q-card-section class="content">
          <p class="name text-yellow-6">
            {{ product.name }}
            <!-- <span>${{ product.price }}</span> -->
          </p>
          <p class="pre" v-html="product.description"></p>
        </q-card-section>

        <!-- 顯示產品選項 -->
        <div v-for="(option, index) in uniqueOptions" :key="index" class="product-option">
          <p class="option-title">{{ option.name }}</p>
          <!-- <q-radio
            v-for="(value, vIndex) in option.values"
            :key="vIndex"
            v-model="selectedOptions[option.name]"
            :label="value.value_name + ' (+NT$' + value.price + ')'"
            :val="value.value_name" /> -->
          <q-radio v-for="(value, vIndex) in option.values" :key="vIndex" v-model="selectedOptions[option.name]" :label="value.value_name" :val="value.value_name" />
        </div>

        <div>
          <q-form @submit.prevent="submitCart" class="w-100">
            <div class="w-100 row justify-around items-center">
              <div class="quanitys row col-5 justify-between">
                <!-- - -->
                <q-btn class="col-3" flat round icon="remove" color="yellow-5" @click="decreaseQuantity" />

                <!-- 數量-->
                <q-input
                  class="text-center col-5"
                  v-model.number="quantity"
                  type="number"
                  label="數量"
                  :rules="[rules.required, rules.number]"
                  outlined
                  hide-bottom-space />

                <!-- + -->
                <q-btn class="col-3" flat round icon="add" color="yellow-5" @click="increaseQuantity" />
              </div>

              <q-btn type="submit" icon="add_shopping_cart" color="yellow-5" class="col-6">加入購物車NT${{ totalPrice }}</q-btn>
            </div>
          </q-form>
        </div>
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

//console.log(props.product)

const user = useUserStore()
const { editCart } = user

const showDialog = ref(false)
const quantity = ref(1)
const selectedOptions = ref({}) // 用來儲存選擇的選項

const rules = {
  required: value => !!value || '欄位必填',
  number: value => value > 0 || '數量錯誤'
}

// 去除重複的選項名稱，只保留唯一的選項組合
const uniqueOptions = computed(() => {
  const optionGroups = {}

  props.product.options.forEach(option => {
    // 使用 `option.option_name` 作為選項種類名稱
    if (!optionGroups[option.option_name]) {
      optionGroups[option.option_name] = { name: option.option_name, values: [] }
    }
    optionGroups[option.option_name].values.push({
      value_name: option.value_name,
      price: option.price
    })
  })

  return Object.values(optionGroups)
})
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
  selectedOptions.value = {}
}

const closeDialog = () => {
  showDialog.value = false
}

const submitCart = () => {
  if (quantity.value > 0) {
    // 收集選中的選項
    const selectedOptionsArray = Object.keys(selectedOptions.value).map(key => {
      const option = uniqueOptions.value.find(o => o.name === key)
      const selectedValue = selectedOptions.value[key]
      const value = option.values.find(v => v.value_name === selectedValue)
      return {
        name: key,
        value_name: selectedValue,
        price: value ? value.price : 0
      }
    })

    // 確保將選項傳遞進 editCart
    editCart({
      p_id: props.product.id, // 傳遞商品ID
      items_id: null, // 讓後端生成新的 items_id
      quantity: quantity.value,
      uid: props.product.uid,
      action: 'new',
      selectedOptions: selectedOptionsArray.length > 0 ? selectedOptionsArray : [] // 選項默認為空數組
    })

    showDialog.value = false
  }
}
</script>

<style lang="scss" scoped>
@import 'assets/components/StoreProductCard.scss';
</style>
