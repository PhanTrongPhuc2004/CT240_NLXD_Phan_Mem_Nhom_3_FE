import api from './index'

export const notificationApi = {

    getAll: (userId) =>
        api.get('/notifications', { params: { userId } }),

    markAsRead: (id, userId) =>
        api.patch(`/notifications/${id}/read`, null, { params: { userId } }),

    markAllAsRead: (userId) =>
        api.patch('/notifications/read-all', null, { params: { userId } }),
}
