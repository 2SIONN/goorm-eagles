import axios from 'axios'

import { token } from './token'

const BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : '/api'

// let refreshingPromise = null

export const api = axios.create({
  baseURL: BASE,
  timeout: 1000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      token.clear() // 토큰 제거
      // location.assign('/') // 필요 시 이동
    }
    return Promise.reject(err)
  }
)

api.interceptors.request.use((config) => {
  const t = token.get()
  if (config.auth !== false && t) {
    ;(config.headers ||= {}).Authorization = `Bearer ${t}`
  }
  return config
})

// refreshOnce: 동시 401 발생 시 한 번만 수행
// async function refreshOnce() {
//   if (!refreshingPromise) {
//     refreshingPromise = (async () => {
//       const res = await api.post('/auth/refresh', null, {
//         withCredentials: true, // rt 쿠키
//         auth: false, // Authorization 미첨부
//         _skipRetry: true, // 응답 인터셉터 재시도 루프 방지
//       })
//       const t = res?.data?.token
//       if (!t) {
//         token.clear()
//         throw new Error('REFRESH_FAILED')
//       }
//       token.set(t)
//       return t
//     })().finally(() => {
//       refreshingPromise = null
//     })
//   }
//   return refreshingPromise
// }

// 요청 인터셉터: Authorization 자동 주입 (auth !== false일 때)
// api.interceptors.request.use((config) => {
//   const needsAuth = config.auth !== false
//   const t = token.get()
//   if (needsAuth && t) {
//     config.headers = config.headers ?? {}
//     config.headers.Authorization = `Bearer ${t}`
//   }
//   return config
// })

// 응답 인터셉터: 401 → refreshOnce → 1회 재시도, 에러 정규화
// api.interceptors.response.use(
//   (res) => res,
//   async (error) => {
//     const res = error.response
//     const config = error.config ?? {}
//     const shouldRetry =
//       res?.status === 401 && config._retried !== true && config.auth !== false && config._skipRetry !== true

//     if (shouldRetry) {
//       try {
//         await refreshOnce()
//         return api({ ...config, _retried: true })
//       } catch {
//         // refresh 실패 → 아래서 표준 에러로
//       }
//     }

//     const status = res?.status ?? 0
//     const data = res?.data ?? null
//     const msg =
//       (data && (data.error || data.message)) || (status ? `HTTP_${status}` : error.message)
//     const norm = new Error(msg)
//     norm.status = status
//     norm.data = data
//     throw norm
//   }
// )

// 심플 헬퍼 (원래 http 객체와 유사하지만 더 짧게)
export const http = {
  get: (url, o) => api.get(url, o).then((r) => r.data),
  post: (url, body, o) => api.post(url, body, o).then((r) => r.data),
  patch: (url, body, o) => api.patch(url, body, o).then((r) => r.data),
  del: (url, o) => api.delete(url, o).then((r) => r.data),
}
