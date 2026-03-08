// src/api/userApi.js - ĐÃ THÊM HÀM register để FE gọi được
import api from './index'

export const login = (credentials) => api.post('/auth/login', credentials)

export const register = (data) => api.post('/auth/register', data)  // THÊM DÒNG NÀY

export const getCurrentUser = () => api.get('/auth/me')

export const getProfile = () => api.get('/users/me')

export const updateProfile = (data) => api.put('/users/me', data)

export const getAllUsers = () => api.get('/users')

export const searchUsers = (keyword) => api.get('/users/search', { params: { keyword } })

export const createUser = (data) => api.post('/users', data)

export const updateUser = (id, data) => api.put(`/users/${id}`, data)

export const deleteUser = (id) => api.delete(`/users/${id}`)

export const updateRole = (id, role) => api.patch(`/users/${id}/role`, { role })

export const userApi = {
    login,
    register,
    getCurrentUser,
    getProfile,
    updateProfile,
    getAll: getAllUsers,
    search: searchUsers,
    createUser,
    updateUser,
    deleteUser,
    updateRole
}