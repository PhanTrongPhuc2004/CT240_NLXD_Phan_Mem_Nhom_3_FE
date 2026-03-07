import { defineStore } from 'pinia'
import { userApi } from '@/api/userApi'

export const useUserStore = defineStore('user', {
    state: () => ({
        users: [],
        loading: false,
        error: null,
    }),
    actions: {
        async fetchAll() {
            if (this.users.length > 0) return // Tối ưu: không fetch lại nếu đã có dữ liệu

            this.loading = true
            this.error = null
            try {
                const res = await userApi.getAll()
                // Tạo trường 'fullName' để v-autocomplete có thể hiển thị
                this.users = res.data.map(user => ({
                    ...user,
                    fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username
                }))
            } catch (err) {
                this.error = 'Không thể tải danh sách người dùng'
                // Log chi tiết lỗi từ Backend để debug (thường chứa message StackOverflow hoặc NullPointer)                console.error('Lỗi Backend khi tải Users:', err.response?.data || err.message)
            } finally {
                this.loading = false
            }
        },
    },
})