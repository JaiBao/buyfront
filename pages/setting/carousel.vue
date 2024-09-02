<template>
  <q-page>
    <div>
      <div class="row title items-center">
        <h3>管理輪播圖片</h3>
        <q-input v-model.number="autoplayInterval" label="自動播放間隔（毫秒）" type="number" outlined />

        <q-btn label="更新輪播秒數" color="secondary" class="q-mt-md" @click="updateCarouselSettings" />
      </div>
      <q-form @submit.prevent="uploadImage">
        <q-input v-model="linkTo" label="跳轉Link（不填即無Link）" outlined />
        <div class="q-mt-md">
          <label for="image-upload">選擇圖片:</label>
          <input id="image-upload" type="file" @change="onFileChange" accept="image/*" />
          <img v-if="imagePreview" :src="imagePreview" alt="圖片預覽" width="300" class="q-mt-md" />
        </div>

        <q-btn type="submit" label="上傳圖片" color="primary" class="q-mt-md" />
      </q-form>

      <q-separator class="q-my-lg" />

      <h3>現有輪播圖片(左至右依序，最新會在最左)</h3>
      <div v-if="images.length > 0" class="row justify-between">
        <div v-for="image in images" :key="image.id" class="q-my-md">
          <img :src="image.image_url" :alt="'Image ' + image.id" width="300" />
          <p>鏈接到: {{ image.link_to || '無' }}</p>
          <q-btn color="negative" label="刪除" @click="deleteImage(image.id)" />
        </div>
      </div>
      <div v-else>
        <p>暫無輪播圖片</p>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { useQuasar } from 'quasar'

definePageMeta({
  layout: 'admin'
})

const $q = useQuasar()
const imageFile = ref(null)
const linkTo = ref('')
const images = ref([])
const imagePreview = ref('')
const autoplayInterval = ref(10000)
const initialSlide = ref(1)

const { $apiAuth } = useNuxtApp()

const fetchImages = async () => {
  try {
    const { data } = await $apiAuth.get('/users/carousel-images')
    if (data.success) {
      images.value = data.result
    } else {
      Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: '無法獲取輪播圖片'
      })
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '錯誤',
      text: '加載圖片失敗'
    })
  }
}

const onFileChange = event => {
  const file = event.target.files[0]
  if (file) {
    imageFile.value = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

const uploadImage = async () => {
  if (!imageFile.value) {
    return Swal.fire({
      icon: 'warning',
      title: '提示',
      text: '請選擇一張圖片'
    })
  }

  const formData = new FormData()
  formData.append('image', imageFile.value)

  if (linkTo.value) {
    formData.append('link_to', linkTo.value)
  }

  try {
    const { data } = await $apiAuth.post('/users/carousel-image', formData)
    if (data.success) {
      Swal.fire({
        icon: 'success',
        title: '成功',
        text: '圖片上傳成功'
      })
      imagePreview.value = ''
      linkTo.value = ''
      imageFile.value = null
      fetchImages()
    } else {
      Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: '上傳失敗'
      })
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '錯誤',
      text: '上傳圖片時出錯'
    })
  }
}
// 獲取輪播設置
const fetchCarouselSettings = async () => {
  try {
    const { data } = await $apiAuth.get('/users/carousel-settings')
    if (data.success) {
      autoplayInterval.value = data.result.autoplay_interval
    } else {
      Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: '無法獲取輪播設定'
      })
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '錯誤',
      text: '獲取輪播設置時出錯'
    })
  }
}
const updateCarouselSettings = async () => {
  try {
    const { data } = await $apiAuth.post('/users/carousel-settings', {
      autoplay_interval: autoplayInterval.value
    })

    if (data.success) {
      Swal.fire({
        icon: 'success',
        title: '成功',
        text: '輪播設置已更新'
      })
    } else {
      Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: '更新失敗'
      })
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '錯誤',
      text: '更新輪播設置時出錯'
    })
  }
}

const deleteImage = async id => {
  Swal.fire({
    title: '確定刪除這張圖片嗎？',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: '是的，刪除',
    cancelButtonText: '取消'
  }).then(async result => {
    if (result.isConfirmed) {
      try {
        const { data } = await $apiAuth.delete(`/users/carousel-image/${id}`)
        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: '成功',
            text: '圖片已刪除'
          })
          fetchImages()
        } else {
          Swal.fire({
            icon: 'error',
            title: '錯誤',
            text: '刪除失敗'
          })
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: '錯誤',
          text: '刪除圖片時出錯'
        })
      }
    }
  })
}

onMounted(() => {
  fetchImages()
  fetchCarouselSettings()
})
</script>

<style lang="scss" scoped>
@import 'assets/setting/carousel.scss';
</style>
