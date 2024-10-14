<template>
  <q-page>
    <div>
      <q-card class="registerCard">
        <div>
          <h3 class="text-center">註冊</h3>
        </div>
        <q-separator />
        <q-tabs v-model="tab" class="q-pa-md" active-color="black" indicator-color="yellow-7">
          <q-tab name="user" label="一般使用者" />
          <q-tab name="admin" label="廠商" />
        </q-tabs>
        <q-separator />
        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="user">
            <div class="registerCardContent">
              <q-input
                outlined
                v-model="userForm.account"
                type="text"
                :rules="[rules.required, rules.length]"
                :label="!userForm.account ? '帳號(必填)' : ''"
                counter="true"
                maxlength="20"
                hide-bottom-space />
              <q-input
                outlined
                v-model="userForm.password"
                :type="userForm.isPwd ? 'password' : 'text'"
                :rules="[rules.required, rules.password]"
                :label="!userForm.password ? '密碼(必填)' : ''"
                counter="true"
                maxlength="20"
                hide-bottom-space>
                <template v-slot:append>
                  <q-icon :name="userForm.isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="userForm.isPwd = !userForm.isPwd" />
                </template>
              </q-input>
              <q-input
                outlined
                v-model="userForm.passwordConfirm"
                :type="userForm.isPwd2 ? 'password' : 'text'"
                :rules="[rules.required, rules.password, rules.passwordConfirm(userForm.password)]"
                :label="!userForm.passwordConfirm ? '確認密碼(必填)' : ''"
                counter="true"
                maxlength="20"
                hide-bottom-space>
                <template v-slot:append>
                  <q-icon :name="userForm.isPwd2 ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="userForm.isPwd2 = !userForm.isPwd2" />
                </template>
              </q-input>
              <div class="row items-center">
                <q-input
                  outlined
                  v-model="userForm.name"
                  type="text"
                  :rules="[rules.required]"
                  :label="!userForm.name ? '姓名(必填)' : ''"
                  hide-bottom-space
                  class="col-8" />

                <!-- 新增性別選擇 -->
                <q-select class="col-4" outlined v-model="userForm.gender" :options="genderOptions" :label="!userForm.gender ? '性別' : ''" map-options emit-value />
              </div>
              <!-- 新增出生日期 -->
              <q-input outlined v-model="userForm.birthdate" :label="!userForm.birthdate ? '出生日期YYYY-MM-DD(必填)' : ''" mask="####-##-##">
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer q-mr-xs">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale" v-model="showDatePicker">
                      <q-date
                        v-model="userForm.birthdate"
                        :options="date => new Date(date) <= new Date(today.toISODate())"
                        mask="YYYY-MM-DD"
                        @update:model-value="onDateSelected"
                        color="accent"></q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              <q-input outlined v-model="userForm.address" type="text" :rules="[rules.required]" :label="!userForm.address ? '地址(必填)' : ''" hide-bottom-space />
              <q-input
                outlined
                v-model="userForm.email"
                type="email"
                :rules="[rules.email, rules.required]"
                :label="!userForm.email ? '信箱(必填)' : ''"
                hide-bottom-space />

              <q-input outlined v-model="userForm.companyName" type="text" :label="!userForm.companyName ? '公司名稱' : ''" />
              <q-input outlined v-model="userForm.taxId" type="text" :rules="[rules.taxId]" :label="!userForm.taxId ? '統一編號' : ''" />
              <div class="row items-center justify-between">
                <q-input
                  outlined
                  class="col-8"
                  v-model="userForm.phoneNumber"
                  type="text"
                  :rules="[rules.required, rules.phone]"
                  :label="!userForm.phoneNumber ? '手機號碼(必填)' : ''"
                  mask="####-###-###"
                  hide-bottom-space />
                <!-- 發送驗證碼按鈕 -->
                <q-btn @click="sendVerificationCode" label="發送驗證碼" color="primary" />
              </div>
              <q-input
                outlined
                v-model="userForm.verificationCode"
                type="text"
                :rules="[rules.required]"
                :label="!userForm.verificationCode ? '驗證碼' : ''"
                hide-bottom-space />

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
              <q-input
                outlined
                v-model="adminForm.account"
                type="text"
                :rules="[rules.required, rules.length]"
                :label="!adminForm.account ? '帳號(必填)' : ''"
                counter="true"
                maxlength="20"
                hide-bottom-space />
              <q-input
                outlined
                v-model="adminForm.password"
                :type="adminForm.isPwd ? 'password' : 'text'"
                :rules="[rules.required, rules.password]"
                :label="!adminForm.password ? '密碼(必填)' : ''"
                counter="true"
                maxlength="20"
                hide-bottom-space>
                <template v-slot:append>
                  <q-icon :name="adminForm.isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="adminForm.isPwd = !adminForm.isPwd" />
                </template>
              </q-input>
              <q-input
                outlined
                v-model="adminForm.passwordConfirm"
                :type="adminForm.isPwd2 ? 'password' : 'text'"
                :rules="[rules.required, rules.password, rules.passwordConfirm(adminForm.password)]"
                :label="!adminForm.passwordConfirm ? '確認密碼(必填)' : ''"
                counter="true"
                maxlength="20"
                hide-bottom-space>
                <template v-slot:append>
                  <q-icon :name="adminForm.isPwd2 ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="adminForm.isPwd2 = !adminForm.isPwd2" />
                </template>
              </q-input>
              <div class="row items-center">
                <q-input
                  class="col-8"
                  outlined
                  v-model="adminForm.name"
                  type="text"
                  :rules="[rules.required]"
                  :label="!adminForm.name ? '姓名(必填)' : ''"
                  hide-bottom-space />
                <!-- 新增性別選擇 -->
                <q-select
                  outlined
                  v-model="adminForm.gender"
                  :options="genderOptions"
                  :label="!adminForm.gender ? '性別(必填)' : ''"
                  map-options
                  emit-value
                  hide-bottom-space
                  class="col-4" />
              </div>
              <!-- 新增出生日期 -->
              <q-input outlined v-model="adminForm.birthdate" :label="!adminForm.birthdate ? '公司創立日期(必填)' : ''" mask="####-##-##" hide-bottom-space>
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer q-mr-xs">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale" v-model="showDatePicker">
                      <q-date
                        v-model="adminForm.birthdate"
                        :options="date => new Date(date) <= new Date(today.toISODate())"
                        mask="YYYY-MM-DD"
                        @update:model-value="onDateSelected"
                        color="accent"></q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              <q-input outlined v-model="adminForm.address" type="text" :rules="[rules.required]" :label="!adminForm.address ? '地址(必填)' : ''" hide-bottom-space />
              <q-input
                outlined
                v-model="adminForm.email"
                type="email"
                :rules="[rules.email, rules.required]"
                :label="!adminForm.email ? '信箱(必填)' : ''"
                hide-bottom-space />

              <q-input
                outlined
                v-model="adminForm.companyName"
                type="text"
                :rules="[rules.required]"
                :label="!adminForm.companyName ? '公司名稱(必填)' : ''"
                hide-bottom-space />
              <q-input
                outlined
                v-model="adminForm.taxId"
                type="text"
                :rules="[rules.required, rules.taxId]"
                :label="!adminForm.taxId ? '統一編號(必填)' : ''"
                hide-bottom-space />
              <div class="row items-center justify-between">
                <q-input
                  class="col-8"
                  outlined
                  v-model="adminForm.phoneNumber"
                  type="text"
                  :rules="[rules.required, rules.phone]"
                  :label="!adminForm.phoneNumber ? '手機號碼(必填)' : ''"
                  mask="####-###-###"
                  hide-bottom-space />
                <!-- 發送驗證碼按鈕 -->
                <q-btn @click="sendVerificationCode" :disable="sendingCode || timer > 0" :label="timer > 0 ? `重新發送 (${timer}s)` : '發送驗證碼'" color="primary" />
              </div>
              <q-input
                outlined
                v-model="adminForm.verificationCode"
                type="text"
                :rules="[rules.required]"
                :label="!adminForm.verificationCode ? '驗證碼' : ''"
                hide-bottom-space />

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
import { DateTime } from 'luxon'
import { useUserStore } from '/stores/user'

