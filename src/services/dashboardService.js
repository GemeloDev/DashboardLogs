import { axiosInstance } from './axiosConfig'
import { DASHBOARD, DEVICES } from './endpoints'

const DASHBOARD_TIMEOUT_MS = 60000

function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (value === undefined || value === null) return false
      if (typeof value === 'string' && value.trim() === '') return false
      return true
    }),
  )
}

function unwrapResponse(response) {
  return response?.data?.data || response?.data || {}
}

function buildDateParams({ system, from, to, range } = {}) {
  return cleanParams({ system, from, to, startDate: from, endDate: to, range })
}

export const DashboardService = {
  async getStats({ system, from, to, range, signal } = {}) {
    const params = buildDateParams({ system, from, to, range })
    const response = await axiosInstance.get(DASHBOARD.STATS, {
      params,
      timeout: DASHBOARD_TIMEOUT_MS,
      signal,
    })
    return unwrapResponse(response)
  },

  async getSeries({ system, from, to, range, signal } = {}) {
    const params = buildDateParams({ system, from, to, range })
    const response = await axiosInstance.get(DASHBOARD.SERIES, {
      params,
      timeout: DASHBOARD_TIMEOUT_MS,
      signal,
    })
    return unwrapResponse(response)
  },

  async getHttp({ system, from, to, range, signal } = {}) {
    const params = buildDateParams({ system, from, to, range })
    const response = await axiosInstance.get(DASHBOARD.HTTP, {
      params,
      timeout: DASHBOARD_TIMEOUT_MS,
      signal,
    })
    return unwrapResponse(response)
  },

  async getGeo({ system, from, to, range, signal } = {}) {
    const params = buildDateParams({ system, from, to, range })
    const response = await axiosInstance.get(DASHBOARD.GEO, {
      params,
      timeout: DASHBOARD_TIMEOUT_MS,
      signal,
    })
    return unwrapResponse(response)
  },

  async getDevices({ system, status, page = 0, size = 50, signal } = {}) {
    const params = cleanParams({
      system,
      status,
      page: Math.max(0, Number(page) || 0),
      size: Math.min(100, Math.max(1, Number(size) || 50)),
    })
    const response = await axiosInstance.get(DEVICES.SUMMARY, {
      params,
      timeout: DASHBOARD_TIMEOUT_MS,
      signal,
    })
    return unwrapResponse(response)
  },

  async getAttendanceAnomalies({ system, signal } = {}) {
    const response = await axiosInstance.get('/api/analytics/attendance/anomalies', {
      params: cleanParams({ system }),
      timeout: DASHBOARD_TIMEOUT_MS,
      signal,
    })
    return unwrapResponse(response)
  },
}

export default DashboardService
