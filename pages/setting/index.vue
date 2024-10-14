<template>
  <q-page>
    <div id="profile">
      <div>
        <div class="top">
          <div class="basicSetting">
            <div class="row items-center nomalTitle3 justify-start">
              <p class="text-center">基本資料設定</p>
            </div>

            <q-card class="profileCard">
              <q-form class="profileForm">
                <q-input class="q-my-sm" v-model="form.account" label="帳號" outlined readonly />
                <q-input class="q-my-sm" v-model="form.email" label="電子郵件" type="email" :rules="[validateEmail]" outlined hide-bottom-space />

                <q-input class="q-my-sm" v-model="form.name" label="姓名" outlined />
                <q-input class="q-my-sm" v-model="form.address" label="地址" outlined />
                <q-input class="q-my-sm" v-model="form.companyName" label="公司名稱" outlined />
                <q-input class="q-my-sm" v-model="form.taxId" label="統一編號" :rules="[validateTaiwanBusinessNumber]" outlined hide-bottom-space />
                <q-input class="q-my-sm" readonly v-model="form.phoneNumber" label="手機號碼" outlined />
                <div class="profileUpdateBtns">
                  <q-btn class="q-my-sm" @click="updateProfile" label="更新資料" color="yellow-7" text-color="black" :loading="loading" :disable="!isFormChanged" />
                  <q-btn class="q-my-sm" @click="openChangePasswordDialog" label="更換密碼" color="yellow-7" text-color="black" />
                </div>
              </q-form>
            </q-card>
          </div>

          <div v-if="isAdmin" class="storeSetting">
            <div class="row items-center nomalTitle3 justify-start">
              <p class="text-center">店家資訊設定</p>
            </div>

            <div class="inputs row w-100">
              <q-select class="q-py-sm" v-model="form.categories" :options="categoryOptions" label="選擇類別" multiple outlined emit-value map-options />
            </div>

            <div class="openingHours row items-center">
              <q-input class="q-pr-sm" v-model="form.openingStart" label="營業開始時間" outlined mask="##:##" />

              <q-input class="q-pr-sm" v-model="form.openingEnd" label="營業結束時間" mask="##:##" outlined />
              <q-input class="q-pr-sm" v-model="form.storePhone" label="店家電話" outlined />
            </div>

            <!-- 產品分類按钮 -->
            <!-- <q-btn @click="openProductTabDialog" label="設定產品分類" color="primary" :loading="loading" class="q-mt-md" /> -->

            <div class="descriptionInput">
              <q-editor class="q-my-sm" v-model="form.description" label="描述" type="textarea" outlined style="flex: 1" />
            </div>
            <div class="updateDescriptionBtn">
              <q-btn @click="updateDescription" label="更新資訊" color="yellow-7" text-color="black" :loading="loading" class="q-mt-md" :disable="!isStoreFormChanged" />
            </div>
          </div>
        </div>

        <div v-if="isAdmin" class="imgSetting">
          <div class="row items-center nomalTitle3 justify-start">
            <p class="text-center">商家圖片</p>
          </div>

          <div class="logoAreas">
            <!-- Banner 圖片區域 -->
            <div class="q-mt-md logoArea">
              <div class="top">
                <div class="nowImg">
                  <p>橫幅圖片</p>
                  <!-- 顯示新上傳的圖片或現在圖片 -->
                  <img :src="bannerPreview || storeImages.banner" alt="Banner Image" class="q-mb-md" style="max-width: 100%" />
                </div>
              </div>
              <div class="toImg">
                <label class="customUploadBtn">
                  選擇橫幅圖片
                  <input type="file" @change="previewCover" hidden />
                </label>
                <q-btn @click="uploadBanner" label="上傳橫幅圖片" color="yellow-7" text-color="black" :loading="loading" :disable="!bannerFile" />
              </div>
            </div>

            <!-- 封面圖片區域 -->
            <div class="q-mt-md logoArea">
              <div class="top">
                <div class="nowImg">
                  <p>封面圖片</p>
                  <!-- 顯示新上傳的圖片或現在圖片 -->
                  <img :src="coverPreview || storeImages.cover" alt="Cover Image" class="q-mb-md" style="max-width: 100%" />
                </div>
              </div>
              <div class="toImg">
                <label class="customUploadBtn">
                  選擇封面圖片
                  <input type="file" @change="previewCover" hidden />
                </label>

                <q-btn @click="uploadCover" label="上傳封面圖片" color="yellow-7" text-color="black" :loading="loading" :disable="!coverFile" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 更換密碼Dialog -->
      <q-dialog v-model="showChangePasswordDialog" persistent>
        <q-card>
          <q-card-section>
            <div class="text-h6">更換密碼</div>
          </q-card-section>
          <q-card-section>
            <q-input v-model="changePasswordForm.currentPassword" label="當前密碼" type="password" outlined />
            <q-input
              v-model="changePasswordForm.newPassword"
              :rules="[val => validatePassword(val) || '密碼必須包含至少一個大寫字母、一個小寫字母和一個數字，且長度至少為 8 個字']"
              label="新密碼"
              type="password"
              outlined />
            <q-input
              v-model="changePasswordForm.confirmNewPassword"
              label="確認新密碼"
              type="password"
              :rules="[val => val === changePasswordForm.newPassword || '新密碼和確認新密碼不符合']"
              outlined />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="取消" color="negative" @click="showChangePasswordDialog = false" />
            <q-btn flat label="確認" color="primary" @click="changePassword" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- 產品分類設定的對話框 -->
      <q-dialog v-model="showProductTabDialog" persistent>
        <q-card>
          <q-card-section>
            <div class="text-h6">產品分類設定</div>
          </q-card-section>

          <q-card-section>
            <div v-for="(tab, index) in form.productTabs" :key="index" class="row q-my-sm">
              <q-input v-model="form.productTabs[index]" label="分類名稱" outlined />
              <q-btn flat icon="delete" color="negative" @click="removeProductTab(index)" />
            </div>
            <q-btn flat icon="add" @click="addProductTab">新增分類</q-btn>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="取消" color="negative" @click="showProductTabDialog = false" />
            <q-btn flat label="確認" color="primary" @click="saveProductTabs" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import Swal from 'sweetalert2'
