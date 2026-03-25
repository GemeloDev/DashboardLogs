import { axiosInstance } from 'src/services/axiosConfig'
import { EVA } from './endpoints'

export const EvaService = {
    async getDailyPretty(params) {
        return axiosInstance.get(EVA.DAILY_PRETTY, { params })
    }, 

    async getAlerts(params) {
        return axiosInstance.get(EVA.ALERTS, { params })
    },

    async getMetricsSeries(params) {
        return axiosInstance.get(EVA.METRICS_SERIES, { params })
    },

    async getHourlyInsights(params) {
        return axiosInstance.get(EVA.HOURLY_INSIGHTS, { params })
    },

    async getAlertExplain(id, params) {
        return axiosInstance.get(EVA.alertExplain(id), { params })
    },

    async getTicketDraft(id, params) {
        return axiosInstance.get(EVA.ticketDraft(id), { params })
    },

    async getSystems(params) {
        return axiosInstance.get(EVA.CATALOGS_SYSTEMS, { params })
    }
}