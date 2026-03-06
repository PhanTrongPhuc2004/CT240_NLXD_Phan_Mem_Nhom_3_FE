import api from './index'

export const reportApi = {
    // CN_29: Xem thống kê dự án
    getProjectStatistics: (projectId) => api.get(`/reports/projects/${projectId}/statistics`),

    // CN_30: Xem báo cáo chi tiết
    getDetailedReport: (projectId, startDate, endDate) =>
        api.get(`/reports/projects/${projectId}/detail`, { params: { startDate, endDate } }),

    // CN_31: Xuất báo cáo CSV
    exportCsv: (projectId, type) =>
        api.get(`/reports/projects/${projectId}/export/csv`, {
            params: { type },
            responseType: 'blob'
        }),

    // CN_31: Xuất báo cáo PDF
    exportPdf: (projectId, type) =>
        api.get(`/reports/projects/${projectId}/export/pdf`, {
            params: { type },
            responseType: 'blob'
        })
}