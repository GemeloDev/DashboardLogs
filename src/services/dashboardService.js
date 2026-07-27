import { axiosInstance } from './axiosConfig'
import { DASHBOARD, DEVICES } from './endpoints'

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

export const DashboardService = {
  async getStats({ system, from, to, signal } = {}) {
    const params = cleanParams({ system, from, to })
    const response = await axiosInstance.get(DASHBOARD.STATS, { params, signal, timeout: 120000 })
    return unwrapResponse(response)
  },

  async getSeries({ system, from, to, signal } = {}) {
    const params = cleanParams({ system, from, to })
    const response = await axiosInstance.get(DASHBOARD.SERIES, { params, signal, timeout: 120000 })
    return unwrapResponse(response)
  },

  async getHttp({ system, from, to, signal } = {}) {
    const params = cleanParams({ system, from, to })
    const response = await axiosInstance.get(DASHBOARD.HTTP, { params, signal, timeout: 120000 })
    return unwrapResponse(response)
  },

  async getGeo({ system, from, to, signal } = {}) {
    const params = cleanParams({ system, from, to })
    const response = await axiosInstance.get(DASHBOARD.GEO, { params, signal, timeout: 120000 })
    return unwrapResponse(response)
  },

  async getDevices({ system, status, signal } = {}) {
    const params = cleanParams({ system, status })
    const response = await axiosInstance.get(DEVICES.SUMMARY, { params, signal, timeout: 120000 })
    return unwrapResponse(response)
  },
}

export default DashboardService
