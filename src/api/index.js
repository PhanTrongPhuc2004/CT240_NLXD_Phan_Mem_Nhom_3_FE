import axios from 'axios'
import router from '@/router' // Đảm bảo đã import router
// Không import useAuthStore ở đây để tránh circular dependency

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  // Tạm thời tắt withCredentials nếu bạn chỉ dùng JWT qua Header
  withCredentials: false,
  headers: { 'Content-Type': 'application/json' },
})

// Thêm token tự động
api.interceptors.request.use(
  (config) => {
    // Lấy trực tiếp từ localStorage để đảm bảo luôn có dữ liệu mới nhất
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Xử lý lỗi
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Xóa sạch dấu vết khi token hết hạn
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    }

    // Log lỗi chi tiết ra console để bạn dễ debug
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  },
)

export default api
