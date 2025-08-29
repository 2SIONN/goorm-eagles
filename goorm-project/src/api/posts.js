import { http } from '@/api/http'

const API_ROOT = import.meta.env.VITE_API_URL || ''
const BASE_PATH = '/posts'
const BASE_URL = API_ROOT ? `${API_ROOT}${BASE_PATH}` : BASE_PATH

export const postsApi = {
  list: ({ q, tag, page = 1, limit = 100 } = {}) => {
    const params = new URLSearchParams()
    if (q) {
      params.set('q', q)
    }
    if (tag) {
      params.set('tag', tag)
    }
    params.set('page', String(page))
    params.set('limit', String(limit))

    return http(`${BASE_URL}?${params.toString()}`, { auth: false })
  },

  get: (id) => http(`${BASE_URL}/${id}`, { auth: false }),

  create: (payload) => http(BASE_URL, { method: 'POST', body: payload, auth: true }),

  update: (id, payload) =>
    http(`${BASE_URL}/${id}`, { method: 'PATCH', body: payload, auth: true }),

  remove: (id) => http(`${BASE_URL}/${id}`, { method: 'DELETE', auth: true }),
}
