import { API_BASE_URL } from './apiConfig'

// DTOs y endpoints
export const endpoints = {
  // Logs
  logs: `${API_BASE_URL}/logs/events/all`,
  events: `${API_BASE_URL}/logs/events`,

  // Catálogos
  catalogSummary: `${API_BASE_URL}/dashboard/passports/summary`,
  catalogEvents: `${API_BASE_URL}/dashboard/passports/events`,
  catalogOficinas: `${API_BASE_URL}/dashboard/passports/by-office`,
  catalogDevices: `${API_BASE_URL}/dashboard/passports/events`,
  catalogEstatus: `${API_BASE_URL}/dashboard/passports/by-type`,
  catalogPersons: `${API_BASE_URL}/core/users`,
}
