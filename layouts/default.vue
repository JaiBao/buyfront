<!-- layouts/default.vue -->
<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar class="bg-yellow-7 row justify-between p-0-5">
        <div class="leftBtn col-4">
          <!-- <q-btn text-color="black">店家菜單</q-btn>
          <q-btn text-color="black">商業合作</q-btn> -->
        </div>
        <q-btn to="/"><img src="/default/logoName.png" /></q-btn>

        <div class="rightBtn col-4 row justify-end">
          <q-btn class="headBtn" text-color="black" v-if="!isLogin" flat to="/register">
            <q-icon color="black" />
            註冊
          </q-btn>

          <q-btn v-if="!isLogin" flat to="/login" text-color="black">
            <q-icon name="login" color="black" />
            登入
          </q-btn>
          <q-btn class="headBtn" v-if="isLogin" flat to="/cart" text-color="black">
            <q-icon name="shopping_cart" color="black" />
            購物車
            <q-badge color="green" floating>{{ cart }}</q-badge>
          </q-btn>
          <q-btn class="headBtn" v-if="isLogin" flat to="/orders" text-color="black">
            <q-icon name="summarize" color="black" />
            訂單
          </q-btn>
          <q-btn class="headBtn" v-if="isLogin" flat to="/setting" text-color="black">
            <q-icon name="settings" color="black" />
            管理
          </q-btn>
          <q-btn class="headBtn" v-if="isLogin" flat @click="logout" text-color="black">
            <q-icon name="logout" color="black" />
            登出
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <slot />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useUserStore } from '/stores/user'

const user = useUserStore()
const { isLogin, isAdmin, cart, isSuperAdmin } = storeToRefs(user)
const { logout } = user
</script>
