import { defineStore } from 'pinia'
import { notificationApi } from '@/api/notificationApi'

export const useNotificationStore = defineStore('notification', {
    state: () => ({
        notifications: [],
    }),
    getters: {
        unreadCount: (state) => state.notifications.filter(n => !n.read).length
    },
    actions: {
        async fetchAll(userId) {
            try {
                const res = await notificationApi.getAll(userId);
                this.notifications = res.data;
            } catch (error) {
                console.error("Lỗi fetch thông báo:", error);
            }
        },
        async markAsRead(id, userId) {
            await notificationApi.markAsRead(id, userId);
            const n = this.notifications.find(n => n.id === id);
            if (n) n.read = true;
        },
        async markAllAsRead(userId) {
            await notificationApi.markAllAsRead(userId);
            this.notifications.forEach(n => n.read = true);
        }
    }
})
