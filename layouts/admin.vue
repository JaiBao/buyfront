<!-- layout/admin.vue -->
<template>
  <q-layout view="hHh LpR fFf">
    <q-header elevated class="lt-md">
      <q-toolbar class="bg-yellow-7">
        <q-btn color="black" dense flat round icon="menu" @click="drawer = true" />
        <q-toolbar-title class="text-black" v-if="isAdmin || (isSuperAdmin && isLogin)">管理介面</q-toolbar-title>
        <q-toolbar-title v-else>個人資料管理</q-toolbar-title>
        <q-space></q-space>
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above :width="200" v-model="drawer" side="left" bordered>
      <q-list>
        <img src="/default/footerLogo.png" alt="Logo" style="width: 100%" class="adminLogo" />

        <div class="blackLine"></div>

        <div class="storeName" v-if="isAdmin">
          <div class="title"><span>店家:</span></div>
          <div class="name">
            <span>{{ storeInfo.companyName }}</span>
          </div>
        </div>
        <div class="storeName" v-else>
          <div class="title"><span>會員:</span></div>
          <div class="name">
            <span>{{ name }}</span>
          </div>
        </div>
        <!-- <q-item class="my-menu">
          <q-item-section avatar>
            <q-icon v-if="isSuperAdmin" name="support_agent" size="sm" />
            <q-icon v-else-if="isAdmin" name="apartment" size="sm" />
            <q-icon v-else name="face" size="sm" />
          </q-item-section>
          <q-item-section v-if="isAdmin">
            <q-item-label>{{ storeInfo.companyName }}</q-item-label>
          </q-item-section>
          <q-item-section v-else>
            <q-item-label>{{ account }}</q-item-label>
          </q-item-section>
        </q-item> -->
      </q-list>

      <q-list>
        <q-item clickable v-ripple to="/setting" class="my-menu" active-class="my-menu-link">
          <q-item-section avatar class="items_icon">
            <q-icon name="account_circle" />
          </q-item-section>
          <q-item-section>
            <q-item-label>個人資料修改</q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="isSuperAdmin" clickable v-ripple to="/setting/carousel" active-class="my-menu-link" class="my-menu">
          <q-item-section avatar class="items_icon">
            <q-icon name="view_carousel" />
          </q-item-section>
          <q-item-section>
            <q-item-label>輪播圖片設定</q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="isAdmin || isSuperAdmin" clickable v-ripple to="/setting/products" active-class="my-menu-link" class="my-menu">
          <q-item-section avatar class="items_icon">
            <q-icon name="storefront" />
          </q-item-section>
          <q-item-section>
            <q-item-label>商品管理</q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="isAdmin || isSuperAdmin" clickable v-ripple to="/setting/orders" active-class="my-menu-link" class="my-menu">
          <q-item-section avatar class="items_icon">
            <q-icon name="list" />
          </q-item-section>
          <q-item-section>
            <q-item-label>訂單管理</q-item-label>
          </q-item-section>
        </q-item>

        <q-item v-if="isSuperAdmin" clickable v-ripple to="/setting/accounts" active-class="my-menu-link" class="my-menu">
          <q-item-section avatar class="items_icon">
            <q-icon name="manage_accounts" />
          </q-item-section>
          <q-item-section>
            <q-item-label>帳號管理</q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="isSuperAdmin" clickable v-ripple to="/setting/pendingAccounts" active-class="my-menu-link" class="my-menu">
          <q-item-section avatar class="items_icon">
            <q-icon name="rule" />
            <q-badge v-if="pendingCountStore.pendingCount > 0" color="red" floating>{{ pendingCountStore.pendingCount }}</q-badge>
          </q-item-section>
          <q-item-section>
            <q-item-label>待審核廠商</q-item-label>
          </q-item-section>
        </q-item>

        <q-item v-if="isAdmin || isSuperAdmin" clickable v-ripple to="/setting/analytics" active-class="my-menu-link" class="my-menu">
          <q-item-section avatar class="items_icon">
            <q-icon name="bar_chart" />
          </q-item-section>
          <q-item-section>
            <q-item-label>分析圖表</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/" active-class="my-menu-link" class="my-menu">
          <q-item-section avatar class="items_icon">
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

const { $apiAuth } = useNuxtApp()
const user = useUserStore()
const { avatar, account, isAdmin, isSuperAdmin, isLogin, uid, name } = storeToRefs(user)
const drawer = ref(true)
const storeInfo = ref({ companyName: '', storePhone: '' }) // 儲存店家信息

const pendingCountStore = usePendingCountStore()
const { fetchPendingCount } = pendingCountStore
// 獲取店家信息
const fetchStoreInfo = async uid => {
  try {
    const { data } = await $apiAuth.get(`/users/store/${uid}`)
    if (data.success) {
      storeInfo.value.companyName = data.result.company_name
      storeInfo.value.storePhone = data.result.store_phone
    } else {
      Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: '無法獲取商家信息'
      })
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '錯誤',
      text: '加載商家信息失敗'
    })
  }
}

onMounted(() => {
  if (isSuperAdmin.value) {
    fetchPendingCount()
  }

  if (uid.value) {
    fetchStoreInfo(uid.value) // 調用 fetchStoreInfo 獲取店家名稱
  }
})
</script>

<style>
@import 'assets/admin.scss';
.q-layout {
  min-height: 100vh;
}
</style>
