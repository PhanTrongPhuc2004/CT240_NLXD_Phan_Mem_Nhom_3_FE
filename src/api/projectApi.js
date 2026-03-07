// src/api/projectApi.js - ĐÃ SỬA HOÀN CHỈNH: endpoint tạo dự án là /projects (POST), không phải /projects/create
import api from './index'

export const projectApi = {
  // Lấy danh sách dự án của user hiện tại
  getAll: () => api.get('/projects'),

  // Lấy chi tiết dự án theo ID
  getById: (id) => api.get(`/projects/${id}`),

  // TẠO DỰ ÁN MỚI - ĐÚNG ENDPOINT: POST /api/projects
  create: (data) => api.post('/projects', data),

  // Cập nhật dự án
  update: (id, data) => api.put(`/projects/${id}`, data),

  // Xóa dự án
  delete: (id) => api.delete(`/projects/${id}`),

  // Lấy TẤT CẢ dự án hệ thống (dành cho Admin/Manager)
  getAllSystem: () => api.get('/projects/all-system'),

  // Quản lý Manager
  assignManager: (projectId, data) => api.post(`/projects/${projectId}/managers`, data),
  removeManager: (projectId, userId) => api.delete(`/projects/${projectId}/managers/${userId}`),

  // Quản lý Member
  assignMember: (projectId, data) => api.post(`/projects/${projectId}/members`, data),
  removeMember: (projectId, userId) => api.delete(`/projects/${projectId}/members/${userId}`),

  // Tham gia / Rời dự án
  requestToJoin: (projectId) => api.post(`/projects/${projectId}/join`),
  approveJoin: (projectId, data) => api.post(`/projects/${projectId}/join/approve`, data),
  rejectJoin: (projectId, data) => api.post(`/projects/${projectId}/join/reject`, data),
  leaveProject: (projectId) => api.post(`/projects/${projectId}/leave`),
}