// src/api/userApi.js - ĐÃ ĐẢM BẢO export getCurrentUser
import api from './index'

export const login = (credentials) => api.post('/auth/login', credentials)

export const getCurrentUser = () => api.get('/auth/me')

export const getProfile = () => api.get('/users/me')

export const updateProfile = (data) => api.put('/users/me', data)

export const getAllUsers = () => api.get('/users')

export const createUser = (data) => api.post('/users', data)

export const updateUser = (id, data) => api.put(`/users/${id}`, data)

export const deleteUser = (id) => api.delete(`/users/${id}`)

export const updateRole = (id, role) => api.patch(`/users/${id}/role`, { role })

// Export object nếu cần
export const userApi = {
  login,
  getCurrentUser,
  getProfile,
  updateProfile,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  updateRole
}