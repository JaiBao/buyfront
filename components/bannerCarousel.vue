<template>
  <Carousel v-bind="settings" :breakpoints="breakpoints" :wrap-around="true" :transition="500" :autoplay="bannerAutoplay">
    <Slide v-for="(slide, index) in bannerImages" :key="index">
      <div class="carousel__item">
        <nuxt-link v-if="slide.link_to" :to="slide.link_to">
          <img :src="slide.image_url" alt="" />
        </nuxt-link>
        <img v-else :src="slide.image_url" alt="" />
      </div>
    </Slide>

    <template #addons>
      <Pagination />
    </template>
    <!-- <template #addons>
      <navigation>
        <template #next>
          <img src="/index/iconRight.jpg" alt="next" />
        </template>
        <template #prev>
          <img src="/index/iconLeft.jpg" alt="prev" />
        </template>
      </navigation>
    </template> -->
  </Carousel>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Carousel, Slide, Pagination } from 'vue3-carousel'
import 'vue3-carousel/dist/carousel.css'

const bannerImages = ref([]) // 用於存儲動態加載的圖片數據
const bannerAutoplay = ref(10000) // 預設自動播放時間

const settings = ref({
  itemsToShow: 1,
  snapAlign: 'center'
})
const breakpoints = ref({
  // 300: {
  //   itemsToShow: 2,
  //   snapAlign: 'center'
  // },
  // 576: {
  //   itemsToShow: 3,
  //   snapAlign: 'center'
  // },
  // 992: {
  //   itemsToShow: 3,
  //   snapAlign: 'center'
  // },
  // 1200: {
  //   itemsToShow: 3,
  //   snapAlign: 'center'
  // },
  // 1920: {
  //   itemsToShow: 3,
  //   snapAlign: 'center'
  // }
})

const fetchCarouselImages = async () => {
  try {
    const { $apiAuth } = useNuxtApp()
    const { data } = await $apiAuth.get('/users/carousel-images')
    if (data.success) {
      bannerImages.value = data.result
    }
  } catch (error) {
    console.error('Error loading carousel images:', error)
  }
}

const fetchCarouselSettings = async () => {
  try {
    const { $apiAuth } = useNuxtApp()
    const { data } = await $apiAuth.get('/users/carousel-settings')
    if (data.success) {
      bannerAutoplay.value = data.result.autoplay_interval || 10000
    }
  } catch (error) {
    console.error('Error loading carousel settings:', error)
  }
}

onMounted(() => {
  fetchCarouselImages()
  fetchCarouselSettings()
})
</script>

<style lang="scss" scoped>
@import 'assets/components/bannerCarousel';
</style>
