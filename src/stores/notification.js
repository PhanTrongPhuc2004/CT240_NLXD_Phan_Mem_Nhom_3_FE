import { defineStore } from 'pinia'
import { notificationApi } from '@/api/notificationApi'

export const useNotificationStore = defineStore('notification', {
    state: () => ({
        notifications: [],
        unreadCount: 0,
    }),

    actions: {
        async fetchAll(userId) {

            const res = await notificationApi.getAll(userId)

            this.notifications = res.data

            this.unreadCount =
                this.notifications.filter(n => !n.read).length
        },

        async markAsRead(id, userId) {

            await notificationApi.markAsRead(id, userId)

            const n = this.notifications.find(n => n.id === id)

            if (n) {
                n.read = true
            }

            this.unreadCount--
        },

        async markAllAsRead(userId) {

            await notificationApi.markAllAsRead(userId)

            this.notifications.forEach(n => n.read = true)

            this.unreadCount = 0
        }
    }
})
