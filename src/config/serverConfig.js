/**
 * ════════════════════════════════════════════════════════════════
 * CONFIGURACIÓN DEL SERVIDOR - DEPRECATED
 * ════════════════════════════════════════════════════════════════
 *
 * NOTA: Este archivo se mantiene por compatibilidad con código legacy.
 *
 * NUEVOS DESARROLLOS DEBEN USAR:
 *   import { API_BASE_URL, API_TIMEOUT, config } from 'src/config/env'
 *
 * ════════════════════════════════════════════════════════════════
 */

import { API_BASE_URL, API_TIMEOUT } from 'src/config/env'

export const SERVER_CONFIG = {
  BASE_URL: API_BASE_URL,
  API_VERSION: 'v1',
  TIMEOUT: API_TIMEOUT,
}

// Helper functions para construir URLs
export const getApiUrl = (endpoint) => {
  return `${SERVER_CONFIG.BASE_URL}${endpoint}`
}

export const getAuthUrl = (endpoint) => {
  return `${SERVER_CONFIG.BASE_URL}/auth${endpoint}`
}

export const getCoreUrl = (endpoint) => {
  return `${SERVER_CONFIG.BASE_URL}/core${endpoint}`
}

export const getAdminUrl = (endpoint) => {
  return `${SERVER_CONFIG.BASE_URL}/admin${endpoint}`
}

export default SERVER_CONFIG
