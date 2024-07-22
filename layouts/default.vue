<!-- layouts/default.vue -->
<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn to="/">北台灣購物網</q-btn>
        <q-space></q-space>
        <q-btn class="headBtn" v-if="!isLogin" icon="mdi-account-plus" label="註冊" flat to="/register"></q-btn>

        <q-btn v-if="!isLogin" icon="login" label="登入" flat to="/login"></q-btn>
        <q-btn class="headBtn" v-if="isLogin" icon="shopping_cart" flat to="/cart">
          <q-badge color="green" floating>{{ cart }}</q-badge>
          購物車
        </q-btn>
        <q-btn class="headBtn" v-if="isLogin" icon="summarize" label="訂單" flat to="/orders"></q-btn>
        <q-btn class="headBtn" v-if="isLogin" icon="settings" label="管理" flat to="/setting"></q-btn>
        <q-btn class="headBtn" v-if="isLogin" icon="logout" label="登出" flat @click="logout"></q-btn>
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
