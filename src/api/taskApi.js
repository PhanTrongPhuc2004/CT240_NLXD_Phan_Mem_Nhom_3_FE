import api from './index'

export const taskApi = {
    getByProject: (projectId) => api.get(`/projects/${projectId}/tasks`),
    getById: (id) => api.get(`/tasks/${id}`),
    create: (data) => api.post('/tasks', data),
    update: (id, data) => api.put(`/tasks/${id}`, data),
    updateStatus: (id, status, reason) => api.patch(`/tasks/${id}/status`, { status, reason }),
    delete: (id) => api.delete(`/tasks/${id}`),
}