useHead({
  title: '北台灣企業餐飲團訂網｜註冊',
  meta: [
    // Description Meta Tag
    {
      name: 'description',
      content:
        '北台灣企業餐飲團訂網平台為整合各大服務企業團體餐點的預訂網站，在這裡無論團體便當外送、會議盒餐外送、下午茶餐盒外送、甜品外送、手搖飲外送，在這裡都可輕鬆預訂！'
    },
    // Open Graph
    {
      property: 'og:title',
      content: '北台灣企業餐飲團訂網｜註冊'
    },
    {
      property: 'og:description',
      content:
        '北台灣企業餐飲團訂網平台為整合各大服務企業團體餐點的預訂網站，在這裡無論團體便當外送、會議盒餐外送、下午茶餐盒外送、甜品外送、手搖飲外送，在這裡都可輕鬆預訂！'
    },
    {
      property: 'og:image',
      content: 'https://www.beifoodorder.com/ogImg.png' // 使用你的圖片路徑
    },
    {
      property: 'og:image:alt',
      content: '北台灣'
    },
    {
      property: 'og:url',
      content: 'https://www.beifoodorder.com/register'
    },
    {
      property: 'og:type',
      content: 'website'
    },
    {
      name: 'author',
      content: 'bao'
    }

    // { name: 'google-site-verification', content: '5j6K_dFtD3LNzCJ42rR_OSpfv1rmneTcTEXsdRASwU0' }
    // ...
  ]
})

const { $api } = useNuxtApp()
const router = useRouter()
const user = useUserStore()
// 日期選項限制
const today = DateTime.local().startOf('day')
const minDate = today.toISODate()

