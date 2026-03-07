import { defineStore } from 'pinia'
import { taskApi } from '@/api/taskApi'

export const useTaskStore = defineStore('task', {
    state: () => ({
        tasks: [],
        currentTask: null,
        loading: false,
    }),

    actions: {
        async fetchAll() {
            this.loading = true
            try {
                const res = await taskApi.getAll()
                this.tasks = res.data
            } catch (error) {
                console.error('Lỗi khi tải danh sách công việc:', error)
            } finally {
                this.loading = false
            }
        },
        async fetchByProject(projectId) {
            this.loading = true
            try {
                const res = await taskApi.getByProject(projectId)
                this.tasks = res.data
            } catch (error) {
                console.error('Lỗi khi tải công việc dự án:', error)
            } finally {
                this.loading = false
            }
        },
        async create(data) {
            const res = await taskApi.create(data)
            this.tasks.push(res.data)
            return res.data
        },
        async update(id, data) {
            const res = await taskApi.update(id, data)
            const index = this.tasks.findIndex((t) => t.id === id)
            if (index !== -1) this.tasks[index] = res.data
            if (this.currentTask?.id === id) this.currentTask = res.data
            return res.data
        },
        async updateStatus(id, status, cancelReason) {
            const res = await taskApi.updateStatus(id, status, cancelReason)
            const index = this.tasks.findIndex((t) => t.id === id)
            if (index !== -1) this.tasks[index] = res.data
            if (this.currentTask?.id === id) this.currentTask = res.data
            return res.data
        },
        async assign(id, assigneeId) {
            const res = await taskApi.assign(id, assigneeId)
            const index = this.tasks.findIndex((t) => t.id === id)
            if (index !== -1) this.tasks[index] = res.data
            return res.data
        },
        async getDetail(id) {
            this.loading = true
            try {
                const res = await taskApi.getById(id)
                this.currentTask = res.data
                return res.data
            } finally {
                this.loading = false
            }
        },
        async delete(id) {
            await taskApi.delete(id)
            this.tasks = this.tasks.filter((t) => t.id !== id)
            if (this.currentTask?.id === id) this.currentTask = null
        },
    }
})