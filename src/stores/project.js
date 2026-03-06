import { defineStore } from 'pinia'
import { projectApi } from '@/api/projectApi'

export const useProjectStore = defineStore('project', {
  state: () => ({
    projects: [],
    currentProject: null,
    loading: false,
  }),

  actions: {
    async fetchAll() { /* TODO: CN_14 */ },
    async create(data) { /* TODO: CN_11 */ },
    async getDetail(id) { /* TODO: CN_14 */ },
    async update(id, data) { /* TODO: CN_12 */ },
    async delete(id) { /* TODO: CN_13 */ },
  }
})