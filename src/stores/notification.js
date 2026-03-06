import { defineStore } from 'pinia'
import { notificationApi } from '@/api/notificationApi'

export const useNotificationStore = defineStore('notification', {
    state: () => ({
        notifications: [],
        unreadCount: 0,
    }),

    actions: {
        async fetchAll() { /* TODO: CN_27 */ },
        async markAsRead(id) { /* TODO: CN_28 */ },
        async markAllAsRead() { /* TODO: CN_28 */ },
    }
})