<!-- layout/admin.vue -->
<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar class="bg-yellow-7">
        <!-- <q-btn dense flat round icon="menu" @click="miniState = false" /> -->
        <q-toolbar-title class="text-black" v-if="isAdmin || (isSuperAdmin && isLogin)">管理介面</q-toolbar-title>
        <q-toolbar-title v-else>個人資料管理</q-toolbar-title>
        <q-space></q-space>
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above :width="200" v-model="drawer" :mini="miniState" @mouseover="miniState = false" @mouseout="miniState = true" side="left" bordered>
      <q-list>
        <q-item>
          <q-item-section avatar>
            <!-- <q-avatar>
              <img :src="avatar" />
            </q-avatar> -->
            <q-icon v-if="isSuperAdmin" name="support_agent" size="sm" />
            <q-icon v-else-if="isAdmin" name="apartment" size="sm" />
            <q-icon v-else name="face" size="sm" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ account }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <q-separator />
      <q-list>
        <q-item clickable v-ripple to="/setting">
          <q-item-section avatar>
            <q-icon name="account_circle" />
          </q-item-section>
          <q-item-section>
            <q-item-label>個人資料修改</q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="isSuperAdmin" clickable v-ripple to="/setting/carousel">
          <q-item-section avatar>
            <q-icon name="view_carousel" />
          </q-item-section>
          <q-item-section>
            <q-item-label>輪播圖片設定</q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="isAdmin || isSuperAdmin" clickable v-ripple to="/setting/products">
          <q-item-section avatar>
            <q-icon name="storefront" />
          </q-item-section>
          <q-item-section>
            <q-item-label>商品管理</q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="isAdmin || isSuperAdmin" clickable v-ripple to="/setting/orders">
          <q-item-section avatar>
            <q-icon name="list" />
          </q-item-section>
          <q-item-section>
            <q-item-label>訂單管理</q-item-label>
          </q-item-section>
        </q-item>

        <q-item v-if="isSuperAdmin" clickable v-ripple to="/setting/accounts">
          <q-item-section avatar>
            <q-icon name="manage_accounts" />
          </q-item-section>
          <q-item-section>
            <q-item-label>帳號管理</q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="isSuperAdmin" clickable v-ripple to="/setting/pendingAccounts">
          <q-item-section avatar>
            <q-icon name="rule" />
            <q-badge v-if="pendingCountStore.pendingCount > 0" color="red" floating>{{ pendingCountStore.pendingCount }}</q-badge>
          </q-item-section>
          <q-item-section>
            <q-item-label>待審核廠商</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/">
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>
            <q-item-label>回首頁</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <slot />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useUserStore } from '/stores/user'
import { usePendingCountStore } from '/stores/pendingCountStore'

const user = useUserStore()
const { avatar, account, isAdmin, isSuperAdmin, isLogin } = storeToRefs(user)
const drawer = ref(true)
const miniState = ref(true)

const pendingCountStore = usePendingCountStore()
const { fetchPendingCount } = pendingCountStore

onMounted(() => {
  if (isSuperAdmin.value) {
    fetchPendingCount()
  }
})
</script>

<style>
.q-layout {
  min-height: 100vh;
}
</style>
