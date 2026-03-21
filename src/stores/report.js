import { defineStore } from 'pinia'
import { reportApi } from '@/api/reportApi'

export const useReportStore = defineStore('report', {
    state: () => ({
        statistics: null,
        detailedReport: null,
        loading: false,
    }),

    actions: {
        async fetchStatistics(projectId) {
            this.loading = true;
            try {
                const res = await reportApi.getProjectStatistics(projectId);
                this.statistics = res.data || res;
                return this.statistics;
            } catch (err) {
                console.error('Error fetching statistics:', err);
                throw err;
            } finally {
                this.loading = false;
            }
        },
        async fetchDetailedReport(projectId, startDate, endDate) {
            this.loading = true;
            try {
                const res = await reportApi.getDetailedReport(projectId, startDate, endDate);
                this.detailedReport = res.data || res;
                return this.detailedReport;
            } catch (err) {
                console.error('Error fetching detailed report:', err);
                throw err;
            } finally {
                this.loading = false;
            }
        },
        async exportReport(projectId, type, format) {
            try {
                let res;
                if (format === 'csv') {
                    res = await reportApi.exportCsv(projectId, type);
                } else {
                    res = await reportApi.exportPdf(projectId, type);
                }
                return res.data || res;
            } catch (err) {
                console.error('Error exporting report:', err);
                throw err;
            }
        },
    }
})
