<template>
  <q-page>
    <div>
      <q-card class="registerCard">
        <div>
          <h3 class="text-center">註冊</h3>
        </div>
        <q-separator />
        <q-tabs v-model="tab" class="q-pa-md">
          <q-tab name="user" label="一般使用者" />
          <q-tab name="admin" label="廠商" />
        </q-tabs>
        <q-separator />
        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="user">
            <div class="registerCardContent">
              <q-input v-model="userForm.account" type="text" :rules="[rules.required, rules.length]" label="帳號" counter="20" maxlength="20" />
              <q-input v-model="userForm.password" type="password" :rules="[rules.required, rules.length]" label="密碼" counter="20" maxlength="20" />
              <q-input
                v-model="userForm.passwordConfirm"
                type="password"
                :rules="[rules.required, rules.length, rules.passwordConfirm(userForm.password)]"
                label="確認密碼"
                counter="20"
                maxlength="20" />
              <q-input v-model="userForm.name" type="text" :rules="[rules.required]" label="姓名" />

              <!-- 新增性別選擇 -->
              <q-select v-model="userForm.gender" :options="genderOptions" label="性別" map-options emit-value />

              <!-- 新增出生日期 -->
              <q-input v-model="userForm.birthdate" label="出生日期" mask="####-##-##">
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer q-mr-xs">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale" v-model="showDatePicker">
                      <q-date v-model="userForm.birthdate" mask="YYYY-MM-DD" @update:model-value="onDateSelected" color="accent"></q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              <q-input v-model="userForm.address" type="text" :rules="[rules.required]" label="地址" />
              <q-input v-model="userForm.email" type="email" :rules="[rules.email, rules.required]" label="信箱" />

              <q-input v-model="userForm.companyName" type="text" label="公司名稱" />
              <q-input v-model="userForm.taxId" type="text" label="統一編號" />
              <q-input v-model="userForm.phoneNumber" type="text" :rules="[rules.required, rules.phone]" label="手機號碼" mask="####-###-###" />
              <!-- 發送驗證碼按鈕 -->
              <q-btn @click="sendVerificationCode" :disable="sendingCode || timer > 0" :label="timer > 0 ? `重新發送 (${timer}s)` : '發送驗證碼'" color="primary" />

              <q-input v-model="userForm.verificationCode" type="text" :rules="[rules.required]" label="驗證碼" />

              <div class="userTerms row justify-center w-100">
                <q-checkbox v-model="userForm.termsAccepted" :rules="[rules.terms]" label="同意會員使用條款" />
                <q-btn color="primary" flat label="閱讀條款" @click="showTerms = true" />
              </div>
              <q-dialog v-model="showTerms">
                <q-card>
                  <UserTerms />
                  <q-separator />
                  <div class="btn row justify-end">
                    <q-btn flat label="關閉" color="primary" @click="showTerms = false" />
                  </div>
                </q-card>
              </q-dialog>
              <div class="text-center my-5">
                <q-btn color="primary" @click="registerUser" size="large" :loading="loading" :disable="!userForm.termsAccepted">註冊</q-btn>
              </div>
            </div>
          </q-tab-panel>
          <q-tab-panel name="admin">
            <div class="registerCardContent">
              <q-input v-model="adminForm.account" type="text" :rules="[rules.required, rules.length]" label="帳號" counter="20" maxlength="20" />
              <q-input v-model="adminForm.password" type="password" :rules="[rules.required, rules.length]" label="密碼" counter="20" maxlength="20" />
              <q-input
                v-model="adminForm.passwordConfirm"
                type="password"
                :rules="[rules.required, rules.length, rules.passwordConfirm(adminForm.password)]"
                label="確認密碼"
                counter="20"
                maxlength="20" />
              <q-input v-model="adminForm.name" type="text" :rules="[rules.required]" label="姓名" />
              <!-- 新增性別選擇 -->
              <q-select v-model="adminForm.gender" :options="genderOptions" label="性別" map-options emit-value />

              <!-- 新增出生日期 -->
              <q-input v-model="adminForm.birthdate" label="出生日期" mask="####-##-##">
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer q-mr-xs">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale" v-model="showDatePicker">
                      <q-date v-model="adminForm.birthdate" mask="YYYY-MM-DD" @update:model-value="onDateSelected" color="accent"></q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              <q-input v-model="adminForm.address" type="text" :rules="[rules.required]" label="地址" />
              <q-input v-model="adminForm.email" type="email" :rules="[rules.email, rules.required]" label="信箱" />

              <q-input v-model="adminForm.companyName" type="text" :rules="[rules.required]" label="公司名稱" />
              <q-input v-model="adminForm.taxId" type="text" :rules="[rules.required]" label="統一編號" />
              <q-input v-model="adminForm.phoneNumber" type="text" :rules="[rules.required, rules.phone]" label="手機號碼" mask="####-###-###" />
              <!-- 發送驗證碼按鈕 -->
              <q-btn @click="sendVerificationCode" :disable="sendingCode || timer > 0" :label="timer > 0 ? `重新發送 (${timer}s)` : '發送驗證碼'" color="primary" />

              <q-input v-model="adminForm.verificationCode" type="text" :rules="[rules.required]" label="驗證碼" />

              <div class="userTerms row justify-center w-100">
                <q-checkbox v-model="adminForm.termsAccepted" :rules="[rules.terms]" label="同意會員使用條款" />
                <q-btn color="primary" flat label="閱讀條款" @click="showTerms = true" />
              </div>
              <q-dialog v-model="showTerms">
                <q-card>
                  <UserTerms />
                  <q-separator />
                  <div class="btn row justify-end">
                    <q-btn flat label="關閉" color="primary" @click="showTerms = false" />
                  </div>
                </q-card>
              </q-dialog>
              <div class="text-center my-5">
                <q-btn color="primary" @click="registerAdmin" size="large" :loading="loading" :disable="!adminForm.termsAccepted">註冊</q-btn>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import validator from 'validator'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'
