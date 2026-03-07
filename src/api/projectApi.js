// D:\Documents\Study\CT240\Project\FrontEnd\src\api\projectApi.js
import api from './index'

export const projectApi = {
  // --- API CHO NGƯỜI DÙNG CÁ NHÂN ---
  getAll: () => api.get('/projects'), // Lấy các dự án của người dùng hiện tại
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),

  // --- API CHO ADMIN/MANAGER ---
  getAllSystem: () => api.get('/projects/all-system'), // <-- DÒNG MỚI ĐƯỢC THÊM

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
