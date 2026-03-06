import { defineStore } from 'pinia'
import { userApi } from '@/api/userApi'

export const useUserStore = defineStore('user', {
    state: () => ({
        currentUser: null,
        users: [],
        loading: false,
    }),

    actions: {
        async fetchProfile() { /* TODO: CN_05 */ },
        async updateProfile(data) { /* TODO: CN_04 */ },
        async fetchAllUsers() { /* TODO: CN_06 (Admin) */ },
        async updateUserRole(id, role) { /* TODO: CN_10 */ },
    }
})