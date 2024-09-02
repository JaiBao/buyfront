<template>
  <q-page>
    <div id="profile">
      <div>
        <div cols="12">
          <h3 class="text-center">個人資料修改</h3>
        </div>
        <q-separator />
        <q-card class="profileCard">
          <q-form class="profileForm">
            <q-input v-model="form.account" label="帳號" outlined readonly />
            <q-input v-model="form.email" label="電子郵件" outlined />
            <q-input v-model="form.name" label="姓名" outlined />
            <q-input v-model="form.address" label="地址" outlined />
            <q-input v-model="form.companyName" label="公司名稱" outlined />
            <q-input v-model="form.taxId" label="統一編號" outlined />
            <q-input v-model="form.phoneNumber" label="手機號碼" outlined />
            <q-btn class="q-ma-sm" @click="updateProfile" label="更新資料" color="primary" :loading="loading" />
            <q-btn class="q-ma-sm" @click="openChangePasswordDialog" label="更換密碼" color="primary" />
          </q-form>
        </q-card>
        <div v-if="isAdmin">
          <h3>商家圖片</h3>
          <div class="logoAreas">
            <div class="q-mt-md logoArea">
              <div class="top">
                <div class="nowImg">
                  <p>現在Banner</p>
                  <img v-if="storeImages.banner" :src="storeImages.banner" alt="Current Banner" class="q-mb-md" style="max-width: 100%" />
                </div>
                <div class="toImg">
                  <input type="file" @change="previewBanner" />
                  <img v-if="bannerPreview" :src="bannerPreview" alt="Banner Preview" class="q-mt-md" style="max-width: 100%" />
                </div>
              </div>
              <q-btn @click="uploadBanner" label="上傳橫幅圖片" color="primary" :loading="loading" class="q-mt-md" />
            </div>

            <div class="q-mt-md logoArea">
              <div class="top">
                <div class="nowImg">
                  <p>現在圖片</p>
                  <img v-if="storeImages.cover" :src="storeImages.cover" alt="Current Cover" class="q-mb-md" style="max-width: 100%" />
                </div>
                <div class="toImg">
                  <input type="file" @change="previewCover" />
                  <img v-if="coverPreview" :src="coverPreview" alt="Cover Preview" class="q-mt-md" style="max-width: 100%" />
                </div>
              </div>
              <q-btn @click="uploadCover" label="上傳封面圖片" color="primary" :loading="loading" class="q-mt-md" />
            </div>
          </div>
          <div class="q-mt-md">
            <h3>店家資訊</h3>
            <div class="inputs row">
              <q-select v-model="form.categories" :options="categoryOptions" label="選擇類別" multiple outlined emit-value map-options />

              <div class="openingHours row items-center">
                <q-input v-model="form.openingStart" label="營業開始時間" outlined mask="##:##" />
                到
                <q-input v-model="form.openingEnd" label="營業結束時間" mask="##:##" outlined />
              </div>

              <!-- 產品分類按钮 -->
              <q-btn @click="openProductTabDialog" label="設定產品分類" color="primary" :loading="loading" class="q-mt-md" />
            </div>
            <q-editor v-model="form.description" label="描述" type="textarea" outlined />

            <q-btn @click="updateDescription" label="更新資訊" color="primary" :loading="loading" class="q-mt-md" />
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
            <q-input v-model="changePasswordForm.newPassword" label="新密碼" type="password" outlined />
            <q-input v-model="changePasswordForm.confirmNewPassword" label="確認新密碼" type="password" outlined />
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
const { $apiAuth } = useNuxtApp()
const user = useUserStore()
const loading = ref(false)

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
  productTabs: [] // 新增的产品分类 tabs 数组
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

const categoryOptions = [
  { label: '中式料理', value: '中式料理' },
  { label: '韓式料理', value: '韓式料理' },
  { label: '日式料理', value: '日式料理' },
  { label: '手搖杯飲料', value: '手搖杯飲料' },
  { label: '其他', value: '其他' }
]

const showProductTabDialog = ref(false)

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
      }
    }
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

const updateProfile = async () => {
  if (form.value.password && form.value.password !== form.value.confirmPassword) {
    return Swal.fire({ icon: 'error', title: '失敗', text: '新密碼與確認新密碼不一致' })
  }

  loading.value = true
  try {
    await $apiAuth.put('/users/me', form.value)
    Swal.fire({ icon: 'success', title: '成功', text: '資料已更新' })
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

    // console.log({
    //   description: form.value.description,
    //   categories: categoriesString,
    //   openingHours,
    //   productTabs: productTabsString // 检查前端是否正确提交这个字段
    // })

    await $apiAuth.post('/users/description', {
      description: form.value.description,
      categories: categoriesString,
      openingHours
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
