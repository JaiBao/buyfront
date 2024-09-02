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
            <div class="text-center my-2">
              <q-btn flat color="primary" label="忘記密碼？" @click="openForgotPasswordDialog" />
            </div>
          </q-form>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useUserStore } from '/stores/user'
import Swal from 'sweetalert2'

const { $apiAuth } = useNuxtApp()
const user = useUserStore()

const valid = ref(false)
const loading = ref(false)
const forgotPasswordDialog = ref(false)

const form = reactive({
  account: '',
  password: ''
})

const forgotPasswordForm = reactive({
  account: '',
  phoneNumber: '',
  verificationCode: '',
  newPassword: '',
  confirmPassword: ''
})

const rules = {
  required: value => !!value || '欄位必填',
  length: value => (value.length >= 4 && value.length <= 20) || '長度必須為 4 ~ 20 個字',
  phone: value => /^[0-9\+\-\(\) ]+$/.test(value) || '手機號碼格式不正確',
  match: value => value === forgotPasswordForm.newPassword || '密碼不匹配'
}

const login = async () => {
  loading.value = true
  await user.login(form)
  loading.value = false
}

const openForgotPasswordDialog = async () => {
  const { value: account } = await Swal.fire({
    title: '忘記密碼',
    input: 'text',
    inputLabel: '請輸入帳號',
    inputPlaceholder: '帳號',
    inputAttributes: {
      maxlength: 20,
      autocapitalize: 'off',
      autocorrect: 'off'
    },
    showCancelButton: true
  })

  if (account) {
    forgotPasswordForm.account = account
    const { value: phoneNumber } = await Swal.fire({
      title: '忘記密碼',
      input: 'text',
      inputLabel: '請輸入手機號碼',
      inputPlaceholder: '手機號碼',
      inputAttributes: {
        maxlength: 15,
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      showCancelButton: true
    })

    if (phoneNumber) {
      forgotPasswordForm.phoneNumber = phoneNumber
      sendVerificationCode()
    }
  }
}

const sendVerificationCode = async () => {
  try {
    loading.value = true
    await $apiAuth.post('/users/verifyAccountAndPhone', {
      account: forgotPasswordForm.account,
      phoneNumber: forgotPasswordForm.phoneNumber
    })
    const { value: verificationCode } = await Swal.fire({
      title: '驗證碼已發送',
      text: '請輸入簡訊中的驗證碼',
      input: 'text',
      inputPlaceholder: '驗證碼',
      showCancelButton: true
    })

    if (verificationCode) {
      forgotPasswordForm.verificationCode = verificationCode
      verifyCode()
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '發送失敗',
      text: error.response?.data?.message || '發送驗證碼失敗'
    })
  } finally {
    loading.value = false
  }
}

const verifyCode = async () => {
  try {
    loading.value = true
    await $apiAuth.post('/users/verifyCode', {
      phoneNumber: forgotPasswordForm.phoneNumber,
      code: forgotPasswordForm.verificationCode
    })
    const { value: newPassword } = await Swal.fire({
      title: '驗證成功',
      text: '請輸入新密碼',
      input: 'password',
      inputPlaceholder: '新密碼',
      inputAttributes: {
        maxlength: 20,
        autocapitalize: 'off',
        autocorrect: 'off'
      }
    })

    if (newPassword) {
      const { value: confirmPassword } = await Swal.fire({
        title: '確認新密碼',
        input: 'password',
        inputPlaceholder: '請再次輸入新密碼',
        inputAttributes: {
          maxlength: 20,
          autocapitalize: 'off',
          autocorrect: 'off'
        }
      })

      if (confirmPassword && newPassword === confirmPassword) {
        forgotPasswordForm.newPassword = newPassword
        resetPassword()
      } else {
        Swal.fire({
          icon: 'error',
          title: '錯誤',
          text: '兩次輸入的密碼不一致'
        })
      }
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '驗證失敗',
      text: error.response?.data?.message || '驗證碼錯誤'
    })
  } finally {
    loading.value = false
  }
}

const resetPassword = async () => {
  try {
    loading.value = true
    await $apiAuth.post('/users/resetPasswordByAccount', {
      account: forgotPasswordForm.account,
      newPassword: forgotPasswordForm.newPassword
    })
    Swal.fire({
      icon: 'success',
      title: '成功',
      text: '密碼已成功重置，請使用新密碼登錄'
    })
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '重置失敗',
      text: error.response?.data?.message || '重置密碼失敗'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
@import 'assets/login.scss';
</style>