import UserTerms from '/components/UserTerms.vue'
const { $api } = useNuxtApp()
const router = useRouter()

const tab = ref('user')
const loading = ref(false)
const showTerms = ref(false)
const showDatePicker = ref(false)
const sendingCode = ref(false) // 控制發送驗證碼按鈕的狀態
const timer = ref(0) // 倒數計時器的秒數

const userForm = reactive({
  account: '',
  password: '',
  passwordConfirm: '',
  email: '',
  name: '',
  address: '',
  phoneNumber: '',
  companyName: '',
  taxId: '',
  gender: '',
  birthdate: '',
  verificationCode: '', // 新增驗證碼欄位
  termsAccepted: false
})

const adminForm = reactive({
  account: '',
  password: '',
  passwordConfirm: '',
  email: '',
  name: '',
  address: '',
  companyName: '',
  taxId: '',
  phoneNumber: '',
  gender: '',
  birthdate: '',
  role: 1,
  verificationCode: '', // 新增驗證碼欄位
  termsAccepted: false
})

const genderOptions = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' }
]

const rules = {
  email: value => validator.isEmail(value) || '格式錯誤',
  required: value => !!value || '欄位必填',
  length: value => (value.length >= 4 && value.length <= 20) || '長度必須為 4 ~ 20 個字',
  passwordConfirm: password => value => value === password || '密碼不一致',
  phone: value => {
    // 去掉所有的 "-" 符號
    const cleanedValue = value.replace(/-/g, '')
    const phonePattern = /^09\d{8}$/
    return phonePattern.test(cleanedValue) || '手機號碼格式錯誤'
  },
  terms: value => value || '必須同意會員使用條款'
}

const validateForm = form => {
  return (
    rules.email(form.email) &&
    rules.required(form.email) &&
    rules.required(form.account) &&
    rules.length(form.account) &&
    rules.required(form.password) &&
    rules.length(form.password) &&
    rules.required(form.passwordConfirm) &&
    rules.length(form.passwordConfirm) &&
    rules.passwordConfirm(form.password)(form.passwordConfirm) &&
    rules.required(form.name) &&
    rules.required(form.address) &&
    rules.required(form.phoneNumber) &&
    rules.phone(form.phoneNumber) &&
    rules.terms(form.termsAccepted)
  )
}

// 發送驗證碼時
const sendVerificationCode = async () => {
  if (!userForm.phoneNumber && !adminForm.phoneNumber) {
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: '請先輸入手機號碼'
    })
    return
  }

  const phoneNumber = tab.value === 'user' ? formatPhoneNumber(userForm.phoneNumber) : formatPhoneNumber(adminForm.phoneNumber)

  sendingCode.value = true
  try {
    await $api.post('/users/send-verification-code', { phoneNumber })
    Swal.fire({
      icon: 'success',
      title: '成功',
      text: '驗證碼已發送'
    })
    startTimer() // 開始倒數計時
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: error?.response?.data?.message || '無法發送驗證碼'
    })
  } finally {
    sendingCode.value = false
  }
}

// 開始倒數計時
const startTimer = () => {
  timer.value = 600 // 10分鐘 = 600秒
  const interval = setInterval(() => {
    if (timer.value > 0) {
      timer.value--
    } else {
      clearInterval(interval)
    }
  }, 1000)
}

const registerUser = async () => {
  if (!validateForm(userForm)) {
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: '表單驗證未通過'
    })
    return
  }
  loading.value = true
  try {
    await $api.post('/users', userForm)
    await Swal.fire({
      icon: 'success',
      title: '成功',
      text: '註冊成功'
    })
    router.push('/')
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: error?.response?.data?.message || '發生錯誤'
    })
  }
  loading.value = false
}

const registerAdmin = async () => {
  if (!validateForm(adminForm)) {
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: '表單驗證未通過'
    })
    return
  }
  loading.value = true
  try {
    await $api.post('/users', adminForm)
    await Swal.fire({
      icon: 'success',
      title: '成功',
      text: '註冊成功，請等待審核'
    })
    router.push('/')
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: error?.response?.data?.message || '發生錯誤'
    })
  }
  loading.value = false
}

const onDateSelected = date => {
  userForm.birthdate = date
  adminForm.birthdate = date
  showDatePicker.value = false
}

const formatPhoneNumber = phoneNumber => {
  const cleanedValue = phoneNumber.replace(/-/g, '') // 移除 "-"
  if (cleanedValue.startsWith('09')) {
    return `+886${cleanedValue.slice(1)}`
  }
  return cleanedValue
}
</script>

<style lang="scss" scoped>
@import 'assets/register.scss';
</style>
