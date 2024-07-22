export default defineNuxtPlugin(nuxtApp => {
  const { gtagId, gtmId } = useRuntimeConfig().public

  // GA Initialization
  function gtag() {
    window.dataLayer.push(arguments)
  }

  window.dataLayer = window.dataLayer || []

  gtag('js', new Date())
  gtag('config', gtagId)

  // GTM Initialization (放在 head 中)
  const gtmScript = document.createElement('script')
  gtmScript.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`
  document.head.appendChild(gtmScript)

  useHead({
    script: [
      {
        src: `https://www.googletagmanager.com/gtag/js?id=${gtagId}`,
        async: true
      }
    ],
    __dangerouslyDisableSanitizers: ['noscript'], // 避免 Nuxt 清理 noscript 標籤
    noscript: [
      {
        innerHTML: `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`
      }
    ]
  })
})
