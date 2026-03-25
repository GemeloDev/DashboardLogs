/**
 * Configuración de endpoints de API
 * Centraliza todas las URLs de los servicios backend
 */
import { API_BASE_URL } from "./apiConfig"

// Base URL del servidor
const BASE_URL = API_BASE_URL
// const SOCKET_IP = '192.168.100.30'

// Endpoints de autenticación
export const AUTH_ENDPOINTS = {
  REGISTER: `${BASE_URL}/api/auth/register`,
  LOGIN: `${BASE_URL}/auth/login`,
  LOGOUT: `${BASE_URL}/auth/logout`,
  VERIFY_TOKEN: `${BASE_URL}/api/auth/verify`,
  REFRESH_TOKEN: `${BASE_URL}/api/auth/refresh`,
  LOGIN_QR: `${BASE_URL}/api/auth/qr-login`,
  RESET_PASSWORD: `${BASE_URL}/auth/change-password`
}

// Endpoints principales (para uso futuro)
export const API_ENDPOINTS = {
  //  Dashboard
  EVENTS: `${BASE_URL}/api/dashboard/passports/events`,
  SUMMARY: `${BASE_URL}/api/dashboard/passports/summary`,
  LOGS_STATS: `${BASE_URL}/logs/dashboard/stats`,

  // Estadísticas
  STATS: `${BASE_URL}/api/stats`,
  CHARTS: `${BASE_URL}/api/charts`,

  // Diagnósticos
  SESSION_ID: `${BASE_URL}/logs/timeline`,

  // Configuración
  CONFIG: `${BASE_URL}/api/config`,

  //  QR
  QR: `${BASE_URL}/api/auth/qr-token`,
}

export const API_SANTORO_DASHBOARD = {
  STATS: `${BASE_URL}/santoro/panel/stats`,
  EMPRESAS: `${BASE_URL}/santoro/panel/organizations`,
  USUARIOS: `${BASE_URL}/santoro/panel/users`,
  APIKEYS: `${BASE_URL}/santoro/panel/api-keys`,
  API_STATUS: `${BASE_URL}/santoro/panel/organizations`
}

export const API_KEYS = {
  MAIN: '/catalogs/api-keys'
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

export default {
  AUTH_ENDPOINTS,
  API_ENDPOINTS,
  DEFAULT_CONFIG,
  BASE_URL
}
