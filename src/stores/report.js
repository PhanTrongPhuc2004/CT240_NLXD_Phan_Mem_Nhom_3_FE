import { defineStore } from 'pinia'
import { reportApi } from '@/api/reportApi'

export const useReportStore = defineStore('report', {
    state: () => ({
        statistics: null,
        detailedReport: null,
        loading: false,
    }),

    actions: {
        async fetchStatistics(projectId) { /* TODO: CN_29 */ },
        async fetchDetailedReport(projectId, startDate, endDate) { /* TODO: CN_30 */ },
        async exportReport(projectId, type, format) { /* TODO: CN_31 */ },
    }
})