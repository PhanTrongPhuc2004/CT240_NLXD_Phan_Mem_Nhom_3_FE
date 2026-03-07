// src/api/index.js - ĐÃ THÊM INTERCEPTOR GẮN TOKEN TỰ ĐỘNG
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// TỰ ĐỘNG GẮN TOKEN VÀO HEADER MỌI REQUEST
api.interceptors.request.use(config => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

// XỬ LÝ LỖI 401/403 → logout nếu token hết hạn
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      const authStore = useAuthStore()
      authStore.logout()
      alert('Phiên đăng nhập hết hạn hoặc không có quyền. Vui lòng đăng nhập lại.')
    }
    return Promise.reject(error)
  }
)

export default api