const tab = ref('user')
const loading = ref(false)
const showTerms = ref(false)
const showDatePicker = ref(false)
const sendingCode = ref(false) // 控制發送驗證碼按鈕的狀態
const timer = ref(0) // 倒數計時器的秒數

const userForm = reactive({
  account: '',
  password: '',
  isPwd: true,
  isPwd2: true,
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
  isPwd: true,
  isPwd2: true,
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
  password: value => {
    // 密碼必須包含至少一個大寫字母、一個小寫字母和一個數字
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/
    return passwordPattern.test(value) || '密碼必須包含至少一個大寫字母、一個小寫字母和一個數字，且長度至少為 8 個字'
  },
  phone: value => {
    const cleanedValue = value.replace(/-/g, '')
    const phonePattern = /^09\d{8}$/
    return phonePattern.test(cleanedValue) || '手機號碼格式錯誤'
  },
  terms: value => value || '必須同意會員使用條款',
  taxId: value => {
    if (!value) {
      return true // 當統一編號是空的時候，驗證通過
    }
    return validateTaiwanBusinessNumber(value) || '統一編號格式錯誤'
  }
}

// 密碼驗證函數
const validatePassword = password => {
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/
  return passwordPattern.test(password)
}

// 統一編號驗證函數
const validateTaiwanBusinessNumber = number => {
  const regex = /^[0-9]{8}$/
  const logicMultipliers = [1, 2, 1, 2, 1, 2, 4, 1]
  const sum = numbers => numbers.reduce((acc, curr) => Number(acc) + Number(curr), 0)

  if (number.length !== 8 || !regex.test(number)) {
    return false
  }

  let logicProductArr = []
  let logicProduct = 0
  if (number[6] == '7') {
    for (let i = 0; i < number.length; i++) {
      if (i != 6) {
        logicProductArr.push(parseInt(number[i]) * logicMultipliers[i])
      }
    }
  } else {
    for (let i = 0; i < number.length; i++) {
      logicProductArr.push(parseInt(number[i]) * logicMultipliers[i])
    }
  }

  for (const item of logicProductArr) {
    logicProduct += sum(item.toString().split(''))
  }

  if (number[6] === '7' && (logicProduct % 5 === 0 || (logicProduct + 1) % 5 === 0)) {
    return true
  } else if (logicProduct % 5 === 0) {
    return true
  }

  return false
}

const validateForm = form => {
  return (
    rules.email(form.email) &&
    rules.required(form.email) &&
    rules.required(form.account) &&
    rules.length(form.account) &&
    rules.required(form.password) &&
    rules.length(form.password) &&
    rules.password(form.password) && // 密碼驗證
    rules.required(form.passwordConfirm) &&
    rules.length(form.passwordConfirm) &&
    rules.passwordConfirm(form.password)(form.passwordConfirm) &&
    rules.required(form.name) &&
    rules.required(form.address) &&
    rules.required(form.phoneNumber) &&
    rules.phone(form.phoneNumber) &&
    rules.terms(form.termsAccepted) &&
    (!form.taxId || rules.taxId(form.taxId)) // 如果統一編號存在，則驗證
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
  // 格式化電話號碼，移除 "-" 符號
  userForm.phoneNumber = userForm.phoneNumber.replace(/-/g, '')

  if (!validateForm(userForm)) {
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: '表單驗證未通過'
    })
    return
  }

  if (!validatePassword(userForm.password)) {
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: '密碼必須包含至少一個大寫字母、一個小寫字母和一個數字，且長度至少為 8 個字'
    })
    return
  }

  if (userForm.taxId && !validateTaiwanBusinessNumber(userForm.taxId)) {
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: '統一編號格式錯誤'
    })
    return
  }

  loading.value = true
  try {
    // 註冊 API 呼叫
    await $api.post('/users', userForm)

    // 註冊成功，開始登入流程
    await user.login({
      account: userForm.account,
      password: userForm.password
    })

    Swal.fire({
      icon: 'success',
      title: '成功',
      text: '註冊並成功登入'
    })

    // 導回首頁
    router.push('/')
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: error?.response?.data?.message || '發生錯誤'
    })
  } finally {
    loading.value = false
  }
}

const registerAdmin = async () => {
  // 格式化電話號碼，移除 "-" 符號

  adminForm.phoneNumber = adminForm.phoneNumber.replace(/-/g, '')

  if (!validateForm(adminForm)) {
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: '表單驗證未通過'
    })
    return
  }

  if (!validatePassword(adminForm.password)) {
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: '密碼必須包含至少一個大寫字母、一個小寫字母和一個數字，且長度至少為 8 個字'
    })
    return
  }

  if (adminForm.taxId && !validateTaiwanBusinessNumber(adminForm.taxId)) {
    Swal.fire({
      icon: 'error',
      title: '失敗',
      text: '統一編號格式錯誤'
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
  if (tab.value === 'user') {
    userForm.birthdate = date
  } else if (tab.value === 'admin') {
    adminForm.birthdate = date
  }
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
