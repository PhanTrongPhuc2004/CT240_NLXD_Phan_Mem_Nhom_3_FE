// src/stores/auth.js - ĐÃ BỔ SUNG HÀM register() để fix lỗi "authStore.register is not a function"
import { defineStore } from 'pinia'
import { userApi } from '@/api/userApi'
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
        // Đăng nhập (giữ nguyên)
        async login(credentials) {
            this.loading = true
            this.error = null

            try {
                const response = await userApi.login(credentials)

                this.token = response.token || response.data?.token
                if (!this.token) {
                    throw new Error('Không nhận được token từ server')
                }

                this.isAuthenticated = true
                localStorage.setItem('auth_token', this.token)

                this.user = response.user || response.data?.user || null
                if (this.user) {
                    localStorage.setItem('auth_user', JSON.stringify(this.user))
                } else {
                    await this.fetchCurrentUser() // fetchCurrentUser sẽ dùng userApi.getCurrentUser
                }

                const role = this.userRole
                console.log('User role after login:', role)

                if (role === 'ADMIN' || role === 'MANAGER') {
                    router.push('/admin')
                } else {
                    router.push('/')
                }

                console.log('Login response:', response)
                return response
            } catch (err) {
                this.error = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.'
                console.error('Login error:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        // ĐĂNG KÝ - HÀM MỚI ĐỂ FIX LỖI "authStore.register is not a function"
        async register(registrationData) {
            this.loading = true
            this.error = null

            try {
                const response = await userApi.register(registrationData) // Gọi API register

                // Sau đăng ký thành công, có thể tự động login hoặc redirect đến login
                this.token = response.token || response.data?.token
                if (this.token) {
                    this.isAuthenticated = true
                    localStorage.setItem('auth_token', this.token)
                }

                this.user = response.user || response.data?.user || null
                if (this.user) {
                    localStorage.setItem('auth_user', JSON.stringify(this.user))
                }

                // Redirect sau đăng ký (thường về login hoặc dashboard nếu auto-login)
                router.push('/login') // Hoặc '/' nếu BE trả token và muốn auto-login

                console.log('Register response:', response)
                return response
            } catch (err) {
                this.error = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.'
                console.error('Register error:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        async fetchCurrentUser() {
            if (!this.token) return

            try {
                const userData = await userApi.getCurrentUser()
                this.user = userData
                localStorage.setItem('auth_user', JSON.stringify(this.user))
                console.log('Fetched user:', this.user)
            } catch (err) {
                console.error('Fetch user failed:', err)
                this.logout()
            }
        },

        initializeAuth() {
            const token = localStorage.getItem('auth_token')
            const userStr = localStorage.getItem('auth_user')

            if (token) {
                this.token = token
                this.isAuthenticated = true
            }

            if (userStr) {
                try {
                    this.user = JSON.parse(userStr)
                } catch (e) {
                    console.error('Parse user failed:', e)
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
        },

        async updateProfile(profileData) {
            try {
                const response = await userApi.updateProfile(profileData)
                if (response.data) {
                    this.updateUser(response.data)
                }
                return response.data
            } catch (err) {
                console.error('Update profile failed in store:', err)
                throw err
            }
        }
    }
})