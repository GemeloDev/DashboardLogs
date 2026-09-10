import { axiosInstance } from './axiosConfig'
import { ANALYTICS } from './endpoints'
import { buildSearchParams } from '../composables/useDiagnostics'

function unwrapResponse(response) {
  return response?.data?.data || response?.data || {}
}

export const AnalyticsService = {
  async getExecutiveSummary(fromDate, toDate, system, requestConfig = {}) {
    const params = buildSearchParams(fromDate, toDate, system)
    const response = await axiosInstance.get(ANALYTICS.EXECUTIVE_SUMMARY, {
      ...requestConfig,
      params,
    })
    return unwrapResponse(response)
  },

  async getTopFrictionalEvents(fromDate, toDate, system, requestConfig = {}) {
    const params = buildSearchParams(fromDate, toDate, system)
    const response = await axiosInstance.get(ANALYTICS.TOP_FRICTIONAL_EVENTS, {
      ...requestConfig,
      params,
    })
    return unwrapResponse(response)
  },

  async explainError(payload) {
    const response = await axiosInstance.post(ANALYTICS.EXPLAIN_ERROR, payload)
    return unwrapResponse(response)
  },
}

export default AnalyticsService