import { useUserStore } from '/stores/user'
import { storeToRefs } from 'pinia'
import { useCategoryStore } from '/stores/category'

useHead({
  title: '北台灣企業餐飲團訂網｜設定',
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
      content: '北台灣企業餐飲團訂網｜設定'
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
      content: 'https://www.beifoodorder.com/setting'
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
const { $apiAuth } = useNuxtApp()
const user = useUserStore()
const loading = ref(false)
const isFormChanged = ref(false)
const isStoreFormChanged = ref(false)

const { isAdmin } = storeToRefs(user)
definePageMeta({
  layout: 'admin'
})

const form = ref({
  account: '',
  email: '',
  name: '',
  address: '',
  companyName: '',
  taxId: '',
  phoneNumber: '',
  description: '',
  categories: [],
  currentPassword: '',
  password: '',
  confirmPassword: '',
  openingStart: '',
  openingEnd: '',
  storePhone: '',
  productTabs: []
})

const storeImages = ref({
  banner: '',
  cover: ''
})

const bannerPreview = ref(null)
const coverPreview = ref(null)
let bannerFile = null
let coverFile = null

const showChangePasswordDialog = ref(false)
const changePasswordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: ''
})

const categoryStore = useCategoryStore()

// 根據 categories 動態生成 categoryOptions
const categoryOptions = computed(() =>
  categoryStore.categories.map(category => ({
    label: category,
    value: category
  }))
)

