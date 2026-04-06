import { axiosInstance } from './axiosConfig'
import { DASHBOARD } from './endpoints'

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
  async getStats({ system, from, to } = {}) {
    const params = cleanParams({ system, from, to })
    const response = await axiosInstance.get(DASHBOARD.STATS, { params })
    return unwrapResponse(response)
  },

  async getSeries({ system } = {}) {
    const params = cleanParams({ system })
    const response = await axiosInstance.get(DASHBOARD.SERIES, { params })
    return unwrapResponse(response)
  },

  async getHttp({ system } = {}) {
    const params = cleanParams({ system })
    const response = await axiosInstance.get(DASHBOARD.HTTP, { params })
    return unwrapResponse(response)
  },

  async getGeo({ system } = {}) {
    const params = cleanParams({ system })
    const response = await axiosInstance.get(DASHBOARD.GEO, { params })
    return unwrapResponse(response)
  },
}

export default DashboardService
