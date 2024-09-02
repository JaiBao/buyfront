// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      gtagId: 'G-T8PPRE6ZW8',
      gtmId: 'GTM-TDBTJ49D', //  GTM ID
      quantityApiBaseUrl: process.env.QUANTITY_API_BASE_URL || 'https://www.dtstw.com/api',
      posApiBaseUrl: process.env.POS_API_BASE_URL || 'http://tods.dtstw.com/api',
      bingApiBaseUrl: process.env.BING_API_BASE_URL || 'https://www.chinabing.net/tods',
      apiBaseUrl: process.env.VITE_API
    }
  },
  head: {
    title: '北台灣訂購網',
    meta: [
      {
        name: 'description',
        content: '北台灣訂購網'
      }
    ]
  },
  // 開發者工具
  devtools: { enabled: true },
  // 使用的模块
  modules: ['@pinia/nuxt', 'nuxt-quasar-ui', 'nuxt-simple-sitemap', '@nuxt/image', '@pinia-plugin-persistedstate/nuxt'],
  css: ['~/assets/global.scss'],
  // Quasar 插件配置
  quasar: {
    lang: 'zh-TW',
    cssAddon: true,
    plugins: ['Notify', 'Loading'],
    config: {
      lang: 'zh-tw'
    }
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', 'sitemap.xml'],
      ignore: []
    }
  },
  // 網站訊息
  site: {
    url: 'https://www.beifoodorder.com'
  },
  // 路由配置
  router: {
    trailingSlash: false
    // middleware: ['agreeCollection']
  }
})