const showProductTabDialog = ref(false)
const originalForm = reactive({})
const originalStoreForm = reactive({})
onMounted(async () => {
  try {
    const { data } = await $apiAuth.get('/users/me')
    form.value = {
      account: data.result.account,
      email: data.result.email,
      name: data.result.name,
      address: data.result.address,
      companyName: data.result.companyName,
      taxId: data.result.taxId,
      phoneNumber: data.result.phoneNumber,
      description: '',
      categories: [],
      openingStart: '',
      openingEnd: '',
      storePhone: '',
      productTabs: []
    }

    if (isAdmin.value) {
      const storeImagesRes = await $apiAuth.get('/users/store-images')

      if (storeImagesRes.data.message === '尚未建立商店檔案') {
        // 沒有商店檔案，但這不是錯誤，所以不顯示錯誤提示
        form.value.description = ''
        form.value.categories = []
        form.value.openingStart = ''
        form.value.openingEnd = ''
        form.value.storePhone = ''
        form.value.productTabs = []
      } else {
        // 正常獲取商店資料
        storeImages.value.banner = storeImagesRes.data.result.banner
        storeImages.value.cover = storeImagesRes.data.result.cover
        form.value.description = storeImagesRes.data.result.description || ''
        form.value.categories = storeImagesRes.data.result.categories ? storeImagesRes.data.result.categories.split(',') : []
        form.value.productTabs = storeImagesRes.data.result.productTabs ? storeImagesRes.data.result.productTabs.split(',') : []

        const [start, end] = storeImagesRes.data.result.openingHours ? storeImagesRes.data.result.openingHours.split('-') : ['', '']
        form.value.openingStart = start
        form.value.openingEnd = end
        form.value.storePhone = storeImagesRes.data.result.storePhone
      }
    }
    // 初始化 originalForm
    Object.assign(originalForm, {
      account: form.value.account,
      email: form.value.email,
      name: form.value.name,
      address: form.value.address,
      companyName: form.value.companyName,
      taxId: form.value.taxId,
      phoneNumber: form.value.phoneNumber
    })
    Object.assign(
      originalStoreForm,
      JSON.parse(
        JSON.stringify({
          description: form.value.description,
          categories: form.value.categories,
          openingStart: form.value.openingStart,
          openingEnd: form.value.openingEnd,
          storePhone: form.value.storePhone,
          productTabs: form.value.productTabs
        })
      )
    )
    // 監控表單變化

    watch(
      () => ({
        account: form.value.account,
        email: form.value.email,
        name: form.value.name,
        address: form.value.address,
        companyName: form.value.companyName,
        taxId: form.value.taxId,
        phoneNumber: form.value.phoneNumber
      }),
      newForm => {
        // 只比較基本資料部分
        isFormChanged.value = JSON.stringify(newForm) !== JSON.stringify(originalForm)
      },
      { deep: true }
    )

    // 監控店家資訊變動
    watch(
      () => ({
        description: form.value.description,
        categories: form.value.categories,
        openingStart: form.value.openingStart,
        openingEnd: form.value.openingEnd,
        storePhone: form.value.storePhone,
        productTabs: form.value.productTabs
      }),
      newStoreForm => {
        isStoreFormChanged.value = JSON.stringify(newStoreForm) !== JSON.stringify(originalStoreForm)
      },
      { deep: true }
    )
  } catch (error) {
    Swal.fire({ icon: 'error', title: '失敗', text: '無法獲取商店信息' })
  }
})

const openProductTabDialog = () => {
  showProductTabDialog.value = true
}

const addProductTab = () => {
  form.value.productTabs.push('')
}

const removeProductTab = index => {
  form.value.productTabs.splice(index, 1)
}

const saveProductTabs = async () => {
  showProductTabDialog.value = false

  const productTabsString = form.value.productTabs.join(',')

  try {
    // 單獨調用 API 更新產品分類 tabs
    await $apiAuth.post('/users/updateProductTabs', {
      productTabs: productTabsString // 只提交 productTabs
    })
    Swal.fire({ icon: 'success', title: '成功', text: '產品分類已更新' })
  } catch (error) {
    Swal.fire({ icon: 'error', title: '失敗', text: error?.response?.data?.message || '產品分類更新失敗' })
  }
}

const validateEmail = email => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
  return emailPattern.test(email) || '信箱格式錯誤'
}

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

const updateProfile = async () => {
  // 驗證信箱格式
  if (!validateEmail(form.value.email)) {
    Swal.fire({ icon: 'error', title: '失敗', text: '信箱格式錯誤' })
    return
  }

  if (form.value.taxId && !validateTaiwanBusinessNumber(form.value.taxId)) {
    Swal.fire({ icon: 'error', title: '失敗', text: '統一編號格式錯誤' })
    return
  }

  loading.value = true
  try {
    await $apiAuth.put('/users/me', form.value)
    Swal.fire({ icon: 'success', title: '成功', text: '資料已更新' })
    Object.assign(originalForm, form)
  } catch (error) {
    Swal.fire({ icon: 'error', title: '失敗', text: error?.response?.data?.message || '發生錯誤' })
  } finally {
    loading.value = false
  }
}

