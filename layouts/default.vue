<!-- layouts/default.vue -->
<template>
  <q-layout view="hHh lpR fff">
    <q-header elevated style="padding: 1% 0" class="bg-yellow-7">
      <q-toolbar class="bg-yellow-7 row justify-between p-0-5 w-100">
        <div class="leftBtn col-4 gt-sm">
          <!-- <q-btn text-color="black">店家菜單</q-btn>
          <q-btn text-color="black">商業合作</q-btn> -->
        </div>
        <div class="pointer headLogo" @click="navigateToHome"><img src="/default/logoName.png" /></div>

        <div class="rightBtn col-md-4 row justify-end no-wrap">
          <q-btn class="headBtn gt-sm" text-color="black" v-if="!isLogin" flat to="/register">
            <q-icon color="black" />
            註冊
          </q-btn>

          <q-btn v-if="!isLogin" flat @click="user.loginDialog = true" text-color="black" class="gt-sm">
            <q-icon name="login" color="black" />
            登入
          </q-btn>
          <q-btn class="headBtn gt-sm" v-if="isLogin" flat to="/cart" text-color="black">
            <q-icon name="shopping_cart" color="black" />
            購物車
            <q-badge color="green" floating>{{ cart }}</q-badge>
          </q-btn>
          <q-btn class="headBtn gt-sm" v-if="isLogin" flat to="/orders" text-color="black">
            <q-icon name="summarize" color="black" />
            訂單
          </q-btn>
          <q-btn class="headBtn gt-sm" v-if="isLogin" flat to="/setting" text-color="black">
            <q-icon name="settings" color="black" />
            管理
          </q-btn>
          <q-btn class="headBtn gt-sm" v-if="isLogin" flat @click="logout" text-color="black">
            <q-icon name="logout" color="black" />
            登出
          </q-btn>

          <!-- 漢堡 -->
          <q-btn dense flat round @click="toggleRightDrawer" class="lt-md" color="black">
            <q-icon left size="2.5em" name="menu" class="xs" />
            <q-icon left size="3em" name="menu" class="sm" />
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <!-- 漢堡 -->
    <q-drawer v-model="rightDrawerOpen" side="right" behavior="mobile" bordered class="column bg-white text-black items-end" :width="160" style="z-index: 2999">
      <div class="row">
        <q-icon @click="rightDrawerOpen = false" name="close" size="md" style="text-align: right"></q-icon>
      </div>
      <q-list class="drawerList">
        <q-item v-if="!isLogin" clickable to="/register" class="column items-end" exact>
          <q-item-section class="drawerItem">註冊</q-item-section>
        </q-item>

        <q-item v-if="!isLogin" clickable @click="user.loginDialog = true" class="column items-end" exact>
          <q-item-section class="drawerItem">
            <q-icon name="login" color="black" size="sm" />
            登入
          </q-item-section>
        </q-item>
        <q-item v-if="isLogin" clickable to="/cart" class="column items-end" exact>
          <q-item-section class="drawerItem">
            <q-icon name="shopping_cart" color="black" />
            購物車
            <q-badge color="green" floating>{{ cart }}</q-badge>
          </q-item-section>
        </q-item>

        <q-item v-if="isLogin" clickable to="/orders" class="column items-end" exact>
          <q-item-section class="drawerItem">
            <q-icon name="summarize" color="black" />
            訂單
          </q-item-section>
        </q-item>
        <q-item v-if="isLogin" clickable to="/setting" class="column items-end" exact>
          <q-item-section class="drawerItem">
            <q-icon name="settings" color="black" />
            管理
          </q-item-section>
        </q-item>
        <q-item v-if="isLogin" clickable @click="logout" class="column items-end" exact>
          <q-item-section class="drawerItem">
            <q-icon name="logout" color="black" />
            登出
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <slot />
    </q-page-container>

    <q-footer class="bg-yellow-7 text-white">
      <div class="footerToolbar">
        <!-- <img src="/default/footerLogo.png" alt="footerLogo" /> -->

        <p class="text-grey-8">
          Copyright © 2024香臨食品股份有限公司
          <br class="lt-sm" />
          著作權所有 |

          <router-link to="/privacy" class="custom-link">隱私權政策</router-link>
          <br />
          241新北市三重光復路二段69號18樓
          <br class="lt-sm" />
          | (02) 2278-2325 | dtsmkt@dtstw.com
        </p>
      </div>
    </q-footer>

    <q-dialog v-model="user.loginDialog">
      <login />
    </q-dialog>

    <!-- 手機購物車 -->
    <q-btn v-if="cart > 0 && $route.path !== '/cart'" to="/cart" class="cartBtn lt-md">
      <q-icon name="shopping_cart"></q-icon>
      <q-badge color="teal" class="cart-quantity" floating top-right>{{ cart }}</q-badge>
    </q-btn>
  </q-layout>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useUserStore } from '/stores/user'

const rightDrawerOpen = ref(false)

const router = useRouter()
const toggleRightDrawer = () => {
  rightDrawerOpen.value = !rightDrawerOpen.value
}

const navigateToHome = () => {
  router.push('/')
}

const user = useUserStore()
const { isLogin, isAdmin, cart, isSuperAdmin } = storeToRefs(user)
const { logout } = user
</script>
<style lang="scss" scoped>
@import 'assets/default.scss';
</style>
