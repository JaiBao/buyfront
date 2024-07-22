<!-- components/ProductCard.vue -->
<template>
  <q-card class="card-product">
    <div class="title">
      <img :src="product.image" />
      <div class="name">
        <p>
          <a @click="openDialog" class="text-decoration-none text-primary">{{ product.name }}</a>
          ${{ product.price }}
        </p>
      </div>
    </div>
    <div class="content">
      <!-- <q-card-title class="row justify-center"></q-card-title> -->

      <q-card-section>
        <p class="pre">{{ product.description }}</p>
        <p class="pre">
          <nuxt-link :to="'/store/' + product.uid" class="text-decoration-none text-primary">
            {{ product.company_name }}
          </nuxt-link>
        </p>
        <!-- <p>金額:</p> -->
      </q-card-section>

      <q-card-actions>
        <q-btn color="primary" @click="openDialog" class="w-100">立即預訂</q-btn>
      </q-card-actions>
    </div>

    <q-dialog v-model="showDialog" persistent>
      <q-card>
        <q-img :src="product.image" />
        <q-card-section>
          <p>
            {{ product.name }}
            <span>${{ product.price }}</span>
          </p>
          <p class="pre">{{ product.description }}</p>
          <!-- <p class="pre">店家: {{ product.company_name }}</p> -->
        </q-card-section>
        <q-card-actions>
          <q-form @submit.prevent="submitCart" class="w-100">
            <q-input v-model.number="quantity" type="number" label="數量" :rules="[rules.required, rules.number]" outlined />
            <div class="w-100 row justify-around">
              <q-btn type="submit" icon="add_shopping_cart" color="primary" class="col-5">加入購物車</q-btn>
              <q-btn @click="closeDialog" label="取消" color="red" class="col-5" />
            </div>
          </q-form>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '/stores/user'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const user = useUserStore()
const { editCart } = user

const showDialog = ref(false)
const quantity = ref(1)

const rules = {
  required: value => !!value || '欄位必填',
  number: value => value > 0 || '數量錯誤'
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
    editCart({ id: props.product.id, quantity: quantity.value })
    showDialog.value = false
  }
}
</script>

<style lang="scss" scoped>
@import 'assets/components/ProductCard.scss';
</style>