const openChangePasswordDialog = () => {
  changePasswordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  }
  showChangePasswordDialog.value = true
}

const validatePassword = password => {
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/
  return passwordPattern.test(password)
}

const changePassword = async () => {
  const { currentPassword, newPassword, confirmNewPassword } = changePasswordForm.value

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    Swal.fire({ icon: 'error', title: '失敗', text: '所有欄位都不能為空' })
    return
  }

  if (newPassword !== confirmNewPassword) {
    Swal.fire({ icon: 'error', title: '失敗', text: '新密碼和確認新密碼不匹配' })
    return
  }

  // 驗證密碼格式
  if (!validatePassword(newPassword)) {
    Swal.fire({ icon: 'error', title: '失敗', text: '密碼必須包含至少一個大寫字母、一個小寫字母和一個數字，且長度至少為 8 個字' })
    return
  }

  loading.value = true
  try {
    const response = await $apiAuth.put('/users/updatePassword', {
      currentPassword,
      newPassword
    })
    Swal.fire({ icon: 'success', title: '成功', text: response.data.message })
  } catch (error) {
    Swal.fire({ icon: 'error', title: '失敗', text: error?.response?.data?.message || '無法更新密碼' })
  } finally {
    showChangePasswordDialog.value = false
    loading.value = false
  }
}

const previewBanner = event => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = e => {
      bannerPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
    bannerFile = file
  }
}

const previewCover = event => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = e => {
      coverPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
    coverFile = file
  }
}

const uploadBanner = async () => {
  if (!bannerFile) {
    return Swal.fire({ icon: 'error', title: '失敗', text: '請選擇一張橫幅圖片' })
  }

  const formData = new FormData()
  formData.append('image', bannerFile)

  loading.value = true
  try {
    const { data } = await $apiAuth.post('/users/banner', formData)
    storeImages.value.banner = data.result.path
    Swal.fire({ icon: 'success', title: '成功', text: '橫幅圖片已更新' })
    bannerPreview.value = null
  } catch (error) {
    Swal.fire({ icon: 'error', title: '失敗', text: error?.response?.data?.message || '上傳失敗' })
  } finally {
    loading.value = false
  }
}

const uploadCover = async () => {
  if (!coverFile) {
    return Swal.fire({ icon: 'error', title: '失敗', text: '請選擇一張封面圖片' })
  }

  const formData = new FormData()
  formData.append('image', coverFile)

  loading.value = true
  try {
    const { data } = await $apiAuth.post('/users/cover', formData)
    storeImages.value.cover = data.result.path
    Swal.fire({ icon: 'success', title: '成功', text: '封面圖片已更新' })
    coverPreview.value = null
  } catch (error) {
    Swal.fire({ icon: 'error', title: '失敗', text: error?.response?.data?.message || '上傳失敗' })
  } finally {
    loading.value = false
  }
}

const updateDescription = async () => {
  if (!form.value.description) {
    return Swal.fire({ icon: 'error', title: '失敗', text: '描述不能為空' })
  }

  const openingHours = `${form.value.openingStart}-${form.value.openingEnd}`
  const productTabsString = form.value.productTabs.join(',')

  loading.value = true
  try {
    const categoriesString = form.value.categories.join(',')

    //console.log({
    //   description: form.value.description,
    //   categories: categoriesString,
    //   openingHours,
    //   productTabs: productTabsString // 检查前端是否正确提交这个字段
    // })

    await $apiAuth.post('/users/description', {
      description: form.value.description,
      categories: categoriesString,
      openingHours,
      storePhone: form.value.storePhone
    })
    Swal.fire({ icon: 'success', title: '成功', text: '店家資料已更新' })
  } catch (error) {
    Swal.fire({ icon: 'error', title: '失敗', text: error?.response?.data?.message || '更新失敗' })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
@import 'assets/setting/index.scss';
</style>
