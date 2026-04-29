/**
 * ════════════════════════════════════════════════════════════════
 * CONFIGURACIÓN DE API - DEPRECATED
 * ════════════════════════════════════════════════════════════════
 *
 * NOTA: Este archivo se mantiene por compatibilidad con código legacy.
 *
 * NUEVOS DESARROLLOS DEBEN USAR:
 *   import { API_BASE_URL, API_TIMEOUT } from 'src/config/env'
 *
 * ════════════════════════════════════════════════════════════════
 */

import { API_BASE_URL, API_TIMEOUT } from 'src/config/env'

// Re-exportar para compatibilidad con código legacy
export { API_BASE_URL, API_TIMEOUT }

// Configuración global de axios
export const API_CONFIG = {
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
}

/**
 * Helper: construir configuración de petición para axios
 */
export function buildApiConfig({ token = null, withCredentials = false } = {}) {
  const headers = { ...API_CONFIG.headers }
  if (token) headers.Authorization = `Bearer ${token}`

  return {
    ...API_CONFIG,
    headers,
    withCredentials,
  }
}
// ser devueltos por el servidor en la respuesta. El cliente solo debe
// enviar los headers de petición (Content-Type, Authorization, etc.) y, si
// es necesario, activar withCredentials para cookies.
