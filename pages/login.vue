<template>
  <q-page>
    <div>
      <q-card class="loginCard">
        <div cols="12">
          <h3 class="text-center">登入</h3>
        </div>
        <q-separator />
        <div class="loginCardContent">
          <q-form v-model="valid" @submit.prevent="login">
            <q-input v-model="form.account" type="text" :rules="[rules.required, rules.length]" label="帳號" counter="20" maxlength="20" />
            <q-input v-model="form.password" type="password" :rules="[rules.required, rules.length]" label="密碼" counter="20" maxlength="20" />
            <div class="text-center my-5">
              <q-btn color="primary" type="submit" size="large" :loading="loading">登入</q-btn>
            </div>
          </q-form>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { useUserStore } from '/stores/user'

const user = useUserStore()

const valid = ref(false)
const loading = ref(false)
const form = reactive({
  account: '',
  password: ''
})

const rules = {
  required: value => !!value || '欄位必填',
  length: value => (value.length >= 4 && value.length <= 20) || '長度必須為 4 ~ 20 個字'
}

const login = async () => {
  loading.value = true
  await user.login(form)
  loading.value = false
}
</script>
<style lang="scss" scoped>
@import 'assets/login.scss';
</style>
