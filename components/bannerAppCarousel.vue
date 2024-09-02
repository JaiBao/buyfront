<template>
  <Carousel v-bind="settings" :breakpoints="breakpoints" :wrap-around="true" :transition="500" :autoplay="10000">
    <Slide v-for="(slide, index) in slidesAPP" :key="index" class="lt-md">
      <div class="carousel__item">
        <!-- <nuxt-link :to="slide.href"> -->
        <img :src="slide.image" alt="" />
        <!-- </nuxt-link> -->
        <!-- <q-card-section>
            <div class="text-p text-black rankCarouselText">{{ slide.title }}</div>
            <div class="text-h6">{{ slide.content }}</div>
          </q-card-section> -->
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
import { ref } from 'vue'
import { Carousel, Navigation, Slide, Pagination } from 'vue3-carousel'

import 'vue3-carousel/dist/carousel.css'

const slidesAPP = ref([
  {
    image: '/index/Banner01.png'

    // href: '/aboutUs'
  },
  {
    image: '/index/Banner02.png'

    // href: '/cookie'
  },
  {
    image: '/index/Banner03.png'

    // href: '/soy'
  },
  {
    image: '/index/Banner04.png'

    // href: '/soy'
  }
])
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
</script>

<style lang="scss" scoped>
@import 'assets/components/bannerCarousel';
</style>
