// plugins/axios.js
import axios from 'axios'
import { useUserStore } from '/stores/user.js'

export default defineNuxtPlugin(nuxtApp => {
  const api = axios.create({
    baseURL: useRuntimeConfig().public.apiBaseUrl
  })

  const apiAuth = axios.create({
    baseURL: useRuntimeConfig().public.apiBaseUrl
  })

  apiAuth.interceptors.request.use(config => {
    const user = useUserStore()
    if (user.token) {
      config.headers.authorization = 'Bearer ' + user.token
    }
    return config
  })

  apiAuth.interceptors.response.use(
    res => res,
    async error => {
      if (error.response && error.response.status === 401) {
        const user = useUserStore()
        if (!['/users/extend', '/users/login', '/users/logout'].includes(error.config.url)) {
          try {
            const { data } = await apiAuth.patch('/users/extend')
            user.token = data.result
            error.config.headers.authorization = 'Bearer ' + user.token
            return axios(error.config)
          } catch (_) {
            user.logout()
            return Promise.reject(error)
          }
        }
      }
      return Promise.reject(error)
    }
  )

  nuxtApp.provide('api', api)
  nuxtApp.provide('apiAuth', apiAuth)
})
