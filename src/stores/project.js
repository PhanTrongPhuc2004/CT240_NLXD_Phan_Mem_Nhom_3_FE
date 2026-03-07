import { defineStore } from 'pinia'
import { projectApi } from '@/api/projectApi'
import { useAuthStore } from './auth' // Để lấy ID người dùng hiện tại

export const useProjectStore = defineStore('project', {
  state: () => ({
    projects: [],
    currentProject: null,
    loading: false,
    error: null,
  }),

  getters: {
    // Tự động kiểm tra quyền để FE dùng (Ví dụ: v-if="projectStore.isOwner")
    isOwner: (state) => {
      const auth = useAuthStore()
      return state.currentProject?.ownerId === auth.user?.id
    },
    isManager: (state) => {
      const auth = useAuthStore()
      return (
        state.currentProject?.managerIds?.includes(auth.user?.id) ||
        state.currentProject?.ownerId === auth.user?.id
      )
    },
    isMember: (state) => {
      const auth = useAuthStore()
      return state.currentProject?.memberIds?.includes(auth.user?.id)
    },
  },

  actions: {
    async fetchAll() {
      this.loading = true
      try {
        const res = await projectApi.getAll()
        this.projects = res.data
      } catch (err) {
        this.error = 'Không thể tải danh sách dự án'
      } finally {
        this.loading = false
      }
    },

    async getDetail(id) {
      this.loading = true
      try {
        const res = await projectApi.getById(id)
        this.currentProject = res.data
      } catch (err) {
        this.error = 'Không tìm thấy dự án'
      } finally {
        this.loading = false
      }
    },

    async create(data) {
      // --- ĐÂY LÀ PHẦN ĐÃ SỬA ---
      // Tạo một đối tượng payload mới chỉ chứa các trường mà backend cần
      const payload = {
        name: data.name,
        description: data.description,
      }

      // Gọi API với payload đã được lọc, thay vì gửi toàn bộ `data`
      const res = await projectApi.create(payload)
      // -------------------------

      this.projects.push(res.data)
      return res.data
    },

    async update(id, data) {
      const res = await projectApi.update(id, data)
      // Cập nhật lại trong danh sách local
      const index = this.projects.findIndex((p) => p.id === id)
      if (index !== -1) this.projects[index] = res.data
      this.currentProject = res.data
    },

    async delete(id) {
      await projectApi.delete(id)
      this.projects = this.projects.filter((p) => p.id !== id)
      if (this.currentProject?.id === id) this.currentProject = null
    },

    // --- Bổ sung cho CN_15 & CN_16 ---
    async joinProject(id) {
      await projectApi.requestToJoin(id)
      await this.getDetail(id) // Load lại để cập nhật danh sách chờ
    },

    async leaveProject(id) {
      await projectApi.leaveProject(id)
      await this.getDetail(id) // Load lại để cập nhật member list
    },
  },
})
