// src/api/index.js (thêm hoặc sửa interceptor)
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    const authStore = useAuthStore()
    if (error.response?.status === 401) {
      // Chỉ logout nếu KHÔNG phải endpoint profile (GET/PUT /users/me)
      if (!error.config.url.includes('/users/me')) {
        authStore.logout()
        router.push('/login?session_expired=true')
      }
    }
    return Promise.reject(error)
  }
)

export default api