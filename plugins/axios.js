import axios from 'axios'
import { useUserStore } from '/stores/user.js'

export const api = axios.create({
  baseURL: process.env.VITE_API || 'http://localhost:4000'
})

export const apiAuth = axios.create({
  baseURL: process.env.VITE_API || 'http://localhost:4000'
})

// 呼叫 axios ---> interceptors.request ---> 送出請求 ---> interceptors.response ---> 呼叫的地方
apiAuth.interceptors.request.use(config => {
  const user = useUserStore()
  if (user.token) {
    config.headers.authorization = 'Bearer ' + user.token
  }
  return config
})

// apiAuth.interceptors.response.use(成功時的 function, 失敗時的 function)
apiAuth.interceptors.response.use(
  res => res,
  async error => {
    if (error.response) {
      if (error.response.status === 401) {
        if (!['/users/extend', '/users/login', '/users/logout'].includes(error.config.url)) {
          const user = useUserStore()
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
    }
    return Promise.reject(error)
  }
)

export default defineNuxtPlugin(() => {
  return {
    provide: {
      api,
      apiAuth
    }
  }
})
