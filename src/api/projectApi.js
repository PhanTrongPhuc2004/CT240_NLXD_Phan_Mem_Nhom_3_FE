import api from './index'

export const projectApi = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),

  // --- Bổ sung các hàm cho CN_15 & CN_16 ---

  // Quản lý Manager (Truyền body: { userId: "..." })
  assignManager: (projectId, data) => api.post(`/projects/${projectId}/managers`, data),
  removeManager: (projectId, userId) => api.delete(`/projects/${projectId}/managers/${userId}`),

  // Quản lý Member
  assignMember: (projectId, data) => api.post(`/projects/${projectId}/members`, data),
  removeMember: (projectId, userId) => api.delete(`/projects/${projectId}/members/${userId}`),

  // Tham gia/Rời dự án
  requestToJoin: (projectId) => api.post(`/projects/${projectId}/join`),
  approveJoin: (projectId, data) => api.post(`/projects/${projectId}/join/approve`, data),
  rejectJoin: (projectId, data) => api.post(`/projects/${projectId}/join/reject`, data),
  leaveProject: (projectId) => api.post(`/projects/${projectId}/leave`),
}
