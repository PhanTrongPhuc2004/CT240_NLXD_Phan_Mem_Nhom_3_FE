// src/stores/auth.js - ĐÃ SỬA HOÀN CHỈNH: Đảm bảo token được lưu đúng, redirect không còn lỗi "/dashboard"
import { defineStore } from 'pinia'
import { login, getCurrentUser } from '@/api/userApi'
import router from '@/router'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: null,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
    }),

    getters: {
        userRole: (state) => state.user?.role || 'MEMBER',
        isAdmin: (state) => ['ADMIN', 'MANAGER'].includes(state.user?.role),
        isMember: (state) => state.user?.role === 'MEMBER'
    },

    actions: {
        async login(credentials) {
            this.loading = true
            this.error = null

            try {
                const response = await login(credentials) // BE trả { token, message, user? }

                // LƯU TOKEN TRƯỚC TIÊN (đây là nguyên nhân token undefined trước đó)
                this.token = response.token || response.data?.token // xử lý cả response trực tiếp và response.data
                if (!this.token) {
                    throw new Error('Không nhận được token từ server')
                }

                this.isAuthenticated = true
                localStorage.setItem('auth_token', this.token)

                // Lấy user (role) từ response hoặc gọi API /me
                this.user = response.user || response.data?.user || null
                if (this.user) {
                    localStorage.setItem('auth_user', JSON.stringify(this.user))
                } else {
                    await this.fetchCurrentUser()
                }

                // TỰ ĐỘNG REDIRECT THEO ROLE - KHÔNG PUSH '/dashboard' NỮA
                const role = this.userRole
                console.log('User role after login:', role) // Debug để kiểm tra role có lấy được không

                if (role === 'ADMIN' || role === 'MANAGER') {
                    router.push('/admin')
                } else {
                    router.push('/')
                }

                return response
            } catch (err) {
                this.error = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.'
                console.error('Login error:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        async fetchCurrentUser() {
            if (!this.token) {
                console.warn('No token available for fetchCurrentUser')
                return
            }

            try {
                const userData = await getCurrentUser()
                this.user = userData
                localStorage.setItem('auth_user', JSON.stringify(this.user))
                console.log('Fetched user:', this.user) // Debug role
            } catch (err) {
                console.error('Fetch current user failed:', err)
                this.logout()
            }
        },

        initializeAuth() {
            const token = localStorage.getItem('auth_token')
            const userStr = localStorage.getItem('auth_user')

            if (token) {
                this.token = token
                this.isAuthenticated = true
                console.log('Initialized token from storage:', token.substring(0, 20) + '...')
            }

            if (userStr) {
                try {
                    this.user = JSON.parse(userStr)
                    console.log('Initialized user from storage:', this.user)
                } catch (e) {
                    console.error('Parse user from storage failed:', e)
                    this.logout()
                }
            }

            if (this.token && !this.user) {
                this.fetchCurrentUser()
            }
        },

        logout() {
            this.token = null
            this.user = null
            this.isAuthenticated = false
            this.error = null

            localStorage.removeItem('auth_token')
            localStorage.removeItem('auth_user')

            router.push('/login')
        },

        updateUser(userData) {
            this.user = { ...this.user, ...userData }
            localStorage.setItem('auth_user', JSON.stringify(this.user))
        }
    }
})