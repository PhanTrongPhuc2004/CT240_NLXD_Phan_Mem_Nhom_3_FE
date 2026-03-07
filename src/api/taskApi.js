import api from './index'

export const taskApi = {
    getAll: () => api.get('/tasks'),
    getByProject: (projectId) => api.get('/tasks', { params: { projectId } }),
    getById: (id) => api.get(`/tasks/${id}`),
    create: (data) => api.post('/tasks', data),
    update: (id, data) => api.put(`/tasks/${id}`, data),
    // Backend dùng @RequestParam cho status và cancelReason, body để trống (null)
    updateStatus: (id, status, cancelReason) => api.patch(`/tasks/${id}/status`, null, { params: { status, cancelReason } }),
    assign: (id, assigneeId) => api.patch(`/tasks/${id}/assign`, { assigneeId }),
    delete: (id) => api.delete(`/tasks/${id}`),
}