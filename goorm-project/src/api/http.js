import axios from 'axios'

import { token } from './token'

const BASE_API_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : '/api'

export const api = axios.create({
  baseURL: BASE_API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  if (config.auth !== false && token.get()) {
    config.headers.Authorization = `Bearer ${token.get()}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(error)
    return Promise.reject(error)
  }
)

/**
 * fetchApi 스타일 범용 요청 함수
 * @param {string} url 요청 URL
 * @param {object} options method, body, auth 등
 */
export async function http(url, { method = 'GET', body, withAuth } = {}) {
  try {
    const res = await api.request({
      url,
      method,
      data: body,
      withAuth,
    })
    return res.data
  } catch (err) {
    const res = err.response
    const data = res?.data || {}

    const error = new Error(data?.error?.message || data?.message || 'Request failed')
    error.data = data
    error.status = res?.status
    throw error
  }
}
