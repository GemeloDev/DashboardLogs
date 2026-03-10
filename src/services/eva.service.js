import { axiosInstance } from 'src/services/axiosConfig'

export const EvaService = {
    async getDailyPretty(params) {
        return axiosInstance.get('/api/ai/llm/assist/manager/daily/pretty', { params })
    }, 

    async getAlerts(params) {
        return axiosInstance.get('/api/ai/alerts', { params })
    },

    async getMetricsSeries(params) {
        return axiosInstance.get('/api/ai/metrics/series', { params })
    },

    async getHourlyInsights(params) {
        return axiosInstance.get('/api/ai/summaries/hourly/insights', { params })
    },

    async getAlertExplain(id, params) {
        return axiosInstance.get(`/api/ai/alerts/${id}/explain/operator`, { params })
    },

    async getTicketDraft(id, params) {
        return axiosInstance.get(`/api/ai/alerts/${id}/ticket/draft`, { params })
    }
}