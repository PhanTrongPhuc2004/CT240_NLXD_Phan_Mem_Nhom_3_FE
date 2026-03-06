import { defineStore } from 'pinia'
import { taskApi } from '@/api/taskApi'

export const useTaskStore = defineStore('task', {
    state: () => ({
        tasks: [],
        currentTask: null,
        loading: false,
    }),

    actions: {
        async fetchByProject(projectId) { /* TODO: CN_21 */ },
        async create(data) { /* TODO: CN_17 */ },
        async updateStatus(id, status, reason) { /* TODO: CN_20 */ },
        async getDetail(id) { /* TODO: CN_22 */ },
        async delete(id) { /* TODO: CN_19 */ },
    }
})