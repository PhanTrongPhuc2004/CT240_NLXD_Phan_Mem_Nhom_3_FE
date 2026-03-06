import api from './index'

export const commentApi = {
    getByTask: (taskId) => api.get(`/tasks/${taskId}/comments`),
    create: (taskId, content) => api.post(`/tasks/${taskId}/comments`, { content }),
    update: (commentId, content) => api.put(`/comments/${commentId}`, { content }),
    delete: (commentId) => api.delete(`/comments/${commentId}`),
}