/**
 * Configuración de endpoints de API
 * Centraliza todas las URLs de los servicios backend
 */

// Base URL del servidor
const BASE_URL = 'http://187.188.66.56:8040'
// const SOCKET_IP = '192.168.100.30'

// Endpoints de autenticación
export const AUTH_ENDPOINTS = {
  REGISTER: `${BASE_URL}/api/auth/register`,
  LOGIN: `${BASE_URL}/api/auth/login`,
  LOGOUT: `${BASE_URL}/api/auth/logout`,
  VERIFY_TOKEN: `${BASE_URL}/api/auth/verify`,
  REFRESH_TOKEN: `${BASE_URL}/api/auth/refresh`,
  LOGIN_QR: `/api/auth/qr-login`
}

// Endpoints principales (para uso futuro)
export const API_ENDPOINTS = {
  // Logs
  LOGS: `${BASE_URL}/api/logs`,
  LOGS_FILTERS: `${BASE_URL}/api/logs#s`,
  LOGS_EXPORT: `${BASE_URL}/api/logs/export`,

  // Estadísticas
  STATS: `${BASE_URL}/api/stats`,
  CHARTS: `${BASE_URL}/api/charts`,

  // Diagnósticos
  DIAGNOSTICS: `${BASE_URL}/api/diagnostics`,

  // Configuración
  CONFIG: `${BASE_URL}/api/config`,

  //  QR
  QR: `/api/auth/qr-token`,
}

//  URL (local) del server socket
export const SOCKET = {
  // LOGIN_QR : `https://${SOCKET_IP}:3000`
  URL : `187.188.66.56:8040/ws`,
  TOPIC : `/topic/qr-login`
}

// Configuración por defecto para las peticiones
export const DEFAULT_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000 // 30 segundos
}

// Función helper para construir headers con autenticación
export const getAuthHeaders = (token = null) => {
  const headers = { ...DEFAULT_CONFIG.headers }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

export default {
  AUTH_ENDPOINTS,
  API_ENDPOINTS,
  DEFAULT_CONFIG,
  getAuthHeaders,
  BASE_URL
}
